const layouts = require("../templates/layouts/layouts");
const palettes = require("../templates/palettes/palettes");
const typographyStyles = require(
  "../templates/typography/typography"
);
const decorationSets = require(
  "../templates/decorations/decorations"
);

function createTemplateId(
  layoutId,
  paletteId,
  typographyId,
  decorationId
) {
  return [
    layoutId,
    paletteId,
    typographyId,
    decorationId,
  ].join("--");
}

function createTemplateName({
  layout,
  palette,
  typography,
  decoration,
}) {
  return `${palette.name} ${layout.name}`;
}

function calculateTrendingScore({
  layoutIndex,
  paletteIndex,
  typographyIndex,
  decorationIndex,
}) {
  const value =
    100 -
    ((layoutIndex * 7 +
      paletteIndex * 5 +
      typographyIndex * 3 +
      decorationIndex * 2) %
      45);

  return value;
}

function buildTemplate({
  layout,
  palette,
  typography,
  decoration,
  layoutIndex = 0,
  paletteIndex = 0,
  typographyIndex = 0,
  decorationIndex = 0,
}) {
  const id = createTemplateId(
    layout.id,
    palette.id,
    typography.id,
    decoration.id
  );

  const categorySet = new Set([
    layout.category,
    palette.category,
    typography.category,
    decoration.category,
  ]);

  const tagSet = new Set([
    ...layout.tags,
    ...palette.tags,
    ...typography.tags,
    ...decoration.tags,
  ]);

  return {
    id,
    name: createTemplateName({
      layout,
      palette,
      typography,
      decoration,
    }),

    category: layout.category,

    categories: Array.from(categorySet),

    tags: Array.from(tagSet),

    format: "instagram-portrait",

    canvas: {
      width: layout.canvas.width,
      height: layout.canvas.height,
    },

    preview: {
      type: "generated",
      gradient: palette.gradient,
      primaryColor: palette.colors.primary,
      secondaryColor: palette.colors.secondary,
      photoLayout: layout.id,
      decoration: decoration.id,
    },

    design: {
      layout,
      palette,
      typography,
      decoration,

      dynamicFields: {
        birthdayHeading: "HAPPY BIRTHDAY",
        studentName: "STUDENT NAME",
        department: "Department",
        year: "Year",
        rollNo: "Roll Number",
        birthdayQuote:
          "Wishing you happiness, success and wonderful memories.",
        studentPhoto: null,
        collegeName: null,
        collegeLogo: null,
      },
    },

    isPremium: true,

    trendingScore: calculateTrendingScore({
      layoutIndex,
      paletteIndex,
      typographyIndex,
      decorationIndex,
    }),
  };
}

