import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

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