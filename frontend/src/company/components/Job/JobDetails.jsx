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
import { ArrowLeftOutlined, EnvironmentOutlined, DownOutlined, RightOutlined} from "@ant-design/icons";
import { GetJobDetails } from "../../api/api";
import { useLocation } from "react-router-dom";
import ApplyBenchJob from "../../pages/ApplyBenchJob";

const { Title, Text, Paragraph } = Typography;

const JobDetails = () => {
  // const { id } = useParams();
  const navigate = useNavigate();
  // const [job, setJob] = useState(null);
  const [showSkills, setShowSkills] = useState(false);
const [showClouds, setShowClouds] = useState(false);

  const [loading, setLoading] = useState(true);

  // const location = useLocation();

  const location = useLocation();
const job = location.state?.job; // ← GET jobId from navigation
const from = location.state?.from; 


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
  style={{
    borderRadius: 14,
    border: "1px solid #f0f0f0",
    boxShadow: "none",
    padding: 24,
  }}
>
  {/* ===== HEADER ===== */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    }}
  >
    <div>
      <Title level={4} style={{ marginBottom: 0 }}>
        {job.role}
      </Title>
      <Text type="secondary">{job.companyName}</Text>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Tag
        color={job.status === "Closed" ? "error" : "success"}
        style={{
          borderRadius: 20,
          padding: "2px 12px",
          fontSize: 12,
        }}
      >
        {job.status}
      </Tag>

    </div>
  </div>

  {/* ===== DETAILS GRID ===== */}
  <Divider style={{ margin: "16px 0" }} />

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 20,
    }}
  >
    <div>
      <Text strong>Employment Type</Text>
      <div>{job.employmentType}</div>
    </div>

    <div>
      <Text strong>Experience Required</Text>
      <div>
        {job.experience?.number} {job.experience?.type}
      </div>
    </div>

    <div>
      <Text strong>Salary</Text>
      <div>₹ {job.salary} LPA</div>
    </div>

    <div>
      <Text strong>Location</Text>
      <div>{job.location}</div>
    </div>

    <div>
      <Text strong>Job Type</Text>
      <div>{job.jobType}</div>
    </div>

    <div>
      <Text strong>Work Shift</Text>
      <div>{job.workShift || "Morning Shift"}</div>
    </div>

   <div>
     <div>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Text strong>Clouds</Text>
  </div>

 {showClouds && (
  <div
    style={{
      marginTop: 8,
      display: "flex",
      flexWrap: "nowrap",
      gap: 8,
      overflowX: "auto",
      whiteSpace: "nowrap",
    }}
  >
    {job.clouds?.map((cloud, i) => (
      <Tag
        key={i}
        style={{
          background: "#E7F0FE",
          borderRadius: 100,
          border: "1px solid #1677FF",
          flexShrink: 0, // 🔑 prevents shrinking
        }}
      >
        {cloud}
      </Tag>
    ))}
  </div>
)}


  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Text strong>Skills</Text>
  </div>

  {showClouds && (
  <div
    style={{
      marginTop: 8,
      display: "flex",
      flexWrap: "nowrap",
      gap: 8,
      overflowX: "auto",
      whiteSpace: "nowrap",
    }}
  >
      {job.skills?.map((skill, i) => (
        <Tag
          key={i}
          style={{
            background: "#FBEBFF",
            borderRadius: 100,
            border: "1px solid #800080",
            marginBottom: 6,
          }}
        >
          {skill}
        </Tag>
      ))}
    </div>
  )}
</div>
</div>
 </div>

    {/* ===== DESCRIPTION ===== */}
  <Divider style={{ margin: "16px 0" }} />

  <Text strong>Description</Text>
  <Paragraph style={{ marginTop: 6, color: "#555" }}>
    {job.description}
  </Paragraph>
</Card>

      {/* <ApplyBenchJob jobId={id} /> */}
      
  <ApplyBenchJob jobId={job?.id} />


    </div>
  );
};

export default JobDetails;
