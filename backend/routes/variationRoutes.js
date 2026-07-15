const express = require("express");

const {
  generateVariationsController,
  generateMoreController,
  getVariationOptionsController,
} = require(
  "../controllers/variationController"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| POST /api/variations/generate
|--------------------------------------------------------------------------
*/

router.post(
  "/generate",
  generateVariationsController
);

/*
|--------------------------------------------------------------------------
| POST /api/variations/more
|--------------------------------------------------------------------------
*/

router.post(
  "/more",
  generateMoreController
);

/*
|--------------------------------------------------------------------------
| GET /api/variations/options
|--------------------------------------------------------------------------
*/

router.get(
  "/options",
  getVariationOptionsController
);

module.exports = router;