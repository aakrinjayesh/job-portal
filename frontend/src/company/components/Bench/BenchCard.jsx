import React from "react";
import { Card, Avatar, Tag, Button } from "antd";
import { StarOutlined, EnvironmentOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const BenchCard = ({ candidate, onViewDetails }) => {
  const role = candidate?.title || "Unknown Role";

  // Experience: prefer totalExperience, fallback to relevantSalesforceExperience
  const expYears =
    candidate?.totalExperience ??
    candidate?.relevantSalesforceExperience ??
    null;

  const experienceText = expYears ? `${expYears} year${expYears > 1 ? "s" : ""}` : null;

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
  const posted = candidate?.createdAt ? dayjs(candidate.createdAt).format("MMM D, YYYY") : "N/A";

  return (
    <Card hoverable style={{ borderRadius: 12, position: "relative" }} bodyStyle={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 16 }}>
        <Avatar size={70} src={candidate?.profilePicture} />

        <div style={{ flex: 1 }}>
          {/* HEADER with right-side small column */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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

            {/* Posted date */}
            
            <div style={{ textAlign: "right", color: "#999", fontSize: 13 }}>
  {posted}
</div>

          </div>

          {/* LOCATION + ID */}
<div style={{ marginTop: 10, color: "#666" }}>
  <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
    <EnvironmentOutlined /> {location}
  </span>

{/* EXPERIENCE + JOINING PERIOD INLINE */}
<div style={{ marginTop: 4, color: "#444", display: "flex", gap: 16 }}>
  {experienceText && <span>{experienceText}</span>}

  {experienceText && candidate?.joiningPeriod && (
    <span></span>   
  )}

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



          <Button type="primary" style={{ marginTop: 14 }} onClick={() => onViewDetails(candidate)}>
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BenchCard;
