import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { GenerateOtp, ValidateOtp } from "../candidate/api/api";

import personImg from "../assets/login_design.png";
import cloudImage from "../assets/Fill-1.png";
import salaryImg from "../assets/salary.png";
import jobroleImg from "../assets/jobrole.png";
import groupImg from "../assets/Group.png";
import andrewImg from "../assets/andrew.png";
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

      <div style={styles.container}>
        {/* LEFT - Forgot Password Card */}
        <div style={styles.left}>
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
              rules={[{ required: true, message: "Enter OTP" }]}
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "center",
              }}
            >
                <Input.OTP length={4} size="large" />
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
        </div>

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

export default ForgotPasswordPage;
