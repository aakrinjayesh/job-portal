// api.js
import axiosInstance from "./axiosInstance";


export async function LoginRoute(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/login", data, {
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

export async function SignupRoute(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/register", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in SignupRoute:", error);
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


