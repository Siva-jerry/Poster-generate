const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

sharp.cache(false);
sharp.concurrency(1);

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
  steps,
}) {
  const body = {
    prompt:
      normalizePrompt(prompt),
  };

  const safeSteps =
    toSafeInteger(
      steps,
      DEFAULT_STEPS,
      1,
      MAX_STEPS
    );

  if (safeSteps && safeSteps !== DEFAULT_STEPS) {
    body.num_steps = safeSteps;
  }

  return body;
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

async function generateProceduralBackgroundBuffer({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  prompt = "",
}) {
  const isNeon = /neon|cyber|dj/i.test(prompt);
  const isGold = /gold|luxury|royal|palace/i.test(prompt);
  const isSports = /sport|champion|stadium|varsity/i.test(prompt);
  const isFloral = /floral|rose|polaroid|pink/i.test(prompt);

  const c1 = isNeon ? "#0D0221" : isGold ? "#120B04" : isSports ? "#040F2D" : isFloral ? "#1A0713" : "#0A0A0E";
  const c2 = isNeon ? "#3B0764" : isGold ? "#2A1806" : isSports ? "#0B256B" : isFloral ? "#3B1124" : "#1A1528";
  const glow = isNeon ? "#00F0FF" : isGold ? "#D4AF37" : isSports ? "#38EF7D" : isFloral ? "#FF7597" : "#8B5CF6";

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="${c2}" />
          <stop offset="60%" stop-color="${c1}" />
          <stop offset="100%" stop-color="#050308" />
        </radialGradient>
        <radialGradient id="spotGlow" cx="50%" cy="30%" r="40%">
          <stop offset="0%" stop-color="${glow}" stop-opacity="0.38" />
          <stop offset="60%" stop-color="${glow}" stop-opacity="0.08" />
          <stop offset="100%" stop-color="${glow}" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="beam1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${glow}" stop-opacity="0.22" />
          <stop offset="100%" stop-color="${glow}" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
      <circle cx="${width * 0.5}" cy="${height * 0.32}" r="${width * 0.45}" fill="url(#spotGlow)" />
      <polygon points="0,0 ${width * 0.65},0 ${width},${height} 0,${height}" fill="url(#beam1)" />
      <circle cx="${width * 0.15}" cy="${height * 0.2}" r="6" fill="${glow}" fill-opacity="0.4" />
      <circle cx="${width * 0.85}" cy="${height * 0.25}" r="8" fill="${glow}" fill-opacity="0.3" />
      <circle cx="${width * 0.22}" cy="${height * 0.7}" r="5" fill="${glow}" fill-opacity="0.3" />
      <circle cx="${width * 0.78}" cy="${height * 0.65}" r="7" fill="${glow}" fill-opacity="0.35" />
    </svg>
  `;

  return sharp(Buffer.from(svg))
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();
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

  let imageBuffer = null;
  let rawResponse = null;

  try {
    const result = await requestWithRetry({
      prompt: safePrompt,
      seed: safeSeed,
      steps,
      timeoutMs,
      retryCount,
    });
    imageBuffer = result.imageBuffer;
    rawResponse = result.rawResponse;
  } catch (error) {
    console.warn(
      `Cloudflare AI background generation failed (${error.message}). Generating high-quality procedural background.`
    );
    imageBuffer = await generateProceduralBackgroundBuffer({
      width,
      height,
      prompt: safePrompt,
    });
  }

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