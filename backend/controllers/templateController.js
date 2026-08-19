const {
  getTemplates,
  getTemplateById,
  getTemplateFilters,
  generateSimilarTemplates,
} = require("../services/templateEngine");

const {
  createTemplatePreviewSvg,
} = require("../utils/previewUtils");

const supabase = require(
  "../config/supabase"
);

async function listTemplates(
  req,
  res,
  next
) {
  try {
    const result = getTemplates({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      category: req.query.category,
      palette: req.query.palette,
      layout: req.query.layout,
      sortBy: req.query.sortBy,
    });

    const templateIds =
      result.templates.map(
        (template) =>
          template.id
      );

    let previewMap = new Map();

    if (templateIds.length) {
      try {
        const {
          data: previews,
          error,
        } = await supabase
          .from("template_previews")
          .select(
            "template_id, preview_url"
          )
          .in(
            "template_id",
            templateIds
          );

        if (!error && previews) {
          previewMap = new Map(
            previews.map(
              (preview) => [
                preview.template_id,
                preview.preview_url,
              ]
            )
          );
        }
      } catch (e) {
        // Supabase offline/not configured -> fallback to dynamic vector SVG preview
      }
    }

    const templates =
      result.templates.map(
        (template) => ({
          ...template,

          preview: {
            ...template.preview,

            url:
              previewMap.get(
                template.id
              ) || `/api/templates/${encodeURIComponent(template.id)}/preview.svg`,
          },
        })
      );

    return res.status(200).json({
      success: true,

      message:
        "Templates fetched successfully.",

      templates,

      pagination:
        result.pagination,
    });
  } catch (error) {
    return next(error);
  }
}

function showTemplate(req, res, next) {
  try {
    const template = getTemplateById(
      req.params.templateId
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        error: "Template not found.",
      });
    }

    template.preview = {
      ...template.preview,
      url:
        template.preview?.url ||
        `/api/templates/${encodeURIComponent(template.id)}/preview.svg`,
    };

    return res.status(200).json({
      success: true,
      template,
    });
  } catch (error) {
    return next(error);
  }
}

function getTemplateSvgPreview(req, res, next) {
  try {
    const template = getTemplateById(
      req.params.templateId
    );

    if (!template) {
      return res.status(404).send("Template not found.");
    }

    const svgBuffer = createTemplatePreviewSvg({
      template,
      width: 540,
      height: 675,
    });

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );

    return res.status(200).send(svgBuffer);
  } catch (error) {
    return next(error);
  }
}

function listTemplateFilters(req, res, next) {
  try {
    const filters = getTemplateFilters();

    return res.status(200).json({
      success: true,
      filters,
    });
  } catch (error) {
    return next(error);
  }
}

function listSimilarTemplates(req, res, next) {
  try {
    const templates = generateSimilarTemplates(
      req.params.templateId,
      req.query.count
    );

    if (!templates) {
      return res.status(404).json({
        success: false,
        error: "Original template not found.",
      });
    }

    const enriched = templates.map((template) => ({
      ...template,
      preview: {
        ...template.preview,
        url:
          template.preview?.url ||
          `/api/templates/${encodeURIComponent(template.id)}/preview.svg`,
      },
    }));

    return res.status(200).json({
      success: true,
      templates: enriched,
      total: enriched.length,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listTemplates,
  showTemplate,
  getTemplateSvgPreview,
  listTemplateFilters,
  listSimilarTemplates,
};