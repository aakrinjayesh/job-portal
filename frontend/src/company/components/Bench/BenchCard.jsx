import React from "react";
import { useState, useEffect } from "react";
import { Card, Avatar, Tag, Button,message } from "antd";
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
      style={{ borderRadius: 12, position: "relative" }}
      bodyStyle={{ padding: 20 }}
      onClick={() =>
        navigate("/company/bench/candidates", {
          state: { candidate, from: "find" },
        })
      }
    >
      {contextHolder}
      <div style={{ display: "flex", gap: 16 }}>
        <Avatar size={70} src={candidate?.profilePicture} />

        <div style={{ flex: 1 }}>
          {/* HEADER with right-side small column */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              {/* TOP TITLE → Candidate Name */}
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {candidate?.name || "Unknown Candidate"}
              </div>

              {/* BELOW → Role */}
              <div style={{ color: "#1677ff", marginTop: 6, fontWeight: 600 }}>
                {role}
              </div>
            </div>

            {/* 👇 Vendor / Individual Badge */}
  <div style={{ marginRight: "175px"}}>
  {candidate?.isVendor ? (
    <Tag icon={<TeamOutlined />} color="blue">
      Vendor Candidate
    </Tag>
  ) : (
    <Tag icon={<UserOutlined />} color="green">
      Individual Candidate
    </Tag>
  )}
</div>

   <Button
        type="text"
        onClick={(e) => {
                    e.stopPropagation();
                    handleSaveToggle(candidate?.id);
                  }}
        icon={
          saved ? (
            <StarFilled style={{ color: "#faad14" }} />
          ) : (
            <StarOutlined />
          )
        }
        style={{ position: "absolute", top: 12, right: 12 }}
      />


            {/* Posted date */}
            {/* <div style={{ textAlign: "right", color: "#999", fontSize: 13 }}>
              {posted}
            </div>  */}
          </div>

          {/* LOCATION + ID */}
          <div style={{ marginTop: 10, color: "#666" }}>
            <span
              style={{ display: "inline-flex", gap: 8, alignItems: "center" }}
            >
              <EnvironmentOutlined /> {location}
            </span>

            {/* EXPERIENCE + JOINING PERIOD INLINE */}
            <div
              style={{ marginTop: 4, color: "#444", display: "flex", gap: 16 }}
            >
              {experienceText && <span>{experienceText}</span>}

              {experienceText && candidate?.joiningPeriod && <span></span>}

              {candidate?.joiningPeriod && (
                <span>Joining: {candidate.joiningPeriod}</span>
              )}
            </div>
          </div>

          {/* CLOUD TAGS */}
          {clouds.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {clouds.map((c) => (
                <Tag key={c}>{c}</Tag>
              ))}
            </div>
          )}

          {/* SKILL TAGS */}
          {skills.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {skills.map((s) => (
                <Tag key={s} color="blue">
                  {s}
                </Tag>
              ))}
            </div>
          )}

          {/* Rate & Posted */}
          {rate && <div style={{ fontWeight: 700 }}>{rate}</div>}
        </div>
      </div>
    </Card>
  );
};

export default BenchCard;
