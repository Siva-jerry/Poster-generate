const {
  generateAIBackground,
} = require(
  "../services/aiBackgroundService"
);

async function generateBackgroundController(
  req,
  res,
  next
) {
  try {
    const {
      ownerKey,
      style,
      mood,
      primaryColor,
      secondaryColor,
      customPrompt,
      seed,
    } = req.body;

    if (!ownerKey) {
      return res.status(400).json({
        success: false,
        error:
          "ownerKey is required.",
      });
    }

    const result =
      await generateAIBackground({
        ownerKey,
        style,
        mood,
        primaryColor,
        secondaryColor,
        customPrompt,
        seed,
      });

    return res.status(201).json({
      success: true,

      message:
        "AI background generated successfully.",

      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  generateBackgroundController,
};