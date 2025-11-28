import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Card, Row, Col, Tag, Divider, Button, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

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

      {/* Chat Button */}
      <Button
        type="primary"
        style={{ marginBottom: 15 }}
        onClick={() =>
          navigate(`/company/chat`, {
            state: { candidate, jobId },
          })
        }
      >
        Chat with {candidate.name}
      </Button>

      <Card title={candidate.name} bordered={false}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <p>
              <strong>Email:</strong> {candidate.email}
            </p>
            <p>
              <strong>Title:</strong> {profile.title}
            </p>
            <p>
              <strong>Phone:</strong> {profile.phoneNumber}
            </p>
            <p>
              <strong>Current Location:</strong> {profile.currentLocation}
            </p>
            <p>
              <strong>Preferred Job Type:</strong>{" "}
              {profile.preferredJobType?.join(", ")}
            </p>
            <p>
              <strong>Total Experience:</strong> {profile.totalExperience} years
            </p>
            <p>
              <strong>Expected CTC:</strong> {profile.expectedCTC} LPA
            </p>
            <p>
              <strong>Rate Card:</strong>{" "}
              {profile.rateCardPerHour?.value
                ? `${profile.rateCardPerHour.value} ${profile.rateCardPerHour.currency}/hr`
                : `-`}
            </p>
          </Col>

          <Col span={12}>
            <p>
              <strong>LinkedIn:</strong>{" "}
              <a href={profile.linkedInUrl} target="_blank" rel="noreferrer">
                {profile.linkedInUrl}
              </a>
            </p>
            <p>
              <strong>Portfolio:</strong>{" "}
              <a href={profile.portfolioLink} target="_blank" rel="noreferrer">
                {profile.portfolioLink}
              </a>
            </p>
            <p>
              <strong>Trailhead:</strong>{" "}
              <a href={profile.trailheadUrl} target="_blank" rel="noreferrer">
                {profile.trailheadUrl}
              </a>
            </p>
            <p>
              <strong>Joining Period:</strong> {profile.joiningPeriod}
            </p>
          </Col>
        </Row>

        <Divider />

        <Title level={4}>Skills</Title>
        <div style={{ marginBottom: "1rem" }}>
          {profile.skillsJson?.map((skill, index) => (
            <Tag key={index} color="blue">
              {skill.name}
            </Tag>
          ))}
        </div>

        <Divider />

        <Title level={4}>Education</Title>
        {profile.education?.map((edu, index) => (
          <Paragraph key={index}>
            🎓 {edu.name} ({edu.fromYear} - {edu.toYear}) — {edu.educationType}
          </Paragraph>
        ))}

        <Divider />

        <Title level={4}>Work Experience</Title>
        {profile.workExperience?.map((exp, index) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <p>
              <strong>Role:</strong> {exp.role}
            </p>
            <p>
              <strong>Company:</strong> {exp.payrollCompanyName}
            </p>
            <p>
              <strong>Duration:</strong> {exp.startDate} – {exp.endDate}
            </p>

            {exp.projects?.map((proj, i) => (
              <Card
                key={i}
                size="small"
                title={proj.projectName}
                style={{
                  marginTop: "8px",
                  background: "#fafafa",
                  borderRadius: "8px",
                }}
              >
                <p>
                  <strong>Description:</strong> {proj.projectDescription}
                </p>
                <p>
                  <strong>Roles & Responsibilities:</strong>{" "}
                  {proj.rolesAndResponsibilities}
                </p>
                {proj.skillsUsed?.length > 0 && (
                  <div style={{ marginTop: "4px" }}>
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
        ))}

        <Divider />

        <Title level={4}>Certifications</Title>
        {profile.certifications?.map((cert, index) => (
          <Tag key={index} color="purple">
            {cert}
          </Tag>
        ))}
      </Card>
    </div>
  );
};

export default CandidateDetails;
