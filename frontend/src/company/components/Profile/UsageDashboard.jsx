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
  Tooltip,
} from "antd";
import {
  CheckCircleFilled,
  WarningFilled,
  ClockCircleOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  FileTextOutlined,
  EyeOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { Column } from "@ant-design/plots";
import { getFeatureUsage, getAIUsage, getLicenseInfo } from "../../api/api";
import { useEffect, useState } from "react";

const { Title, Text, Paragraph } = Typography;

/* =============================
   FEATURE LABELS (UPDATED)
============================= */
const FEATURE_LABELS = {
  AI_TOKENS_TOTAL: "AI Tokens",
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
   FEATURE ICONS (UPDATED)
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
  AI_TOKENS_TOTAL: <RobotOutlined />,
};

const UsageDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [featureUsage, setFeatureUsage] = useState([]);
  const [aiUsage, setAIUsage] = useState(null);
  const [licenseInfo, setLicenseInfo] = useState(null);

  useEffect(() => {
    Promise.all([getFeatureUsage(), getAIUsage(), getLicenseInfo()])
      .then(([usageRes, aiRes, licenseRes]) => {
        setFeatureUsage(Array.isArray(usageRes?.usage) ? usageRes.usage : []);
        setAIUsage(aiRes);
        setLicenseInfo(licenseRes);
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

  /* =============================
     GROUP BY UNIQUE FEATURE
  ============================= */
  const groupedFeatures = Object.values(
    (featureUsage || []).reduce((acc, item) => {
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

  const getUsagePercent = (used, maxAllowed) => {
    if (maxAllowed === -1) return 0;
    return Math.round((used / maxAllowed) * 100);
  };

  const getUsageStatus = (percent, isUnlimited) => {
    if (isUnlimited) return { color: "#52c41a", text: "Unlimited" };
    if (percent >= 90) return { color: "#ff4d4f", text: "Critical" };
    if (percent >= 70) return { color: "#faad14", text: "Warning" };
    return { color: "#1677ff", text: "Healthy" };
  };

  const aiChartData =
    aiUsage?.history
      ?.slice(-10)
      .reverse()
      .map((h, idx) => ({
        time: `#${aiUsage.history.length - idx}`,
        tokens: h.totalTokens,
      })) || [];

  return (
    <div style={{ padding: 32, background: "#fafafa", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <Title level={2}>Usage Overview</Title>
        <Text type="secondary">
          Monitor your feature consumption and AI token usage
        </Text>

        {/* =============================
           FEATURE CARDS
        ============================= */}
        <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
          {groupedFeatures.map(({ feature, periods }) => {
            const primaryUsage =
              periods.find((p) => p.period === "MONTHLY") || periods[0];

            const isUnlimited = primaryUsage.maxAllowed === -1;
            const percent = getUsagePercent(
              primaryUsage.used,
              primaryUsage.maxAllowed,
            );

            const status = getUsageStatus(percent, isUnlimited);

            return (
              <Col xs={24} sm={12} lg={8} key={feature}>
                <Card bordered={false} style={{ borderRadius: 8 }}>
                  <Space
                    align="center"
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Space>
                      <div style={{ fontSize: 20 }}>
                        {FEATURE_ICONS[feature]}
                      </div>
                      <Text strong>{FEATURE_LABELS[feature] || feature}</Text>
                    </Space>
                    <Tag color={status.color}>{status.text}</Tag>
                  </Space>

                  {isUnlimited ? (
                    <div style={{ textAlign: "center", padding: 24 }}>
                      <div style={{ fontSize: 36, color: "#52c41a" }}>∞</div>
                      <Text type="secondary">Unlimited usage</Text>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginTop: 16 }}>
                        <Text style={{ fontSize: 26, fontWeight: 600 }}>
                          {primaryUsage.used}
                        </Text>
                        <Text type="secondary">
                          {" "}
                          / {primaryUsage.maxAllowed}
                        </Text>
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
                        {primaryUsage.remaining} remaining
                      </Text>
                    </>
                  )}

                  {/* Period Breakdown */}
                  {periods.length > 1 && (
                    <div
                      style={{
                        marginTop: 16,
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
                          }}
                        >
                          <Tag>{item.period}</Tag>
                          <Text>
                            {item.used} /{" "}
                            {item.maxAllowed === -1 ? "∞" : item.maxAllowed}
                          </Text>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* =============================
           AI TOKEN SECTION
        ============================= */}
        {aiUsage && (
          <>
            <Title level={3} style={{ marginTop: 40 }}>
              <RobotOutlined /> AI Token Usage
            </Title>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card>
                  <Text type="secondary">Total Tokens</Text>
                  <div style={{ fontSize: 28, fontWeight: 600 }}>
                    {aiUsage.totals.totalTokens}
                  </div>
                </Card>
              </Col>

              <Col xs={24}>
                <Card title="Recent Activity">
                  {aiChartData.length > 0 ? (
                    <Column
                      data={aiChartData}
                      xField="time"
                      yField="tokens"
                      height={200}
                    />
                  ) : (
                    <Empty description="No AI activity yet" />
                  )}
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </div>
  );
};

export default UsageDashboard;
