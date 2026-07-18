const express = require("express");

const router = express.Router();

const {
  generatePoster,
  getPosterServiceStatus,
  cleanupPosterFiles,
  deletePosterFiles,
} = require("../controllers/posterController");

const {
  posterUploadMiddleware,
} = require("../utils/posterUpload");

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

router.get("/", (req, res) => {
  res.json({
    success: true,
    service: "SmartWish AI Poster Generator API",
    version: "1.0.0",
    endpoints: {
      status: "GET /api/posters/status",
      generate: "POST /api/posters/generate",
      cleanup: "POST /api/posters/cleanup",
      delete: "DELETE /api/posters/files",
    },
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| Service Status
|--------------------------------------------------------------------------
*/

router.get(
  "/status",
  getPosterServiceStatus
);

/*
|--------------------------------------------------------------------------
| Generate Birthday Poster
|--------------------------------------------------------------------------
|
| Required FormData
| -----------------
| photo
| name
| prompt
|
| Optional
| --------
| logo
| department
| year
| rollNo
| collegeName
| birthdayQuote
| birthdayHeading
| designation
| date
| style
| theme
| colors
| variationCount
| removeBackground
|
*/

router.post(
  "/generate",
  posterUploadMiddleware,
  generatePoster
);

/*
|--------------------------------------------------------------------------
| Cleanup Generated Files
|--------------------------------------------------------------------------
*/

router.post(
  "/cleanup",
  cleanupPosterFiles
);

/*
|--------------------------------------------------------------------------
| Delete Selected Posters
|--------------------------------------------------------------------------
*/

router.delete(
  "/files",
  deletePosterFiles
);

module.exports = router;