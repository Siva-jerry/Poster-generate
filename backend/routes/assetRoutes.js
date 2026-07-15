const express = require("express");

const {
  handleSingleImageUpload,
} = require("../middleware/uploadMiddleware");

const {
  uploadAssetController,
  listAssetsController,
  getAssetController,
  deleteAssetController,
} = require("../controllers/assetController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| POST /api/assets/upload
|--------------------------------------------------------------------------
|
| Request type:
| multipart/form-data
|
| Fields:
| image      = uploaded image
| assetType  = student-photo
|              college-logo
|              background
|              editor-upload
|              thumbnail
| ownerKey   = current guest or user identifier
|
*/

router.post(
  "/upload",
  handleSingleImageUpload("image"),
  uploadAssetController
);

/*
|--------------------------------------------------------------------------
| GET /api/assets
|--------------------------------------------------------------------------
|
| Example:
| /api/assets?ownerKey=guest_123
|
| Optional filters:
| /api/assets?ownerKey=guest_123&assetType=student-photo
| /api/assets?ownerKey=guest_123&page=1&limit=30
|
*/

router.get(
  "/",
  listAssetsController
);

/*
|--------------------------------------------------------------------------
| GET /api/assets/:assetId
|--------------------------------------------------------------------------
|
| Example:
| /api/assets/ASSET_ID?ownerKey=guest_123
|
*/

router.get(
  "/:assetId",
  getAssetController
);

/*
|--------------------------------------------------------------------------
| DELETE /api/assets/:assetId
|--------------------------------------------------------------------------
|
| JSON body:
| {
|   "ownerKey": "guest_123"
| }
|
*/

router.delete(
  "/:assetId",
  deleteAssetController
);

module.exports = router;