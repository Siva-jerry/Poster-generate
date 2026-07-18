const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const supabase = require("../config/supabase");

const {
  createAssetFileName,
  createAssetStoragePath,
} = require("../utils/imageUtils");

const assetsBucket =
  process.env.SUPABASE_ASSETS_BUCKET ||
  "smartwish-assets";

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const DEFAULT_LOCAL_OUTPUT_WIDTH = 1800;
const DEFAULT_LOCAL_OUTPUT_HEIGHT = 2200;

const DEFAULT_REMOVE_TIMEOUT_MS = 120000;

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);

/*
|--------------------------------------------------------------------------
| General helpers
|--------------------------------------------------------------------------
*/

function toSafeString(value, fallback = "") {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value).trim();
  }

  return fallback;
}

function toSafeInteger(
  value,
  fallback,
  minimum,
  maximum
) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.min(
    Math.max(
      Math.round(parsedValue),
      minimum
    ),
    maximum
  );
}

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function fileExists(filePath) {
  const safePath = toSafeString(filePath);

  if (!safePath) {
    return false;
  }

  try {
    const statistics =
      await fs.promises.stat(safePath);

    return statistics.isFile();
  } catch {
    return false;
  }
}

async function ensureDirectory(directoryPath) {
  const safeDirectory =
    path.resolve(directoryPath);

  await fs.promises.mkdir(
    safeDirectory,
    {
      recursive: true,
    }
  );

  return safeDirectory;
}

async function deleteFileWithRetry(
  filePath,
  maximumAttempts = 4
) {
  const safePath = toSafeString(filePath);

  if (!safePath) {
    return false;
  }

  for (
    let attempt = 1;
    attempt <= maximumAttempts;
    attempt += 1
  ) {
    try {
      await fs.promises.unlink(safePath);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        return false;
      }

      const retryable =
        error.code === "EBUSY" ||
        error.code === "EPERM";

      if (
        !retryable ||
        attempt === maximumAttempts
      ) {
        return false;
      }

      await delay(attempt * 250);
    }
  }

  return false;
}

function validateImageExtension(filePath) {
  const extension = path
    .extname(toSafeString(filePath))
    .toLowerCase();

  if (
    !ALLOWED_IMAGE_EXTENSIONS.has(
      extension
    )
  ) {
    const error = new Error(
      "Unsupported image format. Use JPG, JPEG, PNG, WEBP or AVIF."
    );

    error.statusCode = 400;
    throw error;
  }

  return true;
}

async function validateLocalImage(
  filePath,
  label = "Image"
) {
  const safePath = toSafeString(filePath);

  if (!safePath) {
    const error = new Error(
      `${label} path is required.`
    );

    error.statusCode = 400;
    throw error;
  }

  if (!(await fileExists(safePath))) {
    const error = new Error(
      `${label} could not be found.`
    );

    error.statusCode = 404;
    throw error;
  }

  validateImageExtension(safePath);

  try {
    const metadata =
      await sharp(safePath, {
        failOn: "error",
      }).metadata();

    if (
      !metadata.width ||
      !metadata.height
    ) {
      throw new Error(
        "Image dimensions are unavailable."
      );
    }

    return {
      filePath: safePath,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      hasAlpha: Boolean(
        metadata.hasAlpha
      ),
    };
  } catch (error) {
    const validationError =
      new Error(
        `${label} is not a valid image file: ${error.message}`
      );

    validationError.statusCode = 400;
    validationError.cause = error;

    throw validationError;
  }
}

/*
|--------------------------------------------------------------------------
| Load IMG.LY background remover
|--------------------------------------------------------------------------
*/

let cachedRemoveBackgroundFunction = null;

async function loadBackgroundRemovalFunction() {
  if (
    typeof cachedRemoveBackgroundFunction ===
    "function"
  ) {
    return cachedRemoveBackgroundFunction;
  }

  let module;

  try {
    module = await import(
      "@imgly/background-removal-node"
    );
  } catch (error) {
    const loadError = new Error(
      `Unable to load @imgly/background-removal-node: ${error.message}`
    );

    loadError.statusCode = 500;
    loadError.cause = error;

    throw loadError;
  }

  const removeBackgroundFunction =
    module.removeBackground ||
    module.default?.removeBackground ||
    module.default;

  if (
    typeof removeBackgroundFunction !==
    "function"
  ) {
    throw new Error(
      "Background-removal function could not be loaded."
    );
  }

  cachedRemoveBackgroundFunction =
    removeBackgroundFunction;

  return cachedRemoveBackgroundFunction;
}

/*
|--------------------------------------------------------------------------
| Convert removal result to Buffer
|--------------------------------------------------------------------------
*/

