/*
|--------------------------------------------------------------------------
| Preview constants
|--------------------------------------------------------------------------
*/

const DEFAULT_PREVIEW_WIDTH = 360;
const DEFAULT_PREVIEW_HEIGHT = 450;

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

/*
|--------------------------------------------------------------------------
| XML escaping
|--------------------------------------------------------------------------
|
| Text inserted into SVG must be escaped.
|
*/

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/*
|--------------------------------------------------------------------------
| Colour helpers
|--------------------------------------------------------------------------
*/

function normalizeHexColor(
  value,
  fallback = "#111111"
) {
  const color = String(value || "").trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return color.toUpperCase();
  }

  return fallback;
}

function hexToRgba(
  hexColor,
  opacity = 1
) {
  const safeHex = normalizeHexColor(
    hexColor,
    "#000000"
  ).replace("#", "");

  const red = Number.parseInt(
    safeHex.slice(0, 2),
    16
  );

  const green = Number.parseInt(
    safeHex.slice(2, 4),
    16
  );

  const blue = Number.parseInt(
    safeHex.slice(4, 6),
    16
  );

  const safeOpacity = Math.min(
    Math.max(Number(opacity) || 0, 0),
    1
  );

  return `rgba(${red}, ${green}, ${blue}, ${safeOpacity})`;
}

/*
|--------------------------------------------------------------------------
| Coordinate scaling
|--------------------------------------------------------------------------
*/

function createScaleHelpers({
  width,
  height,
}) {
  const scaleX = width / CANVAS_WIDTH;
  const scaleY = height / CANVAS_HEIGHT;

  return {
    x(value) {
      return Math.round(
        Number(value || 0) * scaleX
      );
    },

    y(value) {
      return Math.round(
        Number(value || 0) * scaleY
      );
    },

    width(value) {
      return Math.round(
        Number(value || 0) * scaleX
      );
    },

    height(value) {
      return Math.round(
        Number(value || 0) * scaleY
      );
    },

    font(value) {
      return Math.max(
        Math.round(
          Number(value || 16) *
            Math.min(scaleX, scaleY)
        ),
        8
      );
    },
  };
}

/*
|--------------------------------------------------------------------------
| SVG gradient
|--------------------------------------------------------------------------
*/

function createGradientDefinition({
  gradient,
  palette,
}) {
  const colors =
    gradient?.colors?.length >= 2
      ? gradient.colors
      : [
          palette?.colors?.background ||
            "#111111",

          palette?.colors
            ?.backgroundSecondary ||
            "#333333",
        ];

  const firstColor = normalizeHexColor(
    colors[0],
    "#111111"
  );

  const middleColor = normalizeHexColor(
    colors[
      Math.floor(colors.length / 2)
    ],
    firstColor
  );

  const lastColor = normalizeHexColor(
    colors[colors.length - 1],
    "#333333"
  );

  return `
    <linearGradient
      id="backgroundGradient"
      x1="0%"
      y1="0%"
      x2="100%"
      y2="100%"
    >
      <stop
        offset="0%"
        stop-color="${firstColor}"
      />
      <stop
        offset="52%"
        stop-color="${middleColor}"
      />
      <stop
        offset="100%"
        stop-color="${lastColor}"
      />
    </linearGradient>
  `;
}

/*
|--------------------------------------------------------------------------
| Decorative SVG elements
|--------------------------------------------------------------------------
*/

