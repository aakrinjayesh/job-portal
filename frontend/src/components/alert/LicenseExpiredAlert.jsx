import React from "react";
import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";

const LicenseExpiredAlert = ({ open, onClose, message }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate("/company/pricing");
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered>
      <div style={{ textAlign: "center", padding: "16px 8px" }}>
        <h2 style={{ color: "#ff4d4f", marginBottom: 12 }}>
          License Expired ⚠️
        </h2>

        <p style={{ marginBottom: 8, fontSize: 15 }}>
          Your organization license has expired.
        </p>

        <p style={{ color: "#666", fontSize: 13 }}>
          Renew your subscription to continue using the platform.
        </p>

        <div style={{ marginTop: 24 }}>
          <Button type="primary" size="large" onClick={handleUpgrade}>
            Renew License
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LicenseExpiredAlert;
