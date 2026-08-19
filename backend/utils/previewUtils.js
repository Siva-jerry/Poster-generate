/*
|--------------------------------------------------------------------------
| Preview constants
|--------------------------------------------------------------------------
*/

const DEFAULT_PREVIEW_WIDTH = 540;
const DEFAULT_PREVIEW_HEIGHT = 675;

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

/*
|--------------------------------------------------------------------------
| XML escaping
|--------------------------------------------------------------------------
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

function normalizeHexColor(value, fallback = "#111111") {
  const color = String(value || "").trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return color.toUpperCase();
  }
  return fallback;
}

function hexToRgba(hexColor, opacity = 1) {
  const safeHex = normalizeHexColor(hexColor, "#000000").replace("#", "");
  const red = Number.parseInt(safeHex.slice(0, 2), 16);
  const green = Number.parseInt(safeHex.slice(2, 4), 16);
  const blue = Number.parseInt(safeHex.slice(4, 6), 16);
  const safeOpacity = Math.min(Math.max(Number(opacity) || 0, 0), 1);
  return `rgba(${red}, ${green}, ${blue}, ${safeOpacity})`;
}

/*
|--------------------------------------------------------------------------
| Coordinate scaling
|--------------------------------------------------------------------------
*/

function createScaleHelpers({ width, height }) {
  const scaleX = width / CANVAS_WIDTH;
  const scaleY = height / CANVAS_HEIGHT;

  return {
    x(value) {
      return Math.round(Number(value || 0) * scaleX);
    },
    y(value) {
      return Math.round(Number(value || 0) * scaleY);
    },
    width(value) {
      return Math.round(Number(value || 0) * scaleX);
    },
    height(value) {
      return Math.round(Number(value || 0) * scaleY);
    },
    font(value) {
      return Math.max(
        Math.round(Number(value || 16) * Math.min(scaleX, scaleY)),
        8
      );
    },
  };
}

/*
|--------------------------------------------------------------------------
| High-Fidelity 3D Metallic Balloon Generator
|--------------------------------------------------------------------------
*/

function createSingleBalloon({ cx, cy, rx, ry, color, highlight = "#FFFFFF", opacity = 0.95, tilt = 0 }) {
  const transform = tilt ? `transform="rotate(${tilt} ${cx} ${cy})"` : "";
  const stringEndY = cy + ry + 45;
  
  return `
    <g ${transform} opacity="${opacity}">
      <!-- Curled Shiny String -->
      <path
        d="M ${cx} ${cy + ry} Q ${cx - 7} ${cy + ry + 16} ${cx + 5} ${cy + ry + 28} T ${cx - 3} ${stringEndY}"
        fill="none"
        stroke="#E2E8F0"
        stroke-width="1.6"
        opacity="0.75"
      />
      <!-- Balloon Knot -->
      <polygon
        points="${cx - 5},${cy + ry} ${cx + 5},${cy + ry} ${cx},${cy + ry + 7}"
        fill="${color}"
      />
      <!-- Main 3D Balloon Body -->
      <ellipse
        cx="${cx}"
        cy="${cy}"
        rx="${rx}"
        ry="${ry}"
        fill="${color}"
        filter="url(#balloonShadow)"
      />
      <!-- 3D Specular Highlight Curve -->
      <ellipse
        cx="${cx - rx * 0.32}"
        cy="${cy - ry * 0.35}"
        rx="${rx * 0.28}"
        ry="${ry * 0.38}"
        fill="${highlight}"
        opacity="0.52"
        transform="rotate(-25 ${cx - rx * 0.32} ${cy - ry * 0.35})"
      />
      <!-- Secondary Rim Light -->
      <ellipse
        cx="${cx + rx * 0.42}"
        cy="${cy + ry * 0.28}"
        rx="${rx * 0.12}"
        ry="${ry * 0.2}"
        fill="${highlight}"
        opacity="0.25"
      />
    </g>
  `;
}

function createBalloonCluster({ x, y, width, height, colors }) {
  const primary = colors[0] || "#D4AF37";
  const secondary = colors[1] || "#FFF1A8";
  const accent = colors[2] || "#FFD700";

  let out = "";
  // Layer 1 (Back balloons)
  out += createSingleBalloon({
    cx: Math.round(x + width * 0.15),
    cy: Math.round(y + height * 0.45),
    rx: Math.round(width * 0.42),
    ry: Math.round(height * 0.38),
    color: primary,
    tilt: -12,
    opacity: 0.88,
  });
  // Layer 2 (Middle balloons)
  out += createSingleBalloon({
    cx: Math.round(x + width * 0.55),
    cy: Math.round(y + height * 0.25),
    rx: Math.round(width * 0.48),
    ry: Math.round(height * 0.42),
    color: secondary,
    tilt: 8,
    opacity: 0.95,
  });
  // Layer 3 (Front balloon)
  out += createSingleBalloon({
    cx: Math.round(x + width * 0.35),
    cy: Math.round(y + height * 0.65),
    rx: Math.round(width * 0.44),
    ry: Math.round(height * 0.39),
    color: accent,
    tilt: -5,
    opacity: 0.92,
  });
  return out;
}

