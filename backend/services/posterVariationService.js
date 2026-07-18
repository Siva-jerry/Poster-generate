const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const {
  createPromptVariations,
} = require("./posterPromptService");

const {
  generateAIBackgrounds,
} = require("./aiBackgroundService");

const {
  composeBirthdayPoster,
} = require("./posterCompositionService");

/*
|--------------------------------------------------------------------------
| Poster variation configuration
|--------------------------------------------------------------------------
*/

const DEFAULT_VARIATION_COUNT = 4;
const MIN_VARIATION_COUNT = 1;
const MAX_VARIATION_COUNT = 8;

const DEFAULT_POSTER_WIDTH = 1080;
const DEFAULT_POSTER_HEIGHT = 1350;

const DEFAULT_COMPOSITION_CONCURRENCY = 2;

/*
|--------------------------------------------------------------------------
| Supported poster styles
|--------------------------------------------------------------------------
*/

const SUPPORTED_STYLES = [
  "luxury",
  "royal",
  "cinematic",
  "modern",
  "floral",
  "sports",
  "neon",
  "traditional",
];

/*
|--------------------------------------------------------------------------
| Safe value helpers
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
  const parsedValue =
    Number(value);

  if (
    !Number.isFinite(
      parsedValue
    )
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

  const normalizedValue =
    String(value)
      .trim()
      .toLowerCase();

  if (
    [
      "true",
      "1",
      "yes",
      "on",
    ].includes(
      normalizedValue
    )
  ) {
    return true;
  }

  if (
    [
      "false",
      "0",
      "no",
      "off",
    ].includes(
      normalizedValue
    )
  ) {
    return false;
  }

  return fallback;
}

/*
|--------------------------------------------------------------------------
| Create generation ID
|--------------------------------------------------------------------------
*/

