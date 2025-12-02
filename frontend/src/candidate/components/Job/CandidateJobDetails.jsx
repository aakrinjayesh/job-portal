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
  const type = location?.state?.type;
  const jobids = location?.state?.jobids;
  const [ApplyLoading, setApplyLoading] = useState(false);
  const [messageAPI, contextHolder] = message.useMessage();
  const [isApplied, setIsApplied] = useState(false);

  console.log("jobsids", jobids);
  console.log("type", type);

  useEffect(() => {
    fetchJobDetails();
    // 2. Check if already applied based on passed history
    if (jobids && jobids.includes(id)) {
      console.log("is applied true");
      setIsApplied(true);
    } else {
      console.log("isapplied false");
    }
  }, [id, jobids]);

  const fetchJobDetails = async () => {
    try {
      const payload = { jobid: id };
      const response = await GetJobDetails(payload);
      setJob(response?.job);
    } catch (error) {
      messageAPI.error("Failed to load job details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin size="large" style={{ marginTop: 100 }} />;

  if (!job) return <Text type="danger">Job not found</Text>;

  const handleApply = async () => {
    console.log("apply button clicked");
    setApplyLoading(true);
    try {
      const payload = {
        jobId: id,
      };
      console.log("payload", payload);
      const resp = await ApplyJob(payload);
      if (resp.status === "success") {
        setIsApplied(true);
        messageAPI.success(resp.message || "Successfully applied");
      } else {
        messageAPI.error(resp.message || "Failed to apply Job");
      }
      console.log("apply job response:", resp);
    } catch (error) {
      console.log("error at apply", error);
      message.error("Failed to apply for the job");
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      {contextHolder}
      <Button
        type="text"
        style={{ marginBottom: 5 }}
        onClick={() =>
          navigate(
            // type === "save" ? "/candidate/jobs/saved" : "/candidate/jobs"
            type === "save"
              ? "/candidate/jobs/saved"
              : type === "apply"
              ? "/candidate/jobs/applied"
              : "/candidate/jobs"
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
          <Text strong>Experience Required:</Text> 
          {job.experience && (
                    <Text>
                      {job.experience.number} {job.experience.type}
                    </Text>
                  )}
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
          loading={ApplyLoading}
          disabled={isApplied || type === "apply"}
        >
          {isApplied || type === "apply" ? "Applied" : "Apply Now"}
        </Button>
      </Card>
    </div>
  );
};

export default CandidateJobDetails;
