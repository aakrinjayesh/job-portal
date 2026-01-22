
import React from "react";
import { useState, useEffect } from "react";
import { Card, Avatar, Tag, Button, message, Row, Col, Space, Tooltip   ,Typography, } from "antd";
import { SaveCandidate, UnsaveCandidate } from "../../api/api";
import { LuBookmark } from "react-icons/lu";
import { LuBookmarkCheck } from "react-icons/lu";
import {
  StarFilled,
  StarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const BenchCard = ({ candidate, onUnsave, type }) => {
  const navigate = useNavigate();
  const role = candidate?.title || "Unknown Role";
  const [saved, setSaved] = useState(candidate?.isSaved || false);
  const [savedCandidateIds, setSavedCandidateIds] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [sortedCandidates, setSortedCandidates] = useState([]);

  useEffect(() => {
  setSaved(candidate?.isSaved || false);
}, [candidate?.isSaved]);


  // Experience
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

  // Rate
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

  // 🔹 YOUR EXISTING FUNCTION (UNCHANGED)
  const handleSaveToggle = async (candidateId) => {
    const willBeSaved = !saved;
    setSaved(willBeSaved);

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
      setSaved(!willBeSaved);
    }
  };

  // 🔥 NEW FUNCTION (ADDED – DOES NOT BREAK ANYTHING)
  const handleStarClick = async (e) => {
    e.stopPropagation();

    // ✅ ONLY for Saved Candidates page
    if (type === "save" && onUnsave) {
      // remove instantly from UI
      onUnsave(candidate.id);

      // backend call
      try {
        await UnsaveCandidate({ candidateProfileId: candidate.id });
        messageApi.success("Candidate removed!");
      } catch (err) {
        messageApi.error("Failed to remove candidate");
      }
      return;
    }

    // fallback to existing logic
    handleSaveToggle(candidate.id);
  };

const TagsWithMore = ({ items = [], tagStyle, max = 3 }) => {
  const visible = items.slice(0, max);
  const remainingCount = items.length - max;

  return (
    <Space size={[8, 8]} wrap>
      {visible.map((item, index) => (
        <Tag key={index} style={tagStyle}>
          {item}
        </Tag>
      ))}

      {remainingCount > 0 && (
        <Typography.Text
          style={{
            color: "#1677ff",
            fontSize: 13,
            fontWeight: 500,
            cursor: "default", // 👈 looks like text, not clickable
          }}
        >
          +{remainingCount} more
        </Typography.Text>
      )}
    </Space>
  );
};



  return (
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
  onClick={handleStarClick}
 icon={
        saved ? (
          <LuBookmarkCheck style={{ color:"#1677ff", fontSize: 18 }} />
        ) : (
          <LuBookmark style={{ fontSize: 18 }} />
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
                 
                  <TagsWithMore
  items={clouds}
  tagStyle={{
    background: "#E7F0FE",
    border: "1px solid #1677FF",
    borderRadius: 100,
  }}
/>

                </div>
              </Card>
            </Col>
          )}

          {skills?.length > 0 && (
            <Col span={12}>
              <Card size="small" bordered>
                <Typography.Text strong>Related Skills</Typography.Text>
                <div style={{ marginTop: 12 }}>
                 
                  <TagsWithMore
  items={skills}
  tagStyle={{
    background: "#FBEBFF",
    border: "1px solid #800080",
    borderRadius: 100,
  }}
/>

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
