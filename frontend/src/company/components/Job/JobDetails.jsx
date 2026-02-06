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
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { GetJobDetails } from "../../api/api";
import { useLocation } from "react-router-dom";
import ApplyBenchJob from "../../pages/ApplyBenchJob";

const { Title, Text, Paragraph } = Typography;

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const type = location?.state?.type;
  const portal = location?.state?.portal;
  const source = location?.state?.source;
  const count = location?.state?.count;

  console.log("type in compant jobdetails", type);
  console.log("portal", portal);

  useEffect(() => {
    fetchJobDetails();
  }, []);

  const fetchJobDetails = async () => {
    try {
      const payload = { jobid: id };
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

  if (loading) return <Spin size="large" style={{ marginTop: 100 }} />;

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto", padding: 24 }}>
      <Card
        style={{
          borderRadius: 14,
          border: "1px solid #f0f0f0",
          boxShadow: "none",
          // padding: 24,
        }}
      >
        {/* ===== HEADER ===== */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* LEFT SIDE */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt="logo"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  objectFit: "cover",
                  border: "1px solid #E5E7EB",
                }}
              />
            ) : (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #1677FF, #69B1FF)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#FFFFFF",
                }}
              >
                {(job.companyName || job.role || "").charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <Title level={4} style={{ marginBottom: 0 }}>
                {job.role}
              </Title>
              <Text type="secondary">{job.companyName}</Text>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {source === "jobs" && (
              <Button
                style={{
                  background: "#D1E4FF",
                  borderRadius: 100,
                  fontWeight: 600,
                }}
                onClick={handleViewCandidates}
              >
                View Candidates ({count || 0})
              </Button>
            )}

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
        </div>
        <Divider style={{ margin: "16px 0" }} />

        {/* ===== CLOUDS ===== */}
        <Text strong>Clouds:</Text>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {job.clouds?.map((cloud, i) => (
            <Tag
              key={i}
              style={{
                background: "#E7F0FE",
                borderRadius: 100,
                border: "1px solid #1677FF",
              }}
            >
              {cloud}
            </Tag>
          ))}
        </div>

        <Divider style={{ margin: "16px 0" }} />

        {/* ===== SKILLS ===== */}
        <Text strong>Skills:</Text>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {job.skills?.map((skill, i) => (
            <Tag
              key={i}
              style={{
                background: "#FBEBFF",
                borderRadius: 100,
                border: "1px solid #800080",
              }}
            >
              {skill}
            </Tag>
          ))}
        </div>

        {/* ===== DESCRIPTION ===== */}
        <Divider style={{ margin: "16px 0" }} />

        <Text strong>Description</Text>
        <Paragraph style={{ marginTop: 6, color: "#555" }}>
          {job.description}
        </Paragraph>
        {/* ===== RESPONSIBILITIES ===== */}
        <Divider style={{ margin: "16px 0" }} />

        <Text strong>Roles & Responsibilities</Text>

        <div style={{ marginTop: 8 }}>
          {job.responsibilities ? (
            <Paragraph style={{ marginBottom: 6, color: "#555" }}>
              {job.responsibilities}
            </Paragraph>
          ) : (
            <Text type="secondary">Not specified</Text>
          )}
        </div>
      </Card>

      {/* <ApplyBenchJob jobId={id} /> */}
      {source !== "jobs" && <ApplyBenchJob jobId={job?.id} />}
    </div>
  );
};

export default JobDetails;
