const {
  generateVariations,
  generateMoreVariations,
  getVariationOptions,
} = require(
  "../services/variationEngine"
);

/*
|--------------------------------------------------------------------------
| POST /api/variations/generate
|--------------------------------------------------------------------------
*/

function generateVariationsController(
  req,
  res,
  next
) {
  try {
    const {
      templateId,
      mode,
      category,
      count,
      layoutId,
      paletteId,
      typographyId,
      decorationId,
      dynamicFields,
      aiBackground,
    } = req.body;

    const result =
      generateVariations({
        templateId,
        mode,
        category,
        count,
        layoutId,
        paletteId,
        typographyId,
        decorationId,
        dynamicFields,
        aiBackground,
      });

    return res.status(200).json({
      success: true,

      message:
        "Design variations generated successfully.",

      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/variations/more
|--------------------------------------------------------------------------
*/

function generateMoreController(
  req,
  res,
  next
) {
  try {
    const {
      variation,
      count,
      mode,
    } = req.body;

    if (!variation) {
      return res.status(400).json({
        success: false,
        error:
          "variation is required.",
      });
    }

    const result =
      generateMoreVariations({
        variation,
        count,
        mode,
      });

    return res.status(200).json({
      success: true,

      message:
        "Additional variations generated successfully.",

      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| GET /api/variations/options
|--------------------------------------------------------------------------
*/

function getVariationOptionsController(
  req,
  res,
  next
) {
  try {
    const {
      category,
      layoutId,
      paletteId,
      typographyId,
      decorationId,
    } = req.query;

    const result =
      getVariationOptions({
        category,
        layoutId,
        paletteId,
        typographyId,
        decorationId,
      });

    return res.status(200).json({
      success: true,
      options: result,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  generateVariationsController,
  generateMoreController,
  getVariationOptionsController,
};