/*
|--------------------------------------------------------------------------
| 3D Wrapped Gift Box SVG Generator
|--------------------------------------------------------------------------
*/

function createGiftBox({ x, y, w, h, boxColor = "#D4AF37", ribbonColor = "#FF3864" }) {
  return `
    <g filter="url(#softShadow)" opacity="0.95">
      <!-- Main Box Base -->
      <rect x="${x}" y="${y + h * 0.2}" width="${w}" height="${h * 0.8}" rx="6" fill="${boxColor}" />
      <!-- Box Lid -->
      <rect x="${x - w * 0.05}" y="${y}" width="${w * 1.1}" height="${h * 0.25}" rx="5" fill="${boxColor}" filter="brightness(1.15)" />
      <!-- Vertical Satin Ribbon -->
      <rect x="${x + w * 0.42}" y="${y}" width="${w * 0.16}" height="${h}" fill="${ribbonColor}" />
      <!-- Horizontal Satin Ribbon -->
      <rect x="${x}" y="${y + h * 0.52}" width="${w}" height="${h * 0.16}" fill="${ribbonColor}" />
      <!-- Top Satin Ribbon Bow -->
      <ellipse cx="${x + w * 0.32}" cy="${y - h * 0.08}" rx="${w * 0.2}" ry="${h * 0.14}" fill="${ribbonColor}" transform="rotate(-30 ${x + w * 0.32} ${y - h * 0.08})" />
      <ellipse cx="${x + w * 0.68}" cy="${y - h * 0.08}" rx="${w * 0.2}" ry="${h * 0.14}" fill="${ribbonColor}" transform="rotate(30 ${x + w * 0.68} ${y - h * 0.08})" />
      <circle cx="${x + w * 0.5}" cy="${y - h * 0.04}" r="${w * 0.08}" fill="${ribbonColor}" filter="brightness(1.2)" />
    </g>
  `;
}

/*
|--------------------------------------------------------------------------
| 2-Tier Birthday Cake with Glowing Candle
|--------------------------------------------------------------------------
*/

function createBirthdayCake({ x, y, w, h, primaryColor = "#D4AF37" }) {
  return `
    <g filter="url(#softShadow)" opacity="0.95">
      <!-- Plate -->
      <ellipse cx="${x + w / 2}" cy="${y + h}" rx="${w * 0.6}" ry="${h * 0.15}" fill="#E2E8F0" opacity="0.9" />
      <!-- Bottom Cake Tier -->
      <rect x="${x + w * 0.1}" y="${y + h * 0.5}" width="${w * 0.8}" height="${h * 0.45}" rx="6" fill="${primaryColor}" />
      <ellipse cx="${x + w / 2}" cy="${y + h * 0.5}" rx="${w * 0.4}" ry="${h * 0.12}" fill="#FFF5C0" />
      <!-- Top Cake Tier -->
      <rect x="${x + w * 0.25}" y="${y + h * 0.22}" width="${w * 0.5}" height="${h * 0.3}" rx="5" fill="${primaryColor}" filter="brightness(1.15)" />
      <ellipse cx="${x + w / 2}" cy="${y + h * 0.22}" rx="${w * 0.25}" ry="${h * 0.08}" fill="#FFF5C0" />
      <!-- Candle -->
      <rect x="${x + w * 0.47}" y="${y + h * 0.05}" width="${w * 0.06}" height="${h * 0.18}" rx="2" fill="#FFFFFF" />
      <!-- Candle Flame & Glow -->
      <circle cx="${x + w / 2}" cy="${y}" r="${w * 0.12}" fill="#FFD700" opacity="0.35" filter="url(#glowEffect)" />
      <path d="M ${x + w / 2} ${y - h * 0.08} C ${x + w * 0.54} ${y - h * 0.02}, ${x + w * 0.53} ${y + h * 0.04}, ${x + w / 2} ${y + h * 0.06} C ${x + w * 0.47} ${y + h * 0.04}, ${x + w * 0.46} ${y - h * 0.02}, ${x + w / 2} ${y - h * 0.08} Z" fill="#FF7A00" />
      <path d="M ${x + w / 2} ${y - h * 0.04} C ${x + w * 0.52} ${y}, ${x + w * 0.51} ${y + h * 0.04}, ${x + w / 2} ${y + h * 0.05} C ${x + w * 0.49} ${y + h * 0.04}, ${x + w * 0.48} ${y}, ${x + w / 2} ${y - h * 0.04} Z" fill="#FFF1A8" />
    </g>
  `;
}

