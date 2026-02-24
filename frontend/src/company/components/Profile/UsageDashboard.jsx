import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Tag,
  Space,
  Empty,
} from "antd";
import {
  FileTextOutlined,
  EyeOutlined,
  TeamOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Column } from "@ant-design/plots";
import { getFeatureUsage, getAIUsage, getLicenseInfo } from "../../api/api";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

/* =============================
   FEATURE LABELS
============================= */
const FEATURE_LABELS = {
  JOB_POST_CREATION: "Job Posts",
  CANDIDATE_PROFILE_VIEWS: "Candidate Views",
  APPLY_BENCH_TO_JOB: "Bench Apply",
  RESUME_EXTRACTION: "Resume Extraction",
  AI_FIT_SCORE: "AI Fit Score",
  FIND_CANDIDATE_SEARCH: "Candidate AI Search",
  FIND_JOB_SEARCH: "Job AI Search",
  JD_EXTRACTION: "JD Generation",
};

/* =============================
   FEATURE ICONS
============================= */
const FEATURE_ICONS = {
  JOB_POST_CREATION: <FileTextOutlined />,
  CANDIDATE_PROFILE_VIEWS: <EyeOutlined />,
  APPLY_BENCH_TO_JOB: <TeamOutlined />,
  RESUME_EXTRACTION: <FileTextOutlined />,
  AI_FIT_SCORE: <RobotOutlined />,
  FIND_CANDIDATE_SEARCH: <RobotOutlined />,
  FIND_JOB_SEARCH: <RobotOutlined />,
  JD_EXTRACTION: <ThunderboltOutlined />,
};

