const {
  generateTemplatePreview,
  generateVariationPreview,
  generateBatchPreviews,
  getTemplatePreview,
} = require(
  "../services/previewService"
);

/*
|--------------------------------------------------------------------------
| POST /api/previews/template
|--------------------------------------------------------------------------
*/

async function generateTemplatePreviewController(
  req,
  res,
  next
) {
  try {
    const {
      templateId,
      width,
      height,
      dynamicFields,
      force,
    } = req.body;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        error:
          "templateId is required.",
      });
    }

    const result =
      await generateTemplatePreview({
        templateId,
        width,
        height,
        dynamicFields,
        force:
          force === true,
      });

    return res.status(201).json({
      success: true,

      message: result.cached
        ? "Cached template preview returned."
        : "Template preview generated successfully.",

      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/previews/variation
|--------------------------------------------------------------------------
*/

async function generateVariationPreviewController(
  req,
  res,
  next
) {
  try {
    const {
      variation,
      width,
      height,
    } = req.body;

    if (!variation) {
      return res.status(400).json({
        success: false,
        error:
          "variation is required.",
      });
    }

    const result =
      await generateVariationPreview({
        variation,
        width,
        height,
      });

    return res.status(200).json({
      success: true,

      message:
        "Variation preview generated successfully.",

      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/previews/batch
|--------------------------------------------------------------------------
*/

async function generateBatchPreviewsController(
  req,
  res,
  next
) {
  try {
    const {
      templateIds,
      width,
      height,
      force,
    } = req.body;

    const result =
      await generateBatchPreviews({
        templateIds,
        width,
        height,
        force:
          force === true,
      });

    return res.status(200).json({
      success: true,

      message:
        "Template preview batch completed.",

      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| GET /api/previews/template/:templateId
|--------------------------------------------------------------------------
*/

async function getTemplatePreviewController(
  req,
  res,
  next
) {
  try {
    const {
      templateId,
    } = req.params;

    const preview =
      await getTemplatePreview({
        templateId,
      });

    if (!preview) {
      return res.status(404).json({
        success: false,
        error:
          "Preview not found.",
      });
    }

    return res.status(200).json({
      success: true,
      preview,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  generateTemplatePreviewController,
  generateVariationPreviewController,
  generateBatchPreviewsController,
  getTemplatePreviewController,
};