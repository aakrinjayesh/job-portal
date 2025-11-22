// ======================= MyProfile Component =========================
import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Typography, Spin, Tooltip, Row, Col } from "antd";
import { CloseCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import jwt_decode from "jwt-decode";
import { GetUserProfile, UpdateUserProfile, UpdateUserAddress } from "../api/api";
import Address from "../../components/Address";
import { useLocation, useNavigate } from "react-router-dom";

const { Title } = Typography;
const token = localStorage.getItem("token");
const decoded = token ? jwt_decode(token) : null;
const userRole = decoded?.role || "";

const MyProfile = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const [editable, setEditable] = useState(true); // form editable on mount
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
        const res = await GetUserProfile();
        if (res?.success === "true" && res.user) {
          const { firstName, lastName, name, phoneNumber, email } = res.user;
          let fName = firstName;
          let lName = lastName;

          if (!fName || !lName) {
            const extracted = extractNameParts(name);
            if (!fName) fName = extracted.firstName;
            if (!lName) lName = extracted.lastName;
          }

          const company = email?.split("@")[1]?.split(".")[0] || "";
          form.setFieldsValue({
            name,
            phoneNumber,
            email,
            company,
            firstName: fName,
            lastName: lName,
          });
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
        messageApi.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [form, messageApi]);

  useEffect(() => {
    if (location?.state?.openInEditMode) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const profilePayload = {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        name: `${values.firstName} ${values.lastName}`.trim(),
      };

      const resProfile = await UpdateUserProfile(profilePayload);
      if (resProfile.status !== "success") {
        messageApi.error("Profile update failed");
        setLoading(false);
        return;
      }

      const addressPayload = {
        doorNumber: values.doorNumber,
        street: values.street,
        city: values.city,
        pinCode: values.pinCode,
        country: values.country,
        state: values.state,
      };

      const resAddress = await UpdateUserAddress(addressPayload);
      if (resAddress?.status !== "success") {
        messageApi.error("Address update failed!");
        setLoading(false);
        return;
      }

      messageApi.success("Profile & Address updated successfully!");
      setEditable(false);
    } catch (err) {
      console.error("Save error:", err);
      messageApi.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isVerifying || canResend) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev > 1) return prev - 1;
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

  const extractNameParts = (fullName) => {
    if (!fullName) return { firstName: "", lastName: "" };
    const parts = fullName.trim().split(" ");
    return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "" };
  };

  return (
    <div style={{ padding: "30px", maxWidth: "600px", margin: "0 auto" }}>
      {contextHolder}
      {loading && <Spin tip="Loading..." />}
      <Title level={3}>My Profile</Title>

      <Form layout="vertical" form={form}>
        {/* First Name / Last Name */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: "First Name is required" }]}
            >
              <Input disabled={!editable} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: "Last Name is required" }]}
            >
              <Input disabled={!editable} />
            </Form.Item>
          </Col>
        </Row>

        {/* Phone Number + Send OTP / OTP Group / Verified */}
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Phone Number&nbsp;
                  {!isPhoneVerified ? (
                    <Tooltip title="Please verify phone number">
                      <CloseCircleOutlined style={{ color: "red" }} />
                    </Tooltip>
                  ) : (
                    <CheckCircleOutlined style={{ color: "green" }} />
                  )}
                </span>
              }
              name="phoneNumber"
              rules={[{ required: true }, { pattern: /^\d{10}$/, message: "Invalid number" }]}
            >
              <Input disabled={!editable} />
            </Form.Item>
          </Col>

          <Col span={12}>
            {!isVerifying && !isPhoneVerified && (
              <Button
                type="primary"
                style={{ width: 80 }}
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
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  placeholder="OTP"
                  style={{ width: 80 }}
                />
                <Button
                  type="primary"
                  loading={otpLoading}
                  onClick={async () => {
                    setOtpLoading(true);
                    const response = await VerifyPhoneOtp(otp);
                    setIsPhoneVerified(response.success);
                    if (!response.success) messageApi.error("OTP verification failed");
                    setOtpLoading(false);
                  }}
                >
                  Submit
                </Button>
                {!canResend ? (
                  <span>{timer}s</span>
                ) : (
                  <Button
                    type="link"
                    onClick={() => {
                      setTimer(60);
                      setCanResend(false);
                    }}
                  >
                    Resend
                  </Button>
                )}
                <Button type="link" onClick={() => setIsVerifying(false)}>
                  Cancel
                </Button>
              </div>
            )}

            {isPhoneVerified && (
              <span style={{ color: "green", fontWeight: 500 }}>Verified</span>
            )}
          </Col>
        </Row>

        {/* Email / Company Name */}
        {userRole === "company" ? (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Email" name="email">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Company Name"
                name="company"
                rules={[{ required: true, message: "Company Name is required" }]}
              >
                <Input disabled={!editable} />
              </Form.Item>
            </Col>
          </Row>
        ) : (
          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>
        )}

        <Address form={form} editable={editable} loading={loading} />

        {/* Save Button */}
        <Button type="primary" onClick={handleSave} loading={loading}>
          Save
        </Button>
      </Form>
    </div>
  );
};

export default MyProfile;