/*
|--------------------------------------------------------------------------
| Royal Gold Crown Emblem
|--------------------------------------------------------------------------
*/

function createCrown({ cx, cy, size = 40, color = "url(#goldMetallic)" }) {
  const half = size / 2;
  return `
    <g filter="url(#textShadow3D)">
      <path
        d="M ${cx - half} ${cy + half * 0.6}
           L ${cx - half * 0.8} ${cy - half * 0.3}
           L ${cx - half * 0.35} ${cy + half * 0.1}
           L ${cx} ${cy - half * 0.7}
           L ${cx + half * 0.35} ${cy + half * 0.1}
           L ${cx + half * 0.8} ${cy - half * 0.3}
           L ${cx + half} ${cy + half * 0.6} Z"
        fill="${color}"
      />
      <!-- Crown Base Band -->
      <rect x="${cx - half}" y="${cy + half * 0.6}" width="${size}" height="${size * 0.18}" rx="2" fill="${color}" filter="brightness(0.9)" />
      <!-- Jewels -->
      <circle cx="${cx}" cy="${cy - half * 0.7}" r="${size * 0.07}" fill="#FFF5C0" />
      <circle cx="${cx - half * 0.8}" cy="${cy - half * 0.3}" r="${size * 0.06}" fill="#FFF5C0" />
      <circle cx="${cx + half * 0.8}" cy="${cy - half * 0.3}" r="${size * 0.06}" fill="#FFF5C0" />
    </g>
  `;
}

/*
|--------------------------------------------------------------------------
| Royal Laurel Wreath & Achievement Crest
|--------------------------------------------------------------------------
*/

function createLaurelWreath({ cx, cy, r = 160, color = "#D4AF37" }) {
  return `
    <g opacity="0.85" filter="url(#softShadow)">
      <!-- Left Laurel Branch -->
      <path
        d="M ${cx - r * 0.2} ${cy + r * 0.85}
           C ${cx - r * 0.9} ${cy + r * 0.6},
             ${cx - r * 1.05} ${cy - r * 0.4},
             ${cx - r * 0.35} ${cy - r * 0.85}"
        fill="none"
        stroke="${color}"
        stroke-width="3"
      />
      <!-- Right Laurel Branch -->
      <path
        d="M ${cx + r * 0.2} ${cy + r * 0.85}
           C ${cx + r * 0.9} ${cy + r * 0.6},
             ${cx + r * 1.05} ${cy - r * 0.4},
             ${cx + r * 0.35} ${cy - r * 0.85}"
        fill="none"
        stroke="${color}"
        stroke-width="3"
      />
      <!-- 5-Star Crest on Top -->
      <g fill="${color}">
        <polygon points="${cx},${cy - r * 0.95} ${cx + 4},${cy - r * 0.87} ${cx + 12},${cy - r * 0.87} ${cx + 6},${cy - r * 0.82} ${cx + 8},${cy - r * 0.74} ${cx},${cy - r * 0.79} ${cx - 8},${cy - r * 0.74} ${cx - 6},${cy - r * 0.82} ${cx - 12},${cy - r * 0.87} ${cx - 4},${cy - r * 0.87}" />
      </g>
    </g>
  `;
}

/*
|--------------------------------------------------------------------------
| Stage Spotlights & Atmospheric Light Beams
|--------------------------------------------------------------------------
*/

function createSpotlightBeams({ width, height, color = "#FFF5C0" }) {
  return `
    <g opacity="0.32" style="mix-blend-mode: screen;">
      <!-- Top Left Spotlight Beam -->
      <polygon points="0,0 ${Math.round(width * 0.08)},0 ${Math.round(width * 0.7)},${height} ${Math.round(width * 0.35)},${height}" fill="url(#beamLeft)" />
      <!-- Top Right Spotlight Beam -->
      <polygon points="${width},0 ${Math.round(width * 0.92)},0 ${Math.round(width * 0.3)},${height} ${Math.round(width * 0.65)},${height}" fill="url(#beamRight)" />
    </g>
  `;
}

