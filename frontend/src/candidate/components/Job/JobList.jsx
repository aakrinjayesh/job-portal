import React from "react";
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
} from "antd";
import {
  StarFilled,
  EnvironmentOutlined,
  FileTextOutlined,
  StarOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SaveJob } from "../../api/api";

dayjs.extend(relativeTime);

const { Text, Title, Paragraph } = Typography;

const JobList = ({ jobs, lastJobRef, type, jobids, portal }) => {
  const navigate = useNavigate();
  const [sortedJobs, setSortedJobs] = useState(jobs);
  const [messageApi, contextHolder] = message.useMessage();

  const sortOptions = [
    {
      value: "createdAt",
      label: "Posted Date Time",
      children: [
        { value: "asc", label: "Ascending" },
        { value: "desc", label: "Descending" },
      ],
    },
  ];

  useEffect(() => {
    setSortedJobs(jobs);
  }, [jobs]);

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

  const handleSave = async (id) => {
    try {
      const payload = {
        jobId: id,
      };
      const resp = await SaveJob(payload);
      if (resp.status === "success") {
        messageApi.success("Job Saved Successfully!");
      } else {
        messageApi.error("Failed to Save Job");
      }
    } catch (err) {
      messageApi.error("Something went wrong!");
    }
  };

  return (
    <Row gutter={[16, 16]}>
      {contextHolder}

      {/* ✅ SORT DROPDOWN — shown ONLY once */}
      <Col xs={24}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
          }}
        >
          <Cascader
            options={sortOptions}
            onChange={handleSort}
            placeholder="Sort Jobs"
            style={{ width: 250 }}
            allowClear
          />
        </div>
      </Col>

      {/* ✅ DISPLAY SORTED JOBS */}
      {sortedJobs?.map((job, index) => {
        const isLastJob = index === sortedJobs?.length - 1;

        return (
          <Col xs={24} key={job?.id} ref={isLastJob ? lastJobRef : null}>
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
                  alignItems: "flex-start",
                }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  {job?.role}
                </Title>
              </div>

              <Space align="center" style={{ marginTop: 6 }}>
                <Text strong style={{ color: "#1890ff" }}>
                  {job?.companyName}
                </Text>
                {job?.rating && (
                  <>
                    <StarFilled style={{ color: "#faad14" }} />
                    <Text>{job?.rating}</Text>
                  </>
                )}
              </Space>

              <div style={{ marginTop: 12 }}>
                <Space split={<Divider type="vertical" />} wrap>
                  {job?.experience && <Text>{job?.experience}</Text>}

                  {job?.location && (
                    <Space>
                      <EnvironmentOutlined />
                      <Tooltip title={job?.location}>
                        <Text>{job?.location}</Text>
                      </Tooltip>
                    </Space>
                  )}

                  {job?.salary && (
                    <Text>₹{Number(job?.salary).toLocaleString()} PA</Text>
                  )}
                </Space>
              </div>

              {job?.description && (
                <Space
                  align="start"
                  style={{ marginTop: 12 }}
                  onClick={(e) => e.stopPropagation()}
                >
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
              )}

              <div style={{ marginTop: 12 }}>
                {job.clouds?.map((cloud, index) => (
                  <Tag color="gray" key={index} style={{ borderRadius: 20 }}>
                    {cloud}
                  </Tag>
                ))}
              </div>

              {job?.skills?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  {job?.skills.map((skill, i) => (
                    <Tag key={i} color="blue" style={{ borderRadius: 20 }}>
                      {skill}
                    </Tag>
                  ))}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                {job?.createdAt && (
                  <Text type="secondary">
                    Posted {dayjs(job?.createdAt).fromNow()} (
                    {dayjs(job?.createdAt).format("MMM D, YYYY")})
                  </Text>
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
