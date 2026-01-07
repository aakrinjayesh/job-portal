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
  Steps
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
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
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

  const [currentStep, setCurrentStep] = useState(0);


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
      setCurrentStep(0);
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
      ApplicationLimit: job?.ApplicationLimit || null,
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
      setCurrentStep(0);
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
      // setLoading(true);
      const response = await PostedJobsList(1, 10, controller.signal);
      const jobList = response?.jobs || [];
      setJobs(jobList);
      setLoading(false);
      // console.log("Jobs with applicant counts:", jobsWithCounts);
    } catch (error) {
      if (error.code === "ERR_CANCELED") {
        // console.log("✅ fetchJobs aborted");
        return;
      }

      console.error("Error fetching jobs:", error);
      setLoading(false);
      messageApi.error("Failed to fetch jobs");
    } finally {
      // setLoading(false);
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
        ApplicationLimit: values?.ApplicationLimit,
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
        // setJobs()
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
        const experience = {
          type: "year",
          number: values?.experience,
        };
        form.setFieldsValue({
          role: res?.jobDescription?.role,
          experience: experience,
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

  if (loading) {
    console.log("loading true");
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin />
      </div>
    );
  }

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

 const STEP_ITEMS = [
  { title: "Basic Info" },
  { title: "Job Details" },
  { title: "Location & Skills" },
  { title: "Salary & Other" },
];



  const STEPS = [
  {
    key: "basic",
    fields: ["upload", "role", "description", "responsibilities"],
  },
  {
    key: "job",
    fields: [
      "employmentType",
      "tenure",
      "experience",
      "experienceLevel",
    ],
  },
  {
    key: "location",
    fields: ["jobType", "location", "clouds", "skills"],
  },
  {
    key: "salary",
    fields: [
      "salary",
      "companyName",
      "certifications",
      "applicationDeadline",
      "ApplicationLimit",
    ],
  },
];


  return (
    <>
     

      <div
  style={{
    width: "100%",
    padding: "16px 24px",
    background: "#FFFFFF",
    borderRadius: 10,
    display: "flex",
    justifyContent: "flex-end",
     marginBottom: 20,
  }}
>
  <div
    style={{
      display: "flex",
      gap: 24,
    }}
  >
    {/* Delete Selected (Outlined / Disabled style) */}
    <div
      style={{
        height: 40,
        borderRadius: 100,
        border: "1px solid #EBEBEB",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        color: selectedJobs.length === 0 ? "#A3A3A3" : "#000",
        cursor: selectedJobs.length === 0 ? "not-allowed" : "pointer",
      }}
      onClick={() => {
        if (selectedJobs.length > 0) showDeleteModal();
      }}
    >
      Delete Selected
    </div>

    {/* Post New Job (Filled) */}
    <div
      style={{
        height: 40,
        borderRadius: 100,
        padding: "0 24px",
        background: "#1677FF",
        color: "#FFFFFF",
        fontWeight: 590,
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
      }}
      onClick={showCreateModal}
    >
      + Post New Job
    </div>
  </div>
</div>


      {contextHolder}
      

      <Modal
  title={
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          fontSize: 24,
          fontWeight: 510,
          color: "#101828",
        }}
      >
        Delete Selected Job(s)
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 400,
          color: "#101828",
        }}
      >
        Make sure to recheck before the final submission
      </div>
    </div>
  }
  open={isModalOpen}
 onOk={() => form.submit()}
  confirmLoading={deleteLoading}
  onCancel={() => {
    setIsModalOpen(false);
    form.resetFields();
  }}
  destroyOnClose
  width={640}
  okText="Submit"
  cancelText="Cancel"
  okButtonProps={{
    style: {
      borderRadius: 100,
      padding: "0 24px",
      fontWeight: 590,
    },
  }}
  cancelButtonProps={{
    style: {
      borderRadius: 100,
      padding: "0 24px",
      fontWeight: 590,
      borderColor: "#666666",
      color: "#666666",
    },
  }}
