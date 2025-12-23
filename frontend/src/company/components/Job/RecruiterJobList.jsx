import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

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
  InputNumber,
  DatePicker,
  Modal,
  Select,
  Input,
  Form,
} from "antd";
import {
  GetSkills,
  PostSkills,
  GetLocations,
  PostLocations,
  GetClouds,
  PostClouds,
  GetRole,
  PostRole,
  GetCertifications,
  PostCertifications,
  GenerateJobDescription,
} from "../../../candidate/api/api";
import ReusableSelect from "../../../candidate/components/UserProfile/ReusableSelect";


import {
  StarFilled,
  EnvironmentOutlined,
  CloudOutlined,
  FileTextOutlined,
  DeleteOutlined,
  OpenAIOutlined,
} from "@ant-design/icons";
import axios from "axios";
import {
  GetJobsList,
  CreateJob,
  UpdateJob,
  GetCandidateDeatils,
  PostedJobsList,
} from "../../api/api";
import { DeleteJobDetails } from "../../api/api";
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { UploadPdf } from "../../api/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const RecruiterJobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showTenure, setShowTenure] = useState(false);
  const [showLocation, setShowLocation] = useState(true);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiForm] = Form.useForm();
  const [aiLoading, setAiLoading] = useState(false);
const location = useLocation();

  
const controllerRef = useRef(null);  

  const [isSalaryRange, setIsSalaryRange] = useState(false);

  // useEffect(() => {
  //   fetchJobs();

  //    return () => {
  //   if (controllerRef.current) controllerRef.current.abort();
  // };
  // }, []);


  useEffect(() => {
  fetchJobs();

  return () => {
    if (controllerRef.current) {
      console.log("🔥 Aborting Jobs API due to route/tab change");
      controllerRef.current.abort();
    }
  };
}, [location.pathname]); // 👈 THIS LINE FIXES YOUR ISSUE

 


  const showCreateModal = () => {
    setIsEditing(false);
    form.resetFields();
    setIsModalVisible(true);
    setShowTenure(false);
  };

  const showEditModal = (job) => {
    setIsEditing(true);
    setEditingJob(job);
    if (job.jobType === "Remote") {
      setShowLocation(false);
    } else {
      setShowLocation(true);
    }
    setIsModalVisible(true);

    let salaryValues = {};

    // If salary contains a range: "300000-400000"
    if (job.salary.includes("-")) {
      const [min, max] = job.salary.split("-").map(Number);

      salaryValues = {
        salary: {
          min,
          max,
        },
      };

      setIsSalaryRange(true); // toggle UI to range mode
    } else {
      // Normal salary: "500000"
      salaryValues = {
        salary: Number(job.salary),
      };

      setIsSalaryRange(false); // toggle UI to single salary mode
    }

    form.setFieldsValue({
      ...job,
      ...salaryValues,
      applicationDeadline: job.applicationDeadline
        ? dayjs(job.applicationDeadline)
        : null,
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // ✅ Fetch job list
  
  const fetchJobs = async () => {
  // 🔴 Abort previous request if still running
  if (controllerRef.current) {
    controllerRef.current.abort();
  }

  // ✅ Create new AbortController
  const controller = new AbortController();
  controllerRef.current = controller;

  try {
    const response = await PostedJobsList(1, 10, controller.signal);
    const jobList = response?.jobs || [];

    // 🔹 For each job, get candidate count (abort-safe)
    const jobsWithCounts = await Promise.all(
      jobList.map(async (job) => {
        try {
          const candidateResponse = await GetCandidateDeatils(
            { jobId: job.id },
            controller.signal
          );

          const applicantCount = candidateResponse?.count || 0;
          return { ...job, applicantCount };
        } catch (err) {
          if (err.code === "ERR_CANCELED") {
            console.log(`Candidate API aborted for job ${job.id}`);
          } else {
            console.error(
              `Error fetching candidates for job ${job.id}:`,
              err
            );
          }
          return { ...job, applicantCount: 0 };
        }
      })
    );

    setJobs(jobsWithCounts);
    console.log("Jobs with applicant counts:", jobsWithCounts);
  } catch (error) {
    if (error.code === "ERR_CANCELED") {
      // console.log("✅ fetchJobs aborted");
      return;
    }

    console.error("Error fetching jobs:", error);
    messageApi.error("Failed to fetch jobs");
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
      messageApi.warning("Please select at least one job to delete.");
      return;
    }
    setIsModalOpen(true);
  };

  const cleanNumber = (val) => {
    if (val === undefined || val === null) return 0;
    return Number(String(val).replace(/,/g, ""));
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setPostLoading(true);
     
      let finalSalary = "";

      if (!isSalaryRange) {
        finalSalary = String(cleanNumber(values.salary)); // convert to string
      } else {
        const min = cleanNumber(values.salary.min);
        const max = cleanNumber(values.salary.max);
        finalSalary = `${min}-${max}`; // string format
      }

      let payload = {
        role: values.role,
        description: values.description,
        employmentType: values.employmentType,
        // experience: values.experience,
        experience: {
          number: String(values.experience.number),
          type: values.experience.type,
        },
        experienceLevel: values.experienceLevel,
        // tenure: values.tenure,
        tenure: values.tenure
          ? {
              number: String(values.tenure.number),
              type: values.tenure.type,
            }
          : undefined,
        // location: values.location,
        // location: values.location || "Remote",
        location: Array.isArray(values.location)
  ? values.location.join(", ")
  : values.location || "Remote",

        skills: values.skills || [], // array
        clouds: values.clouds || [],
        // salary: Number(values.salary) || 0,
        // salary: isSalaryRange ? Number(values.salary) : Number(values.salary),
        salary: finalSalary,
        companyName: values.companyName,
        responsibilities: values.responsibilities || "", // string
        certifications: values.certifications || [],
        jobType: values.jobType,
        applicationDeadline: values?.applicationDeadline?.toISOString(),
      };
      console.log("Payload", payload);
      if (isEditing) {
        // ✅ Add job ID to payload
        payload.id = editingJob.id;

        // ✅ Update existing job (backend call)
        const response = await UpdateJob(payload);
        setPostLoading(false);
        messageApi.success(response.message || "Job updated successfully");
      } else {
        // ✅ Create new job (backend call)
        const response = await CreateJob(payload);
        setPostLoading(false);
        messageApi.success(response.message || "Job created successfully");
      }
      setIsModalVisible(false);
      await fetchJobs();
      form.resetFields();
    } catch (error) {
      console.error("Error saving job:", error);
      messageApi.error("Failed to save job:" + error.response.data.message);
      setPostLoading(false);
    } finally {
      setPostLoading(false);
    }
  };

  const handleFileUpload = async ({ file }) => {
    setUploadLoading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("role", "company");

    try {
      const response = await UploadPdf(uploadFormData);
      setUploadLoading(false);

      const extracted = response?.extracted || {};

      form.setFieldsValue({
        role: extracted.role || "",
        description: extracted.description || "",
        employmentType: extracted.employmentType || "FullTime",
        experience: extracted.experience || null,
        experienceLevel: extracted.experienceLevel || "",
        location: extracted.location || "",
        tenure: extracted?.tenure || null,
        skills: extracted.skills || [],
        clouds: extracted.clouds || [],
        salary: extracted.salary || "",
        companyName: extracted.companyName || "",
        responsibilities: extracted.responsibilities || [],
        certifications: extracted.certifications || [],
        jobType: extracted.jobType || "Hybrid",
        status: extracted.status || "Open",
        // applicationDeadline: extracted.applicationDeadline
        applicationDeadline: extracted.applicationDeadline
          ? dayjs(extracted.applicationDeadline)
          : null,
      });

      messageApi.success("JD uploaded and fields auto-filled!");
    } catch (error) {
      console.error(error);
      messageApi.error(
        "Upload failed. Try again:" + error.response.data.message
      );
      setUploadLoading(false);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAiGenerateJD = async (values) => {
    try {
      setAiLoading(true);

      const payload = {
        jobdetails: {
          role: values.role,
          experience: values.experience,
          experienceLevel: values.experienceLevel,
          instructions: values.instructions || "",
        },
      };

      const res = await GenerateJobDescription(payload);

      if (res.success === true) {
        messageApi.success("JD generated successfully!");
        // auto-fill fields in main form
        form.setFieldsValue({
          role: res?.jobDescription?.role,
          experience: values?.experience,
          experienceLevel: values?.experienceLevel,
          description: res?.jobDescription?.description || "",
          responsibilities: res?.jobDescription?.responsibilities || "",
          skills: res?.jobDescription?.skills || [],
          clouds: res?.jobDescription?.clouds || [],
          // qualifications: res?.jobDescription?.qualifications || [],
        });

        setAiModalVisible(false);
      } else {
        messageApi.error("Failed to generate JD");
      }
    } catch (err) {
      console.error(err);
      messageApi.error("Error generating JD:" + err.response.data.message);
    } finally {
      setAiLoading(false);
      aiForm.resetFields();
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const values = await form.validateFields();
      const { reason, customReason } = values;
      const finalReason = reason === "Other" ? customReason : reason;

      setDeleteLoading(true);

      const payload = {
        jobIds: selectedJobs,
        deletedReason: finalReason,
      };

      const response = await DeleteJobDetails(payload);
      if (response.status === "success") {
        setDeleteLoading(false);
        messageApi.success(response.message || "Jobs deleted successfully");
      }

      setJobs((prev) => prev.filter((job) => !selectedJobs.includes(job.id)));
      setSelectedJobs([]);
      form.resetFields();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting jobs:", error);
      messageApi.error("Failed to delete jobs:" + error.response.data.message);
      setDeleteLoading(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <Spin size="large" style={{ marginTop: 100 }} />;

  const Experienceoptions = [
    {
      value: "year",
      label: "Year",
    },
    {
      value: "month",
      label: "Month",
    },
  ];

  const formatter = (value) => {
    const [start, end] = `${value}`.split(".") || [];
    const v = `${start}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${end ? `${v}.${end}` : `${v}`}`;
  };

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
          style={{ marginRight: 10 }}
          onClick={showCreateModal}
        >
          + Post Job
        </Button>

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

      {contextHolder}
      {/* ✅ Delete Reason Modal */}
      <Modal
        title="Delete Selected Job(s)"
        open={isModalOpen}
        onOk={handleConfirmDelete}
        confirmLoading={deleteLoading}
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
                    {
                pattern: /^[A-Za-z]+$/,
                message: "Only letters, numbers, and spaces are allowed",
               },
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
            <Tooltip title="Click to view full job details">
              <Card
                hoverable
                // onClick={() => navigate(`/company/job/${job.id}`)}
                 onClick={() =>
   navigate("/company/job/details", {
   state: { job },
})
  }

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
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: 6,
                  }}
                >
                  <Checkbox
                    checked={selectedJobs.includes(job.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleSelect(job.id)}
                    style={{
                      margin: 0,
                      padding: 0,
                      lineHeight: "1",
                      transform: "scale(1.05)",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "4px",
                    }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: "16px",
                        color: "#1890ff",
                        cursor: "pointer",
                        margin: 0,
                        padding: 0,
                        lineHeight: "1",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // navigate(`/company/job/${job.id}`);
                         navigate("/company/job/details", {
    state: { job },
  });

                      }}
                    >
                      {job.role || job.title}
                    </Text>
                  </div>
                </div>

                {/* Company Info */}
                <Space align="center" style={{ marginTop: 6 }}>
                  <Text strong style={{ color: "#1890ff" }}>
                    {job.companyName}
                  </Text>
                  {/* <StarFilled style={{ color: "#faad14" }} />
                  <Text>{job.rating}</Text>
                  <Text type="secondary">{`${job.reviews || 0} Reviews`}</Text> */}
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
                      <Text>
                        {job?.experience?.number} {job?.experience?.type}
                      </Text>
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
                  <Paragraph
                    type="secondary"
                    ellipsis={{
                      rows: 2,
                      expandable: true,
                      symbol: "more",
                    }}
                  >
                    {job.description}
                  </Paragraph>
                </Space>

                {/* Skills Tags */}
                <div style={{ marginTop: 12 }}>
                  {job.skills?.map((skill, index) => (
                    <Tag color="blue" key={index} style={{ borderRadius: 20 }}>
                      {skill}
                    </Tag>
                  ))}
                </div>

                {/* Primary Clouds */}
                <div style={{ marginTop: 12 }}>
                  {job.clouds?.map((cloud, index) => (
                    <Tag color="gray" key={index} style={{ borderRadius: 20 }}>
                      {cloud}
                    </Tag>
                  ))}
                </div>

                {/* Footer Section */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 16,
                  }}
                >
                  <Text type="secondary">
                    Posted{" "}
                    {job?.updatedAt
                      ? `${dayjs(job.updatedAt).fromNow()} (${dayjs(
                          job?.appliedAt
                        ).format("MMM D, YYYY")})`
                      : "Recently posted"}
                  </Text>

                  <div style={{ display: "flex", gap: "10px" }}>
                    {/* 👁️ View Candidates Button */}
                    <Button
                      type="primary"
                      style={{
                        color: "#fff",
                        fontWeight: 500,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/company/candidates", {
                         state: { id: job?.id, jobRole: job?.role },
                        });
                      }}
                    >
                      View Candidates({job.applicantCount || 0})
                    </Button>

                    {/* ✏️ Edit Button */}
                    <Button
                      type="primary"
                      style={{
                        backgroundColor: "#1677ff", // ✅ Ant Design blue for edit
                        borderColor: "#1677ff",
                        color: "#fff",
                        fontWeight: 500,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        showEditModal(job);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            </Tooltip>
          </Col>
        ))}
      </Row>

      <Modal
        title={isEditing ? "Edit Job Post" : "Create Job Post"}
        open={isModalVisible}
        onOk={handleOk}
        confirmLoading={postLoading}
        onCancel={handleCancel}
        okText={isEditing ? "Update" : "Create"}
        width={700}
        bodyStyle={{
          maxHeight: "70vh",
          overflowY: "auto",
          paddingRight: "10px",
        }}
        style={{ top: 40 }}
      >
        <Form
          form={form}
          layout="vertical"
          name="jobForm"
          initialValues={{
            experience: {
              type: "year",
            },
            tenure: {
              type: "year",
            },
          }}
        >
          {/* ❌ Upload field — NO REQUIRED RULE ADDED */}
          <Form.Item label="Upload Job Description (PDF)">
            <Upload
              customRequest={handleFileUpload}
              accept=".pdf"
              showUploadList={false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />} loading={uploadLoading}>
                Upload JD
              </Button>
            </Upload>
            <Button
              icon={<OpenAIOutlined />}
              style={{ marginLeft: 10 }}
              onClick={() => setAiModalVisible(true)}
            >
              Generate JD using AI
            </Button>
          </Form.Item>

          {/* ALL BELOW HAVE rules={[{ required: true }]} */}

          <Form.Item
            name="role"
            label="Role"
            rules={[
              { required: true },
              // {
              //    pattern: /^[A-Za-z][A-Za-z0-9 \-]*$/,
              //   message: "Only letters, numbers, and spaces are allowed",
              // },
            ]}
          >
            {/* <Input placeholder="e.g. Machine Learning Engineer" /> */}
            <ReusableSelect
              placeholder="Select or add Role"
              fetchFunction={GetRole}
              addFunction={PostRole}
              single={true}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true },
              {
                pattern: /^[A-Za-z0-9 .,\/\-\(\)'%":\n]*$/,

                message:
                  "Only letters, numbers, spaces and . , / - ( ) are allowed!",
              },
            ]}
          >
            <TextArea
              rows={3}
              // maxLength={1000}
              // showCount
              placeholder="Job Description"
            />
          </Form.Item>

          <Form.Item
            name="responsibilities"
            label="Roles & Responsibilities"
            rules={[
              // { required: true },
              // {
              //   pattern: /^[A-Za-z0-9 ]+$/,
              //   message: "Only letters, numbers, and spaces are allowed",
              // },
              {
                pattern: /^[A-Za-z0-9 .,\/\-\(\)'%":\n]*$/,

                message:
                  "Only letters, numbers, spaces and . , / - ( ) are allowed!",
              },
            ]}
          >
            {/* <Select mode="tags" placeholder="Add responsibilities" /> */}
            <TextArea
              rows={3}
              // maxLength={1000}
              // showCount
              placeholder="Roles & Responsibilities"
            />
          </Form.Item>

          <Form.Item
            name="employmentType"
            label="Employment Type"
            rules={[{ required: true }]}
          >
            <Select
              onChange={(value) => {
                // Show Tenure for Part Time, Contract, Freelancer
                setShowTenure(
                  ["Contract", "PartTime", "Freelancer"].includes(value)
                );

                if (!["Contract", "PartTime", "Freelancer"].includes(value)) {
                  form.setFieldsValue({ tenure: undefined }); // clear if not needed
                }
              }}
            >
              <Option value="FullTime">Full Time</Option>
              <Option value="PartTime">Part Time</Option>
              <Option value="Contract">Contract</Option>
              <Option value="Freelancer">Freelancer</Option>
              <Option value="Internship">Internship</Option>
            </Select>
          </Form.Item>

          {showTenure && (
            <Form.Item label="Tenure" required>
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item
                  name={["tenure", "number"]} //  changed from experience → tenure
                  noStyle
                  rules={[
                    {
                      required: true,
                      message: "Tenure is Required!",
                    },
                    {
                      pattern: /^[0-9]+(\.[0-9]+)?$/,
                      message: "Only Positive Numbers Are Allowed",
                    },
                  ]}
                >
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 6"
                    style={{ width: "70%" }}
                  />
                </Form.Item>

                <Form.Item
                  name={["tenure", "type"]}
                  noStyle
                  // rules={[{
                  //   // required: true,
                  //   message: "Select unit" }]}
                >
                  <Select style={{ width: "30%" }}>
                    <Option value="month">Month</Option>
                    <Option value="year">Year</Option>
                  </Select>
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          )}

          <Form.Item label="Experience">
            {" "}
            {/* no name, no rules here */}
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item
                name={["experience", "number"]}
                noStyle
                rules={[
                  { required: true, message: "Experience is Required!" },
                  {
                    pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
                    message: "Only numbers with up to 2 decimal places allowed (e.g. 2, 2.1, 2.25)",
                  },
                ]}
              >
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  style={{ width: "70%" }}
                  placeholder="e.g 3"
                />
              </Form.Item>

              <Form.Item
                name={["experience", "type"]}
                noStyle
                rules={[{ required: true, message: "Select unit" }]}
              >
                <Select style={{ width: "30%" }} options={Experienceoptions} />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            name="experienceLevel"
            label="Experience Level"
            // rules={[{ required: true }]}
          >
            <Select>
              <Option value="Internship">Internship</Option>
              <Option value="EntryLevel">Entry Level</Option>
              <Option value="Mid">Mid</Option>
              <Option value="Senior">Senior</Option>
              <Option value="Lead">Lead</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="jobType"
            label="Job Type"
            rules={[{ required: true }]}
          >
            <Select
              onChange={(value) => {
                const isRemote = value === "Remote";
                setShowLocation(!isRemote);

                if (isRemote) {
                  form.setFieldsValue({ location: undefined }); // clear location when hidden
                }
              }}
            >
              <Option value="Remote">Remote</Option>
              <Option value="Onsite">Onsite</Option>
              <Option value="Hybrid">Hybrid</Option>
            </Select>
          </Form.Item>

          {/* {showLocation && (
            <Form.Item
              name="location"
              label="Location"
              rules={[
                { required: true, message: "Location is required" },
                // {
                //   pattern: /^[A-Za-z ]+$/,
                //   message: "Only letters and spaces are allowed",
                // },
              ]}
            >
              <ReusableSelect
                single={false}
                placeholder="Select Current Job Location"
                fetchFunction={GetLocations}
                addFunction={PostLocations}
              />
            </Form.Item>
          )} */}

          {showLocation && (
  <Form.Item
    name="location"
    label="Location"
    rules={[
      { required: true, message: "Location is required" },
      {
        validator: (_, value) => {
          if (value && value.length > 3) {
            return Promise.reject("You can select up to 3 locations only");
          }
          return Promise.resolve();
        },
      },
    ]}
  >
    <ReusableSelect
      single={false}                     // MULTIPLE LOCATIONS
      placeholder="Select up to 3 Locations"
      fetchFunction={GetLocations}
      addFunction={PostLocations}
    />
  </Form.Item>
)}


          <Form.Item name="clouds" label="Clouds" rules={[{ required: true }]}>
            <ReusableSelect
              single={false}
              placeholder="Select Cloud"
              fetchFunction={GetClouds}
              addFunction={PostClouds}
            />
          </Form.Item>
          <Form.Item name="skills" label="Skills" rules={[{ required: true }]}>
            <ReusableSelect
              single={false}
              placeholder="Select skills"
              fetchFunction={GetSkills}
              addFunction={PostSkills}
            />
          </Form.Item>
          <Checkbox
            checked={isSalaryRange}
            onChange={(e) => {
              setIsSalaryRange(e.target.checked);
              form.setFieldsValue({ salary: null }); // clear old salary
            }}
          >
            Use Salary Range
          </Checkbox>

          {!isSalaryRange ? (
            <Form.Item
              name="salary"
              label="Salary Per Annum"
              rules={[{ required: true },
                {
      validator: (_, value) => {
        if (value === undefined || value === null) return Promise.resolve();

        // convert to string safely
        const str = value.toString();

        // remove decimal point
        const digitsOnly = str.replace(".", "");

        if (digitsOnly.length > 10) {
          return Promise.reject(
            new Error("Maximum 10 digits allowed (including decimals)")
          );
        }

        return Promise.resolve();
      },
    },
              ]}
            >
              <InputNumber
                formatter={formatter}
                style={{ width: "100%" }}
                min={0}
                precision={8}  
                placeholder="e.g. 500000 PA"
              />
            </Form.Item>
          ) : (
            <Form.Item label="Salary Range (Per Annum)">
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item
                  name={["salary", "min"]}
                  noStyle
                  rules={[{ required: true, message: "Min salary required" },
                    {
      validator: (_, value) => {
        if (value === undefined || value === null) return Promise.resolve();

        // convert to string safely
        const str = value.toString();

        // remove decimal point
        const digitsOnly = str.replace(".", "");

        if (digitsOnly.length > 10) {
          return Promise.reject(
            new Error("Maximum 10 digits allowed (including decimals)")
          );
        }

        return Promise.resolve();
      },
    },
                  ]}
                >
                  <InputNumber
                    formatter={formatter}
                    placeholder="Min e.g. 500000 PA"
                    min={0}
                    precision={8}  
                    style={{ width: "50%" }}
                  />
                </Form.Item>

                <Form.Item
                  name={["salary", "max"]}
                  noStyle
                  rules={[
                    { required: true, message: "Max salary required" },
                    {
      validator: (_, value) => {
        if (value === undefined || value === null) return Promise.resolve();

        // convert to string safely
        const str = value.toString();

        // remove decimal point
        const digitsOnly = str.replace(".", "");

        if (digitsOnly.length > 10) {
          return Promise.reject(
            new Error("Maximum 10 digits allowed (including decimals)")
          );
        }

        return Promise.resolve();
      },
    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const min = getFieldValue(["salary", "min"]);
                        if (min && value && value < min) {
                          return Promise.reject(
                            "Max salary must be greater than Min salary"
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <InputNumber
                    formatter={formatter}
                    placeholder="Max e.g. 800000 PA"
                    min={0}
                    precision={8}  
                    style={{ width: "50%" }}
                  />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          )}

          <Form.Item
            name="companyName"
            label="Company Name"
            rules={[
              { required: true },
              {
                pattern: /^[A-Za-z0-9 ]+$/,
                message: "Only letters, numbers, and spaces are allowed",
              },
            ]}
          >
            <Input placeholder="Company Name" />
          </Form.Item>

          <Form.Item name="certifications" label="Certifications">
            <ReusableSelect
              placeholder="Select or add Certificate"
              fetchFunction={GetCertifications}
              addFunction={PostCertifications}
              single={false}
            />
          </Form.Item>

          <Form.Item
            name="applicationDeadline"
            label="Application Deadline"
            // rules={[{ required: true }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Generate Job Description using AI"
        open={aiModalVisible}
        onCancel={() =>
          aiModalVisible && !aiLoading && setAiModalVisible(false)
        }
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" form={aiForm} onFinish={handleAiGenerateJD}>
          <Form.Item
            label="Job Title(role)"
            name="role"
            rules={[
              { required: true, message: "Job title is required" },
              {
                pattern: /^[A-Za-z][A-Za-z0-9 .,\/-]*$/,
                message: "Special Characters are not allowed.",
              },
            ]}
          >
            <Input placeholder="e.g. SalesForce sales Developer" />
          </Form.Item>

          <Form.Item
            label="Experience (Years)"
            name="experience"
            rules={[
              { required: true, message: "Experience is required" },
              {
                pattern: /^[0-9]+(\.[0-9]{1,2})?$/,

                message: "Only numbers with up to 2 decimal places allowed (e.g. 2, 2.1, 2.25)",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="e.g. 3"
              min={0}
              stringMode
            />
          </Form.Item>

          <Form.Item
            label="Experience Level"
            name="experienceLevel"
            // rules={[{ required: true}]}
          >
            <Select>
              <Option value="Internship">Internship</Option>
              <Option value="EntryLevel">Entry Level</Option>
              <Option value="Mid">Mid</Option>
              <Option value="Senior">Senior</Option>
              <Option value="Lead">Lead</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Extra Instructions (Optional)"
            name="instructions"
            rules={[
              {
                pattern: /^[A-Za-z0-9 .,\/\-\(\)'":\n]*$/,
                message:
                  "Only letters, numbers, space, and , . / - ( ) ' are allowed!",
              },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Anything special you want to include?"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={aiLoading}
            block
            disabled={aiLoading}
          >
            Generate JD
          </Button>
        </Form>
      </Modal>
    </>
  );
};

export default RecruiterJobList;