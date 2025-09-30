// import React, { useState } from "react";
// import { Form, Button, message, Typography, Divider, Input, Space } from "antd";
// import { Card } from "antd";
// import { useNavigate } from "react-router-dom";
// import { GenerateOtp, ValidateOtp } from "../api/api";
// import { GithubOutlined } from "@ant-design/icons";
// import GoogleAuthButton from "../components/GoogleAuthButton";
// import LinkedInAuthButton from "../components/LinkedInAuthButton";

// const Candidate = () => {
//   const navigate = useNavigate();
//   const [messageApi, contextHolder] = message.useMessage();
//   const [form] = Form.useForm(); // ✅ create form instance
//   const [generatingOtp, setGeneratingOtp] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   const freeEmailProviders = [
//     "gmail.com",
//     "outlook.com",
//     "yahoo.com",
//     "hotmail.com",
//     "protonmail.com",
//   ];

//   const handleLink = () => {
//     navigate("/signup");
//   };

//   function isCandidateEmail(email) {
//     if (!email.includes("@")) return false;
//     const domain = email.split("@")[1].toLowerCase();
//     return freeEmailProviders.includes(domain);
//   }

//   const onFinish = async (values) => {
//     try {
//       setSubmitting(true);
//       if (!isCandidateEmail(values.email)) {
//         messageApi.error("Please enter a valid personal email");
//         return;
//       }

//       const response = await ValidateOtp({
//         email: values.email,
//         otp: values.otp,
//       });
//       if (response.status === "success") {
//         localStorage.setItem("token", response.token);
//         messageApi.success("Logged in successfully!");
//         navigate("/home");
//       } else {
//         messageApi.error(response.message || "Invalid OTP");
//       }
//     } catch (err) {
//       console.log("validate otp error", err);
//       messageApi.error("Something went wrong");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <>
//       <Typography.Title
//         level={4}
//         style={{ textAlign: "center", marginBottom: "8px" }}
//       >
//         Login/Register to your account
//       </Typography.Title>

//       <Typography.Text
//         type="secondary"
//         style={{
//           display: "block",
//           textAlign: "center",
//           marginBottom: "20px",
//           fontSize: "14px",
//         }}
//       >
//         Connect with:
//       </Typography.Text>

//       <div
//         style={{
//           display: "flex",
//           gap: "12px",
//           marginBottom: "24px",
//           justifyContent: "center",
//         }}
//       >
//         <GoogleAuthButton />
//         <LinkedInAuthButton />
//         <Button
//           icon={<GithubOutlined />}
//           size="large"
//           style={{ flex: 1 }}
//           onClick={() => messageApi.info("Trailhead login coming soon!")}
//         >
//           Trailhead
//         </Button>
//       </div>

//       <Divider>or</Divider>

//       <Form
//         form={form} // ✅ attach form instance
//         name="basic"
//         labelCol={{ span: 8 }}
//         wrapperCol={{ span: 16 }}
//         style={{ maxWidth: 600 }}
//         initialValues={{ remember: true }}
//         onFinish={onFinish}
//         autoComplete="off"
//       >
//         <Form.Item label="Email" required>
//           <Space.Compact style={{ width: "100%" }}>
//             <Form.Item
//               name="email"
//               noStyle
//               rules={[{ required: true, message: "Please input your Email!" }]}
//             >
//               <Input placeholder="Email" />
//             </Form.Item>
//             <Button
//               onClick={async () => {
//                 try {
//                   setGeneratingOtp(true);
//                   const email = form.getFieldValue("email"); // ✅ correct usage
//                   if (!email) {
//                     messageApi.warning("Please enter email first");
//                     return;
//                   }
//                   if (!isCandidateEmail(values.email)) {
//                     messageApi.error("Please enter a valid personal email");
//                     return;
//                   }
//                   const res = await GenerateOtp({ email });
//                   if (res.status === "success") {
//                     messageApi.success("otp sent to your email");
//                   } else {
//                     messageApi.error(res.message || "Failed to send OTP");
//                   }
//                 } catch (e) {
//                   messageApi.error("Failed to send OTP");
//                 } finally {
//                   setGeneratingOtp(false);
//                 }
//               }}
//               type="default"
//               loading={generatingOtp}
//               disabled={generatingOtp}
//             >
//               Generate OTP
//             </Button>
//           </Space.Compact>
//         </Form.Item>

//         <Form.Item
//           label="Enter OTP"
//           name="otp"
//           rules={[{ required: true, message: "Please input your otp!" }]}
//         >
//           <Input.OTP length={4} />
//         </Form.Item>

//         <Form.Item label={null}>
//           <Button
//             type="primary"
//             htmlType="submit"
//             style={{ marginRight: "5px" }}
//             loading={submitting}
//             disabled={submitting}
//           >
//             Submit
//           </Button>
//           {/* or
//             <Button type="link" onClick={handleLink} style={{ padding: 5 }}>
//               Register
//             </Button> */}
//         </Form.Item>
//       </Form>
//     </>
//   );
// };

// export default Candidate;

import React from "react";
import LoginForm from "./LoginForm";

const Candidate = () => {
  return <LoginForm userType="candidate" />;
};

export default Candidate;
