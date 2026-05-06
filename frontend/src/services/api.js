import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://forex-community-app.onrender.com";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 8000, // Reduced slightly to fail faster if the server is unresponsive
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is expired, auto-logout the user
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;