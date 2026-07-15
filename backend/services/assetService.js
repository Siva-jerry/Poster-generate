const supabase = require("../config/supabase");

const {
  validateAssetType,
  createAssetFileName,
  createAssetStoragePath,
  optimiseImage,
} = require("../utils/imageUtils");

const assetsBucket =
  process.env.SUPABASE_ASSETS_BUCKET ||
  "smartwish-assets";

/*
|--------------------------------------------------------------------------
| Convert database asset record to frontend-friendly format
|--------------------------------------------------------------------------
*/

function formatAssetRecord(asset) {
  if (!asset) {
    return null;
  }

  return {
    id: asset.id,
    ownerKey: asset.owner_key,
    assetType: asset.asset_type,
    bucket: asset.bucket_name,
    path: asset.storage_path,
    publicUrl: asset.public_url,
    originalFileName: asset.original_file_name,
    mimeType: asset.mime_type,
    width: asset.width,
    height: asset.height,
    sizeBytes: Number(asset.size_bytes || 0),
    createdAt: asset.created_at,
  };
}

/*
|--------------------------------------------------------------------------
| Upload asset
|--------------------------------------------------------------------------
*/

async function uploadAsset({
  file,
  assetType,
  ownerKey,
}) {
  if (!file) {
    const error = new Error(
      "Image file is required."
    );

    error.statusCode = 400;
    throw error;
  }

  if (!ownerKey?.trim()) {
    const error = new Error(
      "ownerKey is required."
    );

    error.statusCode = 400;
    throw error;
  }

  validateAssetType(assetType);

  /*
   * Validate, resize and convert the uploaded image to WebP.
   */
  const {
    data: optimisedImageBuffer,
    info,
  } = await optimiseImage({
    imageBuffer: file.buffer,
    assetType,
  });

  const fileName = createAssetFileName({
    originalName: file.originalname,
    extension: "webp",
  });

  const storagePath =
    createAssetStoragePath({
      assetType,
      ownerKey,
      fileName,
    });

  /*
   * Upload processed image to Supabase Storage.
   */
  const {
    data: uploadData,
    error: uploadError,
  } = await supabase.storage
    .from(assetsBucket)
    .upload(
      storagePath,
      optimisedImageBuffer,
      {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      }
    );

  if (uploadError) {
    throw new Error(
      `Unable to upload image: ${uploadError.message}`
    );
  }

  const uploadedPath =
    uploadData?.path || storagePath;

  /*
   * Create the public URL.
   */
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
      "Unable to create a public URL for the uploaded image."
    );
  }

  /*
   * Save asset information in the public.assets table.
   */
  const assetRecord = {
    owner_key: ownerKey.trim(),
    asset_type: assetType,
    bucket_name: assetsBucket,
    storage_path: uploadedPath,
    public_url: publicUrl,
    original_file_name: file.originalname,
    mime_type: "image/webp",
    width: info.width,
    height: info.height,
    size_bytes: optimisedImageBuffer.length,
  };

  const {
    data: savedAsset,
    error: assetRecordError,
  } = await supabase
    .from("assets")
    .insert(assetRecord)
    .select("*")
    .single();

  /*
   * If database insertion fails, remove the uploaded Storage file.
   */
  if (assetRecordError) {
    await supabase.storage
      .from(assetsBucket)
      .remove([uploadedPath]);

    throw new Error(
      `Unable to save asset information: ${assetRecordError.message}`
    );
  }

  return {
    asset: formatAssetRecord(savedAsset),
  };
}

/*
|--------------------------------------------------------------------------
| List assets
|--------------------------------------------------------------------------
*/

