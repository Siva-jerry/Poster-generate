const sharp = require("sharp");

const supabase = require(
  "../config/supabase"
);

const {
  createAssetFileName,
  createAssetStoragePath,
} = require("../utils/imageUtils");

const {
  buildBackgroundPrompt,
} = require("../utils/promptBuilder");

const cloudflareAccountId =
  process.env.CLOUDFLARE_ACCOUNT_ID;

const cloudflareApiToken =
  process.env.CLOUDFLARE_API_TOKEN;

const cloudflareModel =
  process.env.CLOUDFLARE_AI_MODEL ||
  "@cf/black-forest-labs/flux-1-schnell";

const assetsBucket =
  process.env.SUPABASE_ASSETS_BUCKET ||
  "smartwish-assets";

const dailyLimit =
  Number(
    process.env
      .AI_BACKGROUND_DAILY_LIMIT
  ) || 20;

function assertCloudflareConfiguration() {
  if (!cloudflareAccountId) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID is missing from the backend environment variables."
    );
  }

  if (!cloudflareApiToken) {
    throw new Error(
      "CLOUDFLARE_API_TOKEN is missing from the backend environment variables."
    );
  }
}

function getTodayStartIso() {
  const now = new Date();

  const startOfDay = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    )
  );

  return startOfDay.toISOString();
}

async function checkDailyLimit(
  ownerKey
) {
  const {
    count,
    error,
  } = await supabase
    .from("ai_generations")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("owner_key", ownerKey)
    .gte(
      "created_at",
      getTodayStartIso()
    )
    .in("status", [
      "pending",
      "completed",
    ]);

  if (error) {
    throw new Error(
      `Unable to check AI usage: ${error.message}`
    );
  }

  const usedToday = count || 0;

  if (usedToday >= dailyLimit) {
    const limitError = new Error(
      `Daily AI background limit reached. Maximum allowed: ${dailyLimit}.`
    );

    limitError.statusCode = 429;

    throw limitError;
  }

  return {
    usedToday,
    remaining:
      dailyLimit - usedToday,
  };
}

async function createGenerationRecord({
  ownerKey,
  promptData,
}) {
  const {
    data,
    error,
  } = await supabase
    .from("ai_generations")
    .insert({
      owner_key: ownerKey,
      provider: "cloudflare",
      model: cloudflareModel,
      prompt: promptData.prompt,
      style: promptData.style,
      mood: promptData.mood,
      primary_color:
        promptData.primaryColor,
      secondary_color:
        promptData.secondaryColor,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Unable to create AI generation record: ${error.message}`
    );
  }

  return data;
}

async function markGenerationFailed({
  generationId,
  errorMessage,
}) {
  if (!generationId) {
    return;
  }

  await supabase
    .from("ai_generations")
    .update({
      status: "failed",
      error_message: String(
        errorMessage ||
          "Unknown generation error"
      ).slice(0, 1000),
    })
    .eq("id", generationId);
}

async function callCloudflareAI({
  prompt,
  seed,
}) {
  assertCloudflareConfiguration();

  const endpoint =
    `https://api.cloudflare.com/client/v4/accounts/` +
    `${cloudflareAccountId}/ai/run/${cloudflareModel}`;

  const response = await fetch(
    endpoint,
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${cloudflareApiToken}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        prompt,
        seed,
        steps: 8,
      }),

      signal:
        AbortSignal.timeout(120000),
    }
  );

  const responseText =
    await response.text();

  let responseJson;

  try {
    responseJson =
      JSON.parse(responseText);
  } catch {
    throw new Error(
      `Cloudflare returned an invalid response with status ${response.status}.`
    );
  }

  if (
    !response.ok ||
    responseJson.success === false
  ) {
    const cloudflareMessage =
      responseJson.errors?.[0]
        ?.message ||
      responseJson.result?.error ||
      `Cloudflare AI request failed with status ${response.status}.`;

    const cloudflareError =
      new Error(
        cloudflareMessage
      );

    cloudflareError.statusCode =
      response.status === 429
        ? 429
        : 502;

    throw cloudflareError;
  }

  const base64Image =
    responseJson.result?.image ||
    responseJson.image;

  if (!base64Image) {
    throw new Error(
      "Cloudflare AI did not return an image."
    );
  }

  const imageBuffer = Buffer.from(
    base64Image,
    "base64"
  );

  if (!imageBuffer.length) {
    throw new Error(
      "Cloudflare AI returned an empty image."
    );
  }

  return imageBuffer;
}

async function optimiseGeneratedBackground(
  imageBuffer
) {
  try {
    return await sharp(
      imageBuffer,
      {
        failOn: "error",
      }
    )
      .rotate()
      .resize({
        width: 1080,
        height: 1350,
        fit: "cover",
        position: "centre",
        withoutEnlargement: false,
      })
      .webp({
        quality: 92,
        effort: 5,
      })
      .toBuffer({
        resolveWithObject: true,
      });
  } catch {
    const error = new Error(
      "The generated AI image could not be processed."
    );

    error.statusCode = 502;

    throw error;
  }
}

