import React from "react";
import { useState, useEffect } from "react";
import { Card, Avatar, Tag, Button,message,Row,Col,Space,Typography} from "antd";
import { SaveCandidate,UnsaveCandidate} from "../../api/api";
import {
  StarFilled,
  StarOutlined,
  EnvironmentOutlined,
  TeamOutlined,UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const BenchCard = ({ candidate }) => {
  const navigate = useNavigate();
  const role = candidate?.title || "Unknown Role";
  const [saved, setSaved] = useState(candidate?.isSaved || false);
  const [savedCandidateIds, setSavedCandidateIds] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [sortedCandidates, setSortedCandidates] = useState([]);


  // Experience: prefer totalExperience, fallback to relevantSalesforceExperience
  const expYears =
    candidate?.totalExperience ??
    candidate?.relevantSalesforceExperience ??
    null;

  const experienceText = expYears
    ? `${expYears} year${expYears > 1 ? "s" : ""}`
    : null;

  // Location
  const location =
    candidate?.preferredLocation?.length > 0
      ? candidate.preferredLocation[0]
      : candidate?.currentLocation || "N/A";

  // Rate card - show only if numeric
  const rate =
    typeof candidate?.rateCardPerHour === "number"
      ? `₹ ${candidate.rateCardPerHour}`
      : candidate?.rateCardPerHour?.value
      ? `₹ ${candidate.rateCardPerHour.value}`
      : null;

  const clouds = candidate?.primaryClouds?.map((c) => c.name || c) || [];
  const skills = candidate?.skillsJson?.map((s) => s.name || s) || [];
  const posted = candidate?.createdAt
    ? dayjs(candidate.createdAt).format("MMM D, YYYY")
    : "N/A";

    // useEffect(() => {
    //     setSavedCandidateIds(candidateids || []);
    //   }, [candidateids]);

   const handleSaveToggle = async (candidateId) => {
  const willBeSaved = !saved;
  setSaved(willBeSaved); // ✅ toggle immediately for UI

  try {
    if (willBeSaved) {
      const resp = await SaveCandidate({ candidateProfileId: candidateId });
      if (resp?.status !== "success") throw new Error();
      messageApi.success("Candidate saved!");
    } else {
      const resp = await UnsaveCandidate({ candidateProfileId: candidateId });
      if (resp?.status !== "success") throw new Error();
      messageApi.success("Candidate removed!");
    }
  } catch (error) {
    console.error("Save error:", error);
    setSaved(!willBeSaved); // rollback if API fails
    // messageApi.error("Something went wrong!");
  }
};





  return (
    // <Card hoverable style={{ borderRadius: 12, position: "relative" }} bodyStyle={{ padding: 20 }}>
    
  <Card
  hoverable
  style={{ width: "100%", borderRadius: 12, position: "relative" }}
  bodyStyle={{ padding: 20 }}
  onClick={() =>
    navigate("/company/bench/candidates", {
      state: { candidate, from: "find" },
    })
  }
>
  {contextHolder}

  {/* ===== HEADER ===== */}
<Row justify="space-between" align="middle">
  <Space>
    <Avatar size={44} src={candidate?.profilePicture} />
    <div>
      <Typography.Text strong>
        {candidate?.name || "Unknown Candidate"}
      </Typography.Text>
      <br />
      <Typography.Text type="secondary">
        {role}
      </Typography.Text>
    </div>
  </Space>

  {/* RIGHT SIDE */}
  <Space>
    <Tag color={candidate?.isVendor ? "blue" : "green"}>
      {candidate?.isVendor ? "Vendor Candidate" : "Individual Candidate"}
    </Tag>

    <Button
      type="text"
      onClick={(e) => {
        e.stopPropagation();
        handleSaveToggle(candidate?.id);
      }}
      icon={
        saved ? (
          <StarFilled style={{ color: "#FAAD14", fontSize: 18 }} />
        ) : (
          <StarOutlined style={{ fontSize: 18 }} />
        )
      }
    />
  </Space>
</Row>


  {/* ===== BASIC INFO ===== */}
  <Row gutter={24} style={{ marginTop: 20 }}>
    <Col span={6}>
      <Typography.Text strong>Location</Typography.Text>
      <br />
      <Typography.Text>{location}</Typography.Text>
    </Col>

    <Col span={6}>
      <Typography.Text strong>Years of Experience</Typography.Text>
      <br />
      <Typography.Text>{experienceText || "-"}</Typography.Text>
    </Col>

    <Col span={6}>
      <Typography.Text strong>Joining</Typography.Text>
      <br />
      <Typography.Text>{candidate?.joiningPeriod || "-"}</Typography.Text>
    </Col>

    <Col span={6}>
      <Typography.Text strong>Budget</Typography.Text>
      <br />
      <Typography.Text>{rate || "-"}</Typography.Text>
    </Col>
  </Row>

  {/* ===== CLOUDS & SKILLS ===== */}
  {(clouds?.length > 0 || skills?.length > 0) && (
    <Row gutter={16} style={{ marginTop: 24 }}>
      {clouds?.length > 0 && (
        <Col span={12}>
          <Card size="small" bordered>
            <Typography.Text strong>Related Clouds</Typography.Text>
            <div style={{ marginTop: 12 }}>
              <Space wrap>
                {clouds.map((cloud, i) => (
                  <Tag
                    key={i}
                    style={{
                      background: "#E7F0FE",
                      border: "1px solid #1677FF",
                      borderRadius: 100,
                    }}
                  >
                    {cloud}
                  </Tag>
                ))}
              </Space>
            </div>
          </Card>
        </Col>
      )}

      {skills?.length > 0 && (
        <Col span={12}>
          <Card size="small" bordered>
            <Typography.Text strong>Related Skills</Typography.Text>
            <div style={{ marginTop: 12 }}>
              <Space wrap>
                {skills.map((skill, i) => (
                  <Tag
                    key={i}
                    style={{
                      background: "#FBEBFF",
                      border: "1px solid #800080",
                      borderRadius: 100,
                    }}
                  >
                    {skill}
                  </Tag>
                ))}
              </Space>
            </div>
          </Card>
        </Col>
      )}
    </Row>
  )}
</Card>


  );
};

export default BenchCard;
