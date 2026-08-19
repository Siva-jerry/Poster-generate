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

function wrapText({
  text,
  maximumWidth,
  fontSize,
  maximumLines = 3,
  characterRatio = 0.56,
  ellipsis = false,
}) {
  const safeText = toSafeString(text).replace(/\s+/g, " ").trim();

  if (!safeText) {
    return [];
  }

  const words = safeText.split(" ").filter(Boolean);
  const lines = [];
  let currentLine = "";
  let consumedWords = 0;

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (
      estimateTextWidth(candidate, fontSize, characterRatio) <= maximumWidth
    ) {
      currentLine = candidate;
      consumedWords += 1;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    if (lines.length >= maximumLines) {
      break;
    }

    currentLine = word;
    consumedWords += 1;
  }

  if (currentLine && lines.length < maximumLines) {
    lines.push(currentLine);
  }

  if (
    ellipsis &&
    consumedWords < words.length &&
    lines.length > 0
  ) {
    const finalIndex = lines.length - 1;
    let finalLine = lines[finalIndex];

    while (
      finalLine.length > 1 &&
      estimateTextWidth(
        `${finalLine}...`,
        fontSize,
        characterRatio
      ) > maximumWidth
    ) {
      finalLine = finalLine.slice(0, -1);
    }

    lines[finalIndex] = `${finalLine.trim()}...`;
  }

  return lines.slice(0, maximumLines);
}

