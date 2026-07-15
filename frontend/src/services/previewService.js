import api from "./api";

/*
|--------------------------------------------------------------------------
| Generate previews for missing templates
|--------------------------------------------------------------------------
*/

export async function generateTemplatePreviews({
  templateIds,
  width = 360,
  height = 450,
  force = false,
}) {
  if (
    !Array.isArray(templateIds) ||
    templateIds.length === 0
  ) {
    return [];
  }

  const response = await api.post(
    "/previews/batch",
    {
      templateIds,
      width,
      height,
      force,
    }
  );

  return response.data.results || [];
}

/*
|--------------------------------------------------------------------------
| Generate one preview
|--------------------------------------------------------------------------
*/

export async function generateTemplatePreview({
  templateId,
  width = 360,
  height = 450,
  dynamicFields,
  force = false,
}) {
  const response = await api.post(
    "/previews/template",
    {
      templateId,
      width,
      height,
      dynamicFields,
      force,
    }
  );

  return response.data.preview;
}

/*
|--------------------------------------------------------------------------
| Generate temporary variation preview
|--------------------------------------------------------------------------
*/

export async function generateVariationPreview({
  variation,
  width = 360,
  height = 450,
}) {
  const response = await api.post(
    "/previews/variation",
    {
      variation,
      width,
      height,
    }
  );

  return response.data.preview;
}