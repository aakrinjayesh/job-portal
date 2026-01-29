import React, { useState } from "react";
import { Button, message } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

function GenerateResume({ candidate }) {
  const [generateLoading, setGenerateLoading] = useState(false);

  const generateResumeButton = async (e) => {
    e.stopPropagation(); // ✅ prevent card click navigation
    try {
      setGenerateLoading(true);

      const resumeHTML = createResumeHTML(candidate);
      await downloadResumePDF(resumeHTML);

      message.success("Resume generated successfully!");
    } catch (error) {
      console.error("Resume generation error:", error);
      message.error("Failed to generate resume");
    } finally {
      setGenerateLoading(false);
    }
  };

  const createResumeHTML = (values) => {
    const {
      name,
      title,
      currentLocation,
      preferredLocation = [],
      joiningPeriod,
      totalExperience,
      relevantSalesforceExperience,
      rateCardPerHour,
      skillsJson = [],
      certifications = [],
      primaryClouds = [],
      secondaryClouds = [],
      workExperience = [],
      isVendor,
    } = values;

    const skills = skillsJson.map((s) => s.name);

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Resume</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
          }
          h1 {
            color: #1e40af;
            margin-bottom: 4px;
          }
          h3 {
            color: #555;
            margin-top: 0;
          }
          hr {
            margin: 20px 0;
          }
          ul {
            padding-left: 18px;
          }
          .section {
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <h1>${name || "Candidate"}</h1>
        <h3>${title || ""}</h3>
        <p><b>Profile Type:</b> ${
          isVendor ? "Vendor Candidate" : "Individual Candidate"
        }</p>

        <hr />

        <div class="section">
          <p><b>Location:</b> ${
            currentLocation || preferredLocation.join(", ") || "-"
          }</p>
          <p><b>Total Experience:</b> ${totalExperience || "-"}</p>
          <p><b>Salesforce Experience:</b> ${
            relevantSalesforceExperience || "-"
          }</p>
          <p><b>Joining Period:</b> ${joiningPeriod || "-"}</p>
          <p><b>Rate:</b> ${
            rateCardPerHour?.value ? `₹ ${rateCardPerHour.value}` : "-"
          }</p>
        </div>

        <hr />

        ${
          skills.length > 0
            ? `<div class="section">
                <h3>Skills</h3>
                <ul>
                  ${skills.map((s) => `<li>${s}</li>`).join("")}
                </ul>
              </div>`
            : ""
        }

        ${
          primaryClouds.length > 0
            ? `<div class="section">
                <h3>Primary Clouds</h3>
                <ul>
                  ${primaryClouds
                    .map((c) => `<li>${c.name} (${c.experience} yrs)</li>`)
                    .join("")}
                </ul>
              </div>`
            : ""
        }

        ${
          certifications.length > 0
            ? `<div class="section">
                <h3>Certifications</h3>
                <ul>
                  ${certifications.map((c) => `<li>${c}</li>`).join("")}
                </ul>
              </div>`
            : ""
        }

        ${
          workExperience.length > 0
            ? `<div class="section">
                <h3>Work Experience</h3>
                ${workExperience
                  .map(
                    (exp) => `
                  <p><b>${exp.role}</b> - ${exp.payrollCompanyName}</p>
                `
                  )
                  .join("")}
              </div>`
            : ""
        }
      </body>
    </html>
    `;
  };

  const downloadResumePDF = async (htmlContent) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print(); // user chooses Save as PDF
        printWindow.close();
      }, 500);
    };
  };

  return (
    <Button
      type="default"
      icon={<FileTextOutlined />}
      loading={generateLoading}
      onClick={generateResumeButton}
    >
      Generate Resume
    </Button>
  );
}

export default GenerateResume;