function createGenerationId() {
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

/*
|--------------------------------------------------------------------------
| Ensure directory exists
|--------------------------------------------------------------------------
*/

async function ensureDirectory(
  directoryPath
) {
  await fs.promises.mkdir(
    directoryPath,
    {
      recursive: true,
    }
  );

  return directoryPath;
}

/*
|--------------------------------------------------------------------------
| Validate uploaded photo
|--------------------------------------------------------------------------
*/

async function validatePhotoPath(
  photoPath
) {
  const safePhotoPath =
    toSafeString(photoPath);

  if (!safePhotoPath) {
    const error = new Error(
      "A student photo is required."
    );

    error.statusCode = 400;

    throw error;
  }

  try {
    const statistics =
      await fs.promises.stat(
        safePhotoPath
      );

    if (
      !statistics.isFile()
    ) {
      throw new Error(
        "Uploaded photo is not a valid file."
      );
    }
  } catch (error) {
    const validationError =
      new Error(
        "The uploaded student photo could not be found."
      );

    validationError.statusCode =
      400;

    validationError.cause =
      error;

    throw validationError;
  }

  return safePhotoPath;
}

/*
|--------------------------------------------------------------------------
| Normalize style
|--------------------------------------------------------------------------
*/

function normalizeStyle(
  style
) {
  const normalizedStyle =
    toSafeString(
      style,
      "luxury"
    ).toLowerCase();

  if (
    SUPPORTED_STYLES.includes(
      normalizedStyle
    )
  ) {
    return normalizedStyle;
  }

  /*
   * A custom user prompt is still supported,
   * but the closest default style rules are used.
   */
  return "luxury";
}

/*
|--------------------------------------------------------------------------
| Normalize student information
|--------------------------------------------------------------------------
*/

function normalizeStudentInfo(
  studentInfo = {}
) {
  const name =
    toSafeString(
      studentInfo.name
    );

  if (!name) {
    const error = new Error(
      "Student name is required."
    );

    error.statusCode = 400;

    throw error;
  }

  return {
    name,

    department:
      toSafeString(
        studentInfo.department
      ),

    year:
      toSafeString(
        studentInfo.year
      ),

    rollNo:
      toSafeString(
        studentInfo.rollNo
      ),

    collegeName:
      toSafeString(
        studentInfo.collegeName
      ),

    birthdayQuote:
      toSafeString(
        studentInfo.birthdayQuote,
        "Wishing you a day filled with happiness, success and unforgettable memories!"
      ),

    birthdayHeading:
      toSafeString(
        studentInfo.birthdayHeading,
        "HAPPY BIRTHDAY"
      ),

    designation:
      toSafeString(
        studentInfo.designation
      ),

    date:
      toSafeString(
        studentInfo.date
      ),

    logoPath:
      toSafeString(
        studentInfo.logoPath
      ),
  };
}

/*
|--------------------------------------------------------------------------
| Resolve palette from style
|--------------------------------------------------------------------------
*/

function resolveStylePalette(
  style,
  variationIndex
) {
  const palettes = {
    luxury: [
      {
        primary: "#D4AF37",
        secondary: "#8B5CF6",
        accent: "#FFF7D6",
        text: "#FFFFFF",
      },
      {
        primary: "#F5C451",
        secondary: "#4C1D95",
        accent: "#E9D5FF",
        text: "#FFFFFF",
      },
      {
        primary: "#C9A227",
        secondary: "#111827",
        accent: "#FDE68A",
        text: "#FFFFFF",
      },
    ],

    royal: [
      {
        primary: "#F4C95D",
        secondary: "#123A72",
        accent: "#DBEAFE",
        text: "#FFFFFF",
      },
      {
        primary: "#FFD166",
        secondary: "#3B0764",
        accent: "#EDE9FE",
        text: "#FFFFFF",
      },
    ],

    cinematic: [
      {
        primary: "#F97316",
        secondary: "#111827",
        accent: "#FDE68A",
        text: "#FFFFFF",
      },
      {
        primary: "#EF4444",
        secondary: "#030712",
        accent: "#FCA5A5",
        text: "#FFFFFF",
      },
    ],

    modern: [
      {
        primary: "#FF6B1A",
        secondary: "#7C3AED",
        accent: "#FCE7F3",
        text: "#111827",
      },
      {
        primary: "#06B6D4",
        secondary: "#8B5CF6",
        accent: "#CFFAFE",
        text: "#FFFFFF",
      },
    ],

    floral: [
      {
        primary: "#EC4899",
        secondary: "#9D174D",
        accent: "#FCE7F3",
        text: "#FFFFFF",
      },
      {
        primary: "#FB7185",
        secondary: "#7F1D1D",
        accent: "#FFF1F2",
        text: "#FFFFFF",
      },
    ],

    sports: [
      {
        primary: "#EF4444",
        secondary: "#111827",
        accent: "#FACC15",
        text: "#FFFFFF",
      },
      {
        primary: "#22C55E",
        secondary: "#052E16",
        accent: "#BBF7D0",
        text: "#FFFFFF",
      },
    ],

    neon: [
      {
        primary: "#EC4899",
        secondary: "#4C1D95",
        accent: "#22D3EE",
        text: "#FFFFFF",
      },
      {
        primary: "#A855F7",
        secondary: "#020617",
        accent: "#67E8F9",
        text: "#FFFFFF",
      },
    ],

    traditional: [
      {
        primary: "#F59E0B",
        secondary: "#7C2D12",
        accent: "#FEF3C7",
        text: "#FFFFFF",
      },
      {
        primary: "#DC2626",
        secondary: "#78350F",
        accent: "#FDE68A",
        text: "#FFFFFF",
      },
    ],
  };

  const stylePalettes =
    palettes[style] ||
    palettes.luxury;

  return stylePalettes[
    variationIndex %
      stylePalettes.length
  ];
}

/*
|--------------------------------------------------------------------------
| Resolve composition layout
|--------------------------------------------------------------------------
*/

function resolveLayout(
  variationIndex
) {
  const layouts = [
    {
      id: "portrait-right",
      photoPosition:
        "right",

      headingPosition:
        "top-left",

      detailsPosition:
        "bottom-left",

      quotePosition:
        "bottom-center",
    },

    {
      id: "portrait-center",
      photoPosition:
        "center",

      headingPosition:
        "top-center",

      detailsPosition:
        "bottom-center",

      quotePosition:
        "lower-center",
    },

    {
      id: "portrait-left",
      photoPosition:
        "left",

      headingPosition:
        "top-right",

      detailsPosition:
        "bottom-right",

      quotePosition:
        "bottom-center",
    },

    {
      id: "magazine-cover",
      photoPosition:
        "center-right",

      headingPosition:
        "top-left",

      detailsPosition:
        "middle-left",

      quotePosition:
        "bottom-left",
    },
  ];

  return layouts[
    variationIndex %
      layouts.length
  ];
}

/*
|--------------------------------------------------------------------------
| Resolve decoration preset
|--------------------------------------------------------------------------
*/

function resolveDecorationPreset(
  style,
  variationIndex
) {
  const decorationPresets = {
    luxury: [
      "gold-particles",
      "royal-light-rays",
      "premium-sparkles",
      "ornamental-corners",
    ],

    royal: [
      "gold-ornaments",
      "royal-frame",
      "soft-bokeh",
      "crown-glow",
    ],

    cinematic: [
      "light-rays",
      "lens-flare",
      "film-grain",
      "floating-particles",
    ],

    modern: [
      "glass-panels",
      "gradient-orbs",
      "abstract-lines",
      "soft-glow",
    ],

    floral: [
      "floral-corners",
      "petals",
      "soft-sparkles",
      "pastel-glow",
    ],

    sports: [
      "speed-lines",
      "halftone",
      "energy-glow",
      "motion-particles",
    ],

    neon: [
      "neon-rings",
      "light-streaks",
      "cyber-grid",
      "glowing-particles",
    ],

    traditional: [
      "festival-lights",
      "gold-ornaments",
      "rangoli-pattern",
      "warm-bokeh",
    ],
  };

  const availablePresets =
    decorationPresets[style] ||
    decorationPresets.luxury;

  return availablePresets[
    variationIndex %
      availablePresets.length
  ];
}

/*
|--------------------------------------------------------------------------
| Create public URL
|--------------------------------------------------------------------------
*/

function createPublicFileUrl({
  filename,
  requestBaseUrl,
}) {
  const safeBaseUrl =
    toSafeString(
      requestBaseUrl
    ).replace(/\/+$/, "");

  if (!safeBaseUrl) {
    return `/generated/${encodeURIComponent(
      filename
    )}`;
  }

  return (
    `${safeBaseUrl}/generated/` +
    encodeURIComponent(
      filename
    )
  );
}

/*
|--------------------------------------------------------------------------
| Delete temporary file safely
|--------------------------------------------------------------------------
*/

async function deleteFileSafely(
  filePath
) {
  if (!filePath) {
    return;
  }

  try {
    await fs.promises.unlink(
      filePath
    );
  } catch (error) {
    if (
      error.code !== "ENOENT"
    ) {
      console.warn(
        `Unable to delete temporary file: ${filePath}`,
        error.message
      );
    }
  }
}

/*
|--------------------------------------------------------------------------
| Compose multiple poster variations
|--------------------------------------------------------------------------
*/

async function composeVariations({
  backgrounds,
  photoPath,
  studentInfo,
  style,
  outputDirectory,
  requestBaseUrl,
  width,
  height,
  removeBackground,
  compositionConcurrency,
  generationId,
}) {
  const results =
    new Array(
      backgrounds.length
    );

  const safeConcurrency =
    toSafeInteger(
      compositionConcurrency,
      DEFAULT_COMPOSITION_CONCURRENCY,
      1,
      4
    );

  let currentIndex = 0;

  async function worker() {
    while (
      currentIndex <
      backgrounds.length
    ) {
      const index =
        currentIndex;

      currentIndex += 1;

      const background =
        backgrounds[index];

      const palette =
        resolveStylePalette(
          style,
          index
        );

      const layout =
        resolveLayout(index);

      const decorationPreset =
        resolveDecorationPreset(
          style,
          index
        );

      try {
        const composedPoster =
          await composeBirthdayPoster({
            backgroundPath:
              background.filePath,

            photoPath,

            studentInfo,

            outputDirectory,

            width,
            height,

            style,

            palette,

            layout,

            decorationPreset,

            removeBackground,

            variationIndex:
              index,

            variationNumber:
              index + 1,

            generationId,

            metadata: {
              backgroundId:
                background.id,

              backgroundPrompt:
                background.prompt,

              backgroundSeed:
                background.seed,

              layoutId:
                layout.id,
            },
          });

        results[index] = {
          success: true,

          id:
            composedPoster.id ||
            `${generationId}-${index + 1}`,

          variationNumber:
            index + 1,

          style,

          title:
            composedPoster.title ||
            `${style
              .charAt(0)
              .toUpperCase()}${style.slice(
              1
            )} Variation ${
              index + 1
            }`,

          filename:
            composedPoster.filename,

          filePath:
            composedPoster.filePath,

          url:
            composedPoster.url ||
            createPublicFileUrl({
              filename:
                composedPoster.filename,

              requestBaseUrl,
            }),

          previewUrl:
            composedPoster.previewUrl ||
            createPublicFileUrl({
              filename:
                composedPoster.filename,

              requestBaseUrl,
            }),

          width:
            composedPoster.width ||
            width,

          height:
            composedPoster.height ||
            height,

          mimeType:
            composedPoster.mimeType ||
            "image/png",

          sizeBytes:
            composedPoster.sizeBytes ||
            0,

          palette,

          layout,

          decorationPreset,

          background: {
            id:
              background.id,

            filename:
              background.filename,

            prompt:
              background.prompt,

            seed:
              background.seed,

            model:
              background.model,
          },

          metadata: {
            ...composedPoster.metadata,

            generationId,

            variationIndex:
              index,
          },
        };
      } catch (error) {
        results[index] = {
          success: false,

          variationNumber:
            index + 1,

          style,

          error:
            error.message ||
            "Unable to compose this poster variation.",

          background: {
            id:
              background.id,

            filename:
              background.filename,
          },
        };
      }
    }
  }

  await Promise.all(
    Array.from(
      {
        length: Math.min(
          safeConcurrency,
          backgrounds.length
        ),
      },
      () => worker()
    )
  );

  return results;
}

/*
|--------------------------------------------------------------------------
| Generate poster variations
|--------------------------------------------------------------------------
*/

async function generatePosterVariations({
  photoPath,

  studentInfo = {},

  prompt = "",

  style = "luxury",

  theme = "",

  colors = "",

  variationCount =
    DEFAULT_VARIATION_COUNT,

  width =
    DEFAULT_POSTER_WIDTH,

  height =
    DEFAULT_POSTER_HEIGHT,

  removeBackground = false,

  outputDirectory =
    path.join(
      __dirname,
      "..",
      "public",
      "generated"
    ),

  backgroundDirectory =
    path.join(
      __dirname,
      "..",
      "public",
      "generated",
      "backgrounds"
    ),

  requestBaseUrl = "",

  aiSteps = 6,

  aiConcurrency = 2,

  compositionConcurrency =
    DEFAULT_COMPOSITION_CONCURRENCY,

  cleanupBackgrounds = true,

  continueOnVariationError = true,
} = {}) {
  const startedAt =
    Date.now();

  const generationId =
    createGenerationId();

  const safePhotoPath =
    await validatePhotoPath(
      photoPath
    );

  const safeStudentInfo =
    normalizeStudentInfo(
      studentInfo
    );

  const safeStyle =
    normalizeStyle(style);

  const safeVariationCount =
    toSafeInteger(
      variationCount,
      DEFAULT_VARIATION_COUNT,
      MIN_VARIATION_COUNT,
      MAX_VARIATION_COUNT
    );

  const safeWidth =
    toSafeInteger(
      width,
      DEFAULT_POSTER_WIDTH,
      512,
      4096
    );

  const safeHeight =
    toSafeInteger(
      height,
      DEFAULT_POSTER_HEIGHT,
      512,
      4096
    );

  const shouldRemoveBackground =
    toSafeBoolean(
      removeBackground,
      false
    );

  const shouldCleanupBackgrounds =
    toSafeBoolean(
      cleanupBackgrounds,
      true
    );

  const shouldContinueOnError =
    toSafeBoolean(
      continueOnVariationError,
      true
    );

  await Promise.all([
    ensureDirectory(
      outputDirectory
    ),

    ensureDirectory(
      backgroundDirectory
    ),
  ]);

  /*
  |--------------------------------------------------------------------------
  | 1. Create AI prompt variations
  |--------------------------------------------------------------------------
  */

  const prompts =
    createPromptVariations({
      style:
        safeStyle,

      prompt:
        toSafeString(
          prompt
        ),

      theme:
        toSafeString(
          theme
        ),

      colors:
        toSafeString(
          colors
        ),

      count:
        safeVariationCount,
    });

  if (
    prompts.length === 0
  ) {
    const error = new Error(
      "No poster prompts could be generated."
    );

    error.statusCode = 500;

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | 2. Generate AI backgrounds
  |--------------------------------------------------------------------------
  */

  let backgrounds = [];

  try {
    backgrounds =
      await generateAIBackgrounds({
        prompts,

        outputDirectory:
          backgroundDirectory,

        width:
          safeWidth,

        height:
          safeHeight,

        steps:
          aiSteps,

        concurrency:
          aiConcurrency,

        metadata: {
          generationId,

          studentName:
            safeStudentInfo.name,

          style:
            safeStyle,
        },
      });
  } catch (error) {
    const generationError =
      new Error(
        `AI background generation failed: ${error.message}`
      );

    generationError.statusCode =
      error.statusCode ||
      error.status ||
      502;

    generationError.cause =
      error;

    throw generationError;
  }

  if (
    backgrounds.length === 0
  ) {
    const error = new Error(
      "The AI service did not generate any backgrounds."
    );

    error.statusCode = 502;

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | 3. Compose finished posters
  |--------------------------------------------------------------------------
  */

  let compositionResults = [];

  try {
    compositionResults =
      await composeVariations({
        backgrounds,

        photoPath:
          safePhotoPath,

        studentInfo:
          safeStudentInfo,

        style:
          safeStyle,

        outputDirectory,

        requestBaseUrl,

        width:
          safeWidth,

        height:
          safeHeight,

        removeBackground:
          shouldRemoveBackground,

        compositionConcurrency,

        generationId,
      });
  } finally {
    /*
     * Generated backgrounds are temporary
     * because the final posters already contain them.
     */
    if (
      shouldCleanupBackgrounds
    ) {
      await Promise.all(
        backgrounds.map(
          (background) =>
            deleteFileSafely(
              background.filePath
            )
        )
      );
    }
  }

  const successfulPosters =
    compositionResults.filter(
      (result) =>
        result.success
    );

  const failedVariations =
    compositionResults.filter(
      (result) =>
        !result.success
    );

  if (
    successfulPosters.length ===
      0
  ) {
    const error = new Error(
      failedVariations[0]
        ?.error ||
        "All poster variations failed during composition."
    );

    error.statusCode = 500;

    error.variations =
      failedVariations;

    throw error;
  }

  if (
    failedVariations.length >
      0 &&
    !shouldContinueOnError
  ) {
    const error = new Error(
      "One or more poster variations failed."
    );

    error.statusCode = 500;

    error.successfulPosters =
      successfulPosters;

    error.failedVariations =
      failedVariations;

    throw error;
  }

  const completedAt =
    Date.now();

  return {
    success: true,

    generationId,

    message:
      failedVariations.length >
      0
        ? `${successfulPosters.length} posters generated. ${failedVariations.length} variations failed.`
        : `${successfulPosters.length} premium posters generated successfully.`,

    style:
      safeStyle,

    prompt:
      toSafeString(
        prompt
      ),

    theme:
      toSafeString(
        theme
      ),

    colors:
      toSafeString(
        colors
      ),

    requestedVariationCount:
      safeVariationCount,

    generatedVariationCount:
      successfulPosters.length,

    failedVariationCount:
      failedVariations.length,

    width:
      safeWidth,

    height:
      safeHeight,

    student: {
      name:
        safeStudentInfo.name,

      department:
        safeStudentInfo.department,

      year:
        safeStudentInfo.year,

      rollNo:
        safeStudentInfo.rollNo,

      collegeName:
        safeStudentInfo.collegeName,
    },

    posters:
      successfulPosters,

    failures:
      failedVariations,

    prompts:
      process.env.NODE_ENV ===
      "development"
        ? prompts
        : undefined,

    timing: {
      startedAt:
        new Date(
          startedAt
        ).toISOString(),

      completedAt:
        new Date(
          completedAt
        ).toISOString(),

      durationMs:
        completedAt -
        startedAt,
    },
  };
}

/*
|--------------------------------------------------------------------------
| Service status
|--------------------------------------------------------------------------
*/

function getPosterVariationServiceStatus() {
  return {
    ready: true,

    supportedStyles: [
      ...SUPPORTED_STYLES,
    ],

    variationLimits: {
      minimum:
        MIN_VARIATION_COUNT,

      default:
        DEFAULT_VARIATION_COUNT,

      maximum:
        MAX_VARIATION_COUNT,
    },

    defaultPosterSize: {
      width:
        DEFAULT_POSTER_WIDTH,

      height:
        DEFAULT_POSTER_HEIGHT,
    },
  };
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  generatePosterVariations,

  getPosterVariationServiceStatus,

  SUPPORTED_STYLES,

  DEFAULT_VARIATION_COUNT,

  MIN_VARIATION_COUNT,

  MAX_VARIATION_COUNT,
};