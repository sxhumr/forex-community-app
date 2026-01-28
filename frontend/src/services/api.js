import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  // ❌ REMOVE withCredentials
});

export default api;
