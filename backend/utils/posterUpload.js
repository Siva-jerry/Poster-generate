const path = require("path");
const multer = require("multer");

const {
  ensurePosterDirectories,
  PHOTO_UPLOAD_DIRECTORY,
  LOGO_UPLOAD_DIRECTORY,
  createUniqueFilename,
  validateImageFileInfo,
  deleteFilesSafely,
  getAllUploadedFiles,
} = require("./posterFileUtils");

/*
|--------------------------------------------------------------------------
| Upload configuration
|--------------------------------------------------------------------------
*/

const DEFAULT_MAX_PHOTO_SIZE =
  10 * 1024 * 1024;

const DEFAULT_MAX_LOGO_SIZE =
  5 * 1024 * 1024;

const DEFAULT_MAX_TOTAL_SIZE =
  15 * 1024 * 1024;

const PHOTO_FIELD_NAME = "photo";
const LOGO_FIELD_NAME = "logo";

/*
|--------------------------------------------------------------------------
| Ensure upload folders exist
|--------------------------------------------------------------------------
*/

ensurePosterDirectories().catch(
  (error) => {
    console.error(
      "Unable to create poster upload directories:",
      error
    );
  }
);

/*
|--------------------------------------------------------------------------
| Safe helpers
|--------------------------------------------------------------------------
*/

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

function getConfiguredPhotoLimit() {
  return toSafeInteger(
    process.env.POSTER_MAX_PHOTO_SIZE,
    DEFAULT_MAX_PHOTO_SIZE,
    1024,
    100 * 1024 * 1024
  );
}

function getConfiguredLogoLimit() {
  return toSafeInteger(
    process.env.POSTER_MAX_LOGO_SIZE,
    DEFAULT_MAX_LOGO_SIZE,
    1024,
    50 * 1024 * 1024
  );
}

function getConfiguredTotalLimit() {
  return toSafeInteger(
    process.env.POSTER_MAX_TOTAL_SIZE,
    DEFAULT_MAX_TOTAL_SIZE,
    1024,
    150 * 1024 * 1024
  );
}

/*
|--------------------------------------------------------------------------
| Resolve upload destination
|--------------------------------------------------------------------------
*/

function resolveDestination(file) {
  if (
    file.fieldname ===
    PHOTO_FIELD_NAME
  ) {
    return PHOTO_UPLOAD_DIRECTORY;
  }

  if (
    file.fieldname ===
    LOGO_FIELD_NAME
  ) {
    return LOGO_UPLOAD_DIRECTORY;
  }

  const error = new Error(
    `Unsupported upload field: ${file.fieldname}`
  );

  error.statusCode = 400;

  throw error;
}

/*
|--------------------------------------------------------------------------
| Multer disk storage
|--------------------------------------------------------------------------
*/

const storage = multer.diskStorage({
  destination(
    request,
    file,
    callback
  ) {
    try {
      const destination =
        resolveDestination(file);

      callback(
        null,
        destination
      );
    } catch (error) {
      callback(error);
    }
  },

  filename(
    request,
    file,
    callback
  ) {
    try {
      const extension =
        path.extname(
          file.originalname
        ) ||
        getExtensionFromMimeType(
          file.mimetype
        );

      const prefix =
        file.fieldname ===
        PHOTO_FIELD_NAME
          ? "student-photo"
          : "college-logo";

      const filename =
        createUniqueFilename({
          originalName:
            file.originalname ||
            `${prefix}${extension}`,

          prefix,

          extension,
        });

      callback(
        null,
        filename
      );
    } catch (error) {
      callback(error);
    }
  },
});

/*
|--------------------------------------------------------------------------
| MIME type extension fallback
|--------------------------------------------------------------------------
*/

function getExtensionFromMimeType(
  mimeType
) {
  const extensionMap = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  };

  return (
    extensionMap[
      String(mimeType)
        .trim()
        .toLowerCase()
    ] || ""
  );
}

/*
|--------------------------------------------------------------------------
| File filter
|--------------------------------------------------------------------------
*/

function posterFileFilter(
  request,
  file,
  callback
) {
  try {
    if (
      ![
        PHOTO_FIELD_NAME,
        LOGO_FIELD_NAME,
      ].includes(file.fieldname)
    ) {
      const error = new Error(
        `Unexpected upload field: ${file.fieldname}`
      );

      error.statusCode = 400;
      error.code =
        "INVALID_UPLOAD_FIELD";

      callback(error);

      return;
    }

    validateImageFileInfo({
      filename:
        file.originalname,

      mimeType:
        file.mimetype,
    });

    callback(
      null,
      true
    );
  } catch (error) {
    callback(error);
  }
}

/*
|--------------------------------------------------------------------------
| Main Multer instance
|--------------------------------------------------------------------------
*/

