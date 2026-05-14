import axios from "axios";

const courseAxios = axios.create({
  baseURL: import.meta.env.VITE_COURSE_API_URL || "http://localhost:3002/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token from localStorage (same token as main backend)
courseAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 globally
courseAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default courseAxios;
