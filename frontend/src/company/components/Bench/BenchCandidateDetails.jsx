import React from "react";
import { Card, Typography, Divider, Tag, Row, Col, Space } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  LinkedinOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const BenchCandidateDetails = ({ selectedCandidate }) => {
  if (!selectedCandidate) {
    return <Text type="secondary">No candidate selected.</Text>;
  }

  console.log("bench candidate", selectedCandidate);

  const {
    name,
    title,
    email,
    phoneNumber,
    currentLocation,
    preferredLocation,
    preferredJobType,
    portfolioLink,
    linkedInUrl,
    trailheadUrl,
    joiningPeriod,
    totalExperience,
    relevantSalesforceExperience,
    skillsJson,
    primaryClouds,
    secondaryClouds,
    certifications,
    workExperience,
    education,
    rateCardPerHour,
  } = selectedCandidate;

  const primarySkills = skillsJson?.filter((s) => s.level === "primary") || [];
  const secondarySkills =
    skillsJson?.filter((s) => s.level === "secondary") || [];

  return (
    <Card
      style={{
        maxWidth: 900,
        margin: "20px auto",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <Row gutter={[16, 8]}>
        <Col span={24} style={{ textAlign: "center" }}>
          <Title level={2} style={{ marginBottom: 0 }}>
            {name}
          </Title>
          <Text type="secondary">{title}</Text>
        </Col>
      </Row>

      {/* Contact Info */}
      <Row justify="center" gutter={[16, 8]} style={{ marginTop: 12 }}>
        <Col>
          <MailOutlined /> <a href={`mailto:${email}`}>{email}</a>
        </Col>
        <Col>
          <PhoneOutlined /> {phoneNumber}
        </Col>
        <Col>
          <EnvironmentOutlined /> {currentLocation}
        </Col>
      </Row>

      <Row justify="center" gutter={[16, 8]} style={{ marginTop: 8 }}>
        {portfolioLink && (
          <Col>
            <LinkOutlined />{" "}
            <a href={portfolioLink} target="_blank" rel="noopener noreferrer">
              Portfolio
            </a>
          </Col>
        )}
        {linkedInUrl && (
          <Col>
            <LinkedinOutlined />{" "}
            <a href={linkedInUrl} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </Col>
        )}
        {trailheadUrl && (
          <Col>
            <LinkOutlined />{" "}
            <a href={trailheadUrl} target="_blank" rel="noopener noreferrer">
              Trailhead
            </a>
          </Col>
        )}
      </Row>

      <Divider />

      {/* Professional Summary */}
      <Row gutter={[16, 8]}>
        <Col span={12}>
          <Text strong>Total Experience:</Text> {totalExperience} years
        </Col>
        <Col span={12}>
          <Text strong>Salesforce Experience:</Text>{" "}
          {relevantSalesforceExperience} years
        </Col>
        <Col span={12}>
          <Text strong>Joining Period:</Text> {joiningPeriod}
        </Col>
        <Col span={12}>
          <Text strong>Rate Card Per Hour:</Text>{" "}
          {rateCardPerHour
            ? `${rateCardPerHour.currency || "INR"} ${
                rateCardPerHour.value || 0
              } / hr`
            : "N/A"}
        </Col>
        <Col span={12}>
          <Text strong>Preferred Job Type:</Text> {preferredJobType?.join(", ")}
        </Col>
        <Col span={24}>
          <Text strong>Preferred Location:</Text>{" "}
          {preferredLocation?.join(", ")}
        </Col>
      </Row>

      <Divider />

      {/* Skills Section */}
      <Title level={4}>Primary Skills</Title>
      <Row gutter={[8, 8]}>
        {primarySkills.map((skill, idx) => (
          <Col key={idx}>
            <Tag color="blue">{skill.name}</Tag>
          </Col>
        ))}
      </Row>

      {secondarySkills.length > 0 && (
        <>
          <Divider dashed />
          <Title level={5}>Secondary Skills</Title>
          <Row gutter={[8, 8]}>
            {secondarySkills.map((skill, idx) => (
              <Col key={idx}>
                <Tag color="geekblue">{skill.name}</Tag>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Clouds */}
      {(primaryClouds?.length > 0 || secondaryClouds?.length > 0) && (
        <>
          <Divider />
          <Title level={4}>Salesforce Clouds</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            {primaryClouds?.length > 0 && (
              <div>
                <Text strong>Primary:</Text>{" "}
                {primaryClouds.map((c, i) => (
                  <Tag key={i} color="purple">
                    {c.name} ({c.experience} yrs)
                  </Tag>
                ))}
              </div>
            )}
            {secondaryClouds?.length > 0 && (
              <div>
                <Text strong>Secondary:</Text>{" "}
                {secondaryClouds.map((c, i) => (
                  <Tag key={i} color="magenta">
                    {c.name} ({c.experience} yrs)
                  </Tag>
                ))}
              </div>
            )}
          </Space>
        </>
      )}

      {/* Certifications */}
      {certifications?.length > 0 && (
        <>
          <Divider />
          <Title level={4}>Certifications</Title>
          <ul>
            {certifications.map((cert, i) => (
              <li key={i}>
                <Text>{cert}</Text>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Work Experience */}
      {workExperience?.length > 0 && (
        <>
          <Divider />
          <Title level={4}>Work Experience</Title>
          {workExperience.map((exp, idx) => (
            <Card key={idx} size="small" style={{ marginBottom: 16 }}>
              <Row justify="space-between">
                <Col>
                  <Text strong>{exp.role}</Text> |{" "}
                  <Text type="secondary">{exp.payrollCompanyName}</Text>
                </Col>
                <Col>
                  <Text>
                    {exp.startDate} - {exp.endDate}
                  </Text>
                </Col>
              </Row>

              {exp.projects?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  {exp.projects.map((proj, i) => (
                    <Card
                      key={i}
                      type="inner"
                      size="small"
                      title={proj.projectName}
                      style={{ marginBottom: 10 }}
                    >
                      <p>
                        <Text strong>Description:</Text>{" "}
                        {proj.projectDescription || "N/A"}
                      </p>
                      <p>
                        <Text strong>Cloud Used:</Text>{" "}
                        {proj.cloudUsed || "N/A"}
                      </p>
                      <p>
                        <Text strong>Skills Used:</Text>{" "}
                        {proj.skillsUsed?.length > 0
                          ? proj.skillsUsed.join(", ")
                          : "N/A"}
                      </p>
                      <p>
                        <Text strong>Roles & Responsibilities:</Text>{" "}
                        {proj.rolesAndResponsibilities || "N/A"}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <>
          <Divider />
          <Title level={4}>Education</Title>
          {education.map((edu, idx) => (
            <Card key={idx} size="small" style={{ marginBottom: 10 }}>
              <Text strong>{edu.name}</Text>
              <br />
              <Text>
                {edu.fromYear} - {edu.toYear} | {edu.educationType}
              </Text>
            </Card>
          ))}
        </>
      )}
    </Card>
  );
};

export default BenchCandidateDetails;
