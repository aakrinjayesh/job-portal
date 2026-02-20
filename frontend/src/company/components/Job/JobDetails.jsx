import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Progress,
  Divider,
  message,
  Tooltip,
  Modal,
} from "antd";
import { LuBookmark, LuBookmarkCheck } from "react-icons/lu";
import axios from "axios";
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { GetJobDetails, SaveJob, UnSaveJob } from "../../api/api";
import { useLocation } from "react-router-dom";
import ApplyBenchJob from "../../pages/ApplyBenchJob";

const { Title, Text, Paragraph } = Typography;

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  useEffect(() => {
    if (initialLoading || loading) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 10 : prev + 10));
      }, 400);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [initialLoading, loading]);

  const fetchJobDetails = async () => {
    try {
      // const payload = { jobid: id };
      const response = await GetJobDetails(id);
      setJob(response?.job);
    } catch (error) {
      message.error("Failed to load job details");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!job) return;

    const token = localStorage.getItem("token");
    if (!token) {
      messageApi.warning("Please login to save jobs");
      navigate("/login");
      return;
    }

    const willBeSaved = !job.isSaved;

    // optimistic UI
    setJob((prev) => ({
      ...prev,
      isSaved: willBeSaved,
    }));

    try {
      const resp = willBeSaved
        ? await SaveJob({ jobId: job.id })
        : await UnSaveJob({ jobId: job.id });

      if (resp?.status !== "success") throw new Error();

      messageApi.success(
        willBeSaved ? "Job saved successfully!" : "Job removed!",
      );
    } catch (err) {
      // rollback
      setJob((prev) => ({
        ...prev,
        isSaved: !willBeSaved,
      }));
      messageApi.error("Something went wrong!");
    }
  };

  const handleViewCandidates = () => {
    navigate("/company/candidates", { state: { id } });
  };

  if (initialLoading || loading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Progress
          type="circle"
          percent={progress}
          width={90}
          strokeColor={{
            "0%": "#4F63F6",
            "100%": "#7C8CFF",
          }}
          trailColor="#E6E8FF"
          showInfo={false}
        />
        <div
          style={{
            marginTop: 16,
            color: "#555",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Loading job details…
        </div>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
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
              {source === "myjobs" && (
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

              {/* SAVE */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveToggle(job.id);
                }}
                style={{ fontSize: 22, cursor: "pointer" }}
              >
                <Tooltip title={!job?.isSaved ? "Save Job" : "Unsave Job"}>
                  {job?.isSaved ? (
                    <LuBookmarkCheck size={22} color="#1677ff" />
                  ) : (
                    <LuBookmark size={22} color="#9CA3AF" />
                  )}
                </Tooltip>
              </div>

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
              <Text strong>Experience Level</Text>
              <div>
                <div>{job.experienceLevel}</div>
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

          {/* ===== CERTIFICATES ===== */}
          <Divider style={{ margin: "16px 0" }} />

          <Text strong>Certificates:</Text>

          <div
            style={{
              marginTop: 8,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {job.certifications && job.certifications.length > 0 ? (
              job.certifications.map((cert, i) => (
                <Tag
                  key={i}
                  style={{
                    background: "#E6FFFB",
                    borderRadius: 100,
                    border: "1px solid #13C2C2",
                  }}
                >
                  {cert}
                </Tag>
              ))
            ) : (
              <Text type="secondary">Not specified</Text>
            )}
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

        <Modal
          open={showLoginModal}
          title="Login Required"
          onCancel={() => setShowLoginModal(false)}
          okText="Go to Login"
          onOk={() => navigate("/login")}
        >
          <p>Please login to use this button.</p>
        </Modal>

        {/* <ApplyBenchJob jobId={id} /> */}
        {source !== "myjobs" && <ApplyBenchJob jobId={job?.id} />}
      </div>
    </>
  );
};

export default JobDetails;
