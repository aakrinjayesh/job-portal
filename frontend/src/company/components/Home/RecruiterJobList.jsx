import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Spin,
  Checkbox,
  message,
  Modal,
  Select,
  Input,
  Form,
} from "antd";
import {
  StarFilled,
  EnvironmentOutlined,
  CloudOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Text, Title } = Typography;
const { Option } = Select;

const RecruiterJobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchJobs();
  }, []);

  // ✅ Fetch job list
  const fetchJobs = async () => {
    try {
      const response = await axios.get("http://localhost:3000/jobs");
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      message.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle selecting/deselecting a job
  const handleSelect = (jobId) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  // ✅ Open modal
  const showDeleteModal = () => {
    if (selectedJobs.length === 0) {
      message.warning("Please select at least one job to delete.");
      return;
    }
    setIsModalOpen(true);
  };

  // ✅ Submit delete with reason
  const handleConfirmDelete = async () => {
    try {
      const values = await form.validateFields();
      const { reason, customReason } = values;

      const finalReason = reason === "Other" ? customReason : reason;

      const response = await axios.delete("http://localhost:3000/jobs/delete", {
        data: { jobIds: selectedJobs, deletedReason: finalReason },
      });

      message.success(response.data.message || "Jobs deleted successfully");
      setJobs((prev) => prev.filter((job) => !selectedJobs.includes(job.id)));
      setSelectedJobs([]);
      form.resetFields();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting jobs:", error);
      message.error("Failed to delete jobs");
    }
  };

  if (loading) return <Spin size="large" style={{ marginTop: 100 }} />;

  return (
    <>
      {/* ✅ Delete Selected Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          disabled={selectedJobs.length === 0}
          onClick={showDeleteModal}
        >
          Delete Selected
        </Button>
      </div>

      {/* ✅ Delete Reason Modal */}
      <Modal
        title="Delete Selected Job(s)"
        open={isModalOpen}
        onOk={handleConfirmDelete}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText="Submit"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Select Reason"
            name="reason"
            rules={[{ required: true, message: "Please select a reason" }]}
          >
            <Select placeholder="Choose a reason">
              <Option value="Job Position filled">Job Position filled</Option>
              <Option value="Job Role & Requirement Changed">
                Job Role & Requirement Changed
              </Option>
              <Option value="Budget or Hiring Freeze">
                Budget or Hiring Freeze
              </Option>
              <Option value="Recruitment Strategy Change">
                Recruitment Strategy Change
              </Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          {/* ✅ Show input if user selects "Other" */}
          <Form.Item
            noStyle
            shouldUpdate={(prev, current) => prev.reason !== current.reason}
          >
            {({ getFieldValue }) =>
              getFieldValue("reason") === "Other" ? (
                <Form.Item
                  label="Custom Reason"
                  name="customReason"
                  rules={[
                    { required: true, message: "Please enter your reason" },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter your custom reason"
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>

      {/* ✅ Job Cards */}
      <Row gutter={[16, 16]}>
        {jobs?.map((job) => (
          <Col span={24} key={job.id}>
            <Card
              hoverable
              onClick={() => navigate(`/job/${job.id}`)} // ✅ Navigate to Job Details
              style={{
                borderRadius: 12,
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                cursor: "pointer",
              }}
            >
              {/* ✅ Checkbox and Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Checkbox
                  checked={selectedJobs.includes(job.id)}
                  onClick={(e) => e.stopPropagation()} // 👈 Prevent card click
                  onChange={() => handleSelect(job.id)}
                />

                <Title level={5} style={{ margin: 0 }}>
                  {job.title}
                </Title>
                <CloudOutlined
                  style={{
                    fontSize: 28,
                    color: "#1890ff",
                  }}
                />
              </div>

              {/* Company Info */}
              <Space align="center" style={{ marginTop: 6 }}>
                <Text strong style={{ color: "#1890ff" }}>
                  {job.company}
                  {job.role}
                </Text>
                <StarFilled style={{ color: "#faad14" }} />
                <Text>{job.rating}</Text>
                <Text type="secondary">{`${job.reviews || 0} Reviews`}</Text>
              </Space>

              {/* Job Details */}
              <div style={{ marginTop: 12 }}>
                <Space
                  split={<Divider type="vertical" />}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                  }}
                >
                  <Space>
                    <Text>{job.experience}</Text>
                  </Space>
                  <Space>
                    <EnvironmentOutlined />
                    <Tooltip title={job.location}>
                      <Text>{job.location}</Text>
                    </Tooltip>
                  </Space>
                </Space>
              </div>

              {/* Description */}
              <Space align="start" style={{ marginTop: 12 }}>
                <FileTextOutlined style={{ marginTop: 4 }} />
                <Text type="secondary">{job.description}</Text>
              </Space>

              {/* Skills Tags */}
              <div style={{ marginTop: 12 }}>
                {job.skills?.map((skill, index) => (
                  <Tag color="blue" key={index} style={{ borderRadius: 20 }}>
                    {skill}
                  </Tag>
                ))}
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <Text type="secondary">{job.posted || "Recently posted"}</Text>
                <Button type="text" style={{ color: "#1890ff" }}>
                  Save
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default RecruiterJobList;
