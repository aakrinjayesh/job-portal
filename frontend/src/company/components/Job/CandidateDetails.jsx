import React from "react";
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
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import CandidateActivity from "../activity/CandidateActivity";

const { Title, Paragraph, Text } = Typography;

const CandidateDetails = () => {
  const location = useLocation();
  const { candidate, jobId } = location.state || {};
  const navigate = useNavigate();
  const { id } = useParams(); // userId in URL

  if (!candidate) {
    return <p style={{ padding: "20px" }}>No candidate details found.</p>;
  }

  const profile = candidate.profile || {};

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

  const InfoItem = ({ label, value }) => (
    <div>
      {/* LABEL */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 600, // ✅ semibold
          color: "#000000", // ✅ label grey
          lineHeight: "16px",
        }}
      >
        {label}
      </div>

      {/* VALUE */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 400, // ✅ regular
          color: "#2E2E2E", // ✅ value color
          lineHeight: "18px",
          marginTop: 4, // ✅ spacing like Figma
        }}
      >
        {value || "-"}
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
    <div style={{ padding: "20px" }}>
      {/* Back Button */}
      <Button
        type="text"
        style={{ marginBottom: 5 }}
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
                </Space>
              </Space>

              <Button
                type="default"
                style={{
                  backgroundColor: "#D1E4FF",
                  color: "#310000", // ✅ text color
                  height: 40,
                  width: 176,
                  borderRadius: 100,
                  border: "none",

                  // TEXT STYLES (matches Figma)
                  fontSize: 14,
                  fontWeight: 590, // ✅ semi-bold
                  lineHeight: "14px", // 100%
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
            </Row>
          </div>

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
                      background: "#ffffff",
                      padding: 24,
                      borderRadius: 10,
                      border: "1px solid #ebebeb",
                    }}
                  >
                    <Row gutter={[24, 24]}>
                      {/* ROW 1 */}
                      <Col span={8}>
                        <InfoItem label="Email" value={candidate.email} />
                      </Col>
                      <Col span={8}>
                        <InfoItem label="Title" value={profile.title} />
                      </Col>
                      <Col span={8}>
                        <InfoItem label="Phone" value={profile.phoneNumber} />
                      </Col>

                      {/* ROW 2 */}
                      <Col span={8}>
                        <InfoItem
                          label="Current Location"
                          value={profile.currentLocation}
                        />
                      </Col>
                      <Col span={8}>
                        <InfoItem
                          label="Preferred Job Type"
                          value={profile.preferredJobType?.join(", ")}
                        />
                      </Col>
                      <Col span={8}>
                        <InfoItem
                          label="Total Experience"
                          value={
                            profile.experience
                              ? `${profile.experience.number} ${profile.experience.type}`
                              : "-"
                          }
                        />
                      </Col>

                      {/* ROW 3 */}
                      <Col span={8}>
                        <InfoItem
                          label="Expected CTC"
                          value={
                            profile.expectedCTC
                              ? `${profile.expectedCTC} LPA`
                              : "-"
                          }
                        />
                      </Col>
                      <Col span={8}>
                        <InfoItem
                          label="Rate Card"
                          value={
                            profile.rateCardPerHour?.value
                              ? `${profile.rateCardPerHour.value} ${profile.rateCardPerHour.currency}/hr`
                              : "-"
                          }
                        />
                      </Col>
                      <Col span={8}>
                        <InfoItem
                          label="Joining Period (in days)"
                          value={profile.joiningPeriod}
                        />
                      </Col>

                      {/* ROW 4 */}
                      <Col span={8}>
                        <InfoItem
                          label="LinkedIn"
                          value={
                            profile.linkedInUrl ? (
                              <a
                                href={profile.linkedInUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {profile.linkedInUrl}
                              </a>
                            ) : (
                              "-"
                            )
                          }
                        />
                      </Col>
                      <Col span={8}>
                        <InfoItem
                          label="Portfolio"
                          value={
                            profile.portfolioLink ? (
                              <a
                                href={profile.portfolioLink}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {profile.portfolioLink}
                              </a>
                            ) : (
                              "-"
                            )
                          }
                        />
                      </Col>
                      <Col span={8}>
                        <InfoItem
                          label="Trailhead"
                          value={
                            profile.trailheadUrl ? (
                              <a
                                href={profile.trailheadUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {profile.trailheadUrl}
                              </a>
                            ) : (
                              "-"
                            )
                          }
                        />
                      </Col>
                    </Row>
                  </div>
                ),
              },
            ]}
            styles={
              {
                 header: {
        backgroundColor: '#ffff',
      },
              }
            }
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

                    {/* PRIMARY SKILLS CARD */}
                    <div
                      style={{
                        background: "#FFFFFF", // ✅ white background
                        border: "1px solid #EDEDED",
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 16,
                      }}
                    >
                      {/* Header */}
                      <Text strong style={{ display: "block", marginBottom: 12 }}>
                        Primary Skills
                      </Text>

                      {/* Skill Chips */}
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
                      <Text type="secondary">No education details available</Text>
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
                      <Text type="secondary">No work experience available</Text>
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
            title="Activity"
            bordered={false}
            style={{
              position: "sticky",
              top: 20,
              maxHeight: "calc(100vh - 40px)",
              overflowY: "auto",
            }}
          >
            <CandidateActivity candidateId={profile.userId} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CandidateDetails;