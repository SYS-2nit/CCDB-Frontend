import axios from "axios";

// API 관련
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
});

console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);

export default api;