async function convertResultToBuffer(result) {
  if (!result) {
    throw new Error(
      "Background removal returned no image."
    );
  }

  if (Buffer.isBuffer(result)) {
    return result;
  }

  if (result instanceof Uint8Array) {
    return Buffer.from(result);
  }

  if (
    typeof result.arrayBuffer ===
    "function"
  ) {
    const arrayBuffer =
      await result.arrayBuffer();

    return Buffer.from(arrayBuffer);
  }

  if (
    result.data &&
    Buffer.isBuffer(result.data)
  ) {
    return result.data;
  }

  if (
    result.buffer &&
    Buffer.isBuffer(result.buffer)
  ) {
    return result.buffer;
  }

  throw new Error(
    "Unsupported background-removal response format."
  );
}

/*
|--------------------------------------------------------------------------
| Timeout helper
|--------------------------------------------------------------------------
*/

async function runWithTimeout(
  promise,
  timeoutMs,
  message
) {
  let timeoutHandle;

  const timeoutPromise =
    new Promise((resolve, reject) => {
      timeoutHandle = setTimeout(() => {
        const timeoutError =
          new Error(message);

        timeoutError.code =
          "BACKGROUND_REMOVAL_TIMEOUT";

        timeoutError.statusCode = 504;

        reject(timeoutError);
      }, timeoutMs);
    });

  try {
    return await Promise.race([
      promise,
      timeoutPromise,
    ]);
  } finally {
    clearTimeout(timeoutHandle);
  }
}

/*
|--------------------------------------------------------------------------
| Run IMG.LY background removal
|--------------------------------------------------------------------------
*/

async function runBackgroundRemoval({
  input,
  timeoutMs =
    DEFAULT_REMOVE_TIMEOUT_MS,
}) {
  const removeBackgroundFunction =
    await loadBackgroundRemovalFunction();

  const safeTimeoutMs =
    toSafeInteger(
      timeoutMs,
      DEFAULT_REMOVE_TIMEOUT_MS,
      10000,
      10 * 60 * 1000
    );

  let result;

  try {
    result = await runWithTimeout(
      removeBackgroundFunction(input, {
        output: {
          format: "image/png",
          quality: 1,
        },
      }),
      safeTimeoutMs,
      `Background removal exceeded ${Math.round(
        safeTimeoutMs / 1000
      )} seconds.`
    );
  } catch (error) {
    const removalError = new Error(
      `Background removal failed: ${error.message}`
    );

    removalError.statusCode =
      error.statusCode ||
      error.status ||
      500;

    removalError.code =
      error.code ||
      "BACKGROUND_REMOVAL_FAILED";

    removalError.cause = error;

    throw removalError;
  }

  return convertResultToBuffer(result);
}

/*
|--------------------------------------------------------------------------
| Normalize transparent PNG
|--------------------------------------------------------------------------
*/

async function normalizeTransparentImage({
  imageBuffer,
  maximumWidth =
    DEFAULT_LOCAL_OUTPUT_WIDTH,
  maximumHeight =
    DEFAULT_LOCAL_OUTPUT_HEIGHT,
}) {
  const safeWidth = toSafeInteger(
    maximumWidth,
    DEFAULT_LOCAL_OUTPUT_WIDTH,
    256,
    4096
  );

  const safeHeight = toSafeInteger(
    maximumHeight,
    DEFAULT_LOCAL_OUTPUT_HEIGHT,
    256,
    4096
  );

  const {
    data: finalBuffer,
    info,
  } = await sharp(imageBuffer, {
    failOn: "error",
  })
    .rotate()
    .ensureAlpha()
    .resize({
      width: safeWidth,
      height: safeHeight,
      fit: "inside",
      withoutEnlargement: true,
    })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      palette: false,
    })
    .toBuffer({
      resolveWithObject: true,
    });

  return {
    buffer: finalBuffer,
    width: info.width,
    height: info.height,
    sizeBytes: finalBuffer.length,
    mimeType: "image/png",
  };
}

/*
|--------------------------------------------------------------------------
| Local file background removal
|--------------------------------------------------------------------------
|
| Used by posterCompositionService.js.
|
| Accepted argument names:
|
| inputPath
| imagePath
| photoPath
| sourcePath
|
| Output argument names:
|
| outputPath
| destinationPath
|
*/