/*
|--------------------------------------------------------------------------
| Hanging Pennant Banner Flags (Party Bunting)
|--------------------------------------------------------------------------
*/

function createPennantFlags({ width, height, colors }) {
  const flags = 12;
  const flagWidth = width / flags;
  let svg = `
    <path
      d="M 0 10 Q ${width * 0.25} 35 ${width * 0.5} 12 T ${width} 10"
      fill="none"
      stroke="#E2E8F0"
      stroke-width="1.8"
      opacity="0.8"
    />
  `;

  for (let i = 0; i < flags; i++) {
    const fx = i * flagWidth;
    const fy = 12 + Math.sin((i / flags) * Math.PI) * 16;
    const color = colors[i % colors.length] || "#D4AF37";
    svg += `
      <polygon
        points="${fx},${fy} ${fx + flagWidth},${fy + 2} ${fx + flagWidth / 2},${fy + 28}"
        fill="${color}"
        opacity="0.9"
        filter="url(#balloonShadow)"
      />
    `;
  }
  return svg;
}

/*
|--------------------------------------------------------------------------
| Comprehensive SVG Defs (Gradients & Filters)
|--------------------------------------------------------------------------
*/

function createSvgDefs({ palette, width, height }) {
  const primary = palette?.colors?.primary || "#D4AF37";
  const secondary = palette?.colors?.secondary || "#FFF1A8";
  const accent = palette?.colors?.accent || "#FF6B1A";
  const bg = palette?.colors?.background || "#080808";
  const bgSecondary = palette?.colors?.backgroundSecondary || "#1A1A1A";

  return `
    <!-- Background Gradient -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgSecondary}" />
      <stop offset="50%" stop-color="${bg}" />
      <stop offset="100%" stop-color="${bgSecondary}" />
    </linearGradient>

    <!-- Metallic Gold 3D Extruded Gradient -->
    <linearGradient id="goldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF8D6" />
      <stop offset="25%" stop-color="${secondary}" />
      <stop offset="60%" stop-color="${primary}" />
      <stop offset="85%" stop-color="${accent}" />
      <stop offset="100%" stop-color="#7A5200" />
    </linearGradient>

    <!-- Spotlight Beams -->
    <linearGradient id="beamLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${secondary}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${bg}" stop-opacity="0" />
    </linearGradient>

    <linearGradient id="beamRight" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${primary}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${bg}" stop-opacity="0" />
    </linearGradient>

    <!-- Center Ambient Flare -->
    <radialGradient id="centerSpotlight" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="${primary}" stop-opacity="0.4" />
      <stop offset="55%" stop-color="${primary}" stop-opacity="0.1" />
      <stop offset="100%" stop-color="${bg}" stop-opacity="0" />
    </radialGradient>

    <!-- Top Ambient Burst -->
    <radialGradient id="topHalo" cx="50%" cy="0%" r="55%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.55" />
      <stop offset="80%" stop-color="${bg}" stop-opacity="0" />
    </radialGradient>

    <!-- Filters -->
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.7" />
    </filter>

    <filter id="textShadow3D" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.85" />
    </filter>

    <filter id="glowEffect" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="balloonShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="7" stdDeviation="8" flood-color="#000000" flood-opacity="0.55" />
    </filter>
  `;
}

/*
|--------------------------------------------------------------------------
| Thematic Visual Graphic Layer Builder
|--------------------------------------------------------------------------
*/

