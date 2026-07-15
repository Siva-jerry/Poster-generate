const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

/*
|--------------------------------------------------------------------------
| Route imports
|--------------------------------------------------------------------------
*/

const templateRoutes = require(
  "./routes/templateRoutes"
);

const designRoutes = require(
  "./routes/designRoutes"
);

const assetRoutes = require(
  "./routes/assetRoutes"
);

const backgroundRemovalRoutes = require(
  "./routes/backgroundRemovalRoutes"
);

const exportRoutes = require(
  "./routes/exportRoutes"
);

const aiRoutes = require(
  "./routes/aiRoutes"
);

const variationRoutes = require(
  "./routes/variationRoutes"
);

const previewRoutes = require(
  "./routes/previewRoutes"
);

const app = express();

/*
|--------------------------------------------------------------------------
| Environment configuration
|--------------------------------------------------------------------------
*/

const PORT =
  Number(process.env.PORT) || 5000;

const HOST =
  process.env.HOST || "0.0.0.0";

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

const MAX_UPLOAD_SIZE_MB =
  Number(
    process.env.MAX_UPLOAD_SIZE_MB
  ) || 10;

const MAX_EXPORT_BODY_SIZE_MB =
  Number(
    process.env.MAX_EXPORT_BODY_SIZE_MB
  ) || 45;

const SUPABASE_ASSETS_BUCKET =
  process.env.SUPABASE_ASSETS_BUCKET ||
  "smartwish-assets";

const NODE_ENV =
  process.env.NODE_ENV ||
  "development";

/*
|--------------------------------------------------------------------------
| Required local directories
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

requiredDirectories.forEach(
  (directory) => {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, {
        recursive: true,
      });

      console.log(
        `Created directory: ${directory}`
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Allowed frontend origins
|--------------------------------------------------------------------------
|
| Multiple origins can be separated using commas:
|
| FRONTEND_URL=https://site.com,http://localhost:5173
|
*/

const deployedFrontendOrigins =
  FRONTEND_URL
    .split(",")
    .map((origin) =>
      origin.trim()
    )
    .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([
    ...deployedFrontendOrigins,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ])
);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin(origin, callback) {
      /*
       * Postman, direct browser navigation and server requests
       * may not include an Origin header.
       */
      if (!origin) {
        return callback(
          null,
          true
        );
      }

      if (
        allowedOrigins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      const corsError =
        new Error(
          `CORS blocked request from origin: ${origin}`
        );

      corsError.statusCode = 403;

      return callback(
        corsError
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

    exposedHeaders: [
      "Content-Length",
      "Content-Type",
    ],

    credentials: false,
    optionsSuccessStatus: 204,
  })
);

/*
|--------------------------------------------------------------------------
| Request body parsers
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: `${MAX_EXPORT_BODY_SIZE_MB}mb`,
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: `${MAX_EXPORT_BODY_SIZE_MB}mb`,
  })
);

/*
|--------------------------------------------------------------------------
| Static folders
|--------------------------------------------------------------------------
*/

app.use(
  "/generated",
  express.static(
    GENERATED_DIRECTORY
  )
);

app.use(
  "/previews",
  express.static(
    PREVIEWS_DIRECTORY
  )
);

/*
|--------------------------------------------------------------------------
| Request logger
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  const currentTime =
    new Date().toISOString();

  console.log(
    `[${currentTime}] ${req.method} ${req.originalUrl}`
  );

  next();
});

/*
|--------------------------------------------------------------------------
| Basic routes
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      "SmartWish AI backend is running.",
    service:
      "SmartWish AI Backend",
    version: "2.0.0",
  });
});

app.get(
  "/api/health",
  (req, res) => {
    return res
      .status(200)
      .json({
        success: true,
        status: "healthy",
        service:
          "SmartWish AI Backend",
        version: "2.0.0",
        environment: NODE_ENV,
        timestamp:
          new Date().toISOString(),
      });
  }
);

/*
|--------------------------------------------------------------------------
| Application routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/templates",
  templateRoutes
);

app.use(
  "/api/designs",
  designRoutes
);

app.use(
  "/api/assets",
  assetRoutes
);

app.use(
  "/api/background-removal",
  backgroundRemovalRoutes
);

app.use(
  "/api/export",
  exportRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use(
  "/api/variations",
  variationRoutes
);

app.use(
  "/api/previews",
  previewRoutes
);

/*
|--------------------------------------------------------------------------
| 404 handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  return res
    .status(404)
    .json({
      success: false,
      error:
        "API endpoint not found.",
      method: req.method,
      path: req.originalUrl,
    });
});

/*
|--------------------------------------------------------------------------
| Global error handler
|--------------------------------------------------------------------------
*/

