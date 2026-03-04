import React, { useState } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Typography,
  Select,
  message,
} from "antd";
import { GetContactSupport } from "../candidate/api/api";
import AppHeader from "../components/layout/AppHeader";
import AppFooter from "../components/layout/AppFooter";

const { Title, Text } = Typography;
const { TextArea } = Input;

/* ── contact info items ── */
const contactItems = [
  {
    // icon: "📧",
    label: "Support Email",
    value: "support@forcehead.com",
    href: "mailto:support@forcehead.com",
  },
  {
    // icon: "💼",
    label: "Business Enquiries",
    value: "info@forcehead.com",
    href: "mailto:info@forcehead.com",
  },
  {
    // icon: "⏱",
    label: "Working Hours",
    value: "Mon–Fri, 9 AM – 6 PM IST",
    href: null,
  },
];

const supportAreas = [
  { label: "Technical Support" },
  { label: "Vendor Partnership" },
  { label: "Account Issues" },
  { label: "Job Posting Help" },
];

/* ── main component ── */
const ContactSupport = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [messageAPI, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
  try {
    setSubmitting(true);

    await GetContactSupport(values); // ✅ call backend API

    messageAPI.success(
      "Message sent! Our support team will get back to you soon."
    );

    form.resetFields();
  } catch (error) {
    message.error(
      error?.response?.data?.message || "Failed to send message"
    );
  } finally {
    setSubmitting(false);
  }
};

  return (
    <>
     {contextHolder}
      <style>{css}</style>
      {/* <AppHeader /> */}

      {/* ── Hero Banner ── */}
      <div className="cs-hero">
        <div className="cs-hero-inner">
          {/* <div className="cs-hero-badge">💬 We're here to help</div> */}
          <Title
            level={1}
            style={{
              color: "#fff",
              marginTop: "-30px",
              fontSize: "22px",
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            Contact &amp; Support
          </Title>
          <Text
            style={{
              color: "rgba(255,255,255,0.78)",
              fontSize: 16,
              maxWidth: 480,
              // display: "block",
              alignItems: "center",
            }}
          >
            Have a question or need assistance? The Forcehead team is ready to
            help you within one business day.
          </Text>
        </div>
        <div className="cs-hero-blob cs-blob1" />
        <div className="cs-hero-blob cs-blob2" />
      </div>

      {/* ── Main Content ── */}
      <div className="cs-page-wrap">
        <Row gutter={[28, 28]} align="stretch">

          {/* ── LEFT PANEL ── */}
          <Col xs={24} md={9}>
            <div className="cs-info-card">

              {/* avatar / brand block */}
              <div className="cs-brand-block">
               
                <div>
                  <div className="cs-brand-name">Forcehead Support</div>
                  <div className="cs-brand-sub">Salesforce Talent Network</div>
                </div>
              </div>

              <div className="cs-divider" />

              {/* contact rows */}
              <div className="cs-section-label">GET IN TOUCH</div>
              {contactItems.map((c) => (
                <div key={c.value} className="cs-contact-row">
                  {/* <div className="cs-contact-icon">{c.icon}</div> */}
                  <div>
                    <div className="cs-contact-label">{c.label}</div>
                    {c.href ? (
                      <a href={c.href} className="cs-contact-value cs-link">
                        {c.value}
                      </a>
                    ) : (
                      <div className="cs-contact-value">{c.value}</div>
                    )}
                  </div>
                </div>
              ))}

              <div className="cs-divider" />

              {/* support areas */}
              <div className="cs-section-label">SUPPORT AREAS</div>
              <div className="cs-tags-grid">
                {supportAreas.map((s) => (
                  <div key={s.label} className="cs-tag">
                    {/* <span>{s.icon}</span> */}
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="cs-divider" />

              {/* response time badge */}
              <div className="cs-response-badge">
                <span className="cs-response-dot" />
                <Text style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
                  Average response time: &lt; 4 hours
                </Text>
              </div>

            </div>
          </Col>

          {/* ── RIGHT FORM ── */}
          <Col xs={24} md={15}>
            <div className="cs-form-card">
              <div className="cs-form-header">
                <Title level={3} style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>
                  Send us a message
                </Title>
                <Text style={{ color: "#64748b", fontSize: 14 }}>
                  Fill in the details below and we'll get back to you promptly.
                </Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="cs-form"
                requiredMark={false}
              >
                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="name"
                      label={<span className="cs-label">Full Name</span>}
                      rules={[{ required: true, message: "Please enter your name" }]}
                    >
                      <Input
                        size="large"
                        placeholder="e.g. Rahul Sharma"
                        className="cs-input"
                        // prefix={<span style={{ marginRight: 6 }}>👤</span>}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label={<span className="cs-label">Email Address</span>}
                      rules={[
                        { required: true, message: "Please enter your email" },
                        { type: "email", message: "Enter a valid email" },
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder="you@example.com"
                        className="cs-input"
                        // prefix={<span style={{ marginRight: 6 }}>📧</span>}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="role"
                      label={<span className="cs-label">Your Role</span>}
                      rules={[{ required: true, message: "Please select your role" }]}
                    >
                      <Select
                        size="large"
                        placeholder="Select role"
                        className="cs-select"
                        options={[
                          { value: "candidate", label: " Candidate" },
                          { value: "company", label: " Company" },
                          { value: "vendor", label: " Vendor" },
                        ]}
                      />
                    </Form.Item>
                  </Col>

                   <Col xs={24} sm={12}>
    <Form.Item
      name="phone"
      label={<span className="cs-label">Phone Number</span>}
      rules={[
        { required: true, message: "Please enter your phone number" },
        {
          pattern: /^[0-9]{10}$/,
          message: "Enter valid 10 digit phone number",
        },
      ]}
    >
      <Input
        size="large"
        placeholder="e.g. 9876543210"
        className="cs-input"
        // prefix={<span style={{ marginRight: 6 }}>📱</span>}
        maxLength={10}
      />
    </Form.Item>
  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="subject"
                      label={<span className="cs-label">Subject</span>}
                      // rules={[{ required: true, message: "Please enter a subject" }]}
                    >
                      <Input
                        size="large"
                        placeholder="Brief subject line"
                        className="cs-input"
                        // prefix={<span style={{ marginRight: 6 }}>📌</span>}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="message"
                  label={<span className="cs-label">Message</span>}
                  rules={[{ required: true, message: "Please enter your message" }]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Describe your issue or question in detail…"
                    className="cs-textarea"
                    style={{ resize: "none" }}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={submitting}
                  className="cs-submit-btn"
                  block
                >
                  {submitting ? "Sending…" : "Send Message →"}
                </Button>

                <Text
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: 14,
                    fontSize: 12,
                    color: "#94a3b8",
                  }}
                >
                 Your information is safe with us and will never be shared.
                </Text>
              </Form>
            </div>
          </Col>

        </Row>
      </div>
    </>
  );
};

/* ── styles ── */
const css = `
  /* Hero */
  .cs-hero {
    background: linear-gradient(135deg, #1e3a8a 0%, #4F63F6 60%, #6d28d9 100%);
    padding: 72px 24px 80px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .cs-hero-inner { position: relative; z-index: 2; }
  .cs-hero-badge {
    display: inline-block;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.25);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    // padding: 6px 18px;
    border-radius: 30px;
    letter-spacing: 0.4px;
  }
  .cs-hero-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    opacity: 0.12;
    background: #fff;
  }
  .cs-blob1 { width: 360px; height: 360px; top: -120px; right: -100px; }
  .cs-blob2 { width: 240px; height: 240px; bottom: -80px; left: -60px; }

  /* Page wrap */
  .cs-page-wrap {
    max-width: 1160px;
    margin: -40px auto 60px;
    padding: 0 24px;
    position: relative;
    z-index: 10;
  }

  /* Info card */
  .cs-info-card {
    background: #fff;
    border-radius: 20px;
    padding: 32px 28px;
    box-shadow: 0 4px 32px rgba(15,23,42,0.09);
    height: 100%;
  }
  .cs-brand-block {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 4px;
  }
  .cs-brand-icon {
    width: 48px; height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, #4F63F6, #6d28d9);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }
  .cs-brand-name { font-weight: 700; font-size: 16px; color: #0f172a; }
  .cs-brand-sub  { font-size: 12px; color: #94a3b8; margin-top: 2px; }

  .cs-divider {
    height: 1px;
    background: #f1f5f9;
    margin: 22px 0;
  }
  .cs-section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    color: #94a3b8;
    margin-bottom: 14px;
  }

  /* Contact rows */
  .cs-contact-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 18px;
  }
  .cs-contact-icon {
    width: 38px; height: 38px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px;
    flex-shrink: 0;
  }
  .cs-contact-label { font-size: 11px; color: #94a3b8; margin-bottom: 2px; }
  .cs-contact-value { font-size: 13px; font-weight: 600; color: #1e293b; }
  .cs-link { color: #4F63F6 !important; text-decoration: none; }
  .cs-link:hover { text-decoration: underline; }

  /* Tags */
  .cs-tags-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .cs-tag {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 9px 12px;
    font-size: 13px;
    font-weight: 500;
    color: #334155;
    transition: all 0.2s;
    cursor: default;
  }
  .cs-tag:hover {
    background: #eef2ff;
    border-color: #4F63F6;
    color: #4F63F6;
  }

  /* Response badge */
  .cs-response-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 10px;
    padding: 10px 14px;
  }
  .cs-response-dot {
    width: 8px; height: 8px;
    background: #16a34a;
    border-radius: 50%;
    flex-shrink: 0;
    animation: pulse-green 1.8s infinite;
  }
  @keyframes pulse-green {
    0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.4); }
    50%       { box-shadow: 0 0 0 6px rgba(22,163,74,0); }
  }

  /* Form card */
  .cs-form-card {
    background: #fff;
    border-radius: 20px;
    padding: 36px 36px 32px;
    box-shadow: 0 4px 32px rgba(15,23,42,0.09);
    height: 100%;
  }
  .cs-form-header { margin-bottom: 28px; }
  .cs-label { font-weight: 600; font-size: 13px; color: #374151; }

  .cs-input,
  .cs-textarea {
    border-radius: 10px !important;
    border-color: #e2e8f0 !important;
    background: #f8fafc !important;
    font-size: 14px !important;
    transition: all 0.2s !important;
  }
  .cs-input:focus,
  .cs-textarea:focus,
  .cs-input:hover,
  .cs-textarea:hover {
    border-color: #4F63F6 !important;
    background: #fff !important;
    box-shadow: 0 0 0 3px rgba(79,99,246,0.08) !important;
  }
  .cs-select .ant-select-selector {
    border-radius: 10px !important;
    border-color: #e2e8f0 !important;
    background: #f8fafc !important;
    font-size: 14px !important;
  }
  .cs-select:hover .ant-select-selector,
  .cs-select.ant-select-focused .ant-select-selector {
    border-color: #4F63F6 !important;
    background: #fff !important;
    box-shadow: 0 0 0 3px rgba(79,99,246,0.08) !important;
  }

  .cs-submit-btn {
    height: 52px !important;
    border-radius: 12px !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    background: linear-gradient(135deg, #4F63F6 0%, #6d28d9 100%) !important;
    border: none !important;
    letter-spacing: 0.3px;
    box-shadow: 0 4px 20px rgba(79,99,246,0.35) !important;
    transition: all 0.2s !important;
  }
  .cs-submit-btn:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 8px 28px rgba(79,99,246,0.45) !important;
  }
  .cs-submit-btn:active {
    transform: translateY(0) !important;
  }

  /* Mobile tweaks */
  @media (max-width: 768px) {
    .cs-hero { padding: 52px 20px 64px; }
    .cs-form-card { padding: 24px 20px; }
    .cs-info-card { padding: 24px 20px; }
    .cs-tags-grid { grid-template-columns: 1fr 1fr; }
  }
`;

export default ContactSupport;