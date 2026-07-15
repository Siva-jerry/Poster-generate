const crypto = require("crypto");
const path = require("path");

/*
|--------------------------------------------------------------------------
| Supported asset types
|--------------------------------------------------------------------------
|
| Keep only one allowedAssetTypes declaration in this file.
|
*/

const allowedAssetTypes = new Set([
  "student-photo",
  "removed-background",
  "college-logo",
  "background",
  "ai-background",
  "editor-upload",
  "thumbnail",
  "export-png",
  "export-jpeg",
  "export-webp",
  "export-pdf",
]);

/*
|--------------------------------------------------------------------------
| Asset storage folders
|--------------------------------------------------------------------------
|
| Keep only one folderMap declaration in this file.
|
*/

const folderMap = {
  "student-photo": "student-photos",
  "removed-background": "removed-backgrounds",
  "college-logo": "college-logos",
  background: "backgrounds",
  "ai-background": "ai-backgrounds",
  "editor-upload": "editor-uploads",
  thumbnail: "thumbnails",
  "export-png": "exports/png",
  "export-jpeg": "exports/jpeg",
  "export-webp": "exports/webp",
  "export-pdf": "exports/pdf",
};

/*
|--------------------------------------------------------------------------
| Extension and MIME-type configuration
|--------------------------------------------------------------------------
*/

const extensionMimeTypeMap = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

/*
|--------------------------------------------------------------------------
| Validate asset type
|--------------------------------------------------------------------------
*/

function normalizeAssetType(assetType) {
  const normalizedAssetType = String(
    assetType || ""
  )
    .trim()
    .toLowerCase();

  if (!allowedAssetTypes.has(normalizedAssetType)) {
    const error = new Error(
      `Invalid asset type: ${normalizedAssetType || "empty value"}.`
    );

    error.statusCode = 400;

    throw error;
  }

  return normalizedAssetType;
}

/*
|--------------------------------------------------------------------------
| Sanitize path segment
|--------------------------------------------------------------------------
|
| This prevents unsafe characters from entering storage paths.
|
*/

function sanitizePathSegment(value, fallback = "item") {
  const sanitizedValue = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 100);

  return sanitizedValue || fallback;
}

/*
|--------------------------------------------------------------------------
| Sanitize original filename
|--------------------------------------------------------------------------
*/

function sanitizeOriginalFileName(
  originalName,
  fallback = "asset"
) {
  const parsedName = path.parse(
    String(originalName || fallback)
  );

  return sanitizePathSegment(
    parsedName.name,
    fallback
  );
}

/*
|--------------------------------------------------------------------------
| Normalize extension
|--------------------------------------------------------------------------
*/

function normalizeExtension(extension) {
  const normalizedExtension = String(
    extension || ""
  )
    .trim()
    .toLowerCase()
    .replace(/^\./, "");

  if (
    !Object.prototype.hasOwnProperty.call(
      extensionMimeTypeMap,
      normalizedExtension
    )
  ) {
    const error = new Error(
      `Unsupported file extension: ${
        normalizedExtension || "empty value"
      }.`
    );

    error.statusCode = 400;

    throw error;
  }

  return normalizedExtension;
}

/*
|--------------------------------------------------------------------------
| Get extension from MIME type
|--------------------------------------------------------------------------
*/

function getExtensionFromMimeType(mimeType) {
  const normalizedMimeType = String(
    mimeType || ""
  )
    .trim()
    .toLowerCase();

  const extensionEntry = Object.entries(
    extensionMimeTypeMap
  ).find(
    ([extension, mappedMimeType]) =>
      mappedMimeType === normalizedMimeType &&
      extension !== "jpeg"
  );

  if (!extensionEntry) {
    const error = new Error(
      `Unsupported MIME type: ${
        normalizedMimeType || "empty value"
      }.`
    );

    error.statusCode = 400;

    throw error;
  }

  return extensionEntry[0];
}

/*
|--------------------------------------------------------------------------
| Get MIME type from extension
|--------------------------------------------------------------------------
*/

