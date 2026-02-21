import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://forex-community-app.onrender.com";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

export default api;