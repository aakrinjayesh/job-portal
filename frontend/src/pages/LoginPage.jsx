import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Divider, message, Tabs } from "antd";
import GoogleAuthButton from "../components/Login/GoogleAuthButton";
import { login as LoginApi } from "../candidate/api/api";
import { useAuth } from "../chat/context/AuthContext";

import personImg from "../assets/login_design.png";
import salaryImg from "../assets/salary.png";
import jobroleImg from "../assets/jobrole.png";
import groupImg from "../assets/Group.png";
import andrewImg from "../assets/andrew.png";
import presoImg from "../assets/preso.png";
import ridoriaImg from "../assets/ridoria.png";
import alterboneImg from "../assets/alterbone.png";
import logosumImg from "../assets/logosum.png";

import cloudImage from "../assets/Fill-1.png";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";

const { Title, Text } = Typography;

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState("company");
  const [messageApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  const role = location?.state?.role;

  useEffect(() => {
    if (role) setActiveTab(role);
  }, [role]);

  /* ================= EMAIL HELPERS ================= */
  const personalDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "rediffmail.com",
  ];

  const isCompanyEmail = (email) =>
    email && !personalDomains.includes(email.split("@")[1]?.toLowerCase());

  const isPersonalEmail = (email) =>
    email && personalDomains.includes(email.split("@")[1]?.toLowerCase());

  const onFinish = async (values, role) => {
    try {
      setSubmitting(true);
      const res = await LoginApi({
        email: values.email,
        password: values.password,
        role,
      });

      if (res.status === "success") {
        localStorage.setItem("token", res?.token);
        localStorage.setItem("role", res?.user?.role);
        localStorage.setItem("user", JSON.stringify(res?.user));
        localStorage.setItem("astoken", res?.chatmeatadata?.accessToken);
        localStorage.setItem(
          "asuser",
          JSON.stringify(res?.chatmeatadata?.user),
        );

        login(res?.chatmeatadata?.user, res?.chatmeatadata?.accessToken);
        messageApi.success("Logged in successfully!");

        navigate(
          res?.user?.role === "candidate"
            ? // ? "/candidate/dashboard"
              "/candidate/profile"
            : "/company/dashboard",
        );
      } else {
        messageApi.error(res.message || "Login Failed!");
      }
    } catch (err) {
      messageApi.error("Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const LoginForm = useMemo(
    () =>
      ({ role }) => (
        <Form layout="vertical" onFinish={(v) => onFinish(v, role)}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Enter email" },
              {
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Spaces and invalid formats are not allowed.",
              },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (role === "candidate" && !isPersonalEmail(value))
                    return Promise.reject(
                      "Use personal email (gmail, outlook, etc.)",
                    );
                  if (role === "company" && !isCompanyEmail(value))
                    return Promise.reject("Use company email");
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input size="large" placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Enter password" },
              {
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,16}$/,
  message:
    "Password must be 8–16 characters long and include uppercase, lowercase, number, and special character"
}

            ]}
          >
            <Input.Password size="large" placeholder="Password" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={submitting}
          >
            Login
          </Button>
        </Form>
      ),
    [submitting],
  );

  return (
    <>
      {contextHolder}
      <AppHeader />

      {/* ================= BODY ================= */}
      <div style={styles.container}>
        {/* LEFT */}
        <div style={styles.left}>
          <div style={styles.loginCard}>
            <Tabs
              centered
              activeKey={activeTab}
              onChange={setActiveTab}
              className="auth-tabs"
              items={[
                {
                  key: "candidate",
                  label: "Candidate",
                  children: <LoginForm role="candidate" />,
                },
                {
                  key: "company",
                  label: "Company",
                  children: <LoginForm role="company" />,
                },
              ]}
            />

   {/* LINKS ROW */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  }}
>
  <Button
    type="link"
    style={{ padding: 0 }}
    onClick={() =>
      navigate("/forgotpassword", { state: { role: activeTab } })
    }
  >
    Forgot password?
  </Button>

  <Text>
    Don’t have a registered email?{" "}
    <Button
      type="link"
      style={{ padding: 0 }}
      onClick={() =>
        navigate("/signup", { state: { role: activeTab } })
      }
    >
      Create account
    </Button>
  </Text>
</div>

