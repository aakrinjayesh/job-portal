import axios from "axios";

/* ================= MAIN API INSTANCE ================= */
console.log("url", import.meta.env.VITE_BACKEND_URL);
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

/* ================= REFRESH INSTANCE (NO INTERCEPTOR) ================= */
const refreshAxios = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

/* ================= ADD ACCESS TOKEN ================= */
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

/* ================= REFRESH CONTROL ================= */
let isRefreshing = false;
let subscribers = [];

function subscribe(cb) {
  subscribers.push(cb);
}

function onRefreshed(token) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

/* ================= RESPONSE INTERCEPTOR ================= */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept refresh call itself
    if (originalRequest.url.includes("/auth/refresh-token")) {
      return Promise.reject(error);
    }

    // Only refresh if token expired
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      // If refresh already in progress → queue
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribe((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await refreshAxios.get("/auth/refresh-token");
        const newToken = res.data.token;

        localStorage.setItem("token", newToken);
        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${newToken}`;

        onRefreshed(newToken);
        return axiosInstance(originalRequest);
      } catch (err) {
        // Refresh token invalid or expired → logout
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
