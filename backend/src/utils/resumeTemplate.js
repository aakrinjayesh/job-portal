// utils/resumeTemplate.js

const generateResumeHTML = (user, profile, job) => {
  const skills = profile?.skillsJson || [];
  const workExperience = profile?.workExperience || [];
  const education = profile?.education || [];
  const primaryClouds = profile?.primaryClouds || [];
  const secondaryClouds = profile?.secondaryClouds || [];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - ${user.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
            padding: 40px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            font-size: 36px;
            margin-bottom: 10px;
        }
        .header .title {
            font-size: 20px;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            font-size: 14px;
        }
        .contact-info div {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .section {
            padding: 30px 40px;
            border-bottom: 1px solid #e0e0e0;
        }
        .section:last-child {
            border-bottom: none;
        }
        .section-title {
            font-size: 22px;
            color: #667eea;
            margin-bottom: 20px;
            font-weight: 600;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        .info-item {
            display: flex;
            flex-direction: column;
        }
        .info-label {
            font-weight: 600;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .info-value {
            color: #333;
            font-size: 15px;
        }
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        .skill-badge {
            background: #f0f4ff;
            color: #667eea;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            border: 1px solid #d0d9ff;
        }
        .experience-item, .education-item {
            margin-bottom: 25px;
            padding-left: 20px;
            border-left: 3px solid #667eea;
        }
        .experience-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
        }
        .experience-company {
            font-size: 16px;
            color: #667eea;
            margin-top: 5px;
        }
        .experience-duration {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        .experience-description {
            margin-top: 10px;
            color: #555;
            line-height: 1.8;
        }
        .project-item {
            margin-top: 15px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 6px;
            border-left: 3px solid #a5b4fc;
        }
        .project-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        .project-skills {
            font-size: 13px;
            color: #667eea;
            margin-bottom: 8px;
        }
        .project-description {
            font-size: 14px;
            color: #555;
            line-height: 1.6;
        }
        .certifications-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 15px;
        }
        .cert-item {
            background: #f9fafb;
            padding: 12px;
            border-radius: 8px;
            border-left: 3px solid #667eea;
        }
        .cloud-container {
            margin-top: 15px;
        }
        .cloud-type {
            font-weight: 600;
            margin-top: 15px;
            margin-bottom: 10px;
            color: #555;
        }
        .cloud-badge {
            display: inline-block;
            background: #f0f4ff;
            color: #667eea;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            border: 1px solid #d0d9ff;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        .footer {
            text-align: center;
            padding: 30px;
            background: #f9fafb;
            border-radius: 0 0 10px 10px;
            color: #666;
            font-size: 14px;
        }
        .application-info {
            background: #fff9e6;
            border: 2px solid #ffd700;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .application-info h3 {
            color: #f59e0b;
            margin-bottom: 10px;
        }
        ul {
            margin-left: 20px;
            margin-top: 10px;
        }
        li {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        ${job ? `
        <div class="application-info">
            <h3>📋 Job Application Details</h3>
            <p><strong>Applied for:</strong> ${job.role}</p>
            <p><strong>Company:</strong> ${job.companyName}</p>
            <p><strong>Application Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        ` : ''}

        <div class="header">
            <h1>${user.name || profile?.name || 'Candidate'}</h1>
            ${profile?.title ? `<div class="title">${profile.title}</div>` : ''}
            <div class="contact-info">
                <div>📧 ${user.email || profile?.email || ''}</div>
                ${profile?.phoneNumber ? `<div>📱 ${profile.phoneNumber}</div>` : ''}
                ${profile?.currentLocation ? `<div>📍 ${profile.currentLocation}</div>` : ''}
                ${profile?.linkedInUrl ? `<div>💼 LinkedIn</div>` : ''}
                ${profile?.trailheadUrl ? `<div>🏔️ Trailhead</div>` : ''}
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Professional Summary</h2>
            <div class="info-grid">
                ${profile?.totalExperience ? `
                <div class="info-item">
                    <div class="info-label">Total Experience</div>
                    <div class="info-value">${profile.totalExperience} years</div>
                </div>
                ` : ''}
                ${profile?.relevantSalesforceExperience ? `
                <div class="info-item">
                    <div class="info-label">Salesforce Experience</div>
                    <div class="info-value">${profile.relevantSalesforceExperience} years</div>
                </div>
                ` : ''}
                ${profile?.currentCTC && profile.currentCTC !== 'undefined' ? `
                <div class="info-item">
                    <div class="info-label">Current CTC</div>
                    <div class="info-value">₹${profile.currentCTC}</div>
                </div>
                ` : ''}
                ${profile?.expectedCTC && profile.expectedCTC !== 'undefined' ? `
                <div class="info-item">
                    <div class="info-label">Expected CTC</div>
                    <div class="info-value">₹${profile.expectedCTC}</div>
                </div>
                ` : ''}
                ${profile?.rateCardPerHour?.value ? `
                <div class="info-item">
                    <div class="info-label">Rate Card</div>
                    <div class="info-value">${profile.rateCardPerHour.currency} ${profile.rateCardPerHour.value}/hr</div>
                </div>
                ` : ''}
                ${profile?.joiningPeriod ? `
                <div class="info-item">
                    <div class="info-label">Notice Period</div>
                    <div class="info-value">${profile.joiningPeriod}</div>
                </div>
                ` : ''}
                ${profile?.preferredLocation?.length > 0 ? `
                <div class="info-item">
                    <div class="info-label">Preferred Locations</div>
                    <div class="info-value">${profile.preferredLocation.join(', ')}</div>
                </div>
                ` : ''}
                ${profile?.preferredJobType?.length > 0 ? `
                <div class="info-item">
                    <div class="info-label">Preferred Job Type</div>
                    <div class="info-value">${profile.preferredJobType.join(', ')}</div>
                </div>
                ` : ''}
            </div>
        </div>

        ${skills.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Skills & Expertise</h2>
            <div class="skills-container">
                ${skills.map(skill => `
                    <div class="skill-badge">
                        ${skill.name}${skill.experience > 0 ? ` (${skill.experience} yrs)` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${(primaryClouds.length > 0 || secondaryClouds.length > 0) ? `
        <div class="section">
            <h2 class="section-title">Cloud Expertise</h2>
            ${primaryClouds.length > 0 ? `
            <div class="cloud-container">
                <div class="cloud-type">Primary Clouds:</div>
                <div>
                    ${primaryClouds.map(cloud => `
                        <span class="cloud-badge">
                            ${typeof cloud === 'string' ? cloud : cloud.name}
                            ${cloud.experience ? ` (${cloud.experience} yrs)` : ''}
                        </span>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            ${secondaryClouds.length > 0 ? `
            <div class="cloud-container">
                <div class="cloud-type">Secondary Clouds:</div>
                <div>
                    ${secondaryClouds.map(cloud => `
                        <span class="cloud-badge">
                            ${typeof cloud === 'string' ? cloud : cloud.name}
                            ${cloud.experience ? ` (${cloud.experience} yrs)` : ''}
                        </span>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
        ` : ''}

        ${workExperience.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Work Experience</h2>
            ${workExperience.map(exp => `
                <div class="experience-item">
                    <div class="experience-title">${exp.role}</div>
                    <div class="experience-company">${exp.payrollCompanyName || 'Company'}</div>
                    <div class="experience-duration">
                        ${exp.startDate || ''} ${exp.startDate && exp.endDate ? '-' : ''} ${exp.endDate || ''}
                    </div>
                    
                    ${exp.projects && exp.projects.length > 0 ? `
                        <div style="margin-top: 15px;">
                            <strong style="color: #555;">Projects:</strong>
                            ${exp.projects.map(project => `
                                <div class="project-item">
                                    <div class="project-name">${project.projectName || 'Project'}</div>
                                    ${project.skillsUsed && project.skillsUsed.length > 0 ? `
                                        <div class="project-skills">
                                            <strong>Skills:</strong> ${project.skillsUsed.join(', ')}
                                        </div>
                                    ` : ''}
                                    ${project.projectDescription ? `
                                        <div class="project-description">${project.projectDescription}</div>
                                    ` : ''}
                                    ${project.rolesAndResponsibilities ? `
                                        <div class="project-description">
                                            <strong>Responsibilities:</strong> ${project.rolesAndResponsibilities}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${education.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Education</h2>
            ${education.map(edu => `
                <div class="education-item">
                    <div class="experience-title">${edu.name || edu.degree || 'Degree'}</div>
                    <div class="experience-company">${edu.institution || ''}</div>
                    <div class="experience-duration">
                        ${edu.fromYear || edu.startYear || ''} ${(edu.fromYear || edu.startYear) && (edu.toYear || edu.endYear) ? '-' : ''} ${edu.toYear || edu.endYear || ''}
                    </div>
                    ${edu.educationType ? `<div class="experience-description">Type: ${edu.educationType}</div>` : ''}
                    ${edu.grade ? `<div class="experience-description">Grade: ${edu.grade}</div>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${profile?.certifications?.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Certifications</h2>
            <div class="certifications-list">
                ${profile.certifications.map(cert => `
                    <div class="cert-item">✓ ${cert}</div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${(profile?.linkedInUrl || profile?.trailheadUrl || profile?.portfolioLink) ? `
        <div class="section">
            <h2 class="section-title">Professional Links</h2>
            ${profile.linkedInUrl ? `<div style="margin-bottom: 10px;">🔗 LinkedIn: ${profile.linkedInUrl}</div>` : ''}
            ${profile.trailheadUrl ? `<div style="margin-bottom: 10px;">🔗 Trailhead: ${profile.trailheadUrl}</div>` : ''}
            ${profile.portfolioLink ? `<div>🔗 Portfolio: ${profile.portfolioLink}</div>` : ''}
        </div>
        ` : ''}

        <div class="footer">
            <p>This resume was generated automatically for job application.</p>
            <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
    </div>
</body>
</html>
  `;
};

export { generateResumeHTML };