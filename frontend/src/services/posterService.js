const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| API helper
|--------------------------------------------------------------------------
*/

async function request(url, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${url}`,
    options
  );

  let data = {};

  try {
    data = await response.json();
  } catch (_) {}

 if (!response.ok) {
  console.error(
    "Poster API Error:",
    {
      status: response.status,
      statusText: response.statusText,
      response: data,
    }
  );

  const error = new Error(
    data.error ||
      data.message ||
      `Request failed with status ${response.status}.`
  );

  error.status = response.status;
  error.code = data.code;
  error.details = data.details;
  error.response = data;

  throw error;
}

  return data;
}

/*
|--------------------------------------------------------------------------
| Poster Status
|--------------------------------------------------------------------------
*/

export async function getPosterStatus() {
  return request("/api/posters/status");
}

/*
|--------------------------------------------------------------------------
| Generate Posters
|--------------------------------------------------------------------------
*/

export async function generatePoster({
  photo,
  logo,
  name,
  department,
  year,
  rollNo,
  collegeName,
  birthdayQuote,
  birthdayHeading,
  designation,
  date,
  prompt,
  style = "luxury",
  theme = "",
  colors = "",
  variationCount = 4,
  removeBackground = true,
}) {
  const formData = new FormData();

  if (photo) {
    formData.append("photo", photo);
  }

  if (logo) {
    formData.append("logo", logo);
  }

  formData.append("name", name);
  formData.append("department", department);
  formData.append("year", year);
  formData.append("rollNo", rollNo);
  formData.append("collegeName", collegeName);
  formData.append("birthdayQuote", birthdayQuote);
  formData.append("birthdayHeading", birthdayHeading);
  formData.append("designation", designation);
  formData.append("date", date);
  formData.append("prompt", prompt);
  formData.append("style", style);
  formData.append("theme", theme);
  formData.append("colors", colors);
  formData.append(
    "variationCount",
    variationCount
  );
  formData.append(
    "removeBackground",
    removeBackground
  );

  return request(
    "/api/posters/generate",
    {
      method: "POST",
      body: formData,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Cleanup
|--------------------------------------------------------------------------
*/

export async function cleanupGeneratedPosters({
  maximumAgeHours = 24,
  dryRun = false,
} = {}) {
  return request(
    "/api/posters/cleanup",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        maximumAgeHours,
        dryRun,
      }),
    }
  );
}

/*
|--------------------------------------------------------------------------
| Delete Posters
|--------------------------------------------------------------------------
*/

export async function deleteGeneratedPosters(
  filenames = []
) {
  return request(
    "/api/posters/files",
    {
      method: "DELETE",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        filenames,
      }),
    }
  );
}

/*
|--------------------------------------------------------------------------
| Download
|--------------------------------------------------------------------------
*/

export function getPosterUrl(filename) {
  return `${API_BASE_URL}/generated/${filename}`;
}

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

const posterService = {
  getPosterStatus,
  generatePoster,
  cleanupGeneratedPosters,
  deleteGeneratedPosters,
  getPosterUrl,
};

export default posterService;