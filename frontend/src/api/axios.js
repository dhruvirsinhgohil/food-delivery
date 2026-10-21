import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://food-delivery-5zlp.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("foodie-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;