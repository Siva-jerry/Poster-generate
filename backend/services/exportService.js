const sharp = require("sharp");

const {
  PDFDocument,
} = require("pdf-lib");

const supabase = require(
  "../config/supabase"
);

const {
  createAssetStoragePath,
} = require("../utils/imageUtils");

const {
  validateExportFormat,
  parseImageDataUrl,
  createExportFileName,
  getExportMimeType,
  getExportAssetType,
} = require("../utils/exportUtils");

const assetsBucket =
  process.env.SUPABASE_ASSETS_BUCKET ||
  "smartwish-assets";

/*
|--------------------------------------------------------------------------
| Verify optional design ownership
|--------------------------------------------------------------------------
*/

async function verifyDesignOwnership({
  designId,
  ownerKey,
}) {
  if (!designId) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from("designs")
    .select(
      "id, owner_key, title, width, height"
    )
    .eq("id", designId)
    .eq("owner_key", ownerKey)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to verify design: ${error.message}`
    );
  }

  if (!data) {
    const ownershipError =
      new Error(
        "Design was not found or does not belong to this owner."
      );

    ownershipError.statusCode = 404;

    throw ownershipError;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Validate source canvas image
|--------------------------------------------------------------------------
*/

async function validateSourceImage(
  imageBuffer
) {
  try {
    const metadata = await sharp(
      imageBuffer
    ).metadata();

    if (
      !metadata.width ||
      !metadata.height
    ) {
      throw new Error(
        "Image dimensions are missing."
      );
    }

    if (
      metadata.width < 100 ||
      metadata.height < 100
    ) {
      const error = new Error(
        "The exported canvas image is too small."
      );

      error.statusCode = 400;

      throw error;
    }

    if (
      metadata.width > 8000 ||
      metadata.height > 8000
    ) {
      const error = new Error(
        "The exported image dimensions exceed the 8000 × 8000 limit."
      );

      error.statusCode = 413;

      throw error;
    }

    return metadata;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    const invalidImageError =
      new Error(
        "The submitted canvas data is not a valid image."
      );

    invalidImageError.statusCode = 400;

    throw invalidImageError;
  }
}

/*
|--------------------------------------------------------------------------
| Render PNG
|--------------------------------------------------------------------------
*/

async function renderPng(imageBuffer) {
  return sharp(imageBuffer)
    .rotate()
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .toBuffer({
      resolveWithObject: true,
    });
}

/*
|--------------------------------------------------------------------------
| Render JPEG
|--------------------------------------------------------------------------
*/

async function renderJpeg({
  imageBuffer,
  quality,
}) {
  return sharp(imageBuffer)
    .rotate()
    .flatten({
      background: "#ffffff",
    })
    .jpeg({
      quality,
      chromaSubsampling: "4:4:4",
      mozjpeg: true,
    })
    .toBuffer({
      resolveWithObject: true,
    });
}

/*
|--------------------------------------------------------------------------
| Render WebP
|--------------------------------------------------------------------------
*/

async function renderWebp({
  imageBuffer,
  quality,
}) {
  return sharp(imageBuffer)
    .rotate()
    .webp({
      quality,
      alphaQuality: 100,
      effort: 5,
    })
    .toBuffer({
      resolveWithObject: true,
    });
}

/*
|--------------------------------------------------------------------------
| Render PDF
|--------------------------------------------------------------------------
*/

async function renderPdf({
  imageBuffer,
  title,
}) {
  /*
   * Convert source to PNG first so transparency and colours
   * are handled consistently.
   */
  const {
    data: pngBuffer,
    info,
  } = await renderPng(imageBuffer);

  const pdfDocument =
    await PDFDocument.create();

  pdfDocument.setTitle(
    title || "SmartWish Poster"
  );

  pdfDocument.setCreator(
    "SmartWish AI"
  );

  pdfDocument.setProducer(
    "SmartWish AI Export Service"
  );

  const embeddedImage =
    await pdfDocument.embedPng(
      pngBuffer
    );

  /*
   * PDF points use 72 units per inch.
   * The aspect ratio is preserved.
   *
   * The page is sized from the poster dimensions, with a
   * maximum long side suitable for a printable poster PDF.
   */
  const maximumPageSide = 1440;

  const imageAspectRatio =
    info.width / info.height;

  let pageWidth;
  let pageHeight;

  if (info.width >= info.height) {
    pageWidth = maximumPageSide;
    pageHeight =
      maximumPageSide /
      imageAspectRatio;
  } else {
    pageHeight = maximumPageSide;
    pageWidth =
      maximumPageSide *
      imageAspectRatio;
  }

  const page = pdfDocument.addPage([
    pageWidth,
    pageHeight,
  ]);

  page.drawImage(embeddedImage, {
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
  });

  const pdfBytes =
    await pdfDocument.save();

  return {
    data: Buffer.from(pdfBytes),
    info: {
      width: info.width,
      height: info.height,
      format: "pdf",
    },
  };
}

/*
|--------------------------------------------------------------------------
| Convert image to requested format
|--------------------------------------------------------------------------
*/

async function renderExport({
  imageBuffer,
  format,
  quality,
  title,
}) {
  switch (format) {
    case "png":
      return renderPng(imageBuffer);

    case "jpeg":
      return renderJpeg({
        imageBuffer,
        quality,
      });

    case "webp":
      return renderWebp({
        imageBuffer,
        quality,
      });

    case "pdf":
      return renderPdf({
        imageBuffer,
        title,
      });

    default:
      throw new Error(
        "Unsupported export format."
      );
  }
}

/*
|--------------------------------------------------------------------------
| Upload exported file
|--------------------------------------------------------------------------
*/

async function uploadExport({
  exportBuffer,
  fileName,
  format,
  ownerKey,
}) {
  const assetType =
    getExportAssetType(format);

  const mimeType =
    getExportMimeType(format);

  const storagePath =
    createAssetStoragePath({
      assetType,
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
      exportBuffer,
      {
        contentType: mimeType,
        cacheControl: "31536000",
        upsert: false,
      }
    );

  if (uploadError) {
    throw new Error(
      `Unable to upload exported poster: ${uploadError.message}`
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
      "Unable to create the exported poster URL."
    );
  }

  return {
    assetType,
    mimeType,
    uploadedPath,
    publicUrl,
  };
}

/*
|--------------------------------------------------------------------------
| Save export record
|--------------------------------------------------------------------------
*/

async function saveExportRecord({
  ownerKey,
  designId,
  assetType,
  uploadedPath,
  publicUrl,
  fileName,
  mimeType,
  width,
  height,
  sizeBytes,
}) {
  const assetRecord = {
    owner_key: ownerKey,
    asset_type: assetType,
    bucket_name: assetsBucket,
    storage_path: uploadedPath,
    public_url: publicUrl,
    original_file_name: fileName,
    mime_type: mimeType,
    width: width || null,
    height: height || null,
    size_bytes: sizeBytes,
  };

  const {
    data,
    error,
  } = await supabase
    .from("assets")
    .insert(assetRecord)
    .select("*")
    .single();

  if (error) {
    await supabase.storage
      .from(assetsBucket)
      .remove([uploadedPath]);

    throw new Error(
      `Unable to save export information: ${error.message}`
    );
  }

  /*
   * Save the newest thumbnail/export URL on the design.
   * This is optional and only happens when a design ID exists.
   */
  if (designId) {
    await supabase
      .from("designs")
      .update({
        thumbnail_url:
          publicUrl,
      })
      .eq("id", designId)
      .eq("owner_key", ownerKey);
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Main export function
|--------------------------------------------------------------------------
*/

async function exportPoster({
  ownerKey,
  designId,
  title,
  format,
  quality,
  imageDataUrl,
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

  const normalizedFormat =
    validateExportFormat(format);

  const safeQuality = Math.min(
    Math.max(Number(quality) || 92, 40),
    100
  );

  const {
    imageBuffer,
  } = parseImageDataUrl(
    imageDataUrl
  );

  const sourceMetadata =
    await validateSourceImage(
      imageBuffer
    );

  const design =
    await verifyDesignOwnership({
      designId,
      ownerKey:
        normalizedOwnerKey,
    });

  const finalTitle =
    title?.trim() ||
    design?.title ||
    "SmartWish Poster";

  const {
    data: exportBuffer,
    info,
  } = await renderExport({
    imageBuffer,
    format:
      normalizedFormat,
    quality: safeQuality,
    title: finalTitle,
  });

  const fileName =
    createExportFileName({
      title: finalTitle,
      format:
        normalizedFormat,
    });

  const uploadResult =
    await uploadExport({
      exportBuffer,
      fileName,
      format:
        normalizedFormat,
      ownerKey:
        normalizedOwnerKey,
    });

  const savedAsset =
    await saveExportRecord({
      ownerKey:
        normalizedOwnerKey,
      designId,
      assetType:
        uploadResult.assetType,
      uploadedPath:
        uploadResult.uploadedPath,
      publicUrl:
        uploadResult.publicUrl,
      fileName,
      mimeType:
        uploadResult.mimeType,
      width:
        info.width ||
        sourceMetadata.width,
      height:
        info.height ||
        sourceMetadata.height,
      sizeBytes:
        exportBuffer.length,
    });

  return {
    export: {
      id: savedAsset.id,

      designId:
        designId || null,

      title: finalTitle,

      format:
        normalizedFormat,

      fileName,

      mimeType:
        uploadResult.mimeType,

      width:
        savedAsset.width,

      height:
        savedAsset.height,

      sizeBytes: Number(
        savedAsset.size_bytes ||
          exportBuffer.length
      ),

      storagePath:
        savedAsset.storage_path,

      publicUrl:
        savedAsset.public_url,

      createdAt:
        savedAsset.created_at,
    },
  };
}

module.exports = {
  exportPoster,
};