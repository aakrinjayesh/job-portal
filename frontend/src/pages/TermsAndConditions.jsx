import React from "react";
import { Typography, Card, Tag, Divider, Space } from "antd";
import {
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  LockOutlined,
  BankOutlined,
  StopOutlined,
  CopyrightOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  MailOutlined,
  ApartmentOutlined,
  GlobalOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const NAVY = "#011026";
const PRIMARY = "#1677FF";
const PRIMARY_LIGHT = "#E6F0FF";

/* ── Each section config ── */
const sections = [
  {
    num: "01",
    icon: <InfoCircleOutlined />,
    color: PRIMARY,
    bg: PRIMARY_LIGHT,
    title: "Acceptance of Terms",
    content:
      "By accessing or using FORCEHEAD, you agree to be legally bound by these Terms and Conditions. If you do not agree, please discontinue use of the platform immediately.",
  },
  {
    num: "02",
    icon: <ApartmentOutlined />,
    color: "#722ED1",
    bg: "#F9F0FF",
    title: "About FORCEHEAD",
    content:
      "FORCEHEAD is a Salesforce-focused B2B recruitment and vendor portal that enables AI-powered job description generation, job posting, candidate sourcing, bench resource management, vendor collaboration, and AI-based candidate-job fit analysis.",
  },
  {
    num: "03",
    icon: <LockOutlined />,
    color: "#52C41A",
    bg: "#F6FFED",
    title: "User Accounts",
    content:
      "Users must provide accurate, current, and complete information during registration and maintain confidentiality of their login credentials. You are responsible for all activity that occurs under your account.",
  },
  {
    num: "04",
    icon: <ExclamationCircleOutlined />,
    color: "#FA8C16",
    bg: "#FFF7E6",
    title: "AI Services Disclaimer",
    content:
      "AI-generated job descriptions, candidate analysis, and platform insights are provided for assistance purposes only. FORCEHEAD does not guarantee specific hiring outcomes, candidate suitability, or business results arising from AI-generated content.",
  },
  {
    num: "05",
    icon: <SafetyCertificateOutlined />,
    color: "#13C2C2",
    bg: "#E6FFFB",
    title: "Bench & Candidate Data",
    content:
      "Vendors uploading candidate or bench resource data confirm they have obtained appropriate authorization and consent from the individuals concerned, and that the data is accurate, lawful, and compliant with applicable data protection regulations.",
  },
  {
    num: "06",
    icon: <GlobalOutlined />,
    color: "#1677FF",
    bg: PRIMARY_LIGHT,
    title: "Communications & Vendor Connections",
    content:
      "FORCEHEAD is not an employment agency. The platform facilitates connections between companies and vendors/candidates but is not responsible for disputes, agreements, or outcomes arising between users. All such matters are between the parties involved.",
  },
  {
    num: "07",
    icon: <LockOutlined />,
    color: "#52C41A",
    bg: "#F6FFED",
    title: "Data Security",
    content:
      "We implement SSL/TLS encryption, controlled access, and industry-standard security practices to protect your data. FORCEHEAD does not sell, rent, or trade personal data to third parties.",
  },
  {
    num: "08",
    icon: <StopOutlined />,
    color: "#FF4D4F",
    bg: "#FFF1F0",
    title: "Prohibited Conduct",
    content: (
      <>
        <Paragraph
          style={{
            color: "#595959",
            fontSize: 14,
            lineHeight: 1.75,
            marginBottom: 8,
          }}
        >
          Users shall not engage in any of the following:
        </Paragraph>
        <ul
          style={{
            paddingLeft: 20,
            margin: 0,
            color: "#595959",
            fontSize: 14,
            lineHeight: 2,
          }}
        >
          <li>Post false, misleading, or discriminatory content</li>
          <li>
            Misuse, scrape, or extract platform data without authorization
          </li>
          <li>Attempt to bypass, hack, or manipulate platform systems</li>
          <li>
            Share credentials or access paid features without a valid
            subscription
          </li>
          <li>Exploit system vulnerabilities or loopholes</li>
        </ul>
      </>
    ),
  },
  {
    num: "09",
    icon: <CopyrightOutlined />,
    color: "#722ED1",
    bg: "#F9F0FF",
    title: "Intellectual Property",
    content:
      "All AI systems, software, source code, design, user interface, databases, branding, and platform content are the exclusive property of FORCEHEAD and are protected under applicable intellectual property laws. Unauthorized use is strictly prohibited.",
  },
  {
    num: "10",
    icon: <ExclamationCircleOutlined />,
    color: "#FA8C16",
    bg: "#FFF7E6",
    title: "Limitation of Liability",
    content:
      "FORCEHEAD shall not be liable for hiring decisions, employment outcomes, vendor agreements, or any direct or indirect business losses arising from use of the platform, including reliance on AI-generated content.",
  },
  {
    num: "11",
    icon: <StopOutlined />,
    color: "#FF4D4F",
    bg: "#FFF1F0",
    title: "Suspension & Termination",
    content:
      "We reserve the right to suspend or permanently terminate accounts that violate these Terms, engage in prohibited conduct, or attempt to misuse the platform — with or without prior notice, and without obligation of refund.",
  },
  {
    num: "12",
    icon: <InfoCircleOutlined />,
    color: "#13C2C2",
    bg: "#E6FFFB",
    title: "Modifications",
    content:
      "FORCEHEAD reserves the right to update or modify these Terms at any time. Continued use of the platform following any changes constitutes acceptance of the revised Terms.",
  },
  {
    num: "13",
    icon: <GlobalOutlined />,
    color: "#1677FF",
    bg: PRIMARY_LIGHT,
    title: "Governing Law",
    content:
      "These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts located in India.",
  },
  {
    num: "14",
    icon: <MailOutlined />,
    color: "#52C41A",
    bg: "#F6FFED",
    title: "Contact",
    content: (
      <Text style={{ fontSize: 14, color: "#595959" }}>
        For any queries regarding these Terms, please reach out to us at{" "}
        <a
          href="mailto:support@forcehead.com"
          style={{ color: PRIMARY, fontWeight: 500 }}
        >
          support@forcehead.com
        </a>
      </Text>
    ),
  },
  {
    num: "15",
    icon: <DollarOutlined />,
    color: "#FA8C16",
    bg: "#FFF7E6",
    title: "Pricing & Limit Access Policy",
    content: (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              label: "Subscription & Access Model",
              text: "Our platform operates on a paid pricing model providing users with limited access to specific features based on the selected plan. Access to premium features is granted only upon successful payment.",
            },
            {
              label: "Usage Limits",
              text: "Each subscription plan includes defined limits such as number of job posts, candidate views, downloads, AI usage, or vendor connections. Exceeding these limits may require upgrading to a higher plan.",
            },
            {
              label: "Prohibited Actions",
              text: "Users are strictly prohibited from attempting to bypass, manipulate, or hack subscription limits; using unauthorized methods to gain premium access without payment; sharing login credentials to avoid purchasing additional licenses; or exploiting system vulnerabilities.",
            },
            {
              label: "Monitoring & Enforcement",
              text: "We reserve the right to monitor account activity to ensure compliance with our pricing model and usage policies.",
            },
            {
              label: "Suspension & Legal Action",
              text: "If any user is found attempting to manipulate or fraudulently access paid features, the account may be immediately suspended or permanently terminated without refund, and we reserve the right to initiate legal action.",
            },
            {
              label: "Changes to Pricing",
              text: "We reserve the right to modify pricing plans, access limits, or features at any time with prior notice.",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{ paddingLeft: 12, borderLeft: `3px solid #FA8C16` }}
            >
              <Text
                strong
                style={{
                  fontSize: 13,
                  display: "block",
                  marginBottom: 4,
                  color: "#222",
                }}
              >
                {item.label}
              </Text>
              <Paragraph
                style={{
                  color: "#595959",
                  fontSize: 14,
                  lineHeight: 1.75,
                  marginBottom: 0,
                }}
              >
                {item.text}
              </Paragraph>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    num: "16",
    icon: <FileProtectOutlined />,
    color: "#722ED1",
    bg: "#F9F0FF",
    title: "Intellectual Property Rights",
    content: (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              label: "Ownership of Platform Content",
              text: "All content, features, functionality, software, source code, design, layout, user interface, databases, text, graphics, logos, trademarks, AI-generated systems, and other materials on the platform are the exclusive property of the Company and are protected under applicable intellectual property laws.",
            },
            {
              label: "Trademark & Brand Protection",
              text: "The Company name, logo, brand identity, and related materials may not be copied, reproduced, distributed, modified, or used without prior written permission from FORCEHEAD.",
            },
            {
              label: "Restrictions on Use",
              text: "Users shall not copy, reproduce, republish, upload, transmit, or distribute any platform content; reverse engineer or decompile the platform; create derivative works; scrape or misuse platform data; or use platform content for commercial purposes without authorization.",
            },
            {
              label: "Data & AI Protection",
              text: "AI tools, job description generators, candidate analysis systems, and proprietary algorithms provided within the platform are confidential and protected intellectual property of the Company.",
            },
            {
              label: "Legal Action for Violation",
              text: "Any unauthorized use, reproduction, modification, distribution, or violation of the Company's intellectual property rights will result in immediate suspension or termination of access, claims for damages, and strict legal action under applicable Intellectual Property laws and Information Technology laws.",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{ paddingLeft: 12, borderLeft: "3px solid #722ED1" }}
            >
              <Text
                strong
                style={{
                  fontSize: 13,
                  display: "block",
                  marginBottom: 4,
                  color: "#222",
                }}
              >
                {item.label}
              </Text>
              <Paragraph
                style={{
                  color: "#595959",
                  fontSize: 14,
                  lineHeight: 1.75,
                  marginBottom: 0,
                }}
              >
                {item.text}
              </Paragraph>
            </div>
          ))}
        </div>
      </>
    ),
  },
];

