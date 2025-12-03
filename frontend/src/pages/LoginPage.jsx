import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Divider, message, Tabs } from "antd";
import GoogleAuthButton from "../components/Login/GoogleAuthButton";
import { login as LoginApi } from "../candidate/api/api";
import { useAuth } from "../chat/context/AuthContext";

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
  const { login } = useAuth();
  const location = useLocation();
  const role = location?.state?.role;

  const backgrounds = [bg1, bg5, bg3, bg4];

  // 🔹 Set background only once when page loads or refreshes
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    setBgIndex(randomIndex);
  }, []);

  // 🔹 If role is passed from navigation, pre-select that tab
  useEffect(() => {
    if (role) {
      setActiveTab(role);
    }
  }, [role]);

  const onFinish = async (values, role) => {
    try {
      setSubmitting(true);
      const res = await LoginApi({
        email: values.email,
        password: values.password,
        role: role,
      });
      if (res.status === "success") {
        localStorage.setItem("token", res?.token);
        localStorage.setItem("role", res?.user?.role);
        localStorage.setItem("user", JSON.stringify(res?.user));
        localStorage.setItem("astoken", res?.chatmeatadata?.accessToken);
        localStorage.setItem(
          "asuser",
          JSON.stringify(res?.chatmeatadata?.user)
        );

        login(res?.chatmeatadata?.user, res?.chatmeatadata?.accessToken);
        messageApi.success("Logged in successfully!");
        navigate(
          res?.user?.role === "candidate"
            ? "/candidate/dashboard"
            : "/company/dashboard"
        );
      } else {
        messageApi.error(res.message || "Login Failed!");
      }
    } catch (err) {
      console.error("validate login error", err);
      messageApi.error(err.response.data.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Memoized LoginForm
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
  rules={[
    { required: true, message: "Please enter your email" },
    {
      validator: (_, value) => {
        if (!value) return Promise.resolve();

        if (role === "candidate" && !isPersonalEmail(value)) {
          return Promise.reject(
            "Please use a personal email (gmail, yahoo, outlook, icloud)"
          );
        }

        if (role === "company" && !isCompanyEmail(value)) {
          return Promise.reject(
            "Please use a company email"
          );
        }

        return Promise.resolve();
      },
    },
  ]}
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
    [submitting]
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

  const handleForgotPassword = () => {
    const role = activeTab;
    navigate("/forgotpassword", { state: { role } });
  };

  // Check if company email
const isCompanyEmail = (email) => {
  const personalDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "rediffmail.com"
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  return domain && !personalDomains.includes(domain);
};

// Check if personal email
const isPersonalEmail = (email) => {
  const personalDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "rediffmail.com"
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  return domain && personalDomains.includes(domain);
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

      {/* Background Image (Static for each refresh) */}
      <div
        style={{
          backgroundImage: `url(${backgrounds[bgIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.5)",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transition: "opacity 1s ease-in-out",
        }}
      ></div>

      {/* Login Box */}
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

        <Button
          type="link"
          onClick={handleForgotPassword}
          style={{ color: "#fff", textDecoration: "underline" }}
        >
          Forgot Password?
        </Button>

        {activeTab === "candidate" && (
          <>
            <Divider plain>or</Divider>
            <GoogleAuthButton userType={activeTab} messageAPI={messageApi} />
          </>
        )}

        <Text style={{ display: "block", marginTop: "20px", color: "white" }}>
          New to QuickhireSF?{" "}
          <Button type="link" onClick={handleSignup}>
            Signup
          </Button>
        </Text>
      </div>
    </div>
  );
};

export default LoginPage;
