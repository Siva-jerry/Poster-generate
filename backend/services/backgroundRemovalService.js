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
| Load IMG.LY background remover
|--------------------------------------------------------------------------
|
| The package may expose its removeBackground function through either
| CommonJS or ESM-compatible exports, depending on the installed version.
|
*/

async function loadBackgroundRemovalFunction() {
  const module = await import(
    "@imgly/background-removal-node"
  );

  const removeBackground =
    module.removeBackground ||
    module.default?.removeBackground ||
    module.default;

  if (
    typeof removeBackground !== "function"
  ) {
    throw new Error(
      "Background-removal function could not be loaded."
    );
  }

  return removeBackground;
}

/*
|--------------------------------------------------------------------------
| Convert response into Buffer
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

  if (
    result instanceof Uint8Array
  ) {
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

  throw new Error(
    "Unsupported background-removal response format."
  );
}

/*
|--------------------------------------------------------------------------
| Download source asset
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
| Save transparent result
|--------------------------------------------------------------------------
*/

async function saveRemovedBackground({
  sourceAsset,
  ownerKey,
  transparentImageBuffer,
}) {
  /*
   * Normalise the output and preserve transparency.
   */
  const {
    data: finalBuffer,
    info,
  } = await sharp(
    transparentImageBuffer,
    {
      failOn: "error",
    }
  )
    .rotate()
    .resize({
      width: 1800,
      height: 2200,
      fit: "inside",
      withoutEnlargement: true,
    })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .toBuffer({
      resolveWithObject: true,
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
      finalBuffer,
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
    uploadData?.path || storagePath;

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
    owner_key: ownerKey.trim(),
    asset_type:
      "removed-background",
    bucket_name: assetsBucket,
    storage_path: uploadedPath,
    public_url: publicUrl,
    original_file_name:
      sourceAsset.original_file_name,
    mime_type: "image/png",
    width: info.width,
    height: info.height,
    size_bytes: finalBuffer.length,
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
| Remove background
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

  const removeBackground =
    await loadBackgroundRemovalFunction();

  let result;

  try {
    result = await removeBackground(
      sourceBuffer,
      {
        output: {
          format: "image/png",
          quality: 1,
        },
      }
    );
  } catch (error) {
    throw new Error(
      `Background removal failed: ${error.message}`
    );
  }

  const transparentImageBuffer =
    await convertResultToBuffer(result);

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

module.exports = {
  removeAssetBackground,
};