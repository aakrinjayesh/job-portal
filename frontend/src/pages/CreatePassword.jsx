import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message, Row, Col } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { SetPassword, ResetPasswords } from "../candidate/api/api";
import cloudImage from "../assets/Fill-1.png";
import personImg from "../assets/companyperson.png";
import jobroleImg from "../assets/jobrole.png";
import andrewImg from "../assets/person_candidate_design.png";
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
      <AppHeader />

      {/* ================= BODY ================= */}
      <Row style={{ minHeight: "100vh" }}>
        {/* LEFT – CREATE PASSWORD */}
        <Col
          xs={24}
          md={12}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "#fff",
          }}
        >
          <div style={styles.loginCard}>
            <Title level={3}>Create Password</Title>
            <Text type="secondary">Secure your account to continue</Text>

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

              <Text style={{ display: "block", marginTop: 16 }}>
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
    <img src={cloudImage} alt="cloud" style={styles.cloud} />
    <img src={personImg} alt="person" style={styles.person} />

    <div style={styles.heroText}>
      <Title
        level={2}
        style={{
          color: "#fff",
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        Connect with the right partners —
        <br />
        faster and smarter.
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
    <img src={andrewImg} alt="candidate" style={styles.candidateperson} />

    <div style={styles.heroText}>
      <Title
        level={2}
        style={{
          color: "#fff",
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        Find the right Salesforce job —
        <br />
        built for your career.
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
    padding: "80px",
    // color: "white",
    position: "relative",
    overflow: "hidden",
  },

  cloud: {
    position: "absolute",
    bottom: 40,
    left: "50%",
    transform: "translateX(-50%)",
    width: 420,
    opacity: 0.55,
    zIndex: 1,
  },

  heroText: {
    position: "relative",
    zIndex: 5,
    // maxWidth: 420,
    marginTop: -40, // ⬆ moves text upward
  },

  badges: { marginTop: 30, display: "flex", gap: 12, flexWrap: "wrap" },
  badge: {
    background: "#fff",
    padding: "8px 16px",
    borderRadius: 20,
    fontWeight: 500,
  },

  vendorBadge: {
    position: "absolute",
    top: 350,
    left: "5%",
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
  right: "40%",
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
    top: 450,
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
    right: "40%",
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
    top: 350,
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
    top: 450,
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
    padding: "14px 16px",
    borderRadius: 16,
    width: 220,
    zIndex: 4,
    boxShadow: "0 8px 20px rgba(0,0,0,0.14)",
  },

  jobType: {
    position: "absolute",
    top: 450,
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
    marginTop: 110,
    left: "48%",
    transform: "translateX(-50%)",
    height: 420,
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
    width: 400,
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
