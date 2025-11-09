import React from "react";
import { Form, Button, Card, message, Space, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { GenerateOtp, ValidateOtp } from "../candidate/api/api";
import { useLocation } from "react-router-dom";
import { useState } from "react";

const Signup = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [generateLoading, setGenerateLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const location = useLocation();
  const role = location?.state?.role;
  console.log("role in signup", role);

  const onFinish = async (values) => {
    setSubmitLoading(true);
    try {
      const response = await ValidateOtp({
        email: values.email,
        otp: values.otp,
      });
      if (response.status === "success") {
        localStorage.setItem("token", response.token);
        messageApi.success("OTP verified successfully!");
        navigate("/createpassword", { state: { email: values.email, role } });
      } else {
        messageApi.error(response.message || "Invalid OTP");
      }
    } catch (err) {
      console.log("validate otp error", err);
      messageApi.error("Something went wrong");
    } finally {
      setSubmitLoading(false); // ✅ stop loading
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  // const handlePassword= () => {
  //   navigate("/createpassword")
  // }

  const handleLink = () => {
    navigate("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f9f9f9",
      }}
    >
      {contextHolder}
      <Card
        title="Signup Form"
        hoverable
        style={{
          width: 500,
          padding: "40px",
          background: "#fff",
          // height: 500,
        }}
      >
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Space.Compact>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please input your Email!" }]}
            >
              <Input placeholder={"Email"} />
            </Form.Item>
            <Button
              loading={generateLoading}
              onClick={async () => {
                try {
                  const email = form.getFieldValue("email"); // ✅ correct usage
                  if (!email) {
                    messageApi.warning("Please enter email first");
                    return;
                  }
                  setGenerateLoading(true);
                  const res = await GenerateOtp({ email, role });
                  console.log(role);
                  if (res.status === "success") {
                    messageApi.success("OTP sent to your email");
                  } else {
                    messageApi.error(res.message || "Failed to send OTP");
                  }
                } catch (e) {
                  messageApi.error("Failed to send OTP");
                } finally {
                  setGenerateLoading(false); // ✅ stop loading
                }
              }}
              type="default"
            >
              Generate OTP
            </Button>
          </Space.Compact>

          <Form.Item
            label="Enter OTP"
            name="otp"
            rules={[{ required: true, message: "Please input your otp!" }]}
          >
            <Input.OTP length={4} />
          </Form.Item>

          <Form.Item label={null}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              style={{ marginRight: "5px" }}
            >
              Submit
            </Button>
            or
            <Button type="link" onClick={handleLink} style={{ padding: 5 }}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
export default Signup;
