const crypto = require("crypto");

const supabase = require("../config/supabase");

/*
|--------------------------------------------------------------------------
| Security helpers
|--------------------------------------------------------------------------
*/

function createOwnerKey() {
  return `guest_${crypto.randomBytes(18).toString("hex")}`;
}

function createEditToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashEditToken(editToken) {
  return crypto
    .createHash("sha256")
    .update(editToken)
    .digest("hex");
}

function compareEditToken(
  providedEditToken,
  storedEditTokenHash
) {
  if (
    !providedEditToken ||
    !storedEditTokenHash
  ) {
    return false;
  }

  const providedHash = hashEditToken(
    providedEditToken
  );

  const providedBuffer = Buffer.from(
    providedHash,
    "hex"
  );

  const storedBuffer = Buffer.from(
    storedEditTokenHash,
    "hex"
  );

  if (
    providedBuffer.length !==
    storedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    providedBuffer,
    storedBuffer
  );
}

/*
|--------------------------------------------------------------------------
| Data helpers
|--------------------------------------------------------------------------
*/

function removePrivateFields(design) {
  if (!design) {
    return null;
  }

  const {
    edit_token_hash,
    ...safeDesign
  } = design;

  return safeDesign;
}

function normalizeDesignJson(designJson) {
  if (
    typeof designJson === "string"
  ) {
    try {
      return JSON.parse(designJson);
    } catch {
      throw new Error(
        "designJson contains invalid JSON."
      );
    }
  }

  if (
    !designJson ||
    typeof designJson !== "object" ||
    Array.isArray(designJson)
  ) {
    throw new Error(
      "designJson must be a valid JSON object."
    );
  }

  return designJson;
}

/*
|--------------------------------------------------------------------------
| Create design
|--------------------------------------------------------------------------
*/

async function createDesign({
  ownerKey,
  title,
  templateId,
  designJson,
  thumbnailUrl,
  width,
  height,
  format,
}) {
  const finalOwnerKey =
    ownerKey?.trim() || createOwnerKey();

  const editToken = createEditToken();

  const finalDesignJson =
    normalizeDesignJson(designJson);

  const designRecord = {
    owner_key: finalOwnerKey,

    edit_token_hash:
      hashEditToken(editToken),

    title:
      title?.trim() ||
      "Untitled Design",

    template_id:
      templateId?.trim() || null,

    design_json: finalDesignJson,

    thumbnail_url:
      thumbnailUrl?.trim() || null,

    width:
      Number(width) > 0
        ? Number(width)
        : 1080,

    height:
      Number(height) > 0
        ? Number(height)
        : 1350,

    format:
      format?.trim() ||
      "instagram-portrait",

    status: "draft",
  };

  const {
    data,
    error,
  } = await supabase
    .from("designs")
    .insert(designRecord)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Unable to create design: ${error.message}`
    );
  }

  return {
    design: removePrivateFields(data),
    ownerKey: finalOwnerKey,
    editToken,
  };
}

/*
|--------------------------------------------------------------------------
| List user designs
|--------------------------------------------------------------------------
*/

async function listDesigns({
  ownerKey,
  page = 1,
  limit = 20,
  search = "",
  status = "",
}) {
  if (!ownerKey?.trim()) {
    throw new Error(
      "ownerKey is required to list designs."
    );
  }

  const safePage = Math.max(
    Number(page) || 1,
    1
  );

  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    50
  );

  const startIndex =
    (safePage - 1) * safeLimit;

  const endIndex =
    startIndex + safeLimit - 1;

  let query = supabase
    .from("designs")
    .select(
      `
        id,
        owner_key,
        title,
        template_id,
        thumbnail_url,
        width,
        height,
        format,
        status,
        created_at,
        updated_at
      `,
      {
        count: "exact",
      }
    )
    .eq("owner_key", ownerKey.trim())
    .order("updated_at", {
      ascending: false,
    })
    .range(startIndex, endIndex);

  if (search?.trim()) {
    query = query.ilike(
      "title",
      `%${search.trim()}%`
    );
  }

  if (
    status &&
    ["draft", "published", "archived"].includes(
      status
    )
  ) {
    query = query.eq("status", status);
  }

  const {
    data,
    error,
    count,
  } = await query;

  if (error) {
    throw new Error(
      `Unable to list designs: ${error.message}`
    );
  }

  const total = count || 0;

  const totalPages = Math.max(
    Math.ceil(total / safeLimit),
    1
  );

  return {
    designs: data || [],

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
| Get one design
|--------------------------------------------------------------------------
*/

async function getDesignById({
  designId,
  ownerKey,
}) {
  if (!designId) {
    throw new Error(
      "Design ID is required."
    );
  }

  if (!ownerKey?.trim()) {
    throw new Error(
      "ownerKey is required to open this design."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("designs")
    .select("*")
    .eq("id", designId)
    .eq("owner_key", ownerKey.trim())
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load design: ${error.message}`
    );
  }

  return removePrivateFields(data);
}

