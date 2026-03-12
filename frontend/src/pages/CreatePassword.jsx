import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message, Row, Col } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { SetPassword, ResetPasswords } from "../candidate/api/api";
import cloudImage from "../assets/Fill-1.png";
import logo from "../assets/forceheadlogo.png";
import personImg from "../assets/companyperson.webp";
import jobroleImg from "../assets/jobrole.png";
import andrewImg from "../assets/person_candidate_design.webp";
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
  const stateType = location?.state?.type;
  const redirectPath = location?.state?.redirect;

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
      let res;

      if (stateType === "forgotpage") {
        // 🔹 Forget password flow
        res = await ResetPasswords({
          email,
          password: values.password,
        });
      } else {
        // 🔹 Existing set password flow
        res = await SetPassword({
          email,
          password: values.password,
          role,
          ...(token && { token }),
        });
      }

      if (res.status === "success") {
        messageApi.success("Password set successfully!");
        navigate("/login", { state: { role, redirect: redirectPath } });
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
      {/* <AppHeader /> */}

      {/* ================= BODY ================= */}
      <Row style={{ height: "100vh", overflow: "hidden" }}>
        {/* LEFT – CREATE PASSWORD */}
        <Col
          xs={24}
          md={12}
          style={{
            display: "flex",
            flexDirection: "column", // 🔹 Important
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "#fff",
          }}
        >
          <div style={styles.logoWrapper}>
            <img
              src={logo}
              alt="ForceHead"
              style={styles.logo}
              onClick={() => navigate("/")}
            />
          </div>
          <div style={styles.loginCard}>
            <Title level={3}>Create Password</Title>
            <Text type="secondary">Secure your account to continue</Text>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              style={{ marginTop: 16 }}
            >
              <Form.Item
                name="password"
                style={{ marginBottom: 12 }}
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
                style={{ marginBottom: 16 }}
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Confirm password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match"),
                      );
                    },
                  }),
                ]}
              >
                <Input.Password size="large" placeholder="Confirm Password" />
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

              <Text style={{ display: "block", marginTop: 12 }}>
                Already have an account?{" "}
                <Button
                  type="link"
                  onClick={() =>
                    navigate("/login", { state: { redirect: redirectPath } })
                  }
                >
                  Login
                </Button>
              </Text>
            </Form>
          </div>
        </Col>

        {/* RIGHT HERO (SAME AS FORGOT PAGE) */}
        <Col
          xs={0}
          md={12}
          style={{
            height: "100%",
            background: role === "candidate" ? "#094db9" : "#4F63F6",
            position: "relative",
            overflow: "hidden",
            padding: 48,
          }}
        >
          {role === "candidate" ? <CandidateHero /> : <CompanyHero />}
        </Col>
      </Row>

      {/* <AppFooter /> */}
    </>
  );
};

