const express = require("express");

const {
  generateTemplatePreviewController,
  generateVariationPreviewController,
  generateBatchPreviewsController,
  getTemplatePreviewController,
} = require(
  "../controllers/previewController"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| POST /api/previews/template
|--------------------------------------------------------------------------
|
| Generate or retrieve one cached template preview.
|
*/

router.post(
  "/template",
  generateTemplatePreviewController
);

/*
|--------------------------------------------------------------------------
| POST /api/previews/variation
|--------------------------------------------------------------------------
|
| Generate a temporary Base64 variation preview.
|
*/

router.post(
  "/variation",
  generateVariationPreviewController
);

/*
|--------------------------------------------------------------------------
| POST /api/previews/batch
|--------------------------------------------------------------------------
|
| Generate preview cards for multiple template IDs.
|
*/

router.post(
  "/batch",
  generateBatchPreviewsController
);

/*
|--------------------------------------------------------------------------
| GET /api/previews/template/:templateId
|--------------------------------------------------------------------------
*/

router.get(
  "/template/:templateId",
  getTemplatePreviewController
);

module.exports = router;