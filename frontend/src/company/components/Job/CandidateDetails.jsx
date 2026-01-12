import React from "react";
import { useState, useEffect } from "react";
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
} from "antd";
import { ArrowLeftOutlined, WhatsAppOutlined } from "@ant-design/icons";
import CandidateActivity from "../activity/CandidateActivity";
import { SaveCandidateRating } from "../../api/api";



const { Title, Paragraph, Text } = Typography;

const CandidateDetails = () => {
  const location = useLocation();
  // const { candidate, jobId } = location.state || {};
  const navigate = useNavigate();
  const { id } = useParams(); // userId in URL
  const [messageApi, contextHolder] = message.useMessage();

  // 🔹 Review state (per candidate)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewsByCandidate, setReviewsByCandidate] = useState({});
  const [tempReview, setTempReview] = useState("");

  const [ratingValue, setRatingValue] = useState(0);

const { candidate: initialCandidate, jobId } = location.state || {};
const [candidate, setCandidate] = useState(initialCandidate);


// const reloadCandidate = async () => {
//   try {
//     const res = await GetCandidateDeatils({ jobId });

//     const updatedCandidate = res.data.find(
//       (c) => c.profile.id === candidate.profile.id
//     );

//     if (updatedCandidate) {
//       setCandidate(updatedCandidate); // 🔥 THIS updates UI
//     }
//   } catch (err) {
//     console.error("Failed to reload candidate", err);
//   }
// };

const reloadCandidate = async () => {
  try {
    const res = await SaveCandidateRating({
      candidateProfileId: candidate.profile.id,
      rating: ratingValue,
      comment: tempReview,
    });

    // 🔥 MANUALLY update UI instead of refetching
    setCandidate((prev) => ({
      ...prev,
      avgRating: ratingValue,
      ratingReviews: [
        ...(prev.ratingReviews || []),
        {
          rating: ratingValue,
          comment: tempReview,
        },
      ],
    }));
  } catch (err) {
    console.error(err);
  }
};


  useEffect(() => {
    const savedReviews = localStorage.getItem("candidateReviews");
    if (savedReviews) {
      setReviewsByCandidate(JSON.parse(savedReviews));
    }
  }, []);

  if (!candidate) {
    return <p style={{ padding: "20px" }}>No candidate details found.</p>;
  }

  const profile = candidate.profile || {};
  const summary = profile.summary;

  console.log("CandidateDetails candidate:", candidate);
  console.log("candidate.userId:", candidate.userId);

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

  return (
    <div style={{ padding: "0px" }}>
      {contextHolder}
      {/* Back Button */}
      <Button
        type="text"
        style={{ marginBottom: 5, height: 25 }}
        onClick={() =>
          navigate("/company/candidates", { state: { id: jobId } })
        }
        icon={<ArrowLeftOutlined />}
      >
        Back
      </Button>
      <Row gutter={16}>
        <Col span={16}>
          <Card bordered={false}>
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid #EDEDED",
                marginBottom: 16,
              }}
            >
              <Row align="middle" justify="space-between">
                <Space size={12} align="center">
                  <Avatar size={40}>{candidate.name?.charAt(0)}</Avatar>

                  <Space direction="vertical" size={0}>
                    <Text style={{ fontWeight: 600 }}>{candidate.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Applied {candidate.updatedAt}
                    </Text>

                    <Space size={8} align="center">
                      {/* <Rate allowHalf defaultValue={2.5} /> */}

                      <Rate
  disabled
  value={Math.round(candidate.avgRating || 0)}
/>

                      <Text
                        style={{
                          fontSize: 12,
                          color: "#1677FF",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                        onClick={() => {
                          setTempReview(
                            reviewsByCandidate[candidate.applicationId] || ""
                          );
                          setIsReviewModalOpen(true);
                        }}
                      >
                        Add Review
                      </Text>
                    </Space>
                  </Space>
                </Space>
                <Space>
                  <Tooltip title={`Whatsapp ${candidate.name}`}>
                    <Button
                      shape="circle"
                      icon={<WhatsAppOutlined />}
                      onClick={() => {
                        const number = candidate?.profile?.phoneNumber;

                        if (!number) {
                          messageApi.error("Phone number not available");
                          return;
                        }

                        const message = `Hi ${candidate.name},`;
                        const url = `https://wa.me/${number}?text=${encodeURIComponent(
                          message
                        )}`;

                        window.open(url, "_blank");
                      }}
                    />
                  </Tooltip>

                  <Button
                    type="default"
                    style={{
                      backgroundColor: "#D1E4FF",
                      color: "#310000",
                      height: 40,
                      borderRadius: 100,
                      border: "none",

                      // ✅ IMPORTANT FIX
                      paddingLeft: 20,
                      paddingRight: 20,
                      whiteSpace: "nowrap",

                      // TEXT STYLES
                      fontSize: 14,
                      fontWeight: 590,
                      lineHeight: "14px",
                      textAlign: "center",
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial",
                    }}
                    onClick={() =>
                      navigate("/company/chat", {
                        state: { candidate, jobId },
                      })
                    }
                  >
                    Chat with {candidate.name}
                  </Button>
                </Space>
              </Row>
            </div>

            {/* ⭐ Recruiter Reviews – AVERAGE BASED */}
{candidate.ratingReviews?.length > 0 && (
  <div style={{ marginBottom: 20 }}>
    <Divider style={{ margin: "12px 0" }} />

    <Title level={5} style={{ marginBottom: 8 }}>
      Recruiter Reviews
    </Title>

    {/* ⭐ SHOW ONLY ONE AVERAGE STAR */}
    <Space align="center" size={8} style={{ marginBottom: 12 }}>
      <Rate
        disabled
        value={Math.round(candidate.avgRating || 0)}
      />
      <Text type="secondary" style={{ fontSize: 12 }}>
        ({candidate.ratingReviews.length} reviews)
      </Text>
    </Space>

    {/* 🧾 SHOW COMMENTS ONLY */}
    {candidate.ratingReviews.map((review, index) => (
      review.comment && (
        <div
          key={index}
          style={{
            padding: 10,
            marginBottom: 6,
            border: "1px solid #EDEDED",
            borderRadius: 8,
            background: "#FAFAFA",
            fontSize: 13,
          }}
        >
          {review.comment}
        </div>
      )
    ))}
  </div>
)}


            {summary?.trim()?.length > 0 && (

              
              <div
                style={{
                  marginTop: 12,
                  marginBottom: 20,
                  backgroundColor: "#D1E4FF", // ✅ same blue as Chat button
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
                        <InfoItem label="Email" value={candidate.email} />
                        <InfoItem label="Title" value={profile.title} />
                        <InfoItem label="Phone" value={profile.phoneNumber} />
                      </div>

                      {/* ROW 2 */}
                      <div style={{ display: "flex", gap: 28 }}>
                        <InfoItem
                          label="Current Location"
                          value={profile.currentLocation}
                        />
                        <InfoItem
                          label="Preferred Job Type"
                          value={profile.preferredJobType?.join(", ")}
                        />
                        <InfoItem
                          label="Total Experience"
                          value={
                            profile.experience
                              ? `${profile.experience.number} ${profile.experience.type}`
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
                        <InfoItem
                          label="LinkedIn"
                          value={profile.linkedInUrl}
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
                          label="Joining Period (in days)"
                          value={profile.joiningPeriod}
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

                      {/* <div
                      style={{
                        background: "#FFFFFF", // ✅ white background
                        border: "1px solid #EDEDED",
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 16,
                      }}
                    >
                      
                      <Text strong style={{ display: "block", marginBottom: 12 }}>
                        Primary Skills
                      </Text>

                     
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        {profile.skillsJson?.length ? (
                          profile.skillsJson.map((skill, index) => (
                            <Tag
                              key={index}
                              style={skillChipStyle}
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
                              {skill.name}
                            </Tag>
                          ))
                        ) : (
                          <Text type="secondary">No skills available</Text>
                        )}
                      </div>
                    </div> */}

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
                          style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                        >
                          {profile.skillsJson?.filter(
                            (s) => s.level === "primary"
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
                          (s) => s.level === "secondary"
                        ) && <Divider style={{ margin: "16px 0 12px" }} />}

                        {/* SECONDARY SKILLS */}
                        {profile.skillsJson?.some(
                          (s) => s.level === "secondary"
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
                              <strong>Company:</strong> {exp.payrollCompanyName}
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
              <CandidateActivity candidateId={profile.userId} />
            </div>
          </Card>
        </Col>
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
            <div style={{ color: "#B60554", fontSize: 12 }}>*</div>
            <div style={{ fontSize: 13, fontWeight: 590 }}>Add review</div>
          </div>

          <Input.TextArea
            rows={4}
            placeholder="Review Description"
            value={tempReview}
            onChange={(e) => setTempReview(e.target.value)}
            style={{ borderRadius: 8 }}
          />
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
          <Button onClick={() => setIsReviewModalOpen(false)}>Cancel</Button>

          {/* <Button
            type="primary"
            onClick={() => {
              const updatedReviews = {
                ...reviewsByCandidate,
                [candidate.applicationId]: tempReview,
              };

              setReviewsByCandidate(updatedReviews);
              localStorage.setItem(
                "candidateReviews",
                JSON.stringify(updatedReviews)
              );

              setIsReviewModalOpen(false);
            }}
          >
            Add
          </Button> */}

          {/* <Button
  type="primary"
  onClick={async () => {
    if (!ratingValue) {
      message.error("Please select rating");
      return;
    }

    await SaveCandidateRating({
      candidateProfileId: candidate.profile.id,
      rating: ratingValue,
      comment: tempReview,
    });

    await reloadCandidate(); 

    message.success("Rating saved");
    setIsReviewModalOpen(false);
  }}
>
  Add
</Button> */}

<Button
  type="primary"
  onClick={async () => {
    if (!ratingValue) {
      message.error("Please select rating");
      return;
    }

    await reloadCandidate();
    message.success("Rating saved");
    setIsReviewModalOpen(false);
  }}
>
  Add
</Button>

        </div>
      </Modal>
    </div>
  );
};

export default CandidateDetails;