const posterUpload = multer({
  storage,

  fileFilter:
    posterFileFilter,

  limits: {
    files: 2,

    fileSize:
      Math.max(
        getConfiguredPhotoLimit(),
        getConfiguredLogoLimit()
      ),

    fields: 30,

    fieldNameSize: 100,

    fieldSize:
      2 * 1024 * 1024,

    parts: 35,
  },
});

/*
|--------------------------------------------------------------------------
| Upload middleware
|--------------------------------------------------------------------------
|
| Required field:
| - photo
|
| Optional field:
| - logo
|
*/

const uploadPosterAssets =
  posterUpload.fields([
    {
      name:
        PHOTO_FIELD_NAME,

      maxCount: 1,
    },

    {
      name:
        LOGO_FIELD_NAME,

      maxCount: 1,
    },
  ]);

/*
|--------------------------------------------------------------------------
| Validate uploaded file sizes separately
|--------------------------------------------------------------------------
|
| Multer's fileSize limit applies the same maximum to every file.
| This middleware adds separate limits for photo and logo.
|
*/

function validatePosterUploadSizes(
  request,
  response,
  next
) {
  const files =
    getAllUploadedFiles(
      request
    );

  const photo =
    files.find(
      (file) =>
        file.fieldName ===
        PHOTO_FIELD_NAME
    );

  const logo =
    files.find(
      (file) =>
        file.fieldName ===
        LOGO_FIELD_NAME
    );

  const photoLimit =
    getConfiguredPhotoLimit();

  const logoLimit =
    getConfiguredLogoLimit();

  const totalLimit =
    getConfiguredTotalLimit();

  const uploadedPaths =
    files
      .map(
        (file) =>
          file.filePath
      )
      .filter(Boolean);

  async function failUpload(
    message,
    statusCode = 400,
    code =
      "UPLOAD_VALIDATION_ERROR"
  ) {
    await deleteFilesSafely(
      uploadedPaths
    );

    const error =
      new Error(message);

    error.statusCode =
      statusCode;

    error.code =
      code;

    next(error);
  }

  if (!photo) {
    failUpload(
      "Student photo is required.",
      400,
      "PHOTO_REQUIRED"
    );

    return;
  }

  if (
    photo.sizeBytes >
    photoLimit
  ) {
    failUpload(
      `Student photo exceeds the ${formatFileSize(
        photoLimit
      )} limit.`,
      413,
      "PHOTO_TOO_LARGE"
    );

    return;
  }

  if (
    logo &&
    logo.sizeBytes >
      logoLimit
  ) {
    failUpload(
      `College logo exceeds the ${formatFileSize(
        logoLimit
      )} limit.`,
      413,
      "LOGO_TOO_LARGE"
    );

    return;
  }

  const totalSize =
    files.reduce(
      (
        total,
        file
      ) =>
        total +
        Number(
          file.sizeBytes || 0
        ),
      0
    );

  if (
    totalSize >
    totalLimit
  ) {
    failUpload(
      `Combined upload size exceeds the ${formatFileSize(
        totalLimit
      )} limit.`,
      413,
      "TOTAL_UPLOAD_TOO_LARGE"
    );

    return;
  }

  next();
}

/*
|--------------------------------------------------------------------------
| Multer error handler
|--------------------------------------------------------------------------
*/

async function handlePosterUploadError(
  error,
  request,
  response,
  next
) {
  if (!error) {
    next();

    return;
  }

  const files =
    getAllUploadedFiles(
      request
    );

  await deleteFilesSafely(
    files
      .map(
        (file) =>
          file.filePath
      )
      .filter(Boolean)
  );

  if (
    error instanceof
    multer.MulterError
  ) {
    const multerErrors = {
      LIMIT_FILE_SIZE:
        "One of the uploaded images is too large.",

      LIMIT_FILE_COUNT:
        "Only one student photo and one logo can be uploaded.",

      LIMIT_UNEXPECTED_FILE:
        "Unexpected upload field. Use 'photo' and optionally 'logo'.",

      LIMIT_FIELD_COUNT:
        "Too many form fields were submitted.",

      LIMIT_FIELD_KEY:
        "One of the form field names is too long.",

      LIMIT_FIELD_VALUE:
        "One of the form values is too large.",

      LIMIT_PART_COUNT:
        "Too many multipart form sections were submitted.",
    };

    error.statusCode =
      error.code ===
      "LIMIT_FILE_SIZE"
        ? 413
        : 400;

    error.message =
      multerErrors[
        error.code
      ] ||
      error.message ||
      "Poster upload failed.";

    next(error);

    return;
  }

  error.statusCode =
    error.statusCode ||
    400;

  next(error);
}

/*
|--------------------------------------------------------------------------
| Combined upload pipeline
|--------------------------------------------------------------------------
|
| Use this in routes:
|
| router.post(
|   "/generate",
|   posterUploadMiddleware,
|   generatePoster
| );
|
*/

function posterUploadMiddleware(
  request,
  response,
  next
) {
  uploadPosterAssets(
    request,
    response,
    (error) => {
      if (error) {
        handlePosterUploadError(
          error,
          request,
          response,
          next
        );

        return;
      }

      validatePosterUploadSizes(
        request,
        response,
        next
      );
    }
  );
}

