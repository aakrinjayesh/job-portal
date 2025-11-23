import React from "react";
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
  message,
} from "antd";
import {
  StarFilled,
  EnvironmentOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SaveJob } from "../../api/api";

dayjs.extend(relativeTime);

const { Text, Title, Paragraph } = Typography;

const JobList = ({ jobs, lastJobRef, type, jobids }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const handleCardClick = (id) => {
    navigate(`/candidate/job/${id}`, { state: { type, jobids } });
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
    } catch (error) {
      console.log("error", error);
      messageApi.error("SomeThing Went Wrong!");
    }
  };

  return (
    <Row gutter={[16, 16]}>
      {contextHolder}
      {jobs?.map((job, index) => {
        const isLastJob = index === jobs?.length - 1;
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

              {/* {job?.description && (
                <Space align="start" style={{ marginTop: 12 }}>
                  <FileTextOutlined style={{ marginTop: 4 }} />
                  <Text type="secondary">
                    {job.description.length > 190
                      ? `${job.description.substring(0, 190)}...`
                      : job.description}
                  </Text>
                </Space>
              )} */}

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
                      // onExpand: (e) => e.stopPropagation(),
                    }}
                    style={{ margin: 0 }}
                  >
                    {job.description}
                  </Paragraph>
                </Space>
              )}

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
                {type !== "save" && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(job.id);
                    }}
                    type="text"
                    style={{ color: "#1890ff" }}
                  >
                    Save
                  </Button>
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
