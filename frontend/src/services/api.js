import axios from "axios";

const api = axios.create({
  baseURL: "https://forex-community-app.onrender.com",
  // ❌ REMOVE withCredentials
});

export default api;
