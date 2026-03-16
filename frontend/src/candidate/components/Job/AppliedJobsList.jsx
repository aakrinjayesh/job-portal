import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Row,
  Col,
  Tooltip,
  Divider,
  Empty,
} from "antd";
import {
  StarFilled,
  EnvironmentOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text, Title, Paragraph } = Typography;

// ✅ same formatSalary as JobList — handles all formats
const formatSalary = (salary) => {
  if (!salary && salary !== 0) return "Not Disclosed";
  const str = String(salary).trim();
  if (/lpa/i.test(str)) return str;
  const rangeMatch = str.match(/^(\d[\d,]*)\s*[-–]\s*(\d[\d,]*)$/);
  if (rangeMatch) {
    const min = Number(rangeMatch[1].replace(/,/g, ""));
    const max = Number(rangeMatch[2].replace(/,/g, ""));
    if (!isNaN(min) && !isNaN(max) && max > 0) {
      return `${(min / 100000).toFixed(1)} - ${(max / 100000).toFixed(1)} LPA`;
    }
  }
  const single = Number(str.replace(/,/g, ""));
  if (!isNaN(single) && single > 0) {
    return `${(single / 100000).toFixed(1)} LPA`;
  }
  return "Not Disclosed";
};

// ✅ moved outside map — never re-defined on each render
const TagsWithMore = ({ items = [], tagStyle, max = 3 }) => {
  const visible = items.slice(0, max);
  const remaining = items.length - max;
  return (
    <>
      {visible.map((item, index) => (
        <Tooltip title={item} key={index}>
          <Tag
            style={{
              ...tagStyle,
              borderRadius: 100,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "inline-block",
              maxWidth: 200,
            }}
          >
            {item}
          </Tag>
        </Tooltip>
      ))}
      {remaining > 0 && (
        <Tag
          style={{
            borderRadius: 100,
            background: "#F5F5F5",
            border: "1px dashed #999",
          }}
        >
          +{remaining} more
        </Tag>
      )}
    </>
  );
};

