import { Navigate } from "react-router-dom";

const LandingRedirect = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ❌ Not logged in
  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Logged in → role-based redirect
  if (role === "company") {
    return <Navigate to="/company/jobs" replace />;
  }

  if (role === "candidate") {
    return <Navigate to="/candidate/profile" replace />;
  }

  // fallback safety
  return <Navigate to="/login" replace />;
};

export default LandingRedirect;
