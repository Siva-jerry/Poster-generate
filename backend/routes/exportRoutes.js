const express = require("express");

const {
  exportPosterController,
} = require(
  "../controllers/exportController"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| POST /api/export
|--------------------------------------------------------------------------
|
| JSON body:
|
| {
|   "ownerKey": "guest_123",
|   "designId": "optional-design-uuid",
|   "title": "Peter Parker Birthday Poster",
|   "format": "png",
|   "quality": 92,
|   "imageDataUrl": "data:image/png;base64,..."
| }
|
*/

router.post(
  "/",
  exportPosterController
);

module.exports = router;