function createThematicVisuals({ template, width, height }) {
  const palette = template?.design?.palette || {};
  const decoration = template?.design?.decoration || {};
  const category = template?.category || "luxury";

  const primary = palette?.colors?.primary || "#D4AF37";
  const secondary = palette?.colors?.secondary || "#FFF1A8";
  const accent = palette?.colors?.accent || "#FF6B1A";
  const decorationId = decoration?.id || "";

  let svg = "";

  // 1. Stage Spotlight Beams
  svg += createSpotlightBeams({ width, height, color: secondary });

  // 2. Realistic 3D Balloon Clusters on Left and Right Flanks
  svg += createBalloonCluster({
    x: Math.round(width * 0.02),
    y: Math.round(height * 0.12),
    width: Math.round(width * 0.22),
    height: Math.round(height * 0.36),
    colors: [primary, secondary, accent],
  });

  svg += createBalloonCluster({
    x: Math.round(width * 0.76),
    y: Math.round(height * 0.1),
    width: Math.round(width * 0.22),
    height: Math.round(height * 0.36),
    colors: [secondary, primary, accent],
  });

  // 3. 3D Wrapped Gift Box on Bottom Left
  svg += createGiftBox({
    x: Math.round(width * 0.06),
    y: Math.round(height * 0.76),
    w: Math.round(width * 0.15),
    h: Math.round(height * 0.12),
    boxColor: primary,
    ribbonColor: accent,
  });

  // 4. 2-Tier Celebration Birthday Cake with Glowing Candle on Bottom Right
  svg += createBirthdayCake({
    x: Math.round(width * 0.79),
    y: Math.round(height * 0.76),
    w: Math.round(width * 0.15),
    h: Math.round(height * 0.12),
    primaryColor: primary,
  });

  // 5. Celebration Pennant Flag Bunting across the Top
  svg += createPennantFlags({
    width,
    height,
    colors: [primary, secondary, accent, "#FF3864", "#00F2FE"],
  });

  // 6. Confetti Shower & 4-Point Diamond Sparkles
  const sparkles = [
    [0.15, 0.14, 6, primary],
    [0.85, 0.12, 7, secondary],
    [0.22, 0.22, 5, "#FFFFFF"],
    [0.78, 0.24, 6, primary],
    [0.12, 0.62, 5, secondary],
    [0.88, 0.64, 6, primary],
    [0.22, 0.75, 5, accent],
    [0.78, 0.75, 6, "#FFFFFF"],
    [0.5, 0.08, 5, primary],
    [0.32, 0.16, 4, accent],
    [0.68, 0.16, 4, secondary],
  ];

  sparkles.forEach(([x, y, r, c]) => {
    const px = Math.round(width * x);
    const py = Math.round(height * y);
    svg += `
      <path
        d="M ${px} ${py - r * 2.4} Q ${px} ${py} ${px + r * 2.4} ${py} Q ${px} ${py} ${px} ${py + r * 2.4} Q ${px} ${py} ${px - r * 2.4} ${py} Z"
        fill="${c}"
        opacity="0.95"
      />
      <circle cx="${px}" cy="${py}" r="${r * 0.5}" fill="#FFFFFF" opacity="0.98" />
    `;
  });

  // 7. Category Specific Hero Accents
  if (category === "college" || decorationId.includes("laurel") || decorationId.includes("gold")) {
    // Royal Laurel Wreath & Crown
    svg += createLaurelWreath({
      cx: Math.round(width * 0.5),
      cy: Math.round(height * 0.44),
      r: Math.round(width * 0.38),
      color: primary,
    });
    svg += createCrown({
      cx: Math.round(width * 0.5),
      cy: Math.round(height * 0.13),
      size: Math.round(width * 0.09),
    });
  } else if (category === "neon" || category === "futuristic" || decorationId.includes("cyber")) {
    // Neon Ring Halos & Perspective Grid Floor
    svg += `
      <!-- Glowing Cyber Floor Grid -->
      <g opacity="0.4">
        <line x1="0" y1="${Math.round(height * 0.74)}" x2="${width}" y2="${Math.round(height * 0.74)}" stroke="${primary}" stroke-width="2" />
        <line x1="0" y1="${Math.round(height * 0.82)}" x2="${width}" y2="${Math.round(height * 0.82)}" stroke="${primary}" stroke-width="2.5" />
        <line x1="0" y1="${Math.round(height * 0.92)}" x2="${width}" y2="${Math.round(height * 0.92)}" stroke="${primary}" stroke-width="3" />
        <line x1="${Math.round(width * 0.2)}" y1="${Math.round(height * 0.68)}" x2="${Math.round(width * 0.05)}" y2="${height}" stroke="${primary}" stroke-width="2" />
        <line x1="${Math.round(width * 0.4)}" y1="${Math.round(height * 0.68)}" x2="${Math.round(width * 0.3)}" y2="${height}" stroke="${primary}" stroke-width="2" />
        <line x1="${Math.round(width * 0.6)}" y1="${Math.round(height * 0.68)}" x2="${Math.round(width * 0.7)}" y2="${height}" stroke="${primary}" stroke-width="2" />
        <line x1="${Math.round(width * 0.8)}" y1="${Math.round(height * 0.68)}" x2="${Math.round(width * 0.95)}" y2="${height}" stroke="${primary}" stroke-width="2" />
      </g>
      <!-- Dual Glowing Neon Rings -->
      <circle cx="${Math.round(width * 0.5)}" cy="${Math.round(height * 0.44)}" r="${Math.round(width * 0.38)}" fill="none" stroke="${primary}" stroke-width="4" opacity="0.8" filter="url(#glowEffect)" />
      <circle cx="${Math.round(width * 0.5)}" cy="${Math.round(height * 0.44)}" r="${Math.round(width * 0.41)}" fill="none" stroke="${secondary}" stroke-width="2" stroke-dasharray="8 6" opacity="0.6" />
    `;
  } else {
    // Elegant Glowing Halo Arch
    svg += `
      <circle
        cx="${Math.round(width * 0.5)}"
        cy="${Math.round(height * 0.44)}"
        r="${Math.round(width * 0.38)}"
        fill="none"
        stroke="${primary}"
        stroke-width="3.5"
        opacity="0.75"
        filter="url(#glowEffect)"
      />
      <circle
        cx="${Math.round(width * 0.5)}"
        cy="${Math.round(height * 0.44)}"
        r="${Math.round(width * 0.41)}"
        fill="none"
        stroke="${secondary}"
        stroke-width="1.5"
        stroke-dasharray="6 6"
        opacity="0.5"
      />
      ${createCrown({ cx: Math.round(width * 0.5), cy: Math.round(height * 0.13), size: Math.round(width * 0.08) })}
    `;
  }

  return svg;
}

