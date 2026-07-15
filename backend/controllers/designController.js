const {
  createDesign,
  listDesigns,
  getDesignById,
  updateDesign,
  duplicateDesign,
  deleteDesign,
} = require("../services/designService");

/*
|--------------------------------------------------------------------------
| POST /api/designs
|--------------------------------------------------------------------------
*/

async function createDesignController(
  req,
  res,
  next
) {
  try {
    const {
      ownerKey,
      title,
      templateId,
      designJson,
      thumbnailUrl,
      width,
      height,
      format,
    } = req.body;

    if (!designJson) {
      return res.status(400).json({
        success: false,
        error:
          "designJson is required to create a design.",
      });
    }

    const result = await createDesign({
      ownerKey,
      title,
      templateId,
      designJson,
      thumbnailUrl,
      width,
      height,
      format,
    });

    return res.status(201).json({
      success: true,
      message:
        "Design created successfully.",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| GET /api/designs
|--------------------------------------------------------------------------
*/

async function listDesignsController(
  req,
  res,
  next
) {
  try {
    const {
      ownerKey,
      page,
      limit,
      search,
      status,
    } = req.query;

    if (!ownerKey) {
      return res.status(400).json({
        success: false,
        error:
          "ownerKey query parameter is required.",
      });
    }

    const result = await listDesigns({
      ownerKey,
      page,
      limit,
      search,
      status,
    });

    return res.status(200).json({
      success: true,
      message:
        "Designs fetched successfully.",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| GET /api/designs/:designId
|--------------------------------------------------------------------------
*/

async function getDesignController(
  req,
  res,
  next
) {
  try {
    const { designId } = req.params;
    const { ownerKey } = req.query;

    if (!ownerKey) {
      return res.status(400).json({
        success: false,
        error:
          "ownerKey query parameter is required.",
      });
    }

    const design = await getDesignById({
      designId,
      ownerKey,
    });

    if (!design) {
      return res.status(404).json({
        success: false,
        error: "Design not found.",
      });
    }

    return res.status(200).json({
      success: true,
      design,
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| PUT /api/designs/:designId
|--------------------------------------------------------------------------
*/

async function updateDesignController(
  req,
  res,
  next
) {
  try {
    const { designId } = req.params;

    const editToken =
      req.headers["x-edit-token"];

    if (!editToken) {
      return res.status(401).json({
        success: false,
        error:
          "x-edit-token header is required.",
      });
    }

    const design = await updateDesign({
      designId,
      editToken,
      updates: req.body,
    });

    if (!design) {
      return res.status(404).json({
        success: false,
        error: "Design not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Design updated successfully.",
      design,
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/designs/:designId/duplicate
|--------------------------------------------------------------------------
*/

async function duplicateDesignController(
  req,
  res,
  next
) {
  try {
    const { designId } = req.params;

    const {
      ownerKey,
      title,
    } = req.body;

    if (!ownerKey) {
      return res.status(400).json({
        success: false,
        error:
          "ownerKey is required to duplicate a design.",
      });
    }

    const result = await duplicateDesign({
      designId,
      ownerKey,
      title,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Original design not found.",
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Design duplicated successfully.",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| DELETE /api/designs/:designId
|--------------------------------------------------------------------------
*/

async function deleteDesignController(
  req,
  res,
  next
) {
  try {
    const { designId } = req.params;

    const editToken =
      req.headers["x-edit-token"];

    if (!editToken) {
      return res.status(401).json({
        success: false,
        error:
          "x-edit-token header is required.",
      });
    }

    const deleted = await deleteDesign({
      designId,
      editToken,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Design not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Design deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createDesignController,
  listDesignsController,
  getDesignController,
  updateDesignController,
  duplicateDesignController,
  deleteDesignController,
};