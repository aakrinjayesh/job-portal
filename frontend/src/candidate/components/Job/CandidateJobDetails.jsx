import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import { ApplyJob, GetJobDetails } from "../../../candidate/api/api";

const { Title, Text, Paragraph } = Typography;

const CandidateJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { type, jobids } = location.state;

  console.log("jobsids", jobids);
  console.log("type", type);

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

  if (loading) return <Spin size="large" style={{ marginTop: 100 }} />;

  if (!job) return <Text type="danger">Job not found</Text>;

  const handleApply = async () => {
    console.log("apply button clicked");
    try {
      const payload = {
        jobId: id,
      };
      console.log("payload", payload);
      const resp = await ApplyJob(payload);
      if (resp.status === "success") {
        message.success(resp.message);
      } else if (resp.status === "failed") {
        message.error(resp.messages);
      }
      console.log("apply job response:", resp);

      if (resp?.status === "success" || resp?.success) {
        message.success(resp?.message || "Application submitted!");
      } else {
        message.error(resp?.message || "Something went wrong");
      }
    } catch (error) {
      console.log("error at apply", error);
      message.error("Failed to apply for the job");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <Button
        type="link"
        onClick={() =>
          navigate(
            type === "save" ? "/candidate/jobs/saved" : "/candidate/jobs"
          )
        }
        icon={<ArrowLeftOutlined />}
      >
        Back
      </Button>

      <Card
        style={{ borderRadius: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
      >
        <Title level={3}>{job.role}</Title>
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

        <Button
          type="primary"
          onClick={handleApply}
          disabled={jobids?.includes(id)}
        >
          {jobids?.includes(id) ? "Already Applied" : "Apply Now"}
        </Button>
      </Card>
    </div>
  );
};

export default CandidateJobDetails;
