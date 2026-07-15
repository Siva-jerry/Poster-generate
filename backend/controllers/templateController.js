const {
  getTemplates,
  getTemplateById,
  getTemplateFilters,
  generateSimilarTemplates,
} = require("../services/templateEngine");

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

      if (error) {
        console.error(
          "Unable to fetch template previews:",
          error.message
        );
      } else {
        previewMap = new Map(
          (previews || []).map(
            (preview) => [
              preview.template_id,
              preview.preview_url,
            ]
          )
        );
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
              ) || null,
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

    return res.status(200).json({
      success: true,
      template,
    });
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

    return res.status(200).json({
      success: true,
      templates,
      total: templates.length,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listTemplates,
  showTemplate,
  listTemplateFilters,
  listSimilarTemplates,
};