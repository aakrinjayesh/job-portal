import React from "react";
import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { useRef } from "react";
import ResumeTemplate from "../Bench/ResumeTemplate";
import { LuBookmark, LuBookmarkCheck } from "react-icons/lu";
import { SaveCandidate, UnsaveCandidate } from "../../api/api";

import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Tag,
  Divider,
  Button,
  Typography,
  Collapse,
  Space,
  Avatar,
  Rate,
  Input,
  message,
  Tooltip,
  Modal,
  Progress,
} from "antd";
import {
  ArrowLeftOutlined,
  WhatsAppOutlined,
  CloudDownloadOutlined,
  MessageOutlined,
  ShareAltOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import CandidateActivity from "../activity/CandidateActivity";
import { getCandidateDetails, SaveCandidateRating } from "../../api/api";

const { Title, Paragraph, Text } = Typography;

const CandidateDetails = ({
  candidateFromList,
  idFromModal,
  jobIdFromList,
  isModal,
  matchScore,
}) => {
  console.log("candidates details page");

  const navigate = useNavigate();
  const { id } = useParams(); // userId in URL

  const finalId = candidateFromList?.id || idFromModal || id;
  const [messageApi, contextHolder] = message.useMessage();
  const location = useLocation();
  // 🔹 Review state (per candidate)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const [tempReview, setTempReview] = useState("");

  const [ratingValue, setRatingValue] = useState(0);

  const [progress, setProgress] = useState(0);
  const [readyToShow, setReadyToShow] = useState(false);

  const {
    jobId: jobIdFromRoute,
    source,
    matchScore: matchScoreFromRoute,
  } = location.state || {};
  const jobId = jobIdFromList || jobIdFromRoute;

  // ✅ matchScore from prop (modal) OR from route state (page navigation)
  const resolvedMatchScore = matchScore ?? matchScoreFromRoute ?? null;
  const [candidate, setCandidate] = useState(null);
  const [addReviewLoading, setAddReviewLoading] = useState(false);
  const resumeRef = useRef();

  const activityOnly = location?.state?.activityOnly;
  const defaultTab = location?.state?.defaultTab;
  const [loadingCandidate, setLoadingCandidate] = useState(true);
  const [isViewReviewsModalOpen, setIsViewReviewsModalOpen] = useState(false);
  const hasFetched = useRef(false);

  console.log("sourcw", source);
  console.log("location", location);
  // useEffect(() => {
  //   if (candidateFromList) {
  //     console.log("SETTING DATA FROM LIST", candidateFromList);

  //     setCandidate(candidateFromList);
  //     setLoadingCandidate(false);
  //     setReadyToShow(true);
  //   }
  // }, [candidateFromList]);

  // useEffect(() => {
  //   const fetchCandidate = async () => {
  //     try {
  //       setProgress(10);
  //       setReadyToShow(false);
  //       setLoadingCandidate(true);

  //       // const res = await getCandidateDetails(id);
  //       const res = await getCandidateDetails(finalId);

  //       if (res.status === "success") {
  //         setCandidate(res.candidate);
  //         // setSaved(res.candidate?.isSaved || false); // 👈 important
  //         setSaved(res.candidate?.profile?.isSaved ?? false);
  //       }
  //     } catch (err) {
  //       message.error("Failed to load candidate details");
  //     } finally {
  //       setProgress(100);

  //       setLoadingCandidate(false);
  //       setReadyToShow(true);
  //     }
  //   };

  //   if (finalId) {
  //     fetchCandidate();
  //   }
  // }, [candidateFromList, finalId]);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setProgress(10);
        setReadyToShow(false);
        setLoadingCandidate(true);

        const res = await getCandidateDetails(finalId);

        if (res.status === "success") {
          setCandidate(res.candidate);
          setSaved(res.candidate?.profile?.isSaved ?? false);
        }
      } catch (err) {
        message.error("Failed to load candidate details");
      } finally {
        setProgress(100);
        setLoadingCandidate(false);
        setReadyToShow(true);
      }
    };

    // ✅ ONLY CALL ONCE
    if (finalId && !hasFetched.current) {
      hasFetched.current = true;
      fetchCandidate();
    }
  }, [finalId]);

  // const handleSaveToggle = async (e) => {
  //   e.stopPropagation();

  //   const profileId = candidate?.profile?.id;
  //   if (!candidate?.id) return;

  //   const willBeSaved = !saved;
  //   setSaved(willBeSaved);

  //   try {
  //     if (willBeSaved) {
  //       const resp = await SaveCandidate({
  //         // candidateProfileId: candidate.id,
  //         candidateProfileId: profileId,
  //       });

  //       if (resp?.status !== "success") throw new Error();
  //       messageApi.success("Candidate saved!");
  //     } else {
  //       const resp = await UnsaveCandidate({
  //         // candidateProfileId: candidate.id,
  //         candidateProfileId: candidate.profile.id,
  //       });

  //       if (resp?.status !== "success") throw new Error();
  //       // messageApi.success("Candidate removed!");
  //       messageApi.error("Candidate removed!");
  //     }
  //   } catch (error) {
  //     console.error("Save error:", error);
  //     setSaved(!willBeSaved); // rollback
  //   }
  // };

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    const profileId = candidate?.profile?.id;
    if (!profileId) return;

    try {
      if (saved) {
        const resp = await UnsaveCandidate({ candidateProfileId: profileId });
        if (resp?.status !== "success") throw new Error(resp?.message);
        setSaved(false);
        messageApi.warning("Candidate removed!");
      } else {
        const resp = await SaveCandidate({ candidateProfileId: profileId });
        if (resp?.status !== "success") throw new Error(resp?.message);
        setSaved(true);
        messageApi.success("Candidate saved!");
      }
    } catch (error) {
      console.error("Save toggle error:", error);
      // ✅ If unsave says "not found", treat as already unsaved
      if (error?.message?.includes("not found")) {
        setSaved(false);
        messageApi.warning("Already removed");
      } else {
        messageApi.error("Something went wrong");
      }
    }
  };

  const reloadCandidate = async () => {
    try {
      const profileId = candidate?.profile?.id;

      if (!profileId) {
        messageApi.error("Candidate profile ID missing");
        return;
      }

      if (!ratingValue || ratingValue === 0) {
        messageApi.error("Please select rating");
        return;
      }

      setAddReviewLoading(true);

      const res = await SaveCandidateRating({
        candidateProfileId: profileId,
        rating: ratingValue,
        comment: tempReview,
      });

      if (res.status === "success") {
        messageApi.success(res.message || "Review Submitted!");
        // 🔥 REFETCH UPDATED DATA

        const updated = await getCandidateDetails(candidate?.id);

        if (updated.status === "success") {
          setCandidate(updated.candidate); // ✅ update state
        }
        setIsReviewModalOpen(false); // close modal
        setTempReview("");
        setRatingValue(0);
      } else {
        messageApi.error("Failed To Submit The Review");
      }
    } catch (err) {
      console.error(err);
      messageApi.error("Something went wrong");
    } finally {
      setAddReviewLoading(false);
    }
  };

  if (!readyToShow) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          // minHeight: "100vh",
          minHeight: isModal ? 300 : "100vh",
          background: "#fafafa",
        }}
      >
        <Progress
          type="circle"
          percent={progress}
          width={95}
          strokeColor={{
            "0%": "#4F63F6",
            "100%": "#7C8CFF",
          }}
          trailColor="#E6E8FF"
          showInfo={false}
        />
        <div
          style={{
            marginTop: 18,
            color: "#64748b",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Loading candidate details…
        </div>
      </div>
    );
  }

  if (!candidate) {
    return <p style={{ padding: "20px" }}>No candidate details found.</p>;
  }

  const profile = candidate.profile || {};
  console.log("full profle", candidate.profile || "null");
  console.log("profile", profile);
  const summary = profile.summary;

  console.log("CandidateDetails candidate:", candidate);
  // console.log("candidate.userId:", candidate.userId);

  const skillChipStyle = {
    background: "#E2EEFF",
    border: "0.5px solid #1677FF",
    color: "#000000",
    borderRadius: 100,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 500,
  };

  const secondarySkillChipStyle = {
    background: "#FBEBFF",
    border: "0.5px solid #800080",
    color: "#111111",
    borderRadius: 100,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 510,
    textTransform: "capitalize",
  };

  const InfoItem = ({ label, value }) => (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 4, // ✅ label–value gap
      }}
    >
      {/* LABEL */}
      <div
        style={{
          height: 20, // ✅ fixed label height (Figma)
          fontSize: 14,
          fontWeight: 590,
          color: "#2E2E2E",
          lineHeight: "18px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          minHeight: 18,
          fontSize: 14,
          fontWeight: 400,
          color: "#2E2E2E",
          lineHeight: "18px",
          wordBreak: "break-word",
        }}
      >
        {typeof value === "string" &&
        (value.startsWith("http://") || value.startsWith("https://")) ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1677FF" }} // optional link color
          >
            {value}
          </a>
        ) : (
          value || "-"
        )}
      </div>
    </div>
  );

  const certificateChipStyle = {
    background: "#E2EEFF",
    border: "0.5px solid #1677FF",
    color: "#000000",
    borderRadius: 100,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 500,
  };

  const handleDownloadResume = () => {
    if (!candidate) return;

    const element = resumeRef.current;

    const options = {
      margin: 0.5,
      filename: `${candidate.name || "candidate"}_resume.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(options).from(element).save();
  };

  // const shareLink = candidate
  //   ? `${window.location.origin}/company/candidate/${candidate.id}?role=${candidate.role}&orgId=${candidate.organizationId}`
  //   : "";
  // Fix 3: share link — derive values that work in both modal and page mode
  // const candidateProfileId = candidate?.profile?.id || candidate?.id;
  // const candidateProfileId = candidate?.id;
  // const candidateRole = candidate?.role || candidate?.profile?.title || "";
  // const candidateOrgId =
  //   candidate?.organizationId || candidate?.profile?.organizationId || "";
  const candidateProfileId = candidate?.profile?.id || candidate?.id;

  const candidateRole = candidate?.profile?.title || "-";

  const candidateOrgId =
    candidate?.profile?.organizationId || candidate?.organizationId || "-";

  const shareLink = candidateProfileId
    ? `${window.location.origin}/company/candidate/${candidateProfileId}?role=${candidateRole}&orgId=${candidateOrgId}`
    : "";

  return (
    <div style={{ padding: "0px" }}>
      {contextHolder}

      {/* Back Button */}

      <Row gutter={16}>
        {!activityOnly && (
          <Col
            span={isModal ? 16 : source === "bench" ? 24 : 16}
            style={{ position: "relative" }}
          >
            <Card bordered={false}>
              {/* ✅ TOP ACTION BAR */}
              <div
                style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid #EDEDED",
                  marginBottom: 16,
                }}
              >
                <Row align="middle" justify="space-between">
                  <Space size={12} align="center">
                    {/* <Avatar size={40}>{candidate.name?.charAt(0)}</Avatar> */}
                    <Avatar
                      size={60}
                      src={
                        candidate?.profile?.profilePicture
                          ? `${
                              candidate.profile.profilePicture
                            }?t=${Date.now()}`
                          : undefined
                      }
                    >
                      {!candidate?.profile?.profilePicture &&
                        candidate.name?.charAt(0)}
                    </Avatar>

                    <Space direction="vertical" size={0}>
                      <Text style={{ fontWeight: 600 }}>{candidate.name}</Text>
                      {profile?.title && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {profile.title}
                        </Text>
                      )}
                      {source !== "bench" && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Applied {candidate.updatedAt}
                        </Text>
                      )}

                      <Space size={8} align="center">
                        <Rate
                          disabled
                          value={Math.round(candidate.avgRating || 0)}
                        />

                        {candidate?.ratingReviews?.length > 0 && (
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#1677FF",
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                            onClick={() => setIsViewReviewsModalOpen(true)}
                          >
                            Show Reviews ({candidate.ratingReviews.length})
                          </Text>
                        )}

                        {source !== "bench" && (
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#1677FF",
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                            onClick={() => setIsReviewModalOpen(true)}
                          >
                            Add Review
                          </Text>
                        )}
                      </Space>
                    </Space>
                  </Space>
                  <Space>
                    <Tooltip title={`Whatsapp ${candidate.name}`}>
                      <Button
                        shape="circle"
                        icon={<WhatsAppOutlined style={{ fontSize: 20 }} />}
                        style={{
                          backgroundColor: "#25D366",
                          color: "#FFFFFF",
                          border: "none",
                          height: 40,
                          width: 40,
                        }}
                        onClick={() => {
                          const number = candidate?.profile?.phoneNumber;

                          if (!number) {
                            messageApi.error("Phone number not available");
                            return;
                          }

                          const message = `Hi ${candidate.name},`;
                          const url = `https://wa.me/${number}?text=${encodeURIComponent(
                            message,
                          )}`;

                          window.open(url, "_blank");
                        }}
                      />
                    </Tooltip>

                    <Tooltip title="Download Resume">
                      <Button
                        shape="circle"
                        icon={
                          <CloudDownloadOutlined style={{ fontSize: 20 }} />
                        }
                        style={{
                          backgroundColor: "#1677FF",
                          color: "#FFFFFF",
                          border: "none",
                          height: 40,
                          width: 40,
                        }}
                        onClick={handleDownloadResume}
                      />
                    </Tooltip>

                    <Tooltip title={`Chat with ${candidate.name}`}>
                      <Button
                        shape="circle"
                        icon={<MessageOutlined style={{ fontSize: 20 }} />}
                        style={{
                          backgroundColor: "#722ED1",
                          color: "#FFFFFF",
                          border: "none",
                          height: 40,
                          width: 40,
                        }}
                        onClick={() =>
                          navigate("/company/chat", {
                            state: { candidate, jobId },
                          })
                        }
                      />
                    </Tooltip>
                    <Tooltip title="Share Candidate">
                      <Button
                        shape="circle"
                        icon={<ShareAltOutlined style={{ fontSize: 20 }} />}
                        style={{
                          backgroundColor: "#0EA5E9",
                          color: "#FFFFFF",
                          border: "none",
                          height: 40,
                          width: 40,
                        }}
                        onClick={() => setIsShareModalOpen(true)}
                      />
                    </Tooltip>

                    <Tooltip
                      title={saved ? "Saved Candidate" : "Save Candidate"}
                    >
                      <Button
                        type="text"
                        onClick={handleSaveToggle}
                        icon={
                          saved ? (
                            <LuBookmarkCheck
                              style={{ color: "#1677ff", fontSize: 20 }}
                            />
                          ) : (
                            <LuBookmark style={{ fontSize: 20 }} />
                          )
                        }
                      />
                    </Tooltip>
                  </Space>
                </Row>
                {resolvedMatchScore != null && (
                  <div style={{ marginTop: 12 }}>
                    <span
                      style={{
                        padding: "4px 16px",
                        borderRadius: "20px",
                        fontSize: 13,
                        fontWeight: 600,
                        backgroundColor:
                          resolvedMatchScore >= 80
                            ? "#f6ffed"
                            : resolvedMatchScore >= 60
                              ? "#e6f4ff"
                              : resolvedMatchScore >= 40
                                ? "#fff7e6"
                                : "#fff1f0",
                        color:
                          resolvedMatchScore >= 80
                            ? "#389e0d"
                            : resolvedMatchScore >= 60
                              ? "#0958d9"
                              : resolvedMatchScore >= 40
                                ? "#d46b08"
                                : "#cf1322",
                        border: `1px solid ${
                          resolvedMatchScore >= 80
                            ? "#b7eb8f"
                            : resolvedMatchScore >= 60
                              ? "#91caff"
                              : resolvedMatchScore >= 40
                                ? "#ffd591"
                                : "#ffa39e"
                        }`,
                      }}
                    >
                      Fit Score: {resolvedMatchScore}%
                    </span>
                  </div>
                )}
              </div>

              {summary?.trim()?.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    marginBottom: 20,
                    // backgroundColor: "#D1E4FF", // ✅ same blue as Chat button
                    color: "#101828",
                    borderRadius: 16, // ✅ pill style
                    padding: "12px 16px", // ✅ auto height based on text
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: "20px",
                    maxWidth: "100%",
                    wordBreak: "break-word",
                  }}
                >
                  {summary}
                </div>
              )}

              <Collapse
                bordered={false}
                defaultActiveKey={["personal"]} // ✅ OPEN BY DEFAULT
                items={[
                  {
                    key: "personal",
                    label: (
                      <Title level={4} style={{ margin: 0 }}>
                        Personal Information
                      </Title>
                    ),
                    children: (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 24, // space between rows (Figma)
                        }}
                      >
                        {/* ROW 1 */}

                        <div style={{ display: "flex", gap: 28 }}>
                          {profile.isVendor ? (
                            <>
                              <InfoItem
                                label="POC Email"
                                value={profile.vendor?.email}
                              />
                              <InfoItem
                                label="POC Phone"
                                value={
                                  profile.vendor?.phoneNumber
                                    ? ` ${profile.vendor.phoneNumber}`
                                    : "-"
                                }
                              />
                            </>
                          ) : (
                            <>
                              <InfoItem label="Email" value={profile.email} />

                              <InfoItem
                                label="Phone"
                                value={
                                  profile.phoneNumber
                                    ? ` ${profile.phoneNumber}`
                                    : "-"
                                }
                              />
                            </>
                          )}

                          <div
                            style={{
                              flex: 1,
                              minWidth: 0,
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <div
                              style={{
                                height: 20,
                                fontSize: 14,
                                fontWeight: 590,
                                color: "#2E2E2E",
                                lineHeight: "18px",
                              }}
                            >
                              Company Profile
                            </div>

                            <div
                              style={{
                                minHeight: 18,
                                fontSize: 14,
                                fontWeight: 400,
                                color: "#1677FF",
                                lineHeight: "18px",
                                wordBreak: "break-word",
                                cursor: "pointer",
                              }}
                            >
                              {profile.companyProfileSlug ? (
                                <span
                                  onClick={() =>
                                    navigate(
                                      `/company/public/${profile.companyProfileSlug}`,
                                      {
                                        state: {
                                          highlight: location.state?.highlight,
                                        },
                                      },
                                    )
                                  }
                                >
                                  {window.location.origin}/company/
                                  {profile.companyProfileSlug}
                                </span>
                              ) : (
                                "-"
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ROW 2 */}
                        <div style={{ display: "flex", gap: 28 }}>
                          <InfoItem
                            label="Current Location"
                            value={profile.currentLocation}
                          />
                          <InfoItem
                            label="Preferred Location"
                            value={profile.preferredLocation?.join(", ")}
                          />

                          <InfoItem
                            label="Total Experience"
                            value={
                              profile.totalExperience
                                ? `${profile.totalExperience} years`
                                : "-"
                            }
                          />
                        </div>

                        {/* ROW 3 */}
                        <div style={{ display: "flex", gap: 28 }}>
                          <InfoItem
                            label="Expected CTC"
                            value={
                              profile.isVendor
                                ? "N/A"
                                : profile.expectedCTC
                                  ? `${profile.expectedCTC} LPA`
                                  : "-"
                            }
                          />

                          <InfoItem
                            label="Rate Card"
                            value={
                              profile.rateCardPerHour?.value
                                ? `${profile.rateCardPerHour.value} ${profile.rateCardPerHour.currency}/hr`
                                : "-"
                            }
                          />

                          <InfoItem
                            label="Joining Period"
                            value={profile.joiningPeriod}
                          />
                        </div>

                        {/* ROW 4 */}
                        <div style={{ display: "flex", gap: 28 }}>
                          <InfoItem
                            label="Portfolio"
                            value={profile.portfolioLink}
                          />
                          <InfoItem
                            label="Trailhead"
                            value={profile.trailheadUrl}
                          />

                          <InfoItem
                            label="LinkedIn"
                            value={profile.linkedInUrl}
                          />
                        </div>
                      </div>
                    ),
                  },
                ]}
                styles={{
                  header: {
                    backgroundColor: "#ffff",
                  },
                }}
              />

              <Divider />

              <Collapse
                bordered={false}
                defaultActiveKey={["skills"]}
                items={[
                  {
                    key: "skills",
                    label: (
                      <Title level={4} style={{ margin: 0 }}>
                        Skills
                      </Title>
                    ),
                    children: (
                      <>
                        {/* LINE between Skills & Primary Skills */}
                        <Divider style={{ marginTop: 2, marginBottom: 12 }} />

                        {/* PRIMARY + SECONDARY SKILLS (SAME CARD) */}
                        <div
                          style={{
                            background: "#FFFFFF",
                            border: "1px solid #EDEDED",
                            borderRadius: 10,
                            padding: 16,
                            marginBottom: 16,
                          }}
                        >
                          {/* PRIMARY SKILLS */}
                          <Text
                            strong
                            style={{ display: "block", marginBottom: 12 }}
                          >
                            Primary Skills
                          </Text>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 8,
                            }}
                          >
                            {profile.skillsJson?.filter(
                              (s) => s.level === "primary",
                            )?.length ? (
                              profile.skillsJson
                                .filter((s) => s.level === "primary")
                                .map((skill, index) => (
                                  <Tag key={index} style={skillChipStyle}>
                                    {skill.name}
                                  </Tag>
                                ))
                            ) : (
                              <Text type="secondary">No primary skills</Text>
                            )}
                          </div>

                          {/* GAP */}
                          {profile.skillsJson?.some(
                            (s) => s.level === "secondary",
                          ) && <Divider style={{ margin: "16px 0 12px" }} />}

                          {/* SECONDARY SKILLS */}
                          {profile.skillsJson?.some(
                            (s) => s.level === "secondary",
                          ) && (
                            <>
                              <Text
                                strong
                                style={{ display: "block", marginBottom: 12 }}
                              >
                                Secondary Skills
                              </Text>

                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 8,
                                }}
                              >
                                {profile.skillsJson
                                  .filter((s) => s.level === "secondary")
                                  .map((skill, index) => (
                                    <Tag
                                      key={index}
                                      style={secondarySkillChipStyle}
                                    >
                                      {skill.name}
                                    </Tag>
                                  ))}
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    ),
                  },
                ]}
              />

              <Divider />

              <Collapse
                bordered={false}
                defaultActiveKey={["clouds"]}
                items={[
                  {
                    key: "clouds",
                    label: (
                      <Title level={4} style={{ margin: 0 }}>
                        Clouds
                      </Title>
                    ),
                    children: (
                      <>
                        {/* DIVIDER (same pattern as Skills) */}
                        <Divider style={{ marginTop: 2, marginBottom: 12 }} />

                        {/* CLOUDS CARD */}
                        <div
                          style={{
                            background: "#FFFFFF",
                            border: "1px solid #EDEDED",
                            borderRadius: 10,
                            padding: 16,
                            marginBottom: 16,
                          }}
                        >
                          {/* Header */}
                          <Text
                            strong
                            style={{ display: "block", marginBottom: 12 }}
                          >
                            Primary Cloud
                          </Text>

                          {/* Cloud Chips */}
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 8,
                            }}
                          >
                            {profile.primaryClouds?.length ? (
                              profile.primaryClouds.map((cloud, index) => (
                                <Tag
                                  key={index}
                                  style={skillChipStyle} // ✅ SAME AS SKILLS
                                  closeIcon={
                                    <span
                                      style={{
                                        fontSize: 12,
                                        color: "#4C7DFF",
                                        fontWeight: 600,
                                      }}
                                    ></span>
                                  }
                                  onClose={(e) => e.preventDefault()}
                                >
                                  {cloud.name}
                                </Tag>
                              ))
                            ) : (
                              <Text type="secondary">No clouds available</Text>
                            )}
                          </div>

                          {/* SECONDARY CLOUDS */}
                          {profile.secondaryClouds?.length > 0 && (
                            <>
                              {/* spacing between primary & secondary */}
                              <Divider style={{ margin: "12px 0" }} />

                              <Text
                                strong
                                style={{ display: "block", marginBottom: 12 }}
                              >
                                Secondary Cloud
                              </Text>

                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 8,
                                }}
                              >
                                {profile.secondaryClouds.map((cloud, index) => (
                                  <Tag
                                    key={index}
                                    style={secondarySkillChipStyle} // ✅ PINK STYLE
                                    closeIcon={
                                      <span
                                        style={{
                                          fontSize: 12,
                                          color: "#F759AB",
                                          fontWeight: 600,
                                        }}
                                      ></span>
                                    }
                                    onClose={(e) => e.preventDefault()}
                                  >
                                    {cloud.name}
                                  </Tag>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    ),
                  },
                ]}
              />
              <Divider />

              <Collapse
                bordered={false}
                defaultActiveKey={["education"]}
                items={[
                  {
                    key: "education",
                    label: (
                      <Title level={4} style={{ margin: 0 }}>
                        Educational Qualifications
                      </Title>
                    ),
                    children: (
                      <div
                        style={{
                          marginTop: 16,
                          display: "flex",
                          flexDirection: "column",
                          gap: 8, // ✅ space between cards
                        }}
                      >
                        {profile.education?.length ? (
                          profile.education.map((edu, index) => (
                            <div
                              key={index}
                              style={{
                                background: "#ffffff",
                                border: "1px solid #EDEDED",
                                borderRadius: 10,
                                padding: "16px 20px",
                                boxShadow: "0px 2px 6px rgba(0,0,0,0.04)",
                              }}
                            >
                              <Row justify="space-between" align="middle">
                                {/* LEFT SIDE */}
                                <Col>
                                  <div
                                    style={{
                                      fontSize: 14,
                                      fontWeight: 600,
                                      color: "#000000",
                                      lineHeight: "18px",
                                    }}
                                  >
                                    {edu.name}
                                  </div>

                                  <div
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 400,
                                      color: "#8C8C8C",
                                      marginTop: 6,
                                    }}
                                  >
                                    {edu.educationType}
                                  </div>
                                </Col>

                                {/* RIGHT SIDE (DATE) */}
                                <Col>
                                  <div
                                    style={{
                                      fontSize: 12,
                                      color: "#8C8C8C",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {edu.fromYear} – {edu.toYear}
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          ))
                        ) : (
                          <Text type="secondary">
                            No education details available
                          </Text>
                        )}
                      </div>
                    ),
                  },
                ]}
              />

              <Divider />

              <Collapse
                bordered={true}
                defaultActiveKey={["work"]} // ✅ CLOSED by default
                items={[
                  {
                    key: "work",
                    label: (
                      <Title level={4} style={{ margin: 0 }}>
                        Work Experience
                      </Title>
                    ),
                    children: (
                      <div style={{ marginTop: 12 }}>
                        {profile.workExperience?.length ? (
                          profile.workExperience.map((exp, index) => (
                            <div
                              key={index}
                              style={{
                                marginBottom: 16,
                                padding: 16,
                                border: "1px solid #ebebeb",
                                borderRadius: 10,
                                background: "#ffffff",
                              }}
                            >
                              <p>
                                <strong>Role:</strong> {exp.role}
                              </p>
                              <p>
                                <strong>Company:</strong>{" "}
                                {exp.payrollCompanyName}
                              </p>
                              <p>
                                <strong>Duration:</strong> {exp.startDate} –{" "}
                                {exp.endDate}
                              </p>

                              {exp.projects?.map((proj, i) => (
                                <Card
                                  key={i}
                                  size="small"
                                  title={proj.projectName}
                                  style={{
                                    marginTop: 12,
                                    background: "#fafafa",
                                    borderRadius: 8,
                                  }}
                                >
                                  <p>
                                    <strong>Description:</strong>{" "}
                                    {proj.projectDescription}
                                  </p>
                                  <p>
                                    <strong>Roles & Responsibilities:</strong>{" "}
                                    {proj.rolesAndResponsibilities}
                                  </p>

                                  {proj.skillsUsed?.length > 0 && (
                                    <div style={{ marginTop: 6 }}>
                                      <strong>Skills Used:</strong>{" "}
                                      {proj.skillsUsed.map((s, j) => (
                                        <Tag key={j} color="green">
                                          {s}
                                        </Tag>
                                      ))}
                                    </div>
                                  )}
                                </Card>
                              ))}
                            </div>
                          ))
                        ) : (
                          <Text type="secondary">
                            No work experience available
                          </Text>
                        )}
                      </div>
                    ),
                  },
                ]}
              />

              <Divider />

              <Collapse
                bordered={true}
                defaultActiveKey={["certifications"]}
                items={[
                  {
                    key: "certifications",
                    label: (
                      <Title level={4} style={{ margin: 0 }}>
                        Certificates
                      </Title>
                    ),
                    children: (
                      <>
                        <Divider style={{ margin: "12px 0" }} />

                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #EDEDED",
                            borderRadius: 12,
                            padding: 16,
                          }}
                        >
                          {/* TITLE */}
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#000000",
                            }}
                          >
                            Salesforce Certifications
                          </div>

                          {/* DIVIDER (same as Figma) */}
                          <Divider style={{ margin: "12px 0" }} />

                          {/* CHIPS */}
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 8,
                            }}
                          >
                            {profile.certifications?.length ? (
                              profile.certifications.map((cert, index) => (
                                <Tag
                                  key={index}
                                  style={certificateChipStyle}
                                  closeIcon={
                                    <span
                                      style={{
                                        color: "#1677FF",
                                        fontSize: 12,
                                        fontWeight: 600,
                                      }}
                                    ></span>
                                  }
                                  onClose={(e) => {
                                    e.preventDefault(); // ✅ view-only (won’t remove)
                                  }}
                                >
                                  {cert}
                                </Tag>
                              ))
                            ) : (
                              <Text type="secondary">
                                No certifications available
                              </Text>
                            )}
                          </div>
                        </div>
                      </>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
        )}
        {/* {source !== "bench" && ( */}
        {(isModal || source !== "bench") && (
          <Col span={8}>
            <Card
              bordered={false}
              bodyStyle={{ padding: 0 }}
              style={{
                position: isModal ? "relative" : "sticky",
                top: isModal ? "unset" : 20,
                // height: isModal ? "calc(100vh - 160px)" : "calc(100vh - 30px)",
                height: isModal ? "100%" : "calc(100vh - 30px)",
                overflow: "hidden",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  height: "100%",
                  overflowY: "auto",
                  padding: 24,
                  paddingBottom: 80,
                }}
              >
                <CandidateActivity
                  // candidateId={profile?.id || id} // 🔥 fallback
                  candidateId={candidate?.id}
                  jobId={jobId && jobId}
                  defaultTab={defaultTab}
                />
              </div>
            </Card>
          </Col>
        )}
      </Row>

      <Modal
        open={isReviewModalOpen}
        footer={null}
        centered
        width={640}
        onCancel={() => setIsReviewModalOpen(false)}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 24, fontWeight: 510, color: "#101828" }}>
            Add Review
          </div>
          <div style={{ fontSize: 14, color: "#101828", marginTop: 4 }}>
            Add a short review of the candidate based on your conversation
          </div>
        </div>

        <Rate value={ratingValue} onChange={setRatingValue} />

        {/* Textarea */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
            {/* <div style={{ color: "#B60554", fontSize: 12 }}>*</div> */}
            <div style={{ fontSize: 13, fontWeight: 590 }}>Add review</div>
          </div>

          <Input.TextArea
            rows={4}
            placeholder="Review Description"
            value={tempReview}
            maxLength={1000}
            onChange={(e) => {
              const value = e.target.value;

              const regex = /^[A-Za-z0-9 .,()\/{}\[\]"';:|\\\s]*$/;

              if (!regex.test(value)) {
                message.error(
                  'Only letters, numbers, spaces and . , ( ) / { } [ ] " ; : | \\ are allowed',
                );
                return;
              }

              setTempReview(value);
            }}
            style={{ borderRadius: 8 }}
          />
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
          <Button onClick={() => setIsReviewModalOpen(false)}>Cancel</Button>

          <Button
            type="primary"
            loading={addReviewLoading}
            onClick={reloadCandidate}
          >
            Add
          </Button>
        </div>
      </Modal>

      <Modal
        open={isViewReviewsModalOpen}
        footer={null}
        centered
        width={600}
        onCancel={() => setIsViewReviewsModalOpen(false)}
        title={
          <div style={{ fontSize: 18, fontWeight: 600, color: "#101828" }}>
            All Reviews
          </div>
        }
      >
        {candidate?.ratingReviews?.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 12,
            }}
          >
            {candidate.ratingReviews.map((review, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #EDEDED",
                  borderRadius: 10,
                  padding: "14px 16px",
                  background: "#FAFAFA",
                }}
              >
                {review.comment && (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#344054",
                      background: "#EEF2FF",
                      borderRadius: 6,
                      padding: "6px 10px",
                    }}
                  >
                    {review.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Text type="secondary">No reviews yet.</Text>
        )}
      </Modal>

      <Modal
        open={isShareModalOpen}
        footer={null}
        centered
        width={500}
        onCancel={() => setIsShareModalOpen(false)}
      >
        <div style={{ marginBottom: 20 }}>
          <Title level={4}>Share Candidate</Title>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Text>
            <strong>Candidate ID:</strong> {candidate?.id}
          </Text>
          <Text>
            <strong>Role:</strong> {candidate?.role}
          </Text>
          <Text>
            <strong>Organization ID:</strong> {candidate?.organizationId}
          </Text>

          <Divider />

          <Text strong>Share Link</Text>

          <Space style={{ width: "100%" }}>
            {/* <Input
              value={`${window.location.origin}/company/candidate/${candidate?.id}`}
              readOnly
            /> */}
            <Input value={shareLink} readOnly />

            <Button
              icon={<CopyOutlined />}
              type="primary"
              onClick={() => {
                // navigator.clipboard.writeText(
                //   `${window.location.origin}/company/candidate/${candidate?.id}`,
                // );
                navigator.clipboard.writeText(shareLink);

                messageApi.success("Link copied!");
              }}
            >
              Copy
            </Button>
          </Space>
        </div>
      </Modal>

      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <ResumeTemplate ref={resumeRef} candidate={candidate?.profile} />
      </div>
    </div>
  );
};

export default CandidateDetails;
