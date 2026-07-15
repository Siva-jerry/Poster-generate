const express = require("express");

const {
  createDesignController,
  listDesignsController,
  getDesignController,
  updateDesignController,
  duplicateDesignController,
  deleteDesignController,
} = require("../controllers/designController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| POST /api/designs
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  createDesignController
);

/*
|--------------------------------------------------------------------------
| GET /api/designs
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  listDesignsController
);

/*
|--------------------------------------------------------------------------
| POST /api/designs/:designId/duplicate
|--------------------------------------------------------------------------
*/

router.post(
  "/:designId/duplicate",
  duplicateDesignController
);

/*
|--------------------------------------------------------------------------
| GET /api/designs/:designId
|--------------------------------------------------------------------------
*/

router.get(
  "/:designId",
  getDesignController
);

/*
|--------------------------------------------------------------------------
| PUT /api/designs/:designId
|--------------------------------------------------------------------------
*/

router.put(
  "/:designId",
  updateDesignController
);

/*
|--------------------------------------------------------------------------
| DELETE /api/designs/:designId
|--------------------------------------------------------------------------
*/

router.delete(
  "/:designId",
  deleteDesignController
);

module.exports = router;