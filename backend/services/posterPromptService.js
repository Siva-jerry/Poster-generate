/*
|--------------------------------------------------------------------------
| SmartWish AI
|--------------------------------------------------------------------------
|
| posterPromptService.js
|
| Converts user input and design archetype selections into optimized AI prompts.
|
*/

const DEFAULT_STYLE = "luxury";

const STYLE_PROMPTS = {
  luxury: `
Abstract theatrical luxury celebration stage backdrop,
deep black onyx and lustrous metallic gold reflective floor,
grand symmetrical overhead spotlights, dramatic volumetric light beams,
3D floating metallic gold and obsidian chrome spheres,
sparkling champagne particle dust, bokeh illumination,
pure stage atmosphere, empty center stage, completely text-free blank backdrop.
`,

  modern: `
Abstract high-energy action celebration stage backdrop,
deep dark midnight purple, electric cyan and vivid orange ambient flares,
dramatic diagonal stadium spotlights and volumetric haze,
glowing particles and subtle celebration light rays,
theatrical modern stage background, text-free blank backdrop.
`,

  floral: `
Abstract aesthetic pastel botanical celebration backdrop,
warm champagne, blush rose gold, soft peach ambient tones,
subtle fairy lights and golden hour bokeh,
soft romantic studio atmosphere, text-free blank backdrop.
`,

  sports: `
Abstract collegiate championship stadium stage backdrop,
deep navy blue, rich gold and vibrant emerald green floodlights,
stadium atmosphere and victory light beams,
clean championship podium stage, text-free blank backdrop.
`,

  neon: `
Abstract cyberpunk electronic stage backdrop,
deep midnight obsidian, fluorescent cyan, hot magenta and ultraviolet ambient glow,
glowing neon geometric rings and laser grid floor,
subtle techno atmospheric haze, text-free blank backdrop.
`,

  cinematic: `
Abstract Hollywood blockbuster movie poster backdrop,
deep slate charcoal, blazing crimson embers and anamorphic golden lens flares,
cinematic mist and explosive celebration lighting,
dramatic top-down key lighting, epic theatrical background, text-free blank backdrop.
`,

  traditional: `
Abstract traditional royal festival palace backdrop,
rich saffron, royal crimson, marigold amber and gold foil lighting,
warm brass diya lamp glow and temple floral rangoli ambient lighting,
luxury heritage palace atmosphere, text-free blank backdrop.
`,

  minimal: `
Abstract modern luxury minimalist studio backdrop,
monochrome dark granite, champagne gold architectural lines,
clean studio softbox lighting and gentle geometric shadows,
refined ultra-modern magazine background, text-free blank backdrop.
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

  return `Custom Style Influence:\n${prompt.trim()}\n`;
}

/*
|--------------------------------------------------------------------------
| Build fixed quality instructions
|--------------------------------------------------------------------------
*/

function buildQualityPrompt() {
  return `
Create an ULTRA-PREMIUM, photorealistic vertical background backdrop.

Requirements:
- 8K resolution aesthetic, ultra-sharp detail
- Masterpiece commercial lighting, realistic depth of field
- Atmospheric celebration lighting, bokeh, light beams, particle dust
- Clean, balanced composition tailored for a high-end celebration poster

CRITICAL CONSTRAINTS:
- ABSOLUTELY 100% BLANK AND TEXT-FREE
- NO TEXT, NO LETTERS, NO WORDS, NO NUMBERS, NO TYPOGRAPHY
- NO WATERMARKS, NO LOGOS, NO SIGNATURES, NO SIGNS
- NO HUMAN FACES OR BODY FIGURES (leave room for portrait overlay)
- Pure abstract background texture and stage lighting only.

Poster Aspect Ratio: 4:5 Vertical (1080x1350)
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
  const normalizedKey = String(style || DEFAULT_STYLE).toLowerCase();
  const selectedStyle =
    STYLE_PROMPTS[normalizedKey] ||
    STYLE_PROMPTS[DEFAULT_STYLE];

  const themePrompt = theme ? `Theme: ${theme}\n` : "";
  const colorPrompt = colors ? `Color Palette: ${colors}\n` : "";

  return `
${selectedStyle.trim()}

${themePrompt}${colorPrompt}${buildUserPrompt(prompt)}
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
    "grand overhead center spotlights with golden halo",
    "dramatic asymmetric rim-lighting with stadium rays",
    "soft ambient warm champagne fairy lights and bokeh",
    "high-voltage dual-color neon laser streaks and lens flare",
    "volumetric cinematic key light with floating golden embers",
    "crisp studio softbox lighting with luxury gold reflection",
  ];

  const decorationVariations = [
    "3D metallic chrome balloons with sparkling particle burst",
    "diagonal action speedlines and stadium celebration haze",
    "delicate golden laurel branches and victory star dust",
    "glowing geometric neon rings with ultraviolet fog",
    "cascading gold foil ribbons and crystal reflections",
    "floating rose gold confetti and soft floral filigrees",
  ];

  const styleKeys = Object.keys(STYLE_PROMPTS);
  const isMixMode = style === "mix" || style === "all";

  const prompts = [];

  for (let i = 0; i < count; i++) {
    // In mix mode, each variation gets a distinct style archetype!
    const effectiveStyle = isMixMode
      ? styleKeys[i % styleKeys.length]
      : style;

    prompts.push(
      `
${createPosterPrompt({
  style: effectiveStyle,
  prompt,
  theme,
  colors,
})}

Variation Lighting:
${lightingVariations[i % lightingVariations.length]}

Variation Atmosphere:
${decorationVariations[i % decorationVariations.length]}
`
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    );
  }

  return prompts;
}

module.exports = {
  createPosterPrompt,
  createPromptVariations,
  STYLE_PROMPTS,
};