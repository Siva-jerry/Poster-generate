const layouts = require(
  "../templates/layouts/layouts"
);

const palettes = require(
  "../templates/palettes/palettes"
);

const typographyStyles = require(
  "../templates/typography/typography"
);

const decorationSets = require(
  "../templates/decorations/decorations"
);

/*
|--------------------------------------------------------------------------
| General helpers
|--------------------------------------------------------------------------
*/

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getRandomItem(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(
    Math.random() * items.length
  );

  return items[randomIndex];
}

function shuffleArray(items) {
  const result = [...items];

  for (
    let currentIndex = result.length - 1;
    currentIndex > 0;
    currentIndex -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (currentIndex + 1)
    );

    [
      result[currentIndex],
      result[randomIndex],
    ] = [
      result[randomIndex],
      result[currentIndex],
    ];
  }

  return result;
}

function uniqueById(items) {
  const seenIds = new Set();

  return items.filter((item) => {
    if (!item?.id || seenIds.has(item.id)) {
      return false;
    }

    seenIds.add(item.id);

    return true;
  });
}

/*
|--------------------------------------------------------------------------
| Category and tag compatibility
|--------------------------------------------------------------------------
*/

function getComponentSearchText(component) {
  return [
    component?.id,
    component?.name,
    component?.category,
    ...(component?.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function componentMatchesCategory(
  component,
  category
) {
  const normalizedCategory =
    normalizeValue(category);

  if (
    !normalizedCategory ||
    normalizedCategory === "all"
  ) {
    return true;
  }

  const searchableText =
    getComponentSearchText(component);

  return searchableText.includes(
    normalizedCategory
  );
}

function calculateCompatibilityScore(
  firstComponent,
  secondComponent
) {
  if (!firstComponent || !secondComponent) {
    return 0;
  }

  let score = 0;

  if (
    firstComponent.category ===
    secondComponent.category
  ) {
    score += 5;
  }

  const firstTags = new Set(
    firstComponent.tags || []
  );

  const secondTags =
    secondComponent.tags || [];

  secondTags.forEach((tag) => {
    if (firstTags.has(tag)) {
      score += 2;
    }
  });

  return score;
}

/*
|--------------------------------------------------------------------------
| Layout selection
|--------------------------------------------------------------------------
*/

function getLayoutsByCategory(category) {
  const matchingLayouts = layouts.filter(
    (layout) =>
      componentMatchesCategory(
        layout,
        category
      )
  );

  return matchingLayouts.length
    ? matchingLayouts
    : layouts;
}

function selectLayout({
  category,
  preferredLayoutId,
  excludeLayoutIds = [],
}) {
  if (preferredLayoutId) {
    const preferredLayout = layouts.find(
      (layout) =>
        layout.id === preferredLayoutId
    );

    if (
      preferredLayout &&
      !excludeLayoutIds.includes(
        preferredLayout.id
      )
    ) {
      return preferredLayout;
    }
  }

  let candidates =
    getLayoutsByCategory(category);

  candidates = candidates.filter(
    (layout) =>
      !excludeLayoutIds.includes(layout.id)
  );

  if (!candidates.length) {
    candidates = layouts;
  }

  return getRandomItem(candidates);
}

/*
|--------------------------------------------------------------------------
| Palette selection
|--------------------------------------------------------------------------
*/

function getPalettesByCategory(category) {
  const matchingPalettes = palettes.filter(
    (palette) =>
      componentMatchesCategory(
        palette,
        category
      )
  );

  return matchingPalettes.length
    ? matchingPalettes
    : palettes;
}

function selectPalette({
  category,
  preferredPaletteId,
  layout,
  excludePaletteIds = [],
}) {
  if (preferredPaletteId) {
    const preferredPalette = palettes.find(
      (palette) =>
        palette.id === preferredPaletteId
    );

    if (
      preferredPalette &&
      !excludePaletteIds.includes(
        preferredPalette.id
      )
    ) {
      return preferredPalette;
    }
  }

  let candidates =
    getPalettesByCategory(category);

  candidates = candidates.filter(
    (palette) =>
      !excludePaletteIds.includes(
        palette.id
      )
  );

  if (!candidates.length) {
    candidates = palettes;
  }

  candidates = candidates
    .map((palette) => ({
      palette,
      score:
        calculateCompatibilityScore(
          layout,
          palette
        ) + Math.random(),
    }))
    .sort(
      (first, second) =>
        second.score - first.score
    )
    .map((item) => item.palette);

  const topCandidates = candidates.slice(
    0,
    Math.min(4, candidates.length)
  );

  return getRandomItem(topCandidates);
}

/*
|--------------------------------------------------------------------------
| Typography selection
|--------------------------------------------------------------------------
*/

function getTypographyByCategory(category) {
  const matchingTypography =
    typographyStyles.filter((style) =>
      componentMatchesCategory(
        style,
        category
      )
    );

  return matchingTypography.length
    ? matchingTypography
    : typographyStyles;
}

function selectTypography({
  category,
  preferredTypographyId,
  layout,
  palette,
  excludeTypographyIds = [],
}) {
  if (preferredTypographyId) {
    const preferredTypography =
      typographyStyles.find(
        (style) =>
          style.id ===
          preferredTypographyId
      );

    if (
      preferredTypography &&
      !excludeTypographyIds.includes(
        preferredTypography.id
      )
    ) {
      return preferredTypography;
    }
  }

  let candidates =
    getTypographyByCategory(category);

  candidates = candidates.filter(
    (style) =>
      !excludeTypographyIds.includes(
        style.id
      )
  );

  if (!candidates.length) {
    candidates = typographyStyles;
  }

  candidates = candidates
    .map((style) => ({
      style,

      score:
        calculateCompatibilityScore(
          layout,
          style
        ) +
        calculateCompatibilityScore(
          palette,
          style
        ) +
        Math.random(),
    }))
    .sort(
      (first, second) =>
        second.score - first.score
    )
    .map((item) => item.style);

  const topCandidates = candidates.slice(
    0,
    Math.min(4, candidates.length)
  );

  return getRandomItem(topCandidates);
}

/*
|--------------------------------------------------------------------------
| Decoration selection
|--------------------------------------------------------------------------
*/

function getDecorationsByCategory(category) {
  const matchingDecorations =
    decorationSets.filter((decoration) =>
      componentMatchesCategory(
        decoration,
        category
      )
    );

  return matchingDecorations.length
    ? matchingDecorations
    : decorationSets;
}

function selectDecoration({
  category,
  preferredDecorationId,
  layout,
  palette,
  typography,
  excludeDecorationIds = [],
}) {
  if (preferredDecorationId) {
    const preferredDecoration =
      decorationSets.find(
        (decoration) =>
          decoration.id ===
          preferredDecorationId
      );

    if (
      preferredDecoration &&
      !excludeDecorationIds.includes(
        preferredDecoration.id
      )
    ) {
      return preferredDecoration;
    }
  }

  let candidates =
    getDecorationsByCategory(category);

  candidates = candidates.filter(
    (decoration) =>
      !excludeDecorationIds.includes(
        decoration.id
      )
  );

  if (!candidates.length) {
    candidates = decorationSets;
  }

  candidates = candidates
    .map((decoration) => ({
      decoration,

      score:
        calculateCompatibilityScore(
          layout,
          decoration
        ) +
        calculateCompatibilityScore(
          palette,
          decoration
        ) +
        calculateCompatibilityScore(
          typography,
          decoration
        ) +
        Math.random(),
    }))
    .sort(
      (first, second) =>
        second.score - first.score
    )
    .map((item) => item.decoration);

  const topCandidates = candidates.slice(
    0,
    Math.min(4, candidates.length)
  );

  return getRandomItem(topCandidates);
}

/*
|--------------------------------------------------------------------------
| Compatible component collections
|--------------------------------------------------------------------------
*/

function getCompatibleComponents({
  category,
  layoutId,
  paletteId,
  typographyId,
  decorationId,
}) {
  const selectedLayout =
    layouts.find(
      (item) => item.id === layoutId
    ) || null;

  const selectedPalette =
    palettes.find(
      (item) => item.id === paletteId
    ) || null;

  const selectedTypography =
    typographyStyles.find(
      (item) => item.id === typographyId
    ) || null;

  const selectedDecoration =
    decorationSets.find(
      (item) => item.id === decorationId
    ) || null;

  const layoutOptions = uniqueById(
    shuffleArray(
      getLayoutsByCategory(category)
    )
  );

  const paletteOptions = uniqueById(
    shuffleArray(
      getPalettesByCategory(category)
    )
  );

  const typographyOptions = uniqueById(
    shuffleArray(
      getTypographyByCategory(category)
    )
  );

  const decorationOptions = uniqueById(
    shuffleArray(
      getDecorationsByCategory(category)
    )
  );

  return {
    selected: {
      layout: selectedLayout,
      palette: selectedPalette,
      typography: selectedTypography,
      decoration: selectedDecoration,
    },

    options: {
      layouts: layoutOptions,
      palettes: paletteOptions,
      typography: typographyOptions,
      decorations: decorationOptions,
    },
  };
}

module.exports = {
  layouts,
  palettes,
  typographyStyles,
  decorationSets,
  normalizeValue,
  getRandomItem,
  shuffleArray,
  calculateCompatibilityScore,
  selectLayout,
  selectPalette,
  selectTypography,
  selectDecoration,
  getCompatibleComponents,
};