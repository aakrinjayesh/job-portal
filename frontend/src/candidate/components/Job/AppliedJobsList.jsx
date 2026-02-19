// import React, { useEffect } from "react";
import React, { useState } from "react";

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
import { useEffect } from "react";

dayjs.extend(relativeTime);

const { Text, Title, Paragraph } = Typography;

const AppliedJobsList = ({ applications, lastJobRef }) => {
  const [statusFilter, setStatusFilter] = useState("All");

  const navigate = useNavigate();

  const handleCardClick = (jobId) => {
    navigate(`/candidate/job/${jobId}`, { state: { type: "apply" } });
  };

  return (
    <Row gutter={[16, 16]}>
      {/* FILTER OPTIONS */}
      <Col span={24}>
        <Space style={{ marginBottom: 16 }}>
          {["All", "Pending", "Accepted", "Rejected"].map((status) => (
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
              }}
            >
              {status}
            </Tag>
          ))}
        </Space>
      </Col>

      {applications?.length === 0 && (
        <Col span={24}>
          <Empty description="No applications found" />
        </Col>
      )}
      {/* {applications?.map((app) => {
        const job = app?.job;
        return (
          <Col xs={24} key={app?.id}>
            <Card
              hoverable
              onClick={() => handleCardClick(job?.id)}
              style={{
                borderRadius: 12,
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            > */}

      {/* {applications?.map((app, index) => { */}
      {applications
        ?.filter((app) =>
          statusFilter === "All" ? true : app.status === statusFilter,
        )
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        .map((app, index) => {
          const job = app?.job;
          const isLast = index === applications.length - 1;

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

          return (
            <Col
              xs={24}
              key={app?.id}
              ref={isLast ? lastJobRef : null} // 👈 ADD REF HERE
            >
              <Card
                hoverable
                onClick={() => handleCardClick(job?.id)}
                style={{
                  borderRadius: 12,
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                  }}
                >
                  {/* LEFT SIDE (Logo + Role + Company) */}
                  <div style={{ display: "flex", gap: 12 }}>
                    {job?.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt="logo"
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 12,
                          objectFit: "cover",
                          border: "1px solid #f0f0f0",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 12,
                          background:
                            "linear-gradient(135deg, #1677FF, #69B1FF)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        {(job?.companyName || job?.role || "")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div>
                      <Title level={5} style={{ margin: 0 }}>
                        {job?.role}
                      </Title>

                      <Text strong style={{ color: "#1890ff" }}>
                        {job?.companyName}
                      </Text>
                    </div>
                  </div>

                  {/* STATUS TAG */}
                  <Tag
                    color={
                      app?.status === "Pending"
                        ? "orange"
                        : app?.status === "Accepted"
                          ? "green"
                          : app?.status === "Rejected"
                            ? "red"
                            : "blue"
                    }
                    style={{
                      fontWeight: 500,
                      borderRadius: 20,
                      padding: "2px 10px",
                    }}
                  >
                    {app?.status}
                  </Tag>
                </div>

                {/* One Line Details */}
                <div style={{ marginTop: 8 }}>
                  <Space
                    split={<Divider type="vertical" />}
                    wrap={false}
                    style={{
                      fontSize: 13,
                      color: "#666",
                    }}
                  >
                    {/* Location */}
                    {job?.location && (
                      <span>
                        <EnvironmentOutlined /> {job.location}
                      </span>
                    )}

                    {/* Experience */}
                    {job?.salary && <span>₹ {job.salary} Lacs PA</span>}

                    {job?.employmentType && (
                      <span>
                        <ClockCircleOutlined /> {job.employmentType}
                      </span>
                    )}
                    {job?.experience && (
                      <span>
                        <UserOutlined /> {job.experience.number}{" "}
                        {job.experience.type}
                      </span>
                    )}
                  </Space>
                </div>

                {/* Description */}
                {/* {job?.description && (
                  <Space align="start" style={{ marginTop: 12 }}>
                    <FileTextOutlined style={{ marginTop: 4 }} />
                    <Paragraph
                      type="secondary"
                      ellipsis={{
                        rows: 2,
                        expandable: true,
                        symbol: "more",
                      }}
                      style={{ margin: 0 }}
                    >
                      {job.description}
                    </Paragraph>
                  </Space>
                )} */}

                {/* Skills */}
                {/* Clouds */}
                {/* {job?.clouds?.length > 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      gap: "8px 8px",
                      display: "flex",
                      flexWrap: "wrap",
                    }}
                  >
                    {job.clouds.map((cloud, i) => (
                      <Tag
                        key={i}
                        style={{
                          background: "#FBEBFF",
                          borderRadius: 20,
                          border: "1px solid #800080",
                          color: "#800080",
                        }}
                      >
                        {cloud}
                      </Tag>
                    ))}
                  </div>
                )}

                {job?.skills?.length > 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      gap: "8px 8px",
                      display: "flex",
                      flexWrap: "wrap",
                    }}
                  >
                    {job.skills.map((skill, i) => (
                      <Tag
                        key={i}
                        style={{
                          background: "#E7F0FE", // light blue background
                          borderRadius: 20,
                          border: "1px solid #1677FF",
                          color: "#1677FF",
                        }}
                      >
                        {skill}
                      </Tag>
                    ))}
                  </div>
                )} */}
                {/* SKILLS + CLOUDS (Same as Find Job) */}
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

                {/* Applied Info */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 14,
                  }}
                >
                  <Space>
                    <ClockCircleOutlined style={{ color: "#999" }} />
                    <Text type="secondary">
                      Applied {dayjs(app?.appliedAt).fromNow()} (
                      {dayjs(app?.appliedAt).format("MMM D, YYYY")})
                    </Text>
                  </Space>
                  <Button
                    type="link"
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
