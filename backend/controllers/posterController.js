const {
  generatePosterVariations,
  getPosterVariationServiceStatus,
} = require("../services/posterVariationService");

const {
  getAIBackgroundServiceStatus,
} = require("../services/aiBackgroundService");

const {
  getPosterCompositionServiceStatus,
} = require("../services/posterCompositionService");

const {
  getPosterUploadStatus,
  getPosterPhotoFile,
  getPosterLogoFile,
  cleanupPosterUploads,
} = require("../utils/posterUpload");

const {
  ensurePosterDirectories,
  getRequestBaseUrl,
  createGeneratedFileUrl,
  deleteFilesSafely,
  cleanupOldFiles,
  GENERATED_DIRECTORY,
  BACKGROUND_DIRECTORY,
  TEMP_DIRECTORY,
  PHOTO_UPLOAD_DIRECTORY,
  LOGO_UPLOAD_DIRECTORY,
} = require("../utils/posterFileUtils");

/*
|--------------------------------------------------------------------------
| Controller configuration
|--------------------------------------------------------------------------
*/

const DEFAULT_VARIATION_COUNT = 4;
const MIN_VARIATION_COUNT = 1;
const MAX_VARIATION_COUNT = 8;

const DEFAULT_POSTER_WIDTH = 1080;
const DEFAULT_POSTER_HEIGHT = 1350;

const DEFAULT_STYLE = "luxury";

/*
|--------------------------------------------------------------------------
| Safe value helpers
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

function toSafeBoolean(value, fallback = false) {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalizedValue = String(value)
    .trim()
    .toLowerCase();

  if (
    ["true", "1", "yes", "on"].includes(
      normalizedValue
    )
  ) {
    return true;
  }

  if (
    ["false", "0", "no", "off"].includes(
      normalizedValue
    )
  ) {
    return false;
  }

  return fallback;
}

/*
|--------------------------------------------------------------------------
| Async controller wrapper
|--------------------------------------------------------------------------
*/

function asyncHandler(controllerFunction) {
  return function wrappedController(
    request,
    response,
    next
  ) {
    Promise.resolve(
      controllerFunction(
        request,
        response,
        next
      )
    ).catch(next);
  };
}

/*
|--------------------------------------------------------------------------
| Request body normalization
|--------------------------------------------------------------------------
*/

function normalizePosterRequestBody(body = {}) {
  return {
    name: toSafeString(
      body.name ||
        body.studentName ||
        body.fullName
    ),

    department: toSafeString(
      body.department ||
        body.course ||
        body.branch
    ),

    year: toSafeString(
      body.year ||
        body.studyYear ||
        body.classYear
    ),

    rollNo: toSafeString(
      body.rollNo ||
        body.rollNumber ||
        body.registerNumber ||
        body.registrationNumber
    ),

    collegeName: toSafeString(
      body.collegeName ||
        body.institutionName ||
        body.organizationName
    ),

    birthdayQuote: toSafeString(
      body.birthdayQuote ||
        body.message ||
        body.quote ||
        body.wish
    ),

    birthdayHeading: toSafeString(
      body.birthdayHeading ||
        body.heading,
      "HAPPY BIRTHDAY"
    ),

    designation: toSafeString(
      body.designation ||
        body.position
    ),

    date: toSafeString(
      body.date ||
        body.birthdayDate
    ),

    prompt: toSafeString(
      body.prompt ||
        body.designPrompt ||
        body.userPrompt
    ),

    theme: toSafeString(
      body.theme
    ),

    colors: toSafeString(
      body.colors ||
        body.colorPalette ||
        body.preferredColors
    ),

    style: toSafeString(
      body.style,
      DEFAULT_STYLE
    ).toLowerCase(),

    variationCount: toSafeInteger(
      body.variationCount ||
        body.variations ||
        body.count,
      DEFAULT_VARIATION_COUNT,
      MIN_VARIATION_COUNT,
      MAX_VARIATION_COUNT
    ),

    width: toSafeInteger(
      body.width,
      DEFAULT_POSTER_WIDTH,
      512,
      4096
    ),

    height: toSafeInteger(
      body.height,
      DEFAULT_POSTER_HEIGHT,
      512,
      4096
    ),

    removeBackground: toSafeBoolean(
      body.removeBackground,
      true
    ),

    cleanupUploads: toSafeBoolean(
      body.cleanupUploads,
      true
    ),

    cleanupBackgrounds: toSafeBoolean(
      body.cleanupBackgrounds,
      true
    ),

    continueOnVariationError:
      toSafeBoolean(
        body.continueOnVariationError,
        true
      ),

    aiSteps: toSafeInteger(
      body.aiSteps,
      6,
      1,
      8
    ),

    aiConcurrency: toSafeInteger(
      body.aiConcurrency,
      2,
      1,
      4
    ),

    compositionConcurrency:
      toSafeInteger(
        body.compositionConcurrency,
        2,
        1,
        4
      ),
  };
}

