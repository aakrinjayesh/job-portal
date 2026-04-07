import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";

const CompanyProfilePopup = ({ open, message: popupMessage, onClose }) => {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    onClose();
    navigate("/company/profile", { state: { fromPopup: true, popupMessage } });
  };

  return (
    <Modal
      title="Complete Your Profile"
      open={open}
      maskClosable={false}
      footer={null}
      onCancel={onClose}
      closable={true}
    >
      {popupMessage && <p style={{ marginBottom: 16 }}>{popupMessage}</p>}
      <Button type="primary" block onClick={handleGoToProfile}>
        Go to Profile
      </Button>
    </Modal>
  );
};

export default CompanyProfilePopup;