const CompanyHero = () => (
  <>
    <img
      src={cloudImage}
      alt="cloud"
      style={styles.cloud}
      loading="lazy"
      decoding="async"
    />
    <img
      src={personImg}
      alt="person"
      style={styles.person}
      loading="lazy"
      decoding="async"
    />

    <div style={styles.heroText}>
      <Title
        level={2}
        style={{
          color: "#fff",
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        The World’s First Salesforce-to-Salesforce Vendor Collaboration Platform
      </Title>

      <Text
        style={{
          color: "#D7DBFF",
          fontSize: 15,
          lineHeight: 1.6,
          display: "block",
          // maxWidth: 360,
        }}
      >
        An intelligent vendor platform to manage jobs, candidates, and bench
        resources for Salesforce roles and projects.
      </Text>
    </div>

    <div style={styles.vendorBadge}>
      🧠 <strong>AI-Powered Job Management</strong>
    </div>

    <div style={styles.searchCard}>
      💬 <strong>Searchcard Find the role that fits your goals.</strong>
    </div>

    <div style={styles.vendorCard}>
      <strong>
        🌍 World’s First B2B Vendor Platform built exclusively for Salesforce
        Ecosystem.
      </strong>
    </div>

    <div style={styles.vendorType}>
      🤝 <strong>Bench Utilization & Job Sharing</strong>
    </div>
  </>
);

const CandidateHero = () => (
  <>
    <img src={cloudImage} alt="cloud" style={styles.cloud} />
    <img
      src={andrewImg}
      alt="candidate"
      style={styles.candidateperson}
      loading="lazy"
      decoding="async"
    />

    <div style={styles.heroText}>
      <Title
        level={2}
        style={{
          color: "#fff",
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        Find the right Salesforce job - built for your career.
      </Title>

      <Text
        style={{
          color: "#D7DBFF",
          fontSize: 15,
          lineHeight: 1.6,
          display: "block",
          maxWidth: 360,
        }}
      >
        A smarter way to find Salesforce opportunities, apply confidently, and
        chat with recruiters in real time.
      </Text>
    </div>

    <div style={styles.candidateBadge}>
      🎯 <strong>₹6 – ₹50LPA</strong>
    </div>

    <div style={styles.searchCandidateCard}>
      📩 <strong>Direct Recruiter Messages</strong>
    </div>

    <div style={styles.jobCard}>
      <strong>🚀 Career Growth & Bench Visibility</strong>
    </div>

    <div style={styles.jobType}>
      💼 <strong>Verified Salesforce Roles</strong>
    </div>
  </>
);

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
    padding: "80px",
    // color: "white",
    position: "relative",
    overflow: "hidden",
  },

  cloud: {
    position: "absolute",
    top: 326,
    left: "50%",
    transform: "translateX(-50%)",
    width: 420,
    opacity: 0.55,
    zIndex: 1,
  },

  heroText: {
    position: "relative",
    zIndex: 5,
    marginTop: -40,
  },

  vendorBadge: {
    position: "absolute",
    top: 380,
    right: "60%",
    background: "#fff",
    padding: "8px 16px",
    borderRadius: 20,
    fontFamily: "SF Pro",
    fontWeight: "590",
    fontSize: 14,
    zIndex: 4,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
  },

  candidateBadge: {
    position: "absolute",
    top: 350,
    left: "20%",
    background: "#fff",
    padding: "8px 16px",
    borderRadius: 20,
    fontFamily: "SF Pro",
    fontWeight: "590",
    fontSize: 14,
    zIndex: 4,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
  },
  searchCard: {
    position: "absolute",
    top: 480,
    left: "5%",
    background: "#fff",
    fontFamily: "SF Pro",
    fontWeight: "590",
    padding: "10px 14px",
    borderRadius: 14,
    fontSize: 14,
    zIndex: 4,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
  },

  searchCandidateCard: {
    position: "absolute",
    top: 450,
    left: "10%",
    background: "#fff",
    fontFamily: "SF Pro",
    fontWeight: "590",
    padding: "10px 14px",
    borderRadius: 14,
    fontSize: 14,
    zIndex: 4,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
  },

  vendorCard: {
    position: "absolute",
    top: 380,
    left: "60%",
    fontSize: 14,
    fontFamily: "SF Pro",
    fontWeight: "590",
    background: "#fff",
    padding: "14px 16px",
    borderRadius: 16,
    width: 220,
    zIndex: 4,
    boxShadow: "0 8px 20px rgba(0,0,0,0.14)",
  },

  vendorType: {
    position: "absolute",
    top: 480,
    left: "68%",
    background: "#fff",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 14,
    fontFamily: "SF Pro",
    fontWeight: "590",
    zIndex: 4,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
  },

  jobCard: {
    position: "absolute",
    top: 350,
    left: "60%",
    fontSize: 14,
    fontFamily: "SF Pro",
    fontWeight: "590",
    background: "#fff",
    padding: "14px 14px",
    borderRadius: 16,
    width: 180,
    zIndex: 4,
    boxShadow: "0 8px 20px rgba(0,0,0,0.14)",
  },

  jobType: {
    position: "absolute",
    top: 450,
    left: "60%",
    width: 175,
    background: "#fff",
    padding: "6px 16px",
    borderRadius: 20,
    fontSize: 14,
    fontFamily: "SF Pro",
    fontWeight: "590",
    zIndex: 4,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
  },

  person: {
    position: "absolute",
    marginTop: 110,
    left: "48%",
    transform: "translateX(-50%)",
    height: 580,
    zIndex: 2,
  },

  candidateperson: {
    position: "absolute",
    marginTop: 110,
    left: "68%",
    transform: "translateX(-50%)",
    height: 520,
    zIndex: 2,
  },

  loginCard: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "32px",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    background: "#fff",
  },

  logoWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
  },

  logo: {
    width: 188, // 🔹 increase width here
    height: "135px",
    cursor: "pointer",
  },
};
export default CreatePassword;
