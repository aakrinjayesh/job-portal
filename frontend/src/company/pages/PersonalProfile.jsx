// ======================= MyProfile Component =========================
import React, { useEffect, useState } from "react";
import { Upload, Avatar } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import {
  Form,
  Input,
  Button,
  message,
  Typography,
  Progress,
  Tooltip,
  Row,
  Col,
  Card,
  Divider,
  Steps,
  Space,
} from "antd";
import { CloseCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import {
  GetUserProfileDetails,
  UpdateUserProfileDetails,
} from "../../company/api/api";
import Address from "../../company/components/Profile/Address";
import { useLocation, useNavigate } from "react-router-dom";
import { uploadProfilePicture } from "../../candidate/api/api";

const { Title, Text } = Typography;
const { Step } = Steps;

const userRole = localStorage.getItem("role");

const PersonalProfile = () => {
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();

  const [editable, setEditable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const firstLoadRef = React.useRef(true);

  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    if (initialLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 10 : prev + 10));
      }, 400);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [initialLoading]);

  useEffect(() => {
    const loadProfile = async () => {
      if (firstLoadRef.current) {
        setInitialLoading(true);
      }

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
            profileUrl,
          } = res.data;
          setProfileImageUrl(profileUrl);
          form.setFieldsValue({
            firstName,
            lastName,
            phoneNumber,
            email,
            // companyProfileUrl: profileUrl,
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

        if (firstLoadRef.current) {
          setTimeout(() => {
            setInitialLoading(false);
            firstLoadRef.current = false; // 🔒 prevent again
          }, 300);
        }
      }
    };

    loadProfile();
  }, []);

  const handleUpload = async (file) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      messageApi.error("Only JPG, JPEG, PNG images allowed!");
      return Upload.LIST_IGNORE;
    }
    if (file.size > 200 * 1024) {
      messageApi.error("Image must be smaller than 200KB!");
      return Upload.LIST_IGNORE;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadProfilePicture(formData);
      if (res?.url) {
        setProfileImageUrl(res.url);
        messageApi.success("Logo uploaded successfully!");
      } else {
        messageApi.error("Upload failed");
      }
    } catch (err) {
      console.error(err);
      messageApi.error("Upload error");
    } finally {
      setUploading(false);
    }

    return false; // prevent antd default upload
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const profilePayload = {
        name: `${values.firstName} ${values.lastName}`.trim(),
        phoneNumber: values.phoneNumber,
        companyName: values.company,
        profileUrl: profileImageUrl,
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

      <Card
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          borderRadius: 12,
          boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        }}
        bodyStyle={{ padding: 32 }}
      >
        {/* ===== HEADER ===== */}
        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 4 }}>
            Personal Information
          </Title>
          <Text type="secondary">Update your personal and contact details</Text>
        </div>

        <Divider />

        {initialLoading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <Progress
              type="circle"
              percent={progress}
              width={90}
              strokeColor={{
                "0%": "#4F63F6",
                "100%": "#7C8CFF",
              }}
              trailColor="#E6E8FF"
              showInfo={false}
            />
            <div
              style={{
                marginTop: 16,
                color: "#555",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Loading your profile…
            </div>
          </div>
        ) : (
          <Form layout="vertical" form={form}>
            {/* ===== NAME ===== */}
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[
                    { required: true },
                    {
                      pattern: /^[A-Z][a-z]+([ '-][A-Z][a-z]+)*$/,
                      message:
                        "First name must start with a capital letter and contain only letters",
                    },
                    { min: 2 },
                    { max: 30 },
                  ]}
                >
                  <Input disabled={!editable} placeholder="Enter first name" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[
                    { required: true },
                    {
                      pattern: /^[A-Z][a-z]+([ '-][A-Z][a-z]+)*$/,
                      message:
                        "Last name must start with a capital letter and contain only letters",
                    },
                    { min: 2 },
                    { max: 30 },
                  ]}
                >
                  <Input disabled={!editable} placeholder="Enter last name" />
                </Form.Item>
              </Col>
            </Row>

            {/* ===== PHONE ===== */}
            <Row gutter={24} align="middle">
              <Col span={12}>
                <Form.Item
                  label={
                    <Space>
                      Phone Number
                      {!isPhoneVerified ? (
                        <Tooltip title="Not verified">
                          <CloseCircleOutlined style={{ color: "red" }} />
                        </Tooltip>
                      ) : (
                        <CheckCircleOutlined style={{ color: "green" }} />
                      )}
                    </Space>
                  }
                  name="phoneNumber"
                  rules={[{ required: true }]}
                >
                  <Input
                    disabled={!editable}
                    placeholder="Enter phone number"
                  />
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
                    style={{
                      backgroundColor: "#1E6BFF", // exact blue tone
                      color: "#FFFFFF",
                      borderRadius: 999, // full pill
                      height: 44,
                      padding: "0 26px",
                      fontSize: 14,
                      fontWeight: 600,
                      border: "none",
                      boxShadow: "none",
                    }}
                  >
                    Verify Phone
                  </Button>
                )}

                {isVerifying && (
                  <Space>
                    <Input
                      value={otp}
                      maxLength={4}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="OTP"
                      style={{ width: 100 }}
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
                      <Text type="secondary">{timer}s</Text>
                    ) : (
                      <Button type="link">Resend</Button>
                    )}
                  </Space>
                )}
              </Col>
            </Row>

            {/* ===== EMAIL + COMPANY ===== */}
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
                    <Input
                      disabled={!editable}
                      placeholder="Enter company name"
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>

            {/* <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Company Logo" name="companyLogo">
                  <Input
                    disabled={!editable}
                    placeholder="Enter company logo URL"
                  />
                </Form.Item>
              </Col>
            </Row> */}
            <Form.Item label="Company Logo" name="companyProfileUrl">
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {/* <Upload
                  showUploadList={false}
                  beforeUpload={(file) => {
                    setLogoFile(file);
                    setPreviewUrl(URL.createObjectURL(file));
                    return false; // prevent auto upload
                  }}
                  accept="image/*"
                  disabled={!editable}
                >
                  <div style={{ cursor: editable ? "pointer" : "default" }}>
                    <Avatar
                      size={100}
                      src={previewUrl}
                      style={{
                        border: "2px solid #E6E8FF",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    />
                  </div>
                </Upload> */}

                <Upload
                  beforeUpload={handleUpload}
                  accept="image/jpeg,image/png,image/jpg"
                  disabled={!editable}
                  showUploadList={false}
                >
                  {profileImageUrl ? (
                    <Avatar
                      src={profileImageUrl}
                      size={80}
                      style={{ cursor: editable ? "pointer" : "default" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        border: "1px dashed #d9d9d9",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: editable ? "pointer" : "default",
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <UploadOutlined style={{ fontSize: 20, color: "#999" }} />
                      <div
                        style={{ fontSize: 12, color: "#999", marginTop: 4 }}
                      >
                        Upload
                      </div>
                    </div>
                  )}
                </Upload>
              </div>
            </Form.Item>

            {/* ===== ADDRESS ===== */}
            <Address form={form} editable={editable} />

            <Divider />

            {/* ===== ACTION ===== */}
            <div style={{ textAlign: "right", borderRadius: 8 }}>
              <Button
                type="primary"
                onClick={handleSave}
                loading={loading}
                size="large"
                style={{
                  backgroundColor: "#1E6BFF", // exact blue tone
                  color: "#FFFFFF",
                  borderRadius: 999, // full pill
                  height: 44,
                  padding: "0 26px",
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  boxShadow: "none",
                }}
              >
                Save Changes
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default PersonalProfile;
