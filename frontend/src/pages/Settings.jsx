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
} from "antd";
import {
  StarFilled,
  EnvironmentOutlined,
  CloudOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

// Sample dynamic job data
const jobListings = [
  {
    id: 1,
    title: "Salesforce Senior Success Guide (AMER/EMEA shift)",
    company: "Salesforce",
    rating: 4.0,
    reviews: 1057,
    experience: "6-10 Yrs",
    location: "Hybrid - Hyderabad...",
    description:
      "Minimum 5 years of development experience in the Salesforce ecosystem a...",
    skills: [
      "Salesforce Sales Cloud",
      "Salesforce Ecosystem",
      "Salesforce Cloud",
      "Salesforce Service",
    ],
    posted: "2 days ago",
  },
  {
    id: 1,
    title: "Salesforce Senior Success Guide (AMER/EMEA shift)",
    company: "Salesforce",
    rating: 4.0,
    reviews: 1057,
    experience: "6-10 Yrs",
    location: "Hybrid - Hyderabad...",
    description:
      "Minimum 5 years of development experience in the Salesforce ecosystem a...",
    skills: [
      "Salesforce Sales Cloud",
      "Salesforce Ecosystem",
      "Salesforce Cloud",
      "Salesforce Service",
    ],
    posted: "2 days ago",
  },
  {
    id: 1,
    title: "Salesforce Senior Success Guide (AMER/EMEA shift)",
    company: "Salesforce",
    rating: 4.0,
    reviews: 1057,
    experience: "6-10 Yrs",
    location: "Hybrid - Hyderabad...",
    description:
      "Minimum 5 years of development experience in the Salesforce ecosystem a...",
    skills: [
      "Salesforce Sales Cloud",
      "Salesforce Ecosystem",
      "Salesforce Cloud",
      "Salesforce Service",
    ],
    posted: "2 days ago",
  },
  {
    id: 1,
    title: "Salesforce Senior Success Guide (AMER/EMEA shift)",
    company: "Salesforce",
    rating: 4.0,
    reviews: 1057,
    experience: "6-10 Yrs",
    location: "Hybrid - Hyderabad...",
    description:
      "Minimum 5 years of development experience in the Salesforce ecosystem a...",
    skills: [
      "Salesforce Sales Cloud",
      "Salesforce Ecosystem",
      "Salesforce Cloud",
      "Salesforce Service",
    ],
    posted: "2 days ago",
  },
];

const Seetings = () => {
  return (
    <Row gutter={[16, 16]}>
      {jobListings.map((job) => (
        <Col span={24} key={job.id}>
          <Card
            variant="outlined"
            style={{
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* Header: Title + Cloud icon */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <Title level={5} style={{ margin: 0 }}>
                {job.title}
              </Title>
              <CloudOutlined
                style={{
                  fontSize: 28,
                  color: "#1890ff",
                  border: "1px solid black",
                }}
              />
            </div>

            {/* Company Info */}
            <Space align="center" style={{ marginTop: 6 }}>
              <Text strong style={{ color: "#1890ff" }}>
                {job.company}
              </Text>
              <StarFilled style={{ color: "#faad14" }} />
              <Text>{job.rating}</Text>
              <Text type="secondary">{`${job.reviews} Reviews`}</Text>
            </Space>

            {/* Job Details Row — moved to next line */}
            <div style={{ marginTop: 12 }}>
              <Space
                split={<Divider type="vertical" />}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                <Space>
                  <Text>{job.experience}</Text>
                </Space>
                <Space>
                  <EnvironmentOutlined />
                  <Tooltip title={job.location}>
                    <Text>{job.location}</Text>
                  </Tooltip>
                </Space>
              </Space>
            </div>

            {/* Description */}
            <Space align="start" style={{ marginTop: 12 }}>
              <FileTextOutlined style={{ marginTop: 4 }} />
              <Text type="secondary">{job.description}</Text>
            </Space>

            {/* Skills Tags */}
            <div style={{ marginTop: 12 }}>
              {job.skills.map((skill, index) => (
                <Tag color="blue" id={index} style={{ borderRadius: 20 }}>
                  {skill}
                </Tag>
              ))}
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <Text type="secondary">{job.posted}</Text>
              <Button type="text" style={{ color: "#1890ff" }}>
                Save
              </Button>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default Seetings;
