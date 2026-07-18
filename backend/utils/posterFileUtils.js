const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/*
|--------------------------------------------------------------------------
| Poster file configuration
|--------------------------------------------------------------------------
*/

const BACKEND_ROOT = path.resolve(
  __dirname,
  ".."
);

const PUBLIC_DIRECTORY = path.join(
  BACKEND_ROOT,
  "public"
);

const GENERATED_DIRECTORY = path.join(
  PUBLIC_DIRECTORY,
  "generated"
);

const BACKGROUND_DIRECTORY = path.join(
  GENERATED_DIRECTORY,
  "backgrounds"
);

const TEMP_DIRECTORY = path.join(
  GENERATED_DIRECTORY,
  ".temp"
);

const UPLOAD_DIRECTORY = path.join(
  BACKEND_ROOT,
  "uploads"
);

const POSTER_UPLOAD_DIRECTORY =
  path.join(
    UPLOAD_DIRECTORY,
    "posters"
  );

const PHOTO_UPLOAD_DIRECTORY =
  path.join(
    POSTER_UPLOAD_DIRECTORY,
    "photos"
  );

const LOGO_UPLOAD_DIRECTORY =
  path.join(
    POSTER_UPLOAD_DIRECTORY,
    "logos"
  );

const DEFAULT_FILE_MAX_AGE_MS =
  24 * 60 * 60 * 1000;

const ALLOWED_IMAGE_EXTENSIONS =
  new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".avif",
  ]);

const ALLOWED_IMAGE_MIME_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ]);

/*
|--------------------------------------------------------------------------
| Basic value helpers
|--------------------------------------------------------------------------
*/