/*
|--------------------------------------------------------------------------
| Student Portrait Frame & Lighting Cutout
|--------------------------------------------------------------------------
*/

function createPhotoPlaceholder({ layout, palette, scale, width, height }) {
  const photo = layout?.photo || {};
  const px = scale.x(photo.x || 190);
  const py = scale.y(photo.y || 250);
  const pWidth = scale.width(photo.width || 700);
  const pHeight = scale.height(photo.height || 900);
  const primary = palette?.colors?.primary || "#D4AF37";
  const secondary = palette?.colors?.secondary || "#FFFFFF";
  const isCircle = photo.shape === "circle";

  if (isCircle) {
    const radius = Math.min(pWidth, pHeight) / 2;
    const centerX = px + pWidth / 2;
    const centerY = py + pHeight / 2;

    return `
      <!-- Glowing Circular Photo Cutout Ring -->
      <circle
        cx="${centerX}"
        cy="${centerY}"
        r="${radius + 7}"
        fill="none"
        stroke="${primary}"
        stroke-width="4.5"
        opacity="0.95"
        filter="url(#softShadow)"
      />
      <circle
        cx="${centerX}"
        cy="${centerY}"
        r="${radius}"
        fill="${hexToRgba(secondary, 0.14)}"
        stroke="${secondary}"
        stroke-width="2.5"
      />
      <!-- Silhouette avatar icon -->
      <circle cx="${centerX}" cy="${centerY - radius * 0.24}" r="${radius * 0.28}" fill="${hexToRgba(secondary, 0.7)}" />
      <path
        d="M ${centerX - radius * 0.48} ${centerY + radius * 0.54} C ${centerX - radius * 0.38} ${centerY + radius * 0.08}, ${centerX + radius * 0.38} ${centerY + radius * 0.08}, ${centerX + radius * 0.48} ${centerY + radius * 0.54} Z"
        fill="${hexToRgba(secondary, 0.7)}"
      />
      <!-- Label -->
      <rect
        x="${centerX - 65}"
        y="${centerY + radius - 28}"
        width="130"
        height="24"
        rx="12"
        fill="#000000"
        fill-opacity="0.8"
        stroke="${primary}"
        stroke-width="1.5"
      />
      <text
        x="${centerX}"
        y="${centerY + radius - 12}"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="11"
        font-weight="800"
        fill="${primary}"
        letter-spacing="1.5"
      >STUDENT PHOTO</text>
    `;
  }

  // Rectangular / Hero Cutout Portrait Frame
  const cornerRadius = Math.max(Math.round(pWidth * 0.05), 18);
  const centerX = px + pWidth / 2;
  const headRadius = Math.min(pWidth, pHeight) * 0.15;

  return `
    <!-- Stylized Portrait Frame with Glowing Border -->
    <rect
      x="${px}"
      y="${py}"
      width="${pWidth}"
      height="${pHeight}"
      rx="${cornerRadius}"
      fill="${hexToRgba(secondary, 0.11)}"
      stroke="${primary}"
      stroke-width="4"
      filter="url(#softShadow)"
    />
    <rect
      x="${px + 6}"
      y="${py + 6}"
      width="${pWidth - 12}"
      height="${pHeight - 12}"
      rx="${cornerRadius - 4}"
      fill="none"
      stroke="${secondary}"
      stroke-width="1.5"
      stroke-opacity="0.5"
    />
    <!-- Silhouette Student Photo Placeholder -->
    <ellipse
      cx="${centerX}"
      cy="${py + pHeight * 0.34}"
      rx="${headRadius * 0.82}"
      ry="${headRadius}"
      fill="${hexToRgba(secondary, 0.68)}"
    />
    <path
      d="M ${px + pWidth * 0.18} ${py + pHeight * 0.84}
         C ${px + pWidth * 0.24} ${py + pHeight * 0.48},
           ${px + pWidth * 0.76} ${py + pHeight * 0.48},
           ${px + pWidth * 0.82} ${py + pHeight * 0.84} Z"
      fill="${hexToRgba(secondary, 0.68)}"
    />
    <!-- Photo Label Badge -->
    <rect
      x="${centerX - 75}"
      y="${py + pHeight - 36}"
      width="150"
      height="26"
      rx="13"
      fill="#000000"
      fill-opacity="0.8"
      stroke="${primary}"
      stroke-width="1.5"
    />
    <text
      x="${centerX}"
      y="${py + pHeight - 19}"
      text-anchor="middle"
      font-family="Arial, sans-serif"
      font-size="11"
      font-weight="800"
      fill="${primary}"
      letter-spacing="1.5"
    >STUDENT PHOTO</text>
  `;
}

