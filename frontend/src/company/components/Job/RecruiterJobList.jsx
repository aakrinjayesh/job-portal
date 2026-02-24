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
  Progress,
  Checkbox,
  message,
  InputNumber,
  DatePicker,
  Modal,
  Select,
  Input,
  Form,
  Steps,
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
  LineChartOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { CreateJob, UpdateJob, PostedJobsList, CloseJob } from "../../api/api";
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
  const [deleteForm] = Form.useForm();
  const [closeJobId, setCloseJobId] = useState(null);
  const jobsContainerRef = useRef(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const LIMIT = 10;

  const controllerRef = useRef(null);

  const [isSalaryRange, setIsSalaryRange] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);

  // useEffect(() => {
  //   setPage(1);
  //   setHasMore(true);
  //   fetchJobs(1);

  //   return () => {
  //     // abort ONLY when navigating away, not during initial render
  //     if (page > 1) {
  //       controllerRef.current?.abort();
  //     }
  //   };
  // }, [location.pathname]);

  useEffect(() => {
    if (initialLoading || (loading && page === 1)) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 10 : prev + 10));
      }, 400);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [initialLoading, loading, page]);

  // ✅ ADD THIS FUNCTION HERE
  const handleNext = async () => {
    try {
      await form.validateFields(); // validates required fields
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      // AntD will show error automatically
    }
  };

  useEffect(() => {
    setInitialLoading(true);
    setPage(1);
    setJobs([]);
    setHasMore(true);
    fetchJobs(1);

    return () => {
      controllerRef.current?.abort();
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        // window.innerHeight + window.scrollY >=
        //   document.body.offsetHeight - 200 &&
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 200 &&
        hasMore &&
        !loading
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchJobs(page);
    }
  }, [page]);

  useEffect(() => {
    if (isModalVisible && currentStep === 3 && !isEditing) {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      form.setFieldsValue({
        companyName: storedUser?.companyName || "",
      });
    }
  }, [isModalVisible, currentStep]);

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
    setCurrentStep(0);
    if (job.jobType === "Remote") {
      setShowLocation(false);
    } else {
      setShowLocation(true);
    }

    // ✅ ADD THIS — decide tenure visibility in EDIT mode
    const shouldShowTenure = ["Contract", "PartTime", "Freelancer"].includes(
      job.employmentType,
    );
    setShowTenure(shouldShowTenure);
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

    const experienceValue = job.experience
      ? {
          number: Number(job.experience.number),
          type: job.experience.type,
        }
      : undefined;

    const locationArray =
      typeof job.location === "string"
        ? job.location.split(",").map((l) => l.trim())
        : job.location;

    form.setFieldsValue({
      ...job,
      location: locationArray,
      experience: experienceValue,
      ...salaryValues,
      tenure: job.tenure || undefined,
      applicationDeadline: job.applicationDeadline
        ? dayjs(job.applicationDeadline)
        : null,
      // ApplicationLimit: job?.ApplicationLimit || null,
      ApplicationLimit:
        job?.ApplicationLimit !== undefined
          ? Number(job.ApplicationLimit)
          : null,
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setCurrentStep(0);
  };

  // const fetchJobs = async (pageNumber = 1) => {
  //   if (controllerRef.current) {
  //     controllerRef.current.abort();
  //   }

  //   const controller = new AbortController();
  //   controllerRef.current = controller;

  //   try {
  //     if (pageNumber === 1) {
  //       setInitialLoading(true); // 🔥 initial loader
  //     }
  //     setLoading(true);

  //     const response = await PostedJobsList(
  //       pageNumber,
  //       LIMIT,
  //       controller.signal
  //     );

  //     const newJobs = response?.jobs || [];

  //     setJobs((prev) => (pageNumber === 1 ? newJobs : [...prev, ...newJobs]));

  //     if (newJobs.length < LIMIT) {
  //       setHasMore(false);
  //     }
  //   } catch (error) {
  //     if (error.code !== "ERR_CANCELED") {
  //       messageApi.error("Failed to fetch jobs");
  //     }
  //   } finally {
  //     setLoading(false);
  //     setInitialLoading(false); // 🔥 stop initial loader
  //   }
  // };

  const fetchJobs = async (pageNumber = 1) => {
    // ✅ Abort ONLY when reloading first page
    if (pageNumber === 1 && controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      if (pageNumber === 1) {
        setInitialLoading(true);
        setHasMore(true);
      }

      setLoading(true);

      const response = await PostedJobsList(
        pageNumber,
        LIMIT,
        controller.signal,
      );

      const newJobs = response?.jobs || [];

      setJobs((prev) => (pageNumber === 1 ? newJobs : [...prev, ...newJobs]));
      setLoading(false);
      if (pageNumber === 1) {
        setInitialLoading(false);
      }

      if (newJobs.length < LIMIT) {
        setHasMore(false);
      }
    } catch (error) {
      // if (error.name === "AbortError") return;
      // messageApi.error("Failed to fetch jobs");
      // ✅ Ignore aborted requests (tab switch, refresh, re-fetch)
      if (error.name === "AbortError" || error.code === "ERR_CANCELED") {
        return;
      }

      // ❗ Show error ONLY for real failures
      messageApi.error("Failed to fetch jobs");
    }
    // finally {
    //   setLoading(false);
    //   if (pageNumber === 1) {
    //     setInitialLoading(false);
    //   }
    // }
  };

  // ✅ Handle selecting/deselecting a job
  const handleSelect = (jobId) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId],
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

  const STEPS = [
    {
      key: "basic",
      fields: ["role", "description", "responsibilities"],
    },
    {
      key: "job",
      fields: [
        "employmentType",
        ["tenure", "number"],
        ["tenure", "type"],
        ["experience", "number"],
        ["experience", "type"],
        "experienceLevel",
        "jobType",
      ],
    },
    {
      key: "location",
      fields: ["location", "clouds", "skills", "salary"],
    },
    {
      key: "company",
      fields: [
        "companyName",
        "certifications",
        "applicationDeadline",
        "ApplicationLimit",
      ],
    },
  ];

  const handleOk = async () => {
    try {
      // const values = await form.validateFields();
      const allFields = STEPS.flatMap((step) => step.fields);
      const values = await form.validateFields(allFields);
      setPostLoading(true);

      let finalSalary = "";

      if (!isSalaryRange) {
        finalSalary = String(cleanNumber(values.salary)); // convert to string
      } else {
        const min = cleanNumber(values.salary.min);
        const max = cleanNumber(values.salary.max);
        finalSalary = `${min}-${max}`; // string format
      }
      let finalTenure = null;

      if (
        ["PartTime", "Contract", "Freelancer"].includes(values.employmentType)
      ) {
        if (values.tenure?.number) {
          // ✅ create OR user edited tenure
          finalTenure = {
            number: String(values.tenure.number),
            type: values.tenure.type || "month",
          };
        } else if (isEditing && editingJob?.tenure?.number) {
          // ✅ preserve existing tenure on update
          finalTenure = editingJob.tenure;
        } else {
          // ❌ block submit if missing
          messageApi.error("Tenure is required for Part Time / Contract jobs");
          setPostLoading(false);
          return;
        }
      }

      let payload = {
        role: values.role,

        description: values.description,
        employmentType: values.employmentType,
        // experience: values.experience,
        // experience: {
        //   number: String(values.experience.number),
        //   type: values.experience.type,
        // },
        // experience:
        //   values.experience?.number && values.experience?.type
        //     ? {
        //         number: String(values.experience.number),
        //         type: values.experience.type,
        //       }
        //     : {
        //         number: null,
        //         type: null,
        //       },
        experience: {
          number: String(values.experience.number),
          type: values.experience.type,
        },

        experienceLevel: values.experienceLevel,
        // tenure: values.tenure,
        // tenure: values.tenure
        //   ? {
        //       number: String(values.tenure.number),
        //       type: values.tenure.type,
        //     }
        //   : undefined,
        tenure: finalTenure,

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
        companyLogo: values.companyLogo,
        responsibilities: values.responsibilities || "", // string
        certifications: values.certifications || [],
        jobType: values.jobType,
        applicationDeadline: values?.applicationDeadline?.toISOString(),
        // ApplicationLimit: values?.ApplicationLimit,
        ApplicationLimit:
          values?.ApplicationLimit !== undefined &&
          values?.ApplicationLimit !== null
            ? Number(values.ApplicationLimit)
            : undefined,
      };
      console.log("Payload", payload);
      if (isEditing) {
        payload.id = editingJob.id;

        const response = await UpdateJob(payload);

        // 🔴 LICENSE EXPIRED
        if (response?.code === "LICENSE_EXPIRED") {
          messageApi.error(
            "Your license has expired. Please renew to update jobs.",
          );
          setPostLoading(false);
          return;
        }

        // 🔴 LIMIT EXCEEDED
        if (response?.code === "LIMIT_EXCEEDED") {
          const { feature, period, maxAllowed, currentUsage } =
            response?.metadata || {};

          messageApi.warning(
            `${feature} ${period?.toLowerCase()} limit exceeded. Usage: ${currentUsage}/${maxAllowed}`,
          );
          setPostLoading(false);
          return;
        }

        // 🟢 SUCCESS
        if (response?.status === "success") {
          messageApi.success(response.message || "Job updated successfully");
        }
      } else {
        const response = await CreateJob(payload);

        if (response?.code === "LICENSE_EXPIRED") {
          messageApi.error(
            "Your license has expired. Please renew to post jobs.",
          );
          setPostLoading(false);
          return;
        }

        if (response?.code === "LIMIT_EXCEEDED") {
          const { feature, period, maxAllowed, currentUsage } =
            response?.metadata || {};

          messageApi.warning(
            `${feature} ${period?.toLowerCase()} limit exceeded. Usage: ${currentUsage}/${maxAllowed}`,
          );
          setPostLoading(false);
          return;
        }

        if (response?.status === "success") {
          messageApi.success(response.message || "Job created successfully");
        }
      }
      setIsModalVisible(false);
      await fetchJobs();
      form.resetFields();
      setCurrentStep(0);
    } catch (error) {
      console.error("Error saving job:", error);
      // messageApi.error("Failed to save job:" + error.response.data.message);
      messageApi.error(
        error?.response?.data?.message?.message || "Failed to save job",
      );
      messageApi.error(error?.response?.data?.message || "Failed to save job");

      setPostLoading(false);
    } finally {
      setPostLoading(false);
    }
  };

  const handleFileUpload = async ({ file }) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      messageApi.error("Only PDF or Word (DOC, DOCX) files are allowed");
      return;
    }

    setUploadLoading(true);

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("role", "company");

    try {
      const response = await UploadPdf(uploadFormData);

      // 🔴 LICENSE EXPIRED
      if (response?.code === "LICENSE_EXPIRED") {
        messageApi.error(
          "Your license has expired. Please renew your subscription.",
        );
        return;
      }

      // 🔴 LIMIT EXCEEDED
      if (response?.code === "LIMIT_EXCEEDED") {
        const { feature, period, maxAllowed, currentUsage } =
          response?.metadata || {};

        messageApi.warning(
          `${feature} ${period?.toLowerCase()} limit exceeded. Usage: ${currentUsage}/${maxAllowed}`,
        );
        return;
      }

      // 🟢 SUCCESS
      const extracted = response?.extracted || {};
      // const extracted = response?.extracted?.data || {};

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
        applicationDeadline: extracted.applicationDeadline
          ? dayjs(extracted.applicationDeadline)
          : null,
      });

      messageApi.success("JD uploaded and fields auto-filled!");
    } catch (error) {
      messageApi.error(
        error?.response?.data?.message || "Upload failed. Try again.",
      );
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

      // 🔴 LICENSE EXPIRED
      if (res?.code === "LICENSE_EXPIRED") {
        messageApi.error({
          content:
            "Your license has expired. Please renew your plan to continue using AI features.",
          duration: 5,
        });
        aiForm.resetFields();
        return;
      }

      // 🔴 LIMIT EXCEEDED
      if (res?.code === "LIMIT_EXCEEDED") {
        const { feature, period, maxAllowed, currentUsage } =
          res?.metadata || {};

        messageApi.warning({
          content: `${feature} ${period?.toLowerCase()} limit exceeded. Usage: ${currentUsage}/${maxAllowed}`,
          duration: 5,
        });
        aiForm.resetFields();
        return;
      }

      // 🟢 SUCCESS
      if (res?.status === "success") {
        messageApi.success("JD generated successfully!");

        const experience = {
          type: "year",
          number: values?.experience,
        };

        form.setFieldsValue({
          role: res?.jobDescription?.role,
          experience,
          experienceLevel: values?.experienceLevel,
          description: res?.jobDescription?.description || "",
          responsibilities: res?.jobDescription?.responsibilities || "",
          skills: res?.jobDescription?.skills || [],
          clouds: res?.jobDescription?.clouds || [],
        });
        setAiModalVisible(false);
        aiForm.resetFields();
      } else {
        messageApi.error("Failed to generate JD");
      }
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Error generating JD");
      aiForm.resetFields();
    } finally {
      setAiLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      // const values = await form.validateFields();
      const values = await deleteForm.validateFields();

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
      // form.resetFields();
      deleteForm.resetFields();

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting jobs:", error);
      messageApi.error("Failed to delete jobs:" + error.response.data.message);
      setDeleteLoading(false);
    } finally {
      setDeleteLoading(false);
    }
  };

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
    { title: "Other Details" },
  ];

  const MAX_VISIBLE_TAGS = 2;

  // ✅ Close Job handler
  const handleCloseJob = async (jobId) => {
    console.log("CLOSING JOB:", jobId);
    try {
      await CloseJob(jobId);
      messageApi.success("Job closed successfully");

      // refresh list so status updates
      await fetchJobs(1);
    } catch (error) {
      messageApi.error(error?.response?.data?.message || "Failed to close job");
    }
  };

  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          width: "100%",
          padding: "16px 24px",
          background: "#FFFFFF",
          borderBottom: "1px solid #EEEEEE",
          display: "flex",
          justifyContent: "flex-end",
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
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              gap: 8,

              /* 🔥 Dynamic styles */
              background: selectedJobs.length > 0 ? "#FEE2E2" : "#FFFFFF",
              border:
                selectedJobs.length > 0
                  ? "1px solid #DC2626"
                  : "1px solid #EBEBEB",
              color: selectedJobs.length > 0 ? "#DC2626" : "#A3A3A3",

              cursor: selectedJobs.length > 0 ? "pointer" : "not-allowed",
              fontWeight: 590,
            }}
            onClick={() => {
              if (selectedJobs.length > 0) showDeleteModal();
            }}
          >
            <DeleteOutlined />
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
        {/* <Form form={form} layout="vertical"> */}
        <Form form={deleteForm} layout="vertical">
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
                      pattern: /^[A-Za-z\s]+$/,
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

      <div
        ref={jobsContainerRef}
        style={{
          height: "calc(100vh - 120px)", // 👈 important
          overflowY: "auto",
          padding: "24px 24px 24px",
          position: "relative",
        }}
      >
        <Row gutter={[16, 16]}>
          {initialLoading ? (
            <Col span={24}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "300px",
                }}
              >
                <Progress
                  type="circle"
                  percent={progress}
                  width={90}
                  strokeColor={{
                    "0%": "#4F63F6",
                    "100%": "#7C8CFF",
                  }}
                  trailColor="#E6E8FF"
                  showInfo={false}
                />
              </div>
            </Col>
          ) : (
            <>
              {jobs?.map((job) => (
                <Col span={24} key={job.id}>
                  <Card
                    hoverable
                    onClick={() =>
                      navigate(`/company/job/${job.id}`, {
                        state: {
                          source: "myjobs",
                          highlight: "jobs",
                          count: job.applicantCount,
                        },
                      })
                    }
                    style={{
                      borderRadius: 12,
                      background: "#fff",
                      // padding: 16,
                      cursor: "pointer",
                      border: "1px solid #EEEEEE",
                      height: 235, // ✅ UNIFORM HEIGHT
                      // display: "flex",
                      // flexDirection: "column",
                      // justifyContent: "space-between",
                    }}
                  >
                    {/* 🔹 TOP SECTION */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        // gap: 16,
                        flexWrap: "wrap",
                        // minHeight: 30,
                      }}
                    >
                      <div style={{ display: "flex", gap: 12 }}>
                        <Checkbox
                          checked={selectedJobs.includes(job.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleSelect(job.id)}
                        />

                        {job.companyLogo ? (
                          <img
                            src={job.companyLogo}
                            alt="logo"
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius: 8,
                              border: "1px solid #F5F5F5",
                              objectFit: "cover",
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
                              flexShrink: 0,
                            }}
                          >
                            {(job.companyName || job.role || job.title || "")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div style={{ maxWidth: 180 }}>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                            }}
                          >
                            {/* <div
                              style={{
                                fontSize: 16,
                                fontWeight: 600,
                                color: "#212121",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {job.role || job.title}
                            </div> */}
                            <div
                              style={{
                                fontSize: 16,
                                fontWeight: 600,
                                color: "#212121",
                                whiteSpace: "nowrap", // one line only
                              }}
                            >
                              {job.role || job.title}
                            </div>

                            {job.status === "Closed" && (
                              <Tag color="red">Closed</Tag>
                            )}
                          </div>

                          <div
                            style={{
                              fontSize: 14,
                              color: "#666",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
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

                      <div style={{ display: "flex", gap: 10 }}>
                        {/* ✅ CLOSE JOB BUTTON */}
                        {job.status === "Open" && (
                          <Button
                            danger
                            style={{ borderRadius: 100 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCloseJobId(job.id);
                            }}
                          >
                            Close
                          </Button>
                        )}

                        {/* EDIT */}
                        <Button
                          disabled={job.status === "Closed"} // ✅ disable when closed
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
                            fontWeight: 600,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/company/candidates", {
                              state: {
                                id: job.id,
                                jobRole: job.role,
                                highlight: "jobs",
                              },
                            });
                          }}
                        >
                          View Candidates ({job.applicantCount || 0})
                        </Button>
                      </div>
                    </div>

                    {/* 🔹 JOB META */}
                    <div
                      style={{
                        display: "flex",
                        gap: 2,
                        // flexWrap: "wrap",
                        color: "#666",
                        fontSize: 13,
                        //  maxHeight: 42,
                        overflow: "hidden",
                        // padding: "0 px",
                        // marginTop: 10,
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
                      <Divider type="vertical" />

                      <span>
                        {" "}
                        {job.experienceLevel && (
                          <>
                            <span>
                              <LineChartOutlined /> {job.experienceLevel}
                            </span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* 🔹 SKILLS + CLOUDS */}
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                        marginTop: 12,
                        flexGrow: 1,
                        overflow: "hidden",
                      }}
                    >
                      {job.clouds?.length > 0 && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            flex: 1,
                            padding: 12,
                            border: "1px solid #EEEEEE",
                            borderRadius: 8,
                            minWidth: 220,
                            height: 100, // ✅ fixed height
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            Related Clouds
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                            }}
                          >
                            {job.clouds
                              .slice(0, MAX_VISIBLE_TAGS)
                              .map((cloud, i) => (
                                <Tooltip title={cloud}>
                                  <Tag
                                    key={i}
                                    style={{
                                      background: "#E7F0FE",
                                      borderRadius: 100,
                                      border: "1px solid #1677FF",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      display: "inline-block",
                                      maxWidth: 225,
                                    }}
                                  >
                                    {cloud}
                                  </Tag>
                                </Tooltip>
                              ))}

                            {job.clouds.length > MAX_VISIBLE_TAGS && (
                              <Tag
                                style={{
                                  borderRadius: 100,
                                  background: "#F5F5F5",
                                  border: "1px dashed #999",
                                }}
                              >
                                +{job.clouds.length - MAX_VISIBLE_TAGS} more
                              </Tag>
                            )}
                          </div>
                        </div>
                      )}

                      {job.skills?.length > 0 && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            flex: 1,
                            padding: 12,
                            border: "1px solid #EEEEEE",
                            borderRadius: 8,
                            minWidth: 220,
                            height: 100, // ✅ fixed height
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            Related Skills
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                            }}
                          >
                            {job.skills
                              .slice(0, MAX_VISIBLE_TAGS)
                              .map((skill, i) => (
                                <Tooltip title={skill}>
                                  <Tag
                                    key={i}
                                    style={{
                                      background: "#FBEBFF",
                                      borderRadius: 100,
                                      border: "1px solid #800080",
                                      maxWidth: 225,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      display: "inline-block",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {skill}
                                  </Tag>
                                </Tooltip>
                              ))}

                            {job.skills.length > MAX_VISIBLE_TAGS && (
                              <Tag
                                style={{
                                  borderRadius: 100,
                                  background: "#F5F5F5",
                                  border: "1px dashed #999",
                                }}
                              >
                                +{job.skills.length - MAX_VISIBLE_TAGS} more
                              </Tag>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                  {/* <Modal
                    open={!!closeJobId}
                    title="Close Job"
                    okText="Yes, Close"
                    okButtonProps={{ danger: true }}
                    getContainer={() => jobsContainerRef.current} // 🔥 FIX
                    maskClosable={false}
                    mask={false}
                    onCancel={() => setCloseJobId(null)}
                    onOk={async () => {
                      try {
                        await handleCloseJob(closeJobId);
                        setCloseJobId(null);
                      } catch (e) {
                        setCloseJobId(null);
                      }
                    }}
                  >
                    Are you sure you want to close this job?
                  </Modal> */}
                </Col>
              ))}
              {loading && jobs.length > 0 && hasMore && (
                <Col span={24}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "24px 0",
                    }}
                  >
                    <Progress
                      type="circle"
                      percent={progress}
                      width={90}
                      strokeColor={{
                        "0%": "#4F63F6",
                        "100%": "#7C8CFF",
                      }}
                      trailColor="#E6E8FF"
                      showInfo={false}
                    />
                  </div>
                </Col>
              )}
            </>
          )}
        </Row>
        <Modal
          open={!!closeJobId}
          title="Close Job"
          okText="Yes, Close"
          okButtonProps={{ danger: true }}
          mask={false} // ✅ removes black background
          centered
          onCancel={() => setCloseJobId(null)}
          onOk={async () => {
            try {
              await handleCloseJob(closeJobId);
              setCloseJobId(null);
            } catch (e) {
              setCloseJobId(null);
            }
          }}
        >
          Are you sure you want to close this job?
        </Modal>
      </div>

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
        onOk={() => form.submit()}
        confirmLoading={postLoading}
        onCancel={handleCancel}
        okText={isEditing ? "Update" : "Create"}
        width={700}
        styles={{
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
              width: 602, // ✅ Figma width
              display: "flex",
              flexDirection: "column",
              gap: 24, // ✅ Figma vertical spacing
            }}
          >
            <Form
              form={form}
              layout="vertical"
              name="jobForm"
              onFinish={handleOk}
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
                      // onClick={
                      //   () =>
                      //     setAiModalVisible(true)}
                      onClick={() => {
                        aiForm.resetFields(); // 🔥 clear old values
                        setAiModalVisible(true);
                      }}
                    >
                      Generate JD using AI
                    </Button>
                  </Form.Item>

                  {/* ALL BELOW HAVE rules={[{ required: true }]} */}

                  <Form.Item
                    name="role"
                    label="Role"
                    rules={[{ required: true }]}
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
                      { required: true, message: "Description is required" },
                    ]}
                  >
                    <TextArea
                      rows={3}
                      maxLength={10000}
                      showCount
                      placeholder="Job Description"
                    />
                  </Form.Item>

                  <Form.Item
                    name="responsibilities"
                    label="Roles & Responsibilities"
                    rules={[
                      {
                        required: true,
                        message: "Roles & Responsibilities are required",
                      }, // optional
                    ]}
                  >
                    <TextArea
                      rows={3}
                      maxLength={10000}
                      showCount
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
                    {/* <Select
                      onChange={(value) => {
                        // Show Tenure for Part Time, Contract, Freelancer
                        setShowTenure(
                          ["Contract", "PartTime", "Freelancer"].includes(value)
                        );

                        if (
                          !["Contract", "PartTime", "Freelancer"].includes(
                            value
                          )
                        ) {
                          form.setFieldsValue({ tenure: undefined }); // clear if not needed
                        }
                      }}
                    > */}
                    <Select
                      onChange={(value) => {
                        const shouldShowTenure = [
                          "Contract",
                          "PartTime",
                          "Freelancer",
                        ].includes(value);

                        // ✅ control visibility
                        setShowTenure(shouldShowTenure);

                        // ✅ clear tenure ONLY while creating a job
                        // ❌ DO NOT clear in edit mode
                        if (!shouldShowTenure && !isEditing) {
                          form.setFieldsValue({ tenure: undefined });
                        }
                      }}
                    >
                      <Option value="FullTime">Full Time</Option>
                      <Option value="PartTime">Part Time</Option>
                      <Option value="Contract">Contract</Option>
                      <Option value="Freelancer">Freelance</Option>
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
                              pattern: /^\d{1,2}(\.\d{1,2})?$/,
                              message:
                                "Enter a number with up to 2 digits before and after decimal",
                            },
                          ]}
                        >
                          <Input
                            type="number"
                            min={0}
                            placeholder="e.g. 6"
                            style={{ width: "70%" }}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                // form.setFieldsValue({
                                //   tenure: {
                                //     number: value,
                                //     type:
                                //       form.getFieldValue(["tenure", "type"]) ||
                                //       "year",
                                //   },
                                // });
                                form.setFieldsValue({
                                  tenure: {
                                    number: form.getFieldValue([
                                      "tenure",
                                      "number",
                                    ]),
                                    type:
                                      form.getFieldValue(["tenure", "type"]) ||
                                      "year",
                                  },
                                });
                              }
                            }}
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
                          {
                            required: true,
                            message: "Experience is Required!",
                          },
                          {
                            pattern: /^\d{1,2}(\.\d{1,2})?$/,
                            message:
                              "Enter a number with up to 2 digits before and after decimal",
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
                        <Select
                          style={{ width: "30%" }}
                          options={Experienceoptions}
                        />
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
                                "You can select up to 3 locations only",
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

                  <Form.Item
                    name="clouds"
                    label="Clouds"
                    rules={[
                      {
                        required: true,
                        message: "Please select at least one cloud",
                      },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();

                          if (value.length > 12) {
                            return Promise.reject(
                              new Error("You can select up to 12 clouds only"),
                            );
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <ReusableSelect
                      single={false}
                      placeholder="Select up to 12 Clouds"
                      fetchFunction={GetClouds}
                      addFunction={PostClouds}
                    />
                  </Form.Item>

                  <Form.Item
                    name="skills"
                    label="Skills"
                    rules={[
                      {
                        required: true,
                        message: "Please select at least one skill",
                      },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();

                          if (value.length > 50) {
                            return Promise.reject(
                              new Error(
                                "You can select a maximum of 50 skills",
                              ),
                            );
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <ReusableSelect
                      single={false}
                      placeholder="Select up to 50 Clouds"
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
                        { required: true, message: "Salary is required" },
                        {
                          validator: (_, value) => {
                            if (
                              value === undefined ||
                              value === null ||
                              value === ""
                            ) {
                              return Promise.resolve();
                            }

                            // value may look like: "4,00,000"
                            const str = value.toString();

                            // remove commas for validation only
                            const withoutCommas = str.replace(/,/g, "");

                            // ❌ letters or special characters
                            if (!/^\d+(\.\d+)?$/.test(withoutCommas)) {
                              return Promise.reject(
                                new Error("Only numbers are allowed"),
                              );
                            }

                            // remove decimal point for digit count
                            const digitsOnly = withoutCommas.replace(".", "");

                            if (digitsOnly.length > 10) {
                              return Promise.reject(
                                new Error(
                                  "Maximum 10 digits allowed (including decimals)",
                                ),
                              );
                            }

                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input
                        style={{ width: "100%" }}
                        placeholder="e.g. 4,00,000"
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item label="Salary Range (Per Annum)">
                      <Space.Compact style={{ width: "100%" }}>
                        {/* MIN SALARY */}
                        <Form.Item
                          name={["salary", "min"]}
                          noStyle
                          rules={[
                            { required: true, message: "Min salary required" },
                            {
                              validator: (_, value) => {
                                if (
                                  value === undefined ||
                                  value === null ||
                                  value === ""
                                )
                                  return Promise.resolve();

                                const str = value.toString();

                                // remove commas only for validation
                                const withoutCommas = str.replace(/,/g, "");

                                // ❌ letters or special characters
                                if (!/^\d+(\.\d+)?$/.test(withoutCommas)) {
                                  return Promise.reject(
                                    new Error("Only numbers are allowed"),
                                  );
                                }

                                // remove decimal point
                                const digitsOnly = withoutCommas.replace(
                                  ".",
                                  "",
                                );

                                if (digitsOnly.length > 10) {
                                  return Promise.reject(
                                    new Error(
                                      "Maximum 10 digits allowed (including decimals)",
                                    ),
                                  );
                                }

                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <Input
                            placeholder="Min e.g. 5,00,000 PA"
                            style={{ width: "50%" }}
                          />
                        </Form.Item>

                        {/* MAX SALARY */}
                        <Form.Item
                          name={["salary", "max"]}
                          noStyle
                          rules={[
                            { required: true, message: "Max salary required" },
                            {
                              validator: (_, value) => {
                                if (
                                  value === undefined ||
                                  value === null ||
                                  value === ""
                                )
                                  return Promise.resolve();

                                const str = value.toString();
                                const withoutCommas = str.replace(/,/g, "");

                                // ❌ letters or special characters
                                if (!/^\d+(\.\d+)?$/.test(withoutCommas)) {
                                  return Promise.reject(
                                    new Error("Only numbers are allowed"),
                                  );
                                }

                                const digitsOnly = withoutCommas.replace(
                                  ".",
                                  "",
                                );

                                if (digitsOnly.length > 10) {
                                  return Promise.reject(
                                    new Error(
                                      "Maximum 10 digits allowed (including decimals)",
                                    ),
                                  );
                                }

                                return Promise.resolve();
                              },
                            },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const min = getFieldValue(["salary", "min"]);
                                if (min && value) {
                                  const minVal = min
                                    .toString()
                                    .replace(/,/g, "");
                                  const maxVal = value
                                    .toString()
                                    .replace(/,/g, "");

                                  if (Number(maxVal) < Number(minVal)) {
                                    return Promise.reject(
                                      "Max salary must be greater than Min salary",
                                    );
                                  }
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        >
                          <Input
                            placeholder="Max e.g. 8,00,000 PA"
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
                  {/* <Form.Item
                    name="companyName"
                    label="Company Name"
                    rules={[
                      { required: true },
                      {
                        pattern: /^[A-Za-z0-9 .,()\-&]+$/,
                        message:
                          "Only letters, numbers, spaces, and . , & - ( ) are allowed",
                      },
                    ]}
                  >
                    <Input placeholder="Company Name" />
                  </Form.Item> */}
                  <Form.Item
                    name="companyName"
                    label="Company Name"
                    rules={[
                      { required: true, message: "Company Name is required" },
                      {
                        pattern: /^[A-Za-z0-9 .,()\-&]+$/,
                        message:
                          "Only letters, numbers, spaces, and . , & - ( ) are allowed",
                      },
                    ]}
                  >
                    <Input placeholder="Company Name" />
                  </Form.Item>

                  {/* <Form.Item name="companyLogo" label="Company Logo">
                    <Input placeholder="URL" />
                  </Form.Item> */}

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
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD MMM YYYY" // ✅ date month year
                      placeholder="DD MMM YYYY"
                      disabledDate={(current) => {
                        if (!current) return false;

                        const today = dayjs().startOf("day");
                        const sixMonthsLater = today
                          .add(6, "month")
                          .endOf("day");

                        return (
                          current.isBefore(today) ||
                          current.isAfter(sixMonthsLater)
                        );
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="ApplicationLimit"
                    label="Limit Applications"
                    validateTrigger="onChange"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (
                            value === undefined ||
                            value === null ||
                            value === ""
                          ) {
                            return Promise.resolve();
                          }

                          // ❌ letters or special characters
                          if (!/^\d+$/.test(value)) {
                            return Promise.reject(
                              new Error("Only numbers are allowed"),
                            );
                          }

                          const num = Number(value);

                          // ❌ more than 500
                          if (num > 500) {
                            return Promise.reject(
                              new Error(
                                "Only up to 500 applications are allowed",
                              ),
                            );
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input placeholder="e.g. 100" inputMode="numeric" />
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
            <Button onClick={() => setCurrentStep((prev) => prev - 1)}>
              Back
            </Button>
          )}

          {/* Next button */}

          {/* {currentStep < STEPS.length - 1 && (
            <Button
              type="primary"
              onClick={async () => {
                try {
                  await form.validateFields(STEPS[currentStep].fields);
                  setCurrentStep((prev) => prev + 1);
                } catch (e) {
                  // stay on same step
                }
              }}
            >
              Next
            </Button>
          )} */}

          {currentStep < STEPS.length - 1 && (
            <Button
              type="primary"
              onClick={async () => {
                try {
                  // 🔥 validate ONLY current step fields
                  await form.validateFields(STEPS[currentStep].fields);

                  // ✅ go to next step ONLY if valid
                  setCurrentStep((prev) => prev + 1);
                } catch (err) {
                  // ❌ validation failed
                  // AntD automatically shows error messages
                }
              }}
            >
              Next
            </Button>
          )}

          {/* Final Create / Update */}
          {currentStep === STEPS.length - 1 && (
            <Button type="primary" loading={postLoading} onClick={handleOk}>
              {isEditing ? "Update" : "Create"}
            </Button>
          )}
        </div>
      </Modal>

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
          padding: 0, // 🔥 remove AntD padding
          background: "transparent",
        }}
        style={{
          boxShadow: "none", // 🔥 remove AntD outer shadow
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
              gap: 30,
              // marginBottom: 5,
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
                Fill in the required data below to create a new job post using
                AI.
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
                  {
                    required: true,
                    message: "Job title is required",
                  },
                ]}
              >
                <ReusableSelect
                  placeholder="Select or add Role"
                  fetchFunction={GetRole}
                  addFunction={PostRole}
                  single={true}
                />
              </Form.Item>

              {/* Experience */}
              <Form.Item
                label="Experience (Years)"
                name="experience"
                validateTrigger="onChange"
                rules={[
                  { required: true, message: "Experience is required" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();

                      // ❌ letters or special characters
                      if (/[^0-9.]/.test(value)) {
                        return Promise.reject(
                          new Error("Only numbers are allowed"),
                        );
                      }

                      // ❌ more than 2 digits before or after decimal
                      if (!/^[0-9]{1,2}(\.[0-9]{1,2})?$/.test(value)) {
                        return Promise.reject(
                          new Error(
                            "Maximum 2 digits allowed with up to 2 decimal places",
                          ),
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  placeholder="Eg 3, 10, 5.5"
                  inputMode="decimal"
                  maxLength={5} // 99.99
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
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();

                      const wordCount = value
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean).length;

                      if (wordCount > 1000) {
                        return Promise.reject(
                          new Error("Maximum 1000 words allowed"),
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Anything special you want to include?"
                  style={{ borderRadius: 8 }}
                  maxLength={5000} // ✅ stops typing after 5000
                  showCount // ✅ shows character counter
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
