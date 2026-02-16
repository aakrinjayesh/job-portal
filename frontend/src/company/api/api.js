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
  }
}

export async function GetCandidateList(payload, signal) {
  try {
    const response = await axiosInstance.post(`/job/applicants`, payload, {
      signal,
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in UpdateJob:", error);
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
  }
}

/* ===========================
   ACTIVITY – CREATE
=========================== */

// ✅ Create NOTE or SCHEDULE
export async function CreateActivity(payload) {
  try {
    const response = await axiosInstance.post("/api/activity/create", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in CreateActivity:", error);
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
  }
}

export async function GetUserProfileDetails() {
  try {
    // ✅ backend extracts userId from JWT
    const response = await axiosInstance.get("/profile/details");
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
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
  }
}

export async function GetCountries() {
  try {
    const response = await axiosInstance.get("/countries");
    return response.data;
  } catch (error) {
    console.error("Error fetching countries:", error);
  }
}

export async function SaveJob(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/jobs/save", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.log("error duing appling job", error);
  }
}

export async function UnSaveJob(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/jobs/unsave", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.log("error duing appling job", error);
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
  }
}

export async function getCandidateTasks({ candidateId, jobId }) {
  try {
    const response = await axiosInstance.post(
      "/api/todos/candidate",
      { candidateId, jobId }, // ✅ SEND DIRECTLY IN BODY
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.error("Error in getCandidateTasks:", error);
  }
}

export async function checkUpdate({ taskId, completed }) {
  try {
    const response = await axiosInstance.patch(
      "/api/todos/candidate/check",
      { taskId, completed },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.error("Error in checkUpdate:", error);
  }
}

/* ===========================
   TODO TEMPLATE (SETTINGS ONLY)
=========================== */

// ✅ Get all todo templates
export async function GetAllTodoTemplates() {
  try {
    const response = await axiosInstance.get("/api/todos/all", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error in GetAllTodoTemplates:", error);
  }
}

// ✅ Create todo template
export async function CreateTodoTemplate({ title }) {
  try {
    const response = await axiosInstance.post(
      "/api/todos/create",
      { title },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.error("Error in CreateTodoTemplate:", error);
  }
}

// ✅ Edit todo template
export async function EditTodoTemplate({ id, title }) {
  try {
    const response = await axiosInstance.post(
      "/api/todos/edit",
      { id, title },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.error("Error in EditTodoTemplate:", error);
  }
}

// ✅ Delete todo template
export async function DeleteTodoTemplate({ id }) {
  try {
    const response = await axiosInstance.post(
      "/api/todos/delete",
      { id },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.error("Error in DeleteTodoTemplate:", error);
  }
}

// ✅ Activate / Deactivate todo template
export async function ToggleTodoTemplate({ id, isActive }) {
  try {
    const response = await axiosInstance.patch(
      "/api/todos/active",
      { id, isActive },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.error("Error in ToggleTodoTemplate:", error);
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
  }
}

// ================= ORGANIZATION =================

export async function getOrganizationMembers() {
  try {
    const response = await axiosInstance.get("/organization/members");
    return response.data;
  } catch (error) {
    console.error("Error in getOrganizationMembers:", error);
  }
}

export async function inviteOrganizationMember(payload) {
  try {
    const response = await axiosInstance.post("/organization/invite", payload);
    return response.data;
  } catch (error) {
    console.error("Error in inviteOrganizationMember:", error);
  }
}

export async function removeOrganizationMember(payload) {
  try {
    const response = await axiosInstance.post(
      "/organization/member/remove",
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error in removeOrganizationMember:", error);
  }
}

export async function revokeOrganizationInvite(payload) {
  try {
    const response = await axiosInstance.post(
      "/organization/invite/revoke",
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error in revokeOrganizationInvite:", error);
  }
}

export async function createInvoice(payload) {
  try {
    const res = await axiosInstance.post("/billing/invoice", payload);
    return res.data;
  } catch (error) {
    console.error("error in create Invoice", error);
  }
}

export async function createRazorpayOrder(invoiceId) {
  try {
    const res = await axiosInstance.post("/billing/razorpay/order", {
      invoiceId,
    });
    return res.data;
  } catch (error) {
    console.error("error in razorpay order", error);
  }
}

export async function verifyRazorpayPayment(payload) {
  try {
    const res = await axiosInstance.post("/billing/razorpay/verify", payload);
    return res.data;
  } catch (error) {
    console.error("error in verify razorpay payment", error);
  }
}

export async function getSubscriptionPlans() {
  const response = await axiosInstance.get("/billing/plans");
  return response.data;
}

export async function getFeatureUsage() {
  const res = await axiosInstance.get("/usage");
  return res.data;
}

export async function getAIUsage() {
  const res = await axiosInstance.get("/ai-usage");
  return res.data;
}

export async function getLicenseInfo() {
  const res = await axiosInstance.get("/licenses");
  return res.data;
}

export async function CloseJob(jobId) {
  console.log("API HIT → CloseJob:", jobId);
  try {
    const response = await axiosInstance.patch(`/jobs/close/${jobId}`);
    return response.data;
  } catch (error) {
    console.error("Error in CloseJob:", error.response?.data || error);
  }
}

export async function getCandidateDetails(params) {
  try {
    const response = await axiosInstance.get(`/vendor/candidates/${params}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error in get candidate details:",
      error.response?.data || error,
    );
  }
}

export async function MarkCandidateBookmark(payload) {
  try {
    const response = await axiosInstance.post(
      `/vendor/candidate/mark-bookmark`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error in MarkCandidateBookmark:", error);
  }
}
