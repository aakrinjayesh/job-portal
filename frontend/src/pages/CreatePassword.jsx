import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { SetPassword } from "../candidate/api/api";

import bg1 from "../assets/salesforce1_bg.jpg";
import bg5 from "../assets/bg5.webp";
import bg3 from "../assets/bg3.jpg";
import bg4 from "../assets/bg4.jpg";

const { Title, Text } = Typography;

const CreatePassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [bgIndex, setBgIndex] = useState(0);

  // ✅ Background images (same as signup)
  const backgrounds = [bg1, bg5, bg3, bg4];

  // 🔹 Set background only once when page loads or refreshes
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    setBgIndex(randomIndex);
  }, []);

  // ✅ Get email & role from signup navigation
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

  // ✅ Handle form submit
  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      messageApi.error("Passwords do not match!");
      return;
    }
    setPasswordLoading(true);

    try {
      const res = await SetPassword({ email, password: values.password, role });

      if (res.status === "success") {
        messageApi.success("Password set successfully!");
        navigate("/login", { state: { role } });
      } else {
        messageApi.error(res.message || "Failed to set password");
      }
    } catch (err) {
      messageApi.error("Something went wrong:"+ err.response.data.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {contextHolder}

      {/* 🔁 Background slideshow */}
      {backgrounds.map((img, index) => (
        <div
          key={index}
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.5)",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: bgIndex === index ? 1 : 0,
            transition: "opacity 2s ease-in-out",
          }}
        ></div>
      ))}

      {/* 🔒 Password form box */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "400px",
          textAlign: "center",
          padding: "25px",
          borderRadius: "10px",
        }}
      >
        <Title level={1} style={{ marginBottom: "20px", color: "white" }}>
          QuickhireSF
        </Title>

        <Title
          level={4}
          style={{
            color: "white",
            marginBottom: "30px",
            fontWeight: "400",
          }}
        >
          Create Your Password
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ width: "100%" }}
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please enter your password" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
                message:
                  "Password must be 8–16 chars with uppercase, lowercase, number & special symbol."
              },
            ]}
            style={{ color: "white" }}
          >
            <Input.Password placeholder="Enter new password" size="large" />
          </Form.Item>


          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm password" size="large" />
          </Form.Item>


          <Button
            type="primary"
            htmlType="submit"
            loading={passwordLoading}
            block
            size="large"
          >
            Set Password
          </Button>
        </Form>

        <Text style={{ display: "block", color: "white", marginTop: "20px" }}>
          Already have an account?{" "}
          <Button type="link" onClick={() => navigate("/login")}>
            Login
          </Button>
        </Text>
      </div>
    </div>
  );
};

export default CreatePassword;
