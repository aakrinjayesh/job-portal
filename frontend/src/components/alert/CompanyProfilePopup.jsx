import { Modal, Form, Input, Button, message } from "antd";
import { UpdateUserProfileDetails } from "../../company/api/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CompanyProfilePopup = ({ open, message: popupMessage, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (open) {
      form.resetFields(); // clears companyName and phoneNumber
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);

      const payload = {
        companyName: values.companyName,
        phoneNumber: values.phoneNumber,
      };

      const res = await UpdateUserProfileDetails(payload);

      if (res?.status === "success") {
        message.success("Profile updated successfully");

        // update localStorage user
        const user = JSON.parse(localStorage.getItem("user")) || {};
        user.companyName = values.companyName;
        user.phoneNumber = values.phoneNumber;
        localStorage.setItem("user", JSON.stringify(user));

        onClose();
        navigate("/company/profile");
      } else {
        message.error("Update failed");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Complete Your Company Profile"
      open={open}
      footer={null}
      onCancel={onClose}
      closable={true}
    >
      <p style={{ marginBottom: 20 }}>{popupMessage}</p>

      <Form layout="vertical" form={form}>
        <Form.Item
          label="Company Name"
          name="companyName"
          rules={[{ required: true, message: "Please enter company name" }]}
        >
          <Input placeholder="Enter company name" />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phoneNumber"
          rules={[{ required: true, message: "Please enter phone number" }]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>

        <Button type="primary" block loading={loading} onClick={handleSubmit}>
          Save
        </Button>
      </Form>
    </Modal>
  );
};

export default CompanyProfilePopup;