>
  <Form form={form} layout="vertical" onFinish={handleConfirmDelete} requiredMark={false}>
    {/* ===== Select Reason ===== */}
    <Form.Item
      name="reason"
      rules={[{ required: true, message: "Please select a reason" }]}
      label={
        <span style={{ fontSize: 13, fontWeight: 590, color: "#2E2E2E" }}>
          <span style={{ color: "#B60554" }}>*</span> Select Reason
        </span>
      }
    >
      <div
        style={{
          
          border: "1px solid #5C5C5C",
          borderRadius: 8,
          padding: "6px 8px",
        }}
      >
        <Select
          bordered={false}
          placeholder="Choose a reason"
          style={{ width: "100%" }}
        >
          <Option value="Job Position filled">
            Job Position filled
          </Option>
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
      </div>
    </Form.Item>

    {/* ===== Conditional Custom Reason ===== */}
    <Form.Item
      noStyle
      shouldUpdate={(prev, current) => prev.reason !== current.reason}
    >
      {({ getFieldValue }) =>
        getFieldValue("reason") === "Other" ? (
          <Form.Item
            name="customReason"
            rules={[
              { required: true, message: "Please enter your reason" },
              {
                pattern: /^[A-Za-z ]+$/,
                message: "Only letters and spaces are allowed",
              },
            ]}
            label={
              <span style={{ fontSize: 13, fontWeight: 590, color: "#2E2E2E" }}>
                <span style={{ color: "#B60554" }}>*</span> Custom Reason
              </span>
            }
          >
            <div
              style={{
                border: "1px solid #5C5C5C",
                borderRadius: 8,
                padding: 8,
              }}
            >
              <Input.TextArea
                rows={3}
                bordered={false}
                placeholder="Enter your custom reason"
                style={{ padding: 0, fontSize: 13 }}
              />
            </div>
          </Form.Item>
        ) : null
      }
    </Form.Item>
  </Form>
</Modal>


      
      <Row gutter={[16, 16]}>
        {jobs?.map((job) => (
          <Col span={24} key={job.id}>
            
              <Card
  hoverable
  onClick={() =>
    navigate("/company/job/details", {
      state: { job },
    })
  }
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
      <Checkbox
        checked={selectedJobs.includes(job.id)}
        onClick={(e) => e.stopPropagation()}
        onChange={() => handleSelect(job.id)}
      />

    


 <div
  style={{
    width: 56,
    height: 56,
    borderRadius: 12,
    background: "linear-gradient(135deg, #1677FF, #69B1FF)",
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
  {(job.role || job.title || "").charAt(0).toUpperCase()}
</div>




      <div>
        <div style={{ fontSize: 16, fontWeight: 590, color: "#212121" }}>
          {job.role || job.title}
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

    {/* Right */}
    <div style={{ display: "flex", gap: 12 }}>
      <Button
        style={{
          background: "#F0F2F4",
          borderRadius: 100,
          color: "#666",
        }}
        onClick={(e) => {
          e.stopPropagation();
          showEditModal(job);
        }}
      >
        Edit
      </Button>

      <Button
        style={{
          background: "#D1E4FF",
          borderRadius: 100,
          fontWeight: 590,
        }}
        onClick={(e) => {
          e.stopPropagation();
          navigate("/company/candidates", {
            state: { id: job.id, jobRole: job.role },
          });
        }}
      >
        View Candidates ({job.applicantCount || 0})
      </Button>
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
      <EnvironmentOutlined /> {job.jobType} ({job.location})
    </span>
    <Divider type="vertical" />
    <span>
      <DollarOutlined /> {job.salary} PA
    </span>
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
          {job.clouds.map((cloud, i) => (
            <Tag
              key={i}
              style={{
                background: "#E7F0FE",
                borderRadius: 100,
                border: "1px solid #1677FF",
              }}
            >
              {cloud}
            </Tag>
          ))}
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
          {job.skills.map((skill, i) => (
            <Tag
              key={i}
              style={{
                background: "#FBEBFF",
                borderRadius: 100,
                border: "1px solid #800080",
              }}
            >
              {skill}
            </Tag>
          ))}
        </div>
      </div>
    )}
  </div>
)}

</Card>

            
          </Col>
        ))}
      </Row>

      <Modal
        // title={isEditing ? "Edit Job Post" : "Create Job Post"}
        title={
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div>
      <div style={{ fontSize: 24, fontWeight: 510 }}>
        {isEditing ? "Edit Job Post" : "Create Job Post"}
      </div>
      <div style={{ fontSize: 14, color: "#667085" }}>
        Fill in the required data below to create a new job post.
      </div>
    </div>

    {/* Progress bar */}
    {/* <div style={{ display: "flex", gap: 8 }}>
      {STEPS.map((_, index) => (
        <div
          key={index}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 4,
            background:
              index <= currentStep ? "#1677FF" : "#E5E7EB",
          }}
        />
      ))}
    </div> */}

    <Steps
  current={currentStep}
  size="small"
  items={STEP_ITEMS}
  style={{ marginTop: 8 }}
/>

  

  </div>
}

        open={isModalVisible}
        footer={null} 
        onOk={handleOk}
        confirmLoading={postLoading}
        onCancel={handleCancel}
        okText={isEditing ? "Update" : "Create"}
        width={700}
        bodyStyle={{
          maxHeight: "70vh",
          height: "520px",  
          overflowY: "auto",
          paddingRight: "10px",
        }}
        style={{ top: 40 }}
      >

        <div
  style={{
    display: "flex",
    justifyContent: "center",
  }}
