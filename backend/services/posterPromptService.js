/*
|--------------------------------------------------------------------------
| SmartWish AI
|--------------------------------------------------------------------------
|
| posterPromptService.js
|
| Converts user input into premium AI prompts.
|
| This service NEVER calls AI.
| It only generates optimized prompts.
|
*/

const DEFAULT_STYLE = "luxury";

const STYLE_PROMPTS = {
  luxury: `
Luxury premium birthday poster,
black and gold,
cinematic lighting,
soft glowing particles,
royal atmosphere,
premium magazine quality,
high-end digital artwork,
`,

  royal: `
Royal palace birthday celebration,
gold decorations,
royal blue,
luxury lighting,
majestic atmosphere,
premium artwork,
`,

  cinematic: `
Ultra cinematic birthday poster,
dramatic lighting,
depth of field,
movie poster style,
volumetric light,
premium digital artwork,
`,

  modern: `
Modern clean birthday poster,
minimal premium design,
soft gradients,
glassmorphism,
elegant composition,
`,

  floral: `
Elegant floral birthday poster,
premium flowers,
soft pink,
beautiful decorative elements,
luxury composition,
`,

  sports: `
Dynamic sports birthday poster,
stadium lighting,
energy particles,
modern athletic composition,
premium sports graphics,
`,

  neon: `
Cyberpunk neon birthday poster,
purple,
blue,
pink lighting,
glowing futuristic atmosphere,
premium digital art,
`,

  traditional: `
Traditional Indian birthday celebration,
festival lighting,
premium decorations,
warm colors,
luxury cultural atmosphere,
`,
};

/*
|--------------------------------------------------------------------------
| Build user prompt
|--------------------------------------------------------------------------
*/

function buildUserPrompt(prompt = "") {
  if (!prompt || !prompt.trim()) {
    return "";
  }

  return `
User Design Idea:

${prompt.trim()}
`;
}

/*
|--------------------------------------------------------------------------
| Build fixed quality instructions
|--------------------------------------------------------------------------
*/

function buildQualityPrompt() {
  return `
Create a PREMIUM birthday poster background.

Requirements:

Ultra HD
8K quality
Professional composition
Luxury lighting
Realistic shadows
Premium decorations
Highly detailed
Photorealistic
Clean layout
Magazine quality

IMPORTANT:

NO TEXT

NO WORDS

NO LETTERS

NO TYPOGRAPHY

NO WATERMARK

NO LOGO

NO SIGNATURE

NO PEOPLE

NO FACE

Leave empty space for:

• Student photo

• Birthday title

• Student information

• Wishes quote

Poster ratio:

4:5 Vertical

Use premium composition.
`;
}

/*
|--------------------------------------------------------------------------
| Build final prompt
|--------------------------------------------------------------------------
*/

function createPosterPrompt({
  style = DEFAULT_STYLE,

  prompt = "",

  theme = "",

  colors = "",
} = {}) {
  const selectedStyle =
    STYLE_PROMPTS[
      style.toLowerCase()
    ] ||
    STYLE_PROMPTS[
      DEFAULT_STYLE
    ];

  const themePrompt =
    theme
      ? `Theme: ${theme}\n`
      : "";

  const colorPrompt =
    colors
      ? `Preferred Colors: ${colors}\n`
      : "";

  return `
${selectedStyle}

${themePrompt}

${colorPrompt}

${buildUserPrompt(prompt)}

${buildQualityPrompt()}
`
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/*
|--------------------------------------------------------------------------
| Create multiple prompt variations
|--------------------------------------------------------------------------
*/

function createPromptVariations({
  style,

  prompt,

  theme,

  colors,

  count = 4,
} = {}) {
  const lightingVariations = [
    "golden hour lighting",
    "dramatic spotlight",
    "studio lighting",
    "soft glowing lighting",
    "luxury ambient lighting",
    "cinematic rim lighting",
  ];

  const decorationVariations = [
    "premium particles",
    "luxury sparkles",
    "gold confetti",
    "floating ribbons",
    "premium floral decoration",
    "glowing abstract shapes",
  ];

  const prompts = [];

  for (
    let i = 0;
    i < count;
    i++
  ) {
    prompts.push(
      `
${createPosterPrompt({
  style,
  prompt,
  theme,
  colors,
})}

Lighting:

${
  lightingVariations[
    i %
      lightingVariations.length
  ]
}

Decorations:

${
  decorationVariations[
    i %
      decorationVariations.length
  ]
}
`
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    );
  }

  return prompts;
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  createPosterPrompt,

  createPromptVariations,

  STYLE_PROMPTS,
};