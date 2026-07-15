const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const templateRoutes = require(
  "./routes/templateRoutes"
);

const designRoutes = require(
  "./routes/designRoutes"
);

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

/*
|--------------------------------------------------------------------------
| Required directories
|--------------------------------------------------------------------------
*/

const UPLOADS_DIRECTORY = path.join(
  __dirname,
  "uploads"
);

const GENERATED_DIRECTORY = path.join(
  __dirname,
  "public",
  "generated"
);

const PREVIEWS_DIRECTORY = path.join(
  __dirname,
  "public",
  "previews"
);

const requiredDirectories = [
  UPLOADS_DIRECTORY,
  GENERATED_DIRECTORY,
  PREVIEWS_DIRECTORY,
];

requiredDirectories.forEach((directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, {
      recursive: true,
    });

    console.log(`Created directory: ${directory}`);
  }
});

/*
|--------------------------------------------------------------------------
| CORS configuration
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin(origin, callback) {
      /*
       * Requests from Postman, browser URL access and server tools
       * may not contain an Origin header.
       */
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `CORS blocked request from origin: ${origin}`
        )
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

   allowedHeaders: [
  "Content-Type",
  "Authorization",
  "x-edit-token",
],
  })
);

/*
|--------------------------------------------------------------------------
| Request body parsers
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "25mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "25mb",
  })
);

/*
|--------------------------------------------------------------------------
| Static public folders
|--------------------------------------------------------------------------
*/

app.use(
  "/generated",
  express.static(GENERATED_DIRECTORY)
);

app.use(
  "/previews",
  express.static(PREVIEWS_DIRECTORY)
);

/*
|--------------------------------------------------------------------------
| Request logger
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  const currentTime = new Date().toISOString();

  console.log(
    `[${currentTime}] ${req.method} ${req.originalUrl}`
  );

  next();
});

/*
|--------------------------------------------------------------------------
| Basic application routes
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SmartWish AI backend is running.",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    service: "SmartWish AI Backend",
    version: "2.0.0",
    environment:
      process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| API route placeholder
|--------------------------------------------------------------------------

| We will connect these routes in the next backend parts:

|
| /api/templates
| /api/designs
| /api/assets
| /api/uploads
| /api/export
| /api/ai
|
*/
app.use("/api/templates", templateRoutes);
app.use(
  "/api/designs",
  designRoutes
);
/*
|--------------------------------------------------------------------------
| 404 handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found.",
    path: req.originalUrl,
  });
});

/*
|--------------------------------------------------------------------------
| Global error handler
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  if (error.message?.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      error: error.message,
    });
  }

  return res.status(
    error.statusCode || error.status || 500
  ).json({
    success: false,
    error:
      error.message ||
      "Something went wrong on the server.",
  });
});

/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  console.log("");
  console.log("======================================");
  console.log(" SmartWish AI Backend");
  console.log("======================================");
  console.log(`Server: http://localhost:${PORT}`);
  console.log(
    `Health: http://localhost:${PORT}/api/health`
  );
  console.log(`Frontend allowed: ${FRONTEND_URL}`);
  console.log("======================================");
  console.log("");
});