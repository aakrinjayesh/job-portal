import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Typography,
  Divider,
  message,
  Tabs,
  Row,
  Col,
  Grid,
} from "antd";
import GoogleAuthButton from "../components/Login/GoogleAuthButton";
import { login as LoginApi } from "../candidate/api/api";
import { useAuth } from "../chat/context/AuthContext";

import personImg from "../assets/companyperson.png";
import salaryImg from "../assets/salary.png";
import jobroleImg from "../assets/jobrole.png";
import groupImg from "../assets/Group.png";
import andrewImg from "../assets/person_candidate_design.png";
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
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [form] = Form.useForm();

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
            : "/company/jobs",
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
        <Form form={form} layout="vertical" onFinish={(v) => onFinish(v, role)}>
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
            rules={[
              { required: true, message: "Enter password" },
              {
                pattern:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,16}$/,
                message:
                  "Password must be 8–16 characters long and include uppercase, lowercase, number, and special character",
              },
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
      <Row style={{ minHeight: "100vh" }}>
        {/* LEFT */}
        {/* LEFT – LOGIN */}
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
                flexDirection: isMobile ? "column" : "row",
                justifyContent: isMobile ? "center" : "space-between",
                alignItems: "center",
                marginTop: 12,
                gap: isMobile ? 6 : 0,
                textAlign: isMobile ? "center" : "left",
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
        </Col>
        {/* </div> */}
        {/* RIGHT */}
        {/* RIGHT HERO */}
        <Col
          xs={0} // ❗ hide on mobile
          md={12}
          style={{
            background: activeTab === "candidate" ? "#094db9" : "#4F63F6",
            position: "relative",
            overflow: "hidden",
            padding: 48,
          }}
        >
          {activeTab === "candidate" ? <CandidateHero /> : <CompanyHero />}
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
        Connect with the right salesforce partners —
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

    <div style={styles.vendorBadge}>
      🎯 <strong>₹6 – ₹50LPA</strong>
    </div>

    <div style={styles.searchCard}>
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
    height: 520,
    zIndex: 2,
  },

  candidateperson: {
    position: "absolute",
    marginTop: 110,
    left: "68%",
    transform: "translateX(-50%)",
    height: 480,
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
