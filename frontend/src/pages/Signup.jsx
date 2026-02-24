import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  message,
  Divider,
  Row,
  Col,
  Checkbox,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { GenerateOtp, ValidateOtp, CheckUserExist } from "../candidate/api/api";
import jobroleImg from "../assets/jobrole.png";
import groupImg from "../assets/Group.png";
import andrewImg from "../assets/person_candidate_design.png";
import salaryImg from "../assets/salary.png";
import cloudImage from "../assets/Fill-1.png";
import personImg from "../assets/companyperson.png";
import AppFooter from "../components/layout/AppFooter";
import AppHeader from "../components/layout/AppHeader";

const { Title, Text } = Typography;

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location?.state?.role || "candidate";
  const redirectPath = location.state.redirect;

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [generateLoading, setGenerateLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isFormReady, setIsFormReady] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

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
          state: { email: values.email, role, redirect: redirectPath },
        });
      } else {
        messageApi.error(response.message || "Invalid OTP");
      }
    } catch (err) {
      messageApi.error("Something went wrong: " + err?.response?.data?.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ================= SEND / RESEND OTP ================= */
  // const handleGenerateOtp = async () => {
  //   const email = form.getFieldValue("email");
  //   const fname = form.getFieldValue("fname");
  //   const lname = form.getFieldValue("lname");

  //   if (!fname || !lname || !email) {
  //     messageApi.warning("Please fill all required fields");
  //     return;
  //   }

  //   try {
  //     setGenerateLoading(true);

  //     const check = await CheckUserExist({ email });
  //     if (check.status === "success") {
  //       messageApi.warning("User already registered. Please login.");
  //       return;
  //     }

  //     const res = await GenerateOtp({
  //       email,
  //       role,
  //       name: `${fname} ${lname}`,
  //     });

  //     if (res.status === "success") {
  //       messageApi.success("OTP sent to your email");
  //        setOtpSent(true);
  //       setTimer(60);
  //     } else {
  //       messageApi.error(res.message || "Failed to send OTP");
  //     }
  //   } catch (e) {
  //     messageApi.error(
  //       "Failed to send OTP: " + (e.response?.data?.message || e.message)
  //     );
  //   } finally {
  //     setGenerateLoading(false);
  //   }
  // };

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

      // const check = await CheckUserExist({ email, role });

      // if (check.status === "success") {
      //   // Show message with existing email
      //   if (check.existingEmail) {
      //     messageApi.warning(
      //       `${check.message} Existing email: ${check.existingEmail}`,
      //       5,
      //     );
      //   } else {
      //     messageApi.warning(check.message);
      //   }
      //   return;
      // }

      const res = await GenerateOtp({
        email,
        role,
        name: `${fname} ${lname}`,
      });

      if (res.status === "success") {
        messageApi.success("OTP sent to your email");
        setOtpSent(true);
        setTimer(60);
      } else {
        messageApi.error(res.message || "Failed to send OTP");
      }
    } catch (e) {
      messageApi.error(
        "Failed to send OTP: " + (e.response?.data?.message || e.message),
      );
    } finally {
      setGenerateLoading(false);
    }
  };

  const triggerNameValidation = () => {
    form.validateFields(["fname"]);
  };

  return (
    <>
      {contextHolder}

      <AppHeader />

      {/* ================= BODY ================= */}
      <Row style={{ minHeight: "100vh" }}>
        {/* LEFT SIDE – SIGNUP FORM */}
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
            <Title level={3} style={{ marginBottom: 8 }}>
              {role === "company" ? "Company Signup" : "Candidate Signup"}
            </Title>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onValuesChange={(changedValues) => {
                const f = form.getFieldValue("fname");
                const l = form.getFieldValue("lname");
                const e = form.getFieldValue("email");
                setIsFormReady(!!(f && l && e));
              }}
            >
              <Form.Item
                name="fname"
                dependencies={["lname", "email"]}
                validateTrigger={["onBlur", "onChange"]}
                rules={[
                  {
                    validator: (_, value) => {
                      const lname = form.getFieldValue("lname");
                      const email = form.getFieldValue("email");

                      if ((lname || email) && !value) {
                        return Promise.reject("Please enter first name");
                      }
                      return Promise.resolve();
                    },
                  },
                  {
                    pattern: /^[A-Za-z\s]+$/,
                    message: "Only letters allowed",
                  },
                ]}
              >
                <Input size="large" placeholder="First Name" />
              </Form.Item>

              <Form.Item
                name="lname"
                dependencies={["fname", "email"]}
                validateTrigger={["onBlur", "onChange"]}
                rules={[
                  {
                    validator: (_, value) => {
                      const fname = form.getFieldValue("fname");
                      const email = form.getFieldValue("email");

                      if ((fname || email) && !value) {
                        return Promise.reject("Please enter last name");
                      }
                      return Promise.resolve();
                    },
                  },
                  {
                    pattern: /^[A-Za-z\s]+$/,
                    message: "Only letters allowed",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Last Name"
                  onChange={triggerNameValidation}
                />
              </Form.Item>

              <Form.Item
                name="email"
                dependencies={["fname", "lname"]}
                validateTrigger={["onBlur", "onChange"]}
                rules={[
                  { required: true, message: "Enter email" },
                  {
                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email format",
                  },
                  {
                    validator: (_, value) => {
                      const fname = form.getFieldValue("fname");
                      const lname = form.getFieldValue("lname");

                      if (value && !fname) {
                        return Promise.reject("Please enter first name");
                      }
                      if (value && !lname) {
                        return Promise.reject("Please enter last name");
                      }

                      if (
                        role === "candidate" &&
                        value &&
                        !isPersonalEmail(value)
                      ) {
                        return Promise.reject(
                          "Use personal email (gmail, outlook, etc.)",
                        );
                      }
                      if (
                        role === "company" &&
                        value &&
                        !isCompanyEmail(value)
                      ) {
                        return Promise.reject("Use company email");
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input size="large" placeholder="Email" />
              </Form.Item>
              <Form.Item
                name="agree"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error(
                              "You must agree to the Privacy Policy and Terms & Conditions",
                            ),
                          ),
                  },
                ]}
                style={{ marginTop: 10 }}
              >
                <Checkbox>
                  I agree to the{" "}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href="/terms-and-conditions"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms & Conditions
                  </a>
                </Checkbox>
              </Form.Item>

              {/* SEND OTP (only first time) */}
              {!otpSent && (
                <Button
                  type="primary"
                  block
                  size="large"
                  loading={generateLoading}
                  onClick={handleGenerateOtp}
                  disabled={!isFormReady}
                >
                  Send OTP
                </Button>
              )}

              {/* TIMER TEXT */}
              {otpSent && timer > 0 && (
                <Text
                  style={{
                    display: "block",
                    marginTop: 12,
                    textAlign: "center",
                    color: "#666",
                  }}
                >
                  Resend OTP in {timer}s
                </Text>
              )}

              {/* RESEND OTP (after 60 sec only) */}
              {otpSent && timer === 0 && (
                <Button
                  type="default"
                  block
                  size="large"
                  loading={generateLoading}
                  onClick={handleGenerateOtp}
                  style={{ marginTop: 12 }}
                >
                  Resend OTP
                </Button>
              )}

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
              <Button
                type="link"
                onClick={() =>
                  navigate("/login", { state: { redirect: redirectPath } })
                }
              >
                Login
              </Button>
            </Text>
          </div>
        </Col>
        {/* </div> */}

        {/* RIGHT HERO */}
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
      {/* </div> */}

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

/* ================= STYLES ================= */

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

export default Signup;
