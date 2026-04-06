import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SettingsRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
      navigate("/login", { replace: true });
      return;
    }

    if (role === "candidate") {
      navigate("/candidate/settings", { replace: true });
    } else if (role === "company") {
      navigate("/company/settings", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return null;
};

export default SettingsRedirect;