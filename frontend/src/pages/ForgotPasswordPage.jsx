import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message,Col,Row } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { GenerateOtp, ValidateOtp } from "../candidate/api/api";

import personImg from "../assets/companyperson.png";
import cloudImage from "../assets/Fill-1.png";
import salaryImg from "../assets/salary.png";
import jobroleImg from "../assets/jobrole.png";
import groupImg from "../assets/Group.png";
import andrewImg from "../assets/person_candidate_design.png";
import presoImg from "../assets/preso.png";
import ridoriaImg from "../assets/ridoria.png";
import alterboneImg from "../assets/alterbone.png";
import logosumImg from "../assets/logosum.png";

import bg1 from "../assets/salesforce1_bg.jpg";
import bg5 from "../assets/bg5.webp";
import bg3 from "../assets/bg3.jpg";
import bg4 from "../assets/bg4.jpg";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [generateLoading, setGenerateLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [emailValue, setEmailValue] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const location = useLocation();
  const role = location?.state?.role;
const isCandidate = role === "candidate";

  
  const backgrounds = [bg1, bg5, bg3, bg4];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    setBgIndex(randomIndex);
  }, []);

  useEffect(() => {
    let countdown;
    if (timer > 0) {
      countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(countdown);
  }, [timer]);

  const onFinish = async (values) => {
    setSubmitLoading(true);
    try {
      const response = await ValidateOtp({ email: values.email, otp: values.otp });
      if (response.status === "success") {
        localStorage.setItem("token", response.token);
        messageApi.success("OTP verified successfully!");
        navigate("/createpassword", { state: { email: values.email, role,type:"forgotpage" } });
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
        setOtpSent(true); 
        setTimer(60);
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
        {/* LEFT - Forgot Password Card */}
          <div style={styles.loginCard}>
            <Title level={3}>Forgot Password</Title>
            <Text>
              {role === "company"
                ? "Company Forgot Password"
                : "Candidate Forgot Password"}
            </Text>

            <Form
              form={form}
              layout="vertical"
              name="forgot-password"
              onFinish={onFinish}
              style={{ marginTop: 20 }}
            >
           <Form.Item
  name="email"
  rules={[
    { required: true, message: "Please enter your email" },
    { type: "email", message: "Enter a valid email" },
  ]}
>
  <Input
    size="large"
    placeholder="Email"
    disabled={timer > 0}   // ✅ DISABLE DURING TIMER
    onChange={(e) => setEmailValue(e.target.value)}
  />
</Form.Item>



         <Button
  onClick={handleGenerateOtp}
  type="primary"
  block
  loading={generateLoading}
  size="large"
  disabled={
    !emailValue || (otpSent && isResendDisabled)
  }
  style={{ marginBottom: 10 }}
>
  {!otpSent
    ? "Send OTP"
    : timer > 0
      ? `Resend OTP in ${timer}s`
      : "Resend OTP"}
</Button>


           <Form.Item
  name="otp"
  rules={[
    { required: true, message: "Enter OTP" },
    {
      pattern: /^\d{4}$/,
      message: "OTP must be 4 digits (numbers only)",
    },
  ]}
  style={{
    marginTop: 16,
    display: "flex",
    justifyContent: "center",
  }}
>
  <Input.OTP
    length={4}
    size="large"
    style={{ gap: 12 }}
    formatter={(value) => value.replace(/\D/g, "")} // ✅ Only allow digits
    onChange={(value) => {
      // ✅ Additional filter to ensure only numbers
      const numericValue = value.replace(/\D/g, "");
      form.setFieldValue("otp", numericValue);
    }}
  />
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

              <Text style={{ display: "block", marginTop: 20 }}>
                Already have an account?{" "}
                <Button type="link" onClick={() => navigate("/login")}>
                  Login
                </Button>
              </Text>
            </Form>
          </div>
        {/* </div> */}
        </Col>

        {/* RIGHT HERO */}
        <Col
                  xs={0}       // ❗ hide on mobile
                  md={12}
                  style={{
                  background: isCandidate ? "#094db9" : "#4F63F6",
                    position: "relative",
                    overflow: "hidden",
                    padding: 48,
                  }}
                >
                  {role === "candidate" ? <CandidateHero /> : <CompanyHero />}
                </Col>
      {/* </div> */}
      {/* <AppFooter /> */}
    </Row>
    </>
  );
};
  


const CompanyHero = () => (
  <>
    <img src={cloudImage} alt="cloud" style={styles.cloud} />
    <img src={personImg} alt="person" style={styles.person} />

    <div style={styles.heroText}>
      <Title level={2}
        style={{
          color: "#fff",
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 12,
        }}>
        Connect with the right partners —
        <br />
        faster and smarter.
      </Title>

      <Text style={{
        color: "#D7DBFF",
        fontSize: 15,
        lineHeight: 1.6,
        display: "block",
        // maxWidth: 360,
      }}>
        An intelligent vendor platform to manage jobs, candidates,
        and bench resources for Salesforce roles and projects.
      </Text>
    </div>

    <div style={styles.vendorBadge}>
      🧠 <strong>AI-Powered Job Management</strong>
    </div>

    <div style={styles.searchCard}>
      💬 <strong>Searchcard Find the role that fits your goals.</strong>
    </div>

    <div style={styles.vendorCard}>
      <strong>🌍 World’s First B2B Vendor Platform built exclusively for Salesforce Ecosystem.</strong>
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
      <Title level={2}
        style={{
          color: "#fff",
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 12,
        }}>
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
        }}>
        A smarter way to find Salesforce opportunities, apply confidently, and chat with recruiters in real time.
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
    marginTop: -40,   // ⬆ moves text upward
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
    fontFamily: 'SF Pro',
    fontWeight: '590',
    fontSize: 14,
    zIndex: 4,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
  },

  searchCard: {
    position: "absolute",
    top: 450,
    left: "5%",
    background: "#fff",
    fontFamily: 'SF Pro',
    fontWeight: '590',
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
    fontFamily: 'SF Pro',
    fontWeight: '590',
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
    fontFamily: 'SF Pro',
    fontWeight: '590',
    zIndex: 4,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
  },

  jobCard: {
    position: "absolute",
    top: 350,
    left: "60%",
    fontSize: 14,
    fontFamily: 'SF Pro',
    fontWeight: '590',
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
    fontFamily: 'SF Pro',
    fontWeight: '590',
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
    left: "58%",
    transform: "translateX(-50%)",
    height: 420,
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

export default ForgotPasswordPage;
