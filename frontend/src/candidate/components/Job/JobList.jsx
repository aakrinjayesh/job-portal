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
  Button
} from "antd";
import {
  StarFilled,
  StarOutlined,
  EnvironmentOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

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
}) => {
  const navigate = useNavigate();
  const [sortedJobs, setSortedJobs] = useState(jobs);
  const [savedJobIds, setSavedJobIds] = useState(jobids || []);
  const [messageApi, contextHolder] = message.useMessage();
  const [loadingEligibility, setLoadingEligibility] = useState({});
  const [eligibilityByJob, setEligibilityByJob] = useState({});

  const sortOptions = [
    {
      value: "createdAt",
      label: "Posted Time",
      children: [
        { value: "asc", label: "Oldest First" },
        { value: "desc", label: "Recently Posted First" },
      ],
    },
  ];

  useEffect(() => {
    setSortedJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    setSavedJobIds(jobids || []);
  }, [jobids]);

  const handleSaveToggle = async (jobId) => {
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
    if (!value || value.length < 2) return;
    const [field, order] = value;

    let sorted = [...jobs];

    if (field === "createdAt") {
      sorted.sort((a, b) => {
        return order === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    setSortedJobs(sorted);
  };

  const handleCardClick = (id) => {
    if (portal === "company") {
      navigate(`/company/job/${id}`, { state: { type, jobids, portal } });
    } else {
      navigate(`/candidate/job/${id}`, { state: { type, jobids } });
    }
  };

  const handleCheckEligibility = async (id) => {
    try {
      const payload = {
        jobId: id,
      };
      setLoadingEligibility((prev) => ({ ...prev, [id]: true }));
      const resp = await CVEligibility(payload);
      if (resp.status === "success") {
        setEligibilityByJob((prev) => ({
          ...prev,
          [id]: resp.data,
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

  const CompactAnalytics = ({ data }) => {
    const a = data.analysis;

    return (
      <div
        style={{
          position: "absolute",
          right: 12,
          top: 12,
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
          {data.fitPercentage}% Match
        </Text>

        <div style={{ marginTop: 6 }}>
          <Text type="secondary">Gap Skills:</Text> {a.key_gap_skills.length}
        </div>

        <div>
          <Text type="secondary">Gap Clouds:</Text> {a.key_gap_clouds.length}
        </div>

        <div>
          <Text type="secondary">Experience:</Text> {a.total_experience_years} yr
        </div>

        <div>
          <Text type="secondary">Deal Breakers:</Text>{" "}
          {a.scoring_breakdown.deal_breakers_missed}
        </div>
      </div>
    );
  };

  return (
    <Row gutter={[16, 16]}>
      {contextHolder}

      {/* ⭐ TOP ROW — LEFT FILTER TOGGLE + RIGHT SORT OPTION */}
      <Col xs={24}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          {/* LEFT — FILTER BUTTON */}
          <Tooltip title={isFilterOpen ? "Hide Filters" : "Show Filters"}>
          <Button
  type="text"
  onClick={toggleFilter}
  style={{ fontSize: 20 }}
  icon={
    isFilterOpen ? (
      <MenuFoldOutlined />
    ) : (
      <MenuUnfoldOutlined />
    )
  }
/>
</Tooltip>


          {/* RIGHT — SORT */}
          <Cascader
            options={sortOptions}
            onChange={handleSort}
            placeholder="Sort Jobs"
            style={{ width: 250 }}
            allowClear
          />
        </div>
      </Col>

      {/* JOB CARDS */}
      {sortedJobs?.map((job, index) => {
        const isLastJob = index === sortedJobs?.length - 1;
        const isSaved = savedJobIds.includes(job.id);

        return (
          <Col xs={24} key={job.id} ref={isLastJob ? lastJobRef : null}>
            <Card
              hoverable
              onClick={() => handleCardClick(job.id)}
              style={{
                borderRadius: 12,
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Title
                  level={5}
                  style={{ margin: 0 }}
                  onClick={() => handleCardClick(job.id)}
                >
                  {job?.role}
                </Title>

                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveToggle(job.id);
                  }}
                  style={{ cursor: "pointer", fontSize: 20 }}
                >
                  <Tooltip title={!job.isSaved ? "Save Job" : "Unsave Job"}>
                    {job.isSaved ? (
                      <StarFilled style={{ color: "#faad14" }} />
                    ) : (
                      <StarOutlined />
                    )}
                  </Tooltip>
                </span>
              </div>

              <Space align="center" style={{ marginTop: 6 }}>
                <Text strong style={{ color: "#1890ff" }}>
                  {job.companyName}
                </Text>
                {job.rating && (
                  <>
                    <StarFilled style={{ color: "#faad14" }} />
                    <Text>{job.rating}</Text>
                  </>
                )}
              </Space>

              <div style={{ marginTop: 12 }}>
                <Space split={<Divider type="vertical" />} wrap>
                  {job.experience && (
                    <Text>
                      {job.experience.number} {job.experience.type}
                    </Text>
                  )}

                  {job.location && (
                    <Space>
                      <EnvironmentOutlined />
                      <Tooltip title={job.location}>
                        <Text>{job.location}</Text>
                      </Tooltip>
                    </Space>
                  )}

                 {job.salary && <Text>₹ {job.salary} Lacs PA</Text>}
                </Space>
              </div>

              {job.description && (
                <Space
                  align="start"
                  style={{ marginTop: 12 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileTextOutlined style={{ marginTop: 4 }} />
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
                    style={{ margin: 0 }}
                  >
                    {job.description}
                  </Paragraph>
                </Space>
              )}

              <div style={{ marginTop: 12 }}>
                {job.clouds?.map((cloud, idx) => (
                  <Tag color="gray" key={idx} style={{ borderRadius: 20 }}>
                    {cloud}
                  </Tag>
                ))}
              </div>

              {job.skills?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  {job.skills.map((skill, i) => (
                    <Tag key={i} color="blue" style={{ borderRadius: 20 }}>
                      {skill}
                    </Tag>
                  ))}
                </div>
              )}

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {job.createdAt && (
                  <Text type="secondary">
                    Posted {dayjs(job.createdAt).fromNow()} (
                    {dayjs(job.createdAt).format("MMM D, YYYY")})
                  </Text>
                )}

                {eligibilityByJob[job.id] ? (
                  <CompactAnalytics data={eligibilityByJob[job.id]} />
                ) : (
                  portal !== "company" && (
                    <Button
                      type="primary"
                      loading={loadingEligibility[job.id]}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckEligibility(job.id);
                      }}
                    >
                      Check Eligibility
                    </Button>
                  )
                )}
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default JobList;
