// axiosInstance.js
import axios from "axios";
import { message } from "antd";
import { createBrowserHistory } from "history";

const history = createBrowserHistory()


const axiosInstance = axios.create({
  baseURL: "http://localhost:3000", // common base URL
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
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      message.error("Session expired. Please log in again.");
      localStorage.clear();
      history.push('/')
    } else {
      message.error("Something went wrong. Please try again.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;



