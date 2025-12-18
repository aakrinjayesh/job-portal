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
import { useLocation } from "react-router-dom";
import ApplyBenchJob from "../../pages/ApplyBenchJob";

const { Title, Text, Paragraph } = Typography;

const JobDetails = () => {
  // const { id } = useParams();
  const navigate = useNavigate();
  // const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // const location = useLocation();

  const location = useLocation();
const job = location.state?.job; // ← GET jobId from navigation


  const type = location?.state?.type;
  const portal = location?.state?.portal;
  // console.log("location objects", location);
  console.log("type in compant jobdetails", type);
  console.log("portal", portal);

  // useEffect(() => {
  //   fetchJobDetails();
  // }, [id]);

useEffect(() => {
  if (job) {
    setLoading(false);   // job came from card → no API call
  } else {
    fetchJobDetails();   // only call API if user directly opens URL
  }
}, []);



  // const fetchJobDetails = async () => {
  //   try {
  //     const payload = { jobid: id };
  //     // const response = await GetJobDetails(payload);
  //     setJob(response?.job);
  //   } catch (error) {
  //     message.error("Failed to load job details");
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchJobDetails = async () => {
  try {
    const jobId = location.state?.jobId;
    if (!jobId) return; // no api

    const payload = { jobid: jobId };
    const response = await GetJobDetails(payload);
    setJob(response?.job);
  } catch (error) {
    message.error("Failed to load job details");
  } finally {
    setLoading(false);
  }
};


  const handleViewCandidates = () => {
    navigate("/company/candidates", { state: { id } });
  };

  const handleBackButton = () => {
    if (type === "save") {
      navigate("/company/jobs/saved");
    } else if (type === "find") {
      navigate("/company/job/find");
    } else {
      navigate("/company/jobs");
    }
  };

  if (loading) return <Spin size="large" style={{ marginTop: 100 }} />;

  if (!job) return <Text type="danger">Job not found</Text>;

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto", padding: 24 }}>
      <Button
        type="text"
        style={{ marginBottom: 5 }}
        onClick={handleBackButton}
        icon={<ArrowLeftOutlined />}
      >
        Back
      </Button>

      <Card
        style={{ borderRadius: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
      >
        <Title level={3}>
          {job.role}{" "}
          {/* <Button
            type="primary"
            onClick={handleViewCandidates}
            style={{ float: "right" }}
          >
            View Candidates
          </Button> */}
        </Title>

        <Text strong>{job.companyName}</Text>

        <Space style={{ display: "block", marginTop: 8 }}>
          <EnvironmentOutlined /> <Text>{job.location}</Text>
        </Space>

        <Divider />

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

        <Paragraph>
          <Text strong>Description:</Text> <br />
          {job.description}
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

        <Text strong>Clouds Required:</Text>
        <div style={{ marginTop: 8 }}>
          {job.clouds?.map((cloud, idx) => (
            <Tag color="blue" key={idx}>
              {cloud}
            </Tag>
          ))}
        </div>

        <Divider />
      </Card>
      {/* <ApplyBenchJob jobId={id} /> */}
      <ApplyBenchJob jobId={job?.id} />

    </div>
  );
};

export default JobDetails;
