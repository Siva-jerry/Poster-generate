const express = require("express");

const {
  listTemplates,
  showTemplate,
  getTemplateSvgPreview,
  listTemplateFilters,
  listSimilarTemplates,
} = require("../controllers/templateController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET /api/templates
|--------------------------------------------------------------------------
*/

router.get("/", listTemplates);

/*
|--------------------------------------------------------------------------
| GET /api/templates/filters
|--------------------------------------------------------------------------
*/

router.get("/filters", listTemplateFilters);

/*
|--------------------------------------------------------------------------
| GET /api/templates/:templateId/preview.svg
|--------------------------------------------------------------------------
*/

router.get("/:templateId/preview.svg", getTemplateSvgPreview);

/*
|--------------------------------------------------------------------------
| GET /api/templates/:templateId/similar
|--------------------------------------------------------------------------
*/

router.get(
  "/:templateId/similar",
  listSimilarTemplates
);

/*
|--------------------------------------------------------------------------
| GET /api/templates/:templateId
|--------------------------------------------------------------------------
*/

router.get("/:templateId", showTemplate);

module.exports = router;