import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Upload,
  Card,
  Typography,
  message,
  Form,
  Input,
  Select,
  Row,
  Col,
  Divider,
} from "antd";
import {
  UploadOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { UploadPdf, profiledata } from "../api/api";

const { Title, Paragraph } = Typography;

const { Option } = Select;

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [form] = Form.useForm();

  // Single state object for all form data
  const [formData, setFormData] = useState({
    profilePicture: null,
    preferredLocation: [],
    preferredJobType: [],
    currentCTC: null,
    expectedCTC: null,
    joiningPeriod: null,
    totalExperience: null,
    relevantSalesforceExperience: null,
    skills: [],
    certifications: [],
    workExperience: [],
  });

  const handleUpload = async ({ file }) => {
    setLoading(true);

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const response = await UploadPdf(uploadFormData);
      console.log("API Response:", response);

      // Update form data with extracted information
      const extracted = response.extracted || response;
      const newFormData = {
        ...formData,
        preferredLocation: extracted.preferredLocation
          ? [extracted.preferredLocation]
          : [],
        preferredJobType: extracted.preferredJobType || [],
        currentCTC: extracted.currentCTC,
        expectedCTC: extracted.expectedCTC,
        joiningPeriod: extracted.joiningPeriod,
        totalExperience: extracted.totalExperience,
        relevantSalesforceExperience: extracted.relevantSalesforceExperience,
        skills: extracted.skills || [],
        certifications: extracted.certifications || [],
        workExperience: extracted.workExperience || [],
      };

      setFormData(newFormData);

      // Populate the form with extracted data
      form.setFieldsValue({
        preferredLocation: extracted.preferredLocation
          ? [extracted.preferredLocation]
          : [],
        preferredJobType: extracted.preferredJobType || [],
        currentCTC: extracted.currentCTC,
        expectedCTC: extracted.expectedCTC,
        joiningPeriod: extracted.joiningPeriod,
        totalExperience: extracted.totalExperience,
        relevantSalesforceExperience: extracted.relevantSalesforceExperience,
        skills: extracted.skills || [],
        certifications: extracted.certifications || [],
        workExperience: extracted.workExperience || [],
      });

      // Check for missing fields and trigger form validation errors
      const missingFields = [];
      const formErrors = [];

      if (!extracted.preferredLocation) {
        missingFields.push("Preferred Location");
        formErrors.push({
          name: "preferredLocation",
          errors: ["Please select preferred location!"],
        });
      }
      if (
        !extracted.preferredJobType ||
        extracted.preferredJobType.length === 0
      ) {
        missingFields.push("Preferred Job Type");
        formErrors.push({
          name: "preferredJobType",
          errors: ["Please select job type!"],
        });
      }
      if (!extracted.currentCTC) {
        missingFields.push("Current CTC");
        formErrors.push({
          name: "currentCTC",
          errors: ["Please enter current CTC!"],
        });
      }
      if (!extracted.expectedCTC) {
        missingFields.push("Expected CTC");
        formErrors.push({
          name: "expectedCTC",
          errors: ["Please enter expected CTC!"],
        });
      }
      if (!extracted.joiningPeriod) {
        missingFields.push("Joining Period");
        formErrors.push({
          name: "joiningPeriod",
          errors: ["Please enter joining period!"],
        });
      }
      if (!extracted.totalExperience) {
        missingFields.push("Total Experience");
        formErrors.push({
          name: "totalExperience",
          errors: ["Please enter total experience!"],
        });
      }
      if (!extracted.relevantSalesforceExperience) {
        missingFields.push("Relevant Salesforce Experience");
        formErrors.push({
          name: "relevantSalesforceExperience",
          errors: ["Please enter Salesforce experience!"],
        });
      }
      if (!extracted.skills || extracted.skills.length === 0) {
        missingFields.push("Skills");
        formErrors.push({
          name: "skills",
          errors: ["Please enter skills!"],
        });
      }
      if (!extracted.certifications || extracted.certifications.length === 0) {
        missingFields.push("Certifications");
        formErrors.push({
          name: "certifications",
          errors: ["Please enter certifications!"],
        });
      }
      if (!extracted.workExperience || extracted.workExperience.length === 0) {
        missingFields.push("Work Experience");
        formErrors.push({
          name: "workExperience",
          errors: ["Please enter work experience!"],
        });
      }

      // Trigger form validation errors for missing fields
      if (formErrors.length > 0) {
        form.setFields(formErrors);
      }

      if (missingFields.length > 0) {
        message.warning({
          content: `The following fields were not found in the resume and need to be filled manually: ${missingFields.join(
            ", "
          )}`,
          duration: 8,
        });
      }

      message.success("Resume details extracted successfully!");
    } catch (error) {
      console.error(error);
      message.error("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateResume = async () => {
    try {
      setGenerateLoading(true);

      // Get current form values
      const values = form.getFieldsValue();
      console.log("Generating resume with values:", values);

      // Create HTML content for the resume
      const resumeHTML = createResumeHTML(values);

      // Create and download PDF
      await downloadResumePDF(resumeHTML);

      message.success("Resume generated and downloaded successfully!");
    } catch (error) {
      console.error("Resume generation error:", error);
      message.error("Failed to generate resume. Please try again.");
    } finally {
      setGenerateLoading(false);
    }
  };

  const createResumeHTML = (values) => {
    const {
      preferredLocation = [],
      preferredJobType = [],
      currentCTC,
      expectedCTC,
      joiningPeriod,
      totalExperience,
      relevantSalesforceExperience,
      skills = [],
      certifications = [],
      workExperience = [],
    } = values;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
          }
          
          .resume-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: #fff;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
          }
          
          .header h1 {
            font-size: 2.5em;
            color: #1e40af;
            margin-bottom: 10px;
            font-weight: 700;
          }
          
          .header .subtitle {
            font-size: 1.2em;
            color: #64748b;
            font-weight: 300;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section-title {
            font-size: 1.4em;
            color: #1e40af;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e2e8f0;
            font-weight: 600;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
          }
          
          .info-label {
            font-weight: 600;
            color: #475569;
            min-width: 150px;
          }
          
          .info-value {
            color: #334155;
            text-align: right;
          }
          
          .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .skill-tag {
            background: #dbeafe;
            color: #1e40af;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 500;
          }
          
          .experience-item, .cert-item {
            background: #f8fafc;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
          }
          
          .cert-item {
            background: #f0f9ff;
            border-left-color: #0ea5e9;
          }
          
          @media print {
            body { print-color-adjust: exact; }
            .resume-container { margin: 0; padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="resume-container">
          <div class="header">
            <h1>Professional Resume</h1>
          </div>
          
          <div class="section">
            <h2 class="section-title">Professional Summary</h2>
            <p>A dedicated professional with ${
              totalExperience || "extensive"
            } years of experience, including ${
      relevantSalesforceExperience || "significant"
    } years of expertise in Salesforce development. Seeking ${
      preferredJobType.length > 0 ? preferredJobType.join(" or ") : "suitable"
    } opportunities${
      preferredLocation.length > 0 ? ` in ${preferredLocation.join(", ")}` : ""
    }.</p>
          </div>
          
          <div class="section">
            <h2 class="section-title">Key Information</h2>
            <div class="info-grid">
              ${
                totalExperience
                  ? `<div class="info-item">
                <span class="info-label">Total Experience:</span>
                <span class="info-value">${totalExperience}</span>
              </div>`
                  : ""
              }
              ${
                relevantSalesforceExperience
                  ? `<div class="info-item">
                <span class="info-label">Salesforce Experience:</span>
                <span class="info-value">${relevantSalesforceExperience}</span>
              </div>`
                  : ""
              }
              ${
                currentCTC
                  ? `<div class="info-item">
                <span class="info-label">Current CTC:</span>
                <span class="info-value">${currentCTC}</span>
              </div>`
                  : ""
              }
              ${
                expectedCTC
                  ? `<div class="info-item">
                <span class="info-label">Expected CTC:</span>
                <span class="info-value">${expectedCTC}</span>
              </div>`
                  : ""
              }
              ${
                joiningPeriod
                  ? `<div class="info-item">
                <span class="info-label">Joining Period:</span>
                <span class="info-value">${joiningPeriod}</span>
              </div>`
                  : ""
              }
            </div>
          </div>
          
          ${
            skills.length > 0
              ? `<div class="section">
            <h2 class="section-title">Technical Skills</h2>
            <div class="skills-container">
              ${skills
                .map((skill) => `<span class="skill-tag">${skill}</span>`)
                .join("")}
            </div>
          </div>`
              : ""
          }
          
          ${
            workExperience.length > 0
              ? `<div class="section">
            <h2 class="section-title">Work Experience</h2>
            ${workExperience
              .map((exp) => `<div class="experience-item">${exp}</div>`)
              .join("")}
          </div>`
              : ""
          }
          
          ${
            certifications.length > 0
              ? `<div class="section">
            <h2 class="section-title">Certifications</h2>
            ${certifications
              .map((cert) => `<div class="cert-item">${cert}</div>`)
              .join("")}
          </div>`
              : ""
          }
          
          <div class="section">
            <h2 class="section-title">Preferences</h2>
            <div class="info-grid">
              ${
                preferredJobType.length > 0
                  ? `<div class="info-item">
                <span class="info-label">Preferred Job Type:</span>
                <span class="info-value">${preferredJobType.join(", ")}</span>
              </div>`
                  : ""
              }
              ${
                preferredLocation.length > 0
                  ? `<div class="info-item">
                <span class="info-label">Preferred Location:</span>
                <span class="info-value">${preferredLocation.join(", ")}</span>
              </div>`
                  : ""
              }
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const downloadResumePDF = async (htmlContent) => {
    // Create a new window to render the HTML
    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const onFinish = async (values) => {
    try {
      console.log("Form values:", values);

      // Prepare payload according to the example format
      const payload = {
        profilePicture: values.profilePicture || null,
        preferredLocation: values.preferredLocation || [],
        preferredJobType: values.preferredJobType || [],
        currentCTC: values.currentCTC || null,
        expectedCTC: values.expectedCTC || null,
        joiningPeriod: values.joiningPeriod || null,
        totalExperience: values.totalExperience || null,
        relevantSalesforceExperience:
          values.relevantSalesforceExperience || null,
        skills: values.skills || [],
        certifications: values.certifications || [],
        workExperience: values.workExperience || [],
      };
      console.log("payload:", payload);

      // Call the profiledata API
      const response = await profiledata(payload);
      console.log("Profile data response:", response);

      message.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      message.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Title level={2}>Resume Extractor</Title>

      {/* Upload Button */}
      <Upload
        customRequest={handleUpload}
        showUploadList={false}
        accept=".pdf"
        maxCount={1}
      >
        <Button
          type="primary"
          icon={<UploadOutlined />}
          size="large"
          loading={loading}
        >
          Extract Details from Resume
        </Button>
      </Upload>

      {/* Form */}
      <Card title="Candidate Information Form" style={{ marginTop: 20 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={formData}
        >
          <Row gutter={16}>
            {/* Profile Picture */}
            <Col span={24}>
              <Form.Item label="Upload Profile Picture" name="profilePicture">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={(info) => {
                    setFormData((prev) => ({
                      ...prev,
                      profilePicture: info.file,
                    }));
                  }}
                >
                  <div>
                    <UserOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>

            {/* Preferred Location */}
            <Col span={12}>
              <Form.Item
                label="Preferred Location (Select up to 3)"
                name="preferredLocation"
                rules={[
                  {
                    required: true,
                    message: "Please select preferred location!",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select locations"
                  maxTagCount={3}
                  style={{ width: "100%" }}
                >
                  <Option value="Bengaluru, India">Bengaluru, India</Option>
                  <Option value="Mumbai, India">Mumbai, India</Option>
                  <Option value="Delhi, India">Delhi, India</Option>
                  <Option value="Pune, India">Pune, India</Option>
                  <Option value="Hyderabad, India">Hyderabad, India</Option>
                  <Option value="Chennai, India">Chennai, India</Option>
                  <Option value="Remote">Remote</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Preferred Job Type */}
            <Col span={12}>
              <Form.Item
                label="Preferred Job Type (Max 2)"
                name="preferredJobType"
                rules={[{ required: true, message: "Please select job type!" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select job types"
                  maxTagCount={2}
                  style={{ width: "100%" }}
                >
                  <Option value="FullTime">Full Time</Option>
                  <Option value="Contract">Contract</Option>
                  <Option value="Freelance">Freelance</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Current CTC */}
            <Col span={12}>
              <Form.Item
                label="Current CTC"
                name="currentCTC"
                rules={[
                  { required: true, message: "Please enter current CTC!" },
                ]}
              >
                <Input placeholder="e.g., ₹18 LPA" />
              </Form.Item>
            </Col>

            {/* Expected CTC */}
            <Col span={12}>
              <Form.Item
                label="Expected CTC"
                name="expectedCTC"
                rules={[
                  { required: true, message: "Please enter expected CTC!" },
                ]}
              >
                <Input placeholder="e.g., ₹24–28 LPA" />
              </Form.Item>
            </Col>

            {/* Joining Period */}
            <Col span={12}>
              <Form.Item
                label="Joining Period"
                name="joiningPeriod"
                rules={[
                  { required: true, message: "Please enter joining period!" },
                ]}
              >
                <Input placeholder="e.g., 30 days" />
              </Form.Item>
            </Col>

            {/* Total Experience */}
            <Col span={12}>
              <Form.Item
                label="Total Experience"
                name="totalExperience"
                rules={[
                  { required: true, message: "Please enter total experience!" },
                ]}
              >
                <Input placeholder="e.g., 6.5 years" />
              </Form.Item>
            </Col>

            {/* Relevant Experience in Salesforce */}
            <Col span={12}>
              <Form.Item
                label="Relevant Experience in Salesforce"
                name="relevantSalesforceExperience"
                rules={[
                  {
                    required: true,
                    message: "Please enter Salesforce experience!",
                  },
                ]}
              >
                <Input placeholder="e.g., 4 years" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Skills Section */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Skills"
                name="skills"
                rules={[{ required: true, message: "Please enter skills!" }]}
              >
                <Select
                  mode="tags"
                  placeholder="Enter skills"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Certifications Section */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Certifications"
                name="certifications"
                rules={[
                  { required: true, message: "Please enter certifications!" },
                ]}
              >
                <Select
                  mode="tags"
                  placeholder="Enter certifications"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Work Experience Section */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Work Experience"
                name="workExperience"
                rules={[
                  { required: true, message: "Please enter work experience!" },
                ]}
              >
                <Select
                  mode="tags"
                  placeholder="Enter work experience"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Action Buttons */}
          <Form.Item style={{ marginTop: 24 }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{ flex: 1 }}
              >
                Submit Form
              </Button>
              <Button
                type="default"
                icon={<FileTextOutlined />}
                size="large"
                loading={generateLoading}
                onClick={generateResume}
                style={{ flex: 1 }}
              >
                Generate Resume
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Home;
