import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import ScreeningQuestionsStep from "./ScreeningQuestionsStep";
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
  Switch,
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
  ClockCircleOutlined,
  UserOutlined,
  LineChartOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { CreateJob, UpdateJob, PostedJobsList, CloseJob } from "../../api/api";
import { DeleteJobDetails } from "../../api/api";
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { UploadPdf } from "../../api/api";
import { GetJobQuestions } from "../../api/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Screening question type options
const QUESTION_TYPE_OPTIONS = [
  { label: "Short Text", value: "TEXT" },
  { label: "Long Text", value: "TEXTAREA" },
  { label: "Number", value: "NUMBER" },
  { label: "Yes / No", value: "BOOLEAN" },
  { label: "Multiple Choice", value: "SELECT" },
];

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
  const [isExperienceRange, setIsExperienceRange] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [companyLogo, setCompanyLogo] = useState("");

  // ── SCREENING QUESTIONS STATE ──────────────────────────
  const [screeningQuestions, setScreeningQuestions] = useState([]);

  // ── SCREENING QUESTION HELPERS ─────────────────────────
  const addQuestion = () => {
    setScreeningQuestions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        question: "",
        type: "TEXT",
        required: true,
        options: [],
      },
    ]);
  };

  const removeQuestion = (id) => {
    setScreeningQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setScreeningQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  // ──────────────────────────────────────────────────────

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

  const handleNext = async () => {
    try {
      await form.validateFields();
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
    const isReturning = sessionStorage.getItem("recruiterIsReturning");
    if (isReturning && jobs.length > 0 && !initialLoading) {
      const savedScroll = parseInt(
        sessionStorage.getItem("recruiterScrollPos") || "0",
        10,
      );
      // Larger timeout to wait for all cards to render in DOM
      setTimeout(() => {
        if (jobsContainerRef.current) {
          jobsContainerRef.current.scrollTop = savedScroll;
          sessionStorage.removeItem("recruiterIsReturning"); // ✅ clear AFTER scrolling
        }
      }, 500);
    }
  }, [jobs, initialLoading]);
  useEffect(() => {
    if (location.state?.openEdit) {
      const jobToEdit = location.state.openEdit;
      // wait for jobs to load, or use jobData directly
      showEditModal(jobToEdit); // ✅ works because jobData has all fields
      window.history.replaceState({}, ""); // clear state
    }
  }, [location.state?.openEdit]);

  // useEffect(() => {
  //   if (isModalVisible && currentStep === 3 && !isEditing) {
  //     const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  //     form.setFieldsValue({
  //       companyName: storedUser?.companyName || "",
  //       companyLogo: storedUser?.profileUrl || storedUser?.avatar?.url || "", // ✅ ADD THIS
  //     });
  //   }
  // }, [isModalVisible, currentStep]);
  useEffect(() => {
    if (isModalVisible && !isEditing) {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      const logo = storedUser?.profileUrl || storedUser?.avatar?.url || "";

      setCompanyLogo(logo); // ✅ store in state

      form.setFieldsValue({
        companyName: storedUser?.companyName || "",
        companyLogo: logo, // ✅ still set in form
      });
    }
  }, [isModalVisible]);

  const showCreateModal = () => {
    setIsEditing(false);
    form.resetFields();
    setCurrentStep(0);
    setScreeningQuestions([]); // reset questions
    setIsModalVisible(true);
    setShowTenure(false);
  };

  const showEditModal = async (job) => {
    setIsEditing(true);
    setEditingJob(job);
    setCurrentStep(0);

    if (job.jobType === "Remote") {
      setShowLocation(false);
    } else {
      setShowLocation(true);
    }

    const shouldShowTenure = ["Contract", "PartTime", "Freelancer"].includes(
      job.employmentType,
    );
    setShowTenure(shouldShowTenure);
    setIsModalVisible(true);

    let salaryValues = {};
    if (job.salary.includes("-")) {
      const [min, max] = job.salary.split("-").map(Number);
      salaryValues = { salary: { min, max } };
      setIsSalaryRange(true);
    } else {
      salaryValues = { salary: Number(job.salary) };
      setIsSalaryRange(false);
    }

    let experienceValue = undefined;
    if (job.experience?.min && job.experience?.max) {
      setIsExperienceRange(true);
      experienceValue = {
        min: Number(job.experience.min),
        max: Number(job.experience.max),
        type: job.experience.type,
      };
    } else {
      setIsExperienceRange(false);
      experienceValue = {
        number: Number(job.experience?.number),
        type: job.experience?.type,
      };
    }

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
      ApplicationLimit:
        job?.ApplicationLimit !== undefined
          ? Number(job.ApplicationLimit)
          : null,
    });

    // Load existing screening questions when editing
    try {
      const resp = await GetJobQuestions(job.id);
      if (resp?.data && resp.data.length > 0) {
        setScreeningQuestions(
          resp.data.map((q) => ({
            id: q.id,
            question: q.question,
            type: q.type,
            required: q.required,
            options: q.options || [],
            _isExisting: true,
          })),
        );
      } else {
        setScreeningQuestions([]);
      }
    } catch {
      setScreeningQuestions([]);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setCurrentStep(0);
    setScreeningQuestions([]); // reset on cancel
  };
  const handleJobClick = (jobId) => {
    const scrollTop = jobsContainerRef.current?.scrollTop || 0;
    sessionStorage.setItem("recruiterScrollPos", scrollTop);
    sessionStorage.setItem("recruiterLastJobId", jobId);
    sessionStorage.setItem("recruiterIsReturning", "true");
  };

  const fetchJobs = async (pageNumber = 1) => {
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
      if (error.name === "AbortError" || error.code === "ERR_CANCELED") {
        return;
      }
      messageApi.error("Failed to fetch jobs");
    }
  };

  const handleSelect = (jobId) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId],
    );
  };

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
        ["experience", "min"],
        ["experience", "max"],
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
    {
      key: "questions",
      fields: [], // no AntD form fields — managed by screeningQuestions state
    },
  ];

  // Validate screening questions before final submit
  const validateScreeningQuestions = () => {
    for (let i = 0; i < screeningQuestions.length; i++) {
      const q = screeningQuestions[i];
      if (!q.question.trim()) {
        messageApi.error(`Question ${i + 1} cannot be empty`);
        return false;
      }
      if (q.type === "SELECT" && q.options.length < 2) {
        messageApi.error(
          `Question ${i + 1} (Multiple Choice) needs at least 2 options`,
        );
        return false;
      }
    }
    return true;
  };

  const handleOk = async () => {
    try {
      const allFields = STEPS.flatMap((step) => step.fields);
      const values = await form.validateFields(allFields);

      // validate screening questions
      if (!validateScreeningQuestions()) return;

      setPostLoading(true);

      let finalSalary = "Not Disclosed";

      if (!isSalaryRange) {
        if (values.salary) {
          finalSalary = String(cleanNumber(values.salary));
        }
      } else {
        const min = values?.salary?.min;
        const max = values?.salary?.max;
        if (min && max) {
          finalSalary = `${cleanNumber(min)}-${cleanNumber(max)}`;
        }
      }

      let finalTenure = null;
      if (
        ["PartTime", "Contract", "Freelancer"].includes(values.employmentType)
      ) {
        if (values.tenure?.number) {
          finalTenure = {
            number: String(values.tenure.number),
            type: values.tenure.type || "month",
          };
        } else if (isEditing && editingJob?.tenure?.number) {
          finalTenure = editingJob.tenure;
        } else {
          messageApi.error("Tenure is required for Part Time / Contract jobs");
          setPostLoading(false);
          return;
        }
      }

      let finalExperience = null;
      if (!isExperienceRange) {
        finalExperience = {
          number: String(values.experience.number),
          type: values.experience.type,
        };
      } else {
        finalExperience = {
          min: String(values.experience.min),
          max: String(values.experience.max),
          type: values.experience.type,
        };
      }

      // Build screening questions payload
      const questionsPayload = screeningQuestions
        .filter((q) => q.question.trim() !== "")
        .map((q, index) => ({
          question: q.question.trim(),
          type: q.type,
          required: q.required,
          options: q.type === "SELECT" ? q.options : [],
          order: index,
        }));
      values.companyLogo = values.companyLogo || companyLogo; // ✅ fallback safety

      let payload = {
        role: values.role,
        description: values.description,
        employmentType: values.employmentType,
        experience: finalExperience,
        experienceLevel: values.experienceLevel,
        tenure: finalTenure,
        location: Array.isArray(values.location)
          ? values.location.join(", ")
          : values.location || "Remote",
        skills: values.skills || [],
        clouds: values.clouds || [],
        salary: finalSalary,
        companyName: values.companyName,
        companyLogo: values.companyLogo,
        responsibilities: values.responsibilities || "",
        certifications: values.certifications || [],
        jobType: values.jobType,
        applicationDeadline: values?.applicationDeadline?.toISOString(),
        ApplicationLimit:
          values?.ApplicationLimit !== undefined &&
          values?.ApplicationLimit !== null
            ? Number(values.ApplicationLimit)
            : undefined,
        questions: questionsPayload,
      };

      console.log("Payload", payload);

      if (isEditing) {
        payload.id = editingJob.id;
        const response = await UpdateJob(payload);

        if (response?.code === "LICENSE_EXPIRED") {
          messageApi.error(
            "Your license has expired. Please renew to update jobs.",
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
      setScreeningQuestions([]); // reset after save
    } catch (error) {
      console.error("Error saving job:", error);
      const backendMessage = error?.response?.data?.message;
      const safeMessage =
        typeof backendMessage === "string"
          ? backendMessage
          : backendMessage?.message || "Failed to save job";
      messageApi.error(safeMessage);
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

      if (response?.code === "LICENSE_EXPIRED") {
        messageApi.error(
          "Your license has expired. Please renew your subscription.",
        );
        return;
      }
      if (response?.code === "LIMIT_EXCEEDED") {
        const { feature, period, maxAllowed, currentUsage } =
          response?.metadata || {};
        messageApi.warning(
          `${feature} ${period?.toLowerCase()} limit exceeded. Usage: ${currentUsage}/${maxAllowed}`,
        );
        return;
      }

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

      if (res?.code === "LICENSE_EXPIRED") {
        messageApi.error({
          content:
            "Your license has expired. Please renew your plan to continue using AI features.",
          duration: 5,
        });
        aiForm.resetFields();
        return;
      }
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

      if (res?.status === "success") {
        messageApi.success("JD generated successfully!");
        form.setFieldsValue({
          role: res?.jobDescription?.role,
          experience: { type: "year", number: values?.experience },
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
    { value: "year", label: "Year" },
    { value: "month", label: "Month" },
  ];

  const formatter = (value) => {
    const [start, end] = `${value}`.split(".") || [];
    const v = `${start}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${end ? `${v}.${end}` : `${v}`}`;
  };

  const STEP_ITEMS = [
    { title: "Basic Info" },
    { title: "Job Details" },
    { title: "Loc & Skills" },
    { title: "Other Details" },
    { title: "Screening Questions" }, // NEW step
  ];

  const MAX_VISIBLE_TAGS = 2;

  const handleCloseJob = async (jobId) => {
    console.log("CLOSING JOB:", jobId);
    try {
      await CloseJob(jobId);
      messageApi.success("Job closed successfully");
      await fetchJobs(1);
    } catch (error) {
      messageApi.error(error?.response?.data?.message || "Failed to close job");
    }
  };

  const experienceValidator = (_, value) => {
    if (!value) return Promise.resolve();
    if (!/^\d{1,2}(\.\d{1,2})?$/.test(value)) {
      return Promise.reject(
        new Error(
          "Enter up to 2 digits with optional 2 decimal places (e.g. 12 or 12.12)",
        ),
      );
    }
    return Promise.resolve();
  };

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

  return (
    <>
      {/* ── TOP BAR ── */}
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
        <div style={{ display: "flex", gap: 24 }}>
          <div
            style={{
              height: 40,
              borderRadius: 100,
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              gap: 8,
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

      {/* ── DELETE MODAL ── */}
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

      {/* ── JOB CARDS ── */}
      <div
        ref={jobsContainerRef}
        style={{
          height: "calc(100vh - 120px)",
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
                  strokeColor={{ "0%": "#4F63F6", "100%": "#7C8CFF" }}
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
                    onClick={() => {
                      handleJobClick(job.id);
                      navigate(`/company/job/${job.id}`, {
                        state: {
                          source: "myjobs",
                          highlight: "jobs",
                          count: job.applicantCount,
                          jobData: job,
                        },
                      });
                    }}
                    style={{
                      borderRadius: 12,
                      background: "#fff",
                      cursor: "pointer",
                      border: "1px solid #EEEEEE",
                      // border:
                      //   job.id === sessionStorage.getItem("recruiterLastJobId")
                      //     ? "2px solid #4F63F6"
                      //     : "1px solid #EEEEEE",
                      // height: 235,
                    }}
                  >
                    {/* TOP SECTION */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
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
                            <div
                              style={{
                                fontSize: 16,
                                fontWeight: 600,
                                color: "#212121",
                                whiteSpace: "nowrap",
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
                            {job?.createdAt
                              ? dayjs(job.createdAt).fromNow()
                              : "Recently"}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10 }}>
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

                        <Button
                          disabled={job.status === "Closed"}
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
                            sessionStorage.removeItem("candidateListPage"); // ✅ ADD THIS
                            sessionStorage.removeItem("candidateListPageSize"); // ✅ ADD THIS
                            sessionStorage.setItem(
                              "recruiterScrollPos",
                              jobsContainerRef.current?.scrollTop || 0,
                            );
                            sessionStorage.setItem(
                              "recruiterIsReturning",
                              "true",
                            );
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

                    {/* JOB META */}
                    <div
                      style={{
                        display: "flex",
                        gap: 2,
                        color: "#666",
                        fontSize: 13,
                        overflow: "hidden",
                      }}
                    >
                      <span>
                        <EnvironmentOutlined /> {job.jobType}{" "}
                        {job.location && (
                          <>({job.location.split(",")[0].trim()})</>
                        )}
                      </span>
                      <Divider type="vertical" />
                      {/* <span>
                        
                        <DollarOutlined />
                        {job.salary === "Not Disclosed"
                          ? "Not Disclosed"
                          : `${job.salary} PA`}
                      </span> */}
                      <span>₹ {formatSalary(job.salary)}</span>
                      <Divider type="vertical" />
                      <span>
                        <ClockCircleOutlined /> {job.employmentType}
                      </span>
                      <Divider type="vertical" />
                      <span>
                        {/* <UserOutlined /> {job.experience?.number}{" "}
                        {job.experience?.type} */}
                        <UserOutlined />
                        {job.experience?.min && job.experience?.max
                          ? `${job.experience.min}-${job.experience.max} ${job.experience.type}`
                          : `${job.experience?.number} ${job.experience?.type}`}
                      </span>
                      <Divider type="vertical" />
                      <span>
                        {" "}
                        {job.experienceLevel && (
                          <span>
                            <LineChartOutlined /> {job.experienceLevel}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* SKILLS + CLOUDS */}
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
                          // onClick={(e) => e.stopPropagation()}
                          style={{
                            flex: 1,
                            padding: 12,
                            border: "1px solid #EEEEEE",
                            borderRadius: 8,
                            minWidth: 220,
                            height: 100,
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
                                <Tooltip title={cloud} key={i}>
                                  <Tag
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
                          // onClick={(e) => e.stopPropagation()}
                          style={{
                            flex: 1,
                            padding: 12,
                            border: "1px solid #EEEEEE",
                            borderRadius: 8,
                            minWidth: 220,
                            height: 100,
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
                                <Tooltip title={skill} key={i}>
                                  <Tag
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
                      strokeColor={{ "0%": "#4F63F6", "100%": "#7C8CFF" }}
                      trailColor="#E6E8FF"
                      showInfo={false}
                    />
                  </div>
                </Col>
              )}
            </>
          )}
        </Row>

        {/* CLOSE JOB CONFIRM MODAL */}
        <Modal
          open={!!closeJobId}
          title="Close Job"
          okText="Yes, Close"
          okButtonProps={{ danger: true }}
          mask={false}
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

      {/* ── CREATE / EDIT JOB MODAL ── */}
      <Modal
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
        maskClosable={false}
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
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: 602,
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <Form
              form={form}
              layout="vertical"
              name="jobForm"
              onFinish={handleOk}
              initialValues={{
                experience: { type: "year" },
                tenure: { type: "year" },
              }}
            >
              {/* ── STEP 0: Basic Info ── */}
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
                      onClick={() => {
                        aiForm.resetFields();
                        setAiModalVisible(true);
                      }}
                    >
                      Generate JD using AI
                    </Button>
                  </Form.Item>

                  <Form.Item
                    name="role"
                    label="Role"
                    rules={[{ required: true }]}
                  >
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

              {/* ── STEP 1: Job Details ── */}
              {currentStep === 1 && (
                <>
                  <Form.Item
                    name="employmentType"
                    label="Employment Type"
                    rules={[{ required: true }]}
                  >
                    <Select
                      onChange={(value) => {
                        const shouldShowTenure = [
                          "Contract",
                          "PartTime",
                          "Freelancer",
                        ].includes(value);
                        setShowTenure(shouldShowTenure);
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
                          name={["tenure", "number"]}
                          noStyle
                          rules={[
                            { required: true, message: "Tenure is Required!" },
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
                        <Form.Item name={["tenure", "type"]} noStyle>
                          <Select style={{ width: "30%" }}>
                            <Option value="month">Month</Option>
                            <Option value="year">Year</Option>
                          </Select>
                        </Form.Item>
                      </Space.Compact>
                    </Form.Item>
                  )}

                  <Checkbox
                    checked={isExperienceRange}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsExperienceRange(checked);
                      if (checked) {
                        form.setFieldsValue({
                          experience: {
                            min: undefined,
                            max: undefined,
                            type: "year",
                          },
                        });
                      } else {
                        form.setFieldsValue({
                          experience: { number: undefined, type: "year" },
                        });
                      }
                    }}
                  >
                    Use Experience Range
                  </Checkbox>

                  {!isExperienceRange ? (
                    <Form.Item label="Experience">
                      <Space.Compact style={{ width: "100%" }}>
                        <Form.Item
                          name={["experience", "number"]}
                          noStyle
                          rules={[
                            {
                              required: true,
                              message: "Experience is required",
                            },
                            { validator: experienceValidator },
                          ]}
                        >
                          <Input
                            placeholder="e.g 3 or 5.5"
                            inputMode="decimal"
                            maxLength={5}
                            style={{ width: "70%" }}
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
                  ) : (
                    <Form.Item label="Experience Range">
                      <Space.Compact style={{ width: "100%" }}>
                        <Form.Item
                          name={["experience", "min"]}
                          noStyle
                          rules={[
                            { required: true, message: "Min required" },
                            { validator: experienceValidator },
                          ]}
                        >
                          <Input
                            placeholder="Min"
                            inputMode="decimal"
                            maxLength={5}
                            style={{ width: "35%" }}
                          />
                        </Form.Item>
                        <Form.Item
                          name={["experience", "max"]}
                          noStyle
                          rules={[
                            { required: true, message: "Max required" },
                            { validator: experienceValidator },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const min = getFieldValue([
                                  "experience",
                                  "min",
                                ]);
                                if (
                                  min &&
                                  value &&
                                  Number(value) < Number(min)
                                ) {
                                  return Promise.reject(
                                    "Max must be greater than Min",
                                  );
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        >
                          <Input
                            placeholder="Max"
                            inputMode="decimal"
                            maxLength={5}
                            style={{ width: "35%" }}
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
                  )}

                  <Form.Item name="experienceLevel" label="Experience Level">
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
                          form.setFieldsValue({ location: undefined });
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

              {/* ── STEP 2: Location & Skills ── */}
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
                        single={false}
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
                      placeholder="Select up to 50 Skills"
                      fetchFunction={GetSkills}
                      addFunction={PostSkills}
                    />
                  </Form.Item>

                  <Checkbox
                    checked={isSalaryRange}
                    onChange={(e) => {
                      setIsSalaryRange(e.target.checked);
                      form.setFieldsValue({ salary: null });
                    }}
                  >
                    Use Salary Range
                  </Checkbox>

                  {!isSalaryRange ? (
                    <Form.Item
                      name="salary"
                      label="Salary Per Annum"
                      rules={[
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
                            if (!/^\d+(\.\d+)?$/.test(withoutCommas)) {
                              return Promise.reject(
                                new Error("Only numbers are allowed"),
                              );
                            }
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
                        <Form.Item
                          name={["salary", "min"]}
                          noStyle
                          rules={[
                            {
                              validator: (_, value) => {
                                if (
                                  value === undefined ||
                                  value === null ||
                                  value === ""
                                )
                                  return Promise.resolve();
                                const withoutCommas = value
                                  .toString()
                                  .replace(/,/g, "");
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
                          ]}
                        >
                          <Input
                            placeholder="Min e.g. 5,00,000 PA"
                            style={{ width: "50%" }}
                          />
                        </Form.Item>
                        <Form.Item
                          name={["salary", "max"]}
                          noStyle
                          rules={[
                            {
                              validator: (_, value) => {
                                if (
                                  value === undefined ||
                                  value === null ||
                                  value === ""
                                )
                                  return Promise.resolve();
                                const withoutCommas = value
                                  .toString()
                                  .replace(/,/g, "");
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

              {/* ── STEP 3: Other Details ── */}
              {currentStep === 3 && (
                <>
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
                  <Form.Item label="Company Logo">
                    <div
                      style={{
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      {companyLogo ? (
                        <>
                          <img
                            src={companyLogo}
                            alt="Company Logo"
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 8,
                              border: "1px solid #eee",
                              objectFit: "cover",
                            }}
                          />

                          {/* ❌ Remove button */}
                          <Button
                            danger
                            size="small"
                            onClick={() => {
                              setCompanyLogo("");
                              form.setFieldsValue({ companyLogo: "" });
                            }}
                          >
                            Remove
                          </Button>
                        </>
                      ) : (
                        <Upload
                          showUploadList={false}
                          beforeUpload={(file) => {
                            const isImage = file.type.startsWith("image/");
                            if (!isImage) {
                              messageApi.error("Only image files are allowed");
                              return Upload.LIST_IGNORE;
                            }

                            const isLessThan200MB =
                              file.size / 1024 / 1024 < 200;

                            if (!isLessThan200MB) {
                              messageApi.error(
                                "Image must be smaller than 200MB",
                              );
                              return Upload.LIST_IGNORE;
                            }

                            const reader = new FileReader();
                            reader.onload = (e) => {
                              const base64 = e.target.result;

                              setCompanyLogo(base64);
                              form.setFieldsValue({ companyLogo: base64 });
                            };

                            reader.readAsDataURL(file);

                            return false; // prevent auto upload
                          }}
                        >
                          <Button icon={<UploadOutlined />}>Upload Logo</Button>
                        </Upload>
                      )}
                    </div>
                  </Form.Item>
                  {/* <Form.Item name="companyLogo" label="Company Name">
                    <Input />
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
                      format="DD MMM YYYY"
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
                          )
                            return Promise.resolve();
                          if (!/^\d+$/.test(value)) {
                            return Promise.reject(
                              new Error("Only numbers are allowed"),
                            );
                          }
                          if (Number(value) > 500) {
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

              {/* ── STEP 4: Screening Questions ── */}
              {/* {currentStep === 4 && (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 14, color: "#6B7280" }}>
                      Add screening questions candidates must answer before
                      applying. Questions marked required must be answered to
                      submit.
                    </div>
                  </div>

                  {screeningQuestions.length === 0 ? (
                    <div
                      style={{
                        border: "1px dashed #D1D5DB",
                        borderRadius: 10,
                        padding: "32px 20px",
                        textAlign: "center",
                        color: "#9CA3AF",
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ fontSize: 14, marginBottom: 8 }}>
                        No questions added yet
                      </div>
                      <div style={{ fontSize: 12 }}>
                        Click "Add Question" to start building your screening
                        form
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        marginBottom: 16,
                      }}
                    >
                      {screeningQuestions.map((q, index) => (
                        <div
                          key={q.id}
                          style={{
                            border: "1px solid #E5E7EB",
                            borderRadius: 10,
                            padding: "16px",
                            background: "#FAFAFA",
                            position: "relative",
                          }}
                        >
                          
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 12,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#374151",
                              }}
                            >
                              Question {index + 1}
                            </div>
                            <div
                              onClick={() => removeQuestion(q.id)}
                              style={{
                                cursor: "pointer",
                                color: "#EF4444",
                                fontSize: 13,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <DeleteOutlined /> Remove
                            </div>
                          </div>

                        
                          <div style={{ marginBottom: 10 }}>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#6B7280",
                                marginBottom: 4,
                              }}
                            >
                              Question Text{" "}
                              <span style={{ color: "#EF4444" }}>*</span>
                            </div>
                            <Input
                              value={q.question}
                              onChange={(e) =>
                                updateQuestion(q.id, "question", e.target.value)
                              }
                              placeholder="e.g. What is your current CTC?"
                              maxLength={300}
                              status={q.question.trim() === "" ? "error" : ""}
                            />
                            {q.question.trim() === "" && (
                              <div
                                style={{
                                  color: "#EF4444",
                                  fontSize: 11,
                                  marginTop: 2,
                                }}
                              >
                                Question text is required
                              </div>
                            )}
                          </div>

                         
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "flex-start",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#6B7280",
                                  marginBottom: 4,
                                }}
                              >
                                Answer Type
                              </div>
                              <Select
                                value={q.type}
                                onChange={(val) => {
                                  updateQuestion(q.id, "type", val);
                                  if (val !== "SELECT") {
                                    updateQuestion(q.id, "options", []);
                                  }
                                }}
                                style={{ width: "100%" }}
                                options={QUESTION_TYPE_OPTIONS}
                              />
                            </div>

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <div style={{ fontSize: 12, color: "#6B7280" }}>
                                Required
                              </div>
                              <Switch
                                checked={q.required}
                                onChange={(val) =>
                                  updateQuestion(q.id, "required", val)
                                }
                                size="small"
                              />
                            </div>
                          </div>

                          
                          {q.type === "SELECT" && (
                            <div style={{ marginTop: 12 }}>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#6B7280",
                                  marginBottom: 4,
                                }}
                              >
                                Options{" "}
                                <span style={{ color: "#9CA3AF" }}>
                                  (press Enter to add each option)
                                </span>
                              </div>
                              <Select
                                mode="tags"
                                value={q.options}
                                onChange={(val) =>
                                  updateQuestion(q.id, "options", val)
                                }
                                placeholder="Type an option and press Enter"
                                style={{ width: "100%" }}
                                tokenSeparators={[","]}
                                status={q.options.length < 2 ? "warning" : ""}
                              />
                              {q.options.length < 2 && (
                                <div
                                  style={{
                                    color: "#D97706",
                                    fontSize: 11,
                                    marginTop: 2,
                                  }}
                                >
                                  Add at least 2 options
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={addQuestion}
                    style={{ width: "100%", borderRadius: 8, height: 40 }}
                    disabled={screeningQuestions.length >= 10}
                  >
                    Add Question
                    {screeningQuestions.length >= 10 && " (max 10)"}
                  </Button>

                  {screeningQuestions.length > 0 && (
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        color: "#9CA3AF",
                        textAlign: "right",
                      }}
                    >
                      {screeningQuestions.length} / 10 questions added
                    </div>
                  )}
                </div>
              )} */}
              {currentStep === 4 && (
                <ScreeningQuestionsStep
                  screeningQuestions={screeningQuestions}
                  setScreeningQuestions={setScreeningQuestions}
                  messageApi={messageApi}
                />
              )}
            </Form>
          </div>
        </div>

        {/* ── STEP FOOTER ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24,
          }}
        >
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep((prev) => prev - 1)}>
              Back
            </Button>
          )}

          {currentStep < STEPS.length - 1 && (
            <Button
              type="primary"
              onClick={async () => {
                // Step 4 (questions) has no AntD form fields — skip validateFields
                if (currentStep === 4) {
                  setCurrentStep((prev) => prev + 1);
                  return;
                }
                try {
                  await form.validateFields(STEPS[currentStep].fields);
                  setCurrentStep((prev) => prev + 1);
                } catch (err) {
                  // AntD shows errors automatically
                }
              }}
            >
              Next
            </Button>
          )}

          {currentStep === STEPS.length - 1 && (
            <Button type="primary" loading={postLoading} onClick={handleOk}>
              {isEditing ? "Update" : "Create"}
            </Button>
          )}
        </div>
      </Modal>

      {/* ── AI GENERATE JD MODAL ── */}
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
        bodyStyle={{ padding: 0, background: "transparent" }}
        style={{ boxShadow: "none" }}
      >
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #F3F4F6",
            boxShadow: "0px 1px 2px -1px rgba(0, 0, 0, 0.10)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 30,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 510, color: "#101828" }}>
                Generate Job Description Using AI
              </div>
              <div style={{ fontSize: 14, fontWeight: 400, color: "#101828" }}>
                Fill in the required data below to create a new job post using
                AI.
              </div>
            </div>

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

          <div style={{ width: 602 }}>
            <Form layout="vertical" form={aiForm} onFinish={handleAiGenerateJD}>
              <Form.Item
                label="Job Title(role)"
                name="role"
                rules={[{ required: true, message: "Job title is required" }]}
              >
                <ReusableSelect
                  placeholder="Select or add Role"
                  fetchFunction={GetRole}
                  addFunction={PostRole}
                  single={true}
                />
              </Form.Item>

              <Form.Item
                label="Experience (Years)"
                name="experience"
                validateTrigger="onChange"
                rules={[
                  { required: true, message: "Experience is required" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (/[^0-9.]/.test(value)) {
                        return Promise.reject(
                          new Error("Only numbers are allowed"),
                        );
                      }
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
                  maxLength={5}
                />
              </Form.Item>

              <Form.Item label="Experience Level" name="experienceLevel">
                <Select style={{ borderRadius: 8, height: 36 }}>
                  <Select.Option value="Internship">Internship</Select.Option>
                  <Select.Option value="EntryLevel">Entry Level</Select.Option>
                  <Select.Option value="Mid">Mid</Select.Option>
                  <Select.Option value="Senior">Senior</Select.Option>
                  <Select.Option value="Lead">Lead</Select.Option>
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
                  maxLength={5000}
                  showCount
                />
              </Form.Item>

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