/*
|--------------------------------------------------------------------------
| Get private design record
|--------------------------------------------------------------------------
*/

async function getPrivateDesign(designId) {
  const {
    data,
    error,
  } = await supabase
    .from("designs")
    .select("*")
    .eq("id", designId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to access design: ${error.message}`
    );
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Update design
|--------------------------------------------------------------------------
*/

async function updateDesign({
  designId,
  editToken,
  updates,
}) {
  const existingDesign =
    await getPrivateDesign(designId);

  if (!existingDesign) {
    return null;
  }

  const isAuthorized =
    compareEditToken(
      editToken,
      existingDesign.edit_token_hash
    );

  if (!isAuthorized) {
    const error = new Error(
      "Invalid edit token. You cannot modify this design."
    );

    error.statusCode = 403;

    throw error;
  }

  const allowedUpdates = {};

  if (
    typeof updates.title === "string"
  ) {
    allowedUpdates.title =
      updates.title.trim() ||
      "Untitled Design";
  }

  if (
    typeof updates.templateId ===
    "string"
  ) {
    allowedUpdates.template_id =
      updates.templateId.trim() || null;
  }

  if (
    updates.designJson !== undefined
  ) {
    allowedUpdates.design_json =
      normalizeDesignJson(
        updates.designJson
      );
  }

  if (
    typeof updates.thumbnailUrl ===
    "string"
  ) {
    allowedUpdates.thumbnail_url =
      updates.thumbnailUrl.trim() ||
      null;
  }

  if (Number(updates.width) > 0) {
    allowedUpdates.width =
      Number(updates.width);
  }

  if (Number(updates.height) > 0) {
    allowedUpdates.height =
      Number(updates.height);
  }

  if (
    typeof updates.format === "string" &&
    updates.format.trim()
  ) {
    allowedUpdates.format =
      updates.format.trim();
  }

  if (
    ["draft", "published", "archived"].includes(
      updates.status
    )
  ) {
    allowedUpdates.status =
      updates.status;
  }

  if (
    Object.keys(allowedUpdates).length === 0
  ) {
    throw new Error(
      "No valid design fields were provided for updating."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("designs")
    .update(allowedUpdates)
    .eq("id", designId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Unable to update design: ${error.message}`
    );
  }

  return removePrivateFields(data);
}

/*
|--------------------------------------------------------------------------
| Duplicate design
|--------------------------------------------------------------------------
*/

async function duplicateDesign({
  designId,
  ownerKey,
  title,
}) {
  const originalDesign =
    await getDesignById({
      designId,
      ownerKey,
    });

  if (!originalDesign) {
    return null;
  }

  return createDesign({
    ownerKey,
    title:
      title?.trim() ||
      `${originalDesign.title} Copy`,

    templateId:
      originalDesign.template_id,

    designJson:
      originalDesign.design_json,

    thumbnailUrl:
      originalDesign.thumbnail_url,

    width:
      originalDesign.width,

    height:
      originalDesign.height,

    format:
      originalDesign.format,
  });
}

/*
|--------------------------------------------------------------------------
| Delete design
|--------------------------------------------------------------------------
*/

async function deleteDesign({
  designId,
  editToken,
}) {
  const existingDesign =
    await getPrivateDesign(designId);

  if (!existingDesign) {
    return false;
  }

  const isAuthorized =
    compareEditToken(
      editToken,
      existingDesign.edit_token_hash
    );

  if (!isAuthorized) {
    const error = new Error(
      "Invalid edit token. You cannot delete this design."
    );

    error.statusCode = 403;

    throw error;
  }

  const {
    error,
  } = await supabase
    .from("designs")
    .delete()
    .eq("id", designId);

  if (error) {
    throw new Error(
      `Unable to delete design: ${error.message}`
    );
  }

  return true;
}

module.exports = {
  createDesign,
  listDesigns,
  getDesignById,
  updateDesign,
  duplicateDesign,
  deleteDesign,
};