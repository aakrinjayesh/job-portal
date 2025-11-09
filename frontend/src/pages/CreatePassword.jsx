import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { SetPassword } from "../candidate/api/api";
//import backgroundImage from "../../assets/salesforce_bg.jpg"; // ✅ same image as login/signup
import { useState } from "react";

// import { SetPassword } from "../api/api"; // uncomment when API ready

const CreatePassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // ✅ Get email & role passed from signup page
  const email = location?.state?.email;
  const role = location?.state?.role;

  if (!email) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h3>Invalid Access</h3>
        <p>Please verify your email first.</p>
      </div>
    );
  }

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      messageApi.error("Passwords do not match!");
      return;
    }
    setPasswordLoading(true);

    try {
      // Uncomment when SetPassword API is implemented
      const res = await SetPassword({ email, password: values.password, role });

      // Simulate success for testing
      // const res = { status: "success" };

      if (res.status === "success") {
        setPasswordLoading(false);
        messageApi.success("Password set successfully!");
        navigate("/login", { state: { role } });
      } else {
        setPasswordLoading(false);
        messageApi.error(res.message || "Failed to set password");
      }
    } catch (err) {
      console.log("Set password error:", err);
      setPasswordLoading(false);
      messageApi.error("Something went wrong");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div
      style={{
        // backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* ✅ Semi-transparent overlay for readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(5px)",
        }}
      ></div>

      {contextHolder}

      {/* ✅ Password Card */}
      <Card
        title="Create Password"
        hoverable
        style={{
          zIndex: 2,
          width: 450,
          padding: "40px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[
              { required: true, message: "Please confirm your password!" },
            ]}
          >
            <Input.Password placeholder="Confirm your password" />
          </Form.Item>

          <Button
            type="primary"
            loading={passwordLoading}
            htmlType="submit"
            block
          >
            Set Password
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default CreatePassword;
