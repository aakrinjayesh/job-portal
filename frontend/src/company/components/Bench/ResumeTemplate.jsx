import React, { forwardRef } from "react";
import {
  MailOutlined,
  EnvironmentOutlined,
  MobileOutlined,
} from "@ant-design/icons";

const ResumeTemplate = forwardRef(({ candidate }, ref) => {
  if (!candidate) return null;

  const {
    name,
    title,
    email,
    phoneNumber,
    currentLocation,
    preferredLocation,
    preferredJobType,
    summary,
    rateCardPerHour,
    linkedInUrl,
    portfolioLink,
    trailheadUrl,
    skillsJson,
    primaryClouds,
    secondaryClouds,
    certifications,
    workExperience,
    education,
  } = candidate;

  const isVendor = !!candidate.vendorId;

  const displayEmail = isVendor ? candidate.vendor?.email || email : email;

  const displayPhone = isVendor
    ? candidate.vendor?.phoneNumber || phoneNumber
    : phoneNumber;

  const primarySkills = skillsJson?.filter((s) => s.level === "primary") || [];
  const secondarySkills =
    skillsJson?.filter((s) => s.level === "secondary") || [];

  // Base64 encoded Forcehead logo
  // const forceheadLogo =
  //   "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAfQB9ADASIAAhEBAxEB/8QAHQABAAMBAQADAQAAAAAAAAAAAAcICQYFAgMEAf/EAGMQAQABAwICAwYKEhAFAwMEAwABAgMEBQYREQgSIRMxQVFhcQkUGCMyNjR0stMVFxcjMzU4QlRVVnJzdYGRlJWlsbPBw9IkQ6OywuQWY5KiwuElJ2LxNERk/8QAHAEBAAICAwEAAAAAAAAAAAAAAAYHAQUCAwQI/8QAPBEBAAECAgYGBwcEAwEBAAAAAAECAwQFBhI0NXGxITFBYXKREyMzUYGCshQWMlKh0fATgsHhQuPxYiP/2gAMAwEAAhEDEQA/ALdgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP5VVTTHOqqKY5xHOZ5ds95+LXNWwNF0+vO1C/Fq1T2R4aq58FNMeGUGb23dn7kzI601Y+Fbq52bFM97+tV46vxeDy7DA5dcxd9HRT70ez3SLD5RRqq9aueqn/M+6OawIi3h5xD/AGvStwXv6tnLqn7UVz/3fb8aUomJiJiecS6MVhLmFr9CuP8Ab3ZVm2GzOz/VsTxjtie8AeZswAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB427Nx6ftzT5yc2vrXKucWbFM+vuT5PFHjnwf5Pw753hhbaxu5x1cjULlPO1Yie9/Wq8Uf5z/nEHazqedq+oXM7UL9V69X4Z71MeCIjwR5G4y3KqsTPp3Oinmh2kelVvLYmxY9a7+lPHv7vPu/AFoga/Ku";

  return (
    <div ref={ref}>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #2c3e50;
          line-height: 1.6;
        }

        /* ===== PAGE SETUP ===== */
        @page {
          size: A4;
          margin: 18mm 15mm 22mm 15mm;
        }

        @media print {
          html, body {
            width: 210mm;
            height: 297mm;
          }
          
          .page-break {
            page-break-before: always;
          }

          /* Hide watermark when printing */
          .watermark-bg {
            display: none;
          }

          /* Footer position for print */
          .footer {
            position: fixed;
            bottom: 0;
          }
        }

        /* ===== CONTAINER ===== */
        .resume-container {
          max-width: 210mm;
          // min-height: 297mm;
          margin: 0 auto;
          background: #ffffff;
          position: relative;
          padding-bottom: 80px;
        }

        /* ===== HEADER ===== */
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 28px 40px 22px 40px;
          margin: 0 0 20px 0;
          box-shadow: 0 3px 10px rgba(0,0,0,0.15);
        }

        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 4px 0;
          letter-spacing: 0.5px;
          text-align: center;
        }

        .header .title {
          font-size: 14px;
          font-weight: 400;
          margin: 0 0 10px 0;
          opacity: 0.95;
          text-align: center;
        }

        .header .contact-info {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 12px;
          margin-top: 8px;
        }

        .header .contact-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        /* ===== MAIN CONTENT ===== */
        .main-content {
          padding: 0 40px 90px 40px;
          margin-top: 0;
        }

        /* ===== SECTIONS ===== */
        .section {
          margin-bottom: 22px;
          clear: both;
        }

        /* Prevent page break inside small sections */
        .section:not(.summary-section):not(.experience-section) {
          page-break-inside: avoid;
        }

        .section-title {
          font-size: 17px;
          font-weight: 700;
          color: #667eea;
          border-bottom: 2px solid #667eea;
          padding-bottom: 5px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        /* ===== PROFESSIONAL DETAILS ===== */
        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px 20px;
          margin-top: 10px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          min-height: 38px;
        }

        .detail-label {
          font-size: 10px;
          font-weight: 600;
          color: #7f8c8d;
          text-transform: uppercase;
          margin-bottom: 2px;
          letter-spacing: 0.3px;
        }

        .detail-value {
          font-size: 13px;
          color: #2c3e50;
          font-weight: 500;
          line-height: 1.4;
        }

        /* ===== SUMMARY - PROPER SPACING ===== */
        .summary-section {
          page-break-inside: auto;
          margin-bottom: 30px;
          padding-bottom: 10px;
        }

        .summary-text {
          font-size: 13px;
          line-height: 1.7;
          color: #34495e;
          white-space: pre-wrap;
          text-align: justify;
          margin-top: 8px;
          overflow-wrap: break-word;
          word-break: normal;
        }

        /* ===== LINKS - BETTER SPACING FROM SUMMARY ===== */
        .links-section {
          margin-top: 10px;
          margin-bottom: 22px;
          page-break-inside: avoid;
        }

        .links-container {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .link-item {
          text-decoration: none;
          color: #667eea;
          font-size: 12px;
          font-weight: 500;
          padding: 5px 12px;
          border: 1.5px solid #667eea;
          border-radius: 15px;
          transition: all 0.2s ease;
          display: inline-block;
        }

        .link-item:hover {
          background: #667eea;
          color: white;
        }

        /* ===== BADGES (Skills & Clouds) ===== */
        .badges-container {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 8px;
        }

        .badge {
          display: inline-block;
          padding: 4px 10px;
          background: linear-gradient(135deg, #f0f4ff 0%, #e8edff 100%);
          color: #667eea;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid #d0daf7;
        }

        .sub-section-title {
          font-weight: 600;
          font-size: 13px;
          color: #5a67d8;
          margin-top: 12px;
          margin-bottom: 6px;
        }

        /* ===== CERTIFICATIONS ===== */
        .certifications-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .certification-badge {
          padding: 5px 12px;
          background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
          color: #e53e3e;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid #fecaca;
        }

        /* ===== WORK EXPERIENCE ===== */
        .experience-section {
          page-break-inside: auto;
        }

        .experience-item {
          margin-bottom: 18px;
          padding-left: 12px;
          border-left: 3px solid #667eea;
          page-break-inside: avoid;
        }

        .experience-item:last-child {
          margin-bottom: 0;
        }

        .experience-role {
          font-size: 14px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 3px;
        }

        .experience-role small {
          font-size: 10px;
          font-weight: 500;
          color: #7f8c8d;
          text-transform: uppercase;
        }

        .experience-company {
          font-size: 13px;
          color: #667eea;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .experience-company small {
          font-size: 10px;
          font-weight: 500;
          color: #7f8c8d;
          text-transform: uppercase;
        }

        .experience-duration {
          font-size: 11px;
          color: #7f8c8d;
          font-style: italic;
          margin-bottom: 8px;
        }

        .experience-duration small {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .project-container {
          padding-left: 10px;
          margin-top: 6px;
          border-left: 2px solid #e0e0e0;
        }

        .project-name {
          font-size: 12px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 3px;
        }

        .project-detail {
          font-size: 11px;
          margin-bottom: 5px;
          line-height: 1.5;
        }

        .project-detail strong {
          color: #5a67d8;
          font-weight: 600;
        }

        .project-roles {
          white-space: pre-wrap;
          margin-top: 2px;
          font-size: 11px;
          line-height: 1.6;
        }

        /* ===== EDUCATION ===== */
        .education-item {
          margin-bottom: 12px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
          border-left: 3px solid #667eea;
        }

        .education-item:last-child {
          margin-bottom: 0;
        }

        .education-name {
          font-size: 14px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 3px;
        }

        .education-name small {
          font-size: 10px;
          font-weight: 500;
          color: #7f8c8d;
          text-transform: uppercase;
        }

        .education-type {
          font-size: 12px;
          color: #667eea;
          margin-bottom: 2px;
        }

        .education-type small {
          font-size: 10px;
          font-weight: 500;
          color: #7f8c8d;
          text-transform: uppercase;
        }

        .education-years {
          font-size: 11px;
          color: #7f8c8d;
        }

        .education-years small {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
        }

        /* ===== FOOTER - LARGER SIZE ===== */
        .footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 55px;
          background: linear-gradient(to top, #f8f9fa 0%, rgba(248, 249, 250, 0.98) 100%);
          border-top: 1.5px solid #d0d0d0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          z-index: 9999;
        }

        .footer-logo {
          height: 35px;
          opacity: 0.5;
        }

        .footer-text {
          font-size: 10px;
          color: #95a5a6;
          text-align: right;
        }

        /* ===== WATERMARK - MORE VISIBLE ===== */
        .watermark-bg {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 110px;
          font-weight: 900;
          color: rgba(102, 126, 234, 0.06);
          z-index: 0;
          pointer-events: none;
          user-select: none;
          letter-spacing: 15px;
        }

        /* Make sure content is above watermark */
        .header,
        .main-content {
          position: relative;
          z-index: 1;
        }

        /* ===== PRINT ADJUSTMENTS ===== */
        @media print {
          .resume-container {
            padding-bottom: 60px;
          }

          .footer {
            position: fixed;
            bottom: 0;
          }

          .watermark-bg {
            display: none;
          }

          /* Prevent orphans and widows */
          p, .project-detail, .experience-item {
            orphans: 3;
            widows: 3;
          }
        }

        /* ===== RESPONSIVE ADJUSTMENTS ===== */
        @media screen and (max-width: 768px) {
          .header {
            padding: 20px 20px;
          }

          .header h1 {
            font-size: 24px;
          }

          .main-content {
            padding: 0 20px 70px 20px;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .footer {
            padding: 0 20px;
          }
        }
          /* ===== PRINT HEADER & FOOTER (EVERY PAGE) ===== */
@media print {

  /* Reserve space on EVERY page */
  @page {
    size: A4;
    margin-top: 30mm;
    margin-bottom: 25mm;
    margin-left: 15mm;
    margin-right: 15mm;
  }

  /* ===== HEADER ===== */
  .print-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 25mm;
    background: white;
    border-bottom: 1px solid #e0e0e0;
    z-index: 99999;
  }

  .print-header-inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    color: #2c3e50;
  }

  /* ===== FOOTER ===== */
  .print-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20mm;
    background: white;
    border-top: 1px solid #e0e0e0;
    z-index: 99999;
  }

  .print-footer-inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 15mm;
    font-size: 10px;
    color: #7f8c8d;
  }

  /* Hide screen header in print */
  .header {
    display: none !important;
  }

  /* Hide watermark */
  .watermark-bg {
    display: none !important;
  }
}


      `}</style>
      {/* <div ref={ref}> */}
      {/* 2️⃣ PRINT HEADER (JSX, NOT CSS) */}
      {/* <div className="print-header">
        <div className="print-header-inner">{name}</div>
      </div> */}

      {/* 3️⃣ PRINT FOOTER (JSX, NOT CSS) */}
      {/* <div className="print-footer">
        <div className="print-footer-inner">
          Generated by Forcehead —{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div> */}

      <div className="resume-container">
        {/* WATERMARK BACKGROUND - MORE VISIBLE */}
        <div className="watermark-bg">FORCEHEAD</div>

        {/* HEADER */}
        <div className="header">
          <h1>{name}</h1>
          <div className="title">{title}</div>

          {/* <div className="contact-info">
            {displayEmail && (
              <span className="contact-item">✉ {displayEmail}</span>
            )}

            {displayPhone && (
              <span className="contact-item">📱 {displayPhone}</span>
            )}

            {currentLocation && (
              <span className="contact-item">📍 {currentLocation}</span>
            )}
          </div> */}
          <div className="contact-info">
            {displayEmail && (
              <span className="contact-item">
                <MailOutlined
                  style={{ marginRight: 6, fontSize: 13, color: "white" }}
                />
                {displayEmail}
              </span>
            )}

            {displayPhone && (
              <span className="contact-item">
                <MobileOutlined
                  style={{ marginRight: 6, fontSize: 13, color: "white" }}
                />
                {displayPhone}
              </span>
            )}

            {currentLocation && (
              <span className="contact-item">
                <EnvironmentOutlined
                  style={{ marginRight: 6, fontSize: 13, color: "white" }}
                />
                {currentLocation}
              </span>
            )}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="main-content">
          {/* PROFESSIONAL DETAILS */}
          <div className="section">
            <h2 className="section-title">Professional Details</h2>
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-label">Total Experience</div>
                <div className="detail-value">
                  {candidate.totalExperience
                    ? `${candidate.totalExperience} years`
                    : "N/A"}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">
                  Relevant Salesforce Experience
                </div>
                <div className="detail-value">
                  {candidate.relevantSalesforceExperience
                    ? `${candidate.relevantSalesforceExperience} years`
                    : "N/A"}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Joining Period</div>
                <div className="detail-value">
                  {candidate.joiningPeriod || "N/A"}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Preferred Location</div>
                <div className="detail-value">
                  {preferredLocation?.join(", ") || "N/A"}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Rate Card</div>
                <div className="detail-value">
                  {rateCardPerHour
                    ? `${rateCardPerHour.currency || "INR"} ${
                        rateCardPerHour.value
                      }/Month`
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* SUMMARY - PROPER SPACING */}
          <div className="section summary-section">
            <h2 className="section-title">Summary</h2>
            <p className="summary-text">
              {summary?.trim() || "No summary provided"}
            </p>
          </div>

          {/* LINKS - BETTER SPACING FROM SUMMARY */}
          {(linkedInUrl || portfolioLink || trailheadUrl) && (
            <div className="section links-section">
              <h2 className="section-title"> Links</h2>
              <div className="links-container">
                {linkedInUrl && (
                  <a
                    className="link-item"
                    href={linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔗 LinkedIn
                  </a>
                )}
                {portfolioLink && (
                  <a
                    className="link-item"
                    href={portfolioLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    💼 Portfolio
                  </a>
                )}
                {trailheadUrl && (
                  <a
                    className="link-item"
                    href={trailheadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🏆 Trailhead
                  </a>
                )}
              </div>
            </div>
          )}

          {/* SKILLS */}
          <div className="section">
            <h2 className="section-title">Skills </h2>

            {primarySkills.length > 0 && (
              <>
                <div className="sub-section-title">Primary Skills</div>
                <div className="badges-container">
                  {primarySkills.map((s, i) => (
                    <span key={i} className="badge">
                      {s.name}
                    </span>
                  ))}
                </div>
              </>
            )}

            {secondarySkills.length > 0 && (
              <>
                <div className="sub-section-title">Secondary Skills</div>
                <div className="badges-container">
                  {secondarySkills.map((s, i) => (
                    <span key={i} className="badge">
                      {s.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* CLOUDS */}
          {(primaryClouds?.length > 0 || secondaryClouds?.length > 0) && (
            <div className="section">
              <h2 className="section-title">Clouds</h2>

              {primaryClouds?.length > 0 && (
                <>
                  <div className="sub-section-title">Primary Clouds</div>
                  <div className="badges-container">
                    {primaryClouds.map((c, i) => (
                      <span key={i} className="badge">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {secondaryClouds?.length > 0 && (
                <>
                  <div className="sub-section-title">Secondary Clouds</div>
                  <div className="badges-container">
                    {secondaryClouds.map((c, i) => (
                      <span key={i} className="badge">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* CERTIFICATIONS */}
          {certifications?.length > 0 && (
            <div className="section">
              <h2 className="section-title">Certifications</h2>
              <div className="certifications-container">
                {certifications.map((cert, i) => (
                  <span key={i} className="certification-badge">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* WORK EXPERIENCE */}
          {workExperience?.length > 0 && (
            <div className="section experience-section">
              <h2 className="section-title">Work Experience</h2>
              {workExperience.map((exp, i) => (
                <div key={i} className="experience-item">
                  <div className="experience-role">
                    <small>Role:</small> {exp.role}
                  </div>

                  <div className="experience-company">
                    <small>Company:</small> {exp.payrollCompanyName}
                  </div>

                  <div className="experience-duration">
                    <small>Duration:</small> {exp.startDate} –{" "}
                    {exp.endDate || "Present"}
                  </div>

                  {/* Projects */}
                  {exp.projects?.map((proj, j) => (
                    <div key={j} className="project-container">
                      <div className="project-name">
                        Project {proj.projectName}
                      </div>

                      {proj.projectDescription && (
                        <div className="project-detail">
                          <strong>Description:</strong>{" "}
                          {proj.projectDescription}
                        </div>
                      )}

                      {proj.rolesAndResponsibilities && (
                        <div className="project-detail">
                          <strong>Roles & Responsibilities:</strong>
                          <div className="project-roles">
                            {proj.rolesAndResponsibilities}
                          </div>
                        </div>
                      )}

                      {proj.skillsUsed?.length > 0 && (
                        <div className="project-detail">
                          <strong>Skills:</strong> {proj.skillsUsed.join(", ")}
                        </div>
                      )}

                      {proj.cloudUsed?.length > 0 && (
                        <div className="project-detail">
                          <strong>Clouds:</strong> {proj.cloudUsed.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* EDUCATION */}
          {education?.length > 0 && (
            <div className="section">
              <h2 className="section-title">Education</h2>
              {education.map((edu, i) => (
                <div key={i} className="education-item">
                  <div className="education-name">
                    <small>Education:</small> {edu.name}
                  </div>

                  <div className="education-type">
                    <small>Institute Name:</small> {edu.educationType}
                  </div>

                  <div className="education-years">
                    <small>Duration:</small> {edu.fromYear} – {edu.toYear}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER WITH WATERMARK - LARGER SIZE */}
        {/* <div className="footer">
          <img src={forceheadLogo} alt="Forcehead" className="footer-logo" />
          <div className="footer-text">
            Generated on{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div> */}
      </div>
    </div>
    // </div>
  );
});

export default ResumeTemplate;
