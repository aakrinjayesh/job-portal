import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message, Divider } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { GenerateOtp, ValidateOtp } from "../candidate/api/api";

import bg1 from "../assets/salesforce1_bg.jpg";
import bg5 from "../assets/bg5.webp";
import bg3 from "../assets/bg3.jpg";
import bg4 from "../assets/bg4.jpg";

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [generateLoading, setGenerateLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [timer, setTimer] = useState(0); // 🔥 timer for resend
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const location = useLocation();
  const role = location?.state?.role;

  const backgrounds = [bg1, bg5, bg3, bg4];

  // 🔹 Set background only once when page loads or refreshes
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    setBgIndex(randomIndex);
  }, []);

  // ⏱️ OTP resend timer logic
  useEffect(() => {
    let countdown;
    if (timer > 0) {
      countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(countdown);
  }, [timer]);

  // ✅ Verify OTP
  const onFinish = async (values) => {
    setSubmitLoading(true);
    try {
      const response = await ValidateOtp({
        email: values.email,
        otp: values.otp,
      });
      if (response.status === "success") {
        localStorage.setItem("token", response.token);
        messageApi.success("OTP verified successfully!");
        navigate("/createpassword", { state: { email: values.email, role } });
      } else {
        messageApi.error(response.message || "Invalid OTP");
      }
    } catch (err) {
      console.log("validate otp error", err);
      messageApi.error("Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };

  // 🔁 Generate / Resend OTP
  const handleGenerateOtp = async () => {
    try {
      const email = form.getFieldValue("email");
      if (!email) {
        messageApi.warning("Please enter email first");
        return;
      }
      setGenerateLoading(true);
      const res = await GenerateOtp({ email, role });
      if (res.status === "success") {
        messageApi.success("OTP sent to your email");
        setTimer(60); // ⏱️ start 60s countdown
        setIsResendDisabled(true);
      } else {
        messageApi.error(res.message || "Failed to send OTP");
      }
    } catch (e) {
      messageApi.error("Failed to send OTP");
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
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

      {/* 🔒 Signup Box */}
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
          {role === "company"
            ? "Company ForgotPassword"
            : "Candidate ForgotPassword"}
        </Title>

        <Form
          form={form}
          layout="vertical"
          name="signup"
          onFinish={onFinish}
          style={{ width: "100%" }}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input placeholder="Email" size="large" />
          </Form.Item>

          <Button
            onClick={handleGenerateOtp}
            type="default"
            block
            loading={generateLoading}
            size="large"
            disabled={isResendDisabled && timer > 0}
            style={{ marginBottom: "10px" }}
          >
            {timer > 0 ? `Resend OTP in ${timer}s` : "Send / Resend OTP"}
          </Button>

          <Form.Item
            name="otp"
            rules={[{ required: true, message: "Please enter OTP" }]}
          >
            <Input.OTP length={4} size="large" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={submitLoading}
            block
            size="large"
          >
            Verify & Continue
          </Button>
        </Form>

        <Divider plain style={{ color: "white" }}>
          or
        </Divider>

        <Text style={{ display: "block", color: "white", marginTop: "10px" }}>
          Already have an account?{" "}
          <Button type="link" onClick={handleLoginRedirect}>
            Login
          </Button>
        </Text>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