async function listAssets({
  ownerKey,
  assetType,
  page = 1,
  limit = 30,
}) {
  if (!ownerKey?.trim()) {
    const error = new Error(
      "ownerKey is required."
    );

    error.statusCode = 400;
    throw error;
  }

  if (assetType) {
    validateAssetType(assetType);
  }

  const safePage = Math.max(
    Number(page) || 1,
    1
  );

  const safeLimit = Math.min(
    Math.max(Number(limit) || 30, 1),
    60
  );

  const startIndex =
    (safePage - 1) * safeLimit;

  const endIndex =
    startIndex + safeLimit - 1;

  let query = supabase
    .from("assets")
    .select("*", {
      count: "exact",
    })
    .eq("owner_key", ownerKey.trim())
    .order("created_at", {
      ascending: false,
    })
    .range(startIndex, endIndex);

  if (assetType) {
    query = query.eq(
      "asset_type",
      assetType
    );
  }

  const {
    data,
    error,
    count,
  } = await query;

  if (error) {
    throw new Error(
      `Unable to list assets: ${error.message}`
    );
  }

  const total = count || 0;

  const totalPages = Math.max(
    Math.ceil(total / safeLimit),
    1
  );

  return {
    assets: (data || []).map(
      formatAssetRecord
    ),

    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNextPage:
        safePage < totalPages,
      hasPreviousPage:
        safePage > 1,
    },
  };
}

/*
|--------------------------------------------------------------------------
| Get one asset
|--------------------------------------------------------------------------
*/

async function getAssetById({
  assetId,
  ownerKey,
}) {
  if (!assetId) {
    const error = new Error(
      "assetId is required."
    );

    error.statusCode = 400;
    throw error;
  }

  if (!ownerKey?.trim()) {
    const error = new Error(
      "ownerKey is required."
    );

    error.statusCode = 400;
    throw error;
  }

  const {
    data,
    error,
  } = await supabase
    .from("assets")
    .select("*")
    .eq("id", assetId)
    .eq("owner_key", ownerKey.trim())
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load asset: ${error.message}`
    );
  }

  return formatAssetRecord(data);
}

/*
|--------------------------------------------------------------------------
| Delete asset
|--------------------------------------------------------------------------
*/

async function deleteAsset({
  assetId,
  ownerKey,
}) {
  if (!assetId) {
    const error = new Error(
      "assetId is required."
    );

    error.statusCode = 400;
    throw error;
  }

  if (!ownerKey?.trim()) {
    const error = new Error(
      "ownerKey is required."
    );

    error.statusCode = 400;
    throw error;
  }

  /*
   * Find the asset and verify ownership.
   */
  const {
    data: asset,
    error: findError,
  } = await supabase
    .from("assets")
    .select("*")
    .eq("id", assetId)
    .eq("owner_key", ownerKey.trim())
    .maybeSingle();

  if (findError) {
    throw new Error(
      `Unable to find asset: ${findError.message}`
    );
  }

  if (!asset) {
    return null;
  }

  /*
   * Delete the physical file from Supabase Storage.
   */
  const {
    error: storageDeleteError,
  } = await supabase.storage
    .from(asset.bucket_name)
    .remove([asset.storage_path]);

  if (storageDeleteError) {
    throw new Error(
      `Unable to delete stored image: ${storageDeleteError.message}`
    );
  }

  /*
   * Delete the matching database record.
   */
  const {
    error: recordDeleteError,
  } = await supabase
    .from("assets")
    .delete()
    .eq("id", asset.id);

  if (recordDeleteError) {
    throw new Error(
      `The image file was deleted, but its database record could not be removed: ${recordDeleteError.message}`
    );
  }

  return {
    id: asset.id,
    deletedPath: asset.storage_path,
  };
}

/*
|--------------------------------------------------------------------------
| Get public URL from a Storage path
|--------------------------------------------------------------------------
*/

function getPublicAssetUrl({
  storagePath,
}) {
  if (!storagePath?.trim()) {
    return null;
  }

  const {
    data,
  } = supabase.storage
    .from(assetsBucket)
    .getPublicUrl(storagePath.trim());

  return data?.publicUrl || null;
}

module.exports = {
  uploadAsset,
  listAssets,
  getAssetById,
  deleteAsset,
  getPublicAssetUrl,
};