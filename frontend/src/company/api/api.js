import axiosInstance from "../../candidate/api/axiosInstance";

export async function GetJobsList(page = 1, limit = 10, filters = {}, signal) {
  try {
    const response = await axiosInstance.post(
      "/jobs/list",
      { page, limit, filters },
      {
        signal,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
}

export async function PostedJobsList(page = 1, limit = 10, signal) {
  try {
    const response = await axiosInstance.get(
      `/jobs/posted?page=${page}&limit=${limit}`,
      { signal },
    );
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
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in LoginRoute:", error);
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

export async function UploadPdf(formdata) {
  try {
    const response = await axiosInstance.post("/upload", formdata, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in UploadPdf:", error);
    throw error;
  }
}

// ✅ Create Job
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

// ✅ Update Job
export async function UpdateJob(payload) {
  try {
    const response = await axiosInstance.post(`/jobs/update`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in UpdateJob:", error);
    throw error;
  }
}

export async function GetCandidateDeatils(payload, signal) {
  try {
    const response = await axiosInstance.post(`/job/applicants`, payload, {
      signal,
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in UpdateJob:", error);
    throw error;
  }
}

// vender routes

export async function GetVendorCandidates(signal) {
  try {
    const response = await axiosInstance.get(`/vendor/candidates`, {
      signal,
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in UpdateJob:", error);
    throw error;
  }
}

export async function CreateVendorCandidate(payload) {
  try {
    const response = await axiosInstance.post(
      `/vendor/candidate/create`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error in UpdateJob:", error);
    throw error;
  }
}

export async function UpdateVendorCandidate(payload) {
  try {
    const response = await axiosInstance.post(
      `/vendor/candidate/update`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error in UpdateJob:", error);
    throw error;
  }
}

export async function DeleteVendorCandidate(payload) {
  try {
    const response = await axiosInstance.post(
      `/vendor/candidate/delete`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error in UpdateJob:", error);
    throw error;
  }
}

// Send verification OTP to candidate email
export async function SendVerificationOtp(payload) {
  try {
    const response = await axiosInstance.post(
      "/verification/send-otp",
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

// Verify candidate OTP
export async function VerifyCandidateOtp(payload) {
  try {
    const response = await axiosInstance.post(
      "/verification/verify-otp",
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
}

export async function UserJobsids() {
  try {
    const response = await axiosInstance.get(`/job/applied/ids`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.log("error duing appling job", error);
  }
}

export async function UpdateVendorCandidateStatus(payload) {
  try {
    // const data=JSON.stringify(payload)
    const response = await axiosInstance.post(
      `/vendor/candidate/update-status`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log("error duing appling job", error);
  }
}

export async function GetAllVendorCandidates(
  page = 1,
  limit = 10,
  filters = {},
  signal,
) {
  try {
    const response = await axiosInstance.post(
      `/vendor/candidates/all`,
      {
        page,
        limit,
        filters,
      },
      { signal },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor candidates:", error);
    throw error;
  }
}

export async function AiCandidateFilter(payload) {
  try {
    const response = await axiosInstance.post(`/ai-candidate-filter`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.log("error duing appling job", error);
  }
}

export async function ApplyBenchCandidate(payload) {
  try {
    const response = await axiosInstance.post(
      `/vendor/apply-candidate`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error in ApplyBenchJob:", error);
    throw error;
  }
}

/* ===========================
   ACTIVITY – CREATE
=========================== */

// ✅ Create NOTE or SCHEDULE
export async function CreateActivity(payload) {
  try {
    const response = await axiosInstance.post("/api/activity", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in CreateActivity:", error);
    throw error;
  }
}

/* ===========================
   ACTIVITY – READ
=========================== */

// ✅ My Activity (Recruiter Dashboard)
export async function GetMyActivity(signal) {
  try {
    const response = await axiosInstance.get(
      "/api/activity/my-activity",
      { signal },
      { headers: { "Content-Type": "application/json" } },
    );
    return response.data;
  } catch (error) {
    console.error("Error in GetMyActivity:", error);
    throw error;
  }
}

// ✅ Candidate Activity Timeline
export async function GetCandidateActivities(payload) {
  try {
    const response = await axiosInstance.post(
      `/api/activity/candidate`,
      payload,
      { headers: { "Content-Type": "application/json" } },
    );
    return response.data;
  } catch (error) {
    console.error("Error in GetCandidateActivities:", error);
    throw error;
  }
}

/* ===========================
   ACTIVITY – UPDATE
=========================== */

// ✅ Update NOTE or SCHEDULE
export async function UpdateActivity(activityId, payload) {
  try {
    const response = await axiosInstance.put(
      `/api/activity/${activityId}`,
      payload,
      { headers: { "Content-Type": "application/json" } },
    );
    return response.data;
  } catch (error) {
    console.error("Error in UpdateActivity:", error);
    throw error;
  }
}

/* ===========================
   ACTIVITY – DELETE
=========================== */

// ✅ Delete Activity (Hard delete)
export async function DeleteActivity(activityId) {
  try {
    const response = await axiosInstance.delete(`/api/activity/${activityId}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in DeleteActivity:", error);
    throw error;
  }
}

export async function GetUserProfileDetails() {
  try {
    // ✅ backend extracts userId from JWT
    const response = await axiosInstance.get("/profile/details");
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

export async function UpdateUserProfileDetails(payload) {
  try {
    const response = await axiosInstance.post("/profile/update", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function GetCountries() {
  try {
    const response = await axiosInstance.get("/countries");
    return response.data;
  } catch (error) {
    console.error("Error fetching countries:", error);
    throw error;
  }
}

export async function SaveCandidate(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/vendor/candidate/save", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.log("error duing appling job", error);
  }
}

export async function UnsaveCandidate(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post(
      "/vendor/candidate/unsave",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log("error duing appling job", error);
  }
}

export async function SavedCandidatesList() {
  try {
    const response = await axiosInstance.get(`/vendor/candidate/saved`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.log("error duing appling job", error);
  }
}

// ✅ Mark candidate as Reviewed (Eye icon click)
export async function MarkCandidateReviewed(payload) {
  try {
    const response = await axiosInstance.post(
      `/vendor/candidate/mark-reviewed`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error in MarkCandidateReviewed:", error);
    throw error;
  }
}

// ✅ Create Recruiter Todo
export async function CreateRecruiterTodo(payload) {
  try {
    const response = await axiosInstance.post("/api/todos", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in CreateRecruiterTodo:", error);
    throw error;
  }
}

// ✅ Get My Todos (Recruiter Dashboard / My Activity)
export async function GetMyTodos(signal) {
  try {
    const response = await axiosInstance.get("/api/todos", { signal });
    return response.data;
  } catch (error) {
    console.error("Error in GetMyTodos:", error);
    throw error;
  }
}

// ✅ Update Todo (edit / mark completed)
export async function UpdateRecruiterTodo(todoId, payload) {
  try {
    const response = await axiosInstance.put(`/api/todos/${todoId}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in UpdateRecruiterTodo:", error);
    throw error;
  }
}

// ✅ Delete Recruiter Todo
export async function DeleteRecruiterTodo(todoId) {
  try {
    const response = await axiosInstance.delete(`/api/todos/${todoId}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in DeleteRecruiterTodo:", error);
    throw error;
  }
}

// ✅ Save / Update Candidate Rating
export async function SaveCandidateRating(payload) {
  try {
    const response = await axiosInstance.post("/candidate/rating", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in SaveCandidateRating:", error);
    throw error;
  }
}