/*
|--------------------------------------------------------------------------
| Validate generation request
|--------------------------------------------------------------------------
*/

function validatePosterRequest({
  normalizedBody,
  photoFile,
}) {
  const errors = [];

  if (!photoFile) {
    errors.push(
      "Student photo is required."
    );
  }

  if (!normalizedBody.name) {
    errors.push(
      "Student name is required."
    );
  }

  if (!normalizedBody.prompt) {
    errors.push(
      "Poster design prompt is required."
    );
  }

  if (
    normalizedBody.variationCount <
      MIN_VARIATION_COUNT ||
    normalizedBody.variationCount >
      MAX_VARIATION_COUNT
  ) {
    errors.push(
      `Variation count must be between ${MIN_VARIATION_COUNT} and ${MAX_VARIATION_COUNT}.`
    );
  }

  if (errors.length > 0) {
    const error = new Error(
      errors.join(" ")
    );

    error.statusCode = 400;
    error.code =
      "POSTER_VALIDATION_ERROR";
    error.validationErrors =
      errors;

    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| Convert generated posters into API responses
|--------------------------------------------------------------------------
*/

function normalizePosterResponse({
  poster,
  baseUrl,
}) {
  const filename =
    toSafeString(
      poster.filename
    );

  const posterUrl =
    poster.url ||
    createGeneratedFileUrl({
      filename,
      baseUrl,
    });

  return {
    id:
      poster.id,

    variationNumber:
      poster.variationNumber,

    title:
      poster.title,

    style:
      poster.style,

    filename,

    url:
      posterUrl,

    previewUrl:
      poster.previewUrl ||
      posterUrl,

    width:
      poster.width,

    height:
      poster.height,

    mimeType:
      poster.mimeType,

    sizeBytes:
      poster.sizeBytes,

    backgroundRemoved:
      poster.backgroundRemoved,

    palette:
      poster.palette,

    layout:
      poster.layout,

    decorationPreset:
      poster.decorationPreset,

    background:
      poster.background,

    metadata:
      poster.metadata,
  };
}

/*
|--------------------------------------------------------------------------
| POST /api/posters/generate
|--------------------------------------------------------------------------
*/

const generatePoster = asyncHandler(
  async (
    request,
    response
  ) => {
    const startedAt = Date.now();

    await ensurePosterDirectories();

    const photoFile =
      getPosterPhotoFile(
        request
      );

    const logoFile =
      getPosterLogoFile(
        request
      );

    const normalizedBody =
      normalizePosterRequestBody(
        request.body
      );

    validatePosterRequest({
      normalizedBody,
      photoFile,
    });

    const requestBaseUrl =
      getRequestBaseUrl(
        request
      );

    let generationResult = null;

    try {
      generationResult =
        await generatePosterVariations({
          photoPath:
            photoFile.path,

          studentInfo: {
            name:
              normalizedBody.name,

            department:
              normalizedBody.department,

            year:
              normalizedBody.year,

            rollNo:
              normalizedBody.rollNo,

            collegeName:
              normalizedBody.collegeName,

            birthdayQuote:
              normalizedBody.birthdayQuote,

            birthdayHeading:
              normalizedBody.birthdayHeading,

            designation:
              normalizedBody.designation,

            date:
              normalizedBody.date,

            logoPath:
              logoFile?.path || "",
          },

          prompt:
            normalizedBody.prompt,

          style:
            normalizedBody.style,

          theme:
            normalizedBody.theme,

          colors:
            normalizedBody.colors,

          variationCount:
            normalizedBody.variationCount,

          width:
            normalizedBody.width,

          height:
            normalizedBody.height,

          removeBackground:
            normalizedBody.removeBackground,

          requestBaseUrl,

          aiSteps:
            normalizedBody.aiSteps,

          aiConcurrency:
            normalizedBody.aiConcurrency,

          compositionConcurrency:
            normalizedBody
              .compositionConcurrency,

          cleanupBackgrounds:
            normalizedBody.cleanupBackgrounds,

          continueOnVariationError:
            normalizedBody
              .continueOnVariationError,
        });

      const posters =
        generationResult.posters.map(
          (poster) =>
            normalizePosterResponse({
              poster,
              baseUrl:
                requestBaseUrl,
            })
        );

      response.status(201).json({
        success: true,

        message:
          generationResult.message,

        generationId:
          generationResult.generationId,

        style:
          generationResult.style,

        prompt:
          generationResult.prompt,

        theme:
          generationResult.theme,

        colors:
          generationResult.colors,

        requestedVariationCount:
          generationResult
            .requestedVariationCount,

        generatedVariationCount:
          generationResult
            .generatedVariationCount,

        failedVariationCount:
          generationResult
            .failedVariationCount,

        posterSize: {
          width:
            generationResult.width,

          height:
            generationResult.height,
        },

        student:
          generationResult.student,

        posters,

        failures:
          generationResult.failures,

        timing: {
          ...generationResult.timing,

          controllerDurationMs:
            Date.now() -
            startedAt,
        },
      });
    } finally {
      if (
        normalizedBody
          .cleanupUploads
      ) {
        await cleanupPosterUploads(
          request
        );
      }
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/posters/status
|--------------------------------------------------------------------------
*/

const getPosterServiceStatus =
  asyncHandler(
    async (
      request,
      response
    ) => {
      await ensurePosterDirectories();

      const aiStatus =
        getAIBackgroundServiceStatus();

      const compositionStatus =
        getPosterCompositionServiceStatus();

      const variationStatus =
        getPosterVariationServiceStatus();

      const uploadStatus =
        getPosterUploadStatus();

      const ready =
        Boolean(
          aiStatus.configured &&
            compositionStatus.ready &&
            variationStatus.ready &&
            uploadStatus.ready
        );

      response.status(200).json({
        success: true,

        ready,

        service:
          "SmartWish AI Poster Generator",

        environment:
          process.env.NODE_ENV ||
          "development",

        services: {
          aiBackground:
            aiStatus,

          composition:
            compositionStatus,

          variations:
            variationStatus,

          upload:
            uploadStatus,
        },

        timestamp:
          new Date().toISOString(),
      });
    }
  );

/*
|--------------------------------------------------------------------------
| POST /api/posters/cleanup
|--------------------------------------------------------------------------
|
| Deletes old generated files and temporary uploads.
| This endpoint should be protected before production use.
|
*/

const cleanupPosterFiles =
  asyncHandler(
    async (
      request,
      response
    ) => {
      const maximumAgeHours =
        toSafeInteger(
          request.body
            ?.maximumAgeHours ||
            request.query
              ?.maximumAgeHours,
          24,
          1,
          24 * 365
        );

      const maximumAgeMs =
        maximumAgeHours *
        60 *
        60 *
        1000;

      const dryRun =
        toSafeBoolean(
          request.body?.dryRun ??
            request.query?.dryRun,
          false
        );

      const cleanupResults =
        await Promise.all([
          cleanupOldFiles({
            directoryPath:
              GENERATED_DIRECTORY,

            maximumAgeMs,

            recursive: false,

            extensions: [
              "png",
              "jpg",
              "jpeg",
              "webp",
            ],

            dryRun,
          }),

          cleanupOldFiles({
            directoryPath:
              BACKGROUND_DIRECTORY,

            maximumAgeMs,

            recursive: true,

            extensions: [
              "png",
              "jpg",
              "jpeg",
              "webp",
            ],

            dryRun,
          }),

          cleanupOldFiles({
            directoryPath:
              TEMP_DIRECTORY,

            maximumAgeMs,

            recursive: true,

            dryRun,
          }),

          cleanupOldFiles({
            directoryPath:
              PHOTO_UPLOAD_DIRECTORY,

            maximumAgeMs,

            recursive: true,

            extensions: [
              "png",
              "jpg",
              "jpeg",
              "webp",
              "gif",
              "avif",
            ],

            dryRun,
          }),

          cleanupOldFiles({
            directoryPath:
              LOGO_UPLOAD_DIRECTORY,

            maximumAgeMs,

            recursive: true,

            extensions: [
              "png",
              "jpg",
              "jpeg",
              "webp",
              "gif",
              "avif",
            ],

            dryRun,
          }),
        ]);

      const [
        posters,
        backgrounds,
        temporary,
        photos,
        logos,
      ] = cleanupResults;

      const totalDeleted =
        cleanupResults.reduce(
          (
            total,
            result
          ) =>
            total +
            Number(
              result.deleted || 0
            ),
          0
        );

      const totalFailed =
        cleanupResults.reduce(
          (
            total,
            result
          ) =>
            total +
            Number(
              result.failed || 0
            ),
          0
        );

      response.status(200).json({
        success: true,

        message: dryRun
          ? "Poster cleanup dry run completed."
          : "Poster cleanup completed.",

        dryRun,

        maximumAgeHours,

        summary: {
          deleted:
            totalDeleted,

          failed:
            totalFailed,
        },

        directories: {
          posters,
          backgrounds,
          temporary,
          photos,
          logos,
        },

        timestamp:
          new Date().toISOString(),
      });
    }
  );

/*
|--------------------------------------------------------------------------
| DELETE /api/posters/files
|--------------------------------------------------------------------------
|
| Deletes selected generated poster files.
| This endpoint should be protected before production use.
|
*/

const deletePosterFiles =
  asyncHandler(
    async (
      request,
      response
    ) => {
      const filenames =
        Array.isArray(
          request.body?.filenames
        )
          ? request.body.filenames
          : [];

      if (
        filenames.length === 0
      ) {
        const error =
          new Error(
            "At least one poster filename is required."
          );

        error.statusCode = 400;
        throw error;
      }

      const filePaths =
        filenames
          .map((filename) =>
            toSafeString(
              filename
            )
          )
          .filter(Boolean)
          .map((filename) =>
            require("path").join(
              GENERATED_DIRECTORY,
              require("path").basename(
                filename
              )
            )
          );

      const deletionResults =
        await deleteFilesSafely(
          filePaths,
          {
            allowedDirectories: [
              GENERATED_DIRECTORY,
            ],
          }
        );

      const deletedCount =
        deletionResults.filter(
          Boolean
        ).length;

      response.status(200).json({
        success: true,

        message:
          `${deletedCount} poster file(s) deleted.`,

        requested:
          filePaths.length,

        deleted:
          deletedCount,

        notDeleted:
          filePaths.length -
          deletedCount,
      });
    }
  );

/*
|--------------------------------------------------------------------------
| Error-response helper
|--------------------------------------------------------------------------
|
| Add this after your routes in server.js:
|
| app.use(posterErrorHandler);
|
*/

function posterErrorHandler(
  error,
  request,
  response,
  next
) {
  if (
    response.headersSent
  ) {
    next(error);
    return;
  }

  const statusCode =
    toSafeInteger(
      error.statusCode ||
        error.status,
      500,
      400,
      599
    );

  const isProduction =
    process.env.NODE_ENV ===
    "production";

  console.error(
    "Poster API Error:",
    {
      message:
        error.message,

      code:
        error.code,

      statusCode,

      route:
        request.originalUrl,

      method:
        request.method,

      stack:
        isProduction
          ? undefined
          : error.stack,
    }
  );

  response
    .status(statusCode)
    .json({
      success: false,

      message:
        error.message ||
        "Poster generation failed.",

      code:
        error.code ||
        "POSTER_API_ERROR",

      validationErrors:
        error.validationErrors,

      variations:
        error.variations,

      details:
        isProduction
          ? undefined
          : error.cause
            ?.message ||
            error.details,

      timestamp:
        new Date().toISOString(),
    });
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  generatePoster,

  getPosterServiceStatus,

  cleanupPosterFiles,

  deletePosterFiles,

  posterErrorHandler,

  normalizePosterRequestBody,
};