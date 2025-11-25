import React from "react";
import {
  Card,
  Typography,
  Divider,
  Tag,
  Row,
  Col,
  Space,
  Avatar,
  Tooltip,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  LinkedinOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const BenchCandidateDetails = ({ selectedCandidate }) => {
  if (!selectedCandidate) {
    return (
      <Card
        style={{
          textAlign: "center",
          marginTop: 50,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Text type="secondary">No candidate selected.</Text>
      </Card>
    );
  }

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
      bordered={false}
      style={{
        maxWidth: 950,
        margin: "30px auto",
        borderRadius: 20,
        background: "#ffffff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        padding: "24px 32px",
      }}
    >
      {/* Header Section */}
      <Row align="middle" gutter={16}>
        {/* <Col flex="80px">
          <Avatar
            size={80}
            icon={<UserOutlined />}
            style={{
              backgroundColor: "#1677ff",
              color: "#fff",
              fontSize: 28,
            }}
          />
        </Col> */}

        <Col flex="80px">
  <Avatar
    size={80}
    // if profilePicture exists, use it; add ?t=... to bust cache when url changes
    src={
      selectedCandidate?.profilePicture
        ? `${selectedCandidate.profilePicture}?t=${new Date().getTime()}`
        : undefined
    }
    icon={!selectedCandidate?.profilePicture ? <UserOutlined /> : null}
    style={{
      backgroundColor: selectedCandidate?.profilePicture ? undefined : "#1677ff",
      color: selectedCandidate?.profilePicture ? undefined : "#fff",
      fontSize: 28,
      objectFit: "cover",
    }}
    // when image fails to load, fallback to initials/icon
    onError={(e) => {
      // remove src to show icon fallback
      e.currentTarget.src = "";
    }}
    // ensure React will re-render Avatar when profilePicture changes
    key={selectedCandidate?.profilePicture || "no-profile-pic"}
  />
</Col>

        <Col flex="auto">
          <Title level={2} style={{ marginBottom: 0 }}>
            {name}
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            {title}
          </Text>
          <div style={{ marginTop: 6 }}>
            <Tag color="blue">{totalExperience} yrs Exp</Tag>
            <Tag color="purple">
              {relevantSalesforceExperience} yrs Salesforce
            </Tag>
            {joiningPeriod && <Tag color="green">Join in {joiningPeriod}</Tag>}
          </div>
        </Col>
      </Row>

      <Divider />

      {/* Contact Info */}
      <Row justify="start" gutter={[24, 12]}>
        {email && (
          <Col>
            <MailOutlined />{" "}
            <a href={`mailto:${email}`} style={{ color: "#1677ff" }}>
              {email}
            </a>
          </Col>
        )}
        {phoneNumber && (
          <Col>
            <PhoneOutlined /> {phoneNumber}
          </Col>
        )}
        {currentLocation && (
          <Col>
            <EnvironmentOutlined /> {currentLocation}
          </Col>
        )}
      </Row>

      <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
        {portfolioLink && (
          <Col>
            <Tooltip title="Portfolio Link">
              <LinkOutlined />{" "}
              <a href={portfolioLink} target="_blank" rel="noreferrer">
                Portfolio
              </a>
            </Tooltip>
          </Col>
        )}
        {linkedInUrl && (
          <Col>
            <Tooltip title="LinkedIn Profile">
              <LinkedinOutlined />{" "}
              <a href={linkedInUrl} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </Tooltip>
          </Col>
        )}
        {trailheadUrl && (
          <Col>
            <Tooltip title="Trailhead Profile">
              <LinkOutlined />{" "}
              <a href={trailheadUrl} target="_blank" rel="noreferrer">
                Trailhead
              </a>
            </Tooltip>
          </Col>
        )}
      </Row>

      <Divider />

      {/* Professional Details */}
      <Row gutter={[16, 12]}>
        <Col span={12}>
          <Text strong>Preferred Job Type:</Text>{" "}
          {preferredJobType?.join(", ") || "N/A"}
        </Col>
        <Col span={12}>
          <Text strong>Preferred Location:</Text>{" "}
          {preferredLocation?.join(", ") || "N/A"}
        </Col>
        <Col span={12}>
          <Text strong>Rate Card:</Text>{" "}
          {rateCardPerHour
            ? `${rateCardPerHour.currency || "INR"} ${rateCardPerHour.value}/hr`
            : "N/A"}
        </Col>
      </Row>

      {/* Skills */}
      <Divider />
      <Title level={4} style={{ marginBottom: 12 }}>
        Skills
      </Title>

      <Text strong>Primary Skills:</Text>
      <div style={{ margin: "8px 0 12px" }}>
        {primarySkills.length > 0
          ? primarySkills.map((s, i) => (
              <Tag key={i} color="blue" style={{ borderRadius: 16 }}>
                {s.name}
              </Tag>
            ))
          : "N/A"}
      </div>

      {secondarySkills.length > 0 && (
        <>
          <Text strong>Secondary Skills:</Text>
          <div style={{ marginTop: 8 }}>
            {secondarySkills.map((s, i) => (
              <Tag key={i} color="geekblue" style={{ borderRadius: 16 }}>
                {s.name}
              </Tag>
            ))}
          </div>
        </>
      )}

      {/* Clouds */}
      {(primaryClouds?.length > 0 || secondaryClouds?.length > 0) && (
        <>
          <Divider />
          <Title level={4}>Salesforce Clouds</Title>
          {primaryClouds?.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <Text strong>Primary:</Text>{" "}
              {primaryClouds.map((c, i) => (
                <Tag key={i} color="purple" style={{ borderRadius: 16 }}>
                  {c.name} ({c.experience} yrs)
                </Tag>
              ))}
            </div>
          )}
          {secondaryClouds?.length > 0 && (
            <div>
              <Text strong>Secondary:</Text>{" "}
              {secondaryClouds.map((c, i) => (
                <Tag key={i} color="magenta" style={{ borderRadius: 16 }}>
                  {c.name} ({c.experience} yrs)
                </Tag>
              ))}
            </div>
          )}
        </>
      )}

      {/* Certifications */}
      {certifications?.length > 0 && (
        <>
          <Divider />
          <Title level={4}>Certifications</Title>
          <Space wrap>
            {certifications.map((cert, i) => (
              <Tag key={i} color="success" style={{ borderRadius: 16 }}>
                {cert}
              </Tag>
            ))}
          </Space>
        </>
      )}

      {/* Work Experience */}
      {workExperience?.length > 0 && (
        <>
          <Divider />
          <Title level={4}>Work Experience</Title>
          {workExperience.map((exp, idx) => (
            <Card
              key={idx}
              type="inner"
              title={
                <span style={{ fontWeight: 600 }}>
                  {exp.role} @ {exp.payrollCompanyName}
                </span>
              }
              style={{
                marginBottom: 12,
                borderRadius: 10,
                background: "#fafafa",
              }}
            >
              <Text type="secondary">
                {exp.startDate} - {exp.endDate}
              </Text>
              {exp.projects?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  {exp.projects.map((proj, i) => (
                    <Card
                      key={i}
                      type="inner"
                      size="small"
                      title={proj.projectName}
                      style={{
                        marginBottom: 8,
                        background: "#fff",
                        borderRadius: 8,
                      }}
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
                        {proj.skillsUsed?.join(", ") || "N/A"}
                      </p>
                      <p>
                        <Text strong>Responsibilities:</Text>{" "}
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
            <Card
              key={idx}
              size="small"
              style={{
                marginBottom: 8,
                borderRadius: 8,
                background: "#fafafa",
              }}
            >
              <Text strong>{edu.name}</Text>
              <br />
              <Text type="secondary">
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
