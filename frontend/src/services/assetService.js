import api from "./api";

export async function uploadAsset({
  file,
  assetType,
  ownerKey,
  onUploadProgress,
}) {
  if (!file) {
    throw new Error(
      "Please select an image."
    );
  }

  const formData = new FormData();

  formData.append("image", file);
  formData.append(
    "assetType",
    assetType
  );
  formData.append(
    "ownerKey",
    ownerKey
  );

  const response = await api.post(
    "/assets/upload",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },

      onUploadProgress(event) {
        if (
          !event.total ||
          !onUploadProgress
        ) {
          return;
        }

        const percentage =
          Math.round(
            (event.loaded * 100) /
              event.total
          );

        onUploadProgress(percentage);
      },
    }
  );

  return response.data.asset;
}

export async function removeBackground({
  assetId,
  ownerKey,
}) {
  const response = await api.post(
    "/background-removal",
    {
      assetId,
      ownerKey,
    }
  );

  return response.data.removedAsset;
}