const TermsAndConditions = () => {
  return (
    <div style={{ background: "#f5f6fa", minHeight: "100vh" }}>
      {/* ── Header Banner ── */}
      <div
        style={{
          background: NAVY,
          padding: "56px 40px 48px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(22,119,255,0.15)",
            color: PRIMARY,
            border: "1px solid rgba(22,119,255,0.3)",
            fontSize: 12,
            fontWeight: 600,
            padding: "4px 14px",
            borderRadius: 100,
            marginBottom: 20,
            letterSpacing: 0.5,
          }}
        >
          <FileProtectOutlined />
          Legal Document
        </div>

        <Title
          level={1}
          style={{
            color: "#fff",
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 700,
            marginBottom: 12,
            letterSpacing: "-0.5px",
          }}
        >
          Terms and Conditions
        </Title>

        <Paragraph
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 15,
            marginBottom: 0,
            lineHeight: 1.7,
          }}
        >
          Please read these terms carefully before using FORCEHEAD.
        </Paragraph>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            marginTop: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#52C41A",
              }}
            />
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
              <strong style={{ color: "rgba(255,255,255,0.8)" }}>
                Platform:
              </strong>{" "}
              FORCEHEAD
            </Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: PRIMARY,
              }}
            />
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
              <strong style={{ color: "rgba(255,255,255,0.8)" }}>
                Governing Law:
              </strong>{" "}
              India
            </Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#FA8C16",
              }}
            />
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
              <strong style={{ color: "rgba(255,255,255,0.8)" }}>
                Contact:
              </strong>{" "}
              support@forcehead.com
            </Text>
          </div>
        </div>
      </div>

      {/* ── Effective date bar ── */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          padding: "14px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 13, color: "#888" }}>
          <strong style={{ color: "#555" }}>Effective Date:</strong> Please
          refer to the latest published version on our website.
        </Text>
        <Space size={8} wrap>
          <Tag
            color="blue"
            style={{ borderRadius: 100, fontSize: 12, padding: "2px 10px" }}
          >
            16 Sections
          </Tag>
          <Tag
            color="green"
            style={{ borderRadius: 100, fontSize: 12, padding: "2px 10px" }}
          >
            Binding Agreement
          </Tag>
          <Tag style={{ borderRadius: 100, fontSize: 12, padding: "2px 10px" }}>
            India Law
          </Tag>
        </Space>
      </div>

      {/* ── Sections grid ── */}
      <div
        style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 40px 64px" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sections.map((sec) => (
            <Card
              key={sec.num}
              style={{
                borderRadius: 12,
                border: "1px solid #f0f0f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
              styles={{ body: { padding: "24px 28px" } }}
            >
              <div
                style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
              >
                {/* icon + number */}
                <div
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: sec.bg,
                      color: sec.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    {sec.icon}
                  </div>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#d0d0d0",
                      letterSpacing: 0.5,
                    }}
                  >
                    {sec.num}
                  </Text>
                </div>

                {/* content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Title
                    level={4}
                    style={{
                      marginTop: 0,
                      marginBottom: 10,
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0a0a0a",
                      lineHeight: 1.4,
                    }}
                  >
                    {sec.title}
                  </Title>

                  {typeof sec.content === "string" ? (
                    <Paragraph
                      style={{
                        color: "#595959",
                        fontSize: 14,
                        lineHeight: 1.8,
                        marginBottom: 0,
                      }}
                    >
                      {sec.content}
                    </Paragraph>
                  ) : (
                    sec.content
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Footer note ── */}
        <div
          style={{
            marginTop: 40,
            background: NAVY,
            borderRadius: 12,
            padding: "28px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <Text
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                display: "block",
                marginBottom: 4,
              }}
            >
              <ApartmentOutlined style={{ color: PRIMARY, marginRight: 8 }} />
              FORCEHEAD
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
              By using this platform, you acknowledge that you have read and
              understood these Terms.
            </Text>
          </div>
          <a
            href="mailto:support@forcehead.com"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: PRIMARY,
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <MailOutlined />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