const AppliedJobsList = ({
  applications,
  lastJobRef,
  isMobile: isMobileProp, // ✅ accept from parent (AppliedJobs.jsx passes this)
}) => {
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  // ✅ fallback local detection if parent doesn't pass prop
  const [isMobileLocal, setIsMobileLocal] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobileLocal(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileLocal;

  const handleCardClick = (jobId) => {
    navigate(`/candidate/job/${jobId}`, {
      state: {
        jobids: applications.map((app) => app.job.id),
      },
    });
  };

  return (
    <Row gutter={[16, 16]}>
      {/* FILTER OPTIONS */}
      <Col span={24}>
   <div style={{
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 16,
}}>
          {["All", "Pending", "Shortlisted", "Rejected"].map((status) => (
            <Tag
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                cursor: "pointer",
                borderRadius: 20,
                padding: "4px 14px",
                background: statusFilter === status ? "#1677FF" : "#F5F5F5",
                color: statusFilter === status ? "#fff" : "#555",
                border:
                  statusFilter === status
                    ? "1px solid #1677FF"
                    : "1px solid #ddd",
                margin: 0,
              }}
            >
              {status}
            </Tag>
          ))}
        </div>
      </Col>

      {applications?.length === 0 && (
        <Col span={24}>
          <Empty description="No applications found" />
        </Col>
      )}

      {applications
       ?.filter((app) =>
          statusFilter === "All"
            ? app.status !== "BookMark"
            : app.status === statusFilter,
        )
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        .map((app, index) => {
          const job = app?.job;
          const isLast = index === applications.length - 1;

          return (
            <Col xs={24} key={app?.id} ref={isLast ? lastJobRef : null}>
             <Card
  hoverable
  onClick={() => handleCardClick(job?.id)}
  style={{
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  }}
  bodyStyle={{
    padding: isMobile ? "12px" : "24px",
  }}
>
                {/* Header */}
              {/* Header */}
<div
  style={{
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    flexWrap: "nowrap",
  }}
>
  {/* Logo */}
  <div style={{ flexShrink: 0 }}>
    {job?.companyLogo ? (
      <img
        src={job.companyLogo}
        alt="logo"
        style={{
          width: isMobile ? 40 : 56,
          height: isMobile ? 40 : 56,
          borderRadius: 12,
          objectFit: "cover",
          border: "1px solid #f0f0f0",
        }}
      />
    ) : (
      <div
        style={{
          width: isMobile ? 40 : 56,
          height: isMobile ? 40 : 56,
          borderRadius: isMobile ? 8 : 12,
          background: "linear-gradient(135deg, #1677FF, #69B1FF)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isMobile ? 16 : 22,
          fontWeight: 700,
          color: "#fff",
        }}
      >
        {(job?.companyName || job?.role || "").charAt(0).toUpperCase()}
      </div>
    )}
  </div>

  {/* Job info */}
  <div style={{ flex: 1, minWidth: 0 }}>
    {/* Title row — role + status on right (desktop only) */}
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <div
        style={{
          fontSize: isMobile ? 13 : 16,
          fontWeight: 600,
          color: "#212121",
          lineHeight: "20px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          marginBottom: 2,
          flex: 1,
        }}
      >
        {job?.role}
      </div>

      {/* STATUS TAG — right side on desktop only */}
      {!isMobile && (
        <Tag
          color={
            app?.status === "Pending"
              ? "orange"
              : app?.status === "Shortlisted"
                ? "green"
                : app?.status === "Rejected"
                  ? "red"
                  : "blue"
          }
          style={{
            fontWeight: 500,
            borderRadius: 20,
            padding: "2px 10px",
            fontSize: 13,
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          {app?.status}
        </Tag>
      )}
    </div>

    {/* STATUS TAG — below role on mobile only */}
    {isMobile && (
      <Tag
        color={
          app?.status === "Pending"
            ? "orange"
            : app?.status === "Shortlisted"
              ? "green"
              : app?.status === "Rejected"
                ? "red"
                : "blue"
        }
        style={{
          fontWeight: 500,
          borderRadius: 20,
          padding: "1px 8px",
          fontSize: 11,
          display: "inline-block",
          marginBottom: 4,
        }}
      >
        {app?.status}
      </Tag>
    )}

    <Text
      strong
      style={{
        color: "#1890ff",
        fontSize: isMobile ? 12 : 14,
        display: "block",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {job?.companyName}
    </Text>
  </div>
</div>

                {/* ── META ROW — wraps freely, nothing clipped ── */}
               <div
  style={{
    display: "flex",
    gap: isMobile ? 4 : 10,
    flexWrap: "wrap",
    color: "#666",
    fontSize: isMobile ? 11 : 13,
    marginTop: 10,
    rowGap: isMobile ? 4 : 6,
  }}
>
                  {job?.location && (
                    <span><EnvironmentOutlined /> {job.location}</span>
                  )}
                  {job?.salary && (
                    <>
                      <Divider type="vertical" style={{ margin: "0 2px" }} />
                      <span>₹ {formatSalary(job.salary)}</span>
                    </>
                  )}
                  {job?.employmentType && (
                    <>
                      <Divider type="vertical" style={{ margin: "0 2px" }} />
                      <span><ClockCircleOutlined /> {job.employmentType}</span>
                    </>
                  )}
                  {job?.experience && (
                    <>
                      <Divider type="vertical" style={{ margin: "0 2px" }} />
                      <span>
                        <UserOutlined />{" "}
                        {job.experience.min && job.experience.max
                          ? `${job.experience.min}-${job.experience.max} ${job.experience.type}`
                          : `${job.experience.number ?? ""} ${job.experience.type ?? ""}`}
                      </span>
                    </>
                  )}
                  {job?.experienceLevel && (
                    <>
                      <Divider type="vertical" style={{ margin: "0 2px" }} />
                      <span>{job.experienceLevel}</span>
                    </>
                  )}
                </div>

                {/* ✅ SKILLS + CLOUDS — hidden on mobile, shown on desktop */}
                {!isMobile && (
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                      marginTop: 12,
                    }}
                  >
                    {job?.clouds?.length > 0 && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1,
                          padding: 12,
                          border: "1px solid #EEEEEE",
                          borderRadius: 8,
                          minWidth: 220,
                          height: 120,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          Related Clouds
                        </div>
                        <div
                          style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                        >
                          <TagsWithMore
                            items={job.clouds}
                            tagStyle={{
                              background: "#E7F0FE",
                              border: "1px solid #1677FF",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {job?.skills?.length > 0 && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1,
                          padding: 12,
                          border: "1px solid #EEEEEE",
                          borderRadius: 8,
                          minWidth: 220,
                          height: 120,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          Related Skills
                        </div>
                        <div
                          style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                        >
                          <TagsWithMore
                            items={job.skills}
                            tagStyle={{
                              background: "#FBEBFF",
                              border: "1px solid #800080",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Applied Info */}
              <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    gap: 8,
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
    <ClockCircleOutlined style={{ color: "#999", flexShrink: 0 }} />
    <Text
      type="secondary"
      style={{
        fontSize: isMobile ? 11 : 13,
        whiteSpace: isMobile ? "nowrap" : "normal",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {isMobile
        ? dayjs(app?.appliedAt).format("MMM D, YYYY")
        : `Applied ${dayjs(app?.appliedAt).fromNow()} (${dayjs(app?.appliedAt).format("MMM D, YYYY")})`}
    </Text>
  </div>
  <Button
    type="link"
    size={isMobile ? "small" : "middle"}
    style={{ flexShrink: 0, paddingRight: 0 }}
    onClick={(e) => {
      e.stopPropagation();
      handleCardClick(job?.id);
    }}
  >
    View Job
  </Button>
</div>
              </Card>
            </Col>
          );
        })}
    </Row>
  );
};

export default AppliedJobsList;