function createDecorationSvg({
  decoration,
  palette,
  width,
  height,
}) {
  const primary =
    palette?.colors?.primary ||
    "#D4AF37";

  const secondary =
    palette?.colors?.secondary ||
    "#FFFFFF";

  const accent =
    palette?.colors?.accent ||
    primary;

  const decorationId =
    decoration?.id || "";

  let svg = "";

  if (
    decorationId.includes("particle") ||
    decorationId.includes("confetti") ||
    decorationId.includes("spotlight")
  ) {
    const points = [
      [0.08, 0.15, 3],
      [0.17, 0.28, 2],
      [0.84, 0.12, 3],
      [0.91, 0.32, 2],
      [0.12, 0.75, 2],
      [0.87, 0.72, 3],
      [0.22, 0.9, 2],
      [0.76, 0.88, 2],
      [0.48, 0.08, 2],
      [0.55, 0.84, 2],
    ];

    svg += points
      .map(
        ([x, y, radius], index) => `
          <circle
            cx="${Math.round(width * x)}"
            cy="${Math.round(height * y)}"
            r="${radius}"
            fill="${
              index % 2 === 0
                ? primary
                : secondary
            }"
            opacity="${
              index % 3 === 0
                ? 0.7
                : 0.4
            }"
          />
        `
      )
      .join("");
  }

  if (
    decorationId.includes("ring") ||
    decorationId.includes("geometric")
  ) {
    svg += `
      <circle
        cx="${Math.round(width * 0.82)}"
        cy="${Math.round(height * 0.18)}"
        r="${Math.round(width * 0.18)}"
        fill="none"
        stroke="${primary}"
        stroke-width="3"
        opacity="0.35"
      />

      <circle
        cx="${Math.round(width * 0.82)}"
        cy="${Math.round(height * 0.18)}"
        r="${Math.round(width * 0.12)}"
        fill="none"
        stroke="${secondary}"
        stroke-width="2"
        opacity="0.25"
      />

      <rect
        x="${Math.round(width * -0.08)}"
        y="${Math.round(height * 0.72)}"
        width="${Math.round(width * 0.46)}"
        height="${Math.round(height * 0.2)}"
        rx="28"
        fill="${accent}"
        opacity="0.12"
        transform="rotate(-12)"
      />
    `;
  }

  if (
    decorationId.includes("floral")
  ) {
    svg += `
      <g opacity="0.7">
        <circle
          cx="${Math.round(width * 0.08)}"
          cy="${Math.round(height * 0.08)}"
          r="${Math.round(width * 0.06)}"
          fill="${primary}"
          opacity="0.35"
        />

        <circle
          cx="${Math.round(width * 0.16)}"
          cy="${Math.round(height * 0.05)}"
          r="${Math.round(width * 0.045)}"
          fill="${secondary}"
          opacity="0.35"
        />

        <circle
          cx="${Math.round(width * 0.92)}"
          cy="${Math.round(height * 0.9)}"
          r="${Math.round(width * 0.07)}"
          fill="${primary}"
          opacity="0.3"
        />

        <circle
          cx="${Math.round(width * 0.83)}"
          cy="${Math.round(height * 0.94)}"
          r="${Math.round(width * 0.045)}"
          fill="${secondary}"
          opacity="0.35"
        />
      </g>
    `;
  }

  if (
    decorationId.includes("editorial") ||
    decorationId.includes("line")
  ) {
    svg += `
      <line
        x1="${Math.round(width * 0.07)}"
        y1="${Math.round(height * 0.12)}"
        x2="${Math.round(width * 0.07)}"
        y2="${Math.round(height * 0.82)}"
        stroke="${primary}"
        stroke-width="3"
        opacity="0.65"
      />

      <line
        x1="${Math.round(width * 0.72)}"
        y1="${Math.round(height * 0.1)}"
        x2="${Math.round(width * 0.93)}"
        y2="${Math.round(height * 0.1)}"
        stroke="${secondary}"
        stroke-width="2"
        opacity="0.55"
      />
    `;
  }

  return svg;
}

/*
|--------------------------------------------------------------------------
| Photo placeholder
|--------------------------------------------------------------------------
*/

function createPhotoPlaceholderSvg({
  layout,
  palette,
  scale,
}) {
  const photo = layout?.photo || {};

  const x = scale.x(photo.x || 190);
  const y = scale.y(photo.y || 250);

  const width = scale.width(
    photo.width || 700
  );

  const height = scale.height(
    photo.height || 900
  );

  const primary =
    palette?.colors?.primary ||
    "#D4AF37";

  const secondary =
    palette?.colors?.secondary ||
    "#FFFFFF";

  const isCircle =
    photo.shape === "circle";

  if (isCircle) {
    const radius = Math.min(
      width,
      height
    ) / 2;

    const centerX = x + width / 2;
    const centerY = y + height / 2;

    return `
      <circle
        cx="${centerX}"
        cy="${centerY}"
        r="${radius}"
        fill="${hexToRgba(
          secondary,
          0.14
        )}"
        stroke="${primary}"
        stroke-width="3"
        opacity="0.96"
      />

      <circle
        cx="${centerX}"
        cy="${centerY - radius * 0.27}"
        r="${radius * 0.22}"
        fill="${hexToRgba(
          secondary,
          0.58
        )}"
      />

      <path
        d="
          M ${centerX - radius * 0.42}
            ${centerY + radius * 0.46}
          C ${centerX - radius * 0.34}
            ${centerY + radius * 0.05},
            ${centerX + radius * 0.34}
            ${centerY + radius * 0.05},
            ${centerX + radius * 0.42}
            ${centerY + radius * 0.46}
          Z
        "
        fill="${hexToRgba(
          secondary,
          0.58
        )}"
      />
    `;
  }

  const cornerRadius = Math.max(
    Math.round(width * 0.08),
    12
  );

  const headRadius = Math.min(
    width,
    height
  ) * 0.14;

  const centerX = x + width / 2;

  return `
    <rect
      x="${x}"
      y="${y}"
      width="${width}"
      height="${height}"
      rx="${cornerRadius}"
      fill="${hexToRgba(
        secondary,
        0.11
      )}"
      stroke="${hexToRgba(
        primary,
        0.72
      )}"
      stroke-width="3"
    />

    <ellipse
      cx="${centerX}"
      cy="${y + height * 0.31}"
      rx="${headRadius * 0.78}"
      ry="${headRadius}"
      fill="${hexToRgba(
        secondary,
        0.6
      )}"
    />

    <path
      d="
        M ${x + width * 0.24}
          ${y + height * 0.82}
        C ${x + width * 0.28}
          ${y + height * 0.49},
          ${x + width * 0.72}
          ${y + height * 0.49},
          ${x + width * 0.76}
          ${y + height * 0.82}
        Z
      "
      fill="${hexToRgba(
        secondary,
        0.6
      )}"
    />
  `;
}

