import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Space,
  Tabs,
  message,
} from "antd";
import { GoogleOutlined, AppleOutlined } from "@ant-design/icons";
import GoogleAuthButton from "../components/Login/GoogleAuthButton";
import { login } from "../candidate/api/api";

import bg1 from "../assets/salesforce1_bg.jpg";
import bg5 from "../assets/bg5.webp";
import bg3 from "../assets/bg3.jpg";
import bg4 from "../assets/bg4.jpg";

const { Title, Text } = Typography;

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState("candidate");
  const [bgIndex, setBgIndex] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = location?.state?.role;

  useEffect(() => {
    if (role) {
      setActiveTab(role);
    }
  }, [role]);

  const backgrounds = [bg1, bg5, bg3, bg4];

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  const onFinish = async (values, role) => {
    try {
      setSubmitting(true);
      const res = await login({
        email: values.email,
        password: values.password,
        role: role,
      });
      if (res.status === "success") {
        localStorage.setItem("token", res?.token);
        localStorage.setItem("role", res?.user?.role);
        localStorage.setItem("user", JSON.stringify(res?.user));
        messageApi.success("Logged in successfully!");
        navigate(
          res?.user?.role === "candidate"
            ? "/candidate/dashboard"
            : "/company/dashboard"
        );
      } else {
        messageApi.error("Login Failed!");
      }
    } catch (err) {
      console.log("validate login error", err);
      messageApi.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Memoized LoginForm to prevent re-render
  const LoginForm = useMemo(
    () =>
      ({ role }) =>
        (
          <Form
            name={`${role}-login`}
            layout="vertical"
            onFinish={(values) => onFinish(values, role)}
            style={{ width: "100%" }}
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please enter your email" }]}
            >
              <Input placeholder="Email" size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password placeholder="Password" size="large" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              block
              size="large"
            >
              Log in as {role}
            </Button>
          </Form>
        ),
    [submitting] // only create once
  );

  const tabItems = useMemo(
    () => [
      {
        key: "candidate",
        label: (
          <span style={{ color: "white", fontWeight: "500" }}>Candidate</span>
        ),
        children: <LoginForm role="candidate" />,
      },
      {
        key: "company",
        label: (
          <span style={{ color: "white", fontWeight: "500" }}>Company</span>
        ),
        children: <LoginForm role="company" />,
      },
    ],
    [LoginForm]
  );

  const handleSignup = () => {
    const role = activeTab;
    navigate("/signup", { state: { role } });
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
      {/* Background slideshow */}
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

      {/* Login box */}
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

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={tabItems}
        />

        <Button color="danger" variant="link">
          Forgot Password ?
        </Button>

        {activeTab === "candidate" && (
          <>
            <Divider plain>or</Divider>

            {/* <Space direction="vertical" style={{ width: "100%" }}> */}
            {/* <Button icon={<GoogleOutlined />} block size="large">
        Continue with Google
      </Button> */}
            <GoogleAuthButton userType={activeTab} messageAPI={messageApi} />
            {/* </Space> */}
          </>
        )}

        <Text style={{ display: "block", marginTop: "20px", color: "white" }}>
          New to QuickhireF?{" "}
          <Button type="link" onClick={handleSignup}>
            Signup
          </Button>
        </Text>
      </div>
    </div>
  );
};

export default LoginPage;
