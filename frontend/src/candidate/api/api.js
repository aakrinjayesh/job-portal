// api.js
import axiosInstance from "./axiosInstance";


//  login routes

export async function GoogleAuth(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/auth/google", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in googleAuthd:", error);
    throw error;
  }
}

export async function GenerateOtp(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/otp", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in GenerateOtp:", error);
    throw error;
  }
}

export async function ValidateOtp(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/otp/validate", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in ValidateOtp:", error);
    throw error;
  }
}


export async function login(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/login", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in Login:", error);
    throw error;
  }
}
export const SetPassword = async (payload) => {
  try {
    const response = await axiosInstance.post(`/setpassword`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in SetPassword:", error);
    return { status: "failed", message: "Something went wrong" };
  }
};


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

export async function profiledata(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/profile", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in profiledata:", error);
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

export async function GetUserProfile() {
  try {
    const response = await axiosInstance.post("/profile/details", {}, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in ValidateOtp:", error);
    throw error;
  }
}

export async function GetSkills() {
  try {
    
    const response = await axiosInstance.get("/skills", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in ValidateOtp:", error);
    throw error;
  }
}

export async function GetCertifications() {
  try {
    const response = await axiosInstance.get("/certifications",  {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in ValidateOtp:", error);
    throw error;
  }
}


export async function GetLocations() {
  try {
    const response = await axiosInstance.get("/locations", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in ValidateOtp:", error);
    throw error;
  }
}

export async function PostSkills(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/skills", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in ValidateOtp:", error);
    throw error;
  }
}

export async function PostCertifications(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/certifications", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in ValidateOtp:", error);
    throw error;
  }
}


export async function PostLocations(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/locations", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in ValidateOtp:", error);
    throw error;
  }
}


export async function GetClouds() {
  try {
    const response = await axiosInstance.get("/clouds", {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching clouds:", error);
    throw error;
  }
}

export async function PostClouds(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/clouds", data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding cloud:", error);
    throw error;
  }
}


export async function GetRole() {
  try {
    const response = await axiosInstance.get("/role", {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching clouds:", error);
    throw error;
  }
}

export async function PostRole(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/role", data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding cloud:", error);
    throw error;
  }
}


export async function ApplyJob(payload) {
  try {
      let data = JSON.stringify(payload)
      const response = await axiosInstance.post('/jobs/apply', data , {
        headers:{
          "Content-Type": "application/json"
        }
      })
      return response.data
  } catch (error) {
    console.log("error duing appling job", error);
  } 
}



export async function AppliedJobsList(page = 1, limit = 10) {
  try {
    const response = await axiosInstance.get(`/jobs/applications?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
}

export async function SaveJob(payload) {
  try {
      let data = JSON.stringify(payload)
      const response = await axiosInstance.post('/jobs/save', data , {
        headers:{
          "Content-Type": "application/json"
        }
      })
      return response.data
  } catch (error) {
    console.log("error duing appling job", error);
  } 
}

export async function UnSaveJob(payload) {
  try {
      let data = JSON.stringify(payload)
      const response = await axiosInstance.post('/jobs/unsave', data , {
        headers:{
          "Content-Type": "application/json"
        }
      })
      return response.data
  } catch (error) {
    console.log("error duing appling job", error);
  } 
}


export async function  SavedJobsList(page = 1, limit = 10) {
  try {
      const response = await axiosInstance.get(`/jobs/saved?page=${page}&limit=${limit}`, {
        headers:{
          "Content-Type": "application/json"
        }
      })
      return response.data
  } catch (error) {
    console.log("error duing appling job", error);
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


// Forgot Password
export async function ForgotPassword(email) {
  try {
    const response = await axiosInstance.post("/forgotpassword", { email });
    return response.data;
  } catch (error) {
    console.error("Error in ForgotPassword:", error);
    throw error;
  }
}
 
// Reset Password
export async function ResetPasswords(payload) {
  try {
    const response = await axiosInstance.post("/resetpassword", payload);
    return response.data;
  } catch (error) {
    console.error("Error in ResetPassword:", error);
    throw error;
  }
}

export async function uploadProfilePicture(formData) {
  try {
    const response = await axiosInstance.post(
      "/profile/upload-picture",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data;  // RETURN ONLY DATA
  } catch (error) {
    console.error("Upload picture API error:", error);
    throw error;
  }
}


export async function CVEligibility(payload) {
  try {
    const data = JSON.stringify(payload)
    const response = await axiosInstance.post("/check-eligibility", data);
    return response.data;
  } catch (error) {
    console.error("Error in ResetPassword:", error);
    throw error;
  }
}







