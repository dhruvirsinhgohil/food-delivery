import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("food-admin-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getList(payload, key) {
  const list = payload?.[key] ?? payload?.data?.[key] ?? payload?.data;
  return Array.isArray(list) ? list : [];
}

export default api;
