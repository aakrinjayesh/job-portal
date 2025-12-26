import React from "react";
import { Row, Col, Card, Typography, Space, List, Tag } from "antd";
import { Column, Line, Pie, Bar } from "@ant-design/plots";

const { Title, Text } = Typography;

const Dashboard = () => {
  /* =========================
     Dummy Recruiter Data
  ========================== */

  // 1️⃣ Monthly job & candidate activity
  const monthlyActivityData = [
    { month: "Jan", category: "Jobs Posted", value: 12 },
    { month: "Jan", category: "Applications", value: 80 },
    { month: "Jan", category: "Shortlisted", value: 35 },

    { month: "Feb", category: "Jobs Posted", value: 18 },
    { month: "Feb", category: "Applications", value: 120 },
    { month: "Feb", category: "Shortlisted", value: 55 },

    { month: "Mar", category: "Jobs Posted", value: 25 },
    { month: "Mar", category: "Applications", value: 170 },
    { month: "Mar", category: "Shortlisted", value: 70 },
  ];

  // 2️⃣ Hiring funnel trend
  const funnelTrendData = [
    { stage: "Applied", value: 170 },
    { stage: "Shortlisted", value: 70 },
    { stage: "Interviewed", value: 45 },
    { stage: "Hired", value: 18 },
  ];

  // 3️⃣ Candidate status distribution
  const candidateStatusData = [
    { status: "Applied", value: 170 },
    { status: "Interview Scheduled", value: 45 },
    { status: "Offer Released", value: 22 },
    { status: "Rejected", value: 65 },
  ];

  // 4️⃣ Job-wise applications (NEW GRAPH)
  const jobWiseApplications = [
    { job: "Salesforce Developer", applications: 68 },
    { job: "Salesforce Administrator", applications: 52 },
    { job: "Salesforce Business Analyst", applications: 34 },
    { job: "Salesforce QA / Tester", applications: 26 },
  ];

  /* =========================
     Common Card Style
  ========================== */

  const cardStyle = {
    borderRadius: 12,
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
  };

  /* =========================
     Chart Configs
  ========================== */

  // Grouped column chart
  const groupedColumnConfig = {
    data: monthlyActivityData,
    xField: "month",
    yField: "value",
    colorField: "category",
    isGroup: true,
    columnStyle: { radius: [6, 6, 0, 0] },
    legend: { position: "top" },
    tooltip: {
      items: ["value"],
    },
    axis: {
      x: {
        title: "Month",
      },
      y: {
        title: "Total Count",
      },
    },
  };

  // Funnel line chart
  const lineConfig = {
    data: funnelTrendData,
    xField: "stage",
    yField: "value",
    smooth: true,
    point: { size: 5 },
    tooltip: {
      items: ["value"],
    },
    axis: {
      x: {
        title: "Hiring Stage",
      },
      y: {
        title: "Number of Candidates",
      },
    },
  };

  // Donut chart
  const pieConfig = {
    data: candidateStatusData,
    angleField: "value",
    colorField: "status",
    radius: 0.9,
    innerRadius: 0.6,
    tooltip: {
      items: ["value"],
    },
    label: {
      type: "inner",
      content: "{value}",
    },
    statistic: {
      title: false,
      content: { content: "Candidates" },
    },
  };

  // Job-wise applications bar chart (NEW)
  const barConfig = {
    data: jobWiseApplications,
    xField: "applications",
    yField: "job",
    colorField: "job",
    legend: false,
    barStyle: { radius: [0, 6, 6, 0] },
    tooltip: {
      items: ["applications"],
    },
    axis: {
      x: {
        title: "Total Applications",
      },
      y: {
        title: "Job Role",
      },
    },
  };

  /* =========================
     UI
  ========================== */

  return (
    <div style={{ padding: 24, background: "#f5f7fa", minHeight: "100vh" }}>
      {/* Header */}
      <Space direction="vertical" size={4} style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Recruiter Analytics Dashboard
        </Title>
        <Text type="secondary">
          High-level overview of hiring and candidate activity
        </Text>
      </Space>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card style={cardStyle}>
            <Text type="secondary">Total Jobs Posted</Text>
            <Title level={2}>25</Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={cardStyle}>
            <Text type="secondary">Total Applications</Text>
            <Title level={2}>170</Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={cardStyle}>
            <Text type="secondary">Candidates Hired</Text>
            <Title level={2}>18</Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={cardStyle}>
            <Text type="secondary">Active Recruiters</Text>
            <Title level={2}>4</Title>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={16}>
        <Col span={14}>
          <Card title="Monthly Hiring Activity" style={cardStyle}>
            <Column {...groupedColumnConfig} />
          </Card>
        </Col>

        <Col span={10}>
          <Card title="Candidate Status Distribution" style={cardStyle}>
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Hiring Funnel Trend" style={cardStyle}>
            <Line {...lineConfig} />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Job-wise Applications" style={cardStyle}>
            <Bar {...barConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