/* =====================================================
   MAIN DASHBOARD
===================================================== */
const UsageDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [featureUsage, setFeatureUsage] = useState([]);
  const [aiUsage, setAIUsage] = useState(null);
  const [licenseInfo, setLicenseInfo] = useState(null);

  useEffect(() => {
    Promise.all([getFeatureUsage(), getAIUsage(), getLicenseInfo()])
      .then(([usageRes, aiRes, licenseRes]) => {
        setFeatureUsage(Array.isArray(usageRes?.usage) ? usageRes.usage : []);
        setAIUsage(aiRes || null);
        setLicenseInfo(licenseRes || null);
      })
      .catch(() => message.error("Failed to load usage data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 120 }}>
        <Spin size="large" />
        <Paragraph style={{ marginTop: 16, color: "#999" }}>
          Loading your usage data...
        </Paragraph>
      </div>
    );
  }

  /* =====================================================
     GROUP FEATURES (REMOVE AI_TOKENS_TOTAL)
  ===================================================== */
  const groupedFeatures = Object.values(
    featureUsage
      .filter((f) => f.feature !== "AI_TOKENS_TOTAL")
      .reduce((acc, item) => {
        if (!acc[item.feature]) {
          acc[item.feature] = {
            feature: item.feature,
            periods: [],
          };
        }
        acc[item.feature].periods.push(item);
        return acc;
      }, {}),
  );

  return (
    <div style={{ padding: 32, background: "#fafafa", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <Title level={2}>Usage Overview</Title>
        <Text type="secondary">
          Monitor your feature consumption and AI activity
        </Text>

        {/* ================= LICENSE SUMMARY ================= */}
        {licenseInfo && <LicenseSummary licenseInfo={licenseInfo} />}

        {/* ================= FEATURE CARDS ================= */}
        <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
          {groupedFeatures.map(({ feature, periods }) => (
            <Col xs={24} sm={12} lg={8} key={feature}>
              <FeatureCard feature={feature} periods={periods} />
            </Col>
          ))}
        </Row>

        {/* ================= AI SECTION ================= */}
        {aiUsage && <AITokenSection aiUsage={aiUsage} />}
      </div>
    </div>
  );
};

/* =====================================================
   LICENSE SUMMARY
===================================================== */
const LicenseSummary = ({ licenseInfo }) => {
  const activeLicense = licenseInfo.licenses?.find((l) => l.isActive);

  return (
    <Card style={{ marginTop: 24 }}>
      <Space direction="vertical">
        <Text strong>Plan: {activeLicense?.planTier || "N/A"}</Text>
        {activeLicense?.validUntil && (
          <Text type="secondary">
            Valid until {dayjs(activeLicense.validUntil).format("MMM DD, YYYY")}
          </Text>
        )}
        <Text>
          {licenseInfo.assignedLicenses} / {licenseInfo.totalLicenses} Licenses
          Assigned
        </Text>
      </Space>
    </Card>
  );
};

/* =====================================================
   FEATURE CARD
===================================================== */
const FeatureCard = ({ feature, periods }) => {
  const getPrimaryUsage = () =>
    periods.find((p) => p.period === "MONTHLY") ||
    periods.find((p) => p.period === "DAILY") ||
    periods.find((p) => p.period === "YEARLY");

  const primaryUsage = getPrimaryUsage();
  const dailyUsage = periods.find((p) => p.period === "DAILY");

  const isUnlimited = primaryUsage?.maxAllowed === -1;

  const getPercent = (used, max) =>
    max === -1 ? 0 : Math.round((used / max) * 100);

  let percent = getPercent(primaryUsage?.used || 0, primaryUsage?.maxAllowed);
  let status = { color: "#1677ff", text: "Healthy" };

  if (isUnlimited) {
    status = { color: "#52c41a", text: "Unlimited" };
  } else if (dailyUsage && dailyUsage.maxAllowed !== -1) {
    const dailyPercent = getPercent(dailyUsage.used, dailyUsage.maxAllowed);
    if (dailyPercent >= 100) {
      status = { color: "#ff4d4f", text: "Daily Limit Reached" };
    }
  } else if (percent >= 90) {
    status = { color: "#ff4d4f", text: "Critical" };
  } else if (percent >= 70) {
    status = { color: "#faad14", text: "Warning" };
  }

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 10,
        height: 320, // 🔥 UNIFORM HEIGHT
        display: "flex",
        flexDirection: "column",
      }}
      bodyStyle={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <Space
        align="center"
        style={{ width: "100%", justifyContent: "space-between" }}
      >
        <Space>
          <div style={{ fontSize: 20 }}>
            {FEATURE_ICONS[feature] || <RobotOutlined />}
          </div>
          <Text strong>{FEATURE_LABELS[feature] || feature}</Text>
        </Space>
        <Tag color={status.color}>{status.text}</Tag>
      </Space>

      {/* MAIN CONTENT */}
      <div style={{ marginTop: 16 }}>
        {isUnlimited ? (
          <div style={{ textAlign: "center", paddingTop: 20 }}>
            <div style={{ fontSize: 36, color: "#52c41a" }}>∞</div>
            <Text type="secondary">Unlimited usage</Text>
          </div>
        ) : (
          <>
            <div>
              <Text style={{ fontSize: 26, fontWeight: 600 }}>
                {primaryUsage?.used}
              </Text>
              <Text type="secondary"> / {primaryUsage?.maxAllowed}</Text>
            </div>

            <div
              style={{
                width: "100%",
                height: 6,
                background: "#f0f0f0",
                borderRadius: 3,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  width: `${Math.min(percent, 100)}%`,
                  height: "100%",
                  background: status.color,
                  borderRadius: 3,
                }}
              />
            </div>

            <Text type="secondary" style={{ fontSize: 12 }}>
              {primaryUsage?.remaining} remaining
            </Text>

            {primaryUsage?.periodEnd && (
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Resets on {dayjs(primaryUsage.periodEnd).format("MMM DD")}
                </Text>
              </div>
            )}
          </>
        )}
      </div>

      {/* PUSH PERIODS TO BOTTOM */}
      <div style={{ marginTop: "auto" }}>
        {periods.length > 1 && (
          <div
            style={{
              borderTop: "1px solid #f0f0f0",
              paddingTop: 12,
            }}
          >
            {periods.map((item) => (
              <div
                key={`${item.feature}-${item.period}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Tag>{item.period}</Tag>
                <Text>
                  {item.used} / {item.maxAllowed === -1 ? "∞" : item.maxAllowed}
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

/* =====================================================
   AI TOKEN SECTION
===================================================== */
const AITokenSection = ({ aiUsage }) => {
  const chartData =
    aiUsage?.history?.slice(-10).map((h) => ({
      time: dayjs(h.createdAt).format("DD MMM"),
      tokens: h.totalTokens,
    })) || [];

  return (
    <>
      <Title level={3} style={{ marginTop: 40 }}>
        <RobotOutlined /> AI Token Usage
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Text type="secondary">Total Tokens Used</Text>
            <div style={{ fontSize: 28, fontWeight: 600 }}>
              {aiUsage?.totals?.totalTokens || 0}
            </div>
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Recent Activity">
            {chartData.length > 0 ? (
              <Column
                data={chartData}
                xField="time"
                yField="tokens"
                height={220}
              />
            ) : (
              <Empty description="No AI activity yet" />
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default UsageDashboard;