function toSafeString(
  value,
  fallback = ""
) {
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

  if (
    !Number.isFinite(parsedValue)
  ) {
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

function toSafeBoolean(
  value,
  fallback = false
) {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  if (
    typeof value === "boolean"
  ) {
    return value;
  }

  const normalizedValue = String(
    value
  )
    .trim()
    .toLowerCase();

  if (
    [
      "true",
      "1",
      "yes",
      "on",
    ].includes(normalizedValue)
  ) {
    return true;
  }

  if (
    [
      "false",
      "0",
      "no",
      "off",
    ].includes(normalizedValue)
  ) {
    return false;
  }

  return fallback;
}

/*
|--------------------------------------------------------------------------
| ID and filename helpers
|--------------------------------------------------------------------------
*/

function createFileId() {
  if (
    typeof crypto.randomUUID ===
    "function"
  ) {
    return crypto.randomUUID();
  }

  return [
    Date.now(),
    crypto
      .randomBytes(8)
      .toString("hex"),
  ].join("-");
}

function sanitizeFilename(
  value,
  fallback = "file"
) {
  const safeValue = toSafeString(
    value,
    fallback
  );

  const extension =
    path.extname(safeValue);

  const nameWithoutExtension =
    path.basename(
      safeValue,
      extension
    );

  const safeName =
    nameWithoutExtension
      .normalize("NFKD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .slice(0, 80);

  const safeExtension =
    extension
      .toLowerCase()
      .replace(
        /[^a-z0-9.]/g,
        ""
      );

  return `${
    safeName || fallback
  }${safeExtension}`;
}

function sanitizeBaseName(
  value,
  fallback = "file"
) {
  const safeFilename =
    sanitizeFilename(
      value,
      fallback
    );

  return path.basename(
    safeFilename,
    path.extname(safeFilename)
  );
}

function createUniqueFilename({
  originalName = "file",
  prefix = "",
  extension = "",
} = {}) {
  const originalExtension =
    path.extname(
      toSafeString(originalName)
    );

  const resolvedExtension =
    toSafeString(
      extension,
      originalExtension
    )
      .toLowerCase()
      .replace(/^\./, "");

  const safeBaseName =
    sanitizeBaseName(
      originalName,
      "file"
    );

  const safePrefix =
    sanitizeBaseName(
      prefix,
      ""
    );

  const parts = [
    safePrefix,
    safeBaseName,
    Date.now(),
    createFileId().slice(0, 8),
  ].filter(Boolean);

  return `${parts.join("-")}.${
    resolvedExtension || "bin"
  }`;
}

/*
|--------------------------------------------------------------------------
| Directory helpers
|--------------------------------------------------------------------------
*/

async function ensureDirectory(
  directoryPath
) {
  const resolvedDirectory =
    path.resolve(directoryPath);

  await fs.promises.mkdir(
    resolvedDirectory,
    {
      recursive: true,
    }
  );

  return resolvedDirectory;
}

async function ensurePosterDirectories() {
  const directories = [
    PUBLIC_DIRECTORY,
    GENERATED_DIRECTORY,
    BACKGROUND_DIRECTORY,
    TEMP_DIRECTORY,
    UPLOAD_DIRECTORY,
    POSTER_UPLOAD_DIRECTORY,
    PHOTO_UPLOAD_DIRECTORY,
    LOGO_UPLOAD_DIRECTORY,
  ];

  await Promise.all(
    directories.map((directory) =>
      ensureDirectory(directory)
    )
  );

  return {
    backendRoot:
      BACKEND_ROOT,

    publicDirectory:
      PUBLIC_DIRECTORY,

    generatedDirectory:
      GENERATED_DIRECTORY,

    backgroundDirectory:
      BACKGROUND_DIRECTORY,

    tempDirectory:
      TEMP_DIRECTORY,

    uploadDirectory:
      UPLOAD_DIRECTORY,

    posterUploadDirectory:
      POSTER_UPLOAD_DIRECTORY,

    photoUploadDirectory:
      PHOTO_UPLOAD_DIRECTORY,

    logoUploadDirectory:
      LOGO_UPLOAD_DIRECTORY,
  };
}

/*
|--------------------------------------------------------------------------
| File checking helpers
|--------------------------------------------------------------------------
*/

async function fileExists(
  filePath
) {
  const safeFilePath =
    toSafeString(filePath);

  if (!safeFilePath) {
    return false;
  }

  try {
    const statistics =
      await fs.promises.stat(
        safeFilePath
      );

    return statistics.isFile();
  } catch {
    return false;
  }
}

async function directoryExists(
  directoryPath
) {
  const safeDirectoryPath =
    toSafeString(directoryPath);

  if (!safeDirectoryPath) {
    return false;
  }

  try {
    const statistics =
      await fs.promises.stat(
        safeDirectoryPath
      );

    return statistics.isDirectory();
  } catch {
    return false;
  }
}

async function getFileStatistics(
  filePath
) {
  const safeFilePath =
    toSafeString(filePath);

  if (!safeFilePath) {
    return null;
  }

  try {
    const statistics =
      await fs.promises.stat(
        safeFilePath
      );

    return {
      sizeBytes:
        statistics.size,

      createdAt:
        statistics.birthtime,

      modifiedAt:
        statistics.mtime,

      isFile:
        statistics.isFile(),

      isDirectory:
        statistics.isDirectory(),
    };
  } catch {
    return null;
  }
}

/*
|--------------------------------------------------------------------------
| Image validation helpers
|--------------------------------------------------------------------------
*/

function isAllowedImageExtension(
  filename
) {
  const extension =
    path.extname(
      toSafeString(filename)
    ).toLowerCase();

  return ALLOWED_IMAGE_EXTENSIONS.has(
    extension
  );
}

function isAllowedImageMimeType(
  mimeType
) {
  return ALLOWED_IMAGE_MIME_TYPES.has(
    toSafeString(mimeType)
      .toLowerCase()
  );
}

function validateImageFileInfo({
  filename,
  mimeType,
} = {}) {
  const validExtension =
    isAllowedImageExtension(
      filename
    );

  const validMimeType =
    isAllowedImageMimeType(
      mimeType
    );

  if (!validExtension) {
    const error = new Error(
      "Unsupported image extension. Use JPG, JPEG, PNG, WEBP, GIF or AVIF."
    );

    error.statusCode = 400;

    throw error;
  }

  if (!validMimeType) {
    const error = new Error(
      "Unsupported image MIME type."
    );

    error.statusCode = 400;

    throw error;
  }

  return true;
}

/*
|--------------------------------------------------------------------------
| Path safety helpers
|--------------------------------------------------------------------------
*/

function isPathInsideDirectory(
  targetPath,
  parentDirectory
) {
  const resolvedTarget =
    path.resolve(targetPath);

  const resolvedParent =
    path.resolve(
      parentDirectory
    );

  const relativePath =
    path.relative(
      resolvedParent,
      resolvedTarget
    );

  return (
    relativePath !== "" &&
    !relativePath.startsWith("..") &&
    !path.isAbsolute(relativePath)
  );
}

function assertPathInsideDirectory(
  targetPath,
  parentDirectory
) {
  if (
    !isPathInsideDirectory(
      targetPath,
      parentDirectory
    )
  ) {
    const error = new Error(
      "Unsafe file path detected."
    );

    error.statusCode = 400;

    throw error;
  }

  return path.resolve(
    targetPath
  );
}

function resolveGeneratedFilePath(
  filename
) {
  const safeFilename =
    path.basename(
      sanitizeFilename(
        filename,
        "poster.png"
      )
    );

  return path.join(
    GENERATED_DIRECTORY,
    safeFilename
  );
}

function resolveBackgroundFilePath(
  filename
) {
  const safeFilename =
    path.basename(
      sanitizeFilename(
        filename,
        "background.jpg"
      )
    );

  return path.join(
    BACKGROUND_DIRECTORY,
    safeFilename
  );
}

function resolvePhotoUploadPath(
  filename
) {
  const safeFilename =
    path.basename(
      sanitizeFilename(
        filename,
        "photo.jpg"
      )
    );

  return path.join(
    PHOTO_UPLOAD_DIRECTORY,
    safeFilename
  );
}

function resolveLogoUploadPath(
  filename
) {
  const safeFilename =
    path.basename(
      sanitizeFilename(
        filename,
        "logo.png"
      )
    );

  return path.join(
    LOGO_UPLOAD_DIRECTORY,
    safeFilename
  );
}

/*
|--------------------------------------------------------------------------
| URL helpers
|--------------------------------------------------------------------------
*/

function normalizeBaseUrl(
  baseUrl
) {
  return toSafeString(baseUrl)
    .replace(/\/+$/, "");
}

function createGeneratedFileUrl({
  filename,
  baseUrl = "",
} = {}) {
  const safeFilename =
    encodeURIComponent(
      path.basename(
        toSafeString(filename)
      )
    );

  const safeBaseUrl =
    normalizeBaseUrl(baseUrl);

  if (!safeBaseUrl) {
    return `/generated/${safeFilename}`;
  }

  return `${safeBaseUrl}/generated/${safeFilename}`;
}

function createBackgroundFileUrl({
  filename,
  baseUrl = "",
} = {}) {
  const safeFilename =
    encodeURIComponent(
      path.basename(
        toSafeString(filename)
      )
    );

  const safeBaseUrl =
    normalizeBaseUrl(baseUrl);

  if (!safeBaseUrl) {
    return `/generated/backgrounds/${safeFilename}`;
  }

  return `${safeBaseUrl}/generated/backgrounds/${safeFilename}`;
}

function getRequestBaseUrl(
  request
) {
  if (!request) {
    return "";
  }

  const forwardedProto =
    request.headers?.[
      "x-forwarded-proto"
    ];

  const forwardedHost =
    request.headers?.[
      "x-forwarded-host"
    ];

  const protocol =
    toSafeString(
      forwardedProto
        ? String(
            forwardedProto
          ).split(",")[0]
        : request.protocol,
      "http"
    );

  const host =
    toSafeString(
      forwardedHost
        ? String(
            forwardedHost
          ).split(",")[0]
        : request.get?.("host") ||
          request.headers?.host
    );

  if (!host) {
    return "";
  }

  return `${protocol}://${host}`;
}

/*
|--------------------------------------------------------------------------
| File copy and move helpers
|--------------------------------------------------------------------------
*/

async function copyFile({
  sourcePath,
  destinationPath,
  overwrite = false,
} = {}) {
  if (
    !(await fileExists(
      sourcePath
    ))
  ) {
    const error = new Error(
      "Source file could not be found."
    );

    error.statusCode = 404;

    throw error;
  }

  await ensureDirectory(
    path.dirname(
      destinationPath
    )
  );

  if (
    !overwrite &&
    (await fileExists(
      destinationPath
    ))
  ) {
    const error = new Error(
      "Destination file already exists."
    );

    error.statusCode = 409;

    throw error;
  }

  await fs.promises.copyFile(
    sourcePath,
    destinationPath
  );

  return destinationPath;
}

async function moveFile({
  sourcePath,
  destinationPath,
  overwrite = false,
} = {}) {
  if (
    !(await fileExists(
      sourcePath
    ))
  ) {
    const error = new Error(
      "Source file could not be found."
    );

    error.statusCode = 404;

    throw error;
  }

  await ensureDirectory(
    path.dirname(
      destinationPath
    )
  );

  if (
    !overwrite &&
    (await fileExists(
      destinationPath
    ))
  ) {
    const error = new Error(
      "Destination file already exists."
    );

    error.statusCode = 409;

    throw error;
  }

  try {
    await fs.promises.rename(
      sourcePath,
      destinationPath
    );
  } catch (error) {
    if (
      error.code !== "EXDEV"
    ) {
      throw error;
    }

    await fs.promises.copyFile(
      sourcePath,
      destinationPath
    );

    await fs.promises.unlink(
      sourcePath
    );
  }

  return destinationPath;
}

/*
|--------------------------------------------------------------------------
| Safe deletion helpers
|--------------------------------------------------------------------------
*/

async function deleteFileSafely(
  filePath,
  {
    allowedDirectories = [
      GENERATED_DIRECTORY,
      UPLOAD_DIRECTORY,
    ],
    throwOnError = false,
  } = {}
) {
  const safeFilePath =
    toSafeString(filePath);

  if (!safeFilePath) {
    return false;
  }

  const resolvedPath =
    path.resolve(
      safeFilePath
    );

  const isAllowedPath =
    allowedDirectories.some(
      (directory) =>
        isPathInsideDirectory(
          resolvedPath,
          directory
        )
    );

  if (!isAllowedPath) {
    if (throwOnError) {
      const error = new Error(
        "File deletion blocked because the path is outside the allowed directories."
      );

      error.statusCode = 400;

      throw error;
    }

    console.warn(
      `Blocked unsafe file deletion: ${resolvedPath}`
    );

    return false;
  }

  try {
    await fs.promises.unlink(
      resolvedPath
    );

    return true;
  } catch (error) {
    if (
      error.code === "ENOENT"
    ) {
      return false;
    }

   if (
  error.code === "EBUSY" ||
  error.code === "EPERM"
) {
  for (
    let attempt = 1;
    attempt <= 3;
    attempt += 1
  ) {
    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          attempt * 300
        )
    );

    try {
      await fs.promises.unlink(
        resolvedPath
      );

      return true;
    } catch (retryError) {
      if (
        attempt === 3
      ) {
        if (throwOnError) {
          throw retryError;
        }

        console.warn(
          `Unable to delete locked file after retries: ${resolvedPath}`,
          retryError.message
        );

        return false;
      }
    }
  }
}

if (throwOnError) {
  throw error;
}

console.warn(
  `Unable to delete file: ${resolvedPath}`,
  error.message
);

return false;
  }
}

async function deleteFilesSafely(
  filePaths = [],
  options = {}
) {
  if (
    !Array.isArray(filePaths)
  ) {
    return [];
  }

  return Promise.all(
    filePaths.map(
      (filePath) =>
        deleteFileSafely(
          filePath,
          options
        )
    )
  );
}

/*
|--------------------------------------------------------------------------
| Directory cleanup helpers
|--------------------------------------------------------------------------
*/

async function listFilesRecursively(
  directoryPath
) {
  if (
    !(await directoryExists(
      directoryPath
    ))
  ) {
    return [];
  }

  const results = [];

  async function walk(
    currentDirectory
  ) {
    const entries =
      await fs.promises.readdir(
        currentDirectory,
        {
          withFileTypes: true,
        }
      );

    for (const entry of entries) {
      const entryPath =
        path.join(
          currentDirectory,
          entry.name
        );

      if (
        entry.isDirectory()
      ) {
        await walk(entryPath);
        continue;
      }

      if (entry.isFile()) {
        results.push(entryPath);
      }
    }
  }

  await walk(directoryPath);

  return results;
}

async function cleanupOldFiles({
  directoryPath,
  maximumAgeMs =
    DEFAULT_FILE_MAX_AGE_MS,
  recursive = true,
  extensions = [],
  dryRun = false,
} = {}) {
  const safeDirectoryPath =
    path.resolve(
      toSafeString(
        directoryPath,
        GENERATED_DIRECTORY
      )
    );

  const safeMaximumAgeMs =
    toSafeInteger(
      maximumAgeMs,
      DEFAULT_FILE_MAX_AGE_MS,
      60_000,
      365 * 24 * 60 * 60 * 1000
    );

  if (
    !(await directoryExists(
      safeDirectoryPath
    ))
  ) {
    return {
      scanned: 0,
      deleted: 0,
      failed: 0,
      deletedFiles: [],
      failedFiles: [],
    };
  }

  const allowedExtensions =
    new Set(
      Array.isArray(extensions)
        ? extensions
            .map((extension) =>
              toSafeString(extension)
                .toLowerCase()
                .replace(/^\./, "")
            )
            .filter(Boolean)
        : []
    );

  let files = [];

  if (recursive) {
    files =
      await listFilesRecursively(
        safeDirectoryPath
      );
  } else {
    const entries =
      await fs.promises.readdir(
        safeDirectoryPath,
        {
          withFileTypes: true,
        }
      );

    files = entries
      .filter((entry) =>
        entry.isFile()
      )
      .map((entry) =>
        path.join(
          safeDirectoryPath,
          entry.name
        )
      );
  }

  const now = Date.now();

  const deletedFiles = [];
  const failedFiles = [];

  for (const filePath of files) {
    const extension =
      path.extname(filePath)
        .toLowerCase()
        .replace(/^\./, "");

    if (
      allowedExtensions.size > 0 &&
      !allowedExtensions.has(
        extension
      )
    ) {
      continue;
    }

    try {
      const statistics =
        await fs.promises.stat(
          filePath
        );

      const age =
        now -
        statistics.mtimeMs;

      if (
        age < safeMaximumAgeMs
      ) {
        continue;
      }

      if (!dryRun) {
        await fs.promises.unlink(
          filePath
        );
      }

      deletedFiles.push({
        filePath,
        sizeBytes:
          statistics.size,
        ageMs:
          age,
      });
    } catch (error) {
      failedFiles.push({
        filePath,
        error:
          error.message,
      });
    }
  }

  return {
    scanned:
      files.length,

    deleted:
      deletedFiles.length,

    failed:
      failedFiles.length,

    dryRun:
      toSafeBoolean(
        dryRun,
        false
      ),

    deletedFiles,

    failedFiles,
  };
}

/*
|--------------------------------------------------------------------------
| Empty directory cleanup
|--------------------------------------------------------------------------
*/

async function removeEmptyDirectories(
  directoryPath,
  {
    preserveRoot = true,
  } = {}
) {
  const rootDirectory =
    path.resolve(
      directoryPath
    );

  if (
    !(await directoryExists(
      rootDirectory
    ))
  ) {
    return 0;
  }

  let removedCount = 0;

  async function removeEmpty(
    currentDirectory
  ) {
    const entries =
      await fs.promises.readdir(
        currentDirectory,
        {
          withFileTypes: true,
        }
      );

    for (const entry of entries) {
      if (
        !entry.isDirectory()
      ) {
        continue;
      }

      await removeEmpty(
        path.join(
          currentDirectory,
          entry.name
        )
      );
    }

    const remainingEntries =
      await fs.promises.readdir(
        currentDirectory
      );

    const isRoot =
      currentDirectory ===
      rootDirectory;

    if (
      remainingEntries.length === 0 &&
      (!isRoot ||
        !preserveRoot)
    ) {
      await fs.promises.rmdir(
        currentDirectory
      );

      removedCount += 1;
    }
  }

  await removeEmpty(
    rootDirectory
  );

  return removedCount;
}

/*
|--------------------------------------------------------------------------
| Uploaded file normalization
|--------------------------------------------------------------------------
*/

function normalizeMulterFile(
  file
) {
  if (!file) {
    return null;
  }

  const filePath =
    toSafeString(
      file.path
    );

  const filename =
    toSafeString(
      file.filename,
      path.basename(
        filePath
      )
    );

  return {
    fieldName:
      toSafeString(
        file.fieldname
      ),

    originalName:
      toSafeString(
        file.originalname
      ),

    filename,

    filePath,

    destination:
      toSafeString(
        file.destination
      ),

    mimeType:
      toSafeString(
        file.mimetype
      ),

    sizeBytes:
      Number(
        file.size || 0
      ),

    extension:
      path.extname(
        filename ||
          file.originalname ||
          filePath
      ).toLowerCase(),
  };
}

function getUploadedFile(
  request,
  fieldName
) {
  if (!request) {
    return null;
  }

  if (
    request.file &&
    request.file.fieldname ===
      fieldName
  ) {
    return normalizeMulterFile(
      request.file
    );
  }

  const files =
    request.files;

  if (!files) {
    return null;
  }

  if (
    Array.isArray(files)
  ) {
    const matchedFile =
      files.find(
        (file) =>
          file.fieldname ===
          fieldName
      );

    return normalizeMulterFile(
      matchedFile
    );
  }

  const fieldFiles =
    files[fieldName];

  if (
    Array.isArray(
      fieldFiles
    ) &&
    fieldFiles.length > 0
  ) {
    return normalizeMulterFile(
      fieldFiles[0]
    );
  }

  return null;
}

function getAllUploadedFiles(
  request
) {
  if (!request) {
    return [];
  }

  if (request.file) {
    return [
      normalizeMulterFile(
        request.file
      ),
    ].filter(Boolean);
  }

  if (
    Array.isArray(
      request.files
    )
  ) {
    return request.files
      .map(
        normalizeMulterFile
      )
      .filter(Boolean);
  }

  if (
    request.files &&
    typeof request.files ===
      "object"
  ) {
    return Object.values(
      request.files
    )
      .flat()
      .map(
        normalizeMulterFile
      )
      .filter(Boolean);
  }

  return [];
}

/*
|--------------------------------------------------------------------------
| Build poster file response
|--------------------------------------------------------------------------
*/

async function buildPosterFileResponse({
  filePath,
  baseUrl = "",
  extra = {},
} = {}) {
  const safeFilePath =
    toSafeString(filePath);

  if (
    !(await fileExists(
      safeFilePath
    ))
  ) {
    return null;
  }

  const statistics =
    await fs.promises.stat(
      safeFilePath
    );

  const filename =
    path.basename(
      safeFilePath
    );

  return {
    filename,

    filePath:
      safeFilePath,

    relativePath:
      path
        .relative(
          BACKEND_ROOT,
          safeFilePath
        )
        .replace(
          /\\/g,
          "/"
        ),

    url:
      createGeneratedFileUrl({
        filename,
        baseUrl,
      }),

    sizeBytes:
      statistics.size,

    createdAt:
      statistics.birthtime.toISOString(),

    modifiedAt:
      statistics.mtime.toISOString(),

    ...extra,
  };
}

/*
|--------------------------------------------------------------------------
| Service status
|--------------------------------------------------------------------------
*/

function getPosterFileUtilsStatus() {
  return {
    ready: true,

    directories: {
      backendRoot:
        BACKEND_ROOT,

      public:
        PUBLIC_DIRECTORY,

      generated:
        GENERATED_DIRECTORY,

      backgrounds:
        BACKGROUND_DIRECTORY,

      temporary:
        TEMP_DIRECTORY,

      uploads:
        UPLOAD_DIRECTORY,

      photos:
        PHOTO_UPLOAD_DIRECTORY,

      logos:
        LOGO_UPLOAD_DIRECTORY,
    },

    allowedImageExtensions:
      Array.from(
        ALLOWED_IMAGE_EXTENSIONS
      ),

    allowedImageMimeTypes:
      Array.from(
        ALLOWED_IMAGE_MIME_TYPES
      ),

    defaultCleanupAgeMs:
      DEFAULT_FILE_MAX_AGE_MS,
  };
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  BACKEND_ROOT,

  PUBLIC_DIRECTORY,

  GENERATED_DIRECTORY,

  BACKGROUND_DIRECTORY,

  TEMP_DIRECTORY,

  UPLOAD_DIRECTORY,

  POSTER_UPLOAD_DIRECTORY,

  PHOTO_UPLOAD_DIRECTORY,

  LOGO_UPLOAD_DIRECTORY,

  DEFAULT_FILE_MAX_AGE_MS,

  ALLOWED_IMAGE_EXTENSIONS,

  ALLOWED_IMAGE_MIME_TYPES,

  toSafeString,

  toSafeInteger,

  toSafeBoolean,

  createFileId,

  sanitizeFilename,

  sanitizeBaseName,

  createUniqueFilename,

  ensureDirectory,

  ensurePosterDirectories,

  fileExists,

  directoryExists,

  getFileStatistics,

  isAllowedImageExtension,

  isAllowedImageMimeType,

  validateImageFileInfo,

  isPathInsideDirectory,

  assertPathInsideDirectory,

  resolveGeneratedFilePath,

  resolveBackgroundFilePath,

  resolvePhotoUploadPath,

  resolveLogoUploadPath,

  normalizeBaseUrl,

  createGeneratedFileUrl,

  createBackgroundFileUrl,

  getRequestBaseUrl,

  copyFile,

  moveFile,

  deleteFileSafely,

  deleteFilesSafely,

  listFilesRecursively,

  cleanupOldFiles,

  removeEmptyDirectories,

  normalizeMulterFile,

  getUploadedFile,

  getAllUploadedFiles,

  buildPosterFileResponse,

  getPosterFileUtilsStatus,
};