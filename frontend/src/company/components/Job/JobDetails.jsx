import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Spin,
  Divider,
  message,
} from "antd";
import axios from "axios";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { GetJobDetails } from "../../api/api";

const { Title, Text, Paragraph } = Typography;

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const payload = { jobid: id };
      const response = await GetJobDetails(payload);
      setJob(response?.job);
    } catch (error) {
      message.error("Failed to load job details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCandidates = () => {
    navigate("/company/candidates", { state: { id } });
  };

  if (loading) return <Spin size="large" style={{ marginTop: 100 }} />;

  if (!job) return <Text type="danger">Job not found</Text>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <Button
        type="link"
        onClick={() => navigate("/company/jobs")}
        icon={<ArrowLeftOutlined />}
      >
        Back
      </Button>

      <Card
        style={{ borderRadius: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
      >
        <Title level={3}>
          {job.role}{" "}
          <Button
            type="primary"
            onClick={handleViewCandidates}
            style={{ float: "right" }}
          >
            View Candidates
          </Button>
        </Title>

        <Text strong>{job.companyName}</Text>

        <Space style={{ display: "block", marginTop: 8 }}>
          <EnvironmentOutlined /> <Text>{job.location}</Text>
        </Space>

        <Divider />

        <Paragraph>
          <Text strong>Description:</Text> <br />
          {job.description}
        </Paragraph>

        <Paragraph>
          <Text strong>Employment Type:</Text> {job.employmentType}
        </Paragraph>

        <Paragraph>
          <Text strong>Experience Required:</Text> {job.experience}
        </Paragraph>

        <Paragraph>
          <Text strong>Salary:</Text> ₹{job.salary}
        </Paragraph>

        <Paragraph>
          <Text strong>Job Type:</Text> {job.jobType}
        </Paragraph>

        <Paragraph>
          <Text strong>Status:</Text> {job.status}
        </Paragraph>

        <Divider />

        <Text strong>Skills Required:</Text>
        <div style={{ marginTop: 8 }}>
          {job.skills?.map((skill, idx) => (
            <Tag color="blue" key={idx}>
              {skill}
            </Tag>
          ))}
        </div>

        <Divider />
      </Card>
    </div>
  );
};

export default JobDetails;
