const express = require("express");

const {
  generateBackgroundController,
} = require(
  "../controllers/aiController"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| POST /api/ai/background
|--------------------------------------------------------------------------
|
| JSON body:
|
| {
|   "ownerKey": "guest_123",
|   "style": "cinematic",
|   "mood": "dramatic",
|   "primaryColor": "#080808",
|   "secondaryColor": "#D4AF37",
|   "customPrompt": "gold spotlight and subtle particles",
|   "seed": 12345
| }
|
*/

router.post(
  "/background",
  generateBackgroundController
);

module.exports = router;