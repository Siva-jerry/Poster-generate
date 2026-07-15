const crypto = require("crypto");
const sharp = require("sharp");

const supabase = require(
  "../config/supabase"
);

const {
  getTemplateById,
} = require("./templateEngine");

const {
  createTemplatePreviewSvg,
  DEFAULT_PREVIEW_WIDTH,
  DEFAULT_PREVIEW_HEIGHT,
} = require("../utils/previewUtils");

const assetsBucket =
  process.env.SUPABASE_ASSETS_BUCKET ||
  "smartwish-assets";

const PREVIEW_VERSION = 1;

/*
|--------------------------------------------------------------------------
| Filename helpers
|--------------------------------------------------------------------------
*/

function sanitizeTemplateId(
  templateId
) {
  return String(templateId || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 150);
}

function createPreviewFileName(
  templateId
) {
  const safeTemplateId =
    sanitizeTemplateId(templateId);

  const uniqueValue = crypto
    .randomBytes(5)
    .toString("hex");

  return `${safeTemplateId}-v${PREVIEW_VERSION}-${uniqueValue}.webp`;
}

function createPreviewStoragePath(
  fileName
) {
  return `thumbnails/templates/${fileName}`;
}

/*
|--------------------------------------------------------------------------
| Format preview record
|--------------------------------------------------------------------------
*/

function formatPreviewRecord(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,

    templateId:
      record.template_id,

    previewUrl:
      record.preview_url,

    storagePath:
      record.storage_path,

    width: record.width,

    height: record.height,

    version: record.version,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,
  };
}

/*
|--------------------------------------------------------------------------
| Get cached preview
|--------------------------------------------------------------------------
*/

