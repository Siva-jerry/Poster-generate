const {
  removeAssetBackground,
} = require(
  "../services/backgroundRemovalService"
);

/*
|--------------------------------------------------------------------------
| POST /api/background-removal
|--------------------------------------------------------------------------
*/

async function removeBackgroundController(
  req,
  res,
  next
) {
  try {
    const {
      assetId,
      ownerKey,
    } = req.body;

    if (!assetId) {
      return res.status(400).json({
        success: false,
        error:
          "assetId is required.",
      });
    }

    if (!ownerKey) {
      return res.status(400).json({
        success: false,
        error:
          "ownerKey is required.",
      });
    }

    const result =
      await removeAssetBackground({
        assetId,
        ownerKey,
      });

    if (!result) {
      return res.status(404).json({
        success: false,
        error:
          "Source image was not found.",
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Background removed successfully.",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  removeBackgroundController,
};