async function uploadGeneratedBackground({
  ownerKey,
  imageBuffer,
  promptData,
}) {
  const fileName =
    createAssetFileName({
      originalName:
        `${promptData.style}-${promptData.mood}-background`,
      extension: "webp",
    });

  const storagePath =
    createAssetStoragePath({
      assetType:
        "ai-background",
      ownerKey,
      fileName,
    });

  const {
    data: uploadData,
    error: uploadError,
  } = await supabase.storage
    .from(assetsBucket)
    .upload(
      storagePath,
      imageBuffer,
      {
        contentType:
          "image/webp",

        cacheControl:
          "31536000",

        upsert: false,
      }
    );

  if (uploadError) {
    throw new Error(
      `Unable to upload generated background: ${uploadError.message}`
    );
  }

  const uploadedPath =
    uploadData?.path ||
    storagePath;

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(assetsBucket)
    .getPublicUrl(uploadedPath);

  const publicUrl =
    publicUrlData?.publicUrl;

  if (!publicUrl) {
    await supabase.storage
      .from(assetsBucket)
      .remove([uploadedPath]);

    throw new Error(
      "Unable to create a public URL for the generated background."
    );
  }

  return {
    uploadedPath,
    publicUrl,
    fileName,
  };
}

async function saveGeneratedAsset({
  ownerKey,
  uploadResult,
  imageInfo,
}) {
  const {
    data,
    error,
  } = await supabase
    .from("assets")
    .insert({
      owner_key: ownerKey,

      asset_type:
        "ai-background",

      bucket_name:
        assetsBucket,

      storage_path:
        uploadResult.uploadedPath,

      public_url:
        uploadResult.publicUrl,

      original_file_name:
        uploadResult.fileName,

      mime_type:
        "image/webp",

      width:
        imageInfo.width,

      height:
        imageInfo.height,

      size_bytes:
        imageInfo.sizeBytes,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.storage
      .from(assetsBucket)
      .remove([
        uploadResult.uploadedPath,
      ]);

    throw new Error(
      `Unable to save generated asset: ${error.message}`
    );
  }

  return data;
}

async function completeGenerationRecord({
  generationId,
  assetId,
}) {
  const {
    error,
  } = await supabase
    .from("ai_generations")
    .update({
      asset_id: assetId,
      status: "completed",
      error_message: null,
    })
    .eq("id", generationId);

  if (error) {
    console.error(
      "Unable to complete AI generation record:",
      error.message
    );
  }
}

async function generateAIBackground({
  ownerKey,
  style,
  mood,
  primaryColor,
  secondaryColor,
  customPrompt,
  seed,
}) {
  if (!ownerKey?.trim()) {
    const error = new Error(
      "ownerKey is required."
    );

    error.statusCode = 400;

    throw error;
  }

  const normalizedOwnerKey =
    ownerKey.trim();

  const promptData =
    buildBackgroundPrompt({
      style,
      mood,
      primaryColor,
      secondaryColor,
      customPrompt,
    });

  const usage =
    await checkDailyLimit(
      normalizedOwnerKey
    );

  const generation =
    await createGenerationRecord({
      ownerKey:
        normalizedOwnerKey,
      promptData,
    });

  try {
    const finalSeed =
      Number.isInteger(
        Number(seed)
      )
        ? Math.abs(
            Number(seed)
          )
        : Math.floor(
            Math.random() *
              2147483647
          );

    const cloudflareImage =
      await callCloudflareAI({
        prompt:
          promptData.prompt,
        seed: finalSeed,
      });

    const {
      data:
        optimisedImageBuffer,

      info,
    } =
      await optimiseGeneratedBackground(
        cloudflareImage
      );

    const uploadResult =
      await uploadGeneratedBackground({
        ownerKey:
          normalizedOwnerKey,

        imageBuffer:
          optimisedImageBuffer,

        promptData,
      });

    const savedAsset =
      await saveGeneratedAsset({
        ownerKey:
          normalizedOwnerKey,

        uploadResult,

        imageInfo: {
          width: info.width,
          height: info.height,

          sizeBytes:
            optimisedImageBuffer.length,
        },
      });

    await completeGenerationRecord({
      generationId:
        generation.id,

      assetId:
        savedAsset.id,
    });

    return {
      generation: {
        id: generation.id,

        provider:
          "cloudflare",

        model:
          cloudflareModel,

        prompt:
          promptData.prompt,

        style:
          promptData.style,

        mood:
          promptData.mood,

        primaryColor:
          promptData.primaryColor,

        secondaryColor:
          promptData.secondaryColor,

        seed: finalSeed,
      },

      asset: {
        id: savedAsset.id,

        ownerKey:
          savedAsset.owner_key,

        assetType:
          savedAsset.asset_type,

        bucket:
          savedAsset.bucket_name,

        path:
          savedAsset.storage_path,

        publicUrl:
          savedAsset.public_url,

        mimeType:
          savedAsset.mime_type,

        width:
          savedAsset.width,

        height:
          savedAsset.height,

        sizeBytes: Number(
          savedAsset.size_bytes ||
            0
        ),

        createdAt:
          savedAsset.created_at,
      },

      usage: {
        dailyLimit,

        usedToday:
          usage.usedToday + 1,

        remaining:
          Math.max(
            usage.remaining - 1,
            0
          ),
      },
    };
  } catch (error) {
    await markGenerationFailed({
      generationId:
        generation.id,

      errorMessage:
        error.message,
    });

    throw error;
  }
}

module.exports = {
  generateAIBackground,
};