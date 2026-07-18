const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

/*
|--------------------------------------------------------------------------
| Poster composition configuration
|--------------------------------------------------------------------------
*/

const DEFAULT_POSTER_WIDTH = 1080;
const DEFAULT_POSTER_HEIGHT = 1350;

const DEFAULT_OUTPUT_FORMAT = "png";
const DEFAULT_PNG_QUALITY = 88;
const DEFAULT_JPEG_QUALITY = 88;
const DEFAULT_WEBP_QUALITY = 88;

const DEFAULT_PALETTE = {
  primary: "#D4AF37",
  secondary: "#5B21B6",
  accent: "#FFF1B8",
  text: "#FFFFFF",
};

const DEFAULT_BIRTHDAY_QUOTE =
  "Wishing you a day filled with happiness, success and unforgettable memories!";

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

function clamp(value, minimum, maximum) {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}

function normalizeBlurSigma(
  value,
  fallback = 0.6
) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return clamp(parsedValue, 0.3, 1000);
}

function escapeXml(value) {
  return toSafeString(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createPosterId() {
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

async function ensureDirectory(directoryPath) {
  await fs.promises.mkdir(
    directoryPath,
    {
      recursive: true,
    }
  );

  return directoryPath;
}

async function fileExists(filePath) {
  if (!filePath) {
    return false;
  }

  try {
    const statistics =
      await fs.promises.stat(filePath);

    return statistics.isFile();
  } catch {
    return false;
  }
}

async function deleteFileWithRetry(
  filePath,
  maximumAttempts = 4
) {
  if (!filePath) {
    return false;
  }

  for (
    let attempt = 1;
    attempt <= maximumAttempts;
    attempt += 1
  ) {
    try {
      await fs.promises.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        return false;
      }

      if (
        !["EBUSY", "EPERM"].includes(
          error.code
        ) ||
        attempt === maximumAttempts
      ) {
        return false;
      }

      await new Promise((resolve) => {
        setTimeout(
          resolve,
          attempt * 250
        );
      });
    }
  }

  return false;
}

function createSafeFilename(value) {
  const safeValue = toSafeString(
    value,
    "birthday-poster"
  )
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return safeValue || "birthday-poster";
}

function normalizeHexColor(
  value,
  fallback
) {
  const color = toSafeString(value);

  if (
    /^#[0-9a-f]{3}$/i.test(color) ||
    /^#[0-9a-f]{6}$/i.test(color) ||
    /^#[0-9a-f]{8}$/i.test(color)
  ) {
    return color;
  }

  return fallback;
}

function normalizePalette(palette = {}) {
  return {
    primary: normalizeHexColor(
      palette.primary,
      DEFAULT_PALETTE.primary
    ),

    secondary: normalizeHexColor(
      palette.secondary,
      DEFAULT_PALETTE.secondary
    ),

    accent: normalizeHexColor(
      palette.accent,
      DEFAULT_PALETTE.accent
    ),

    text: normalizeHexColor(
      palette.text,
      DEFAULT_PALETTE.text
    ),
  };
}

/*
|--------------------------------------------------------------------------
| Text measurement and wrapping
|--------------------------------------------------------------------------
*/

function estimateTextWidth(
  text,
  fontSize,
  characterRatio = 0.56
) {
  return (
    toSafeString(text).length *
    fontSize *
    characterRatio
  );
}

function splitLongWord(
  word,
  maximumCharacters
) {
  const chunks = [];

  for (
    let index = 0;
    index < word.length;
    index += maximumCharacters
  ) {
    chunks.push(
      word.slice(
        index,
        index + maximumCharacters
      )
    );
  }

  return chunks;
}

function wrapText({
  text,
  maximumWidth,
  fontSize,
  maximumLines = 3,
  characterRatio = 0.56,
  ellipsis = true,
}) {
  const safeText = toSafeString(text);

  if (!safeText) {
    return [];
  }

  const maximumCharacters = Math.max(
    4,
    Math.floor(
      maximumWidth /
        (fontSize * characterRatio)
    )
  );

  const sourceWords = safeText
    .split(/\s+/)
    .filter(Boolean);

  const words = sourceWords.flatMap(
    (word) =>
      word.length > maximumCharacters
        ? splitLongWord(
            word,
            maximumCharacters
          )
        : [word]
  );

  const lines = [];
  let currentLine = "";
  let consumedWords = 0;

  for (const word of words) {
    const candidate = currentLine
      ? `${currentLine} ${word}`
      : word;

    if (
      estimateTextWidth(
        candidate,
        fontSize,
        characterRatio
      ) <= maximumWidth
    ) {
      currentLine = candidate;
      consumedWords += 1;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    if (
      lines.length >= maximumLines
    ) {
      break;
    }

    currentLine = word;
    consumedWords += 1;
  }

  if (
    currentLine &&
    lines.length < maximumLines
  ) {
    lines.push(currentLine);
  }

  if (
    ellipsis &&
    consumedWords < words.length &&
    lines.length > 0
  ) {
    const finalIndex =
      lines.length - 1;

    let finalLine =
      lines[finalIndex];

    while (
      finalLine.length > 1 &&
      estimateTextWidth(
        `${finalLine}...`,
        fontSize,
        characterRatio
      ) > maximumWidth
    ) {
      finalLine =
        finalLine.slice(0, -1);
    }

    lines[finalIndex] =
      `${finalLine.trim()}...`;
  }

  return lines.slice(
    0,
    maximumLines
  );
}

function findFittingFontSize({
  text,
  maximumWidth,
  maximumLines = 2,
  maximumFontSize,
  minimumFontSize,
  characterRatio = 0.58,
}) {
  for (
    let fontSize = maximumFontSize;
    fontSize >= minimumFontSize;
    fontSize -= 2
  ) {
    const lines = wrapText({
      text,
      maximumWidth,
      fontSize,
      maximumLines,
      characterRatio,
      ellipsis: false,
    });

    const fits = lines.every(
      (line) =>
        estimateTextWidth(
          line,
          fontSize,
          characterRatio
        ) <= maximumWidth
    );

    const reconstructedText = lines
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    const originalText = toSafeString(
      text
    )
      .replace(/\s+/g, " ")
      .trim();

    if (
      fits &&
      reconstructedText.length >=
        originalText.length
    ) {
      return {
        fontSize,
        lines,
      };
    }
  }

  return {
    fontSize: minimumFontSize,
    lines: wrapText({
      text,
      maximumWidth,
      fontSize: minimumFontSize,
      maximumLines,
      characterRatio,
      ellipsis: true,
    }),
  };
}

function buildSvgTextLines({
  lines,
  x,
  y,
  lineHeight,
  textAnchor = "start",
  className,
}) {
  return lines
    .map((line, index) => {
      const lineY =
        y + index * lineHeight;

      return `
        <text
          x="${x}"
          y="${lineY}"
          text-anchor="${textAnchor}"
          class="${className}"
        >${escapeXml(line)}</text>
      `;
    })
    .join("\n");
}

/*
|--------------------------------------------------------------------------
| File validation
|--------------------------------------------------------------------------
*/

async function validateImageFile(
  filePath,
  label
) {
  const safePath =
    toSafeString(filePath);

  if (!safePath) {
    const error = new Error(
      `${label} is required.`
    );

    error.statusCode = 400;
    throw error;
  }

  if (!(await fileExists(safePath))) {
    const error = new Error(
      `${label} could not be found.`
    );

    error.statusCode = 400;
    throw error;
  }

  try {
    const metadata =
      await sharp(safePath).metadata();

    if (
      !metadata.width ||
      !metadata.height
    ) {
      throw new Error(
        "Invalid image dimensions."
      );
    }
  } catch (error) {
    const validationError =
      new Error(
        `${label} is not a valid image file.`
      );

    validationError.statusCode = 400;
    validationError.cause = error;

    throw validationError;
  }

  return safePath;
}

/*
|--------------------------------------------------------------------------
| Student information
|--------------------------------------------------------------------------
*/

function normalizeStudentInfo(
  studentInfo = {}
) {
  const name = toSafeString(
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

    birthdayHeading: toSafeString(
      studentInfo.birthdayHeading,
      "HAPPY BIRTHDAY"
    ).toUpperCase(),

    department: toSafeString(
      studentInfo.department
    ),

    year: toSafeString(
      studentInfo.year
    ),

    rollNo: toSafeString(
      studentInfo.rollNo
    ),

    collegeName: toSafeString(
      studentInfo.collegeName
    ),

    designation: toSafeString(
      studentInfo.designation
    ),

    birthdayQuote: toSafeString(
      studentInfo.birthdayQuote,
      DEFAULT_BIRTHDAY_QUOTE
    ),

    date: toSafeString(
      studentInfo.date
    ),

    logoPath: toSafeString(
      studentInfo.logoPath
    ),
  };
}

/*
|--------------------------------------------------------------------------
| Optional photo background removal
|--------------------------------------------------------------------------
*/

async function tryRemovePhotoBackground({
  photoPath,
  removeBackground,
  temporaryDirectory,
}) {
  if (!removeBackground) {
    return {
      photoPath,
      temporaryFile: false,
      backgroundRemoved: false,
    };
  }

  let backgroundRemovalService;

  try {
    backgroundRemovalService = require(
      "./backgroundRemovalService"
    );
  } catch {
    console.warn(
      "Background removal service was not found. Using the original photo."
    );

    return {
      photoPath,
      temporaryFile: false,
      backgroundRemoved: false,
    };
  }

  const removalFunction =
    backgroundRemovalService
      .removeImageBackground ||
    backgroundRemovalService
      .removeBackground ||
    backgroundRemovalService
      .removeBackgroundFromImage;

  if (
    typeof removalFunction !== "function"
  ) {
    console.warn(
      "Background removal service does not export a supported function."
    );

    return {
      photoPath,
      temporaryFile: false,
      backgroundRemoved: false,
    };
  }

  await ensureDirectory(
    temporaryDirectory
  );

  const outputPath = path.join(
    temporaryDirectory,
    `cutout-${createPosterId()}.png`
  );

  try {
    const result =
      await removalFunction({
        inputPath: photoPath,
        imagePath: photoPath,
        photoPath,
        outputPath,
      });

    const resolvedPath =
      typeof result === "string"
        ? result
        : result?.filePath ||
          result?.outputPath ||
          result?.path ||
          outputPath;

    if (
      !(await fileExists(resolvedPath))
    ) {
      throw new Error(
        "Background-removal output was not created."
      );
    }

    return {
      photoPath: resolvedPath,
      temporaryFile: true,
      backgroundRemoved: true,
    };
  } catch (error) {
    console.warn(
      "Background removal failed. Using the original photo:",
      error.message
    );

    return {
      photoPath,
      temporaryFile: false,
      backgroundRemoved: false,
    };
  }
}

/*
|--------------------------------------------------------------------------
| Controlled poster layout
|--------------------------------------------------------------------------
|
| Portrait and text always occupy separate safe zones.
| Center layouts are converted to left or right layouts.
|
*/

function resolveLayoutSide({
  layout = {},
  variationIndex = 0,
}) {
  const requestedPosition =
    toSafeString(
      layout.photoPosition,
      ""
    ).toLowerCase();

  if (
    requestedPosition.includes("left")
  ) {
    return "left";
  }

  if (
    requestedPosition.includes("right")
  ) {
    return "right";
  }

  return Number(variationIndex) % 2 === 0
    ? "right"
    : "left";
}

function resolvePosterLayout({
  layout = {},
  width,
  height,
  variationIndex,
  useCutout,
}) {
  const portraitSide =
    resolveLayoutSide({
      layout,
      variationIndex,
    });

  const outerMargin = Math.round(
    width * 0.055
  );

  const centerGap = Math.round(
    width * 0.045
  );

  const contentTop = Math.round(
    height * 0.14
  );

  const contentBottom = Math.round(
    height * 0.925
  );

  /*
   * Portrait is intentionally smaller than before.
   * This leaves enough room for readable text.
   */

  const portraitWidth = Math.round(
    width * (useCutout ? 0.45 : 0.43)
  );

  const portraitHeight = Math.round(
    height * (useCutout ? 0.67 : 0.62)
  );

  const portraitTop = Math.round(
    height * (useCutout ? 0.255 : 0.27)
  );

  const portraitLeft =
    portraitSide === "left"
      ? outerMargin
      : width -
        outerMargin -
        portraitWidth;

  const textLeft =
    portraitSide === "left"
      ? portraitLeft +
        portraitWidth +
        centerGap
      : outerMargin;

  const textRight =
    portraitSide === "left"
      ? width - outerMargin
      : portraitLeft - centerGap;

  const textWidth =
    textRight - textLeft;

  return {
    portraitSide,

    portrait: {
      left: portraitLeft,
      top: portraitTop,
      width: portraitWidth,
      height: portraitHeight,
    },

    text: {
      left: textLeft,
      right: textRight,
      width: textWidth,

      top: contentTop,
      bottom: contentBottom,

      paddingX: Math.round(
        width * 0.028
      ),

      paddingTop: Math.round(
        height * 0.027
      ),

      paddingBottom: Math.round(
        height * 0.025
      ),
    },
  };
}

/*
|--------------------------------------------------------------------------
| Background
|--------------------------------------------------------------------------
*/

async function prepareBackground({
  backgroundPath,
  width,
  height,
}) {
  return sharp(backgroundPath)
    .rotate()
    .resize(width, height, {
      fit: "cover",
      position: "centre",
    })
    .modulate({
      brightness: 0.82,
      saturation: 1.06,
    })
    .blur(
      normalizeBlurSigma(0.6)
    )
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .toBuffer();
}

/*
|--------------------------------------------------------------------------
| Portrait
|--------------------------------------------------------------------------
*/

async function preparePortrait({
  photoPath,
  width,
  height,
  useCutout,
}) {
  let imagePipeline = sharp(photoPath)
    .rotate()
    .resize(width, height, {
      fit: useCutout
        ? "contain"
        : "cover",

      position: useCutout
        ? "south"
        : "attention",

      background: {
        r: 0,
        g: 0,
        b: 0,
        alpha: 0,
      },

      withoutEnlargement: false,
    });

  if (!useCutout) {
    const cornerRadius = Math.round(
      Math.min(width, height) *
        0.055
    );

    const roundedMask = Buffer.from(`
      <svg
        width="${width}"
        height="${height}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="${width}"
          height="${height}"
          rx="${cornerRadius}"
          ry="${cornerRadius}"
          fill="#ffffff"
        />
      </svg>
    `);

    imagePipeline = imagePipeline
      .png()
      .composite([
        {
          input: roundedMask,
          blend: "dest-in",
        },
      ]);
  }

  return imagePipeline
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .toBuffer();
}

/*
|--------------------------------------------------------------------------
| Lighting and contrast overlay
|--------------------------------------------------------------------------
*/

function createLightingOverlay({
  width,
  height,
  palette,
  posterLayout,
}) {
  const { portrait, portraitSide } =
    posterLayout;

  const darkSide =
    portraitSide === "right"
      ? "left"
      : "right";

  return Buffer.from(`
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="bottomShade"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="#000000"
            stop-opacity="0.04"
          />

          <stop
            offset="62%"
            stop-color="#000000"
            stop-opacity="0.08"
          />

          <stop
            offset="100%"
            stop-color="#000000"
            stop-opacity="0.78"
          />
        </linearGradient>

        <linearGradient
          id="textShade"
          x1="${
            darkSide === "left"
              ? "0"
              : "1"
          }"
          y1="0"
          x2="${
            darkSide === "left"
              ? "1"
              : "0"
          }"
          y2="0"
        >
          <stop
            offset="0%"
            stop-color="#000000"
            stop-opacity="0.60"
          />

          <stop
            offset="52%"
            stop-color="#000000"
            stop-opacity="0.20"
          />

          <stop
            offset="100%"
            stop-color="#000000"
            stop-opacity="0.02"
          />
        </linearGradient>

        <radialGradient id="portraitGlow">
          <stop
            offset="0%"
            stop-color="${palette.primary}"
            stop-opacity="0.34"
          />

          <stop
            offset="48%"
            stop-color="${palette.secondary}"
            stop-opacity="0.14"
          />

          <stop
            offset="100%"
            stop-color="${palette.secondary}"
            stop-opacity="0"
          />
        </radialGradient>
      </defs>

      <rect
        width="${width}"
        height="${height}"
        fill="url(#bottomShade)"
      />

      <rect
        width="${width}"
        height="${height}"
        fill="url(#textShade)"
      />

      <ellipse
        cx="${
          portrait.left +
          portrait.width / 2
        }"
        cy="${
          portrait.top +
          portrait.height * 0.48
        }"
        rx="${portrait.width * 0.7}"
        ry="${portrait.height * 0.62}"
        fill="url(#portraitGlow)"
      />
    </svg>
  `);
}

/*
|--------------------------------------------------------------------------
| Portrait frame and shadow
|--------------------------------------------------------------------------
*/

function createPortraitShadow({
  width,
  height,
  palette,
  useCutout,
}) {
  const canvasPadding = 55;

  const radius = Math.round(
    Math.min(width, height) * 0.055
  );

  return Buffer.from(`
    <svg
      width="${width + canvasPadding * 2}"
      height="${height + canvasPadding * 2}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          id="shadow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur
            stdDeviation="${
              useCutout ? 22 : 17
            }"
          />
        </filter>

        <linearGradient
          id="frameGradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="${palette.accent}"
          />

          <stop
            offset="50%"
            stop-color="${palette.primary}"
          />

          <stop
            offset="100%"
            stop-color="${palette.secondary}"
          />
        </linearGradient>
      </defs>

      <rect
        x="${canvasPadding}"
        y="${canvasPadding}"
        width="${width}"
        height="${height}"
        rx="${useCutout ? 0 : radius}"
        fill="#000000"
        fill-opacity="${
          useCutout ? 0.45 : 0.55
        }"
        filter="url(#shadow)"
      />

      ${
        useCutout
          ? ""
          : `
            <rect
              x="${canvasPadding + 2}"
              y="${canvasPadding + 2}"
              width="${width - 4}"
              height="${height - 4}"
              rx="${radius}"
              fill="none"
              stroke="url(#frameGradient)"
              stroke-width="6"
              stroke-opacity="0.88"
            />
          `
      }
    </svg>
  `);
}

/*
|--------------------------------------------------------------------------
| Decoration overlay
|--------------------------------------------------------------------------
*/

function createDecorationOverlay({
  width,
  height,
  palette,
  decorationPreset,
  variationIndex,
  posterLayout,
}) {
  const preset = toSafeString(
    decorationPreset,
    "premium-sparkles"
  ).toLowerCase();

  const seed =
    Number(variationIndex || 0) + 1;

  const { portrait } =
    posterLayout;

  const particles = [];

  for (
    let index = 0;
    index < 30;
    index += 1
  ) {
    const x =
      (index * 137 + seed * 97) %
      width;

    const y =
      (index * 211 + seed * 149) %
      height;

    /*
     * Do not place large particles over
     * the central portrait face region.
     */

    const insidePortraitCenter =
      x > portrait.left + 45 &&
      x <
        portrait.left +
          portrait.width -
          45 &&
      y > portrait.top + 80 &&
      y <
        portrait.top +
          portrait.height * 0.65;

    if (insidePortraitCenter) {
      continue;
    }

    const radius =
      1.4 +
      ((index * 7) % 7) / 2;

    const opacity =
      0.18 +
      ((index * 13) % 45) / 100;

    particles.push(`
      <circle
        cx="${x}"
        cy="${y}"
        r="${radius}"
        fill="${
          index % 3 === 0
            ? palette.accent
            : palette.primary
        }"
        fill-opacity="${opacity}"
      />
    `);
  }

  const cornerElements = `
    <g
      fill="none"
      stroke="${palette.primary}"
    >
      <path
        d="M 34 170 L 34 34 L 170 34"
        stroke-width="5"
        stroke-opacity="0.68"
      />

      <path
        d="M ${width - 34} ${
          height - 170
        } L ${width - 34} ${
          height - 34
        } L ${width - 170} ${
          height - 34
        }"
        stroke-width="5"
        stroke-opacity="0.68"
      />

      <path
        d="M 51 140 L 51 51 L 140 51"
        stroke="${palette.accent}"
        stroke-width="2"
        stroke-opacity="0.56"
      />

      <path
        d="M ${width - 51} ${
          height - 140
        } L ${width - 51} ${
          height - 51
        } L ${width - 140} ${
          height - 51
        }"
        stroke="${palette.accent}"
        stroke-width="2"
        stroke-opacity="0.56"
      />
    </g>
  `;

  const floralElements =
    preset.includes("floral") ||
    preset.includes("petal")
      ? `
        <g
          fill="none"
          stroke="${palette.accent}"
          stroke-opacity="0.48"
        >
          <path
            d="M 0 210 C 120 60, 210 140, 285 0"
            stroke-width="6"
          />

          <path
            d="M ${width} ${
              height - 210
            } C ${width - 120} ${
              height - 40
            }, ${width - 230} ${
              height - 110
            }, ${width - 300} ${height}"
            stroke-width="6"
          />

          <ellipse
            cx="80"
            cy="160"
            rx="28"
            ry="62"
            transform="rotate(-35 80 160)"
            fill="${palette.primary}"
            fill-opacity="0.18"
          />

          <ellipse
            cx="${width - 85}"
            cy="${height - 155}"
            rx="30"
            ry="66"
            transform="rotate(35 ${
              width - 85
            } ${height - 155})"
            fill="${palette.primary}"
            fill-opacity="0.18"
          />
        </g>
      `
      : "";

  const neonElements =
    preset.includes("neon") ||
    preset.includes("cyber") ||
    preset.includes("ring")
      ? `
        <g fill="none">
          <circle
            cx="${
              posterLayout.portraitSide ===
              "right"
                ? width * 0.86
                : width * 0.14
            }"
            cy="${height * 0.2}"
            r="${width * 0.14}"
            stroke="${palette.primary}"
            stroke-width="9"
            stroke-opacity="0.24"
          />

          <circle
            cx="${
              posterLayout.portraitSide ===
              "right"
                ? width * 0.86
                : width * 0.14
            }"
            cy="${height * 0.2}"
            r="${width * 0.1}"
            stroke="${palette.accent}"
            stroke-width="4"
            stroke-opacity="0.34"
          />
        </g>
      `
      : "";

  const sportsElements =
    preset.includes("speed") ||
    preset.includes("sport") ||
    preset.includes("motion")
      ? `
        <g opacity="0.25">
          <path
            d="M -80 ${height * 0.72}
               L ${width * 0.55} ${
                 height * 0.42
               }"
            stroke="${palette.primary}"
            stroke-width="10"
          />

          <path
            d="M ${width * 0.48} ${height}
               L ${width} ${height * 0.72}"
            stroke="${palette.secondary}"
            stroke-width="18"
          />
        </g>
      `
      : "";

  return Buffer.from(`
    <svg
      width="${width}"
      height="${height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          id="particleGlow"
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur
            stdDeviation="4"
            result="blur"
          />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      ${cornerElements}
      ${floralElements}
      ${neonElements}
      ${sportsElements}

      <g filter="url(#particleGlow)">
        ${particles.join("\n")}
      </g>
    </svg>
  `);
}

/*
|--------------------------------------------------------------------------
| Text panel
|--------------------------------------------------------------------------
*/

function createTextPanelOverlay({
  width,
  height,
  textLayout,
  palette,
}) {
  const panelX = textLayout.left;
  const panelY = textLayout.top;

  const panelWidth =
    textLayout.width;

  const panelHeight =
    textLayout.bottom -
    textLayout.top;

  return Buffer.from(`
    <svg
      width="${width}"
      height="${height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="glassPanel"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="#08050B"
            stop-opacity="0.70"
          />

          <stop
            offset="62%"
            stop-color="#120B19"
            stop-opacity="0.55"
          />

          <stop
            offset="100%"
            stop-color="${palette.secondary}"
            stop-opacity="0.23"
          />
        </linearGradient>
      </defs>

      <rect
        x="${panelX}"
        y="${panelY}"
        width="${panelWidth}"
        height="${panelHeight}"
        rx="30"
        fill="url(#glassPanel)"
        stroke="${palette.accent}"
        stroke-opacity="0.20"
        stroke-width="2"
      />

      <rect
        x="${panelX + 16}"
        y="${panelY + 18}"
        width="6"
        height="${panelHeight - 36}"
        rx="3"
        fill="${palette.primary}"
        fill-opacity="0.84"
      />
    </svg>
  `);
}

/*
|--------------------------------------------------------------------------
| Typography
|--------------------------------------------------------------------------
*/

function createTypographyOverlay({
  width,
  height,
  studentInfo,
  palette,
  textLayout,
}) {
  const innerLeft =
    textLayout.left +
    textLayout.paddingX +
    14;

  const innerRight =
    textLayout.right -
    textLayout.paddingX;

  const availableWidth =
    innerRight - innerLeft;

  const textX = innerLeft;
  const textAnchor = "start";

  const headingFit =
    findFittingFontSize({
      text:
        studentInfo.birthdayHeading,
      maximumWidth:
        availableWidth,
      maximumLines: 2,
      maximumFontSize: Math.round(
        width * 0.046
      ),
      minimumFontSize: Math.round(
        width * 0.027
      ),
      characterRatio: 0.64,
    });

  const headingFontSize =
    headingFit.fontSize;

  const headingLines =
    headingFit.lines;

  const nameFit =
    findFittingFontSize({
      text:
        studentInfo.name.toUpperCase(),
      maximumWidth:
        availableWidth,
      maximumLines: 2,
      maximumFontSize: Math.round(
        width * 0.064
      ),
      minimumFontSize: Math.round(
        width * 0.037
      ),
      characterRatio: 0.61,
    });

  const nameFontSize =
    nameFit.fontSize;

  const nameLines =
    nameFit.lines;

  const collegeFontSize = clamp(
    Math.round(width * 0.019),
    17,
    24
  );

  const detailFontSize = clamp(
    Math.round(width * 0.021),
    19,
    27
  );

  const quoteFontSize = clamp(
    Math.round(width * 0.019),
    18,
    25
  );

  const dateFontSize = clamp(
    Math.round(width * 0.018),
    17,
    23
  );

  const collegeLines = wrapText({
    text: studentInfo.collegeName,
    maximumWidth: availableWidth,
    fontSize: collegeFontSize,
    maximumLines: 2,
    characterRatio: 0.57,
  });

  const details = [];

  if (studentInfo.department) {
    details.push(
      studentInfo.department.toUpperCase()
    );
  }

  if (studentInfo.year) {
    details.push(
      studentInfo.year.toUpperCase()
    );
  }

  if (studentInfo.rollNo) {
    details.push(
      `ROLL NO: ${studentInfo.rollNo}`.toUpperCase()
    );
  }

  if (studentInfo.designation) {
    details.push(
      studentInfo.designation.toUpperCase()
    );
  }

  const detailLines = [];

  for (const detail of details) {
    const wrapped = wrapText({
      text: detail,
      maximumWidth: availableWidth,
      fontSize: detailFontSize,
      maximumLines: 1,
      characterRatio: 0.57,
    });

    detailLines.push(...wrapped);

    if (detailLines.length >= 4) {
      break;
    }
  }

  const quoteLines = wrapText({
    text:
      studentInfo.birthdayQuote,
    maximumWidth:
      availableWidth - 32,
    fontSize: quoteFontSize,
    maximumLines: 4,
    characterRatio: 0.52,
  });

  /*
   * Vertical flow is calculated sequentially.
   * Every section begins after the previous section.
   */

  let cursorY =
    textLayout.top +
    textLayout.paddingTop +
    20;

  const collegeY = cursorY;

  cursorY +=
    collegeLines.length > 0
      ? collegeLines.length *
          collegeFontSize *
          1.25 +
        18
      : 0;

  const headingY = cursorY;

  const headingLineHeight =
    headingFontSize * 1.18;

  cursorY +=
    headingLines.length *
      headingLineHeight +
    25;

  const nameY = cursorY;

  const nameLineHeight =
    nameFontSize * 1.08;

  cursorY +=
    nameLines.length *
      nameLineHeight +
    30;

  const dividerY = cursorY;

  cursorY += 38;

  const detailsY = cursorY;

  const detailLineHeight =
    detailFontSize * 1.45;

  cursorY +=
    detailLines.length *
      detailLineHeight +
    28;

  /*
   * Quote is pushed toward the lower part,
   * but never outside the panel.
   */

  const quoteRequiredHeight =
    quoteLines.length *
      quoteFontSize *
      1.45 +
    70 +
    (studentInfo.date ? 42 : 0);

  const maximumQuoteStart =
    textLayout.bottom -
    textLayout.paddingBottom -
    quoteRequiredHeight;

  const quoteY = Math.max(
    cursorY,
    maximumQuoteStart
  );

  const quotePanelY =
    quoteY - 32;

  const quotePanelHeight =
    quoteLines.length *
      quoteFontSize *
      1.45 +
    58 +
    (studentInfo.date ? 40 : 0);

  const dateY =
    quoteY +
    quoteLines.length *
      quoteFontSize *
      1.45 +
    26;

  return Buffer.from(`
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="titleGradient"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop
            offset="0%"
            stop-color="${palette.accent}"
          />

          <stop
            offset="50%"
            stop-color="${palette.primary}"
          />

          <stop
            offset="100%"
            stop-color="#FFFFFF"
          />
        </linearGradient>

        <linearGradient
          id="quotePanel"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="#FFFFFF"
            stop-opacity="0.10"
          />

          <stop
            offset="100%"
            stop-color="${palette.secondary}"
            stop-opacity="0.16"
          />
        </linearGradient>

        <filter
          id="textShadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="4"
            flood-color="#000000"
            flood-opacity="0.78"
          />
        </filter>

        <filter
          id="nameShadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="4"
            flood-color="#000000"
            flood-opacity="0.90"
          />
        </filter>

        <clipPath id="textSafeArea">
          <rect
            x="${textLayout.left}"
            y="${textLayout.top}"
            width="${textLayout.width}"
            height="${
              textLayout.bottom -
              textLayout.top
            }"
            rx="30"
          />
        </clipPath>

        <style>
          .college {
            font-family:
              Arial,
              Helvetica,
              sans-serif;

            font-size:
              ${collegeFontSize}px;

            font-weight: 700;
            letter-spacing: 1.3px;
            fill: ${palette.accent};
            filter: url(#textShadow);
          }

          .birthday-heading {
            font-family:
              Georgia,
              "Times New Roman",
              serif;

            font-size:
              ${headingFontSize}px;

            font-weight: 700;
            letter-spacing: 2.5px;
            fill: url(#titleGradient);
            filter: url(#textShadow);
          }

          .student-name {
            font-family:
              Arial,
              Helvetica,
              sans-serif;

            font-size:
              ${nameFontSize}px;

            font-weight: 900;
            letter-spacing: 0.5px;
            fill: ${palette.text};
            stroke: #000000;
            stroke-width: 1.1px;
            paint-order: stroke fill;
            filter: url(#nameShadow);
          }

          .details {
            font-family:
              Arial,
              Helvetica,
              sans-serif;

            font-size:
              ${detailFontSize}px;

            font-weight: 700;
            letter-spacing: 1.1px;
            fill: ${palette.accent};
            filter: url(#textShadow);
          }

          .quote {
            font-family:
              Georgia,
              "Times New Roman",
              serif;

            font-size:
              ${quoteFontSize}px;

            font-weight: 400;
            font-style: italic;
            fill: ${palette.text};
            filter: url(#textShadow);
          }

          .date {
            font-family:
              Arial,
              Helvetica,
              sans-serif;

            font-size:
              ${dateFontSize}px;

            font-weight: 800;
            letter-spacing: 2px;
            fill: ${palette.primary};
            filter: url(#textShadow);
          }
        </style>
      </defs>

      <g clip-path="url(#textSafeArea)">
        ${buildSvgTextLines({
          lines: collegeLines,
          x: textX,
          y: collegeY,
          lineHeight:
            collegeFontSize * 1.25,
          textAnchor,
          className: "college",
        })}

        ${buildSvgTextLines({
          lines: headingLines,
          x: textX,
          y: headingY,
          lineHeight:
            headingLineHeight,
          textAnchor,
          className:
            "birthday-heading",
        })}

        ${buildSvgTextLines({
          lines: nameLines,
          x: textX,
          y: nameY,
          lineHeight:
            nameLineHeight,
          textAnchor,
          className: "student-name",
        })}

        <line
          x1="${textX}"
          y1="${dividerY}"
          x2="${
            textX +
            availableWidth * 0.68
          }"
          y2="${dividerY}"
          stroke="${palette.primary}"
          stroke-width="5"
          stroke-linecap="round"
        />

        <line
          x1="${
            textX +
            availableWidth * 0.71
          }"
          y1="${dividerY}"
          x2="${
            textX +
            availableWidth * 0.82
          }"
          y2="${dividerY}"
          stroke="${palette.accent}"
          stroke-width="2"
          stroke-linecap="round"
        />

        ${buildSvgTextLines({
          lines: detailLines,
          x: textX,
          y: detailsY,
          lineHeight:
            detailLineHeight,
          textAnchor,
          className: "details",
        })}

        ${
          quoteLines.length > 0
            ? `
              <rect
                x="${textX - 10}"
                y="${quotePanelY}"
                width="${
                  availableWidth + 8
                }"
                height="${quotePanelHeight}"
                rx="18"
                fill="url(#quotePanel)"
                stroke="${palette.accent}"
                stroke-opacity="0.15"
              />

              <text
                x="${textX + 10}"
                y="${quoteY - 4}"
                font-family="Georgia, serif"
                font-size="${
                  quoteFontSize * 1.75
                }"
                fill="${palette.primary}"
                fill-opacity="0.82"
              >“</text>

              ${buildSvgTextLines({
                lines: quoteLines,
                x: textX + 30,
                y: quoteY,
                lineHeight:
                  quoteFontSize * 1.45,
                textAnchor,
                className: "quote",
              })}
            `
            : ""
        }

        ${
          studentInfo.date
            ? `
              <text
                x="${textX + 30}"
                y="${dateY}"
                text-anchor="start"
                class="date"
              >${escapeXml(
                studentInfo.date
              )}</text>
            `
            : ""
        }
      </g>
    </svg>
  `);
}

/*
|--------------------------------------------------------------------------
| Footer
|--------------------------------------------------------------------------
*/

function createFooterOverlay({
  width,
  height,
  palette,
}) {
  return Buffer.from(`
    <svg
      width="${width}"
      height="${height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="footerLine"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop
            offset="0%"
            stop-color="${palette.primary}"
            stop-opacity="0"
          />

          <stop
            offset="50%"
            stop-color="${palette.primary}"
            stop-opacity="0.85"
          />

          <stop
            offset="100%"
            stop-color="${palette.primary}"
            stop-opacity="0"
          />
        </linearGradient>
      </defs>

      <line
        x1="${width * 0.1}"
        y1="${height * 0.95}"
        x2="${width * 0.9}"
        y2="${height * 0.95}"
        stroke="url(#footerLine)"
        stroke-width="2"
      />

      <text
        x="${width / 2}"
        y="${height * 0.974}"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${Math.round(
          width * 0.014
        )}"
        font-weight="700"
        letter-spacing="3"
        fill="#FFFFFF"
        fill-opacity="0.68"
      >CELEBRATE • INSPIRE • SHINE</text>
    </svg>
  `);
}

/*
|--------------------------------------------------------------------------
| Logo preparation
|--------------------------------------------------------------------------
*/

async function prepareLogo({
  logoPath,
  width,
}) {
  if (
    !logoPath ||
    !(await fileExists(logoPath))
  ) {
    return null;
  }

  try {
    const logoSize = Math.round(
      width * 0.095
    );

    return await sharp(logoPath)
      .rotate()
      .resize(
        logoSize,
        logoSize,
        {
          fit: "contain",

          background: {
            r: 255,
            g: 255,
            b: 255,
            alpha: 0,
          },
        }
      )
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toBuffer();
  } catch (error) {
    console.warn(
      "Unable to process college logo:",
      error.message
    );

    return null;
  }
}

function resolveLogoPosition({
  width,
  height,
  posterLayout,
  logoBuffer,
}) {
  if (!logoBuffer) {
    return null;
  }

  const logoSize = Math.round(
    width * 0.095
  );

  /*
   * Logo is placed above the portrait side,
   * away from the text panel.
   */

  const left =
    posterLayout.portraitSide ===
    "right"
      ? width -
        Math.round(width * 0.055) -
        logoSize
      : Math.round(width * 0.055);

  return {
    left: clamp(
      left,
      0,
      width - logoSize
    ),

    top: Math.round(
      height * 0.038
    ),
  };
}

/*
|--------------------------------------------------------------------------
| Compose birthday poster
|--------------------------------------------------------------------------
*/

async function composeBirthdayPoster({
  backgroundPath,

  photoPath,

  studentInfo = {},

  outputDirectory = path.join(
    __dirname,
    "..",
    "public",
    "generated"
  ),

  width = DEFAULT_POSTER_WIDTH,

  height = DEFAULT_POSTER_HEIGHT,

  style = "luxury",

  palette = DEFAULT_PALETTE,

  layout = {},

  decorationPreset =
    "premium-sparkles",

  removeBackground = false,

  variationIndex = 0,

  variationNumber = 1,

  generationId = "",

  outputFormat =
    DEFAULT_OUTPUT_FORMAT,

  metadata = {},
} = {}) {
  const startedAt = Date.now();

  const safeBackgroundPath =
    await validateImageFile(
      backgroundPath,
      "AI background image"
    );

  const safePhotoPath =
    await validateImageFile(
      photoPath,
      "Student photo"
    );

  const safeStudentInfo =
    normalizeStudentInfo(
      studentInfo
    );

  const safeWidth = toSafeInteger(
    width,
    DEFAULT_POSTER_WIDTH,
    512,
    4096
  );

  const safeHeight = toSafeInteger(
    height,
    DEFAULT_POSTER_HEIGHT,
    512,
    4096
  );

  const safePalette =
    normalizePalette(palette);

  const requestedFormat =
    toSafeString(
      outputFormat,
      DEFAULT_OUTPUT_FORMAT
    ).toLowerCase();

  const safeFormat = [
    "png",
    "jpeg",
    "jpg",
    "webp",
  ].includes(requestedFormat)
    ? requestedFormat
    : DEFAULT_OUTPUT_FORMAT;

  const normalizedFormat =
    safeFormat === "jpg"
      ? "jpeg"
      : safeFormat;

  const fileExtension =
    normalizedFormat === "jpeg"
      ? "jpg"
      : normalizedFormat;

  const posterId = createPosterId();

  const safeGenerationId =
    createSafeFilename(
      generationId || posterId
    );

  const safeStudentName =
    createSafeFilename(
      safeStudentInfo.name
    );

  const safeVariationNumber =
    toSafeInteger(
      variationNumber,
      1,
      1,
      999
    );

  const safeVariationIndex =
    toSafeInteger(
      variationIndex,
      0,
      0,
      999
    );

  const filename =
    [
      "birthday-poster",
      safeStudentName,
      safeGenerationId,
      `v${safeVariationNumber}`,
      posterId.slice(0, 8),
    ].join("-") +
    `.${fileExtension}`;

  await ensureDirectory(
    outputDirectory
  );

  const outputPath = path.join(
    outputDirectory,
    filename
  );

  const temporaryDirectory =
    path.join(
      outputDirectory,
      ".temp"
    );

  const backgroundRemovalResult =
    await tryRemovePhotoBackground({
      photoPath: safePhotoPath,

      removeBackground:
        toSafeBoolean(
          removeBackground,
          false
        ),

      temporaryDirectory,
    });

  const preparedPhotoPath =
    backgroundRemovalResult.photoPath;

  const posterLayout =
    resolvePosterLayout({
      layout,
      width: safeWidth,
      height: safeHeight,
      variationIndex:
        safeVariationIndex,
      useCutout:
        backgroundRemovalResult
          .backgroundRemoved,
    });

  const photoLayout =
    posterLayout.portrait;

  const textLayout =
    posterLayout.text;

  try {
    const [
      backgroundBuffer,
      portraitBuffer,
      logoBuffer,
    ] = await Promise.all([
      prepareBackground({
        backgroundPath:
          safeBackgroundPath,

        width: safeWidth,
        height: safeHeight,
      }),

      preparePortrait({
        photoPath:
          preparedPhotoPath,

        width:
          photoLayout.width,

        height:
          photoLayout.height,

        useCutout:
          backgroundRemovalResult
            .backgroundRemoved,
      }),

      prepareLogo({
        logoPath:
          safeStudentInfo.logoPath,

        width: safeWidth,
      }),
    ]);

    const lightingOverlay =
      createLightingOverlay({
        width: safeWidth,
        height: safeHeight,
        palette: safePalette,
        posterLayout,
      });

    const decorationOverlay =
      createDecorationOverlay({
        width: safeWidth,
        height: safeHeight,
        palette: safePalette,
        decorationPreset,
        variationIndex:
          safeVariationIndex,
        posterLayout,
      });

    const textPanelOverlay =
      createTextPanelOverlay({
        width: safeWidth,
        height: safeHeight,
        textLayout,
        palette: safePalette,
      });

    const typographyOverlay =
      createTypographyOverlay({
        width: safeWidth,
        height: safeHeight,
        studentInfo:
          safeStudentInfo,
        palette: safePalette,
        textLayout,
      });

    const footerOverlay =
      createFooterOverlay({
        width: safeWidth,
        height: safeHeight,
        palette: safePalette,
      });

    const portraitShadow =
      createPortraitShadow({
        width: photoLayout.width,
        height: photoLayout.height,
        palette: safePalette,

        useCutout:
          backgroundRemovalResult
            .backgroundRemoved,
      });

    const shadowPadding = 55;

    const composites = [
      {
        input: lightingOverlay,
        left: 0,
        top: 0,
      },

      {
        input: decorationOverlay,
        left: 0,
        top: 0,
      },

      {
        input: textPanelOverlay,
        left: 0,
        top: 0,
      },

      {
        input: portraitShadow,

        left: clamp(
          photoLayout.left -
            shadowPadding,
          0,
          safeWidth -
            (photoLayout.width +
              shadowPadding * 2)
        ),

        top: clamp(
          photoLayout.top -
            shadowPadding,
          0,
          safeHeight -
            (photoLayout.height +
              shadowPadding * 2)
        ),
      },

      {
        input: portraitBuffer,
        left: photoLayout.left,
        top: photoLayout.top,
      },
    ];

    const logoPosition =
      resolveLogoPosition({
        width: safeWidth,
        height: safeHeight,
        posterLayout,
        logoBuffer,
      });

    if (
      logoBuffer &&
      logoPosition
    ) {
      composites.push({
        input: logoBuffer,
        left: logoPosition.left,
        top: logoPosition.top,
      });
    }

    /*
     * Typography is intentionally added last,
     * but it is clipped inside the text panel.
     */

    composites.push(
      {
        input: typographyOverlay,
        left: 0,
        top: 0,
      },

      {
        input: footerOverlay,
        left: 0,
        top: 0,
      }
    );

    let finalPipeline =
      sharp(backgroundBuffer)
        .composite(composites);

    if (
      normalizedFormat === "jpeg"
    ) {
      finalPipeline =
        finalPipeline.jpeg({
          quality:
            DEFAULT_JPEG_QUALITY,

          chromaSubsampling:
            "4:4:4",

          mozjpeg: true,
        });
    } else if (
      normalizedFormat === "webp"
    ) {
      finalPipeline =
        finalPipeline.webp({
          quality:
            DEFAULT_WEBP_QUALITY,

          effort: 6,
          smartSubsample: true,
        });
    } else {
      /*
       * Palette mode significantly reduces PNG size.
       * It remains suitable for web poster previews
       * and downloads.
       */

      finalPipeline =
        finalPipeline.png({
          quality:
            DEFAULT_PNG_QUALITY,

          compressionLevel: 9,
          adaptiveFiltering: true,

          palette: true,
          colours: 256,
          effort: 10,

          dither: 0.85,
        });
    }

    await finalPipeline.toFile(
      outputPath
    );

    const [
      fileStatistics,
      outputMetadata,
    ] = await Promise.all([
      fs.promises.stat(outputPath),

      sharp(outputPath).metadata(),
    ]);

    const completedAt =
      Date.now();

    return {
      success: true,

      id: posterId,

      title:
        `${safeStudentInfo.name} Birthday Poster`,

      filename,

      filePath: outputPath,

      relativePath: path
        .relative(
          path.join(
            __dirname,
            ".."
          ),
          outputPath
        )
        .replace(/\\/g, "/"),

      width:
        outputMetadata.width ||
        safeWidth,

      height:
        outputMetadata.height ||
        safeHeight,

      mimeType:
        normalizedFormat === "jpeg"
          ? "image/jpeg"
          : `image/${normalizedFormat}`,

      sizeBytes:
        fileStatistics.size,

      style: toSafeString(
        style,
        "luxury"
      ),

      palette: safePalette,

      layout: {
        ...layout,

        controlledLayout: true,

        portraitSide:
          posterLayout.portraitSide,

        photo: photoLayout,

        text: textLayout,
      },

      decorationPreset:
        toSafeString(
          decorationPreset
        ),

      backgroundRemoved:
        backgroundRemovalResult
          .backgroundRemoved,

      variationIndex:
        safeVariationIndex,

      variationNumber:
        safeVariationNumber,

      generationId:
        toSafeString(
          generationId
        ),

      metadata: {
        ...metadata,

        studentName:
          safeStudentInfo.name,

        department:
          safeStudentInfo.department,

        collegeName:
          safeStudentInfo.collegeName,

        outputFormat:
          normalizedFormat,

        compressedOutput: true,

        textSafeZone: true,

        controlledPortraitSize: true,

        processingDurationMs:
          completedAt - startedAt,

        createdAt:
          new Date(
            completedAt
          ).toISOString(),
      },
    };
  } catch (error) {
    await deleteFileWithRetry(
      outputPath
    );

    const compositionError =
      new Error(
        `Unable to compose birthday poster: ${error.message}`
      );

    compositionError.statusCode =
      error.statusCode ||
      error.status ||
      500;

    compositionError.cause =
      error;

    throw compositionError;
  } finally {
    if (
      backgroundRemovalResult
        .temporaryFile
    ) {
      await deleteFileWithRetry(
        backgroundRemovalResult
          .photoPath
      );
    }
  }
}

/*
|--------------------------------------------------------------------------
| Service status
|--------------------------------------------------------------------------
*/

function getPosterCompositionServiceStatus() {
  return {
    ready: true,

    engine: "sharp",

    supportedOutputFormats: [
      "png",
      "jpeg",
      "webp",
    ],

    defaultOutputFormat:
      DEFAULT_OUTPUT_FORMAT,

    defaultPosterSize: {
      width: DEFAULT_POSTER_WIDTH,
      height: DEFAULT_POSTER_HEIGHT,
    },

    compression: {
      pngQuality:
        DEFAULT_PNG_QUALITY,

      jpegQuality:
        DEFAULT_JPEG_QUALITY,

      webpQuality:
        DEFAULT_WEBP_QUALITY,

      palettePng: true,
    },

    features: {
      aiBackground: true,
      studentPhoto: true,

      optionalBackgroundRemoval:
        true,

      premiumLighting: true,
      decorativeOverlays: true,
      dynamicTypography: true,
      collegeLogo: true,
      multipleLayouts: true,

      controlledTextSafeZone:
        true,

      automaticNameSizing:
        true,

      automaticTextWrapping:
        true,

      reducedPortraitSize:
        true,

      compressedOutput:
        true,
    },
  };
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  composeBirthdayPoster,

  getPosterCompositionServiceStatus,

  DEFAULT_POSTER_WIDTH,

  DEFAULT_POSTER_HEIGHT,

  DEFAULT_PALETTE,
};