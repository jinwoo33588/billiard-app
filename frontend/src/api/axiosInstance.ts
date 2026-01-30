import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

const axiosInstance = axios.create({
  baseURL,
  timeout: 20000,
});

// 역할: 모든 요청 전에 실행 → 토큰을 헤더에 자동으로 달아줌
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  // console.log("[axios baseURL]", axiosInstance.defaults.baseURL);
  return config;
});

export default axiosInstance;