import React, { useState, useEffect } from "react";
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
import { login as LoginApi, GetUserProfile } from "../candidate/api/api";
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

/* ================= EMAIL HELPERS (module scope) ================= */
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

/* ================= LOGIN FORM (module scope) ================= */
const LoginForm = ({ role, onFinish, submitting, form }) => {
  return (
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
  );
};

/* ================= MAIN LOGIN PAGE ================= */
const LoginPage = () => {
  const [activeTab, setActiveTab] = useState("company");
  const [messageApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  const role = location?.state?.role;
  const redirectPath = location?.state?.redirect;
  console.log("redirect", redirectPath);
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [candidateForm] = Form.useForm();
  const [companyForm] = Form.useForm();

  useEffect(() => {
    if (role) setActiveTab(role);
  }, [role]);

  const onFinish = async (values, role) => {
    try {
      setSubmitting(true);
      const res = await LoginApi({
        email: values.email,
        password: values.password,
        role,
      });

      if (res.status === "success") {
        // localStorage.setItem("token", res?.token);
        // localStorage.setItem("role", res?.user?.role);
        // localStorage.setItem("user", JSON.stringify(res?.user));
        localStorage.setItem("token", res?.token);
        localStorage.setItem("role", res?.user?.role);

        if (res?.user?.role === "candidate") {
          // 🔥 Fetch full candidate profile (contains profilePicture)
          const profileRes = await GetUserProfile();

          if (profileRes?.status === "success") {
            localStorage.setItem("user", JSON.stringify(profileRes.user));
          } else {
            localStorage.setItem("user", JSON.stringify(res?.user));
          }
        } else {
          // company login (no change)
          localStorage.setItem("user", JSON.stringify(res?.user));
        }
        window.dispatchEvent(new Event("storage"));
        localStorage.setItem("astoken", res?.chatmeatadata?.accessToken);
        localStorage.setItem(
          "asuser",
          JSON.stringify(res?.chatmeatadata?.user),
        );

        login(res?.chatmeatadata?.user, res?.chatmeatadata?.accessToken);
        messageApi.success("Logged in successfully!");

        const rolePrefix =
          res?.user?.role === "candidate" ? "/candidate" : "/company";

        if (redirectPath) {
          // remove leading slash if present
          const cleanPath = redirectPath.startsWith("/")
            ? redirectPath.slice(1)
            : redirectPath;

          navigate(`${rolePrefix}/${cleanPath}`, { replace: true });
        } else {
          navigate(
            res?.user?.role === "candidate"
              ? "/candidate/profile"
              : "/company/jobs",
          );
        }
      } else {
        messageApi.error(res.message || "Login Failed!");
      }
    } catch (error) {
      // messageApi.error("Login failed");
      const { status, data } = error?.response || {};
      console.log("status", status);
      console.log("data", data);
      if (data?.message) {
        messageApi.error(data.message);
      } else {
        messageApi.error("Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <AppHeader />

      <Row style={{ minHeight: "100vh" }}>
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
  {/* WRAPPER */}
  <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>

    {/* TITLE OUTSIDE LOGIN CARD */}
    <div style={{ marginBottom: 20 }}>
      <Title
        level={3}
        style={{
          marginBottom: 0,
          fontWeight: 700,
          color: "#111",
          lineHeight: 1.3,
        }}
      >
        World’s First Salesforce-to-Salesforce Talent & Collaboration Network
      </Title>
    </div>

    {/* LOGIN CARD */}
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
                  children: (
                    <LoginForm
                      form={candidateForm}
                      role="candidate"
                      onFinish={onFinish}
                      submitting={submitting}
                    />
                  ),
                },
                {
                  key: "company",
                  label: "Company",
                  children: (
                    <LoginForm
                      role="company"
                      form={companyForm}
                      onFinish={onFinish}
                      submitting={submitting}
                    />
                  ),
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
                Don't have a registered email?{" "}
                <Button
                  type="link"
                  style={{ padding: 0 }}
                  onClick={() =>
                    navigate("/signup", {
                      state: { role: activeTab, redirect: redirectPath },
                    })
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
        </Col>

        {/* RIGHT HERO */}
        <Col
          xs={0}
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
    </>
  );
};

/* ================= HERO COMPONENTS ================= */
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
        Connect with the right partners -
        faster and smarter.
      </Title>

      <Text
        style={{
          color: "#D7DBFF",
          fontSize: 15,
          lineHeight: 1.6,
          display: "block",
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
        🌍 World's First B2B Vendor Platform built exclusively for Salesforce
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
       Find the right Salesforce job -
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

/* ================= STYLES ================= */
const styles = {
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
    top: 350,
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
    maxWidth: 420,
    margin: "0 auto",
    padding: "32px",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    background: "#fff",
  },
};

export default LoginPage;
