import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Space,
  Tag,
  Row,
  Col,
  Tooltip,
  Divider,
  Cascader,
  message,
  Checkbox,
  Button,
  Modal,
  Select,
  Dropdown,
} from "antd";
import {
  StarFilled,
  StarOutlined,
  BookFilled,
  BookOutlined,
  EnvironmentOutlined,
  LeftOutlined,
  DownOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { LuBookmark } from "react-icons/lu";
import { LuBookmarkCheck } from "react-icons/lu";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";
import { SaveJob, UnSaveJob, CVEligibility } from "../../api/api";

dayjs.extend(relativeTime);

const { Text, Title, Paragraph } = Typography;

const JobList = ({
  jobs,
  lastJobRef,
  type,
  jobids,
  portal,
  onUnsave,
  isFilterOpen,
  toggleFilter,
  hideSortAndFilter,
}) => {
  const navigate = useNavigate();
  const [sortedJobs, setSortedJobs] = useState(jobs);
  const [savedJobIds, setSavedJobIds] = useState(jobids || []);

  const [messageApi, contextHolder] = message.useMessage();
  const [loadingEligibility, setLoadingEligibility] = useState({});
  const [eligibilityByJob, setEligibilityByJob] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sortOrder, setSortOrder] = useState("dsc");

  // const sortOptions = [
  //   {
  //     value: "asc",
  //     label: "Posted Time: Low to High",
  //   },
  //   {
  //     value: "dsc",
  //     label: "Posted Time: High to Low",
  //   },
  // ];

  useEffect(() => {
    setSortedJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    setSavedJobIds(jobids || []);
  }, [jobids]);

  const handleSaveToggle = async (jobId) => {
    const getUser = localStorage.getItem("token");

    if (!getUser) {
      setShowLoginModal(true); // 🚀 open modal
      return;
    }

    const jobIndex = sortedJobs.findIndex((job) => job.id === jobId);
    if (jobIndex === -1) return;

    const originalJobs = [...sortedJobs];
    const originalSavedIds = [...savedJobIds];

    const newJobs = [...sortedJobs];
    const willBeSaved = !newJobs[jobIndex].isSaved;
    newJobs[jobIndex].isSaved = willBeSaved;
    setSortedJobs(newJobs);

    // Update savedJobIds optimistically
    if (willBeSaved) {
      setSavedJobIds((prev) => [...prev, jobId]);
    } else {
      setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
    }

    try {
      if (willBeSaved) {
        const resp = await SaveJob({ jobId });
        if (resp?.status !== "success") throw new Error();
        messageApi.success("Job saved successfully!");
      } else {
        const resp = await UnSaveJob({ jobId });
        if (resp?.status !== "success") throw new Error();
        messageApi.success("Job removed!");
        if (type === "save" && onUnsave) {
          onUnsave(jobId);
        }
      }
    } catch (err) {
      console.error(err);
      setSortedJobs(originalJobs);
      setSavedJobIds(originalSavedIds);
      messageApi.error("Something went wrong!");
    }
  };

  const handleSort = (value) => {
    setSortOrder(value);

    let sorted = [...jobs];

    sorted.sort((a, b) => {
      return value === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    });

    setSortedJobs(sorted);
  };

  const sortMenu = {
    items: [
      {
        key: "dsc",
        label: "Posted Time",
      },
      {
        key: "asc",
        label: "Posted Time(Oldest)",
      },
    ],
    onClick: ({ key }) => handleSort(key),
  };

  const handleCardClick = (job) => {
    if (portal === "company") {
      navigate("/company/job/details", {
        state: {
          job, // FULL JOB OBJECT → JobDetails renders instantly
          type,
          portal,
        },
      });
    } else {
      navigate(`/candidate/job/${job.id}`, {
        state: {
          job,
          jobids,
          type,
          portal,
        },
      });
    }
  };

  const handleCheckEligibility = async (id) => {
    const getUser = localStorage.getItem("token");

    if (!getUser) {
      setShowLoginModal(true); // 🚀 open modal
      return;
    }
    try {
      const payload = {
        jobId: id,
      };
      setLoadingEligibility((prev) => ({ ...prev, [id]: true }));
      const resp = await CVEligibility(payload);
      if (resp?.status === "success") {
        setEligibilityByJob((prev) => ({
          ...prev,
          [id]: resp?.data,
        }));
      } else {
        messageApi.error("Could not analyze eligibility");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingEligibility((prev) => ({ ...prev, [id]: false }));
    }
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
          <Text
            style={{
              color: "#1677ff",
              fontSize: 13,
              fontWeight: 500,
              cursor: "default", // 👈 looks like text
            }}
          >
            +{remainingCount} more
          </Text>
        )}
      </Space>
    );
  };

  const CompactAnalytics = ({ data }) => {
    const a = data?.analysis;

    return (
      <div
        style={{
          position: "absolute",
          right: 12,
          top: 135,
          width: 130,
          background: "#f6ffed",
          border: "1px solid #b7eb8f",
          padding: 8,
          borderRadius: 8,
          fontSize: 12,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Text strong style={{ fontSize: 14, display: "block" }}>
          {data?.fitPercentage}% Match
        </Text>

        <div style={{ marginTop: 6 }}>
          <Text type="secondary">Gap Skills:</Text> {a?.key_gap_skills?.length}
        </div>

        <div>
          <Text type="secondary">Gap Clouds:</Text> {a?.key_gap_clouds?.length}
        </div>

        <div>
          <Text type="secondary">Experience:</Text> {a?.total_experience_years}{" "}
          yr
        </div>

        <div>
          <Text type="secondary">Deal Breakers:</Text>{" "}
          {a?.scoring_breakdown?.deal_breakers_missed}
        </div>
      </div>
    );
  };

  return (
    <Row gutter={[16, 16]}>
      {contextHolder}

      <Modal
        open={showLoginModal}
        title="Login Required"
        onCancel={() => setShowLoginModal(false)}
        okText="Go to Login"
        onOk={() => navigate("/login")}
      >
        <p>Please login to use this button.</p>
      </Modal>

      {!hideSortAndFilter && (
        <Col xs={24}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Tooltip title={isFilterOpen ? "Hide Filters" : "Show Filters"}>
              <Button
                type="text"
                onClick={toggleFilter}
                style={{ fontSize: 20 }}
                icon={isFilterOpen ? <LeftOutlined /> : <RightOutlined />}
              />
            </Tooltip>

            {/* SORT TEXT STYLE */}
            <Dropdown menu={sortMenu} trigger={["click"]}>
              <span
                style={{
                  cursor: "pointer",
                  fontSize: 14,
                  color: "#6B7280",
                  userSelect: "none",
                }}
              >
                Sort by:{" "}
                <span style={{ color: "#1677FF", fontWeight: 500 }}>
                  Posted Time
                </span>{" "}
                <DownOutlined />
              </span>
            </Dropdown>
          </div>
        </Col>
      )}

      {/* JOB CARDS */}
      {sortedJobs?.map((job, index) => {
        const isLastJob = index === sortedJobs?.length - 1;

        return (
          <Col xs={24} key={job.id} ref={isLastJob ? lastJobRef : null}>
            <Card
              hoverable
              onClick={() => handleCardClick(job)}
              style={{
                borderRadius: 12,
                background: "#fff",
                padding: 0,
                cursor: "pointer",
                border: "1px solid #EEEEEE",
              }}
            >
              {/* ===== Header ===== */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                {/* Left */}
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div>
                    {job.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt="logo"
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 6,
                          border: "1px solid #F5F5F5",
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
                          color: "#FFFFFF",
                          boxShadow: "0 4px 10px rgba(22, 119, 255, 0.25)",
                          flexShrink: 0,
                        }}
                      >
                        {(job.companyName || job.role || job.title || "")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 590,
                        color: "#212121",
                      }}
                    >
                      {job.role || job.title}

                      {/* ⭐ Save Button – TOP RIGHT */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation(); // prevent navigation
                          handleSaveToggle(job.id);
                        }}
                        style={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          fontSize: 22,
                          cursor: "pointer",
                          zIndex: 2,
                        }}
                      >
                        <Tooltip
                          title={!job?.isSaved ? "Save Job" : "Unsave Job"}
                        >
                          {job?.isSaved ? (
                            <LuBookmarkCheck size={22} color="#1677ff" />
                          ) : (
                            <LuBookmark size={22} color="#9CA3AF" />
                          )}
                        </Tooltip>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: "#666666" }}>
                      {job.companyName}
                    </div>
                    <div style={{ fontSize: 12, color: "#A3A3A3" }}>
                      Posted{" "}
                      {job?.updatedAt
                        ? dayjs(job.updatedAt).fromNow()
                        : "Recently"}
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== Job Meta ===== */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginTop: 20,
                  flexWrap: "wrap",
                  color: "#666",
                  fontSize: 14,
                }}
              >
                <span>
                  <EnvironmentOutlined /> {job.location}
                </span>
                <Divider type="vertical" />
                <span>₹ {job.salary} LPA</span>
                <Divider type="vertical" />
                <span>
                  <ClockCircleOutlined /> {job.employmentType}
                </span>
                <Divider type="vertical" />
                <span>
                  <UserOutlined /> {job.experience?.number}{" "}
                  {job.experience?.type}
                </span>
              </div>

              {/* ===== Clouds + Skills (ONE LINE) ===== */}
              {(job.clouds?.length > 0 || job.skills?.length > 0) && (
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    marginTop: 20,
                    width: "100%",
                    flexWrap: "wrap", // responsive
                  }}
                >
                  {/* ===== Related Clouds ===== */}
                  {job.clouds?.length > 0 && (
                    <div
                      style={{
                        flex: 1,
                        padding: 16,
                        border: "1px solid #EEEEEE",
                        borderRadius: 8,
                        minWidth: 260,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 510,
                          marginBottom: 8,
                          color: "#444444",
                        }}
                      >
                        Related Clouds
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <TagsWithMore
                          items={job.clouds}
                          tagStyle={{
                            background: "#E7F0FE",
                            borderRadius: 100,
                            border: "1px solid #1677FF",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* ===== Related Skills ===== */}
                  {job.skills?.length > 0 && (
                    <div
                      style={{
                        flex: 1,
                        padding: 16,
                        border: "1px solid #EEEEEE",
                        borderRadius: 8,
                        minWidth: 260,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 510,
                          marginBottom: 8,
                          color: "#444444",
                        }}
                      >
                        Related Skills
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <TagsWithMore
                          items={job.skills}
                          tagStyle={{
                            background: "#FBEBFF",
                            borderRadius: 100,
                            border: "1px solid #800080",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default JobList;
