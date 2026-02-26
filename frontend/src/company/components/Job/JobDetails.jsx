import React, { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import {
  Card,
  Typography,
  Tag,
  Button,
  Progress,
  Divider,
  message,
  Tooltip,
  Modal,
} from "antd";
import { LuBookmark, LuBookmarkCheck } from "react-icons/lu";
import { GetJobDetails, SaveJob, UnSaveJob } from "../../api/api";
import { ShareAltOutlined, CopyOutlined } from "@ant-design/icons";
import { Input, Space } from "antd";
import { ApplyJob } from "../../../candidate/api/api";
import ApplyBenchJob from "../../pages/ApplyBenchJob";
import { Helmet } from "react-helmet-async";
import { useJobSEO } from "../../../utils/useJobSEO";

const { Title, Text, Paragraph } = Typography;

const JobDetails = ({ mode }) => {
  const { id } = useParams();
  const seo = useJobSEO(id);
  console.log("seo data", seo);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const show = searchParams.get("show");
  const source = location?.state?.source;
  const count = location?.state?.count;
  const jobids = location?.state?.jobids;

  const isCandidate = mode === "candidate";
  const isCompany = mode === "company";
  console.log("mode", mode);

  const [job, setJob] = useState(null);

  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const [isApplied, setIsApplied] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  const [messageApi, contextHolder] = message.useMessage();

  // ===============================
  // FETCH JOB
  // ===============================
  useEffect(() => {
    fetchJobDetails();

    if (jobids && jobids.includes(id)) {
      setIsApplied(true);
    }
  }, [id]);

  // ===============================
  // PROGRESS ANIMATION (your logic)
  // ===============================
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
      const response = await GetJobDetails(id);
      setJob(response?.job);
    } catch {
      messageApi.error("Failed to load job details");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // ===============================
  // SAVE / UNSAVE
  // ===============================
  const handleSaveToggle = async () => {
    if (!job) return;

    const token = localStorage.getItem("token");
    if (!token) {
      messageApi.warning("Please login to save jobs");
      navigate("/login");
      return;
    }

    const willBeSaved = !job.isSaved;

    setJob((prev) => ({ ...prev, isSaved: willBeSaved }));

    try {
      const resp = willBeSaved
        ? await SaveJob({ jobId: job.id })
        : await UnSaveJob({ jobId: job.id });

      if (resp?.status !== "success") throw new Error();

      messageApi.success(
        willBeSaved ? "Job saved successfully!" : "Job removed!",
      );
    } catch {
      setJob((prev) => ({ ...prev, isSaved: !willBeSaved }));
      messageApi.error("Something went wrong!");
    }
  };

  // ===============================
  // APPLY (Candidate Only)
  // ===============================
  const handleApply = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setShowLoginModal(true); // modal should pass redirect
      return;
    }

    setApplyLoading(true);

    try {
      const resp = await ApplyJob({ jobId: id });

      if (resp?.status === "success") {
        setIsApplied(true);
        messageApi.success(resp?.message || "Successfully applied");
      }
    } catch (error) {
      const { status, data } = error?.response || {};
      console.log("status", status);
      console.log("data", data);
      if (status === 404 && data?.message) {
        messageApi.error(data.message);
      } else {
        messageApi.error("Something went wrong");
      }
    } finally {
      setApplyLoading(false);
    }
  };

  // ===============================
  // LOADING SCREEN (your original)
  // ===============================
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
        <div style={{ marginTop: 16, fontWeight: 500 }}>
          Loading job details…
        </div>
      </div>
    );
  }

  if (!job) return <Text type="danger">Job not found</Text>;

  const handleShare = () => {
    const generatedUrl = `${window.location.origin}/job/${id}`;

    const customMessage = `
    🚀 We're hiring!

    💼 Role: ${job?.role}
    🏢 Company: ${job?.companyName}
    📍 Location: ${job?.location}
    💰 Salary: ₹ ${job?.salary} LPA

    ✨ Check out this opportunity and apply here:
    ${generatedUrl}
    `;

    setShareUrl(generatedUrl);
    setShareMessage(customMessage.trim());
    setShowShareModal(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      messageApi.success("Link copied successfully!");
    } catch {
      messageApi.error("Failed to copy link");
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      messageApi.success("Share message copied!");
    } catch {
      messageApi.error("Failed to copy message");
    }
  };

  return (
    <>
      {seo && (
        <Helmet>
          <title>{seo.title}</title>
          <meta name="description" content={seo.description} />
          <meta name="robots" content="index, follow" />

          {/* Open Graph */}
          <meta property="og:title" content={seo.title} />
          <meta property="og:description" content={seo.description} />
          <meta property="og:url" content={seo.canonicalUrl} />
          <meta property="og:image" content={seo.ogImage} />
          <meta property="og:type" content="website" />

          {/* Canonical */}
          <link rel="canonical" href={seo.canonicalUrl} />

          {/* Google Jobs structured data */}
          <script type="application/ld+json">
            {JSON.stringify(seo.structuredData)}
          </script>
        </Helmet>
      )}

      {contextHolder}

      <div style={{ maxWidth: "100%", margin: "0 auto", padding: 24 }}>
        <Card style={{ borderRadius: 14 }}>
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* LEFT */}
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
                    fontWeight: 700,
                    color: "#fff",
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

            {/* RIGHT */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {isCompany && source === "myjobs" && (
                <Button
                  style={{
                    background: "#D1E4FF",
                    borderRadius: 100,
                    fontWeight: 600,
                  }}
                  onClick={() =>
                    navigate("/company/candidates", {
                      state: { id },
                    })
                  }
                >
                  View Candidates ({count || 0})
                </Button>
              )}

              <Tooltip title={!job?.isSaved ? "Save Job" : "Unsave Job"}>
                <div onClick={handleSaveToggle} style={{ cursor: "pointer" }}>
                  {job?.isSaved ? (
                    <LuBookmarkCheck size={22} color="#1677ff" />
                  ) : (
                    <LuBookmark size={22} color="#9CA3AF" />
                  )}
                </div>
              </Tooltip>

              <Tooltip title="Share Job">
                <ShareAltOutlined
                  style={{ fontSize: 20, cursor: "pointer", color: "#6B7280" }}
                  onClick={handleShare}
                />
              </Tooltip>

              <Tag color={job.status === "Closed" ? "error" : "success"}>
                {job.status}
              </Tag>
            </div>
          </div>

          <Divider />

          {/* DETAILS GRID */}
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

          <Divider />

          {/* CLOUDS */}
          <Text strong>Clouds:</Text>
          <div style={{ marginTop: 8 }}>
            {job.clouds?.map((c, i) => (
              <Tag key={i}>{c}</Tag>
            ))}
          </div>

          <Divider />

          {/* SKILLS */}
          <Text strong>Skills:</Text>
          <div style={{ marginTop: 8 }}>
            {job.skills?.map((s, i) => (
              <Tag key={i} color="purple">
                {s}
              </Tag>
            ))}
          </div>

          <Divider />

          <Text strong>Description</Text>
          <Paragraph>{job.description}</Paragraph>

          <Divider />

          <Text strong>Roles & Responsibilities</Text>
          <Paragraph>{job.responsibilities}</Paragraph>

          <Divider />

          {/* CANDIDATE APPLY */}
          {isCandidate && (
            <Button
              type="primary"
              onClick={handleApply}
              loading={applyLoading}
              disabled={isApplied}
              style={{ borderRadius: 8 }}
            >
              {isApplied ? "Applied" : "Apply Now"}
            </Button>
          )}
        </Card>

        {/* APPLY BENCH JOB (your original condition) */}
        {isCompany && source !== "myjobs" && show !== "jobdetails" && (
          <ApplyBenchJob jobId={job?.id} />
        )}
      </div>

      {/* LOGIN MODAL */}
      <Modal
        open={showLoginModal}
        title="Login Required"
        onCancel={() => setShowLoginModal(false)}
        okText="Go to Login"
        onOk={() =>
          navigate("/login", {
            state: {
              redirect: location.pathname,
              // role: "candidate",
            },
          })
        }
      >
        <p>Please login to continue.</p>
      </Modal>
      <Modal
        open={showShareModal}
        title="Share This Job"
        onCancel={() => setShowShareModal(false)}
        footer={null}
        width={600}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* SECTION 1 — COPY LINK */}
          <div>
            <Text strong style={{ fontSize: 15 }}>
              🔗 Direct Job Link
            </Text>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 8,
              }}
            >
              <Input value={shareUrl} readOnly />

              <Button type="primary" onClick={handleCopyLink}>
                Copy
              </Button>
            </div>
          </div>

          <Divider />

          {/* SECTION 2 — COPY MESSAGE */}
          <div>
            <Text strong style={{ fontSize: 15 }}>
              ✨ Share with Custom Message
            </Text>

            <div
              style={{
                marginTop: 10,
                background: "#F9FAFB",
                padding: 16,
                borderRadius: 10,
                border: "1px solid #E5E7EB",
                whiteSpace: "pre-line",
                fontSize: 14,
              }}
            >
              {shareMessage}
            </div>

            <Button
              style={{ marginTop: 12 }}
              type="primary"
              block
              onClick={handleCopyMessage}
            >
              Copy Full Message
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default JobDetails;
