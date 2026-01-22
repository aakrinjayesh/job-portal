import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { SetPassword } from "../candidate/api/api";

import personImg from "../assets/login_design.png";
import jobroleImg from "../assets/jobrole.png";
import groupImg from "../assets/Group.png";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";

const { Title, Text } = Typography;

const CreatePassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

   // 🔹 Normal flow (preferred)
  const stateEmail = location?.state?.email;
  const stateRole = location?.state?.role;

  // 🔹 Invite flow (fallback)
  const query = new URLSearchParams(location.search);
  const queryEmail = query.get("email");
  const queryRole = query.get("role");
  const token = query.get("token");

  // 🔹 Final resolved values
  const email = stateEmail || queryEmail;
  const role = stateRole || queryRole;

  if (!email || !role) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
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
      const res = await SetPassword({
        email,
        password: values.password,
        role,
        ...(token && { token }),
      });

      if (res.status === "success") {
        messageApi.success("Password set successfully!");
        navigate("/login", { state: { role } });
      } else {
        messageApi.error(res.message || "Failed to set password");
      }
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <AppHeader />

      {/* ================= BODY ================= */}
      <div style={styles.container}>
        {/* LEFT */}
        <div style={styles.left}>
          <div style={styles.card}>
            <Title level={3}>Create Password</Title>
            <Text type="secondary">
              Secure your account to continue
            </Text>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              style={{ marginTop: 24 }}
            >
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Enter password" },
                  {
                    pattern:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
                    message:
                      "8–16 chars, uppercase, lowercase, number & symbol",
                  },
                ]}
              >
                <Input.Password size="large" placeholder="New Password" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Confirm password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Confirm Password"
                />
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

            <Text style={{ display: "block", marginTop: 16 }}>
              Already have an account?{" "}
              <Button type="link" onClick={() => navigate("/login")}>
                Login
              </Button>
            </Text>
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          {/* HERO TEXT */}
          <div style={styles.heroText}>
            <Title
              level={2}
              style={{
                color: "#fff",
                fontWeight: 700,
                lineHeight: 1.25,
              }}
            >
              Dream jobs <span style={{ opacity: 0.7 }}>don’t wait —</span>
              <br />
              neither should you.
            </Title>

            <Text style={{ color: "#e6e6ff", fontSize: 14 }}>
              Create your password and unlock the fastest way to apply
              for top job opportunities.
            </Text>
          </div>

          {/* FLOATING CARDS */}
          <div style={styles.salaryBadge}>₹8 – ₹14 LPA</div>

          <div style={styles.searchCard}>
            🔍 <span>Find the role that fits your goals.</span>
          </div>

          <div style={styles.jobCard}>
            <img
              src={jobroleImg}
              alt="job"
              style={{ width: 18, height: 18 }}
            />
            <strong>Salesforce Developer</strong>
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              New Delhi
            </div>
            <div style={{ fontWeight: 600 }}>
              ₹12,00,000 PA
            </div>
          </div>

          <div style={styles.jobType}>
            <img
              src={groupImg}
              alt="group"
              style={{ width: 18, height: 18 }}
            />
            Fulltime Job
          </div>

          <div style={styles.nameTag}>Andrew</div>

          {/* PERSON */}
          <img src={personImg} alt="person" style={styles.person} />
        </div>
      </div>
      <AppFooter />
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

   card: {
    maxWidth: 420,
    margin: "0 auto",
    padding: "32px",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    background: "#fff",
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

export default CreatePassword;
