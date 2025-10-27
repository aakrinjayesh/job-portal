import axiosInstance from "../../candidate/api/axiosInstance";

export async function GetJobsList() {
  try {
    const response = await axiosInstance.get("/jobs",  {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in LoginRoute:", error);
    throw error;
  }
}