async function removeImageBackground(
  options = {}
) {
  let normalizedOptions = options;

  /*
   * Supports:
   * removeImageBackground(inputPath, outputPath)
   */

  if (typeof options === "string") {
    normalizedOptions = {
      inputPath: options,
      outputPath: arguments[1],
    };
  }

  const inputPath = toSafeString(
    normalizedOptions.inputPath ||
      normalizedOptions.imagePath ||
      normalizedOptions.photoPath ||
      normalizedOptions.sourcePath
  );

  let outputPath = toSafeString(
    normalizedOptions.outputPath ||
      normalizedOptions.destinationPath
  );

  const timeoutMs =
    normalizedOptions.timeoutMs ||
    DEFAULT_REMOVE_TIMEOUT_MS;

  await validateLocalImage(
    inputPath,
    "Student photo"
  );

  if (!outputPath) {
    outputPath = path.join(
      path.dirname(inputPath),
      `${path.basename(
        inputPath,
        path.extname(inputPath)
      )}-transparent-${Date.now()}.png`
    );
  }

  outputPath = path.resolve(outputPath);

  await ensureDirectory(
    path.dirname(outputPath)
  );

  let transparentImageBuffer;

  try {
    const sourceBuffer =
      await fs.promises.readFile(
        inputPath
      );

    transparentImageBuffer =
      await runBackgroundRemoval({
        input: sourceBuffer,
        timeoutMs,
      });

    const normalizedImage =
      await normalizeTransparentImage({
        imageBuffer:
          transparentImageBuffer,

        maximumWidth:
          normalizedOptions.maximumWidth ||
          DEFAULT_LOCAL_OUTPUT_WIDTH,

        maximumHeight:
          normalizedOptions.maximumHeight ||
          DEFAULT_LOCAL_OUTPUT_HEIGHT,
      });

    await fs.promises.writeFile(
      outputPath,
      normalizedImage.buffer
    );

    if (!(await fileExists(outputPath))) {
      throw new Error(
        "Transparent output file was not created."
      );
    }

    return {
      success: true,

      filePath: outputPath,
      outputPath,
      path: outputPath,

      inputPath,

      mimeType:
        normalizedImage.mimeType,

      width:
        normalizedImage.width,

      height:
        normalizedImage.height,

      sizeBytes:
        normalizedImage.sizeBytes,

      backgroundRemoved: true,
    };
  } catch (error) {
    await deleteFileWithRetry(
      outputPath
    );

    const localError = new Error(
      `Unable to remove local image background: ${error.message}`
    );

    localError.statusCode =
      error.statusCode ||
      error.status ||
      500;

    localError.code =
      error.code ||
      "LOCAL_BACKGROUND_REMOVAL_FAILED";

    localError.cause = error;

    throw localError;
  }
}

/*
|--------------------------------------------------------------------------
| Compatible aliases
|--------------------------------------------------------------------------
*/

async function removeBackground(
  options,
  outputPath
) {
  if (typeof options === "string") {
    return removeImageBackground({
      inputPath: options,
      outputPath,
    });
  }

  return removeImageBackground(options);
}

async function removeBackgroundFromImage(
  options,
  outputPath
) {
  if (typeof options === "string") {
    return removeImageBackground({
      inputPath: options,
      outputPath,
    });
  }

  return removeImageBackground(options);
}

/*
|--------------------------------------------------------------------------
| Download source asset from Supabase
|--------------------------------------------------------------------------
*/

async function downloadSourceAsset({
  assetId,
  ownerKey,
}) {
  if (!assetId) {
    const error = new Error(
      "assetId is required."
    );

    error.statusCode = 400;
    throw error;
  }

  if (!ownerKey?.trim()) {
    const error = new Error(
      "ownerKey is required."
    );

    error.statusCode = 400;
    throw error;
  }

  const {
    data: sourceAsset,
    error: assetError,
  } = await supabase
    .from("assets")
    .select("*")
    .eq("id", assetId)
    .eq("owner_key", ownerKey.trim())
    .maybeSingle();

  if (assetError) {
    throw new Error(
      `Unable to load source asset: ${assetError.message}`
    );
  }

  if (!sourceAsset) {
    return null;
  }

  if (
    ![
      "student-photo",
      "editor-upload",
      "removed-background",
    ].includes(sourceAsset.asset_type)
  ) {
    const error = new Error(
      "This asset type cannot be used for background removal."
    );

    error.statusCode = 400;
    throw error;
  }

  const {
    data: downloadedFile,
    error: downloadError,
  } = await supabase.storage
    .from(sourceAsset.bucket_name)
    .download(sourceAsset.storage_path);

  if (downloadError) {
    throw new Error(
      `Unable to download source image: ${downloadError.message}`
    );
  }

  const sourceArrayBuffer =
    await downloadedFile.arrayBuffer();

  return {
    sourceAsset,

    sourceBuffer: Buffer.from(
      sourceArrayBuffer
    ),
  };
}

/*
|--------------------------------------------------------------------------
| Save transparent result to Supabase
|--------------------------------------------------------------------------
*/

