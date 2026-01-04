// src/api/axiosInstance.ts
import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ;

  if (!baseURL) {
    // 개발 중에 바로 눈치채게!
    console.warn("[ENV] VITE_API_BASE_URL is missing");
  }

   const axiosInstance = axios.create({
    baseURL, // ✅ 절대 주소 (예: https://billiard-backend.onrender.com)
    timeout: 20000,
  });

axiosInstance.interceptors.request.use((config) => {
  console.log("[API]", config.method?.toUpperCase(), config.url, config.params ?? "");
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;