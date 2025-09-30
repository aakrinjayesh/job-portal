import React from "react";
import { Form, Button, Card, message, Space, Input } from "antd";
// import CustomButton from "../components/CustomButton";
import InputBox from "../components/InputBox";
import { useNavigate } from "react-router-dom";
import { GenerateOtp, ValidateOtp } from "../api/api";

const Signup = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const response = await ValidateOtp({
        email: values.email,
        otp: values.otp,
      });
      if (response.status === "success") {
        localStorage.setItem("token", response.token);
        messageApi.success("Logged in successfully!");
        navigate("/home");
      } else {
        messageApi.error(response.message || "Invalid OTP");
      }
    } catch (err) {
      console.log("validate otp error", err);
      messageApi.error("Something went wrong");
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const handleLink = () => {
    navigate("/");
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
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <InputBox placeholder={"Username"} />
          </Form.Item>
          <Space.Compact>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please input your Email!" }]}
            >
              <InputBox placeholder={"Email"} />
            </Form.Item>
            <Button
              onClick={async () => {
                try {
                  const email = form.getFieldValue("email"); // ✅ correct usage
                  if (!email) {
                    messageApi.warning("Please enter email first");
                    return;
                  }
                  const res = await GenerateOtp({ email });
                  if (res.status === "success") {
                    messageApi.success("OTP sent to your email");
                  } else {
                    messageApi.error(res.message || "Failed to send OTP");
                  }
                } catch (e) {
                  messageApi.error("Failed to send OTP");
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
