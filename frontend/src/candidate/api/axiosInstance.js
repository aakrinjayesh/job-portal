// axiosInstance.js
import axios from "axios";
import { message } from "antd";
import { createBrowserHistory } from "history";

const history = createBrowserHistory()


const axiosInstance = axios.create({
  baseURL: "http://localhost:3000", 
  withCredentials: true,
  maxBodyLength: Infinity,
});

// 🔹 Add Authorization token before request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Handle errors globally
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//       message.error("Session expired. Please log in again.");
//       localStorage.clear();
//       history.push('/')
//     } else {
//       message.error("Something went wrong. Please try again.");
//     }
//     return Promise.reject(error);
//   }
// );

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await axiosInstance.get(
          "/auth/refresh-token"
        );

        const newToken = res.data.token;

        localStorage.setItem("token", newToken);
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newToken}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        localStorage.removeItem("astoken");
        localStorage.removeItem("asuser");
        window.location.href = "/";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;



