const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

/*
|--------------------------------------------------------------------------
| AI background configuration
|--------------------------------------------------------------------------
*/

const DEFAULT_AI_MODEL =
  "@cf/black-forest-labs/flux-1-schnell";

const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1350;

const DEFAULT_STEPS = 6;
const MAX_STEPS = 8;

const DEFAULT_TIMEOUT_MS = 90_000;
const DEFAULT_RETRY_COUNT = 2;

/*
|--------------------------------------------------------------------------
| Safe helpers
|--------------------------------------------------------------------------
*/

function toSafeInteger(
  value,
  fallback,
  minimum,
  maximum
) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(
    Math.max(
      Math.round(number),
      minimum
    ),
    maximum
  );
}

function toSafeString(
  value,
  fallback = ""
) {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value).trim();
  }

  return fallback;
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/*
|--------------------------------------------------------------------------
| Generate file ID
|--------------------------------------------------------------------------
*/

function createBackgroundId() {
  if (
    typeof crypto.randomUUID ===
    "function"
  ) {
    return crypto.randomUUID();
  }

  return [
    Date.now(),
    crypto
      .randomBytes(8)
      .toString("hex"),
  ].join("-");
}

/*
|--------------------------------------------------------------------------
| Validate Cloudflare configuration
|--------------------------------------------------------------------------
*/

function getCloudflareConfiguration() {
  const accountId =
    toSafeString(
      process.env
        .CLOUDFLARE_ACCOUNT_ID
    );

  const apiToken =
    toSafeString(
      process.env
        .CLOUDFLARE_API_TOKEN
    );

  const model =
    toSafeString(
      process.env
        .CLOUDFLARE_AI_MODEL,
      DEFAULT_AI_MODEL
    );

  if (!accountId) {
    const error = new Error(
      "CLOUDFLARE_ACCOUNT_ID is not configured."
    );

    error.statusCode = 500;

    throw error;
  }

  if (!apiToken) {
    const error = new Error(
      "CLOUDFLARE_API_TOKEN is not configured."
    );

    error.statusCode = 500;

    throw error;
  }

  return {
    accountId,
    apiToken,
    model,
  };
}

/*
|--------------------------------------------------------------------------
| Build Cloudflare inference URL
|--------------------------------------------------------------------------
*/

function buildCloudflareUrl({
  accountId,
  model,
}) {
  const encodedModel = model
    .split("/")
    .map((segment) =>
      encodeURIComponent(segment)
    )
    .join("/");

  return (
    "https://api.cloudflare.com/" +
    "client/v4/accounts/" +
    `${encodeURIComponent(accountId)}/` +
    `ai/run/${encodedModel}`
  );
}

/*
|--------------------------------------------------------------------------
| Ensure output directory
|--------------------------------------------------------------------------
*/

async function ensureDirectory(
  directory
) {
  await fs.promises.mkdir(
    directory,
    {
      recursive: true,
    }
  );

  return directory;
}

/*
|--------------------------------------------------------------------------
| Normalize AI prompt
|--------------------------------------------------------------------------
*/

function normalizePrompt(prompt) {
  const safePrompt =
    toSafeString(prompt);

  if (!safePrompt) {
    const error = new Error(
      "An AI background prompt is required."
    );

    error.statusCode = 400;

    throw error;
  }

  /*
   * FLUX.1 Schnell currently accepts
   * prompts up to 2048 characters.
   */
  return safePrompt.slice(0, 2048);
}

/*
|--------------------------------------------------------------------------
| Build Cloudflare request body
|--------------------------------------------------------------------------
*/

function buildRequestBody({
  prompt,
  seed,
  steps,
}) {
  return {
    prompt:
      normalizePrompt(prompt),

    seed:
      toSafeInteger(
        seed,
        Math.floor(
          Math.random() *
            2_147_483_647
        ),
        1,
        2_147_483_647
      ),

    steps:
      toSafeInteger(
        steps,
        DEFAULT_STEPS,
        1,
        MAX_STEPS
      ),
  };
}

/*
|--------------------------------------------------------------------------
| Parse Cloudflare error response
|--------------------------------------------------------------------------
*/

