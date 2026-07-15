const {
  uploadAsset,
  listAssets,
  getAssetById,
  deleteAsset,
} = require("../services/assetService");

/*
|--------------------------------------------------------------------------
| Upload asset
|--------------------------------------------------------------------------
*/

async function uploadAssetController(
  req,
  res,
  next
) {
  try {
    const {
      assetType,
      ownerKey,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error:
          "Please select an image file.",
      });
    }

    if (!assetType) {
      return res.status(400).json({
        success: false,
        error:
          "assetType is required.",
      });
    }

    if (!ownerKey) {
      return res.status(400).json({
        success: false,
        error:
          "ownerKey is required.",
      });
    }

    const result = await uploadAsset({
      file: req.file,
      assetType,
      ownerKey,
    });

    return res.status(201).json({
      success: true,
      message:
        "Asset uploaded successfully.",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| List assets
|--------------------------------------------------------------------------
*/

async function listAssetsController(
  req,
  res,
  next
) {
  try {
    const {
      ownerKey,
      assetType,
      page,
      limit,
    } = req.query;

    if (!ownerKey) {
      return res.status(400).json({
        success: false,
        error:
          "ownerKey query parameter is required.",
      });
    }

    const result = await listAssets({
      ownerKey,
      assetType,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message:
        "Assets fetched successfully.",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Get one asset
|--------------------------------------------------------------------------
*/

async function getAssetController(
  req,
  res,
  next
) {
  try {
    const {
      assetId,
    } = req.params;

    const {
      ownerKey,
    } = req.query;

    if (!ownerKey) {
      return res.status(400).json({
        success: false,
        error:
          "ownerKey query parameter is required.",
      });
    }

    const asset = await getAssetById({
      assetId,
      ownerKey,
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: "Asset not found.",
      });
    }

    return res.status(200).json({
      success: true,
      asset,
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Delete asset
|--------------------------------------------------------------------------
*/

async function deleteAssetController(
  req,
  res,
  next
) {
  try {
    const {
      assetId,
    } = req.params;

    const {
      ownerKey,
    } = req.body;

    if (!ownerKey) {
      return res.status(400).json({
        success: false,
        error:
          "ownerKey is required.",
      });
    }

    const result = await deleteAsset({
      assetId,
      ownerKey,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Asset not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Asset deleted successfully.",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  uploadAssetController,
  listAssetsController,
  getAssetController,
  deleteAssetController,
};