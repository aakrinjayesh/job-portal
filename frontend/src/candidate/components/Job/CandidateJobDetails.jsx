import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { LuBookmark, LuBookmarkCheck } from "react-icons/lu";
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Spin,
  Divider,
  message,
  Modal,
  Tooltip,
} from "antd";
import axios from "axios";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import {
  ApplyJob,
  GetJobDetails,
  SaveJob,
  UnSaveJob,
} from "../../../candidate/api/api";

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

  // ✅ Modal state
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    if (jobids && jobids.includes(id)) {
      setIsApplied(true);
    }
  }, [id, jobids]);

  const fetchJobDetails = async () => {
    try {
      const payload = { jobid: id };
      const response = await GetJobDetails(payload);
      setJob(response?.job);
    } catch (error) {
      messageAPI.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin size="large" style={{ marginTop: 100 }} />;
  if (!job) return <Text type="danger">Job not found</Text>;

  // -----------------------------------------
  // 🚀 FIXED — Modal opens 100%
  // -----------------------------------------
  const handleApply = async () => {
    console.log("apply button clicked");
    const getUser = localStorage.getItem("token");

    if (!getUser) {
      setShowLoginModal(true); // 🚀 open modal
      return;
    }

    setApplyLoading(true);
    try {
      const payload = { jobId: id };
      const resp = await ApplyJob(payload);

      if (resp.status === "success") {
        setIsApplied(true);
        messageAPI.success(resp.message || "Successfully applied");
      } else {
        messageAPI.error(resp.message || "Failed to apply Job");
      }
    } catch (error) {
      messageAPI.error("Failed to Apply");
    } finally {
      setApplyLoading(false);
    }
  };
  const handleSaveToggle = async () => {
    if (!job) return;

    const token = localStorage.getItem("token");
    if (!token) {
      messageAPI.warning("Please login to save jobs");
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

      messageAPI.success(
        willBeSaved ? "Job saved successfully!" : "Job removed!"
      );
    } catch (err) {
      // rollback
      setJob((prev) => ({
        ...prev,
        isSaved: !willBeSaved,
      }));
      messageAPI.error("Something went wrong!");
    }
  };

  return (
    <div style={{ width: "100%", margin: "0 auto", padding: 24 }}>
      {contextHolder}

      {/* ---------------------------------------------------- */}
      {/* 🚀 ALWAYS WORKING MODAL */}
      {/* ---------------------------------------------------- */}
      <Modal
        open={showLoginModal}
        title="Login Required"
        onCancel={() => setShowLoginModal(false)}
        okText="Go to Login"
        onOk={() => navigate("/login")}
      >
        <p>Please login to apply for this job.</p>
      </Modal>

      <Card
        style={{
          borderRadius: 14,
          border: "1px solid #f0f0f0",
          boxShadow: "none",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          {/* LEFT SIDE */}
          <div style={{ display: "flex", gap: 16 }}>
            {/* ✅ COMPANY LOGO */}
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt="logo"
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 12,
                  objectFit: "cover",
                  border: "1px solid #f0f0f0",
                }}
              />
            ) : (
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #1677FF, #69B1FF)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {(job.companyName || job.role || "").charAt(0).toUpperCase()}
              </div>
            )}

            {/* ROLE + COMPANY */}
            <div>
              <Title level={4} style={{ marginBottom: 0 }}>
                {job.role}
              </Title>
              <Text type="secondary">{job.companyName}</Text>
            </div>
            {/* SAVE */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleSaveToggle(job.id);
              }}
              style={{ fontSize: 22, marginLeft: 450, cursor: "pointer" }}
            >
              <Tooltip title={!job?.isSaved ? "Save Job" : "Unsave Job"}>
                {job?.isSaved ? (
                  <LuBookmarkCheck size={22} color="#1677ff" />
                ) : (
                  <LuBookmark size={22} color="#9CA3AF" />
                )}
              </Tooltip>
            </div>
          </div>

          {/* STATUS TAG */}
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

        <Divider style={{ margin: "16px 0" }} />

        {/* ===== DETAILS GRID ===== */}
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

        <Divider style={{ margin: "16px 0" }} />

        {/* ===== DESCRIPTION ===== */}
        <Text strong>Description</Text>
        <Paragraph style={{ marginTop: 6, color: "#555" }}>
          {job.description}
        </Paragraph>
        <Divider style={{ margin: "16px 0" }} />
        <Text strong>Roles and Responsibilities</Text>
        <Paragraph style={{ marginTop: 6, color: "#555" }}>
          {job.responsibilities}
        </Paragraph>

        <Divider />

        {/* ===== APPLY BUTTON ===== */}
        <Button
          type="primary"
          onClick={handleApply}
          loading={ApplyLoading}
          disabled={isApplied || type === "apply"}
          style={{ borderRadius: 8 }}
        >
          {isApplied || type === "apply" ? "Applied" : "Apply Now"}
        </Button>
      </Card>
    </div>
  );
};

export default CandidateJobDetails;