async function parseCloudflareError(
  response
) {
  let responseBody = null;

  try {
    responseBody =
      await response.json();
  } catch {
    try {
      responseBody =
        await response.text();
    } catch {
      responseBody = null;
    }
  }

  const message =
    responseBody?.errors?.[0]
      ?.message ||
    responseBody?.messages?.[0]
      ?.message ||
    responseBody?.error ||
    responseBody?.message ||
    (typeof responseBody ===
    "string"
      ? responseBody
      : "") ||
    `Cloudflare AI request failed with status ${response.status}.`;

  const error = new Error(message);

  error.statusCode =
    response.status >= 400 &&
    response.status <= 599
      ? response.status
      : 502;

  error.cloudflareResponse =
    responseBody;

  return error;
}

/*
|--------------------------------------------------------------------------
| Extract Base64 image
|--------------------------------------------------------------------------
*/

function extractBase64Image(
  responseBody
) {
  if (!responseBody) {
    return "";
  }

  /*
   * Standard Cloudflare REST envelope:
   *
   * {
   *   success: true,
   *   result: {
   *     image: "base64..."
   *   }
   * }
   */
  const candidates = [
    responseBody?.result?.image,
    responseBody?.image,

    responseBody?.result
      ?.data?.image,

    responseBody?.data?.image,

    responseBody?.result
      ?.images?.[0],

    responseBody?.images?.[0],
  ];

  const result =
    candidates.find(
      (candidate) =>
        typeof candidate ===
          "string" &&
        candidate.trim()
    ) || "";

  return result
    .replace(
      /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
      ""
    )
    .trim();
}

/*
|--------------------------------------------------------------------------
| Decode response body
|--------------------------------------------------------------------------
*/

async function decodeImageResponse(
  response
) {
  const contentType =
    response.headers
      .get("content-type")
      ?.toLowerCase() || "";

  /*
   * Some image models may return raw
   * image bytes instead of JSON.
   */
  if (
    contentType.startsWith(
      "image/"
    )
  ) {
    const arrayBuffer =
      await response.arrayBuffer();

    const imageBuffer =
      Buffer.from(arrayBuffer);

    if (!imageBuffer.length) {
      throw new Error(
        "Cloudflare AI returned an empty image."
      );
    }

    return {
      imageBuffer,
      contentType,
      rawResponse: null,
    };
  }

  const responseBody =
    await response.json();

  if (
    responseBody?.success ===
      false
  ) {
    const message =
      responseBody?.errors?.[0]
        ?.message ||
      "Cloudflare AI could not generate the background.";

    const error = new Error(
      message
    );

    error.statusCode = 502;
    error.cloudflareResponse =
      responseBody;

    throw error;
  }

  const base64Image =
    extractBase64Image(
      responseBody
    );

  if (!base64Image) {
    const error = new Error(
      "Cloudflare AI returned no image data."
    );

    error.statusCode = 502;
    error.cloudflareResponse =
      responseBody;

    throw error;
  }

  const imageBuffer =
    Buffer.from(
      base64Image,
      "base64"
    );

  if (!imageBuffer.length) {
    const error = new Error(
      "Cloudflare AI returned invalid image data."
    );

    error.statusCode = 502;

    throw error;
  }

  return {
    imageBuffer,
    contentType:
      "image/jpeg",

    rawResponse:
      responseBody,
  };
}

/*
|--------------------------------------------------------------------------
| Decide whether request may be retried
|--------------------------------------------------------------------------
*/

function isRetryableError(error) {
  const statusCode =
    Number(
      error?.statusCode ||
        error?.status
    );

  return (
    !statusCode ||
    statusCode === 408 ||
    statusCode === 409 ||
    statusCode === 425 ||
    statusCode === 429 ||
    statusCode >= 500
  );
}

/*
|--------------------------------------------------------------------------
| Run one Cloudflare AI request
|--------------------------------------------------------------------------
*/

