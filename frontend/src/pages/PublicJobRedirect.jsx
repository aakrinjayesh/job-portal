import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const PublicJobRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // If user is logged in → redirect to role-based route
    if (token && role) {
      if (role === "candidate") {
        navigate(`/candidate/job/${id}`, { replace: true });
      } else if (role === "company") {
        navigate(`/company/job/${id}`, { replace: true });
      }
    }
    // If not logged in → do nothing (stay on public page)
  }, [id, navigate]);

  return null; // no UI
};

export default PublicJobRedirect;
