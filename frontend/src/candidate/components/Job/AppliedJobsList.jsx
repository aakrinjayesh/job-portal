import React from "react";
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Row,
  Col,
  Tooltip,
  Divider,
  Empty,
} from "antd";
import {
  StarFilled,
  EnvironmentOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text, Title, Paragraph } = Typography;

const AppliedJobsList = ({ applications, lastJobRef }) => {
  const navigate = useNavigate();

  const handleCardClick = (jobId) => {
    navigate(`/candidate/job/${jobId}`, { state: { type: "apply" } });
  };

  return (
    <Row gutter={[16, 16]}>
      {applications?.length === 0 && (
        <Col span={24}>
          <Empty description="No applications found" />
        </Col>
      )}
      {/* {applications?.map((app) => {
        const job = app?.job;
        return (
          <Col xs={24} key={app?.id}>
            <Card
              hoverable
              onClick={() => handleCardClick(job?.id)}
              style={{
                borderRadius: 12,
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            > */}

      {applications?.map((app, index) => {
        const job = app?.job;
        const isLast = index === applications.length - 1;

        return (
          <Col
            xs={24}
            key={app?.id}
            ref={isLast ? lastJobRef : null} // 👈 ADD REF HERE
          >
            <Card
              hoverable
              onClick={() => handleCardClick(job?.id)}
              style={{
                borderRadius: 12,
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              {/* --- REST OF YOUR CARD CODE UNCHANGED --- */}

              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  {job?.role}
                </Title>
                <Tag
                  color={
                    app?.status === "Pending"
                      ? "orange"
                      : app?.status === "Accepted"
                      ? "green"
                      : app?.status === "Rejected"
                      ? "red"
                      : "blue"
                  }
                  style={{
                    fontWeight: 500,
                    borderRadius: 20,
                    padding: "2px 10px",
                  }}
                >
                  {app?.status}
                </Tag>
              </div>

              {/* Company and location */}
              <Space style={{ marginTop: 6 }}>
                <Text strong style={{ color: "#1890ff" }}>
                  {job?.companyName}
                </Text>
                <Divider type="vertical" />
                <Space>
                  <EnvironmentOutlined />
                  <Tooltip title={job?.location}>
                    <Text>{job?.location}</Text>
                  </Tooltip>
                </Space>
              </Space>

              {/* Experience and salary */}
              <div style={{ marginTop: 10 }}>
                <Space split={<Divider type="vertical" />} wrap>
                  <Text>
                    {job?.experience?.number} {job?.experience?.type}
                  </Text>
                  {job?.salary && <Text>₹ {job?.salary} Lacs PA</Text>}
                  {job?.employmentType && <Text>{job?.employmentType}</Text>}
                </Space>
              </div>

              {/* Description */}
              {job?.description && (
                <Space align="start" style={{ marginTop: 12 }}>
                  <FileTextOutlined style={{ marginTop: 4 }} />
                  <Paragraph
                    type="secondary"
                    ellipsis={{
                      rows: 2,
                      expandable: true,
                      symbol: "more",
                    }}
                    style={{ margin: 0 }}
                  >
                    {job.description}
                  </Paragraph>
                </Space>
              )}

              {/* Skills */}
              {job?.skills?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  {job.skills.map((skill, i) => (
                    <Tag key={i} color="blue" style={{ borderRadius: 20 }}>
                      {skill}
                    </Tag>
                  ))}
                </div>
              )}

              {/* Applied Info */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 14,
                }}
              >
                <Space>
                  <ClockCircleOutlined style={{ color: "#999" }} />
                  <Text type="secondary">
                    Applied {dayjs(app?.appliedAt).fromNow()} (
                    {dayjs(app?.appliedAt).format("MMM D, YYYY")})
                  </Text>
                </Space>
                <Button
                  type="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(job?.id);
                  }}
                >
                  View Job
                </Button>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default AppliedJobsList;