/*
|--------------------------------------------------------------------------
| Optional-upload middleware
|--------------------------------------------------------------------------
|
| Useful for endpoints where a photo is not mandatory.
|
*/

const uploadOptionalPosterAssets =
  posterUpload.fields([
    {
      name:
        PHOTO_FIELD_NAME,

      maxCount: 1,
    },

    {
      name:
        LOGO_FIELD_NAME,

      maxCount: 1,
    },
  ]);

function optionalPosterUploadMiddleware(
  request,
  response,
  next
) {
  uploadOptionalPosterAssets(
    request,
    response,
    async (error) => {
      if (error) {
        await handlePosterUploadError(
          error,
          request,
          response,
          next
        );

        return;
      }

      const files =
        getAllUploadedFiles(
          request
        );

      if (
        files.length === 0
      ) {
        next();

        return;
      }

      const photo =
        files.find(
          (file) =>
            file.fieldName ===
            PHOTO_FIELD_NAME
        );

      const logo =
        files.find(
          (file) =>
            file.fieldName ===
            LOGO_FIELD_NAME
        );

      const invalidFile =
        photo?.sizeBytes >
          getConfiguredPhotoLimit() ||
        logo?.sizeBytes >
          getConfiguredLogoLimit();

      if (invalidFile) {
        await deleteFilesSafely(
          files
            .map(
              (file) =>
                file.filePath
            )
            .filter(Boolean)
        );

        const validationError =
          new Error(
            "One or more uploaded images exceed the allowed file-size limit."
          );

        validationError.statusCode =
          413;

        next(
          validationError
        );

        return;
      }

      next();
    }
  );
}

/*
|--------------------------------------------------------------------------
| Request file helpers
|--------------------------------------------------------------------------
*/

function getPosterPhotoFile(
  request
) {
  const photo =
    request?.files?.[
      PHOTO_FIELD_NAME
    ];

  if (
    Array.isArray(photo) &&
    photo.length > 0
  ) {
    return photo[0];
  }

  return null;
}

function getPosterLogoFile(
  request
) {
  const logo =
    request?.files?.[
      LOGO_FIELD_NAME
    ];

  if (
    Array.isArray(logo) &&
    logo.length > 0
  ) {
    return logo[0];
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Uploaded asset cleanup
|--------------------------------------------------------------------------
*/

async function cleanupPosterUploads(
  request
) {
  const files =
    getAllUploadedFiles(
      request
    );

  return deleteFilesSafely(
    files
      .map(
        (file) =>
          file.filePath
      )
      .filter(Boolean)
  );
}

/*
|--------------------------------------------------------------------------
| Formatting helper
|--------------------------------------------------------------------------
*/

function formatFileSize(bytes) {
  const size =
    Number(bytes);

  if (
    !Number.isFinite(size) ||
    size <= 0
  ) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];

  const unitIndex =
    Math.min(
      Math.floor(
        Math.log(size) /
          Math.log(1024)
      ),
      units.length - 1
    );

  const value =
    size /
    1024 ** unitIndex;

  return `${value.toFixed(
    unitIndex === 0
      ? 0
      : 1
  )} ${units[unitIndex]}`;
}

/*
|--------------------------------------------------------------------------
| Upload service status
|--------------------------------------------------------------------------
*/

function getPosterUploadStatus() {
  return {
    ready: true,

    fields: {
      photo: {
        fieldName:
          PHOTO_FIELD_NAME,

        required: true,

        maximumFiles: 1,

        maximumSizeBytes:
          getConfiguredPhotoLimit(),

        maximumSize:
          formatFileSize(
            getConfiguredPhotoLimit()
          ),
      },

      logo: {
        fieldName:
          LOGO_FIELD_NAME,

        required: false,

        maximumFiles: 1,

        maximumSizeBytes:
          getConfiguredLogoLimit(),

        maximumSize:
          formatFileSize(
            getConfiguredLogoLimit()
          ),
      },
    },

    maximumTotalSizeBytes:
      getConfiguredTotalLimit(),

    maximumTotalSize:
      formatFileSize(
        getConfiguredTotalLimit()
      ),

    acceptedTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ],
  };
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  posterUpload,

  posterUploadMiddleware,

  optionalPosterUploadMiddleware,

  uploadPosterAssets,

  uploadOptionalPosterAssets,

  validatePosterUploadSizes,

  handlePosterUploadError,

  cleanupPosterUploads,

  getPosterPhotoFile,

  getPosterLogoFile,

  getPosterUploadStatus,

  formatFileSize,

  PHOTO_FIELD_NAME,

  LOGO_FIELD_NAME,

  DEFAULT_MAX_PHOTO_SIZE,

  DEFAULT_MAX_LOGO_SIZE,

  DEFAULT_MAX_TOTAL_SIZE,
};