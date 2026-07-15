const express = require("express");

const {
  listTemplates,
  showTemplate,
  listTemplateFilters,
  listSimilarTemplates,
} = require("../controllers/templateController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET /api/templates
|--------------------------------------------------------------------------
|
| Example:
| /api/templates?page=1&limit=20
| /api/templates?category=luxury
| /api/templates?search=black gold
|
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