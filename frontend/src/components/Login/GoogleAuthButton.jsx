import React, { useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { GoogleAuth } from "../../candidate/api/api";

const GoogleAuthButton = ({ userType, messageAPI }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSuccess = async (credentialResponse) => {
    try {
      setIsProcessing(true);

      let payload = credentialResponse;
      payload.type = userType;
      console.log(payload);
      const resp = await GoogleAuth(payload);
      console.log("GoogleAuth response:", resp);
      if (resp.status === "failed") {
        messageAPI(error, resp.message);
        // message.error(resp.message);
        return;
      }
      // Store token if backend sends one
      if (resp?.status === "success") {
        localStorage.setItem("token", resp?.token);
        localStorage.setItem("role", resp?.user?.role || "no role");
        localStorage.setItem("user", JSON.stringify(resp?.user));
        navigate("/candidate/dashboard");
      }
    } catch (error) {
      console.error("Google login error:", error);
      // setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {isProcessing ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "6px",
            background: "#f1f5f9",
            color: "#0f172a",
            fontWeight: 500,
            fontSize: "14px",
          }}
        >
          <span className="spinner" aria-hidden>
            ⏳
          </span>
          Finishing sign-in…
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      )}
    </GoogleOAuthProvider>
  );
};

export default GoogleAuthButton;