>
  <div
    style={{
      width: 602,           // ✅ Figma width
      display: "flex",
      flexDirection: "column",
      gap: 24,              // ✅ Figma vertical spacing
    }}
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
          {currentStep === 0 && (
             <>
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
            rules={
              [
                // { required: true },
                // {
                //   pattern: /^[A-Za-z0-9 ]+$/,
                //   message: "Only letters, numbers, and spaces are allowed",
                // },
                // {
                //   pattern: /^[A-Za-z0-9 .,\/\-\(\)'%":\n]*$/,
                //   message:
                //     "Only letters, numbers, spaces and . , / - ( ) are allowed!",
                // },
              ]
            }
          >
            {/* <Select mode="tags" placeholder="Add responsibilities" /> */}
            <TextArea
              rows={3}
              // maxLength={1000}
              // showCount
              placeholder="Roles & Responsibilities"
            />
          </Form.Item>
           </>
          )}

{currentStep === 1 && (
   <>
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
                    message:
                      "Only numbers with up to 2 decimal places allowed (e.g. 2, 2.1, 2.25)",
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
          </>
)}

{currentStep === 2 && (
    <>

          

          {showLocation && (
            <Form.Item
              name="location"
              label="Location"
              rules={[
                { required: true, message: "Location is required" },
                {
                  validator: (_, value) => {
                    if (value && value.length > 3) {
                      return Promise.reject(
                        "You can select up to 3 locations only"
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <ReusableSelect
                single={false} // MULTIPLE LOCATIONS
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
              rules={[
                { required: true },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === null)
                      return Promise.resolve();

                    // convert to string safely
                    const str = value.toString();

                    // remove decimal point
                    const digitsOnly = str.replace(".", "");

                    if (digitsOnly.length > 10) {
                      return Promise.reject(
                        new Error(
                          "Maximum 10 digits allowed (including decimals)"
                        )
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
                  rules={[
                    { required: true, message: "Min salary required" },
                    {
                      validator: (_, value) => {
                        if (value === undefined || value === null)
                          return Promise.resolve();

                        // convert to string safely
                        const str = value.toString();

                        // remove decimal point
                        const digitsOnly = str.replace(".", "");

                        if (digitsOnly.length > 10) {
                          return Promise.reject(
                            new Error(
                              "Maximum 10 digits allowed (including decimals)"
                            )
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
                        if (value === undefined || value === null)
                          return Promise.resolve();

                        // convert to string safely
                        const str = value.toString();

                        // remove decimal point
                        const digitsOnly = str.replace(".", "");

                        if (digitsOnly.length > 10) {
                          return Promise.reject(
                            new Error(
                              "Maximum 10 digits allowed (including decimals)"
                            )
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
          </>
          )}
         


{currentStep === 3 && (
    <>
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
          <Form.Item name="ApplicationLimit" label="Limit Applications">
            <InputNumber
              formatter={formatter}
              keyboard={true}
              placeholder="e.g. 1000"
              style={{ width: "100%" }}
            />
          </Form.Item>
           </>
           )}
        </Form>
          </div>
</div>

        {/* ===== STEP FOOTER (Step 5) ===== */}
<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  }}
>
  {/* Back button */}
  {currentStep > 0 && (
    <Button
      onClick={() => setCurrentStep((prev) => prev - 1)}
    >
      Back
    </Button>
  )}

  {/* Next button */}
  {currentStep < STEPS.length - 1 && (
    <Button
      type="primary"
      onClick={() => setCurrentStep((prev) => prev + 1)}
    >
      Next
    </Button>
  )}

  {/* Final Create / Update */}
  {currentStep === STEPS.length - 1 && (
    <Button
      type="primary"
      loading={postLoading}
      onClick={handleOk}
    >
      {isEditing ? "Update" : "Create"}
    </Button>
  )}
</div>

      </Modal>

      {/* <Modal
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

                message:
                  "Only numbers with up to 2 decimal places allowed (e.g. 2, 2.1, 2.25)",
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
      </Modal> */}

      <Modal
  open={aiModalVisible}
  onCancel={() =>
    aiModalVisible && !aiLoading && setAiModalVisible(false)
  }
  footer={null}
  destroyOnClose
  width={700}
  centered
  closable={false}
  maskClosable={!aiLoading}
  bodyStyle={{
    padding: 0,               // 🔥 remove AntD padding
    background: "transparent",
  }}
  style={{
    boxShadow: "none",        // 🔥 remove AntD outer shadow
  }}
>
  {/* ================= CUSTOM CARD CONTAINER ================= */}
  <div
    style={{
      background: "#FFFFFF",
      borderRadius: 16,
      padding: 24,
      border: "1px solid #F3F4F6",
      boxShadow: "0px 1px 2px -1px rgba(0, 0, 0, 0.10)",
    }}
  >
    {/* ================= HEADER ================= */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 64,
        marginBottom: 32,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 510,
            color: "#101828",
          }}
        >
          Generate Job Description Using AI
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: "#101828",
          }}
        >
          Fill in the required data below to create a new job post using AI.
        </div>
      </div>

      {/* CLOSE BUTTON */}
      <div
        onClick={() => !aiLoading && setAiModalVisible(false)}
        style={{
          width: 40,
          height: 40,
          background: "#F9F9F9",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        ✕
      </div>
    </div>

    {/* ================= FORM ================= */}
    <div style={{ width: 602 }}>
      <Form layout="vertical" form={aiForm} onFinish={handleAiGenerateJD}>
        {/* Job Title */}
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
          <Input
            placeholder="eg Salesforce Developer"
            style={{ borderRadius: 8, height: 36 }}
          />
        </Form.Item>

        {/* Experience */}
        <Form.Item
          label="Experience (Years)"
          name="experience"
          rules={[
            { required: true, message: "Experience is required" },
            {
              pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
              message:
                "Only numbers with up to 2 decimal places allowed (e.g. 2, 2.1, 2.25)",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%", borderRadius: 8, height: 36 }}
            placeholder="Eg 3"
            min={0}
            stringMode
          />
        </Form.Item>

        {/* Experience Level */}
        <Form.Item label="Experience Level" name="experienceLevel">
          <Select style={{ borderRadius: 8, height: 36 }}>
            <Select.Option value="Internship">Internship</Select.Option>
            <Select.Option value="EntryLevel">Entry Level</Select.Option>
            <Select.Option value="Mid">Mid</Select.Option>
            <Select.Option value="Senior">Senior</Select.Option>
            <Select.Option value="Lead">Lead</Select.Option>
          </Select>
        </Form.Item>

        {/* Extra Instructions */}
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
            rows={4}
            placeholder="Anything special you want to include?"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        {/* ================= FOOTER BUTTONS ================= */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 16,
            marginTop: 32,
          }}
        >
          <Button
            disabled={aiLoading}
            onClick={() => setAiModalVisible(false)}
            style={{
              height: 40,
              borderRadius: 100,
              padding: "0 24px",
              border: "1px solid #666666",
              color: "#666666",
              fontWeight: 590,
            }}
          >
            Cancel
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            loading={aiLoading}
            disabled={aiLoading}
            style={{
              height: 40,
              borderRadius: 100,
              padding: "0 24px",
              fontWeight: 590,
            }}
          >
            Generate JD
          </Button>
        </div>
      </Form>
    </div>
  </div>
</Modal>

    </>
  );
};

export default RecruiterJobList;