/*
|--------------------------------------------------------------------------
| College Typography & Student Details Badge Card
|--------------------------------------------------------------------------
*/

function createCollegeTypography({ layout, palette, typography, dynamicFields, scale, width, height }) {
  const primary = palette?.colors?.primary || "#D4AF37";
  const secondary = palette?.colors?.secondary || "#FFFFFF";
  const textColor = palette?.colors?.text || "#FFFFFF";
  const mutedColor = palette?.colors?.mutedText || "#E2E8F0";

  const headingText = escapeXml(String(dynamicFields?.birthdayHeading || "HAPPY BIRTHDAY").toUpperCase());
  const nameText = escapeXml(String(dynamicFields?.studentName || "STUDENT NAME"));
  const deptText = escapeXml(String(dynamicFields?.department || "Dept. of Computer Science"));
  const yearText = escapeXml(String(dynamicFields?.year || "Final Year"));
  const quoteText = escapeXml(String(dynamicFields?.birthdayQuote || "Wishing you success, happiness and a bright future!"));
  const collegeName = escapeXml(String(dynamicFields?.collegeName || "COLLEGE OF ENGINEERING & TECHNOLOGY").toUpperCase());

  const heading = layout?.heading || {};
  const name = layout?.namePosition || (typeof layout?.name === "object" ? layout?.name : {});
  const details = layout?.details || {};
  const quote = layout?.quote || {};

  const headingStyle = typography?.heading || {};
  const nameStyle = typography?.nameStyle || (typeof typography?.name === "object" ? typography?.name : {});

  const headingY = scale.y(heading.y || 75) + 38;
  const nameY = scale.y(name.y || 1110) + 12;
  const detailsY = scale.y(details.y || 1195) + 12;
  const quoteY = scale.y(quote.y || 1250) + 14;

  const cardWidth = Math.round(width * 0.88);
  const cardX = Math.round((width - cardWidth) / 2);

  return `
    <!-- Top College Header Bar -->
    <g opacity="0.95">
      <rect
        x="${Math.round(width * 0.1)}"
        y="16"
        width="${Math.round(width * 0.8)}"
        height="28"
        rx="14"
        fill="#000000"
        fill-opacity="0.7"
        stroke="${primary}"
        stroke-width="1.4"
      />
      <text
        x="${Math.round(width * 0.5)}"
        y="34"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="11.5"
        font-weight="800"
        fill="${secondary}"
        letter-spacing="2"
      >★ ${collegeName} ★</text>
    </g>

    <!-- Main 3D Metallic "HAPPY BIRTHDAY" Title -->
    <text
      x="${Math.round(width * 0.5)}"
      y="${headingY + 3}"
      text-anchor="middle"
      font-family="${escapeXml(headingStyle.fontFamily || "Arial")}, sans-serif"
      font-size="${scale.font(headingStyle.fontSize || 72)}"
      font-weight="${headingStyle.fontWeight || 900}"
      letter-spacing="${Math.max(scale.font(headingStyle.letterSpacing || 3), 1)}"
      fill="#000000"
      opacity="0.8"
    >${headingText}</text>
    
    <text
      x="${Math.round(width * 0.5)}"
      y="${headingY}"
      text-anchor="middle"
      font-family="${escapeXml(headingStyle.fontFamily || "Arial")}, sans-serif"
      font-size="${scale.font(headingStyle.fontSize || 72)}"
      font-weight="${headingStyle.fontWeight || 900}"
      letter-spacing="${Math.max(scale.font(headingStyle.letterSpacing || 3), 1)}"
      fill="url(#goldMetallic)"
      filter="url(#glowEffect)"
    >${headingText}</text>

    <!-- Bottom Student Details Card Overlay (Glassmorphism Pill) -->
    <rect
      x="${cardX}"
      y="${nameY - 28}"
      width="${cardWidth}"
      height="${height - nameY + 16}"
      rx="20"
      fill="#050508"
      fill-opacity="0.85"
      stroke="${primary}"
      stroke-width="1.8"
      stroke-opacity="0.7"
      filter="url(#softShadow)"
    />

    <!-- Student Name -->
    <text
      x="${Math.round(width * 0.5)}"
      y="${nameY}"
      text-anchor="middle"
      font-family="${escapeXml(nameStyle.fontFamily || "Georgia")}, serif"
      font-size="${scale.font(nameStyle.fontSize || 86)}"
      font-weight="${nameStyle.fontWeight || 800}"
      fill="${textColor}"
      filter="url(#textShadow3D)"
    >${nameText}</text>

    <!-- Department & Year Badge -->
    <rect
      x="${Math.round(width * 0.16)}"
      y="${detailsY - 15}"
      width="${Math.round(width * 0.68)}"
      height="22"
      rx="11"
      fill="${primary}"
      fill-opacity="0.25"
      stroke="${primary}"
      stroke-width="1.2"
    />
    <text
      x="${Math.round(width * 0.5)}"
      y="${detailsY}"
      text-anchor="middle"
      font-family="Arial, sans-serif"
      font-size="${scale.font(24)}"
      font-weight="700"
      fill="${secondary}"
      letter-spacing="1"
    >${deptText}  •  ${yearText}</text>

    <!-- Birthday Wish Quote -->
    <text
      x="${Math.round(width * 0.5)}"
      y="${quoteY}"
      text-anchor="middle"
      font-family="Georgia, serif"
      font-size="${scale.font(21)}"
      font-style="italic"
      fill="${mutedColor}"
    >"${quoteText}"</text>
  `;
}

