import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  message,
  Divider,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  GenerateOtp,
  ValidateOtp,
  CheckUserExist,
} from "../candidate/api/api";
import jobroleImg from "../assets/jobrole.png";
import groupImg from "../assets/Group.png";
import andrewImg from "../assets/andrew.png";
import salaryImg from "../assets/salary.png";
import personImg from "../assets/login_design.png";
import AppFooter from "../components/layout/AppFooter";
import AppHeader from "../components/layout/AppHeader";

const { Title, Text } = Typography;

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location?.state?.role || "candidate";

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [generateLoading, setGenerateLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isFormReady, setIsFormReady] = useState(false);

  /* ================= TIMER ================= */
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

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

  /* ================= OTP VERIFY ================= */
  const onFinish = async (values) => {
    setSubmitLoading(true);
    try {
      const response = await ValidateOtp({
        email: values.email,
        otp: values.otp,
      });

      if (response.status === "success") {
        messageApi.success("OTP verified successfully!");
        navigate("/createpassword", {
          state: { email: values.email, role },
        });
      } else {
        messageApi.error(response.message || "Invalid OTP");
      }
    } catch (err) {
      messageApi.error(
        "Something went wrong: " + err?.response?.data?.message
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ================= SEND / RESEND OTP ================= */
  const handleGenerateOtp = async () => {
    const email = form.getFieldValue("email");
    const fname = form.getFieldValue("fname");
    const lname = form.getFieldValue("lname");

    if (!fname || !lname || !email) {
      messageApi.warning("Please fill all required fields");
      return;
    }

    try {
      setGenerateLoading(true);

      const check = await CheckUserExist({ email });
      if (check.status === "success") {
        messageApi.warning("User already registered. Please login.");
        return;
      }

      const res = await GenerateOtp({
        email,
        role,
        name: `${fname} ${lname}`,
      });

      if (res.status === "success") {
        messageApi.success("OTP sent to your email");
        setTimer(60);
      } else {
        messageApi.error(res.message || "Failed to send OTP");
      }
    } catch (e) {
      messageApi.error(
        "Failed to send OTP: " + (e.response?.data?.message || e.message)
      );
    } finally {
      setGenerateLoading(false);
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
          <div style={styles.loginCard}>
            <Title level={3} style={{ marginBottom: 8 }}>
              {role === "company" ? "Company Signup" : "Candidate Signup"}
            </Title>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onValuesChange={() => {
                const f = form.getFieldValue("fname");
                const l = form.getFieldValue("lname");
                const e = form.getFieldValue("email");
                setIsFormReady(!!(f && l && e));
              }}
            >
              <Form.Item
                name="fname"
                rules={[
                  { required: true, message: "Enter first name" },
                  { pattern: /^[A-Za-z\s]+$/, message: "Only letters allowed" },
                ]}
              >
                <Input size="large" placeholder="First Name" />
              </Form.Item>

              <Form.Item
                name="lname"
                rules={[
                  { required: true, message: "Enter last name" },
                  { pattern: /^[A-Za-z\s]+$/, message: "Only letters allowed" },
                ]}
              >
                <Input size="large" placeholder="Last Name" />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Enter email" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (role === "candidate" && !isPersonalEmail(value))
                        return Promise.reject(
                          "Use personal email (gmail, outlook, etc.)"
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

              <Button
                type="primary"
                block
                size="large"
                loading={generateLoading}
                onClick={handleGenerateOtp}
                disabled={!isFormReady || timer > 0}
              >
                {timer > 0 ? `Resend OTP in ${timer}s` : "Send / Resend OTP"}
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
  <Input.OTP
    length={4}
    size="large"
    style={{ gap: 12 }}
  />
</Form.Item>


              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={submitLoading}
              >
                Verify & Continue
              </Button>
            </Form>

            <Divider />

            <Text>
              Already have an account?{" "}
              <Button type="link" onClick={() => navigate("/login")}>
                Login
              </Button>
            </Text>
          </div>
        </div>

        {/* RIGHT HERO (Same as Login) */}
        <div style={styles.right}>
          <div style={styles.heroText}>
            <Title level={2} style={{ color: "#fff", fontSize: 24 }}>
              Dream jobs <span style={{ opacity: 0.7 }}>don’t wait —</span>
              <br />
              neither should you.
            </Title>
            <Text style={{ color: "#e6e6ff" }}>
              QuickHire SF. Our Lightning Platform gives you the fastest way to
              find and apply for jobs.
            </Text>
          </div>

          <div style={styles.salaryBadge}>
              <img src={salaryImg} alt="Salary" style={{ width: 18, height: 18 }} />₹8 – ₹14 LPA</div>
         
           <div style={styles.searchCard}>
             🔍 <span>Find the role that fits your goals.</span>
           </div>
         
           <div style={styles.jobCard}>
              <img src={jobroleImg} alt="Jobrole" style={{ width: 18, height: 18 }} />
             <strong>Salesforce Developer</strong>
             <div style={{ fontSize: 13, opacity: 0.8 }}>New Delhi</div>
             <div style={{ fontWeight: 600 }}>₹12,00,000 PA</div>
           </div>
         
           <div style={styles.jobType}>
           <img src={groupImg} alt="Group" style={{ width: 18, height: 18 }} />
           <span style={{ marginLeft: 8 }}>Fulltime Job</span>
         </div>
         
         
           <div style={styles.nameTag}>
              <img src={andrewImg} alt="Andrew" style={{ width: 18, height: 18 }} />Andrew</div>
           

          <img src={personImg} alt="person" style={styles.person} />
        </div>
      </div>

     
<AppFooter />
    </>
  );
};

/* ================= STYLES ================= */
const styles = {
  header: {
    height: 70,
    padding: "0 60px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    background: "#fff",
  },
  logo: { fontWeight: 600, fontSize: 18 },
  menu: { display: "flex", gap: 24 },

  container: { display: "flex", minHeight: "calc(100vh - 130px)" },
  left: { width: "50%", padding: 60 },
  right: {
    width: "50%",
    background: "#4F63F6",
    padding: "80px",
    position: "relative",
    overflow: "hidden",
  },

  loginCard: {
    maxWidth: 420,
    margin: "0 auto",
    padding: 32,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    background: "#fff",
  },

  heroText: { maxWidth: 420, zIndex: 5, position: "relative" },

  salaryBadge: {
    position: "absolute",
    top: 260,
    left: 60,
    background: "#fff",
    padding: "8px 16px",
    borderRadius: 20,
  },
  
searchCard: {
  position: "absolute",
  bottom: "231px",
  right: 375,
  background: "#fff",
  padding: "10px 14px",
  borderRadius: 14,
  fontSize: 14,
  zIndex: 3,
},
  jobCard: {
    position: "absolute",
    top: 280,
    right: 40,
    background: "#fff",
    padding: 16,
    borderRadius: 16,
    width: 220,
  },
  jobType: {
    position: "absolute",
    top: 380,
    right: 180,
    background: "#fff",
    padding: "6px 14px",
    borderRadius: 20,
  },
  nameTag: {
    position: "absolute",
    bottom: 90,
    right: 260,
    background: "#fff",
    padding: "6px 14px",
    borderRadius: 20,
  },
 person: {
  //position: "absolute",
  right: 80,
  top: 5,
  height: 350,
  zIndex: 2,
},

  footer: {
    height: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderTop: "1px solid #eee",
  },
};

export default Signup;
