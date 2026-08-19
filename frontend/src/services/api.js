import axios from "axios";

const rawApiUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const cleanBase = rawApiUrl.replace(/\/+$/, "").replace(/\/api$/, "");
const apiBaseUrl = `${cleanBase}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 120000,
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      "The request could not be completed.";

    return Promise.reject(
      new Error(message)
    );
  }
);

export default api;