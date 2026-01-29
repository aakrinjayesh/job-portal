import React, { forwardRef } from "react";

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

  const primarySkills = skillsJson?.filter((s) => s.level === "primary") || [];
  const secondarySkills =
    skillsJson?.filter((s) => s.level === "secondary") || [];

  return (
    <div ref={ref}>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma; color:#333; }
        .container { max-width: 900px; margin: auto; }
        .header {
          background: linear-gradient(135deg,#667eea,#764ba2);
          color: white;
          padding: 40px;
        }
        .section {
          padding: 24px 40px;
          border-bottom: 1px solid #e0e0e0;
        }
        .section-title {
          font-size: 22px;
          color: #667eea;
          border-bottom: 2px solid #667eea;
          margin-bottom: 16px;
          padding-bottom: 6px;
        }
        .badge {
          display: inline-block;
          padding: 6px 14px;
          margin: 4px;
          background: #f0f4ff;
          color: #667eea;
          border-radius: 20px;
          font-size: 14px;
        }
        .sub-title {
          font-weight: 600;
          margin-top: 10px;
          margin-bottom: 6px;
        }
        .link {
          display: block;
          margin-bottom: 6px;
        }
      `}</style>

      <div className="container">
        {/* HEADER */}
        <div className="header">
          <h1>{name}</h1>
          <div>{title}</div>
          <div>{email}</div>
          {phoneNumber && <div>{phoneNumber}</div>}
          {currentLocation && <div>{currentLocation}</div>}
        </div>

        {/* PROFESSIONAL DETAILS */}
        <div className="section">
          <h2 className="section-title">Professional Details</h2>

          <p>
            <strong>Total Experience:</strong>{" "}
            {candidate.totalExperience
              ? `${candidate.totalExperience} years`
              : "N/A"}
          </p>

          <p>
            <strong>Relevant Salesforce Experience:</strong>{" "}
            {candidate.relevantSalesforceExperience
              ? `${candidate.relevantSalesforceExperience} years`
              : "N/A"}
          </p>

          <p>
            <strong>Joining Period:</strong> {candidate.joiningPeriod || "N/A"}
          </p>

          <p>
            <strong>Preferred Job Type:</strong>{" "}
            {candidate.preferredJobType?.join(", ") || "N/A"}
          </p>

          <p>
            <strong>Preferred Location:</strong>{" "}
            {candidate.preferredLocation?.join(", ") || "N/A"}
          </p>

          <p>
            <strong>Rate Card:</strong>{" "}
            {candidate.rateCardPerHour
              ? `${candidate.rateCardPerHour.currency || "INR"} ${
                  candidate.rateCardPerHour.value
                }/Month`
              : "N/A"}
          </p>
        </div>

        {/* SKILLS */}
        <div className="section">
          <h2 className="section-title">Skills</h2>

          <div className="sub-title">Primary Skills</div>
          {primarySkills.length
            ? primarySkills.map((s, i) => (
                <span key={i} className="badge">
                  {s.name}
                </span>
              ))
            : "N/A"}

          {secondarySkills.length > 0 && (
            <>
              <div className="sub-title">Secondary Skills</div>
              {secondarySkills.map((s, i) => (
                <span key={i} className="badge">
                  {s.name}
                </span>
              ))}
            </>
          )}
        </div>

        {/* SALESFORCE CLOUDS */}
        {(primaryClouds?.length > 0 || secondaryClouds?.length > 0) && (
          <div className="section">
            <h2 className="section-title">Salesforce Clouds</h2>

            {primaryClouds?.length > 0 && (
              <>
                <div className="sub-title">Primary Clouds</div>
                {primaryClouds.map((c, i) => (
                  <span key={i} className="badge">
                    {c.name} ({c.experience} yrs)
                  </span>
                ))}
              </>
            )}

            {secondaryClouds?.length > 0 && (
              <>
                <div className="sub-title">Secondary Clouds</div>
                {secondaryClouds.map((c, i) => (
                  <span key={i} className="badge">
                    {c.name} ({c.experience} yrs)
                  </span>
                ))}
              </>
            )}
          </div>
        )}

        {/* CERTIFICATIONS */}
        {certifications?.length > 0 && (
          <div className="section">
            <h2 className="section-title">Certifications</h2>
            {certifications.map((cert, i) => (
              <span key={i} className="badge">
                {cert}
              </span>
            ))}
          </div>
        )}

        {/* WORK EXPERIENCE */}
        {workExperience?.length > 0 && (
          <div className="section">
            <h2 className="section-title">Work Experience</h2>
            {workExperience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <strong>{exp.role}</strong> – {exp.payrollCompanyName}
                <div>
                  {exp.startDate} – {exp.endDate || "Present"}
                </div>
                {exp.projects?.map((proj, j) => (
                  <div key={j} style={{ marginTop: 8, paddingLeft: 12 }}>
                    <div>
                      <strong>Project:</strong> {proj.projectName}
                    </div>
                    <div>
                      <strong>Description:</strong>{" "}
                      {proj.projectDescription || "N/A"}
                    </div>
                    <div>
                      <strong>Skills Used:</strong>{" "}
                      {proj.skillsUsed?.join(", ") || "N/A"}
                    </div>
                    <div>
                      <strong>Responsibilities:</strong>{" "}
                      {proj.rolesAndResponsibilities || "N/A"}
                    </div>
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
              <div key={i} style={{ marginBottom: 10 }}>
                <strong>{edu.name}</strong>
                <div>
                  {edu.fromYear} – {edu.toYear}
                </div>
                <div>{edu.educationType}</div>
              </div>
            ))}
          </div>
        )}

        {/* LINKS */}
        {(linkedInUrl || portfolioLink || trailheadUrl) && (
          <div className="section">
            <h2 className="section-title">Links</h2>
            {linkedInUrl && (
              <a
                className="link"
                href={linkedInUrl}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            )}
            {portfolioLink && (
              <a
                className="link"
                href={portfolioLink}
                target="_blank"
                rel="noreferrer"
              >
                Portfolio
              </a>
            )}
            {trailheadUrl && (
              <a
                className="link"
                href={trailheadUrl}
                target="_blank"
                rel="noreferrer"
              >
                Trailhead
              </a>
            )}
          </div>
        )}

        {/* FOOTER */}
        <div className="section" style={{ textAlign: "center" }}>
          Generated on {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
});

export default ResumeTemplate;