async function requestCloudflareImage({
  prompt,
  seed,
  steps,
  timeoutMs =
    DEFAULT_TIMEOUT_MS,
}) {
  const configuration =
    getCloudflareConfiguration();

  const url =
    buildCloudflareUrl(
      configuration
    );

  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => {
      controller.abort();
    },
    toSafeInteger(
      timeoutMs,
      DEFAULT_TIMEOUT_MS,
      5_000,
      300_000
    )
  );

  try {
    const response = await fetch(
      url,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${configuration.apiToken}`,

          "Content-Type":
            "application/json",

          Accept:
            "application/json, image/*",
        },

        body: JSON.stringify(
          buildRequestBody({
            prompt,
            seed,
            steps,
          })
        ),

        signal:
          controller.signal,
      }
    );

    if (!response.ok) {
      throw await parseCloudflareError(
        response
      );
    }

    return await decodeImageResponse(
      response
    );
  } catch (error) {
    if (
      error?.name ===
      "AbortError"
    ) {
      const timeoutError =
        new Error(
          "Cloudflare AI generation timed out."
        );

      timeoutError.statusCode =
        504;

      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/*
|--------------------------------------------------------------------------
| Request with retry
|--------------------------------------------------------------------------
*/

async function requestWithRetry({
  prompt,
  seed,
  steps,
  timeoutMs,
  retryCount =
    DEFAULT_RETRY_COUNT,
}) {
  const maximumAttempts =
    toSafeInteger(
      retryCount,
      DEFAULT_RETRY_COUNT,
      0,
      5
    ) + 1;

  let lastError = null;

  for (
    let attempt = 1;
    attempt <= maximumAttempts;
    attempt += 1
  ) {
    try {
      return await requestCloudflareImage({
        prompt,
        seed,
        steps,
        timeoutMs,
      });
    } catch (error) {
      lastError = error;

      const shouldRetry =
        attempt <
          maximumAttempts &&
        isRetryableError(error);

      if (!shouldRetry) {
        break;
      }

      const delay =
        750 *
        2 ** (attempt - 1);

      console.warn(
        `Cloudflare AI attempt ${attempt} failed. Retrying in ${delay} ms.`,
        error.message
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

/*
|--------------------------------------------------------------------------
| Prepare generated background
|--------------------------------------------------------------------------
*/

async function prepareBackground({
  inputBuffer,
  outputPath,
  width,
  height,
  quality = 92,
}) {
  const safeWidth =
    toSafeInteger(
      width,
      DEFAULT_WIDTH,
      256,
      4096
    );

  const safeHeight =
    toSafeInteger(
      height,
      DEFAULT_HEIGHT,
      256,
      4096
    );

  await sharp(inputBuffer)
    .rotate()
    .resize(
      safeWidth,
      safeHeight,
      {
        fit: "cover",
        position: "centre",
      }
    )
    .jpeg({
      quality:
        toSafeInteger(
          quality,
          92,
          40,
          100
        ),

      chromaSubsampling:
        "4:4:4",

      mozjpeg: true,
    })
    .toFile(outputPath);

  return {
    width: safeWidth,
    height: safeHeight,
  };
}

/*
|--------------------------------------------------------------------------
| Generate one AI background
|--------------------------------------------------------------------------
*/

async function generateAIBackground({
  prompt,

  outputDirectory =
    path.join(
      __dirname,
      "..",
      "public",
      "generated",
      "backgrounds"
    ),

  filename,

  width =
    DEFAULT_WIDTH,

  height =
    DEFAULT_HEIGHT,

  seed,

  steps =
    DEFAULT_STEPS,

  timeoutMs =
    DEFAULT_TIMEOUT_MS,

  retryCount =
    DEFAULT_RETRY_COUNT,

  quality = 92,

  metadata = {},
} = {}) {
  const safePrompt =
    normalizePrompt(prompt);

  await ensureDirectory(
    outputDirectory
  );

  const backgroundId =
    createBackgroundId();

  const safeFilename =
    filename
      ? path.basename(
          toSafeString(
            filename
          )
        )
      : `ai-background-${backgroundId}.jpg`;

  const finalFilename =
    path.extname(
      safeFilename
    )
      ? safeFilename
      : `${safeFilename}.jpg`;

  const outputPath =
    path.join(
      outputDirectory,
      finalFilename
    );

  const safeSeed =
    toSafeInteger(
      seed,
      Math.floor(
        Math.random() *
          2_147_483_647
      ),
      1,
      2_147_483_647
    );

  try {
    const {
      imageBuffer,
      rawResponse,
    } =
      await requestWithRetry({
        prompt: safePrompt,
        seed: safeSeed,
        steps,
        timeoutMs,
        retryCount,
      });

    const dimensions =
      await prepareBackground({
        inputBuffer:
          imageBuffer,

        outputPath,

        width,
        height,
        quality,
      });

    const fileStats =
      await fs.promises.stat(
        outputPath
      );

    return {
      success: true,

      id: backgroundId,

      filename:
        finalFilename,

      filePath:
        outputPath,

      relativePath:
        path
          .relative(
            path.join(
              __dirname,
              ".."
            ),
            outputPath
          )
          .replace(/\\/g, "/"),

      width:
        dimensions.width,

      height:
        dimensions.height,

      sizeBytes:
        fileStats.size,

      mimeType:
        "image/jpeg",

      prompt:
        safePrompt,

      seed:
        safeSeed,

      steps:
        toSafeInteger(
          steps,
          DEFAULT_STEPS,
          1,
          MAX_STEPS
        ),

      model:
        getCloudflareConfiguration()
          .model,

      metadata: {
        ...metadata,
      },

      providerResponse:
        process.env
          .NODE_ENV ===
        "development"
          ? rawResponse
          : undefined,
    };
  } catch (error) {
    /*
     * Remove a partially written file
     * when image processing fails.
     */
    try {
      await fs.promises.unlink(
        outputPath
      );
    } catch {
      // File may not exist.
    }

    const serviceError =
      new Error(
        `Unable to generate AI background: ${error.message}`
      );

    serviceError.statusCode =
      error.statusCode ||
      error.status ||
      502;

    serviceError.cause =
      error;

    throw serviceError;
  }
}

/*
|--------------------------------------------------------------------------
| Generate multiple AI backgrounds
|--------------------------------------------------------------------------
*/

async function generateAIBackgrounds({
  prompts = [],

  outputDirectory,

  width =
    DEFAULT_WIDTH,

  height =
    DEFAULT_HEIGHT,

  steps =
    DEFAULT_STEPS,

  timeoutMs =
    DEFAULT_TIMEOUT_MS,

  retryCount =
    DEFAULT_RETRY_COUNT,

  quality = 92,

  /*
   * Keep concurrency low because each
   * image request uses GPU inference.
   */
  concurrency = 2,

  metadata = {},
} = {}) {
  if (
    !Array.isArray(prompts) ||
    prompts.length === 0
  ) {
    const error = new Error(
      "At least one AI background prompt is required."
    );

    error.statusCode = 400;

    throw error;
  }

  const safePrompts =
    prompts
      .map((prompt) =>
        normalizePrompt(prompt)
      )
      .filter(Boolean);

  const safeConcurrency =
    toSafeInteger(
      concurrency,
      2,
      1,
      4
    );

  const results =
    new Array(
      safePrompts.length
    );

  let currentIndex = 0;

  async function worker() {
    while (
      currentIndex <
      safePrompts.length
    ) {
      const index =
        currentIndex;

      currentIndex += 1;

      const prompt =
        safePrompts[index];

      results[index] =
        await generateAIBackground({
          prompt,

          outputDirectory,

          filename:
            `ai-background-${Date.now()}-${index + 1}.jpg`,

          width,
          height,
          steps,
          timeoutMs,
          retryCount,
          quality,

          metadata: {
            ...metadata,

            variationIndex:
              index,

            variationNumber:
              index + 1,
          },
        });
    }
  }

  await Promise.all(
    Array.from(
      {
        length: Math.min(
          safeConcurrency,
          safePrompts.length
        ),
      },
      () => worker()
    )
  );

  return results;
}

/*
|--------------------------------------------------------------------------
| Test Cloudflare AI configuration
|--------------------------------------------------------------------------
*/

function getAIBackgroundServiceStatus() {
  const accountId =
    toSafeString(
      process.env
        .CLOUDFLARE_ACCOUNT_ID
    );

  const apiToken =
    toSafeString(
      process.env
        .CLOUDFLARE_API_TOKEN
    );

  const model =
    toSafeString(
      process.env
        .CLOUDFLARE_AI_MODEL,
      DEFAULT_AI_MODEL
    );

  return {
    configured:
      Boolean(
        accountId &&
        apiToken
      ),

    accountConfigured:
      Boolean(accountId),

    tokenConfigured:
      Boolean(apiToken),

    model,

    outputSize: {
      width:
        DEFAULT_WIDTH,

      height:
        DEFAULT_HEIGHT,
    },
  };
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  generateAIBackground,

  generateAIBackgrounds,

  getAIBackgroundServiceStatus,

  DEFAULT_AI_MODEL,

  DEFAULT_WIDTH,

  DEFAULT_HEIGHT,
};