{/* GOOGLE AUTH – ONLY FOR CANDIDATE */}
{activeTab === "candidate" && (
  <>
    <Divider style={{ margin: "16px 0" }}>OR</Divider>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <GoogleAuthButton userType="candidate" />
    </div>
  </>
)}

          </div>
        </div>
        {/* RIGHT */}
        {/* RIGHT HERO */}
        <div style={styles.right}>
          <img src={cloudImage} alt="cloud" style={styles.cloud} />
          <img src={personImg} alt="person" style={styles.person} />
          {/* HERO TEXT */}
          <div style={styles.heroText}>
            <Title
              level={2}
              style={{
                color: "#fff",
                fontSize: "20px",
                fontWeight: 700,
                //lineHeight: 1.25,
                marginBottom: 12,
              }}
            >
              Dream jobs <span style={{ opacity: 0.7 }}>don’t wait —</span>
              <br />
              neither should you.
            </Title>

            <Text style={{ color: "#e6e6ff", fontSize: "14px" }}>
              QuickHire SF. Our new Lightning Platform gives you the fastest,
              most complete way to find and apply for new job opportunities.
            </Text>
          </div>

          {/* FLOATING CARDS */}
          <div style={styles.salaryBadge}>
            <img
              src={salaryImg}
              alt="Salary"
              style={{ width: 18, height: 18 }}
            />
            ₹8 – ₹14 LPA
          </div>

          <div style={styles.searchCard}>
            🔍 <span>Find the role that fits your goals.</span>
          </div>

          <div style={styles.jobCard}>
            <img
              src={jobroleImg}
              alt="Jobrole"
              style={{ width: 18, height: 18 }}
            />
            <strong>Salesforce Developer</strong>
            <div style={{ fontSize: 13, opacity: 0.8 }}>New Delhi</div>
            <div style={{ fontWeight: 600 }}>₹12,00,000 PA</div>
          </div>

          <div style={styles.jobType}>
            <img src={groupImg} alt="Group" style={{ width: 18, height: 18 }} />
            <span style={{ marginLeft: 8 }}>Fulltime Job</span>
          </div>

          <div style={styles.nameTag}>
            <img
              src={andrewImg}
              alt="Andrew"
              style={{ width: 18, height: 18 }}
            />
            Andrew
          </div>
        </div>
      </div>

      {/* <AppFooter /> */}
    </>
  );
};

const styles = {
  header: {
    height: 70,
    padding: "0 60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
    borderBottom: "1px solid #eee",
  },
  logo: { fontWeight: 600, fontSize: 18 },
  menu: { display: "flex", gap: 24, color: "#555" },

  container: {
    display: "flex",
    minHeight: "100vh",
    //alignItems: "stretch",
  },

  left: { width: "50%", padding: 60, background: "#fff" },
  right: {
    width: "50%",
    background: "#4F63F6",
    padding: "80px 80px",
    position: "relative",
    overflow: "hidden",
  },

  cloud: {
    position: "absolute",
    left: 100,
    bottom: 40,
    width: 420,
    height: "auto",
    zIndex: 1,
    opacity: 0.9,
  },

  heroText: {
    color: "#A9B2FF",
    fontFamily: "SF Pro",
    fontSize: 40,
    fontStyle: "normal",
    fontWeight: 400,
    //lineHeight: "48px",
    letterSpacing: "-0.48px",
  },

  badges: { marginTop: 30, display: "flex", gap: 12, flexWrap: "wrap" },
  badge: {
    background: "#fff",
    padding: "8px 16px",
    borderRadius: 20,
    fontWeight: 500,
  },

  salaryBadge: {
    position: "absolute",
    top: "263px",
    left: "62px",
    background: "#fff",
    padding: "8px 16px",
    borderRadius: 20,
    fontWeight: 600,
    zIndex: 3,
  },

  searchCard: {
    position: "absolute",
    bottom: "200px",
    right: 450,
    background: "#fff",
    padding: "10px 14px",
    borderRadius: 14,
    fontSize: 14,
    zIndex: 3,
  },

  jobCard: {
    position: "absolute",
    top: 280,
    right: "24px",
    background: "#fff",
    padding: "14px 16px",
    borderRadius: 16,
    width: 220,
    zIndex: 3,
  },

  jobType: {
    position: "absolute",
    top: "376px",
    right: "170px",
    background: "#fff",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    zIndex: 3,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  nameTag: {
    position: "absolute",
    bottom: 90,
    right: 260,
    background: "#fff",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    zIndex: 3,
  },

  person: {
    position: "absolute",
    right: 60,
    bottom: 0,
    height: 380,
    zIndex: 2,
  },

  loginCard: {
    maxWidth: 420,
    margin: "0 auto",
    padding: "32px",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    background: "#fff",
  },

  footer: {
    height: 60,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#fff",
    borderTop: "1px solid #eee",
  },

  footerWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    //marginTop: 40,   // ❗ REMOVE negative margin
    paddingBottom: 40,
  },

  footerCard: {
    background: "#fff",
    padding: "24px 40px",
    borderRadius: 16,
    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
    textAlign: "center",
    maxWidth: 900,
    width: "90%",
  },

  footerText: {
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 20,
  },

  footerLogos: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
  },

  // logoBox: {
  //   background: "#fff",
  //   border: "1px solid #eee",
  //   borderRadius: 12,
  //   padding: "8px 16px",
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "center",
  // },

  logoBoxImg: {
    height: 24,
  },
};

export default LoginPage;