/*
|--------------------------------------------------------------------------
| Main SVG Preview Builder
|--------------------------------------------------------------------------
*/

function createTemplatePreviewSvg({
  template,
  width = DEFAULT_PREVIEW_WIDTH,
  height = DEFAULT_PREVIEW_HEIGHT,
  dynamicFields,
}) {
  if (!template?.design) {
    const error = new Error("A valid template design is required.");
    error.statusCode = 400;
    throw error;
  }

  const { layout, palette, typography } = template.design;
  const scale = createScaleHelpers({ width, height });

  const svgDefs = createSvgDefs({ palette, width, height });
  const themeVisuals = createThematicVisuals({ template, width, height });
  const photoFrame = createPhotoPlaceholder({ layout, palette, scale, width, height });
  const typographySvg = createCollegeTypography({
    layout,
    palette,
    typography,
    dynamicFields: dynamicFields || template.design.dynamicFields,
    scale,
    width,
    height,
  });

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
    >
      <defs>
        ${svgDefs}
      </defs>

      <!-- Background Wall -->
      <rect width="${width}" height="${height}" fill="url(#bgGradient)" />

      <!-- Center Ambient Spotlight Lighting -->
      <ellipse
        cx="${Math.round(width * 0.5)}"
        cy="${Math.round(height * 0.42)}"
        rx="${Math.round(width * 0.52)}"
        ry="${Math.round(height * 0.42)}"
        fill="url(#centerSpotlight)"
      />

      <!-- Top Halo Glow Flare -->
      <ellipse
        cx="${Math.round(width * 0.5)}"
        cy="0"
        rx="${Math.round(width * 0.5)}"
        ry="${Math.round(height * 0.22)}"
        fill="url(#topHalo)"
      />

      <!-- 3D Metallic Balloons, Gift Box, Birthday Cake, Confetti & Pennant Flags -->
      ${themeVisuals}

      <!-- Student Portrait Frame & Lighting -->
      ${photoFrame}

      <!-- Modern College Details & Metallic Typography -->
      ${typographySvg}

      <!-- Outer Luxury Gold/Neon Frame Border -->
      <rect
        x="3"
        y="3"
        width="${width - 6}"
        height="${height - 6}"
        rx="16"
        fill="none"
        stroke="${hexToRgba(palette?.colors?.primary || "#D4AF37", 0.5)}"
        stroke-width="2.5"
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