app.use(
  (error, req, res, next) => {
    console.error(
      "Server error:",
      error
    );

    if (res.headersSent) {
      return next(error);
    }

    /*
    |--------------------------------------------------------------------------
    | Multer errors
    |--------------------------------------------------------------------------
    */

    if (
      error.name ===
      "MulterError"
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(413)
          .json({
            success: false,
            error:
              `Image size must not exceed ${MAX_UPLOAD_SIZE_MB} MB.`,
          });
      }

      if (
        error.code ===
        "LIMIT_FILE_COUNT"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Only one image can be uploaded at a time.",
          });
      }

      if (
        error.code ===
        "LIMIT_UNEXPECTED_FILE"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Unexpected upload field. The image field must be named 'image'.",
          });
      }

      if (
        error.code ===
        "LIMIT_FIELD_KEY"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "One of the upload field names is too long.",
          });
      }

      if (
        error.code ===
        "LIMIT_FIELD_VALUE"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "One of the upload field values is too large.",
          });
      }

      if (
        error.code ===
        "LIMIT_FIELD_COUNT"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Too many form fields were submitted.",
          });
      }

      if (
        error.code ===
        "LIMIT_PART_COUNT"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Too many multipart sections were submitted.",
          });
      }

      return res
        .status(400)
        .json({
          success: false,
          error:
            error.message ||
            "Image upload failed.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | CORS errors
    |--------------------------------------------------------------------------
    */

    if (
      error.message?.startsWith(
        "CORS blocked"
      )
    ) {
      return res
        .status(403)
        .json({
          success: false,
          error:
            error.message,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Invalid JSON
    |--------------------------------------------------------------------------
    */

    if (
      error instanceof
        SyntaxError &&
      error.status === 400 &&
      "body" in error
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "The request contains invalid JSON.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Payload too large
    |--------------------------------------------------------------------------
    */

    if (
      error.type ===
        "entity.too.large" ||
      error.status === 413
    ) {
      return res
        .status(413)
        .json({
          success: false,
          error:
            `The submitted request is too large. Maximum request size is ${MAX_EXPORT_BODY_SIZE_MB} MB.`,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Supabase configuration
    |--------------------------------------------------------------------------
    */

    if (
      error.message?.includes(
        "SUPABASE_URL"
      ) ||
      error.message?.includes(
        "SUPABASE_SERVICE_ROLE_KEY"
      )
    ) {
      return res
        .status(500)
        .json({
          success: false,
          error:
            NODE_ENV ===
            "production"
              ? "Database configuration is unavailable."
              : error.message,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Cloudflare configuration
    |--------------------------------------------------------------------------
    */

    if (
      error.message?.includes(
        "CLOUDFLARE_ACCOUNT_ID"
      ) ||
      error.message?.includes(
        "CLOUDFLARE_API_TOKEN"
      )
    ) {
      return res
        .status(500)
        .json({
          success: false,
          error:
            NODE_ENV ===
            "production"
              ? "AI service configuration is unavailable."
              : error.message,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | General errors
    |--------------------------------------------------------------------------
    */

    const requestedStatusCode =
      Number(
        error.statusCode ||
          error.status
      );

    const safeStatusCode =
      Number.isInteger(
        requestedStatusCode
      ) &&
      requestedStatusCode >=
        400 &&
      requestedStatusCode <=
        599
        ? requestedStatusCode
        : 500;

    const isProduction =
      NODE_ENV ===
      "production";

    const errorMessage =
      safeStatusCode === 500 &&
      isProduction
        ? "Something went wrong on the server."
        : error.message ||
          "Something went wrong on the server.";

    const responseBody = {
      success: false,
      error: errorMessage,
    };

    if (
      !isProduction &&
      error.stack
    ) {
      responseBody.stack =
        error.stack;
    }

    return res
      .status(safeStatusCode)
      .json(responseBody);
  }
);

/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

const server = app.listen(
  PORT,
  HOST,
  () => {
    console.log("");
    console.log(
      "======================================"
    );
    console.log(
      " SmartWish AI Backend"
    );
    console.log(
      "======================================"
    );
    console.log(
      `Server: http://${HOST}:${PORT}`
    );
    console.log(
      `Health: http://localhost:${PORT}/api/health`
    );
    console.log(
      `Environment: ${NODE_ENV}`
    );
    console.log(
      `Frontend origins: ${allowedOrigins.join(
        ", "
      )}`
    );
    console.log(
      `Maximum upload size: ${MAX_UPLOAD_SIZE_MB} MB`
    );
    console.log(
      `Maximum request size: ${MAX_EXPORT_BODY_SIZE_MB} MB`
    );
    console.log(
      `Assets bucket: ${SUPABASE_ASSETS_BUCKET}`
    );
    console.log(
      "======================================"
    );
    console.log("");
  }
);

/*
|--------------------------------------------------------------------------
| Graceful shutdown
|--------------------------------------------------------------------------
*/

function shutdownServer(signal) {
  console.log(
    `${signal} received. Closing server...`
  );

  server.close((error) => {
    if (error) {
      console.error(
        "Unable to close server cleanly:",
        error
      );

      process.exit(1);
    }

    console.log(
      "Server closed successfully."
    );

    process.exit(0);
  });
}

process.on(
  "SIGTERM",
  () => {
    shutdownServer(
      "SIGTERM"
    );
  }
);

process.on(
  "SIGINT",
  () => {
    shutdownServer(
      "SIGINT"
    );
  }
);

module.exports = app;