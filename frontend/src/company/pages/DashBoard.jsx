import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
} from "antd";
import { Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { UploadPdf } from "../../candidate/api/api";

const { Option } = Select;
const { TextArea } = Input;

function DashBoard() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // ✅ Load jobs from localStorage initially
  const [jobs, setJobs] = useState(() => {
    const savedJobs = localStorage.getItem("jobs");
    return savedJobs
      ? JSON.parse(savedJobs)
      : [
          {
            id: 1,
            role: "Frontend Developer",
            description: "React + TypeScript Developer",
            employmentType: "FullTime",
            experience: "2 years",
            experienceLevel: "Mid",
            location: "Bangalore",
            skills: ["React", "TypeScript", "CSS"],
            salary: 600000,
            companyName: "TechCorp",
            responsibilities: ["Build UI", "Collaborate with backend"],
            qualifications: ["B.Tech", "Strong JS fundamentals"],
            jobType: "Hybrid",
            status: "Open",
            applicationDeadline: null,
          },
        ];
  });

  // ✅ Save jobs to localStorage whenever jobs state changes
  useEffect(() => {
    localStorage.setItem("jobs", JSON.stringify(jobs));
  }, [jobs]);

  const showCreateModal = () => {
    setIsEditing(false);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (job) => {
    setIsEditing(true);
    setEditingJob(job);
    setIsModalVisible(true);
    form.setFieldsValue(job);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      let updatedJobs;
      if (isEditing) {
        // Edit existing job
        updatedJobs = jobs.map((j) =>
          j.id === editingJob.id ? { ...editingJob, ...values } : j
        );
        console.log("🟢 Updated Job:", values);
      } else {
        // Create new job
        const newJob = { ...values };
        updatedJobs = [...jobs, newJob];
        console.log("🟢 Created Job:", newJob);
      }

      // ✅ Update state and persist in localStorage automatically via useEffect
      setJobs(updatedJobs);
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleFileUpload = async ({ file }) => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const response = await UploadPdf(uploadFormData); // API call
      const extracted = response?.extracted || {}; // JSON from backend
      console.log("extracted", extracted);
      // Auto-fill the form fields with extracted data
      form.setFieldsValue({
        role: extracted.role || "",
        description: extracted.description || "",
        employmentType: extracted.employmentType || "FullTime",
        experience: extracted.experience || "",
        experienceLevel: extracted.experienceLevel || "",
        location: extracted.location || "",
        skills: extracted.skills || [],
        salary: extracted.salary || 0,
        companyName: extracted.companyName || "",
        responsibilities: extracted.responsibilities || [],
        qualifications: extracted.qualifications || [],
        jobType: extracted.jobType || "Hybrid",
        status: extracted.status || "Open",
        // applicationDeadline: extracted.applicationDeadline
      });

      message.success("JD uploaded and fields auto-filled!");
    } catch (error) {
      console.error(error);
      message.error("Upload failed. Try again.");
    }
  };

  // ✅ Extract Fields from Uploaded JD

  return (
    <div style={{ padding: "30px" }}>
      <h2>Company Dashboard</h2>

      <Button type="primary" onClick={showCreateModal}>
        + Post a Job
      </Button>

      <div style={{ marginTop: 20 }}>
        <h3>Posted Jobs</h3>
        <div
          style={{
            maxHeight: "300px", // ✅ set height
            overflowY: "auto", // ✅ enable vertical scrolling
            paddingRight: "10px", // ✅ avoid content hiding under scrollbar
          }}
        >
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px 15px",
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{job.role}</strong> — {job.companyName}
                <div style={{ fontSize: "13px", color: "#666" }}>
                  {job.location}
                </div>
              </div>
              <Button type="link" onClick={() => showEditModal(job)}>
                Edit
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Modal
        title={isEditing ? "Edit Job Post" : "Create Job Post"}
        open={isModalVisible}
        onOk={handleOk}
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
        <Form form={form} layout="vertical" name="jobForm">
          <Form.Item label="Upload Job Description (PDF/DOCX)">
            <Upload
              customRequest={handleFileUpload}
              accept=".pdf,.doc,.docx"
              showUploadList={false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload JD</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Input placeholder="e.g. Machine Learning Engineer" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <TextArea rows={3} placeholder="Job Description" />
          </Form.Item>
          <Form.Item name="employmentType" label="Employment Type">
            <Select>
              <Option value="FullTime">Full Time</Option>
              <Option value="PartTime">Part Time</Option>
              <Option value="Contract">Contract</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="experience"
            label="Experience"
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. 3 years" />
          </Form.Item>
          <Form.Item name="experienceLevel" label="Experience Level">
            <Select>
              <Option value="Junior">Junior</Option>
              <Option value="Mid">Mid</Option>
              <Option value="Senior">Senior</Option>
            </Select>
          </Form.Item>
          <Form.Item name="location" label="Location">
            <Input placeholder="e.g. Bangalore, India" />
          </Form.Item>
          <Form.Item name="skills" label="Skills">
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Add skills (press Enter)"
            />
          </Form.Item>
          <Form.Item name="salary" label="Salary (per year)">
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value) => `₹ ${value}`}
            />
          </Form.Item>
          <Form.Item name="companyName" label="Company Name">
            <Input placeholder="Company Name" />
          </Form.Item>
          <Form.Item name="responsibilities" label="Responsibilities">
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Add each responsibility (press Enter)"
            />
          </Form.Item>
          <Form.Item name="qualifications" label="Qualifications">
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Add each qualification (press Enter)"
            />
          </Form.Item>
          <Form.Item name="jobType" label="Job Type">
            <Select>
              <Option value="Remote">Remote</Option>
              <Option value="Onsite">Onsite</Option>
              <Option value="Hybrid">Hybrid</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select>
              <Option value="Open">Open</Option>
              <Option value="Closed">Closed</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="applicationDeadline"
            label="Application Deadline"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default DashBoard;
