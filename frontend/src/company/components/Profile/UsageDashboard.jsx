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
import { Column, Tiny } from "@ant-design/plots";
import { getFeatureUsage, getAIUsage, getLicenseInfo } from "../../api/api";
import { useEffect, useState } from "react";

const { Title, Text, Paragraph } = Typography;

const FEATURE_LABELS = {
  AI_TOKENS_TOTAL: "AI Tokens",
  FIT_SCORE_ANALYSES: "Fit Score",
  JOB_POST_CREATION: "Job Posts",
  CANDIDATE_DETAILS_VIEW: "Candidate Views",
};

const FEATURE_ICONS = {
  JOB_POST_CREATION: <FileTextOutlined />,
  CANDIDATE_DETAILS_VIEW: <EyeOutlined />,
  JOB_APPLICATIONS: <TeamOutlined />,
  AI_TOKENS_TOTAL: <RobotOutlined />,
  TEAM_MEMBERS: <TeamOutlined />,
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

  // Group features by type (not by period)
  const groupedFeatures = (featureUsage || []).reduce((acc, usage) => {
    if (!acc[usage.feature]) {
      acc[usage.feature] = [];
    }
    acc[usage.feature].push(usage);
    return acc;
  }, {});

  // Calculate usage percentage
  const getUsagePercent = (used, maxAllowed) => {
    if (maxAllowed === -1) return 0;
    return Math.round((used / maxAllowed) * 100);
  };

  // Get status color and icon
  const getUsageStatus = (percent, isUnlimited) => {
    if (isUnlimited)
      return {
        color: "#52c41a",
        icon: <CheckCircleFilled />,
        text: "Unlimited",
      };
    if (percent >= 90)
      return { color: "#ff4d4f", icon: <WarningFilled />, text: "Critical" };
    if (percent >= 70)
      return {
        color: "#faad14",
        icon: <ClockCircleOutlined />,
        text: "Warning",
      };
    return { color: "#1677ff", icon: <CheckCircleFilled />, text: "Healthy" };
  };

  // Prepare AI usage chart data
  const aiChartData =
    aiUsage?.history
      ?.slice(-10)
      .reverse()
      .map((h, idx) => ({
        time: `#${aiUsage.history.length - idx}`,
        tokens: h.totalTokens,
        type: "Total",
      })) || [];

  return (
    <div
      style={{
        padding: "32px 24px",
        background: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Usage Overview
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Monitor your feature consumption and AI token usage
          </Text>
        </div>

        {/* Feature Usage Cards - Cleaner Grid */}
        <Row gutter={[16, 16]} style={{ marginBottom: 40 }}>
          {Object.entries(groupedFeatures).map(([featureKey, usageItems]) => {
            // Find the most restrictive limit (used for overall status)
            const primaryUsage =
              usageItems.find((u) => u.period === "MONTHLY") || usageItems[0];
            const isUnlimited = primaryUsage.maxAllowed === -1;
            const percent = getUsagePercent(
              primaryUsage.used,
              primaryUsage.maxAllowed,
            );
            const status = getUsageStatus(percent, isUnlimited);

            return (
              <Col xs={24} sm={12} lg={8} key={featureKey}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 8,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    height: "100%",
                  }}
                  bodyStyle={{ padding: 20 }}
                >
                  {/* Header */}
                  <div style={{ marginBottom: 16 }}>
                    <Space
                      align="center"
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Space>
                        <div style={{ fontSize: 20, color: "#666" }}>
                          {FEATURE_ICONS[featureKey]}
                        </div>
                        <Text strong style={{ fontSize: 15 }}>
                          {FEATURE_LABELS[featureKey]}
                        </Text>
                      </Space>
                      <Tag
                        color={status.color}
                        style={{ borderRadius: 4, border: "none" }}
                      >
                        {status.text}
                      </Tag>
                    </Space>
                  </div>

                  {/* Main Metric */}
                  {isUnlimited ? (
                    <div style={{ textAlign: "center", padding: "24px 0" }}>
                      <div
                        style={{
                          fontSize: 36,
                          color: "#52c41a",
                          marginBottom: 8,
                        }}
                      >
                        ∞
                      </div>
                      <Text type="secondary">Unlimited usage</Text>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: 12 }}>
                        <Space size={4}>
                          <Text
                            style={{
                              fontSize: 28,
                              fontWeight: 600,
                              color: "#262626",
                            }}
                          >
                            {primaryUsage.used.toLocaleString()}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 14 }}>
                            / {primaryUsage.maxAllowed.toLocaleString()}
                          </Text>
                        </Space>
                      </div>

                      {/* Mini Progress Bar */}
                      <div
                        style={{
                          width: "100%",
                          height: 6,
                          background: "#f0f0f0",
                          borderRadius: 3,
                          overflow: "hidden",
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(percent, 100)}%`,
                            height: "100%",
                            background: status.color,
                            borderRadius: 3,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>

                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {primaryUsage.remaining.toLocaleString()} remaining
                      </Text>
                    </>
                  )}

                  {/* Period Breakdown */}
                  {usageItems.length > 1 && (
                    <div
                      style={{
                        marginTop: 16,
                        paddingTop: 16,
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      <Space
                        direction="vertical"
                        size={8}
                        style={{ width: "100%" }}
                      >
                        {usageItems.map((item) => (
                          <div
                            key={`${item.feature}-${item.period}`}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Space size={6}>
                              <Tag
                                style={{
                                  fontSize: 11,
                                  padding: "0 6px",
                                  margin: 0,
                                  border: "none",
                                }}
                                color={
                                  item.period === "DAILY" ? "blue" : "purple"
                                }
                              >
                                {item.period}
                              </Tag>
                              <Text style={{ fontSize: 12, color: "#666" }}>
                                {item.used} /{" "}
                                {item.maxAllowed === -1 ? "∞" : item.maxAllowed}
                              </Text>
                            </Space>
                            {item.maxAllowed !== -1 && (
                              <Text style={{ fontSize: 11, color: "#999" }}>
                                {getUsagePercent(item.used, item.maxAllowed)}%
                              </Text>
                            )}
                          </div>
                        ))}
                      </Space>
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* License Overview */}
        {licenseInfo && (
          <>
            <Title level={3} style={{ marginBottom: 24 }}>
              <TeamOutlined style={{ marginRight: 8 }} />
              License Overview
            </Title>

            <Row gutter={[16, 16]} style={{ marginBottom: 40 }}>
              <Col xs={24} md={6}>
                <Card bordered={false} style={{ borderRadius: 8 }}>
                  <Text type="secondary">Total Licenses</Text>
                  <div style={{ fontSize: 28, fontWeight: 600 }}>
                    {licenseInfo.totalLicenses}
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={6}>
                <Card bordered={false} style={{ borderRadius: 8 }}>
                  <Text type="secondary">Assigned</Text>
                  <div
                    style={{ fontSize: 28, fontWeight: 600, color: "#1677ff" }}
                  >
                    {licenseInfo.assignedLicenses}
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={6}>
                <Card bordered={false} style={{ borderRadius: 8 }}>
                  <Text type="secondary">Unassigned</Text>
                  <div
                    style={{ fontSize: 28, fontWeight: 600, color: "#faad14" }}
                  >
                    {licenseInfo.unassignedLicenses}
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={6}>
                <Card bordered={false} style={{ borderRadius: 8 }}>
                  <Text type="secondary">Active</Text>
                  <div
                    style={{ fontSize: 28, fontWeight: 600, color: "#52c41a" }}
                  >
                    {licenseInfo.activeLicenses}
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Assigned License Details */}
            {licenseInfo.licenses?.length > 0 && (
              <Card
                bordered={false}
                style={{ marginBottom: 40, borderRadius: 8 }}
                title="Assigned License Details"
              >
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {licenseInfo.licenses
                    .filter((l) => l.assignedTo)
                    .map((license) => (
                      <div
                        key={license.licenseId}
                        style={{
                          padding: "12px 16px",
                          background: "#fafafa",
                          borderRadius: 6,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <Text strong>{license.assignedTo.name}</Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {license.assignedTo.email}
                            </Text>
                          </div>
                        </div>

                        <Tag color={license.isActive ? "green" : "red"}>
                          {license.planTier}
                        </Tag>
                      </div>
                    ))}
                </Space>
              </Card>
            )}
          </>
        )}

        {/* AI Usage Section */}
        {aiUsage && (
          <>
            <Title level={3} style={{ marginBottom: 24, marginTop: 16 }}>
              <RobotOutlined style={{ marginRight: 8 }} />
              AI Token Usage
            </Title>

            <Row gutter={[16, 16]}>
              {/* Summary Cards */}
              <Col xs={24} md={8}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 8,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                  }}
                >
                  <div
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      marginBottom: 8,
                      fontSize: 14,
                    }}
                  >
                    Total Tokens
                  </div>
                  <div
                    style={{ fontSize: 32, fontWeight: 600, color: "white" }}
                  >
                    {aiUsage.totals.totalTokens.toLocaleString()}
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 8,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ color: "#666", marginBottom: 8, fontSize: 14 }}>
                    Input Tokens
                  </div>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 600,
                      color: "#1677ff",
                      marginBottom: 8,
                    }}
                  >
                    {aiUsage.totals.inputTokens.toLocaleString()}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {Math.round(
                      (aiUsage.totals.inputTokens /
                        aiUsage.totals.totalTokens) *
                        100,
                    )}
                    % of total
                  </Text>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 8,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ color: "#666", marginBottom: 8, fontSize: 14 }}>
                    Output Tokens
                  </div>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 600,
                      color: "#52c41a",
                      marginBottom: 8,
                    }}
                  >
                    {aiUsage.totals.outputTokens.toLocaleString()}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {Math.round(
                      (aiUsage.totals.outputTokens /
                        aiUsage.totals.totalTokens) *
                        100,
                    )}
                    % of total
                  </Text>
                </Card>
              </Col>

              {/* Activity Chart */}
              <Col xs={24}>
                <Card
                  bordered={false}
                  title={
                    <Space>
                      <ThunderboltOutlined />
                      <span>Recent Activity</span>
                    </Space>
                  }
                  style={{
                    borderRadius: 8,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  {aiUsage.history && aiUsage.history.length > 0 ? (
                    <Column
                      data={aiChartData}
                      xField="time"
                      yField="tokens"
                      seriesField="type"
                      color={["#1677ff"]}
                      columnStyle={{
                        radius: [4, 4, 0, 0],
                      }}
                      yAxis={{
                        label: {
                          formatter: (v) => `${Number(v).toLocaleString()}`,
                        },
                      }}
                      tooltip={{
                        formatter: (datum) => {
                          return {
                            name: "Tokens",
                            value: datum.tokens.toLocaleString(),
                          };
                        },
                      }}
                      height={200}
                      animation={{
                        appear: {
                          animation: "scale-in-y",
                          duration: 500,
                        },
                      }}
                    />
                  ) : (
                    <Empty
                      description="No AI activity yet"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}

                  {/* Recent Activity List */}
                  {aiUsage.history && aiUsage.history.length > 0 && (
                    <div
                      style={{
                        marginTop: 24,
                        paddingTop: 24,
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 13,
                          marginBottom: 12,
                          display: "block",
                        }}
                      >
                        Latest 5 Activities
                      </Text>
                      <Space
                        direction="vertical"
                        size={12}
                        style={{ width: "100%" }}
                      >
                        {aiUsage.history.slice(0, 5).map((h) => (
                          <div
                            key={h.id}
                            style={{
                              padding: "12px 16px",
                              background: "#fafafa",
                              borderRadius: 6,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <Text strong style={{ fontSize: 13 }}>
                                {h.featureUsed || "AI Feature"}
                              </Text>
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {new Date(h.createdAt).toLocaleString()}
                                </Text>
                              </div>
                            </div>
                            <Tooltip
                              title={`Input: ${h.inputTokens} • Output: ${h.outputTokens}`}
                            >
                              <Tag color="blue" style={{ margin: 0 }}>
                                {h.totalTokens.toLocaleString()} tokens
                              </Tag>
                            </Tooltip>
                          </div>
                        ))}
                      </Space>
                    </div>
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
