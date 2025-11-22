import axiosInstance from "../../candidate/api/axiosInstance";

export const getEvents = () => {
  return axiosInstance.get("/events");
};

export const createEvent = (payload) => {
  return axiosInstance.post("/events", payload);
};
