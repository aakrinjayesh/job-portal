import axiosInstance from "../../candidate/api/axiosInstance";

/* - formData: FormData containing the file (field name: "file") and any meta you want
 * - onProgress: optional callback(progressEvent) where progressEvent.loaded/progressEvent.total exist
 *
 * Returns the axios response (response.data considered the uploaded file metadata)
 */
export async function uploadVideo(formData, onProgress) {
  
    const res = await axiosInstance.post(
      "/upload/video", // intentionally empty — axiosInstance controls the route
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (onProgress && typeof onProgress === "function") {
            onProgress(progressEvent);
          }
        },
      }
    );
    return res;
  } 

/**
 * Example helper to create a course (metadata).
 * Keep it here for now — it uses axiosInstance with no hard-coded endpoints.
 * payload: plain object with course data (title, description, price, videos[], documents[])
 */
export async function createCourse(payload) {
 
    const res = await axiosInstance.post("/create/course", payload);
    return res;
  } 