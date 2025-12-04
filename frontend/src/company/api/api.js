import axiosInstance from "../../candidate/api/axiosInstance";
 
// ✅ FIXED VERSION
export async function GetJobsList(page = 1, limit = 10) {
  try {
    const response = await axiosInstance.get(`/jobs?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
}


export async function PostedJobsList(page = 1, limit = 10) {
  try {
    const response = await axiosInstance.get(`/jobs/posted?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
}

 
export async function GetJobDetails(payload) {
  try {
    const data = JSON.stringify(payload)
    const response = await axiosInstance.post("/job/details",data, {headers: { 'Content-Type': 'application/json' }});
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
export async function UpdateJob( payload) {
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



export async function GetCandidateDeatils(payload) {
  try {
    const response = await axiosInstance.post(`/job/applicants`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in UpdateJob:", error);
    throw error;
  }
}


// vender routes

export async function GetVendorCandidates() {
  try {
    const response = await axiosInstance.get(`/vendor/candidates`, {
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
    const response = await axiosInstance.post(`/vendor/candidate/create`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in UpdateJob:", error);
    throw error;
  }
}


export async function UpdateVendorCandidate(payload) {
  try {
    const response = await axiosInstance.post(`/vendor/candidate/update`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in UpdateJob:", error);
    throw error;
  }
}

export async function DeleteVendorCandidate(payload) {
  try {
    const response = await axiosInstance.post(`/vendor/candidate/delete`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in UpdateJob:", error);
    throw error;
  }
}


// Send verification OTP to candidate email
export async function SendVerificationOtp(payload) {
  try {
    const response = await axiosInstance.post("/verification/send-otp", payload);
    return response.data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}
 
// Verify candidate OTP
export async function VerifyCandidateOtp(payload) {
  try {
    const response = await axiosInstance.post("/verification/verify-otp", payload);
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
}



export async function  UserJobsids() {
  try {
      const response = await axiosInstance.get(`/job/applied/ids`, {
        headers:{
          "Content-Type": "application/json"
        }
      })
      return response.data
  } catch (error) {
    console.log("error duing appling job", error);
  } 
}

export async function  UpdateVendorCandidateStatus( payload) {
  try {
    // const data=JSON.stringify(payload)
      const response = await axiosInstance.post(`/vendor/candidate/update-status`, payload,{
        headers:{
          "Content-Type": "application/json"
        },
         
      })
      return response.data
  } catch (error) {
    console.log("error duing appling job", error);
  } 
}