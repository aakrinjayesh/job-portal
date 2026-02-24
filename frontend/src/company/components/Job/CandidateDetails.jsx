import React from "react";
import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { useRef } from "react";
import ResumeTemplate from "../Bench/ResumeTemplate";

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

const CandidateDetails = () => {
  console.log("candidates details page");
  // const { candidate, jobId } = location.state || {};
  const navigate = useNavigate();
  const { id } = useParams(); // userId in URL
  const [messageApi, contextHolder] = message.useMessage();
  const location = useLocation();
  // 🔹 Review state (per candidate)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // const [reviewsByCandidate, setReviewsByCandidate] = useState({});
  const [tempReview, setTempReview] = useState("");

  const [ratingValue, setRatingValue] = useState(0);

  const [progress, setProgress] = useState(0);
  const [readyToShow, setReadyToShow] = useState(false);

  const { jobId, source } = location.state || {};
  const [candidate, setCandidate] = useState(null);
  const [addReviewLoading, setAddReviewLoading] = useState(false);
  const resumeRef = useRef();

  const activityOnly = location?.state?.activityOnly;
  const defaultTab = location?.state?.defaultTab;
  const [loadingCandidate, setLoadingCandidate] = useState(true);
  console.log("sourcw", source);
  console.log("location", location);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setProgress(10);
        setReadyToShow(false);
        setLoadingCandidate(true);

        const res = await getCandidateDetails(id);

        if (res.status === "success") {
          setCandidate(res.candidate);
        }
      } catch (err) {
        message.error("Failed to load candidate details");
      } finally {
        setProgress(100);

        setTimeout(() => {
          setLoadingCandidate(false);
          setReadyToShow(true);
        }, 300);
      }
    };

    if (id) fetchCandidate();
  }, [id]);

  useEffect(() => {
    if (!loadingCandidate) return;

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 250);

    return () => clearInterval(interval);
  }, [loadingCandidate]);

  const reloadCandidate = async () => {
    try {
      setAddReviewLoading(true);

      const res = await SaveCandidateRating({
        candidateProfileId: candidate.profile.id,
        rating: ratingValue,
        comment: tempReview,
      });

      if (res.status === "success") {
        messageApi.success(res.message || "Review Submitted!");
        // 🔥 REFETCH UPDATED DATA
        const updated = await getCandidateDetails(id);

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
          minHeight: "100vh",
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
  const shareLink = candidate
    ? `${window.location.origin}/company/candidate/${candidate.id}?role=${candidate.role}&orgId=${candidate.organizationId}`
    : "";

  return (
    <div style={{ padding: "0px" }}>
      {contextHolder}

      {/* Back Button */}

      <Row gutter={16}>
        {/* <Col span={16}> */}
        {/* <Col span={16} style={{ position: "relative" }}> */}
        {!activityOnly && (
          <Col
            span={source === "bench" ? 24 : 16}
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
                      size={40}
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
                      {source !== "bench" && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Applied {candidate.updatedAt}
                        </Text>
                      )}

                      <Space size={8} align="center">
                        {/* <Rate allowHalf defaultValue={2.5} /> */}

                        <Rate
                          disabled
                          value={Math.round(candidate.avgRating || 0)}
                        />
                        {source !== "bench" && (
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#1677FF",
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                            onClick={() => {
                              setIsReviewModalOpen(true);
                            }}
                          >
                            Add Review
                          </Text>
                        )}
                      </Space>
                    </Space>
                  </Space>
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
                  </Space>
                </Row>
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

                        {/* <div style={{ display: "flex", gap: 28 }}>
                          {profile.isVendor ? (
                            <>
                              <InfoItem
                                label="POC Email"
                                value={profile.vendor?.email}
                              />
                              <InfoItem
                                label="POC Phone"
                                value={profile.vendor?.phoneNumber}
                              />
                            </>
                          ) : (
                            <>
                              <InfoItem label="Email" value={profile.email} />
                              <InfoItem
                                label="Phone"
                                value={profile.phoneNumber}
                              />
                            </>
                          )}

                          <InfoItem label="Title" value={profile.title} />
                        </div> */}
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
                                    ? `+91 ${profile.vendor.phoneNumber}`
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
                                    ? `+91 ${profile.phoneNumber}`
                                    : "-"
                                }
                              />
                            </>
                          )}

                          <InfoItem label="Title" value={profile.title} />
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
                              profile.expectedCTC
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
                          {/* <InfoItem
                            label="LinkedIn"
                            value={profile.linkedInUrl}
                          /> */}
                          <InfoItem
                            label="Joining Period (in days)"
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
                          {/* <InfoItem
                            label="Joining Period (in days)"
                            value={profile.joiningPeriod}
                          /> */}
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
                defaultActiveKey={[]}
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
                defaultActiveKey={[]}
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
                defaultActiveKey={[]}
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
                bordered={false}
                defaultActiveKey={[]} // ✅ CLOSED by default
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
                bordered={false}
                defaultActiveKey={[]}
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
        {source !== "bench" && (
          <Col span={8}>
            <Card
              bordered={false}
              bodyStyle={{
                padding: 0,
                height: "100%",
              }}
              style={{
                position: "sticky",
                top: 20,
                height: "calc(100vh - 30px)",
                overflow: "hidden",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  height: "100%",
                  overflowY: "auto",
                  padding: 24,
                }}
              >
                <CandidateActivity
                  candidateId={profile?.id || id} // 🔥 fallback
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
