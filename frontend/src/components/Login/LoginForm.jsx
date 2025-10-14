import React, { useState } from "react";
import { Form, Button, message, Typography, Divider, Input, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { GenerateOtp, ValidateOtp } from "../../candidate/api/api";
import { GithubOutlined } from "@ant-design/icons";
import GoogleAuthButton from "./GoogleAuthButton";
import LinkedInAuthButton from "./LinkedinAuthButton";

const LoginForm = ({ userType }) => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [generatingOtp, setGeneratingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const freeEmailProviders = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "protonmail.com",
    "icloud.com",
    "aol.com",
    "zoho.com",
    "yandex.com",
  ];

  const isValidEmail = (email, type) => {
    if (!email.includes("@")) return false;
    const domain = email.split("@")[1].toLowerCase();
    const isFreeEmail = freeEmailProviders.includes(domain);

    return type === "candidate" ? isFreeEmail : !isFreeEmail;
  };

  const getEmailErrorMessage = (type) => {
    return type === "candidate"
      ? "Please enter a valid personal email"
      : "Please enter a valid Company email";
  };

  const handleGenerateOtp = async () => {
    try {
      setGeneratingOtp(true);
      const email = form.getFieldValue("email");
      if (!email) {
        messageApi.warning("Please enter email first");
        return;
      }
      if (!isValidEmail(email, userType)) {
        messageApi.error(getEmailErrorMessage(userType));
        return;
      }
      const res = await GenerateOtp({ email, role: userType });
      if (res.status === "success") {
        messageApi.success("OTP sent to your email");
      } else {
        messageApi.error(res.message || "Failed to send OTP");
      }
    } catch (e) {
      messageApi.error("Failed to send OTP");
    } finally {
      setGeneratingOtp(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      if (!isValidEmail(values?.email, userType)) {
        messageApi.error(getEmailErrorMessage(userType));
        return;
      }

      const response = await ValidateOtp({
        email: values?.email,
        otp: values?.otp,
      });
      console.log("response of validate otp", response);
      if (response?.status === "success") {
        localStorage.setItem("token", response?.token);
        localStorage.setItem("role", response?.role);
        messageApi.success("Logged in successfully!");
        setTimeout(() => {
          navigate(response?.role === "candidate" ? "/home" : "/dashboard");
        }, 500);
      } else {
        messageApi.error(response?.message || "Invalid OTP");
      }
    } catch (err) {
      console.log("validate otp error", err);
      messageApi.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const messageAPI = (type, msg) => {
    switch (type) {
      case "success":
        messageApi.success(msg);
        break;
      case "error":
        messageApi.error(msg);
        break;
      case "warning":
        messageApi.warning(msg);
        break;
      case "info":
        messageApi.info(msg);
        break;
      default:
        messageApi.info(msg);
    }
  };

  return (
    <>
      {contextHolder}

      <Typography.Title
        level={4}
        style={{ textAlign: "center", marginBottom: "8px" }}
      >
        Login/Register to your account
      </Typography.Title>
      {userType === "candidate" && (
        <>
          <Typography.Text
            type="secondary"
            style={{
              display: "block",
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            Connect with:
          </Typography.Text>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "24px",
              justifyContent: "center",
            }}
          >
            <GoogleAuthButton userType={userType} messageAPI={messageAPI} />
            <LinkedInAuthButton userType={userType} />
            <Button
              icon={<GithubOutlined />}
              size="large"
              style={{ flex: 1 }}
              onClick={() => messageApi.info("Trailhead login coming soon!")}
            >
              Trailhead
            </Button>
          </div>

          <Divider>or</Divider>
        </>
      )}
      <Form
        form={form}
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item label="Email" required>
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item
              name="email"
              noStyle
              rules={[{ required: true, message: "Please input your Email!" }]}
            >
              <Input placeholder="Email" />
            </Form.Item>
            <Button
              onClick={handleGenerateOtp}
              type="default"
              loading={generatingOtp}
              disabled={generatingOtp}
            >
              Generate OTP
            </Button>
          </Space.Compact>
        </Form.Item>

        <Form.Item
          label="Enter OTP"
          name="otp"
          rules={[{ required: true, message: "Please input your otp!" }]}
        >
          <Input.OTP length={4} />
        </Form.Item>

        <Form.Item label={null}>
          <Button
            type="primary"
            htmlType="submit"
            style={{ marginRight: "5px" }}
            loading={submitting}
            disabled={submitting}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default LoginForm;
