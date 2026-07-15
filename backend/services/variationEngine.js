const crypto = require("crypto");

const {
  layouts,
  palettes,
  typographyStyles,
  decorationSets,
  normalizeValue,
  selectLayout,
  selectPalette,
  selectTypography,
  selectDecoration,
  getCompatibleComponents,
} = require("./layoutEngine");

const {
  getTemplateById,
} = require("./templateEngine");

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const supportedVariationModes =
  new Set([
    "complete",
    "similar",
    "colors",
    "layout",
    "typography",
    "decorations",
  ]);

const defaultDynamicFields = {
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
};

/*
|--------------------------------------------------------------------------
| Utility helpers
|--------------------------------------------------------------------------
*/

function createVariationId() {
  return `variation_${crypto
    .randomBytes(10)
    .toString("hex")}`;
}

function createTemplateId({
  layout,
  palette,
  typography,
  decoration,
}) {
  return [
    layout.id,
    palette.id,
    typography.id,
    decoration.id,
  ].join("--");
}

function createVariationName({
  layout,
  palette,
  typography,
}) {
  return [
    palette.name,
    layout.name,
    typography.name,
  ].join(" · ");
}

function normalizeVariationMode(mode) {
  const normalizedMode =
    normalizeValue(mode || "complete");

  return supportedVariationModes.has(
    normalizedMode
  )
    ? normalizedMode
    : "complete";
}

function normalizeCount(count) {
  return Math.min(
    Math.max(Number(count) || 12, 1),
    30
  );
}

function normalizeDynamicFields(
  dynamicFields
) {
  if (
    !dynamicFields ||
    typeof dynamicFields !== "object" ||
    Array.isArray(dynamicFields)
  ) {
    return {
      ...defaultDynamicFields,
    };
  }

  return {
    ...defaultDynamicFields,
    ...dynamicFields,
  };
}

function createTags({
  layout,
  palette,
  typography,
  decoration,
}) {
  return Array.from(
    new Set([
      ...(layout.tags || []),
      ...(palette.tags || []),
      ...(typography.tags || []),
      ...(decoration.tags || []),
    ])
  );
}

function createCategories({
  layout,
  palette,
  typography,
  decoration,
}) {
  return Array.from(
    new Set([
      layout.category,
      palette.category,
      typography.category,
      decoration.category,
    ])
  );
}

function createSignature({
  layout,
  palette,
  typography,
  decoration,
}) {
  return [
    layout.id,
    palette.id,
    typography.id,
    decoration.id,
  ].join("|");
}

/*
|--------------------------------------------------------------------------
| Build one variation result
|--------------------------------------------------------------------------
*/

function buildVariation({
  layout,
  palette,
  typography,
  decoration,
  dynamicFields,
  sourceTemplateId,
  aiBackground,
  mode,
  index,
}) {
  const templateId = createTemplateId({
    layout,
    palette,
    typography,
    decoration,
  });

  return {
    id: createVariationId(),

    templateId,

    sourceTemplateId:
      sourceTemplateId || null,

    name: createVariationName({
      layout,
      palette,
      typography,
    }),

    variationNumber: index + 1,

    mode,

    category: layout.category,

    categories: createCategories({
      layout,
      palette,
      typography,
      decoration,
    }),

    tags: createTags({
      layout,
      palette,
      typography,
      decoration,
    }),

    format: "instagram-portrait",

    canvas: {
      width: layout.canvas.width,
      height: layout.canvas.height,
    },

    preview: {
      type: aiBackground
        ? "ai-background"
        : "generated-gradient",

      backgroundUrl:
        aiBackground?.publicUrl || null,

      backgroundAssetId:
        aiBackground?.id || null,

      gradient:
        aiBackground
          ? null
          : palette.gradient,

      primaryColor:
        palette.colors.primary,

      secondaryColor:
        palette.colors.secondary,

      photoLayout: layout.id,

      decoration:
        decoration.id,
    },

    design: {
      version: "1.0",

      layout,
      palette,
      typography,
      decoration,

      background: aiBackground
        ? {
            type: "image",
            assetId:
              aiBackground.id,
            url:
              aiBackground.publicUrl,
          }
        : {
            type: "gradient",
            gradient:
              palette.gradient,
          },

      dynamicFields:
        normalizeDynamicFields(
          dynamicFields
        ),
    },

    editable: true,

    isPremium: true,
  };
}

/*
|--------------------------------------------------------------------------
| Base template resolution
|--------------------------------------------------------------------------
*/

function resolveBaseTemplate(
  templateId
) {
  if (!templateId) {
    return null;
  }

  return getTemplateById(templateId);
}

