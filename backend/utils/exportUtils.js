const crypto = require("crypto");

/*
|--------------------------------------------------------------------------
| Supported export formats
|--------------------------------------------------------------------------
*/

const supportedFormats = new Set([
  "png",
  "jpeg",
  "webp",
  "pdf",
]);

const mimeTypeMap = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
  pdf: "application/pdf",
};

const extensionMap = {
  png: "png",
  jpeg: "jpg",
  webp: "webp",
  pdf: "pdf",
};

const assetTypeMap = {
  png: "export-png",
  jpeg: "export-jpeg",
  webp: "export-webp",
  pdf: "export-pdf",
};

/*
|--------------------------------------------------------------------------
| Validate export format
|--------------------------------------------------------------------------
*/

function validateExportFormat(format) {
  const normalizedFormat = String(
    format || "png"
  )
    .trim()
    .toLowerCase();

  if (!supportedFormats.has(normalizedFormat)) {
    const error = new Error(
      "Invalid export format. Use png, jpeg, webp or pdf."
    );

    error.statusCode = 400;

    throw error;
  }

  return normalizedFormat;
}

/*
|--------------------------------------------------------------------------
| Parse a Base64 image data URL
|--------------------------------------------------------------------------
|
| Expected value:
|
| data:image/png;base64,iVBORw0KGgo...
|
*/

function parseImageDataUrl(dataUrl) {
  if (
    !dataUrl ||
    typeof dataUrl !== "string"
  ) {
    const error = new Error(
      "imageDataUrl is required."
    );

    error.statusCode = 400;

    throw error;
  }

  const match = dataUrl.match(
    /^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=\s]+)$/
  );

  if (!match) {
    const error = new Error(
      "imageDataUrl must contain a valid PNG, JPEG or WebP Base64 image."
    );

    error.statusCode = 400;

    throw error;
  }

  const sourceMimeType = match[1];
  const base64Data = match[2].replace(
    /\s/g,
    ""
  );

  let imageBuffer;

  try {
    imageBuffer = Buffer.from(
      base64Data,
      "base64"
    );
  } catch {
    const error = new Error(
      "Unable to decode the submitted image."
    );

    error.statusCode = 400;

    throw error;
  }

  if (!imageBuffer.length) {
    const error = new Error(
      "The submitted image is empty."
    );

    error.statusCode = 400;

    throw error;
  }

  return {
    sourceMimeType,
    imageBuffer,
  };
}

/*
|--------------------------------------------------------------------------
| Sanitize export title
|--------------------------------------------------------------------------
*/

function sanitizeExportTitle(title) {
  const safeTitle = String(
    title || "smartwish-poster"
  )
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);

  return safeTitle || "smartwish-poster";
}

/*
|--------------------------------------------------------------------------
| Create export filename
|--------------------------------------------------------------------------
*/

function createExportFileName({
  title,
  format,
}) {
  const safeTitle =
    sanitizeExportTitle(title);

  const randomId = crypto
    .randomBytes(6)
    .toString("hex");

  const extension =
    extensionMap[format];

  return `${Date.now()}-${randomId}-${safeTitle}.${extension}`;
}

/*
|--------------------------------------------------------------------------
| Export metadata helpers
|--------------------------------------------------------------------------
*/

function getExportMimeType(format) {
  return mimeTypeMap[format];
}

function getExportAssetType(format) {
  return assetTypeMap[format];
}

function getExportExtension(format) {
  return extensionMap[format];
}

module.exports = {
  validateExportFormat,
  parseImageDataUrl,
  sanitizeExportTitle,
  createExportFileName,
  getExportMimeType,
  getExportAssetType,
  getExportExtension,
};