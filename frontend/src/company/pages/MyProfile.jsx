// ======================= MyProfile Component =========================
import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  Spin,
  Tooltip,
  Row,
  Col,
  Card,
  Divider,
  Steps,
} from "antd";
import { CloseCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import {
  GetUserProfileDetails,
  UpdateUserProfileDetails,
} from "../../company/api/api";
import Address from "../../company/components/Profile/Address";
import { useLocation, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Step } = Steps;

const userRole = localStorage.getItem("role");

const MyProfile = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();

  const [editable, setEditable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await GetUserProfileDetails();
        if (res?.status === "success" && res.data) {
          const {
            firstName,
            lastName,
            phoneNumber,
            email,
            companyName,
            address,
          } = res.data;

          form.setFieldsValue({
            firstName,
            lastName,
            phoneNumber,
            email,
            company: companyName,
            doorNumber: address?.doorNumber || "",
            street: address?.street || "",
            city: address?.city || "",
            pinCode: address?.pinCode || "",
            country: address?.country || undefined,
            state: address?.state || undefined,
          });
        }
      } catch {
        messageApi.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const profilePayload = {
        name: `${values.firstName} ${values.lastName}`.trim(),
        phoneNumber: values.phoneNumber,
        companyName: values.company,
        profileUrl: null,
        address: {
          doorNumber: values.doorNumber,
          street: values.street,
          city: values.city,
          pinCode: values.pinCode,
          country: values.country,
          state: values.state,
        },
      };

      const res = await UpdateUserProfileDetails(profilePayload);
      if (res.status !== "success") {
        messageApi.error("Profile update failed");
        return;
      }
      messageApi.success("Profile updated successfully!");
      setEditable(false);
    } catch {
      messageApi.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isVerifying || canResend) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t > 1) return t - 1;
        clearInterval(interval);
        setCanResend(true);
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isVerifying, canResend]);

  useEffect(() => {
    if (isPhoneVerified) setIsPhoneVerified(false);
  }, [form.getFieldValue("phoneNumber")]);

  const VerifyPhoneOtp = async () => ({ success: false });

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}

      {/* ===== MAIN CARD ===== */}
      <Card
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          borderRadius: 8,
        }}
        bodyStyle={{ padding: 24 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Personal Information
          </Title>
        </div>

        <Divider />

        {loading && <Spin />}

        <Form layout="vertical" form={form}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true },
                  {
  pattern: /^[A-Z][a-z]+([ '-][A-Z][a-z]+)*$/,
  message:
    "First name must start with a capital letter and contain only letters",
},
{ min: 2, message: "First name must be at least 2 characters" },
{ max: 30, message: "First name cannot exceed 30 characters" },

                ]}
              >
                <Input disabled={!editable} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true },
                  {
  pattern: /^[A-Z][a-z]+([ '-][A-Z][a-z]+)*$/,
  message:
    "Last name must start with a capital letter and contain only letters",
},
{ min: 2, message: "Last name must be at least 2 characters" },
{ max: 30, message: "Last name cannot exceed 30 characters" },

                ]}
              >
                <Input disabled={!editable} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24} align="middle">
            <Col span={12}>
              <Form.Item
                label={
                  <>
                    Phone Number&nbsp;
                    {!isPhoneVerified ? (
                      <Tooltip title="Verify phone">
                        <CloseCircleOutlined style={{ color: "red" }} />
                      </Tooltip>
                    ) : (
                      <CheckCircleOutlined style={{ color: "green" }} />
                    )}
                  </>
                }
                name="phoneNumber"
                rules={[{ required: true }]}
              >
                <Input disabled={!editable} />
              </Form.Item>
            </Col>

            <Col span={12}>
              {!isVerifying && !isPhoneVerified && (
                <Button
                  type="primary"
                  onClick={() => {
                    setIsVerifying(true);
                    setTimer(60);
                  }}
                >
                  Verify
                </Button>
              )}

              {isVerifying && (
                <div style={{ display: "flex", gap: 8 }}>
                  <Input
                    value={otp}
                    maxLength={4}
                    onChange={(e) => setOtp(e.target.value)}
                    style={{ width: 90 }}
                  />
                  <Button
                    type="primary"
                    loading={otpLoading}
                    onClick={async () => {
                      setOtpLoading(true);
                      const res = await VerifyPhoneOtp();
                      setIsPhoneVerified(res.success);
                      setOtpLoading(false);
                    }}
                  >
                    Submit
                  </Button>
                  {!canResend ? (
                    <Text>{timer}s</Text>
                  ) : (
                    <Button type="link">Resend</Button>
                  )}
                </div>
              )}
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Email" name="email">
                <Input disabled />
              </Form.Item>
            </Col>

            {userRole === "company" && (
              <Col span={12}>
                <Form.Item
                  label="Company Name"
                  name="company"
                  rules={[{ required: true }]}
                >
                  <Input disabled={!editable} />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Address form={form} editable={editable} />

          <Divider />

          <Button type="primary" onClick={handleSave} loading={loading}>
            Save
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default MyProfile;
