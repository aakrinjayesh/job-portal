import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  message,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  BellOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { UpdateCandidateDomains, GetUserProfile } from "../api/api";
import NotificationPreferences from "../../components/NotificationPreferences";

const { Title, Text } = Typography;

// const SECTIONS = [
//   { key: "notifications", label: "Notifications", icon: <BellOutlined /> },
//   { key: "privacy", label: "Privacy", icon: <EyeInvisibleOutlined /> },
// ];
const SECTIONS = [
  { key: "notifications", label: "Notifications" },
  { key: "privacy", label: "Privacy" },
];

function HideProfileSection() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  useEffect(() => {
    const loadDomains = async () => {
      const res = await GetUserProfile();
      const domains = res?.user?.hiddenDomains || [];
      if (domains.length > 0) {
        form.setFieldsValue({ domains });
        setHasValue(true);
      } else {
        form.setFieldsValue({ domains: [""] });
      }
    };
    loadDomains();
  }, [form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const entries = values.domains || [];
      const domains = entries.map((entry) => {
        const trimmed = entry.toLowerCase().trim();
        return trimmed.includes("@") ? trimmed.split("@")[1] : trimmed;
      });
      await UpdateCandidateDomains({ hiddenDomains: domains });
      message.success("Company emails saved successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 700, borderRadius: 12 }}>
      <Space align="center" style={{ marginBottom: 10 }}>
        <Title level={4} style={{ margin: 0 }}>
          Hide Profile From Company
        </Title>
        <Tooltip
          placement="right"
          title="If you enter a company domain name that matches a recruiter's company domain name, your profile will not be visible to that company."
        >
          <InfoCircleOutlined
            style={{ fontSize: 18, color: "#888", cursor: "pointer" }}
          />
        </Tooltip>
      </Space>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ domains: [""] }}
        onFinish={onFinish}
        onValuesChange={() => {
          const values = form.getFieldValue("domains") || [];
          setHasValue(values.some((v) => v));
        }}
        style={{ marginTop: 20 }}
      >
        <Form.List name="domains">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    label={name === 0 ? "Current Company Domain Name" : ""}
                  >
                    <Form.Item
                      {...restField}
                      name={name}
                      noStyle
                      rules={[
                        {
                          required: true,
                          message: "Enter company domain name",
                        },
                        {
                          validator(_, value) {
                            if (!value) return Promise.resolve();
                            const domainRegex =
                              /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                            const emailRegex =
                              /^[^\s@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                            if (
                              domainRegex.test(value) ||
                              emailRegex.test(value)
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "Enter a valid domain (e.g. company.com) or email (e.g. user@company.com)",
                              ),
                            );
                          },
                        },
                      ]}
                    >
                      <Input placeholder="example: company.com" />
                    </Form.Item>
                  </Form.Item>

                  <DeleteOutlined
                    onClick={async () => {
                      remove(name);
                      const values = form.getFieldsValue();
                      const emails = values.domains || [];
                      const domains = emails
                        .map((email) => email?.split("@")[1])
                        .filter(Boolean)
                        .map((d) => d.toLowerCase().trim());
                      await UpdateCandidateDomains({ hiddenDomains: domains });
                      message.success("Domain removed successfully");
                    }}
                    style={{ color: "red", fontSize: 16, cursor: "pointer" }}
                  />
                </Space>
              ))}

              {fields.length < 10 && (
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Company Email
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!hasValue}
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

function Settings() {
  const [activeSection, setActiveSection] = useState("notifications");

  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        height: "calc(100vh - 112px)",
        overflow: "hidden",
        padding: "4px 2px",
      }}
    >
      {/* ── Left Nav ── */}
      <div
        style={{
          width: 220,
          flexShrink: 0,
          height: "100%",
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        <Card
          styles={{ body: { padding: "16px 8px" } }}
          style={{
            borderRadius: 14,
            border: "1px solid #e8eaf0",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            height: "100%",
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              padding: "4px 14px",
              display: "block",
              marginBottom: 8,
              color: "#9ca3af",
            }}
          >
            Settings
          </Text>

          {SECTIONS.map((s) => {
            const isActive = activeSection === s.key;
            let icon;
            if (s.key === "notifications") {
              icon = <BellOutlined />;
            } else if (s.key === "privacy") {
              icon = isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />;
            }
            return (
              <div
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.color = "#374151";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#4b5563";
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 9,
                  cursor: "pointer",
                  background: isActive
                    ? "linear-gradient(135deg, #eff6ff 0%, #e8f0fe 100%)"
                    : "transparent",
                  color: isActive ? "#1d4ed8" : "#4b5563",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13.5,
                  transition: "all 0.18s ease",
                  marginBottom: 2,
                  borderLeft: isActive
                    ? "3px solid #3b82f6"
                    : "3px solid transparent",
                  boxShadow: isActive
                    ? "0 1px 4px rgba(59,130,246,0.12)"
                    : "none",
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    color: isActive ? "#3b82f6" : "#9ca3af",
                    transition: "color 0.18s",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/* {s.icon} */}
                  {icon}
                </span>
                {s.label}
              </div>
            );
          })}
        </Card>
      </div>

      {/* ── Content ── */}
      <div
        style={{
          flex: 1,
          height: "100%",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#e2e8f0 transparent",
          borderRadius: 14,
        }}
      >
        {activeSection === "notifications" && (
          <Card
            style={{
              borderRadius: 14,
              minHeight: "100%",
              border: "1px solid #e8eaf0",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
            styles={{ body: { padding: "28px 32px" } }}
          >
            <NotificationPreferences />
          </Card>
        )}

        {activeSection === "privacy" && (
          <Card
            style={{
              borderRadius: 14,
              minHeight: "100%",
              border: "1px solid #e8eaf0",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
            styles={{ body: { padding: "28px 32px" } }}
          >
            <HideProfileSection />
          </Card>
        )}
      </div>
    </div>
  );
}

export default Settings;
