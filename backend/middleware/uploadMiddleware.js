const multer = require("multer");

const maximumUploadSizeMb =
  Number(process.env.MAX_UPLOAD_SIZE_MB) || 10;

const maximumUploadSizeBytes =
  maximumUploadSizeMb * 1024 * 1024;

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const memoryStorage = multer.memoryStorage();

function imageFileFilter(req, file, callback) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    const error = new Error(
      "Only JPEG, PNG and WebP image files are allowed."
    );

    error.statusCode = 400;

    return callback(error);
  }

  return callback(null, true);
}

const uploadImage = multer({
  storage: memoryStorage,

  limits: {
    fileSize: maximumUploadSizeBytes,
    files: 1,
  },

  fileFilter: imageFileFilter,
});

function handleSingleImageUpload(
  fieldName = "image"
) {
  return uploadImage.single(fieldName);
}

module.exports = {
  handleSingleImageUpload,
};