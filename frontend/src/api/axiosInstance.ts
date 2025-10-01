import axios from 'axios';

// Axios 인스턴스를 생성합니다.
const axiosInstance = axios.create({
  // API의 기본 URL을 설정합니다.
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 요청 인터셉터(Request Interceptor)를 추가합니다.
axiosInstance.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰을 가져옵니다.
    const token = localStorage.getItem('token');
    
    // 토큰이 존재하면, Authorization 헤더에 Bearer 토큰을 추가합니다.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 수정된 config 객체를 반환합니다.
    return config;
  },
  (error) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);

export default axiosInstance;