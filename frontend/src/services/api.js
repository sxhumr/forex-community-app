import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://forex-community-app.onrender.com";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
});

// NEW: Automatically attach JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Ensure you save it as 'token' on login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;