function getMimeTypeFromExtension(extension) {
  const normalizedExtension =
    normalizeExtension(extension);

  return extensionMimeTypeMap[
    normalizedExtension
  ];
}

/*
|--------------------------------------------------------------------------
| Create unique asset filename
|--------------------------------------------------------------------------
|
| Example:
|
| 1784123456789-a1b2c3d4-student-photo.webp
|
*/

function createAssetFileName({
  originalName = "asset",
  extension = "webp",
}) {
  const safeName =
    sanitizeOriginalFileName(
      originalName,
      "asset"
    );

  const safeExtension =
    normalizeExtension(extension);

  const uniqueId = crypto
    .randomBytes(6)
    .toString("hex");

  return `${Date.now()}-${uniqueId}-${safeName}.${safeExtension}`;
}

/*
|--------------------------------------------------------------------------
| Create Supabase storage path
|--------------------------------------------------------------------------
|
| Example:
|
| student-photos/guest-user/file.webp
|
*/

function createAssetStoragePath({
  assetType,
  ownerKey,
  fileName,
}) {
  const normalizedAssetType =
    normalizeAssetType(assetType);

  const safeOwnerKey =
    sanitizePathSegment(
      ownerKey,
      "anonymous"
    );

  if (!fileName) {
    const error = new Error(
      "fileName is required when creating an asset storage path."
    );

    error.statusCode = 400;

    throw error;
  }

  const safeFileName = path
    .basename(String(fileName))
    .replace(/[^a-zA-Z0-9._-]/g, "-");

  const folder =
    folderMap[normalizedAssetType];

  return `${folder}/${safeOwnerKey}/${safeFileName}`;
}

/*
|--------------------------------------------------------------------------
| Image resize configuration
|--------------------------------------------------------------------------
*/

function getResizeOptions(assetType) {
  const normalizedAssetType =
    normalizeAssetType(assetType);

  switch (normalizedAssetType) {
    case "student-photo":
      return {
        width: 1800,
        height: 2200,
        fit: "inside",
        position: "centre",
        withoutEnlargement: true,
      };

    case "removed-background":
      return {
        width: 1800,
        height: 2200,
        fit: "inside",
        position: "centre",
        withoutEnlargement: true,
      };

    case "college-logo":
      return {
        width: 1200,
        height: 1200,
        fit: "inside",
        position: "centre",
        withoutEnlargement: true,
      };

    case "background":
      return {
        width: 2160,
        height: 2700,
        fit: "cover",
        position: "centre",
        withoutEnlargement: false,
      };

    case "ai-background":
      return {
        width: 1536,
        height: 1920,
        fit: "cover",
        position: "centre",
        withoutEnlargement: false,
      };

    case "editor-upload":
      return {
        width: 2160,
        height: 2700,
        fit: "inside",
        position: "centre",
        withoutEnlargement: true,
      };

    case "thumbnail":
      return {
        width: 720,
        height: 900,
        fit: "cover",
        position: "centre",
        withoutEnlargement: false,
      };

    /*
     * Export assets are already rendered at the requested
     * dimensions. They should not be resized here.
     */
    case "export-png":
    case "export-jpeg":
    case "export-webp":
    case "export-pdf":
      return null;

    default:
      return null;
  }
}

/*
|--------------------------------------------------------------------------
| Check whether asset is an image
|--------------------------------------------------------------------------
*/

function isImageAssetType(assetType) {
  const normalizedAssetType =
    normalizeAssetType(assetType);

  return normalizedAssetType !== "export-pdf";
}

/*
|--------------------------------------------------------------------------
| Public exports
|--------------------------------------------------------------------------
*/

module.exports = {
  allowedAssetTypes,
  folderMap,
  extensionMimeTypeMap,

  normalizeAssetType,
  sanitizePathSegment,
  sanitizeOriginalFileName,
  normalizeExtension,

  getExtensionFromMimeType,
  getMimeTypeFromExtension,

  createAssetFileName,
  createAssetStoragePath,
  getResizeOptions,
  isImageAssetType,
};