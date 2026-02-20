import axios from "axios";

const DEFAULT_BASE_URL = "https://forex-community-app.onrender.com";
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

const normalizedBase = rawBaseUrl.replace(/\/$/, "");
const API_BASE_URL = normalizedBase.endsWith("/api")
  ? normalizedBase
  : `${normalizedBase}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof config.url === "string" && config.url.startsWith("/api/")) {
    config.url = config.url.replace(/^\/api/, "");
  }

  return config;
});

export default api;