function getBaseComponents(
  baseTemplate
) {
  if (!baseTemplate) {
    return {
      layout: null,
      palette: null,
      typography: null,
      decoration: null,
    };
  }

  return {
    layout:
      baseTemplate.design.layout,

    palette:
      baseTemplate.design.palette,

    typography:
      baseTemplate.design.typography,

    decoration:
      baseTemplate.design.decoration,
  };
}

/*
|--------------------------------------------------------------------------
| Component selection by mode
|--------------------------------------------------------------------------
*/

function selectComponentsForMode({
  mode,
  category,
  baseComponents,
  preferred,
  exclusions,
}) {
  const baseLayout =
    baseComponents.layout;

  const basePalette =
    baseComponents.palette;

  const baseTypography =
    baseComponents.typography;

  const baseDecoration =
    baseComponents.decoration;

  let layout;
  let palette;
  let typography;
  let decoration;

  if (mode === "colors") {
    layout =
      baseLayout ||
      selectLayout({
        category,
        preferredLayoutId:
          preferred.layoutId,
      });

    typography =
      baseTypography ||
      selectTypography({
        category,
        preferredTypographyId:
          preferred.typographyId,
        layout,
        palette: null,
      });

    decoration =
      baseDecoration ||
      selectDecoration({
        category,
        preferredDecorationId:
          preferred.decorationId,
        layout,
        palette: null,
        typography,
      });

    palette = selectPalette({
      category,
      preferredPaletteId:
        preferred.paletteId,
      layout,
      excludePaletteIds:
        exclusions.paletteIds,
    });

    return {
      layout,
      palette,
      typography,
      decoration,
    };
  }

  if (mode === "layout") {
    palette =
      basePalette ||
      selectPalette({
        category,
        preferredPaletteId:
          preferred.paletteId,
        layout: null,
      });

    typography =
      baseTypography ||
      selectTypography({
        category,
        preferredTypographyId:
          preferred.typographyId,
        layout: null,
        palette,
      });

    decoration =
      baseDecoration ||
      selectDecoration({
        category,
        preferredDecorationId:
          preferred.decorationId,
        layout: null,
        palette,
        typography,
      });

    layout = selectLayout({
      category,
      preferredLayoutId:
        preferred.layoutId,
      excludeLayoutIds:
        exclusions.layoutIds,
    });

    return {
      layout,
      palette,
      typography,
      decoration,
    };
  }

  if (mode === "typography") {
    layout =
      baseLayout ||
      selectLayout({
        category,
        preferredLayoutId:
          preferred.layoutId,
      });

    palette =
      basePalette ||
      selectPalette({
        category,
        preferredPaletteId:
          preferred.paletteId,
        layout,
      });

    decoration =
      baseDecoration ||
      selectDecoration({
        category,
        preferredDecorationId:
          preferred.decorationId,
        layout,
        palette,
        typography: null,
      });

    typography =
      selectTypography({
        category,
        preferredTypographyId:
          preferred.typographyId,
        layout,
        palette,
        excludeTypographyIds:
          exclusions.typographyIds,
      });

    return {
      layout,
      palette,
      typography,
      decoration,
    };
  }

  if (mode === "decorations") {
    layout =
      baseLayout ||
      selectLayout({
        category,
        preferredLayoutId:
          preferred.layoutId,
      });

    palette =
      basePalette ||
      selectPalette({
        category,
        preferredPaletteId:
          preferred.paletteId,
        layout,
      });

    typography =
      baseTypography ||
      selectTypography({
        category,
        preferredTypographyId:
          preferred.typographyId,
        layout,
        palette,
      });

    decoration = selectDecoration({
      category,
      preferredDecorationId:
        preferred.decorationId,
      layout,
      palette,
      typography,
      excludeDecorationIds:
        exclusions.decorationIds,
    });

    return {
      layout,
      palette,
      typography,
      decoration,
    };
  }

  if (mode === "similar") {
    layout = selectLayout({
      category:
        baseLayout?.category ||
        category,
      preferredLayoutId:
        preferred.layoutId,
    });

    palette = selectPalette({
      category:
        basePalette?.category ||
        category,
      preferredPaletteId:
        preferred.paletteId,
      layout,
    });

    typography =
      selectTypography({
        category:
          baseTypography?.category ||
          category,
        preferredTypographyId:
          preferred.typographyId,
        layout,
        palette,
      });

    decoration =
      selectDecoration({
        category:
          baseDecoration?.category ||
          category,
        preferredDecorationId:
          preferred.decorationId,
        layout,
        palette,
        typography,
      });

    return {
      layout,
      palette,
      typography,
      decoration,
    };
  }

  layout = selectLayout({
    category,
    preferredLayoutId:
      preferred.layoutId,
  });

  palette = selectPalette({
    category,
    preferredPaletteId:
      preferred.paletteId,
    layout,
  });

  typography = selectTypography({
    category,
    preferredTypographyId:
      preferred.typographyId,
    layout,
    palette,
  });

  decoration = selectDecoration({
    category,
    preferredDecorationId:
      preferred.decorationId,
    layout,
    palette,
    typography,
  });

  return {
    layout,
    palette,
    typography,
    decoration,
  };
}

