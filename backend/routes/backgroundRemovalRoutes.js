const express = require("express");

const {
  removeBackgroundController,
} = require(
  "../controllers/backgroundRemovalController"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| POST /api/background-removal
|--------------------------------------------------------------------------
|
| JSON body:
|
| {
|   "assetId": "uploaded-asset-id",
|   "ownerKey": "guest-owner-key"
| }
|
*/

router.post(
  "/",
  removeBackgroundController
);

module.exports = router;