function generateAllTemplates() {
  const templates = [];

  layouts.forEach((layout, layoutIndex) => {
    palettes.forEach((palette, paletteIndex) => {
      typographyStyles.forEach(
        (typography, typographyIndex) => {
          decorationSets.forEach(
            (decoration, decorationIndex) => {
              templates.push(
                buildTemplate({
                  layout,
                  palette,
                  typography,
                  decoration,
                  layoutIndex,
                  paletteIndex,
                  typographyIndex,
                  decorationIndex,
                })
              );
            }
          );
        }
      );
    });
  });

  return templates;
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function matchesSearch(template, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  const searchableText = [
    template.name,
    template.category,
    ...template.categories,
    ...template.tags,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(searchTerm);
}

function matchesCategory(template, category) {
  if (!category || category === "all") {
    return true;
  }

  return template.categories.includes(category);
}

function matchesPalette(template, palette) {
  if (!palette || palette === "all") {
    return true;
  }

  return template.design.palette.id === palette;
}

function matchesLayout(template, layout) {
  if (!layout || layout === "all") {
    return true;
  }

  return template.design.layout.id === layout;
}

function sortTemplates(templates, sortBy) {
  const sortedTemplates = [...templates];

  switch (sortBy) {
    case "name":
      return sortedTemplates.sort((first, second) =>
        first.name.localeCompare(second.name)
      );

    case "newest":
      return sortedTemplates.reverse();

    case "trending":
    default:
      return sortedTemplates.sort(
        (first, second) =>
          second.trendingScore - first.trendingScore
      );
  }
}

function getTemplates(options = {}) {
  const {
    page = 1,
    limit = 20,
    search = "",
    category = "all",
    palette = "all",
    layout = "all",
    sortBy = "trending",
  } = options;

  const safePage = Math.max(Number(page) || 1, 1);

  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    50
  );

  const normalizedSearch = normalizeText(search);
  const normalizedCategory = normalizeText(category);
  const normalizedPalette = normalizeText(palette);
  const normalizedLayout = normalizeText(layout);

  let templates = generateAllTemplates();

  templates = templates.filter((template) => {
    return (
      matchesSearch(template, normalizedSearch) &&
      matchesCategory(
        template,
        normalizedCategory
      ) &&
      matchesPalette(template, normalizedPalette) &&
      matchesLayout(template, normalizedLayout)
    );
  });

  templates = sortTemplates(templates, sortBy);

  const total = templates.length;
  const totalPages = Math.max(
    Math.ceil(total / safeLimit),
    1
  );

  const startIndex = (safePage - 1) * safeLimit;
  const endIndex = startIndex + safeLimit;

  const paginatedTemplates = templates.slice(
    startIndex,
    endIndex
  );

  return {
    templates: paginatedTemplates,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
}

function getTemplateById(templateId) {
  if (!templateId) {
    return null;
  }

  const parts = templateId.split("--");

  if (parts.length !== 4) {
    return null;
  }

  const [
    layoutId,
    paletteId,
    typographyId,
    decorationId,
  ] = parts;

  const layout = layouts.find(
    (item) => item.id === layoutId
  );

  const palette = palettes.find(
    (item) => item.id === paletteId
  );

  const typography = typographyStyles.find(
    (item) => item.id === typographyId
  );

  const decoration = decorationSets.find(
    (item) => item.id === decorationId
  );

  if (
    !layout ||
    !palette ||
    !typography ||
    !decoration
  ) {
    return null;
  }

  return buildTemplate({
    layout,
    palette,
    typography,
    decoration,
  });
}

function getTemplateFilters() {
  const categories = Array.from(
    new Set([
      ...layouts.map((item) => item.category),
      ...palettes.map((item) => item.category),
      ...typographyStyles.map(
        (item) => item.category
      ),
      ...decorationSets.map(
        (item) => item.category
      ),
    ])
  ).sort();

  return {
    categories,
    layouts: layouts.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
    })),
    palettes: palettes.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      colors: item.colors,
      gradient: item.gradient,
    })),
    typography: typographyStyles.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
    })),
    decorations: decorationSets.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
    })),
    combinationCount:
      layouts.length *
      palettes.length *
      typographyStyles.length *
      decorationSets.length,
  };
}

function generateSimilarTemplates(
  templateId,
  count = 12
) {
  const originalTemplate =
    getTemplateById(templateId);

  if (!originalTemplate) {
    return null;
  }

  const safeCount = Math.min(
    Math.max(Number(count) || 12, 1),
    30
  );

  const allTemplates = generateAllTemplates();

  const similarTemplates = allTemplates
    .filter(
      (template) =>
        template.id !== originalTemplate.id
    )
    .map((template) => {
      let similarityScore = 0;

      if (
        template.design.palette.category ===
        originalTemplate.design.palette.category
      ) {
        similarityScore += 4;
      }

      if (
        template.design.layout.category ===
        originalTemplate.design.layout.category
      ) {
        similarityScore += 3;
      }

      if (
        template.design.typography.category ===
        originalTemplate.design.typography.category
      ) {
        similarityScore += 2;
      }

      if (
        template.design.decoration.category ===
        originalTemplate.design.decoration.category
      ) {
        similarityScore += 2;
      }

      if (
        template.design.palette.id ===
        originalTemplate.design.palette.id
      ) {
        similarityScore += 3;
      }

      return {
        template,
        similarityScore,
      };
    })
    .sort(
      (first, second) =>
        second.similarityScore -
        first.similarityScore
    )
    .slice(0, safeCount)
    .map((item) => item.template);

  return similarTemplates;
}

module.exports = {
  getTemplates,
  getTemplateById,
  getTemplateFilters,
  generateSimilarTemplates,
};