async function saveRemovedBackground({
  sourceAsset,
  ownerKey,
  transparentImageBuffer,
}) {
  const normalizedImage =
    await normalizeTransparentImage({
      imageBuffer:
        transparentImageBuffer,

      maximumWidth: 1800,
      maximumHeight: 2200,
    });

  const fileName =
    createAssetFileName({
      originalName:
        sourceAsset.original_file_name ||
        "student-photo",

      extension: "png",
    });

  const storagePath =
    createAssetStoragePath({
      assetType:
        "removed-background",

      ownerKey,

      fileName,
    });

  const {
    data: uploadData,
    error: uploadError,
  } = await supabase.storage
    .from(assetsBucket)
    .upload(
      storagePath,
      normalizedImage.buffer,
      {
        contentType: "image/png",
        cacheControl: "31536000",
        upsert: false,
      }
    );

  if (uploadError) {
    throw new Error(
      `Unable to upload transparent image: ${uploadError.message}`
    );
  }

  const uploadedPath =
    uploadData?.path ||
    storagePath;

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(assetsBucket)
    .getPublicUrl(uploadedPath);

  const publicUrl =
    publicUrlData?.publicUrl;

  if (!publicUrl) {
    await supabase.storage
      .from(assetsBucket)
      .remove([uploadedPath]);

    throw new Error(
      "Unable to create a public URL for the transparent image."
    );
  }

  const assetRecord = {
    owner_key:
      ownerKey.trim(),

    asset_type:
      "removed-background",

    bucket_name:
      assetsBucket,

    storage_path:
      uploadedPath,

    public_url:
      publicUrl,

    original_file_name:
      sourceAsset.original_file_name,

    mime_type:
      "image/png",

    width:
      normalizedImage.width,

    height:
      normalizedImage.height,

    size_bytes:
      normalizedImage.sizeBytes,
  };

  const {
    data: savedAsset,
    error: saveError,
  } = await supabase
    .from("assets")
    .insert(assetRecord)
    .select("*")
    .single();

  if (saveError) {
    await supabase.storage
      .from(assetsBucket)
      .remove([uploadedPath]);

    throw new Error(
      `Unable to save transparent asset: ${saveError.message}`
    );
  }

  return {
    id: savedAsset.id,

    ownerKey:
      savedAsset.owner_key,

    assetType:
      savedAsset.asset_type,

    bucket:
      savedAsset.bucket_name,

    path:
      savedAsset.storage_path,

    publicUrl:
      savedAsset.public_url,

    originalFileName:
      savedAsset.original_file_name,

    mimeType:
      savedAsset.mime_type,

    width:
      savedAsset.width,

    height:
      savedAsset.height,

    sizeBytes: Number(
      savedAsset.size_bytes || 0
    ),

    createdAt:
      savedAsset.created_at,
  };
}

/*
|--------------------------------------------------------------------------
| Remove Supabase asset background
|--------------------------------------------------------------------------
*/

async function removeAssetBackground({
  assetId,
  ownerKey,
}) {
  const sourceResult =
    await downloadSourceAsset({
      assetId,
      ownerKey,
    });

  if (!sourceResult) {
    return null;
  }

  const {
    sourceAsset,
    sourceBuffer,
  } = sourceResult;

  const transparentImageBuffer =
    await runBackgroundRemoval({
      input: sourceBuffer,

      timeoutMs:
        DEFAULT_REMOVE_TIMEOUT_MS,
    });

  const removedAsset =
    await saveRemovedBackground({
      sourceAsset,
      ownerKey,
      transparentImageBuffer,
    });

  return {
    sourceAssetId:
      sourceAsset.id,

    removedAsset,
  };
}

/*
|--------------------------------------------------------------------------
| Service status
|--------------------------------------------------------------------------
*/

function getBackgroundRemovalServiceStatus() {
  return {
    ready: true,

    provider:
      "@imgly/background-removal-node",

    assetsBucket,

    supportedWorkflows: {
      localFile: true,
      supabaseAsset: true,
    },

    supportedInputFormats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "avif",
    ],

    outputFormat:
      "png",

    transparentOutput: true,

    localOutputMaximum: {
      width:
        DEFAULT_LOCAL_OUTPUT_WIDTH,

      height:
        DEFAULT_LOCAL_OUTPUT_HEIGHT,
    },

    timeoutMs:
      DEFAULT_REMOVE_TIMEOUT_MS,
  };
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  removeAssetBackground,

  removeImageBackground,

  removeBackground,

  removeBackgroundFromImage,

  getBackgroundRemovalServiceStatus,

  loadBackgroundRemovalFunction,

  convertResultToBuffer,
};