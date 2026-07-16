import api from "./api";

/*
|--------------------------------------------------------------------------
| Fetch template list
|--------------------------------------------------------------------------
*/

export async function fetchTemplates({
  page = 1,
  limit = 12,
  search = "",
  category = "all",
  palette = "all",
  layout = "all",
  sortBy = "trending",
} = {}) {
  const response = await api.get(
    "/templates",
    {
      params: {
        page,
        limit,

        search:
          search.trim() || undefined,

        category:
          category === "all"
            ? undefined
            : category,

        palette:
          palette === "all"
            ? undefined
            : palette,

        layout:
          layout === "all"
            ? undefined
            : layout,

        sortBy,
      },
    }
  );

  return {
    templates:
      response.data?.templates || [],

    pagination:
      response.data?.pagination || {
        page: 1,
        limit,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
  };
}

/*
|--------------------------------------------------------------------------
| Fetch one template
|--------------------------------------------------------------------------
*/

export async function fetchTemplateById(
  templateId
) {
  if (!templateId) {
    throw new Error(
      "Template ID is required."
    );
  }

  const response = await api.get(
    `/templates/${encodeURIComponent(
      templateId
    )}`
  );

  return response.data?.template;
}

/*
|--------------------------------------------------------------------------
| Normalize one filter option
|--------------------------------------------------------------------------
*/

function normalizeFilterOption(
  item,
  index,
  prefix
) {
  if (
    typeof item === "string" ||
    typeof item === "number"
  ) {
    return {
      id: String(item),
      name: String(item),
    };
  }

  if (
    !item ||
    typeof item !== "object"
  ) {
    return {
      id: `${prefix.toLowerCase()}-${index}`,
      name: `${prefix} ${index + 1}`,
    };
  }

  const rawId =
    item.id ??
    item.slug ??
    item.key ??
    item.value ??
    `${prefix.toLowerCase()}-${index}`;

  const possibleName =
    item.name ??
    item.label ??
    item.title ??
    item.displayName;

  const safeName =
    typeof possibleName === "string" ||
    typeof possibleName === "number"
      ? String(possibleName)
      : `${prefix} ${index + 1}`;

  return {
    ...item,
    id: String(rawId),
    name: safeName,
  };
}

/*
|--------------------------------------------------------------------------
| Normalize one filter collection
|--------------------------------------------------------------------------
*/

function normalizeFilterCollection(
  collection,
  prefix
) {
  if (!Array.isArray(collection)) {
    return [];
  }

  return collection.map(
    (item, index) =>
      normalizeFilterOption(
        item,
        index,
        prefix
      )
  );
}

/*
|--------------------------------------------------------------------------
| Fetch template filters
|--------------------------------------------------------------------------
*/

export async function fetchTemplateFilters() {
  const response = await api.get(
    "/templates/filters"
  );

  const rawFilters =
    response.data?.filters || {};

  return {
    ...rawFilters,

    categories:
      normalizeFilterCollection(
        rawFilters.categories,
        "Category"
      ),

    layouts:
      normalizeFilterCollection(
        rawFilters.layouts,
        "Layout"
      ),

    palettes:
      normalizeFilterCollection(
        rawFilters.palettes,
        "Palette"
      ),

    typography:
      normalizeFilterCollection(
        rawFilters.typography,
        "Typography"
      ),
  };
}

/*
|--------------------------------------------------------------------------
| Fetch similar templates
|--------------------------------------------------------------------------
*/

export async function fetchSimilarTemplates({
  templateId,
  count = 12,
}) {
  if (!templateId) {
    throw new Error(
      "Template ID is required."
    );
  }

  const response = await api.get(
    `/templates/${encodeURIComponent(
      templateId
    )}/similar`,
    {
      params: {
        count,
      },
    }
  );

  return response.data?.templates || [];
}

/*
|--------------------------------------------------------------------------
| Generate dynamic variations
|--------------------------------------------------------------------------
*/

export async function generateTemplateVariations({
  templateId,
  mode = "similar",
  count = 12,
  category,
  dynamicFields,
  aiBackground,
}) {
  if (!templateId) {
    throw new Error(
      "Template ID is required."
    );
  }

  const response = await api.post(
    "/variations/generate",
    {
      templateId,
      mode,
      count,
      category,
      dynamicFields,
      aiBackground,
    }
  );

  return response.data;
}