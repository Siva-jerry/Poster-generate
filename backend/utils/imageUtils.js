const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

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

const folderMap = {
  "student-photo": "student-photos",
  "removed-background": "removed-backgrounds",
  "college-logo": "college-logos",
  background: "backgrounds",
  "editor-upload": "editor-uploads",
  thumbnail: "thumbnails",
  "export-png": "exports/png",
  "export-jpeg": "exports/jpeg",
  "export-webp": "exports/webp",
  "export-pdf": "exports/pdf",
};

function validateAssetType(assetType) {
  if (!allowedAssetTypes.has(assetType)) {
    const error = new Error(
      "Invalid asset type. Allowed values are student-photo, college-logo, background, editor-upload and thumbnail."
    );

    error.statusCode = 400;

    throw error;
  }

  return assetType;
}

function sanitiseOwnerKey(ownerKey) {
  const normalisedOwnerKey = String(
    ownerKey || "guest"
  )
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalisedOwnerKey || "guest";
}

function createAssetFileName({
  originalName,
  extension = "webp",
}) {
  const originalBaseName = path
    .parse(originalName || "image")
    .name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  const safeBaseName =
    originalBaseName || "image";

  const randomId = crypto
    .randomBytes(8)
    .toString("hex");

  return `${Date.now()}-${randomId}-${safeBaseName}.${extension}`;
}

function createAssetStoragePath({
  assetType,
  ownerKey,
  fileName,
}) {
  validateAssetType(assetType);

  const folder = folderMap[assetType];

  const safeOwnerKey =
    sanitiseOwnerKey(ownerKey);

  return `${folder}/${safeOwnerKey}/${fileName}`;
}

async function inspectImage(imageBuffer) {
  if (!Buffer.isBuffer(imageBuffer)) {
    const error = new Error(
      "Uploaded image buffer is missing."
    );

    error.statusCode = 400;

    throw error;
  }

  try {
    const metadata = await sharp(
      imageBuffer
    ).metadata();

    if (
      !metadata.width ||
      !metadata.height
    ) {
      throw new Error(
        "Image dimensions could not be detected."
      );
    }

    return metadata;
  } catch {
    const error = new Error(
      "The uploaded file is not a valid image."
    );

    error.statusCode = 400;

    throw error;
  }
}

function getResizeOptions(assetType) {
  switch (assetType) {
    case "student-photo":
      return {
        width: 1800,
        height: 2200,
        fit: "inside",
        withoutEnlargement: true,
      };

    case "college-logo":
      return {
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      };

    case "background":
      return {
        width: 2560,
        height: 3200,
        fit: "inside",
        withoutEnlargement: true,
      };

    case "thumbnail":
      return {
        width: 540,
        height: 675,
        fit: "cover",
        position: "centre",
        withoutEnlargement: false,
      };

    case "editor-upload":
    default:
      return {
        width: 2200,
        height: 2200,
        fit: "inside",
        withoutEnlargement: true,
      };
      case "removed-background":
  return {
    width: 1800,
    height: 2200,
    fit: "inside",
    withoutEnlargement: true,
  };

  case "ai-background":
  return {
    width: 1536,
    height: 1920,
    fit: "cover",
    position: "centre",
    withoutEnlargement: false,
  };
  
  }
}

async function optimiseImage({
  imageBuffer,
  assetType,
}) {
  validateAssetType(assetType);

  await inspectImage(imageBuffer);

  const resizeOptions =
    getResizeOptions(assetType);

  const processingPipeline = sharp(
    imageBuffer,
    {
      failOn: "error",
    }
  )
    .rotate()
    .resize(resizeOptions);

  if (assetType === "college-logo") {
    return processingPipeline
      .webp({
        quality: 92,
        alphaQuality: 100,
        effort: 5,
      })
      .toBuffer({
        resolveWithObject: true,
      });
  }

  return processingPipeline
    .webp({
      quality: 88,
      alphaQuality: 95,
      effort: 5,
    })
    .toBuffer({
      resolveWithObject: true,
    });
}

module.exports = {
  validateAssetType,
  createAssetFileName,
  createAssetStoragePath,
  inspectImage,
  optimiseImage,
};