/*
|--------------------------------------------------------------------------
| Text SVG
|--------------------------------------------------------------------------
*/

function createTextSvg({
  layout,
  palette,
  typography,
  dynamicFields,
  scale,
}) {
  const textColor =
    palette?.colors?.text ||
    "#FFFFFF";

  const mutedColor =
    palette?.colors?.mutedText ||
    "#DDDDDD";

  const primary =
    palette?.colors?.primary ||
    "#D4AF37";

  const headingText = escapeXml(
    dynamicFields?.birthdayHeading ||
      "HAPPY BIRTHDAY"
  );

  const nameText = escapeXml(
    dynamicFields?.studentName ||
      "STUDENT NAME"
  );

  const detailsText = escapeXml(
    [
      dynamicFields?.department ||
        "Department",

      dynamicFields?.year ||
        "Final Year",
    ]
      .filter(Boolean)
      .join("  •  ")
  );

  const quoteText = escapeXml(
    dynamicFields?.birthdayQuote ||
      "Wishing you happiness and success!"
  );

  const heading = layout?.heading || {};
  const name = layout?.name || {};
  const details = layout?.details || {};
  const quote = layout?.quote || {};

  const headingStyle =
    typography?.heading || {};

  const nameStyle =
    typography?.name || {};

  const detailsStyle =
    typography?.details || {};

  const quoteStyle =
    typography?.quote || {};

  function resolveAnchor(alignment) {
    if (alignment === "center") {
      return "middle";
    }

    if (alignment === "right") {
      return "end";
    }

    return "start";
  }

  function resolveTextX(
    box,
    alignment
  ) {
    const boxX = scale.x(box.x || 0);
    const boxWidth = scale.width(
      box.width || 800
    );

    if (alignment === "center") {
      return boxX + boxWidth / 2;
    }

    if (alignment === "right") {
      return boxX + boxWidth;
    }

    return boxX;
  }

  const headingAlignment =
    heading.align || "center";

  const nameAlignment =
    name.align || "center";

  const detailsAlignment =
    details.align || "center";

  const quoteAlignment =
    quote.align || "center";

  return `
    <text
      x="${resolveTextX(
        heading,
        headingAlignment
      )}"
      y="${scale.y(
        (heading.y || 75) +
          (headingStyle.fontSize || 70)
      )}"
      text-anchor="${resolveAnchor(
        headingAlignment
      )}"
      font-family="${escapeXml(
        headingStyle.fontFamily ||
          "Arial"
      )}"
      font-size="${scale.font(
        headingStyle.fontSize || 70
      )}"
      font-weight="${
        headingStyle.fontWeight ||
        800
      }"
      letter-spacing="${Math.max(
        scale.font(
          headingStyle.letterSpacing ||
            1
        ),
        0
      )}"
      fill="${primary}"
    >
      ${headingText}
    </text>

    <text
      x="${resolveTextX(
        name,
        nameAlignment
      )}"
      y="${scale.y(
        (name.y || 1080) +
          (nameStyle.fontSize || 86)
      )}"
      text-anchor="${resolveAnchor(
        nameAlignment
      )}"
      font-family="${escapeXml(
        nameStyle.fontFamily ||
          "Arial"
      )}"
      font-size="${scale.font(
        nameStyle.fontSize || 86
      )}"
      font-weight="${
        nameStyle.fontWeight || 800
      }"
      fill="${textColor}"
    >
      ${nameText}
    </text>

    <text
      x="${resolveTextX(
        details,
        detailsAlignment
      )}"
      y="${scale.y(
        (details.y || 1180) +
          (detailsStyle.fontSize ||
            28)
      )}"
      text-anchor="${resolveAnchor(
        detailsAlignment
      )}"
      font-family="${escapeXml(
        detailsStyle.fontFamily ||
          "Arial"
      )}"
      font-size="${scale.font(
        detailsStyle.fontSize || 28
      )}"
      font-weight="${
        detailsStyle.fontWeight ||
        500
      }"
      fill="${mutedColor}"
    >
      ${detailsText}
    </text>

    <text
      x="${resolveTextX(
        quote,
        quoteAlignment
      )}"
      y="${scale.y(
        (quote.y || 1250) +
          (quoteStyle.fontSize || 24)
      )}"
      text-anchor="${resolveAnchor(
        quoteAlignment
      )}"
      font-family="${escapeXml(
        quoteStyle.fontFamily ||
          "Arial"
      )}"
      font-size="${scale.font(
        quoteStyle.fontSize || 24
      )}"
      font-style="${
        quoteStyle.italic
          ? "italic"
          : "normal"
      }"
      fill="${mutedColor}"
    >
      ${quoteText}
    </text>
  `;
}

