const {
  getTemplates,
  getTemplateById,
  getTemplateFilters,
  generateSimilarTemplates,
} = require("../services/templateEngine");

function listTemplates(req, res, next) {
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

    return res.status(200).json({
      success: true,
      message: "Templates fetched successfully.",
      ...result,
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