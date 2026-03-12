import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";

const CompanyProfilePopup = ({ open, message: popupMessage, onClose }) => {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    onClose();
    navigate("/company/profile", { state: { fromPopup: true } });
  };

  return (
    <Modal
      title="Complete Your Company Profile"
      open={open}
      footer={null}
      onCancel={onClose}
      closable={true}
    >
      <Button type="primary" block onClick={handleGoToProfile}>
        Go to Profile
      </Button>
    </Modal>
  );
};

export default CompanyProfilePopup;