/*
|--------------------------------------------------------------------------
| Generate variations
|--------------------------------------------------------------------------
*/

function generateVariations({
  templateId,
  mode = "complete",
  category = "all",
  count = 12,
  layoutId,
  paletteId,
  typographyId,
  decorationId,
  dynamicFields,
  aiBackground,
}) {
  const safeMode =
    normalizeVariationMode(mode);

  const safeCount =
    normalizeCount(count);

  const baseTemplate =
    resolveBaseTemplate(templateId);

  if (
    templateId &&
    !baseTemplate
  ) {
    const error = new Error(
      "The selected template could not be found."
    );

    error.statusCode = 404;

    throw error;
  }

  const baseComponents =
    getBaseComponents(baseTemplate);

  const preferred = {
    layoutId,
    paletteId,
    typographyId,
    decorationId,
  };

  const exclusions = {
    layoutIds: [],
    paletteIds: [],
    typographyIds: [],
    decorationIds: [],
  };

  const usedSignatures = new Set();

  const variations = [];

  let attempts = 0;

  const maximumAttempts =
    safeCount * 20;

  while (
    variations.length < safeCount &&
    attempts < maximumAttempts
  ) {
    attempts += 1;

    const components =
      selectComponentsForMode({
        mode: safeMode,
        category:
          normalizeValue(category) ||
          "all",
        baseComponents,
        preferred,
        exclusions,
      });

    if (
      !components.layout ||
      !components.palette ||
      !components.typography ||
      !components.decoration
    ) {
      continue;
    }

    const signature =
      createSignature(components);

    if (usedSignatures.has(signature)) {
      continue;
    }

    usedSignatures.add(signature);

    variations.push(
      buildVariation({
        ...components,

        dynamicFields,

        sourceTemplateId:
          templateId || null,

        aiBackground:
          aiBackground || null,

        mode: safeMode,

        index:
          variations.length,
      })
    );

    if (safeMode === "colors") {
      exclusions.paletteIds.push(
        components.palette.id
      );
    }

    if (safeMode === "layout") {
      exclusions.layoutIds.push(
        components.layout.id
      );
    }

    if (
      safeMode === "typography"
    ) {
      exclusions.typographyIds.push(
        components.typography.id
      );
    }

    if (
      safeMode === "decorations"
    ) {
      exclusions.decorationIds.push(
        components.decoration.id
      );
    }
  }

  return {
    variations,

    meta: {
      requestedCount:
        safeCount,

      generatedCount:
        variations.length,

      mode: safeMode,

      sourceTemplateId:
        templateId || null,

      category:
        normalizeValue(category) ||
        "all",

      usedAIBackground:
        Boolean(aiBackground),

      availableComponents: {
        layouts:
          layouts.length,

        palettes:
          palettes.length,

        typography:
          typographyStyles.length,

        decorations:
          decorationSets.length,

        maximumCombinations:
          layouts.length *
          palettes.length *
          typographyStyles.length *
          decorationSets.length,
      },
    },
  };
}

/*
|--------------------------------------------------------------------------
| Generate more from an existing variation
|--------------------------------------------------------------------------
*/

function generateMoreVariations({
  variation,
  count = 12,
  mode = "similar",
}) {
  if (
    !variation ||
    typeof variation !== "object"
  ) {
    const error = new Error(
      "variation is required."
    );

    error.statusCode = 400;

    throw error;
  }

  const templateId =
    variation.templateId ||
    variation.template_id;

  return generateVariations({
    templateId,
    count,
    mode,

    category:
      variation.category ||
      "all",

    dynamicFields:
      variation.design
        ?.dynamicFields,

    aiBackground:
      variation.design
        ?.background?.type ===
      "image"
        ? {
            id:
              variation.design
                .background
                .assetId,

            publicUrl:
              variation.design
                .background.url,
          }
        : null,
  });
}

/*
|--------------------------------------------------------------------------
| Get variation component options
|--------------------------------------------------------------------------
*/

function getVariationOptions({
  category,
  layoutId,
  paletteId,
  typographyId,
  decorationId,
}) {
  return getCompatibleComponents({
    category,
    layoutId,
    paletteId,
    typographyId,
    decorationId,
  });
}

module.exports = {
  generateVariations,
  generateMoreVariations,
  getVariationOptions,
};