/*
|--------------------------------------------------------------------------
| Main preview SVG generator
|--------------------------------------------------------------------------
*/

function createTemplatePreviewSvg({
  template,
  width = DEFAULT_PREVIEW_WIDTH,
  height = DEFAULT_PREVIEW_HEIGHT,
  dynamicFields,
}) {
  if (!template?.design) {
    const error = new Error(
      "A valid template design is required."
    );

    error.statusCode = 400;

    throw error;
  }

  const {
    layout,
    palette,
    typography,
    decoration,
  } = template.design;

  const scale = createScaleHelpers({
    width,
    height,
  });

  const gradientDefinition =
    createGradientDefinition({
      gradient: palette?.gradient,
      palette,
    });

  const decorationSvg =
    createDecorationSvg({
      decoration,
      palette,
      width,
      height,
    });

  const photoSvg =
    createPhotoPlaceholderSvg({
      layout,
      palette,
      scale,
    });

  const textSvg = createTextSvg({
    layout,
    palette,
    typography,
    dynamicFields:
      dynamicFields ||
      template.design.dynamicFields,
    scale,
  });

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
    >
      <defs>
        ${gradientDefinition}

        <filter
          id="softShadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="12"
            flood-color="#000000"
            flood-opacity="0.38"
          />
        </filter>

        <radialGradient
          id="photoGlow"
          cx="50%"
          cy="50%"
          r="50%"
        >
          <stop
            offset="0%"
            stop-color="${
              palette?.colors?.primary ||
              "#D4AF37"
            }"
            stop-opacity="0.35"
          />
          <stop
            offset="100%"
            stop-color="${
              palette?.colors?.primary ||
              "#D4AF37"
            }"
            stop-opacity="0"
          />
        </radialGradient>
      </defs>

      <rect
        width="${width}"
        height="${height}"
        fill="url(#backgroundGradient)"
      />

      <ellipse
        cx="${Math.round(width / 2)}"
        cy="${Math.round(height * 0.5)}"
        rx="${Math.round(width * 0.43)}"
        ry="${Math.round(height * 0.38)}"
        fill="url(#photoGlow)"
      />

      ${decorationSvg}

      <g filter="url(#softShadow)">
        ${photoSvg}
      </g>

      ${textSvg}

      <rect
        x="1"
        y="1"
        width="${width - 2}"
        height="${height - 2}"
        rx="10"
        fill="none"
        stroke="${hexToRgba(
          palette?.colors?.primary ||
            "#D4AF37",
          0.24
        )}"
        stroke-width="2"
      />
    </svg>
  `;

  return Buffer.from(svg);
}

module.exports = {
  DEFAULT_PREVIEW_WIDTH,
  DEFAULT_PREVIEW_HEIGHT,
  escapeXml,
  normalizeHexColor,
  hexToRgba,
  createTemplatePreviewSvg,
};