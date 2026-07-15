const supportedStyles = new Set([
  "luxury",
  "cinematic",
  "neon",
  "floral",
  "minimal",
  "magazine",
  "college",
  "futuristic",
  "traditional",
  "sports",
]);

const supportedMoods = new Set([
  "premium",
  "elegant",
  "energetic",
  "soft",
  "dramatic",
  "modern",
  "festive",
  "professional",
]);

const styleDescriptions = {
  luxury:
    "high-end luxury graphic design, premium metallic details, elegant lighting",

  cinematic:
    "cinematic poster design, dramatic spotlight, atmospheric smoke, depth and film-style lighting",

  neon:
    "neon graphic design, glowing light trails, vibrant futuristic illumination",

  floral:
    "elegant floral composition, soft petals, refined decorative botanical elements",

  minimal:
    "minimal modern graphic design, clean negative space, balanced composition",

  magazine:
    "premium fashion magazine editorial design, sophisticated layout, studio lighting",

  college:
    "youthful college celebration design, energetic shapes, festive student atmosphere",

  futuristic:
    "futuristic technology poster, holographic lighting, abstract digital structures",

  traditional:
    "elegant Indian celebration design, refined ornamental patterns, festive traditional mood",

  sports:
    "dynamic sports poster design, strong lighting, speed effects and energetic atmosphere",
};

const moodDescriptions = {
  premium:
    "premium, polished and expensive-looking",

  elegant:
    "elegant, refined and graceful",

  energetic:
    "energetic, bold and exciting",

  soft:
    "soft, dreamy and graceful",

  dramatic:
    "dramatic, powerful and high contrast",

  modern:
    "modern, clean and contemporary",

  festive:
    "festive, joyful and celebratory",

  professional:
    "professional, balanced and sophisticated",
};

function normalizeHexColor(
  value,
  fallback
) {
  const color = String(
    value || ""
  ).trim();

  if (
    /^#[0-9A-Fa-f]{6}$/.test(
      color
    )
  ) {
    return color.toUpperCase();
  }

  return fallback;
}

function normalizeStyle(style) {
  const normalized = String(
    style || "luxury"
  )
    .trim()
    .toLowerCase();

  return supportedStyles.has(
    normalized
  )
    ? normalized
    : "luxury";
}

function normalizeMood(mood) {
  const normalized = String(
    mood || "premium"
  )
    .trim()
    .toLowerCase();

  return supportedMoods.has(
    normalized
  )
    ? normalized
    : "premium";
}

function sanitizeCustomPrompt(
  customPrompt
) {
  return String(customPrompt || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 500);
}

function buildBackgroundPrompt({
  style,
  mood,
  primaryColor,
  secondaryColor,
  customPrompt,
}) {
  const normalizedStyle =
    normalizeStyle(style);

  const normalizedMood =
    normalizeMood(mood);

  const safePrimaryColor =
    normalizeHexColor(
      primaryColor,
      "#111111"
    );

  const safeSecondaryColor =
    normalizeHexColor(
      secondaryColor,
      "#D4AF37"
    );

  const safeCustomPrompt =
    sanitizeCustomPrompt(
      customPrompt
    );

  const promptParts = [
    "Create a premium vertical birthday poster background",

    styleDescriptions[
      normalizedStyle
    ],

    moodDescriptions[
      normalizedMood
    ],

    `use a ${safePrimaryColor} and ${safeSecondaryColor} colour palette`,

    "professional social media poster composition",

    "portrait 4:5 aspect ratio",

    "clean central area reserved for a full-body student portrait",

    "clear negative space near the top for a birthday heading",

    "clear negative space near the bottom for a name and short message",

    "high-quality lighting, detailed textures, polished graphic design",

    "background only",

    "no people, no faces, no human silhouettes",

    "no text, no words, no letters, no numbers",

    "no logo, no watermark, no signature",
  ];

  if (safeCustomPrompt) {
    promptParts.splice(
      4,
      0,
      safeCustomPrompt
    );
  }

  const prompt = promptParts.join(
    ", "
  );

  return {
    prompt: prompt.slice(0, 1900),
    style: normalizedStyle,
    mood: normalizedMood,
    primaryColor:
      safePrimaryColor,
    secondaryColor:
      safeSecondaryColor,
  };
}

module.exports = {
  buildBackgroundPrompt,
  normalizeStyle,
  normalizeMood,
};