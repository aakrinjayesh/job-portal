import React from "react";
import { useState } from "react";
import { Button, message } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

function GenerateResume({ form }) {
  const [generateLoading, setGenerateLoading] = useState(false);

  const generateResumeButton = async () => {
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

  return (
    <>
      <Button
        type="default"
        icon={<FileTextOutlined />}
        size="large"
        loading={generateLoading}
        onClick={generateResumeButton}
        style={{ flex: 1 }}
      >
        Generate Resume
      </Button>
    </>
  );
}

export default GenerateResume;
