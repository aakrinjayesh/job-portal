import axiosInstance from "../../candidate/api/axiosInstance";

// ---------------------------
// Jobs
// ---------------------------
export async function GetJobsList(page = 1, limit = 10) {
  try {
    const response = await axiosInstance.get(`/jobs?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
}

export async function GetJobDetails(payload) {
  try {
    const data = JSON.stringify(payload);
    const response = await axiosInstance.post("/job/details", data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error("Error in GetJobDetails:", error);
    throw error;
  }
}

export async function DeleteJobDetails(payload) {
  try {
    const response = await axiosInstance.delete("/jobs/delete", {
      data: payload,
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in DeleteJobDetails:", error);
    throw error;
  }
}

// ---------------------------
// User Profile
// ---------------------------
export async function GetUserProfile() {
  try {
    // ✅ backend extracts userId from JWT
    const response = await axiosInstance.post("/profile/details", {});
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

export async function UpdateUserProfile(payload) {
  try {
    const response = await axiosInstance.put("/profile", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function UpdateUserAddress(data) {
  try {
    // ✅ userId is not sent via URL; backend takes from JWT
    const response = await axiosInstance.put("/profile/update/address", data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user address:", error);
    throw error;
  }
}

// ---------------------------
// Country & State
// ---------------------------
export async function GetCountries() {
  try {
    const response = await axiosInstance.get("/countries");
    return response.data;
   }
    
   catch (error) {
    console.error("Error fetching countries:", error);
    throw error;
  }
}


// ---------------------------
// Resume Upload
// ---------------------------
export async function UploadPdf(formdata) {
  try {
    const response = await axiosInstance.post("/upload", formdata, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in UploadPdf:", error);
    throw error;
  }
}

// ---------------------------
// Jobs (Create / Update)
// ---------------------------
export async function CreateJob(payload) {
  try {
    const response = await axiosInstance.post("/jobs/create", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in CreateJob:", error.response?.data || error);
    throw error;
  }
}

export async function UpdateJob(payload) {
  try {
    const response = await axiosInstance.post("/jobs/update", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in UpdateJob:", error);
    throw error;
  }
}

// ---------------------------
// Candidate / Vendor APIs
// ---------------------------
export async function GetCandidateDeatils(payload) {
  try {
    const response = await axiosInstance.post("/job/applicants", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in GetCandidateDeatils:", error);
    throw error;
  }
}

export async function GetVendorCandidates() {
  try {
    const response = await axiosInstance.get("/vendor/candidates", {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in GetVendorCandidates:", error);
    throw error;
  }
}

export async function CreateVendorCandidate(payload) {
  try {
    const response = await axiosInstance.post("/vendor/candidate/create", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in CreateVendorCandidate:", error);
    throw error;
  }
}

export async function UpdateVendorCandidate(payload) {
  try {
    const response = await axiosInstance.post("/vendor/candidate/update", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in UpdateVendorCandidate:", error);
    throw error;
  }
}

export async function DeleteVendorCandidate(payload) {
  try {
    const response = await axiosInstance.post("/vendor/candidate/delete", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in DeleteVendorCandidate:", error);
    throw error;
  }
}
// ---------------------------
// User Address
// ---------------------------
export async function GetUserAddress() {
  try {
    // backend extracts userId from JWT
    const response = await axiosInstance.get("/profile/address", {});
    return response.data;
  } catch (error) {
    console.error("Error fetching user address:", error);
    throw error;
  }
}