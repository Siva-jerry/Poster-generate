const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

// Ensure clean base without trailing slash or duplicate /api prefix
const API_BASE_URL = rawApiUrl.replace(/\/+$/, "").replace(/\/api$/, "");

/*
|--------------------------------------------------------------------------
| API helper
|--------------------------------------------------------------------------
*/

async function request(url, options = {}) {
  const cleanEndpoint = url.startsWith("/") ? url : `/${url}`;
  const response = await fetch(
    `${API_BASE_URL}${cleanEndpoint}`,
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

export async function generatePoster(input) {
  let body;

  if (input instanceof FormData) {
    body = input;
  } else {
    const {
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
    } = input || {};

    const formData = new FormData();

    if (photo) {
      formData.append("photo", photo);
    }

    if (logo) {
      formData.append("logo", logo);
    }

    if (name) formData.append("name", name);
    if (department) formData.append("department", department);
    if (year) formData.append("year", year);
    if (rollNo) formData.append("rollNo", rollNo);
    if (collegeName) formData.append("collegeName", collegeName);
    if (birthdayQuote) formData.append("birthdayQuote", birthdayQuote);
    if (birthdayHeading) formData.append("birthdayHeading", birthdayHeading);
    if (designation) formData.append("designation", designation);
    if (date) formData.append("date", date);
    if (prompt) formData.append("prompt", prompt);
    formData.append("style", style);
    if (theme) formData.append("theme", theme);
    if (colors) formData.append("colors", colors);
    formData.append("variationCount", variationCount);
    formData.append("removeBackground", removeBackground);

    body = formData;
  }

  return request(
    "/api/posters/generate",
    {
      method: "POST",
      body,
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