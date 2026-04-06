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
  Tooltip,
  Modal,
  Input,
} from "antd";
import { LuBookmark, LuBookmarkCheck } from "react-icons/lu";
import { GetJobDetails, SaveJob, UnSaveJob, CloseJob } from "../../api/api";
import { ShareAltOutlined } from "@ant-design/icons";
import { ApplyJob } from "../../../candidate/api/api";
import ApplyBenchJob from "../../pages/ApplyBenchJob";
import { Helmet } from "react-helmet-async";
import { useJobSEO } from "../../../utils/useJobSEO";
import useScreeningQuestions from "../../../utils/Usescreeningquestions";
import ScreeningQuestionsModal from "../Job/ScreeningQuestionsModal";

const { Title, Text, Paragraph } = Typography;

const JobDetails = ({ mode, isPublic }) => {
  const { id } = useParams();
  const seo = useJobSEO(id);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const show = searchParams.get("show");
  const source = location?.state?.source;
  const count = location?.state?.count;
  const jobids = location?.state?.jobids;
  const jobData = location?.state?.jobData;

  const isCandidate = mode === "candidate";
  const isCompany = mode === "company";

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

  // ── Shared screening hook ──────────────────────────────────────────────────
  const screening = useScreeningQuestions(id);

  // Use the hook's messageApi so there's a single message context
  const { messageApi, contextHolder } = screening;
  // ──────────────────────────────────────────────────────────────────────────

  const [closeJobId, setCloseJobId] = useState(null);
  const [closeLoading, setCloseLoading] = useState(false);

  const handleCloseJob = async (jobId) => {
    setCloseLoading(true);
    try {
      await CloseJob(jobId);
      messageApi.success("Job closed successfully");
      setJob((prev) => ({ ...prev, status: "Closed" }));
      setCloseJobId(null);
    } catch (error) {
      messageApi.error(error?.response?.data?.message || "Failed to close job");
    } finally {
      setCloseLoading(false);
    }
  };

  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    return isMobile;
  };

  const isMobile = useIsMobile();

  useEffect(() => {
    fetchJobDetails();
    if (jobids && jobids.includes(id)) setIsApplied(true);
  }, [id]);

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
      // messageApi.success(
      //   willBeSaved ? "Job saved successfully!" : "Job removed!",
      // );
      if (willBeSaved) {
        messageApi.success("Job saved successfully!");
      } else {
        messageApi.open({
          content: (
            <span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#ff4d4f",
                  color: "#fff",
                  fontSize: 10,
                  marginRight: 8,
                }}
              >
                ✕
              </span>
              Job removed!
            </span>
          ),
          duration: 3,
        });
      }
    } catch {
      setJob((prev) => ({ ...prev, isSaved: !willBeSaved }));
      messageApi.error("Something went wrong!");
    }
  };

  // ── Core submit (passed to initiateApply as the "direct apply" callback) ──
  const submitApplication = async (answers) => {
    setApplyLoading(true);
    try {
      const resp = await ApplyJob({ jobId: id, answers });
      if (resp?.status === "success") {
        setIsApplied(true);
        screening.closeModal(false); // close modal after success
        messageApi.success(resp?.message || "Successfully applied");
      }
    } catch (error) {
      const { status, data } = error?.response || {};
      if ((status === 404 || status === 400) && data?.message) {
        messageApi.error(data.message);
      } else {
        messageApi.error("Something went wrong");
      }
    } finally {
      setApplyLoading(false);
    }
  };

  // ── Triggered by "Apply Now" button ───────────────────────────────────────
  const handleApplyClick = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    await screening.initiateApply(job?.hasQuestions, submitApplication);
  };

  // ── Modal OK handler: validate → build answers → submit ───────────────────
  const handleScreeningSubmit = async () => {
    const answers = screening.buildAnswers();
    if (answers === null) return; // validation failed
    await submitApplication(answers);
  };

  // ── Share helpers ──────────────────────────────────────────────────────────
  const handleShare = () => {
    const generatedUrl = `${window.location.origin}/job/${id}`;
    const companyLine = !isPublic ? `🏢 Company: ${job?.companyName}` : "";

    const customMessage = `
🚀 We're hiring!

💼 Role: ${job?.role}
${companyLine ? companyLine + "\n" : ""}📍 Location: ${job?.location}
💰 Salary: ₹ ${job?.salary} LPA

✨ Check out this opportunity and apply here:
${generatedUrl}
`.trim();

    setShareUrl(generatedUrl);
    setShareMessage(customMessage);
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

  // ── Loading / not-found states ─────────────────────────────────────────────
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
          strokeColor={{ "0%": "#4F63F6", "100%": "#7C8CFF" }}
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

  const maskCompanyName = (name) => {
    if (!name) return "";

    return "*".repeat(name.length);
  };

  return (
    <>
      {seo && (
        <Helmet>
          <title>{seo.title}</title>
          <meta name="description" content={seo.description} />
          <meta name="robots" content="index, follow" />
          <meta property="og:title" content={seo.title} />
          <meta property="og:description" content={seo.description} />
          <meta property="og:url" content={seo.canonicalUrl} />
          <meta property="og:image" content={seo.ogImage} />
          <meta property="og:type" content="website" />
          <link rel="canonical" href={seo.canonicalUrl} />
          <script type="application/ld+json">
            {JSON.stringify(seo.structuredData)}
          </script>
        </Helmet>
      )}

      {contextHolder}

      <div
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          padding: isMobile ? "12px" : "24px",
        }}
      >
        <Card
          style={{ borderRadius: 14 }}
          bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              gap: isMobile ? 12 : 0,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt="logo"
                  style={{
                    width: isMobile ? 44 : 56,
                    height: isMobile ? 44 : 56,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: isMobile ? 44 : 56,
                    height: isMobile ? 44 : 56,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #1677FF, #69B1FF)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: isMobile ? 18 : 22,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {(job.companyName || job.role || "").charAt(0).toUpperCase()}
                </div>
              )} */}
              {!isPublic && job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt="logo"
                  style={{
                    width: isMobile ? 44 : 56,
                    height: isMobile ? 44 : 56,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: isMobile ? 44 : 56,
                    height: isMobile ? 44 : 56,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #1677FF, #69B1FF)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: isMobile ? 18 : 22,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {!isPublic &&
                    (job.companyName || job.role || "").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <Title level={isMobile ? 5 : 4} style={{ marginBottom: 0 }}>
                  {job.role}
                </Title>
                <Text type="secondary">
                  {/* {job.companyName} */}
                  {isPublic
                    ? maskCompanyName(job.companyName)
                    : job.companyName}
                </Text>
              </div>
            </div>

            {/* Action buttons row */}
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {isCompany && source === "myjobs" && (
                <>
                  {job.status === "Open" && (
                    <Button
                      danger
                      style={{ borderRadius: 100 }}
                      onClick={() => setCloseJobId(job.id)}
                    >
                      Close
                    </Button>
                  )}

                  <Button
                    disabled={job.status === "Closed"}
                    style={{
                      background: "#F0F2F4",
                      borderRadius: 100,
                      color: "#666",
                    }}
                    onClick={() =>
                      navigate("/company/jobs", {
                        state: { openEdit: jobData || job },
                      })
                    }
                  >
                    Edit
                  </Button>

                  <Button
                    style={{
                      background: "#D1E4FF",
                      borderRadius: 100,
                      fontWeight: 600,
                    }}
                    onClick={() =>
                      navigate("/company/candidates", { state: { id } })
                    }
                  >
                    View Candidates ({count || 0})
                  </Button>
                </>
              )}
              {!isPublic && (
                // <Tooltip title={!job?.isSaved ? "Save Job" : "Unsave Job"}>
                //   <div onClick={handleSaveToggle} style={{ cursor: "pointer" }}>
                //     {job?.isSaved ? (
                //       <LuBookmarkCheck size={20} color="#1677ff" />
                //     ) : (
                //       <LuBookmark size={20} color="#9CA3AF" />
                //     )}
                //   </div>
                // </Tooltip>
                <Tooltip title={!job?.isSaved ? "Save Job" : "Unsave Job"}>
                  <Button
                    type="text"
                    disabled={job.status === "Closed"}
                    onClick={handleSaveToggle}
                    icon={
                      job?.isSaved ? (
                        <LuBookmarkCheck size={18} color="#1677ff" />
                      ) : (
                        <LuBookmark size={18} color="#9CA3AF" />
                      )
                    }
                  />
                </Tooltip>
              )}

              <Tooltip title="Share Job">
                {/* <ShareAltOutlined
                  style={{ fontSize: 18, cursor: "pointer", color: "#6B7280" }}
                  onClick={handleShare}
                /> */}
                <Tooltip title="Share Job">
                  <Button
                    type="text"
                    disabled={job.status === "Closed"}
                    icon={<ShareAltOutlined style={{ fontSize: 18 }} />}
                    onClick={handleShare}
                  />
                </Tooltip>
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
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : "repeat(3, 1fr)",
              gap: isMobile ? 14 : 20,
            }}
          >
            <div>
              <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
                Employment Type
              </Text>
              <div style={{ fontSize: isMobile ? 13 : 14 }}>
                {job.employmentType}
              </div>
            </div>
            <div>
              <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
                Experience
              </Text>
              <div style={{ fontSize: isMobile ? 13 : 14 }}>
                {job.experience?.min && job.experience?.max
                  ? `${job.experience.min} - ${job.experience.max} ${job.experience.type}s`
                  : job.experience?.number
                    ? `${job.experience.number} ${job.experience.type}s`
                    : "Not specified"}
              </div>
            </div>
            <div>
              <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
                Salary
              </Text>
              <div style={{ fontSize: isMobile ? 13 : 14 }}>
                ₹ {job.salary} LPA
              </div>
            </div>
            <div>
              <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
                Location
              </Text>
              <div style={{ fontSize: isMobile ? 13 : 14 }}>
                {isMobile
                  ? job.location?.split(",")[0]?.trim() // city only on mobile
                  : job.location}
              </div>
            </div>
            <div>
              <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
                Job Type
              </Text>
              <div style={{ fontSize: isMobile ? 13 : 14 }}>{job.jobType}</div>
            </div>
            <div>
              <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
                Exp Level
              </Text>
              <div style={{ fontSize: isMobile ? 13 : 14 }}>
                {job.experienceLevel || "N/A"}
              </div>
            </div>
          </div>

          <Divider />

          <Text strong>Clouds:</Text>
          <div style={{ marginTop: 8 }}>
            {job.clouds?.map((c, i) => (
              <Tag key={i}>{c}</Tag>
            ))}
          </div>

          <Divider />

          <Text strong>Skills:</Text>
          <div style={{ marginTop: 8 }}>
            {job.skills?.map((s, i) => (
              <Tag key={i} color="purple">
                {s}
              </Tag>
            ))}
          </div>

          {/* <Divider /> */}

          {/* CERTIFICATES */}
          <Divider />

          {/* CERTIFICATIONS */}
          <Text strong>Certifications:</Text>
          <div style={{ marginTop: 8 }}>
            {job.certifications && job.certifications.length > 0 ? (
              job.certifications.map((cert, i) => (
                <Tag key={i} color="gold">
                  {cert}
                </Tag>
              ))
            ) : (
              <Text type="secondary">No certifications required</Text>
            )}
          </div>

          <Divider />

          <Text strong>Description</Text>
          <Paragraph>{job.description}</Paragraph>

          <Divider />

          <Text strong>Roles & Responsibilities</Text>
          {(() => {
            const lines = job.responsibilities
              ?.split(/\n+/)
              .filter((line) => line.trim() !== "");

            if (!lines || lines.length === 0) return null;

            const firstLine = lines[0].trim();
            const isNumbered = /^\d+\./.test(firstLine);
            const isDash = /^-/.test(firstLine);
            const isBullet = /^•/.test(firstLine);

            if (isNumbered) {
              return (
                <ol style={{ paddingLeft: 20, marginTop: 12 }}>
                  {lines.map((line, index) => (
                    <li key={index} style={{ marginBottom: 8 }}>
                      {line.replace(/^\d+\.\s*/, "").trim()}
                    </li>
                  ))}
                </ol>
              );
            }
            if (isDash) {
              return (
                <ul style={{ paddingLeft: 20, marginTop: 12 }}>
                  {lines.map((line, index) => (
                    <li key={index} style={{ marginBottom: 8 }}>
                      {line.replace(/^-+\s*/, "").trim()}
                    </li>
                  ))}
                </ul>
              );
            }
            if (isBullet) {
              return (
                <ul style={{ paddingLeft: 20, marginTop: 12 }}>
                  {lines.map((line, index) => (
                    <li key={index} style={{ marginBottom: 8 }}>
                      {line.replace(/^•+\s*/, "").trim()}
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <div style={{ marginTop: 12 }}>
                {lines.map((line, index) => (
                  <div key={index} style={{ marginBottom: 8 }}>
                    {line}
                  </div>
                ))}
              </div>
            );
          })()}

          <Divider />

          {/* CANDIDATE APPLY BUTTON */}
          {isCandidate && (
            <Button
              type="primary"
              onClick={handleApplyClick}
              loading={applyLoading || screening.questionsLoading}
              disabled={isApplied || screening.questionsLoading}
              style={{ borderRadius: 8 }}
            >
              {isApplied ? "Applied" : "Apply Now"}
            </Button>
          )}
        </Card>

        {isCompany && source !== "myjobs" && show !== "jobdetails" && (
          <ApplyBenchJob
            jobId={job?.id}
            hasQuestions={job?.hasQuestions}
            jobStatus={job.status}
          />
        )}
      </div>

      {/* LOGIN MODAL */}
      <Modal
        open={showLoginModal}
        title="Login Required"
        onCancel={() => setShowLoginModal(false)}
        okText="Go to Login"
        onOk={() =>
          navigate("/login", { state: { redirect: location.pathname } })
        }
      >
        <p>Please login to continue.</p>
      </Modal>

      {/* SHARE MODAL */}
      <Modal
        open={showShareModal}
        title="Share This Job"
        onCancel={() => setShowShareModal(false)}
        footer={null}
        width={600}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Text strong style={{ fontSize: 15 }}>
              🔗 Direct Job Link
            </Text>
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <Input value={shareUrl} readOnly />
              <Button type="primary" onClick={handleCopyLink}>
                Copy
              </Button>
            </div>
          </div>
          <Divider />
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

      {/* SCREENING QUESTIONS MODAL — shared component, no duplication */}
      <ScreeningQuestionsModal
        {...screening}
        applyLoading={applyLoading}
        onSubmit={handleScreeningSubmit}
      />
      <Modal
        open={!!closeJobId}
        title="Close Job"
        okText="Yes, Close"
        okButtonProps={{ danger: true }}
        confirmLoading={closeLoading}
        centered
        onCancel={() => setCloseJobId(null)}
        onOk={() => handleCloseJob(closeJobId)}
      >
        Are you sure you want to close this job?
      </Modal>
    </>
  );
};

export default JobDetails;