async function getCachedPreview(
  templateId
) {
  const {
    data,
    error,
  } = await supabase
    .from("template_previews")
    .select("*")
    .eq("template_id", templateId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load template preview: ${error.message}`
    );
  }

  if (
    !data ||
    Number(data.version) !==
      PREVIEW_VERSION
  ) {
    return null;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Delete previous preview file
|--------------------------------------------------------------------------
*/

async function deletePreviousPreview(
  preview
) {
  if (!preview?.storage_path) {
    return;
  }

  const {
    error,
  } = await supabase.storage
    .from(assetsBucket)
    .remove([
      preview.storage_path,
    ]);

  if (error) {
    console.error(
      "Unable to delete previous preview:",
      error.message
    );
  }
}

/*
|--------------------------------------------------------------------------
| Render preview
|--------------------------------------------------------------------------
*/

async function renderTemplatePreview({
  template,
  width,
  height,
  dynamicFields,
}) {
  const svgBuffer =
    createTemplatePreviewSvg({
      template,
      width,
      height,
      dynamicFields,
    });

  try {
    const {
      data,
      info,
    } = await sharp(svgBuffer)
      .resize({
        width,
        height,
        fit: "cover",
      })
      .webp({
        quality: 88,
        effort: 5,
      })
      .toBuffer({
        resolveWithObject: true,
      });

    return {
      previewBuffer: data,
      info,
    };
  } catch (error) {
    const renderError = new Error(
      `Unable to render template preview: ${error.message}`
    );

    renderError.statusCode = 500;

    throw renderError;
  }
}

/*
|--------------------------------------------------------------------------
| Upload preview
|--------------------------------------------------------------------------
*/

async function uploadPreview({
  templateId,
  previewBuffer,
}) {
  const fileName =
    createPreviewFileName(
      templateId
    );

  const storagePath =
    createPreviewStoragePath(
      fileName
    );

  const {
    data: uploadData,
    error: uploadError,
  } = await supabase.storage
    .from(assetsBucket)
    .upload(
      storagePath,
      previewBuffer,
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
      `Unable to upload template preview: ${uploadError.message}`
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
      "Unable to create the preview public URL."
    );
  }

  return {
    uploadedPath,
    publicUrl,
  };
}

/*
|--------------------------------------------------------------------------
| Save preview database record
|--------------------------------------------------------------------------
*/

async function savePreviewRecord({
  templateId,
  previewUrl,
  storagePath,
  width,
  height,
}) {
  const {
    data: existingRecord,
  } = await supabase
    .from("template_previews")
    .select("*")
    .eq("template_id", templateId)
    .maybeSingle();

  const {
    data,
    error,
  } = await supabase
    .from("template_previews")
    .upsert(
      {
        template_id: templateId,

        preview_url:
          previewUrl,

        storage_path:
          storagePath,

        width,

        height,

        version:
          PREVIEW_VERSION,
      },
      {
        onConflict:
          "template_id",
      }
    )
    .select("*")
    .single();

  if (error) {
    await supabase.storage
      .from(assetsBucket)
      .remove([storagePath]);

    throw new Error(
      `Unable to save template preview: ${error.message}`
    );
  }

  if (
    existingRecord &&
    existingRecord.storage_path !==
      storagePath
  ) {
    await deletePreviousPreview(
      existingRecord
    );
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Generate one template preview
|--------------------------------------------------------------------------
*/

async function generateTemplatePreview({
  templateId,
  width = DEFAULT_PREVIEW_WIDTH,
  height = DEFAULT_PREVIEW_HEIGHT,
  dynamicFields,
  force = false,
}) {
  if (!templateId?.trim()) {
    const error = new Error(
      "templateId is required."
    );

    error.statusCode = 400;

    throw error;
  }

  const safeWidth = Math.min(
    Math.max(
      Number(width) ||
        DEFAULT_PREVIEW_WIDTH,
      180
    ),
    720
  );

  const safeHeight = Math.min(
    Math.max(
      Number(height) ||
        DEFAULT_PREVIEW_HEIGHT,
      225
    ),
    900
  );

  if (!force) {
    const cachedPreview =
      await getCachedPreview(
        templateId
      );

    if (cachedPreview) {
      return {
        preview:
          formatPreviewRecord(
            cachedPreview
          ),

        cached: true,
      };
    }
  }

  const template =
    getTemplateById(templateId);

  if (!template) {
    const error = new Error(
      "Template not found."
    );

    error.statusCode = 404;

    throw error;
  }

  const {
    previewBuffer,
  } = await renderTemplatePreview({
    template,
    width: safeWidth,
    height: safeHeight,
    dynamicFields,
  });

  const uploadResult =
    await uploadPreview({
      templateId,
      previewBuffer,
    });

  const savedRecord =
    await savePreviewRecord({
      templateId,

      previewUrl:
        uploadResult.publicUrl,

      storagePath:
        uploadResult.uploadedPath,

      width: safeWidth,

      height: safeHeight,
    });

  return {
    preview:
      formatPreviewRecord(
        savedRecord
      ),

    cached: false,
  };
}

/*
|--------------------------------------------------------------------------
| Generate variation preview
|--------------------------------------------------------------------------
|
| Variation previews are returned directly as Base64 data URLs.
| They are not permanently cached unless the frontend uploads them.
|
*/

async function generateVariationPreview({
  variation,
  width = DEFAULT_PREVIEW_WIDTH,
  height = DEFAULT_PREVIEW_HEIGHT,
}) {
  if (
    !variation ||
    typeof variation !== "object"
  ) {
    const error = new Error(
      "variation is required."
    );

    error.statusCode = 400;

    throw error;
  }

  const design =
    variation.design;

  if (
    !design?.layout ||
    !design?.palette ||
    !design?.typography ||
    !design?.decoration
  ) {
    const error = new Error(
      "Variation design configuration is incomplete."
    );

    error.statusCode = 400;

    throw error;
  }

  const temporaryTemplate = {
    id:
      variation.templateId ||
      variation.id ||
      "variation-preview",

    design: {
      layout: design.layout,
      palette: design.palette,
      typography:
        design.typography,
      decoration:
        design.decoration,

      dynamicFields:
        design.dynamicFields || {},
    },
  };

  const safeWidth = Math.min(
    Math.max(
      Number(width) ||
        DEFAULT_PREVIEW_WIDTH,
      180
    ),
    720
  );

  const safeHeight = Math.min(
    Math.max(
      Number(height) ||
        DEFAULT_PREVIEW_HEIGHT,
      225
    ),
    900
  );

  const {
    previewBuffer,
    info,
  } = await renderTemplatePreview({
    template:
      temporaryTemplate,

    width: safeWidth,

    height: safeHeight,

    dynamicFields:
      design.dynamicFields,
  });

  return {
    preview: {
      width: info.width,
      height: info.height,
      mimeType: "image/webp",

      dataUrl:
        `data:image/webp;base64,` +
        previewBuffer.toString(
          "base64"
        ),
    },
  };
}

/*
|--------------------------------------------------------------------------
| Batch preview generator
|--------------------------------------------------------------------------
*/

async function generateBatchPreviews({
  templateIds,
  width,
  height,
  force = false,
}) {
  if (
    !Array.isArray(templateIds) ||
    templateIds.length === 0
  ) {
    const error = new Error(
      "templateIds must be a non-empty array."
    );

    error.statusCode = 400;

    throw error;
  }

  const uniqueTemplateIds =
    Array.from(
      new Set(
        templateIds
          .map((item) =>
            String(item || "").trim()
          )
          .filter(Boolean)
      )
    ).slice(0, 30);

  const results = [];

  /*
   * Process three previews concurrently to avoid excessive
   * memory usage on smaller deployed servers.
   */
  const concurrency = 3;

  for (
    let index = 0;
    index <
    uniqueTemplateIds.length;
    index += concurrency
  ) {
    const group =
      uniqueTemplateIds.slice(
        index,
        index + concurrency
      );

    const groupResults =
      await Promise.all(
        group.map(
          async (templateId) => {
            try {
              const result =
                await generateTemplatePreview({
                  templateId,
                  width,
                  height,
                  force,
                });

              return {
                success: true,
                templateId,
                ...result,
              };
            } catch (error) {
              return {
                success: false,
                templateId,
                error:
                  error.message,
              };
            }
          }
        )
      );

    results.push(...groupResults);
  }

  return {
    results,

    summary: {
      requested:
        uniqueTemplateIds.length,

      successful:
        results.filter(
          (item) => item.success
        ).length,

      failed:
        results.filter(
          (item) => !item.success
        ).length,
    },
  };
}

/*
|--------------------------------------------------------------------------
| Get existing preview
|--------------------------------------------------------------------------
*/

async function getTemplatePreview({
  templateId,
}) {
  const preview =
    await getCachedPreview(
      templateId
    );

  return formatPreviewRecord(
    preview
  );
}

module.exports = {
  generateTemplatePreview,
  generateVariationPreview,
  generateBatchPreviews,
  getTemplatePreview,
};