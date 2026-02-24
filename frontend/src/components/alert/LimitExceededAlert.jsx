import React from "react";
import { Modal, Button } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

/* 🔥 Human Friendly Feature Names */
const FEATURE_LABELS = {
  AI_TOKENS_TOTAL: "AI Tokens",
  JOB_POST_CREATION: "Job Posts",
  CANDIDATE_PROFILE_VIEWS: "Candidate Views",
  APPLY_BENCH_TO_JOB: "Bench Apply",
  RESUME_EXTRACTION: "Resume Extraction",
  AI_FIT_SCORE: "AI Fit Score",
  FIND_CANDIDATE_SEARCH: "Candidate AI Search",
  FIND_JOB_SEARCH: "Job AI Search",
  JD_EXTRACTION: "JD Generation",
};

const LimitExceededAlert = ({ open, onClose, feature, message }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const featureLabel = FEATURE_LABELS[feature] || feature || "This feature";

  const handleUpgrade = () => {
    onClose();

    navigate("/company/pricing", {
      state: { redirect: location.pathname },
    });
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered>
      <div style={{ textAlign: "center", padding: "16px 8px" }}>
        <h2 style={{ color: "#ff4d4f", marginBottom: 12 }}>Limit Reached 🚫</h2>

        <p style={{ marginBottom: 8, fontSize: 15 }}>
          Your <b>{featureLabel}</b> limit has been reached.
        </p>

        <p style={{ color: "#666", fontSize: 13 }}>
          Upgrade your plan to continue using this feature.
        </p>

        <div style={{ marginTop: 24 }}>
          <Button type="primary" size="large" onClick={handleUpgrade}>
            Upgrade Plan
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LimitExceededAlert;
