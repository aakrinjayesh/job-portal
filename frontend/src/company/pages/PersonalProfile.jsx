import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  Divider,
  Row,
  Col,
  message,
  Spin,
  Card,
  Typography,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";

import {
  GetUserProfileDetails,
  UpdateCompanyPersonalProfile,
} from "../../company/api/api";
import { uploadProfilePicture } from "../../candidate/api/api";

const { Text } = Typography;

// ─── main component ───────────────────────────────────────────────────────────
const PersonalProfile = ({ onSaveSuccess }) => {
  const [form] = Form.useForm();
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  // ── load profile data ──
  useEffect(() => {
    (async () => {
      try {
        const res = await GetUserProfileDetails();
        if (res?.status === "success" && res.data) {
          const { firstName, lastName, phoneNumber, email, profileUrl } =
            res.data;

          setProfileImageUrl(profileUrl || null);

          form.setFieldsValue({
            firstName,
            lastName,
            phoneNumber,
            email,
          });
        }
      } catch {
        messageApi.error("Failed to load profile");
      } finally {
        setPageLoading(false);
      }
    })();
  }, []);

  // ── upload helper ──
  const handleUpload = async (file) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      messageApi.error("Only JPG / PNG allowed");
      return false;
    }
    if (file.size > 2 * 1024 * 1024) {
      messageApi.error("Max file size is 2 MB");
      return false;
    }

    try {
      setUploadingProfile(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadProfilePicture(fd);
      if (res?.url) {
        setProfileImageUrl(res.url);
        setIsDirty(true);
        messageApi.success("Uploaded successfully");
      } else {
        messageApi.error("Upload failed");
      }
    } catch {
      messageApi.error("Upload error");
    } finally {
      setUploadingProfile(false);
    }
    return false;
  };

  // ── save ──
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        name: `${values.firstName} ${values.lastName}`.trim(),
        phoneNumber: values.phoneNumber,
        profileUrl: profileImageUrl,
      };

      const res = await UpdateCompanyPersonalProfile(payload);
      if (res?.status === "success") {
        setIsDirty(false);
        messageApi.success({
          content: onSaveSuccess
            ? "Profile saved! Now complete your company profile."
            : "Profile updated successfully",
          duration: 5,
        });
        onSaveSuccess?.();
      } else {
        messageApi.error("Update failed");
      }
    } catch (e) {
      if (e?.errorFields)
        messageApi.warning("Please fix the highlighted fields");
      else messageApi.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ── render ──
  if (pageLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px" }}>
      {contextHolder}

      <Form
        form={form}
        layout="vertical"
        onValuesChange={() => setIsDirty(true)}
      >
        {/* ════════ 1. PERSONAL INFO ════════ */}
        <Card title="Personal Information" style={{ marginBottom: 20 }}>
          {/* <Form.Item label="Profile Picture">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Avatar size={68} src={profileImageUrl} icon={<UserOutlined />} />
              <Upload
                beforeUpload={(f) => handleUpload(f)}
                showUploadList={false}
                accept="image/jpeg,image/png,image/jpg"
              >
                <Button icon={<UploadOutlined />} loading={uploadingProfile}>
                  {profileImageUrl ? "Change Photo" : "Upload Photo"}
                </Button>
              </Upload>
              <Text type="secondary" style={{ fontSize: 12 }}>
                JPG / PNG · max 2 MB
              </Text>
            </div>
          </Form.Item>

          <Divider style={{ margin: "12px 0 20px" }} /> */}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[
                  { required: true, message: "First name is required" },
                  { min: 2, message: "Min 2 characters" },
                  { max: 30, message: "Max 30 characters" },
                  { pattern: /^[^0-9]+$/, message: "Numbers are not allowed" },
                ]}
              >
                <Input placeholder="Jane" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[
                  { required: true, message: "Last name is required" },
                  { min: 2, message: "Min 2 characters" },
                  { max: 30, message: "Max 30 characters" },
                  { pattern: /^[^0-9]+$/, message: "Numbers are not allowed" },
                ]}
              >
                <Input placeholder="Doe" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Email" name="email">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Phone Number"
                name="phoneNumber"
                rules={[
                  { required: true, message: "Phone number is required" },
                ]}
              >
                <Input placeholder="9876543210" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ════════ SAVE ════════ */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingBottom: 32,
          }}
        >
          <Button
            type="primary"
            size="large"
            loading={saving}
            disabled={!isDirty}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default PersonalProfile;