function findFittingFontSize({
  text,
  maximumWidth,
  maximumLines = 2,
  maximumFontSize,
  minimumFontSize = 16,
  characterRatio = 0.58,
}) {
  const safeText = toSafeString(text).replace(/\s+/g, " ").trim();
  const words = safeText.split(" ").filter(Boolean);

  if (!words.length) {
    return { fontSize: minimumFontSize, lines: [] };
  }

  for (
    let fontSize = maximumFontSize;
    fontSize >= minimumFontSize;
    fontSize -= 1
  ) {
    // 1. Ensure the longest individual word fits on one line without overflow
    const longestWordWidth = Math.max(
      ...words.map((w) => estimateTextWidth(w, fontSize, characterRatio))
    );

    if (longestWordWidth > maximumWidth) {
      continue; // Font size too large for individual word, reduce!
    }

    // 2. Wrap into lines
    const lines = wrapText({
      text: safeText,
      maximumWidth,
      fontSize,
      maximumLines,
      characterRatio,
      ellipsis: false,
    });

    // 3. Verify all words are accounted for and fit inside maximumLines
    const totalWordsRendered = lines.join(" ").split(" ").filter(Boolean).length;

    if (
      totalWordsRendered === words.length &&
      lines.length <= maximumLines
    ) {
      const allLinesFit = lines.every(
        (line) => estimateTextWidth(line, fontSize, characterRatio) <= maximumWidth
      );

      if (allLinesFit) {
        return {
          fontSize,
          lines,
        };
      }
    }
  }

  // Graceful fallback at minimum font size
  const fallbackLines = wrapText({
    text: safeText,
    maximumWidth,
    fontSize: minimumFontSize,
    maximumLines,
    characterRatio,
    ellipsis: false,
  });

  return {
    fontSize: minimumFontSize,
    lines: fallbackLines.length > 0 ? fallbackLines : [safeText],
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
  style = "",
  width,
  height,
  variationIndex = 0,
  useCutout,
}) {
  const index = Number(variationIndex || 0);

  // Cycle through 4 distinctly different, high-impact design archetypes
  const ARCHETYPES = [
    "center-stage",      // Variation 1: Royal Grand Felicitation (Symmetrical Gold & Velvet)
    "asymmetric-split",  // Variation 2: Mass Hero Cinema Blockbuster (Dynamic Split Magazine)
    "varsity-shield",    // Variation 3: Varsity Shield & Champion Gold (Academic Honors)
    "minimal-editorial", // Variation 4: Modern Luxury Editorial / Vogue Minimal (High-Fashion Cover)
  ];

  let archetype = layout?.archetype || "";
  if (!archetype) {
    archetype = ARCHETYPES[index % ARCHETYPES.length];
  }

  // --- 1. ASYMMETRIC SPLIT (Dynamic Left Typography, Right Full-Height Hero) ---
  if (archetype === "asymmetric-split") {
    const portraitWidth = Math.round(width * 0.58);
    const portraitHeight = Math.round(height * 0.90);
    const portraitTop = Math.round(height * 0.08);
    const portraitLeft = Math.round(width * 0.42);

    return {
      archetype: "asymmetric-split",
      portraitSide: "right",
      portrait: {
        left: portraitLeft,
        top: portraitTop,
        width: portraitWidth,
        height: portraitHeight,
      },
      text: {
        left: Math.round(width * 0.05),
        right: Math.round(width * 0.44),
        width: Math.round(width * 0.39),
        top: Math.round(height * 0.08),
        bottom: Math.round(height * 0.96),
        paddingX: 16,
        paddingTop: 16,
        paddingBottom: 16,
      },
    };
  }

  // --- 2. VARSITY SHIELD (Academic Crest & Honors) ---
  if (archetype === "varsity-shield") {
    const portraitWidth = Math.round(width * 0.62);
    const portraitHeight = Math.round(height * 0.48);
    const portraitTop = Math.round(height * 0.16);
    const portraitLeft = Math.round((width - portraitWidth) / 2);

    return {
      archetype: "varsity-shield",
      portraitSide: "center",
      portrait: {
        left: portraitLeft,
        top: portraitTop,
        width: portraitWidth,
        height: portraitHeight,
      },
      text: {
        left: Math.round(width * 0.05),
        right: Math.round(width * 0.95),
        width: Math.round(width * 0.90),
        top: Math.round(height * 0.63),
        bottom: Math.round(height * 0.98),
        paddingX: 20,
        paddingTop: 14,
        paddingBottom: 14,
      },
    };
  }

  // --- 3. MINIMAL EDITORIAL (Vogue / High-Fashion Magazine Cover) ---
  if (archetype === "minimal-editorial") {
    const portraitWidth = Math.round(width * 0.70);
    const portraitHeight = Math.round(height * 0.54);
    const portraitTop = Math.round(height * 0.14);
    const portraitLeft = Math.round((width - portraitWidth) / 2);

    return {
      archetype: "minimal-editorial",
      portraitSide: "center",
      portrait: {
        left: portraitLeft,
        top: portraitTop,
        width: portraitWidth,
        height: portraitHeight,
      },
      text: {
        left: Math.round(width * 0.05),
        right: Math.round(width * 0.95),
        width: Math.round(width * 0.90),
        top: Math.round(height * 0.65),
        bottom: Math.round(height * 0.98),
        paddingX: 20,
        paddingTop: 14,
        paddingBottom: 14,
      },
    };
  }

  // --- 4. CENTER STAGE (Royal Grand Felicitation - Symmetrical Gold & Velvet Flex) ---
  const portraitWidth = Math.round(width * 0.68);
  const portraitHeight = Math.round(height * 0.52);
  const portraitTop = Math.round(height * 0.13);
  const portraitLeft = Math.round((width - portraitWidth) / 2);

  return {
    archetype: "center-stage",
    portraitSide: "center",
    portrait: {
      left: portraitLeft,
      top: portraitTop,
      width: portraitWidth,
      height: portraitHeight,
    },
    text: {
      left: Math.round(width * 0.04),
      right: Math.round(width * 0.96),
      width: Math.round(width * 0.92),
      top: Math.round(height * 0.62),
      bottom: Math.round(height * 0.98),
      paddingX: 20,
      paddingTop: 14,
      paddingBottom: 14,
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
      brightness: 0.85,
      saturation: 1.08,
    })
    .blur(
      normalizeBlurSigma(0.5)
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
  let imagePipeline = sharp(photoPath).rotate();

  if (useCutout) {
    try {
      imagePipeline = imagePipeline.trim();
    } catch {
      // Ignore if image cannot be trimmed
    }

    imagePipeline = imagePipeline.resize(width, height, {
      fit: "contain",
      position: "centre",
      background: {
        r: 0,
        g: 0,
        b: 0,
        alpha: 0,
      },
      withoutEnlargement: false,
    });
  } else {
    imagePipeline = imagePipeline.resize(width, height, {
      fit: "cover",
      position: "attention",
      background: {
        r: 0,
        g: 0,
        b: 0,
        alpha: 0,
      },
      withoutEnlargement: false,
    });

    const cornerRadius = Math.round(
      Math.min(width, height) * 0.055
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
| Seamless Atmospheric Vignette & Contrast Overlay (NO UGLY BOXES!)
|--------------------------------------------------------------------------
*/

function createLightingOverlay({
  width,
  height,
  palette,
  posterLayout,
}) {
  const { portrait, portraitSide } = posterLayout;
  const isSplit = portraitSide === "right";

  return Buffer.from(`
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- Seamless Smooth Bottom Vignette Gradient for Symmetrical Posters -->
        <linearGradient id="bottomSmoothVignette" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.0" />
          <stop offset="42%" stop-color="#000000" stop-opacity="0.0" />
          <stop offset="58%" stop-color="#05020A" stop-opacity="0.45" />
          <stop offset="72%" stop-color="#080310" stop-opacity="0.82" />
          <stop offset="88%" stop-color="#05020A" stop-opacity="0.96" />
          <stop offset="100%" stop-color="#020105" stop-opacity="0.99" />
        </linearGradient>

        <!-- Seamless Smooth Left Scrim Gradient for Split Posters -->
        <linearGradient id="leftSmoothScrim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#05020A" stop-opacity="0.96" />
          <stop offset="38%" stop-color="#05020A" stop-opacity="0.90" />
          <stop offset="52%" stop-color="#05020A" stop-opacity="0.55" />
          <stop offset="68%" stop-color="#05020A" stop-opacity="0.10" />
          <stop offset="100%" stop-color="#05020A" stop-opacity="0.0" />
        </linearGradient>

        <!-- Top Header Scrim for Crisp College Banner -->
        <linearGradient id="topSmoothScrim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#030107" stop-opacity="0.85" />
          <stop offset="80%" stop-color="#030107" stop-opacity="0.50" />
          <stop offset="100%" stop-color="#030107" stop-opacity="0.0" />
        </linearGradient>

        <!-- Ambient Radial Glow behind the Hero Cutout -->
        <radialGradient id="portraitHeroGlow">
          <stop offset="0%" stop-color="${palette.primary}" stop-opacity="0.45" />
          <stop offset="45%" stop-color="${palette.secondary}" stop-opacity="0.20" />
          <stop offset="100%" stop-color="${palette.secondary}" stop-opacity="0.0" />
        </radialGradient>
      </defs>

      <!-- 1. Ambient Hero Backlight -->
      <ellipse
        cx="${portrait.left + portrait.width / 2}"
        cy="${portrait.top + portrait.height * 0.48}"
        rx="${portrait.width * 0.65}"
        ry="${portrait.height * 0.58}"
        fill="url(#portraitHeroGlow)"
      />

      <!-- 2. Top Header Scrim -->
      <rect x="0" y="0" width="${width}" height="140" fill="url(#topSmoothScrim)" />

      <!-- 3. Lower / Left Seamless Vignette -->
      ${
        isSplit
          ? `<rect width="${width}" height="${height}" fill="url(#leftSmoothScrim)" />`
          : `<rect width="${width}" height="${height}" fill="url(#bottomSmoothVignette)" />`
      }
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
    </svg>
  `);
}

/*
|--------------------------------------------------------------------------
| Decoration overlay (Sparkles & Celestial Flares)
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
  const seed = Number(variationIndex || 0) + 1;
  const { portrait } = posterLayout;

  const particles = [];

  for (let index = 0; index < 28; index += 1) {
    const x = (index * 137 + seed * 97) % width;
    const y = (index * 211 + seed * 149) % height;

    const insidePortraitCenter =
      x > portrait.left + 50 &&
      x < portrait.left + portrait.width - 50 &&
      y > portrait.top + 80 &&
      y < portrait.top + portrait.height * 0.70;

    if (insidePortraitCenter) {
      continue;
    }

    const radius = (index % 3) + 1.6;
    const opacity = (0.25 + ((index % 6) / 6) * 0.65).toFixed(2);
    const fill = index % 3 === 0 ? palette.accent : index % 2 === 0 ? palette.primary : "#FFFFFF";

    particles.push(`
      <circle
        cx="${x}"
        cy="${y}"
        r="${radius}"
        fill="${fill}"
        fill-opacity="${opacity}"
      />
    `);
  }

  return Buffer.from(`
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="particleGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#particleGlow)">
        ${particles.join("\n")}
      </g>
    </svg>
  `);
}

/*
|--------------------------------------------------------------------------
| Text panel overlay
|--------------------------------------------------------------------------
*/

function createTextPanelOverlay({
  width,
  height,
  textLayout,
  palette,
}) {
  return Buffer.from(`
    <svg
      width="${width}"
      height="${height}"
      xmlns="http://www.w3.org/2000/svg"
    ></svg>
  `);
}

/*
|--------------------------------------------------------------------------
| Master Typography & Ornate Graphic Overlays (4 Distinct Pro Archetypes)
|--------------------------------------------------------------------------
*/

function createTypographyOverlay({
  width,
  height,
  studentInfo,
  palette,
  textLayout,
}) {
  const archetype = textLayout?.archetype || "center-stage";

  // Common sanitized text variables
  const rawCollege = (studentInfo.collegeName || "").toUpperCase();
  const rawHeading = (studentInfo.birthdayHeading || "HAPPY BIRTHDAY").toUpperCase();
  const rawName = (studentInfo.name || "").toUpperCase();
  const rawDept = (studentInfo.department || "").toUpperCase();
  const rawQuote = studentInfo.birthdayQuote || "";
  const rawDate = (studentInfo.date || "").toUpperCase();

  const yearRollParts = [];
  if (studentInfo.year) yearRollParts.push(studentInfo.year.toUpperCase());
  if (studentInfo.rollNo) yearRollParts.push(`ROLL NO: ${studentInfo.rollNo}`.toUpperCase());
  if (studentInfo.designation) yearRollParts.push(studentInfo.designation.toUpperCase());
  const yearRollText = yearRollParts.join("   ★   ");
  const yearRollRaw = yearRollParts.join("  •  ");

  /*
   * =========================================================================
   * ARCHETYPE 2: MASS HERO CINEMA BLOCKBUSTER (Dynamic Left Typography, Right Hero)
   * =========================================================================
   */
  if (archetype === "asymmetric-split") {
    const leftCardX = textLayout.left;
    const leftCardWidth = textLayout.width;

    const collegeFit = findFittingFontSize({
      text: rawCollege,
      maximumWidth: width * 0.90,
      maximumLines: 1,
      maximumFontSize: 18,
      minimumFontSize: 12,
      characterRatio: 0.57,
    });

    const headingFit = findFittingFontSize({
      text: rawHeading,
      maximumWidth: leftCardWidth - 20,
      maximumLines: 2,
      maximumFontSize: 44,
      minimumFontSize: 26,
      characterRatio: 0.62,
    });

    const nameFit = findFittingFontSize({
      text: rawName,
      maximumWidth: leftCardWidth - 10,
      maximumLines: 2,
      maximumFontSize: 52,
      minimumFontSize: 28,
      characterRatio: 0.61,
    });

    const deptFit = findFittingFontSize({
      text: rawDept,
      maximumWidth: leftCardWidth - 10,
      maximumLines: 2,
      maximumFontSize: 18,
      minimumFontSize: 13,
      characterRatio: 0.57,
    });

    const quoteFontSize = 18;
    const quoteLines = wrapText({
      text: rawQuote,
      maximumWidth: leftCardWidth - 20,
      fontSize: quoteFontSize,
      maximumLines: 5,
      characterRatio: 0.52,
    });

    let cursorY = Math.round(height * 0.10);
    const titleY = cursorY + headingFit.fontSize * 0.88;
    cursorY = titleY + (headingFit.lines.length - 1) * headingFit.fontSize * 1.15 + 32;

    const nameY = cursorY + nameFit.fontSize * 0.88;
    cursorY = nameY + (nameFit.lines.length - 1) * nameFit.fontSize * 1.10 + 26;

    const dividerY = cursorY;
    cursorY += 28;

    const deptY = cursorY + deptFit.fontSize * 0.85;
    cursorY = deptY + (deptFit.lines.length - 1) * deptFit.fontSize * 1.25 + (yearRollRaw ? 28 : 20);

    const yearY = cursorY;
    cursorY += (yearRollRaw ? 36 : 14);

    const quoteStartY = cursorY + quoteFontSize * 0.85 + 16;
    const quoteLineHeight = 26;
    cursorY = quoteStartY + (quoteLines.length - 1) * quoteLineHeight + 42;

    const dateY = cursorY;

    return Buffer.from(`
      <svg
        width="${width}"
        height="${height}"
        viewBox="0 0 ${width} ${height}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="splitTitleGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${palette.accent}" />
            <stop offset="50%" stop-color="${palette.primary}" />
            <stop offset="100%" stop-color="#FFFFFF" />
          </linearGradient>

          <linearGradient id="goldNameGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="35%" stop-color="${palette.accent}" />
            <stop offset="70%" stop-color="${palette.primary}" />
            <stop offset="100%" stop-color="#FFD700" />
          </linearGradient>

          <filter id="cinematicGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.95" />
          </filter>

          <style>
            .split-clg { font-family: Arial, Helvetica, sans-serif; font-size: ${collegeFit.fontSize}px; font-weight: 700; letter-spacing: 2px; fill: ${palette.accent}; }
            .split-title { font-family: Georgia, 'Times New Roman', serif; font-size: ${headingFit.fontSize}px; font-weight: 900; letter-spacing: 2px; fill: url(#splitTitleGrad); filter: url(#cinematicGlow); }
            .split-name { font-family: Arial, Helvetica, sans-serif; font-size: ${nameFit.fontSize}px; font-weight: 900; letter-spacing: 1px; fill: url(#goldNameGrad); stroke: #000000; stroke-width: 1.5px; paint-order: stroke fill; filter: url(#cinematicGlow); }
            .split-dept { font-family: Arial, Helvetica, sans-serif; font-size: ${deptFit.fontSize}px; font-weight: 700; letter-spacing: 1.2px; fill: ${palette.accent}; }
            .split-year { font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 1.4px; fill: #FFFFFF; }
            .split-quote { font-family: Georgia, 'Times New Roman', serif; font-size: ${quoteFontSize}px; font-weight: 400; font-style: italic; fill: #FFFFFF; filter: url(#cinematicGlow); }
            .split-date { font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: 800; letter-spacing: 2px; fill: ${palette.primary}; }
          </style>
        </defs>

        <g>
          <!-- Top College Bar -->
          <text x="${width / 2}" y="48" text-anchor="middle" class="split-clg">✦ ${escapeXml(collegeFit.lines[0] || rawCollege)} ✦</text>
          <line x1="80" y1="60" x2="${width - 80}" y2="60" stroke="${palette.primary}" stroke-opacity="0.4" stroke-width="1.2" />

          <!-- Left Accent Ribbon -->
          <rect x="${leftCardX - 12}" y="${Math.round(height * 0.10)}" width="4" height="${height * 0.82}" rx="2" fill="${palette.primary}" />

          <!-- Celebration Title -->
          ${buildSvgTextLines({
            lines: headingFit.lines,
            x: leftCardX,
            y: titleY,
            lineHeight: headingFit.fontSize * 1.15,
            textAnchor: "start",
            className: "split-title",
          })}

          <!-- Student Name -->
          ${buildSvgTextLines({
            lines: nameFit.lines,
            x: leftCardX,
            y: nameY,
            lineHeight: nameFit.fontSize * 1.10,
            textAnchor: "start",
            className: "split-name",
          })}

          <!-- Divider -->
          <line x1="${leftCardX}" y1="${dividerY}" x2="${leftCardX + leftCardWidth}" y2="${dividerY}" stroke="${palette.primary}" stroke-width="2.5" stroke-linecap="round" />

          <!-- Academic Details -->
          ${buildSvgTextLines({
            lines: deptFit.lines,
            x: leftCardX,
            y: deptY,
            lineHeight: deptFit.fontSize * 1.25,
            textAnchor: "start",
            className: "split-dept",
          })}

          ${
            yearRollRaw
              ? `<text x="${leftCardX}" y="${yearY}" class="split-year">${escapeXml(yearRollRaw)}</text>`
              : ""
          }

          <!-- Quote -->
          <text x="${leftCardX}" y="${quoteStartY - 8}" font-family="Georgia, serif" font-size="32" fill="${palette.primary}">“</text>
          ${buildSvgTextLines({
            lines: quoteLines,
            x: leftCardX + 16,
            y: quoteStartY,
            lineHeight: quoteLineHeight,
            textAnchor: "start",
            className: "split-quote",
          })}

          <!-- Date -->
          ${
            rawDate
              ? `<text x="${leftCardX}" y="${dateY}" class="split-date">✦ ${escapeXml(rawDate)} ✦</text>`
              : ""
          }
        </g>
      </svg>
    `);
  }

  /*
   * =========================================================================
   * ARCHETYPE 3: VARSITY SHIELD & CREST (Academic Honor & Gold Laurels)
   * =========================================================================
   */
  if (archetype === "varsity-shield") {
    const collegeFit = findFittingFontSize({
      text: rawCollege,
      maximumWidth: width * 0.88,
      maximumLines: 1,
      maximumFontSize: 19,
      minimumFontSize: 13,
      characterRatio: 0.57,
    });

    const headingFit = findFittingFontSize({
      text: rawHeading,
      maximumWidth: width * 0.86,
      maximumLines: 1,
      maximumFontSize: 46,
      minimumFontSize: 28,
      characterRatio: 0.62,
    });

    const nameFit = findFittingFontSize({
      text: rawName,
      maximumWidth: width * 0.88,
      maximumLines: 1,
      maximumFontSize: 60,
      minimumFontSize: 32,
      characterRatio: 0.61,
    });

    const deptFit = findFittingFontSize({
      text: rawDept,
      maximumWidth: width * 0.88,
      maximumLines: 1,
      maximumFontSize: 20,
      minimumFontSize: 13,
      characterRatio: 0.57,
    });

    const quoteFontSize = 19;
    const quoteLines = wrapText({
      text: rawQuote,
      maximumWidth: width * 0.84,
      fontSize: quoteFontSize,
      maximumLines: 3,
      characterRatio: 0.52,
    });

    const nameY = Math.round(height * 0.69);
    const dividerY = nameY + 20;
    const deptY = dividerY + 34;
    const yearY = yearRollText ? deptY + 32 : deptY;
    const quoteStartY = (yearRollText ? yearY + 22 : deptY + 22) + quoteFontSize * 0.85 + 14;
    const quoteLineHeight = 28;
    const dateY = quoteStartY + (quoteLines.length - 1) * quoteLineHeight + 46;

    return Buffer.from(`
      <svg
        width="${width}"
        height="${height}"
        viewBox="0 0 ${width} ${height}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="varsityGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#FFE259" />
            <stop offset="100%" stop-color="#FFA751" />
          </linearGradient>

          <filter id="varsityShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.95" />
          </filter>

          <style>
            .varsity-tag { font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: 800; letter-spacing: 3px; fill: ${palette.primary}; }
            .varsity-clg { font-family: Arial, Helvetica, sans-serif; font-size: ${collegeFit.fontSize}px; font-weight: 800; letter-spacing: 2.2px; fill: #FFFFFF; }
            .varsity-title { font-family: Georgia, serif; font-size: ${headingFit.fontSize}px; font-weight: 900; letter-spacing: 3.5px; fill: url(#varsityGold); filter: url(#varsityShadow); }
            .varsity-name { font-family: 'Times New Roman', serif; font-size: ${nameFit.fontSize}px; font-weight: 900; letter-spacing: 2px; fill: #FFFFFF; filter: url(#varsityShadow); }
            .varsity-dept { font-family: Arial, Helvetica, sans-serif; font-size: ${deptFit.fontSize}px; font-weight: 700; letter-spacing: 1.8px; fill: ${palette.accent}; }
            .varsity-year { font-family: Arial, Helvetica, sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 1.6px; fill: #FFFFFF; }
            .varsity-quote { font-family: Georgia, serif; font-size: ${quoteFontSize}px; font-weight: 400; font-style: italic; fill: #FFFFFF; filter: url(#varsityShadow); }
            .varsity-date { font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: 800; letter-spacing: 2.5px; fill: ${palette.primary}; }
          </style>
        </defs>

        <g>
          <!-- Top Crest Tag -->
          <text x="${width / 2}" y="38" text-anchor="middle" class="varsity-tag">★ ACADEMIC EXCELLENCE & HONORS ★</text>
          <text x="${width / 2}" y="70" text-anchor="middle" class="varsity-clg">${escapeXml(collegeFit.lines[0] || rawCollege)}</text>
          <line x1="120" y1="84" x2="${width - 120}" y2="84" stroke="${palette.primary}" stroke-width="1.8" />

          <!-- Grand Title Ribbon -->
          <text x="${width / 2}" y="136" text-anchor="middle" class="varsity-title">★ ${escapeXml(headingFit.lines[0] || rawHeading)} ★</text>

          <!-- Student Name -->
          <text x="${width / 2}" y="${nameY}" text-anchor="middle" class="varsity-name">${escapeXml(nameFit.lines[0] || rawName)}</text>

          <!-- Golden Laurel Star Divider -->
          <line x1="${width / 2 - 200}" y1="${dividerY}" x2="${width / 2 - 24}" y2="${dividerY}" stroke="url(#varsityGold)" stroke-width="2.5" stroke-linecap="round" />
          <polygon points="${width / 2},${dividerY - 7} ${width / 2 + 7},${dividerY} ${width / 2},${dividerY + 7} ${width / 2 - 7},${dividerY}" fill="${palette.primary}" />
          <line x1="${width / 2 + 24}" y1="${dividerY}" x2="${width / 2 + 200}" y2="${dividerY}" stroke="url(#varsityGold)" stroke-width="2.5" stroke-linecap="round" />

          <!-- Department & Year -->
          <text x="${width / 2}" y="${deptY}" text-anchor="middle" class="varsity-dept">${escapeXml(deptFit.lines[0] || rawDept)}</text>
          ${
            yearRollText
              ? `<text x="${width / 2}" y="${yearY}" text-anchor="middle" class="varsity-year">${escapeXml(yearRollText)}</text>`
              : ""
          }

          <!-- Quote -->
          ${buildSvgTextLines({
            lines: quoteLines,
            x: width / 2,
            y: quoteStartY,
            lineHeight: quoteLineHeight,
            textAnchor: "middle",
            className: "varsity-quote",
          })}

          <!-- Date -->
          <text x="${width / 2}" y="${dateY}" text-anchor="middle" class="varsity-date">${escapeXml(rawDate ? `✦ ${rawDate} ✦` : "✦ WITH BEST COMPLIMENTS & WISHES ✦")}</text>
        </g>
      </svg>
    `);
  }

  /*
   * =========================================================================
   * ARCHETYPE 4: MODERN LUXURY EDITORIAL / VOGUE MINIMAL (High-Fashion Cover)
   * =========================================================================
   */
  if (archetype === "minimal-editorial") {
    const collegeFit = findFittingFontSize({
      text: rawCollege,
      maximumWidth: width * 0.90,
      maximumLines: 1,
      maximumFontSize: 16,
      minimumFontSize: 12,
      characterRatio: 0.57,
    });

    const nameFit = findFittingFontSize({
      text: rawName,
      maximumWidth: width * 0.90,
      maximumLines: 1,
      maximumFontSize: 64,
      minimumFontSize: 34,
      characterRatio: 0.61,
    });

    const deptFit = findFittingFontSize({
      text: rawDept,
      maximumWidth: width * 0.90,
      maximumLines: 1,
      maximumFontSize: 20,
      minimumFontSize: 13,
      characterRatio: 0.57,
    });

    const quoteFontSize = 19;
    const quoteLines = wrapText({
      text: rawQuote,
      maximumWidth: width * 0.82,
      fontSize: quoteFontSize,
      maximumLines: 3,
      characterRatio: 0.52,
    });

    const nameY = Math.round(height * 0.71);
    const dividerY = nameY + 18;
    const deptY = dividerY + 34;
    const yearY = yearRollText ? deptY + 30 : deptY;
    const quoteStartY = (yearRollText ? yearY + 22 : deptY + 22) + quoteFontSize * 0.85 + 14;
    const quoteLineHeight = 28;
    const dateY = quoteStartY + (quoteLines.length - 1) * quoteLineHeight + 46;

    return Buffer.from(`
      <svg
        width="${width}"
        height="${height}"
        viewBox="0 0 ${width} ${height}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="editorialShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.95" />
          </filter>

          <style>
            .edit-top-title { font-family: Georgia, 'Times New Roman', serif; font-size: 52px; font-weight: 400; letter-spacing: 8px; fill: #FFFFFF; filter: url(#editorialShadow); }
            .edit-clg { font-family: Arial, Helvetica, sans-serif; font-size: ${collegeFit.fontSize}px; font-weight: 700; letter-spacing: 3px; fill: ${palette.accent}; }
            .edit-name { font-family: Arial, Helvetica, sans-serif; font-size: ${nameFit.fontSize}px; font-weight: 900; letter-spacing: 2px; fill: #FFFFFF; filter: url(#editorialShadow); }
            .edit-dept { font-family: Arial, Helvetica, sans-serif; font-size: ${deptFit.fontSize}px; font-weight: 600; letter-spacing: 2px; fill: ${palette.primary}; }
            .edit-year { font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 1.8px; fill: #FFFFFF; }
            .edit-quote { font-family: Georgia, serif; font-size: ${quoteFontSize}px; font-weight: 400; font-style: italic; fill: #FFFFFF; filter: url(#editorialShadow); }
            .edit-date { font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 3px; fill: ${palette.primary}; }
          </style>
        </defs>

        <g>
          <!-- Top Vogue Headline -->
          <text x="${width / 2}" y="76" text-anchor="middle" class="edit-top-title">HAPPY BIRTHDAY</text>
          <text x="${width / 2}" y="112" text-anchor="middle" class="edit-clg">${escapeXml(collegeFit.lines[0] || rawCollege)}</text>

          <!-- Student Name -->
          <text x="${width / 2}" y="${nameY}" text-anchor="middle" class="edit-name">${escapeXml(nameFit.lines[0] || rawName)}</text>

          <!-- Minimalist Gold Accent Line -->
          <line x1="${width / 2 - 120}" y1="${dividerY}" x2="${width / 2 + 120}" y2="${dividerY}" stroke="${palette.primary}" stroke-width="2" />

          <!-- Department & Year -->
          <text x="${width / 2}" y="${deptY}" text-anchor="middle" class="edit-dept">${escapeXml(deptFit.lines[0] || rawDept)}</text>
          ${
            yearRollText
              ? `<text x="${width / 2}" y="${yearY}" text-anchor="middle" class="edit-year">${escapeXml(yearRollText)}</text>`
              : ""
          }

          <!-- Quote -->
          ${buildSvgTextLines({
            lines: quoteLines,
            x: width / 2,
            y: quoteStartY,
            lineHeight: quoteLineHeight,
            textAnchor: "middle",
            className: "edit-quote",
          })}

          <!-- Date -->
          <text x="${width / 2}" y="${dateY}" text-anchor="middle" class="edit-date">${escapeXml(rawDate ? `✦ ${rawDate} ✦` : "✦ SPECIAL CELEBRATION EDITION ✦")}</text>
        </g>
      </svg>
    `);
  }

  /*
   * =========================================================================
   * ARCHETYPE 1: ROYAL GRAND FELICITATION (Classic Symmetrical Gold & Velvet Flex)
   * =========================================================================
   */

  const collegeFit = findFittingFontSize({
    text: rawCollege,
    maximumWidth: width * 0.88,
    maximumLines: 1,
    maximumFontSize: 19,
    minimumFontSize: 13,
    characterRatio: 0.57,
  });

  const headingFit = findFittingFontSize({
    text: rawHeading,
    maximumWidth: width * 0.88,
    maximumLines: 1,
    maximumFontSize: 52,
    minimumFontSize: 30,
    characterRatio: 0.62,
  });

  const nameFit = findFittingFontSize({
    text: rawName,
    maximumWidth: width * 0.90,
    maximumLines: 1,
    maximumFontSize: 64,
    minimumFontSize: 34,
    characterRatio: 0.61,
  });

  const deptFit = findFittingFontSize({
    text: rawDept ? rawDept : "STUDENT OF DISTINCTION",
    maximumWidth: width * 0.90,
    maximumLines: 1,
    maximumFontSize: 22,
    minimumFontSize: 14,
    characterRatio: 0.57,
  });

  const quoteFontSize = 20;
  const quoteLines = wrapText({
    text: rawQuote,
    maximumWidth: width * 0.84,
    fontSize: quoteFontSize,
    maximumLines: 3,
    characterRatio: 0.52,
  });

  const nameY = Math.round(height * 0.68);
  const dividerY = nameY + 20;
  const deptY = dividerY + 36;
  const yearY = yearRollText ? deptY + 32 : deptY;
  const quoteStartY = (yearRollText ? yearY + 24 : deptY + 24) + quoteFontSize * 0.85 + 14;
  const quoteLineHeight = 30;
  const dateY = quoteStartY + (quoteLines.length - 1) * quoteLineHeight + 48;

  return Buffer.from(`
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldTitleGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${palette.accent}" />
          <stop offset="50%" stop-color="${palette.primary}" />
          <stop offset="100%" stop-color="#FFFFFF" />
        </linearGradient>

        <linearGradient id="goldNameGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="25%" stop-color="${palette.accent}" />
          <stop offset="60%" stop-color="${palette.primary}" />
          <stop offset="100%" stop-color="#FFD700" />
        </linearGradient>

        <filter id="royal3DShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.95" />
        </filter>

        <filter id="textGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.85" />
        </filter>

        <style>
          .royal-clg { font-family: Arial, Helvetica, sans-serif; font-size: ${collegeFit.fontSize}px; font-weight: 700; letter-spacing: 2.2px; fill: ${palette.accent}; }
          .royal-title { font-family: Georgia, 'Times New Roman', serif; font-size: ${headingFit.fontSize}px; font-weight: 900; letter-spacing: 3.5px; fill: url(#goldTitleGrad); filter: url(#royal3DShadow); }
          .royal-name { font-family: Arial, Helvetica, sans-serif; font-size: ${nameFit.fontSize}px; font-weight: 900; letter-spacing: 1.5px; fill: url(#goldNameGrad); stroke: #000000; stroke-width: 1.5px; paint-order: stroke fill; filter: url(#royal3DShadow); }
          .royal-dept { font-family: Arial, Helvetica, sans-serif; font-size: ${deptFit.fontSize}px; font-weight: 700; letter-spacing: 1.6px; fill: ${palette.accent}; }
          .royal-year { font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: 700; letter-spacing: 1.6px; fill: #FFFFFF; }
          .royal-quote { font-family: Georgia, 'Times New Roman', serif; font-size: ${quoteFontSize}px; font-weight: 400; font-style: italic; fill: #FFFFFF; filter: url(#textGlow); }
          .royal-date { font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: 800; letter-spacing: 2.4px; fill: ${palette.primary}; }
        </style>
      </defs>

      <g>
        <!-- 1. TOP COLLEGE HEADER -->
        <text x="${width / 2}" y="52" text-anchor="middle" class="royal-clg">✦ ${escapeXml(collegeFit.lines[0] || rawCollege)} ✦</text>
        <line x1="${width / 2 - 240}" y1="66" x2="${width / 2 + 240}" y2="66" stroke="${palette.primary}" stroke-opacity="0.6" stroke-width="1.4" />

        <!-- 2. GRAND CELEBRATION HEADLINE -->
        <text x="${width / 2}" y="128" text-anchor="middle" class="royal-title">★ ${escapeXml(headingFit.lines[0] || rawHeading)} ★</text>

        <!-- 3. STUDENT NAME -->
        <text x="${width / 2}" y="${nameY}" text-anchor="middle" class="royal-name">${escapeXml(nameFit.lines[0] || rawName)}</text>

        <!-- 4. ORNATE GOLDEN DIVIDER -->
        <line x1="${width / 2 - 220}" y1="${dividerY}" x2="${width / 2 - 24}" y2="${dividerY}" stroke="${palette.primary}" stroke-width="2.5" stroke-linecap="round" />
        <polygon points="${width / 2},${dividerY - 8} ${width / 2 + 8},${dividerY} ${width / 2},${dividerY + 8} ${width / 2 - 8},${dividerY}" fill="${palette.accent}" />
        <line x1="${width / 2 + 24}" y1="${dividerY}" x2="${width / 2 + 220}" y2="${dividerY}" stroke="${palette.primary}" stroke-width="2.5" stroke-linecap="round" />

        <!-- 5. ACADEMIC DETAILS -->
        <text x="${width / 2}" y="${deptY}" text-anchor="middle" class="royal-dept">${escapeXml(deptFit.lines[0] || rawDept)}</text>
        ${
          yearRollText
            ? `<text x="${width / 2}" y="${yearY}" text-anchor="middle" class="royal-year">${escapeXml(yearRollText)}</text>`
            : ""
        }

        <!-- 6. BIRTHDAY WISH QUOTE -->
        ${buildSvgTextLines({
          lines: quoteLines,
          x: width / 2,
          y: quoteStartY,
          lineHeight: quoteLineHeight,
          textAnchor: "middle",
          className: "royal-quote",
        })}

        <!-- 7. DATE & FELICITATION FOOTER -->
        <text x="${width / 2}" y="${dateY}" text-anchor="middle" class="royal-date">${escapeXml(rawDate ? `✦ ${rawDate} ✦` : "✦ WITH BEST COMPLIMENTS & CELEBRATIONS ✦")}</text>
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
    ></svg>
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
      style,
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