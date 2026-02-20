// import React from "react";
// import { useRef } from "react";
// import html2pdf from "html2pdf.js";

// import {
//   Card,
//   Typography,
//   Divider,
//   Tag,
//   Row,
//   Col,
//   Space,
//   Avatar,
//   Tooltip,
// } from "antd";
// import {
//   MailOutlined,
//   PhoneOutlined,
//   EnvironmentOutlined,
//   LinkOutlined,
//   LinkedinOutlined,
//   UserOutlined,
// } from "@ant-design/icons";
// import { useLocation } from "react-router-dom";
// import { ArrowLeftOutlined } from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";
// import dayjs from "dayjs";
// import ResumeTemplate from "./ResumeTemplate";

// const { Title, Text } = Typography;

// const BenchCandidateDetails = () => {
//   const location = useLocation();
//   const candidate = location.state?.candidate;
//   const from = location.state?.from;
//   const resumeRef = useRef(null);
//   const navigate = useNavigate();

//   console.log("candidate", candidate);
//   console.log("candidate vebdirs", candidate.isVendor);

//   if (!candidate) {
//     return (
//       <Card style={{ textAlign: "center", marginTop: 50 }}>
//         No candidate selected.
//       </Card>
//     );
//   }

//   const {
//     name,
//     title,
//     email,
//     phoneNumber,
//     currentLocation,
//     preferredLocation,
//     preferredJobType,
//     portfolioLink,
//     linkedInUrl,
//     trailheadUrl,
//     joiningPeriod,
//     totalExperience,
//     relevantSalesforceExperience,
//     skillsJson,
//     primaryClouds,
//     secondaryClouds,
//     certifications,
//     workExperience,
//     education,
//     rateCardPerHour,
//     isVendor,
//   } = candidate;

//   const primarySkills = skillsJson?.filter((s) => s.level === "primary") || [];
//   const secondarySkills =
//     skillsJson?.filter((s) => s.level === "secondary") || [];

//   return (
//     <Card
//       bordered={false}
//       style={{
//         maxWidth: 950,
//         margin: "30px auto",
//         borderRadius: 20,
//         background: "#ffffff",
//         boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
//         padding: "24px 32px",
//       }}
//     >
//       {/* <div style={{ marginBottom: 20 }}>
//         <button
//           onClick={() =>
//             navigate(
//               from === "mybench" ? "/company/bench " : "/company/bench/find"
//             )
//           }
//           style={{
//             background: "none",
//             border: "none",
//             cursor: "pointer",
//             fontSize: 16,
//             display: "flex",
//             alignItems: "center",
//             gap: 8,
//             color: "#1677ff",
//           }}
//         >
//           <ArrowLeftOutlined /> Back
//         </button>
//       </div> */}

//       {/* Header Section */}
//       <Row align="middle" gutter={16}>
//         <Col flex="80px">
//           <Avatar
//             size={80}
//             src={
//               candidate?.profilePicture
//                 ? `${candidate.profilePicture}?t=${Date.now()}`
//                 : undefined
//             }
//             icon={!candidate?.profilePicture ? <UserOutlined /> : null}
//             style={{
//               backgroundColor: candidate?.profilePicture
//                 ? undefined
//                 : "#1677ff",
//               color: "#fff",
//               fontSize: 28,
//               objectFit: "cover",
//             }}
//             onError={(e) => (e.currentTarget.src = "")}
//             key={candidate?.profilePicture || "no-pic"}
//           />
//         </Col>

//         <Col flex="auto">
//           <Title level={2} style={{ marginBottom: 0 }}>
//             {name}
//           </Title>
//           <Text type="secondary" style={{ fontSize: 16 }}>
//             {title}
//           </Text>
//           <div style={{ marginTop: 6 }}>
//             <Tag color="blue">{totalExperience} yrs Exp</Tag>
//             <Tag color="purple">
//               {relevantSalesforceExperience} yrs Salesforce
//             </Tag>
//             {joiningPeriod && <Tag color="green">Join in {joiningPeriod}</Tag>}
//           </div>
//         </Col>

//         <Col>
//           <button
//             onClick={() => {
//               if (!resumeRef.current) return;

//               html2pdf()
//                 .set({
//                   margin: 10,
//                   filename: `${name}_Resume.pdf`,
//                   image: { type: "jpeg", quality: 0.98 },
//                   html2canvas: {
//                     scale: 2,
//                     useCORS: true,
//                   },
//                   jsPDF: {
//                     unit: "mm",
//                     format: "a4",
//                     orientation: "portrait",
//                   },
//                 })
//                 .from(resumeRef.current)
//                 .save();
//             }}
//             style={{
//               padding: "8px 16px",
//               background: "#1677ff",
//               color: "#fff",
//               border: "none",
//               borderRadius: 6,
//               cursor: "pointer",
//             }}
//           >
//             Generate Resume
//           </button>
//         </Col>
//       </Row>

//       <Divider />

//       {/* CONTACT DETAILS — hide only email + phone */}
//       <Row justify="start" gutter={[24, 12]}>
//         {/* Case 1: Opened from My Bench → show candidate's own contact */}
//         {from === "mybench" && (
//           <>
//             {candidate.email && (
//               <Col>
//                 <MailOutlined />{" "}
//                 <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
//               </Col>
//             )}

//             {candidate.phoneNumber && (
//               <Col>
//                 <PhoneOutlined /> {candidate.phoneNumber}
//               </Col>
//             )}
//           </>
//         )}

//         {/* Case 2: Opened from Find Candidate → Vendor candidate → show vendor email */}
//         {from === "find" && candidate.vendorId && candidate.vendor?.email && (
//           <>
//             <Col>
//               POC Contact: <MailOutlined />{" "}
//               <a href={`mailto:${candidate.vendor.email}`}>
//                 {candidate.vendor.email}
//               </a>
//             </Col>
//             {/* <Col>
//               <PhoneOutlined /> {candidate?.vendor?.phoneNumber}
//             </Col> */}
//           </>
//         )}

//         {/* Case 3: Opened from Find Candidate → Individual candidate → show candidate email */}
//         {from === "find" && !candidate.vendorId && candidate.email && (
//           <>
//             <Col>
//               <MailOutlined />{" "}
//               <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
//             </Col>
//             <Col>
//               <PhoneOutlined /> {candidate?.phoneNumber}
//             </Col>
//           </>
//         )}

//         {/* Location – always visible */}
//         {currentLocation && (
//           <Col>
//             <EnvironmentOutlined /> {currentLocation}
//           </Col>
//         )}
//       </Row>

//       <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
//         {portfolioLink && (
//           <Col>
//             <Tooltip title="Portfolio Link">
//               <LinkOutlined />{" "}
//               <a href={portfolioLink} target="_blank" rel="noreferrer">
//                 Portfolio
//               </a>
//             </Tooltip>
//           </Col>
//         )}
//         {linkedInUrl && (
//           <Col>
//             <Tooltip title="LinkedIn Profile">
//               <LinkedinOutlined />{" "}
//               <a href={linkedInUrl} target="_blank" rel="noreferrer">
//                 LinkedIn
//               </a>
//             </Tooltip>
//           </Col>
//         )}
//         {trailheadUrl && (
//           <Col>
//             <Tooltip title="Trailhead Profile">
//               <LinkOutlined />{" "}
//               <a href={trailheadUrl} target="_blank" rel="noreferrer">
//                 Trailhead
//               </a>
//             </Tooltip>
//           </Col>
//         )}
//       </Row>

//       <Divider />

//       {/* Professional Details */}
//       <Row gutter={[16, 12]}>
//         <Col span={12}>
//           <Text strong>Preferred Job Type:</Text>{" "}
//           {preferredJobType?.join(", ") || "N/A"}
//         </Col>
//         <Col span={12}>
//           <Text strong>Preferred Location:</Text>{" "}
//           {preferredLocation?.join(", ") || "N/A"}
//         </Col>
//         <Col span={12}>
//           <Text strong>Rate Card:</Text>{" "}
//           {rateCardPerHour
//             ? `${rateCardPerHour.currency || "INR"} ${
//                 rateCardPerHour.value
//               }/Month`
//             : "N/A"}
//         </Col>
//       </Row>

//       {/* Skills */}
//       <Divider />
//       <Title level={4} style={{ marginBottom: 12 }}>
//         Skills
//       </Title>

//       <Text strong>Primary Skills:</Text>
//       <div style={{ margin: "8px 0 12px" }}>
//         {primarySkills.length > 0
//           ? primarySkills.map((s, i) => (
//               <Tag key={i} color="blue" style={{ borderRadius: 16 }}>
//                 {s.name}
//               </Tag>
//             ))
//           : "N/A"}
//       </div>

//       {secondarySkills.length > 0 && (
//         <>
//           <Text strong>Secondary Skills:</Text>
//           <div style={{ marginTop: 8 }}>
//             {secondarySkills.map((s, i) => (
//               <Tag key={i} color="geekblue" style={{ borderRadius: 16 }}>
//                 {s.name}
//               </Tag>
//             ))}
//           </div>
//         </>
//       )}

//       {/* Clouds */}
//       {(primaryClouds?.length > 0 || secondaryClouds?.length > 0) && (
//         <>
//           <Divider />
//           <Title level={4}>Salesforce Clouds</Title>
//           {primaryClouds?.length > 0 && (
//             <div style={{ marginBottom: 8 }}>
//               <Text strong>Primary:</Text>{" "}
//               {primaryClouds.map((c, i) => (
//                 <Tag key={i} color="purple" style={{ borderRadius: 16 }}>
//                   {c.name} ({c.experience} yrs)
//                 </Tag>
//               ))}
//             </div>
//           )}
//           {secondaryClouds?.length > 0 && (
//             <div>
//               <Text strong>Secondary:</Text>{" "}
//               {secondaryClouds.map((c, i) => (
//                 <Tag key={i} color="magenta" style={{ borderRadius: 16 }}>
//                   {c.name} ({c.experience} yrs)
//                 </Tag>
//               ))}
//             </div>
//           )}
//         </>
//       )}

//       {/* Certifications */}
//       {certifications?.length > 0 && (
//         <>
//           <Divider />
//           <Title level={4}>Certifications</Title>
//           <Space wrap>
//             {certifications.map((cert, i) => (
//               <Tag key={i} color="success" style={{ borderRadius: 16 }}>
//                 {cert}
//               </Tag>
//             ))}
//           </Space>
//         </>
//       )}

//       {/* Work Experience */}
//       {workExperience?.length > 0 && (
//         <>
//           <Divider />
//           <Title level={4}>Work Experience</Title>
//           {workExperience.map((exp, idx) => (
//             <Card
//               key={idx}
//               type="inner"
//               title={
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     width: "100%",
//                   }}
//                 >
//                   {/* LEFT: Job Title */}
//                   <span style={{ fontWeight: 600 }}>
//                     {exp.role} @ {exp.payrollCompanyName}
//                   </span>

//                   {/* RIGHT: Date */}
//                   <span style={{ color: "#777", fontSize: 14 }}>
//                     {exp.startDate
//                       ? dayjs(exp.startDate).isValid()
//                         ? dayjs(exp.startDate).format("MM/YYYY")
//                         : exp.startDate
//                       : "N/A"}
//                     {" - "}
//                     {!exp.endDate || exp.endDate.toLowerCase?.() === "present"
//                       ? "Present"
//                       : dayjs(exp.endDate).isValid()
//                       ? dayjs(exp.endDate).format("MM/YYYY")
//                       : exp.endDate}
//                   </span>
//                 </div>
//               }
//               style={{
//                 marginBottom: 12,
//                 borderRadius: 10,
//                 background: "#fafafa",
//               }}
//             >
//               {exp.projects?.length > 0 && (
//                 <div style={{ marginTop: 10 }}>
//                   {exp.projects.map((proj, i) => (
//                     <Card
//                       key={i}
//                       type="inner"
//                       size="small"
//                       title={
//                         <span style={{ fontWeight: 500, color: "#666" }}>
//                           <strong>Project:</strong> {proj.projectName}
//                         </span>
//                       }
//                       style={{
//                         marginBottom: 8,
//                         background: "#fff",
//                         borderRadius: 8,
//                       }}
//                     >
//                       <p>
//                         <Text strong>Description:</Text>{" "}
//                         {proj.projectDescription || "N/A"}
//                       </p>
//                       <p>
//                         <Text strong>Cloud Used:</Text>{" "}
//                         {proj.cloudUsed || "N/A"}
//                       </p>
//                       <p>
//                         <Text strong>Skills Used:</Text>{" "}
//                         {proj.skillsUsed?.join(", ") || "N/A"}
//                       </p>
//                       <p>
//                         <Text strong>Responsibilities:</Text>{" "}
//                         {proj.rolesAndResponsibilities || "N/A"}
//                       </p>
//                     </Card>
//                   ))}
//                 </div>
//               )}
//             </Card>
//           ))}
//         </>
//       )}

//       {/* Education */}
//       {education?.length > 0 && (
//         <>
//           <Divider />
//           <Title level={4}>Education</Title>
//           {education.map((edu, idx) => (
//             <Card
//               key={idx}
//               size="small"
//               style={{
//                 marginBottom: 8,
//                 borderRadius: 8,
//                 background: "#fafafa",
//               }}
//             >
//               <Text strong>{edu.name}</Text>
//               <br />
//               <Text type="secondary">
//                 {edu.fromYear} - {edu.toYear} | {edu.educationType}
//               </Text>
//             </Card>
//           ))}
//         </>
//       )}

//       {/* Hidden Resume Template for Download */}
//       <div style={{ display: "none" }}>
//         <ResumeTemplate ref={resumeRef} candidate={candidate} />
//       </div>
//     </Card>
//   );
// };

// export default BenchCandidateDetails;

import React, { useEffect, useState } from "react";
import { useRef } from "react";
import html2pdf from "html2pdf.js";

import {
  Card,
  Typography,
  Divider,
  Tag,
  Row,
  Col,
  Space,
  Avatar,
  Tooltip,
  Collapse,
  Empty,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  LinkedinOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import ResumeTemplate from "./ResumeTemplate";
import { getCandidateDetails } from "../../api/api";

const { Title, Text } = Typography;

/* =======================
   INFO ITEM (FROM CandidateDetails UI)
======================= */
const InfoItem = ({ label, value }) => (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}
  >
    <div
      style={{
        height: 20,
        fontSize: 14,
        fontWeight: 590,
        color: "#2E2E2E",
        lineHeight: "18px",
      }}
    >
      {label}
    </div>

    <div
      style={{
        minHeight: 18,
        fontSize: 14,
        fontWeight: 400,
        color: "#2E2E2E",
        lineHeight: "18px",
        wordBreak: "break-word",
      }}
    >
      {typeof value === "string" &&
      (value.startsWith("http://") || value.startsWith("https://")) ? (
        <a href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      ) : (
        value || "-"
      )}
    </div>
  </div>
);

const BenchCandidateDetails = () => {
  const resumeRef = useRef(null);
  const [candidate, setCandidate] = useState();
  const { id } = useParams();
  console.log("candidate id in bench candidate details", id);
  // useEffect(() => {
  //   const resp = getCandidateDetails(id);
  //   if (resp.status === "success") {
  //     // setCandidate(resp.candidate);
  //     setCandidate(resp.candidate.profile);
  //   } else {
  //     setCandidate([]);
  //   }
  // }, []);
  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const resp = await getCandidateDetails(id);

        console.log("REAL RESPONSE:", resp);

        if (resp?.status === "success") {
          setCandidate(resp.candidate); // 🔥 store full candidate
        } else {
          setCandidate(null);
        }
      } catch (error) {
        console.error("Error fetching candidate:", error);
        setCandidate(null);
      }
    };

    fetchCandidate();
  }, [id]);

  if (!candidate) {
    return <Empty description="Candidate Details not Found" />;
  }

  const {
    name,
    title,
    email,
    phoneNumber,
    currentLocation,
    preferredLocation,
    preferredJobType,
    portfolioLink,
    linkedInUrl,
    trailheadUrl,
    joiningPeriod,
    totalExperience,
    relevantSalesforceExperience,
    summary,
    skillsJson,
    primaryClouds,
    secondaryClouds,
    certifications,
    workExperience,
    education,
    rateCardPerHour,
  } = candidate;

  const primarySkills = skillsJson?.filter((s) => s.level === "primary") || [];
  const secondarySkills =
    skillsJson?.filter((s) => s.level === "secondary") || [];

  return (
    <Card
      bordered={false}
      style={{
        maxWidth: 1000,
        margin: "30px auto",
        borderRadius: 20,
        background: "#ffffff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      {/* ================= HEADER ================= */}
      <div
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid #EDEDED",
        }}
      >
        {/* <Row align="middle" justify="space-between">
          <Space size={15} align="center">
            
            <Avatar
              size={70}
              src={
                candidate?.profilePicture
                  ? `${candidate.profilePicture}?t=${Date.now()}`
                  : undefined
              }
              icon={!candidate?.profilePicture ? <UserOutlined /> : null}
              style={{
                backgroundColor: candidate?.profilePicture
                  ? undefined
                  : "#1677ff",
                color: "#fff",
                fontSize: 24,
              }}
              onError={(e) => {
                e.currentTarget.src = "";
              }}
            />

            <Space direction="vertical" size={0}>
              <Text style={{ fontWeight: 600, fontSize: 20 }}>{name}</Text>
              <Text type="secondary" style={{ fontSize: 20 }}>
                {title}
              </Text>
              
            </Space>
          </Space>

          <button
            onClick={() => {
              if (!resumeRef.current) return;
              html2pdf().from(resumeRef.current).save(`${name}_Resume.pdf`);
            }}
            style={{
              padding: "8px 16px",
              background: "#1677ff",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Download Resume
          </button>
        </Row> */}
        <Row align="middle" justify="space-between">
          {/* LEFT SIDE */}
          <Space size={15} align="center">
            {/* <Avatar
              size={70}
              
              src={
                candidate?.profile?.profilePicture
                  ? `${candidate.profile.profilePicture}?t=${Date.now()}`
                  : undefined
              }
              icon={
                !candidate?.profile?.profilePicture ? <UserOutlined /> : null
              }
              
              style={{
                
                backgroundColor: candidate?.profile?.profilePicture
                  ? undefined
                  : "#1677ff",
                color: "#fff",
                fontSize: 24,
              }}
              onError={(e) => {
                e.currentTarget.src = "";
              }}
            /> */}
            <Avatar
              size={70}
              src={
                candidate?.profilePicture
                  ? `${candidate.profilePicture}?t=${Date.now()}`
                  : undefined
              }
              icon={!candidate?.profilePicture ? <UserOutlined /> : null}
              style={{
                backgroundColor: candidate?.profilePicture
                  ? undefined
                  : "#1677ff",
                color: "#fff",
                fontSize: 24,
              }}
              onError={(e) => {
                e.currentTarget.src = "";
              }}
            />

            <Space direction="vertical" size={0}>
              <Text style={{ fontWeight: 600, fontSize: 20 }}>{name}</Text>
              <Text type="secondary" style={{ fontSize: 16 }}>
                {title}
              </Text>
            </Space>
          </Space>

          {/* RIGHT SIDE */}
          <Space size={12} align="center">
            {/* ✅ Verification Tag */}
            {candidate?.vendorId && (
              <Tag
                color={candidate?.isVerified ? "green" : "red"}
                style={{ fontWeight: 500 }}
              >
                {candidate?.isVerified ? "Verified" : "Not Verified"}
              </Tag>
            )}

            {/* ✅ Candidate Type */}
            <Tag color={candidate?.vendorId ? "blue" : "green"}>
              {candidate?.vendorId
                ? "Vendor Candidate"
                : "Individual Candidate"}
            </Tag>

            {/* ✅ Download Button */}
            <button
              onClick={() => {
                if (!resumeRef.current) return;
                html2pdf().from(resumeRef.current).save(`${name}_Resume.pdf`);
              }}
              style={{
                padding: "8px 16px",
                background: "#1677ff",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Download Resume
            </button>
          </Space>
        </Row>
      </div>

      {/* ================= PERSONAL INFORMATION ================= */}

      <Collapse
        bordered={false}
        defaultActiveKey={["personal"]}
        items={[
          {
            key: "personal",
            label: (
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1f1f1f",
                  padding: "4px 0",
                }}
              >
                Personal Information
              </div>
            ),

            children: (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                {/* ROW 1 */}
                <div style={{ display: "flex", gap: 28 }}>
                  {/* <InfoItem label="Email" value={email} /> */}
                  {/* <InfoItem
                    label={candidate.vendor?.email ? "POC Email" : "Email"}
                    value={
                      candidate.vendor?.email ? candidate.vendor.email : email
                    }
                  /> */}
                  <InfoItem
                    label={candidate.vendor?.email ? "POC Email" : "Email"}
                    value={
                      candidate.vendor?.email || email ? (
                        <a
                          href={`mailto:${candidate.vendor?.email || email}`}
                          style={{ color: "#1677ff" }}
                        >
                          {candidate.vendor?.email || email}
                        </a>
                      ) : (
                        "-"
                      )
                    }
                  />

                  {/* <InfoItem label="Phone" value={phoneNumber} /> */}
                  {/* <InfoItem
                    label="Phone Number"
                    value={phoneNumber ? `+91 ${phoneNumber}` : "-"}
                  />
                  <InfoItem label="Title" value={title} /> */}
                  <InfoItem
                    label={
                      candidate.vendor?.phoneNumber
                        ? "POC Phone Number"
                        : "Phone Number"
                    }
                    value={
                      candidate.vendor?.phoneNumber || phoneNumber
                        ? `+91 ${candidate.vendor?.phoneNumber || phoneNumber}`
                        : "-"
                    }
                  />

                  {/* TITLE */}
                  <InfoItem label="Title" value={title} />
                </div>

                {/* ROW 2 — EXPERIENCE (FIXED) */}
                <div style={{ display: "flex", gap: 28 }}>
                  <InfoItem label="Current Location" value={currentLocation} />

                  <InfoItem
                    label="Total Experience"
                    value={totalExperience ? `${totalExperience} yrs` : "-"}
                  />

                  <InfoItem
                    label="Relevant Salesforce Experience"
                    value={
                      relevantSalesforceExperience
                        ? `${relevantSalesforceExperience} yrs`
                        : "-"
                    }
                  />
                </div>

                {/* ROW 3 */}
                <div style={{ display: "flex", gap: 28 }}>
                  <InfoItem
                    label="Preferred Job Location"
                    value={preferredLocation?.join(", ")}
                  />

                  <InfoItem
                    label="Rate Card"
                    value={
                      rateCardPerHour?.value
                        ? `${rateCardPerHour.value} ${rateCardPerHour.currency}/Month`
                        : "-"
                    }
                  />

                  {/* <InfoItem label="LinkedIn" value={linkedInUrl} /> */}
                  <InfoItem label="Joining Period" value={joiningPeriod} />
                </div>

                {/* ROW 4 */}
                <div style={{ display: "flex", gap: 28 }}>
                  <InfoItem label="Portfolio" value={portfolioLink} />
                  <InfoItem label="Trailhead" value={trailheadUrl} />
                  {/* <InfoItem label="Joining Period" value={joiningPeriod} /> */}
                  <InfoItem label="LinkedIn" value={linkedInUrl} />
                </div>
              </div>
            ),
          },
        ]}
      />

      <Divider />

      {/* ================= SUMMARY ================= */}
      <Collapse
        bordered={false}
        items={[
          {
            key: "summary",
            label: (
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1f1f1f",
                  padding: "4px 0",
                }}
              >
                Summary
              </div>
            ),
            children: (
              <div style={{ minHeight: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#555",
                    lineHeight: "20px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {summary?.trim() ? summary : "No summary added"}
                </Text>
              </div>
            ),
          },
        ]}
      />

      <Divider />

      {/* ===== SKILLS ===== */}
      <Collapse
        bordered={false}
        items={[
          {
            key: "skills",
            label: (
              <div style={{ fontSize: 16, fontWeight: 600, color: "#1f1f1f" }}>
                Skills
              </div>
            ),
            children: (
              <>
                <Text strong>Primary Skills</Text>
                <div style={{ marginTop: 8 }}>
                  {primarySkills.map((s, i) => (
                    <Tag
                      key={i}
                      style={{
                        background: "#FBEBFF",
                        border: "1px solid #800080",
                        borderRadius: 100,
                        marginBottom: 10,
                        marginRight: 8,
                      }}
                    >
                      {s.name}
                    </Tag>
                  ))}
                </div>

                {secondarySkills.length > 0 && (
                  <>
                    <Divider />
                    <Text strong>Secondary Skills</Text>
                    <div style={{ marginTop: 8 }}>
                      {secondarySkills.map((s, i) => (
                        <Tag
                          key={i}
                          style={{
                            background: "#FBEBFF",
                            border: "1px solid #800080",
                            borderRadius: 100,
                            marginBottom: 10,
                            marginRight: 8,
                          }}
                        >
                          {s.name}
                        </Tag>
                      ))}
                    </div>
                  </>
                )}
              </>
            ),
          },
        ]}
      />

      <Divider />

      {/* ===== CLOUDS ===== */}
      {/* <Collapse
        bordered={false}
        items={[
          {
            key: "clouds",
            label: (
              <div style={{ fontSize: 16, fontWeight: 600, color: "#1f1f1f" }}>
                Clouds
              </div>
            ),
            children: (
              <>
                {primaryClouds?.map((c, i) => (
                  <Tag
                    key={i}
                    style={{
                      background: "#E7F0FE",
                      border: "1px solid #1677FF",
                      borderRadius: 100,
                      marginBottom: 10,
                      marginRight: 8,
                    }}
                  >
                    {c.name}
                  </Tag>
                ))}

                {secondaryClouds?.map((c, i) => (
                  <Tag
                    key={i}
                    style={{
                      background: "#E7F0FE",
                      border: "1px solid #1677FF",
                      borderRadius: 100,
                      marginBottom: 10,
                      marginRight: 8,
                    }}
                  >
                    {c.name}
                  </Tag>
                ))}
              </>
            ),
          },
        ]}
      /> */}

      <Collapse
        bordered={false}
        items={[
          {
            key: "clouds",
            label: (
              <div style={{ fontSize: 16, fontWeight: 600, color: "#1f1f1f" }}>
                Clouds
              </div>
            ),
            children: (
              <>
                <Text strong>Primary Clouds</Text>
                <div style={{ marginTop: 8 }}>
                  {primaryClouds?.length > 0 ? (
                    primaryClouds.map((c, i) => (
                      <Tag
                        key={i}
                        style={{
                          background: "#E7F0FE",
                          border: "1px solid #1677FF",
                          borderRadius: 100,
                          marginBottom: 10,
                          marginRight: 8,
                        }}
                      >
                        {c.name}
                      </Tag>
                    ))
                  ) : (
                    <Text type="secondary">-</Text>
                  )}
                </div>

                {secondaryClouds?.length > 0 && (
                  <>
                    <Divider />
                    <Text strong>Secondary Clouds</Text>
                    <div style={{ marginTop: 8 }}>
                      {secondaryClouds.map((c, i) => (
                        <Tag
                          key={i}
                          style={{
                            background: "#E7F0FE",
                            border: "1px solid #1677FF",
                            borderRadius: 100,
                            marginBottom: 10,
                            marginRight: 8,
                          }}
                        >
                          {c.name}
                        </Tag>
                      ))}
                    </div>
                  </>
                )}
              </>
            ),
          },
        ]}
      />

      <Divider />

      {/* ================= CERTIFICATIONS ================= */}
      <Collapse
        bordered={false}
        items={[
          {
            key: "certifications",
            // label: <Title level={4}>Certificates</Title>,
            label: (
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1f1f1f",
                  padding: "4px 0",
                }}
              >
                Certificates
              </div>
            ),

            children: (
              <Space wrap>
                {certifications?.map((cert, i) => (
                  <Tag key={i} color="success">
                    {cert}
                  </Tag>
                ))}
              </Space>
            ),
          },
        ]}
      />

      <Divider />

      {/* ================= EDUCATION ================= */}
      <Collapse
        bordered={false}
        items={[
          {
            key: "education",
            // label: <Title level={4}>Education</Title>,
            label: (
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1f1f1f",
                  padding: "4px 0",
                }}
              >
                Education
              </div>
            ),

            children: education.map((edu, idx) => (
              <Card key={idx} size="small" style={{ marginBottom: 8 }}>
                <Text strong>{edu.name}</Text>
                <br />
                <Text type="secondary">
                  {edu.fromYear} – {edu.toYear} | {edu.educationType}
                </Text>
              </Card>
            )),
          },
        ]}
      />

      <Divider />

      {/* ================= WORK EXPERIENCE ================= */}
      <Collapse
        bordered={false}
        items={[
          {
            key: "work",
            // label: <Title level={4}>Work Experience</Title>,
            label: (
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1f1f1f",
                  padding: "4px 0",
                }}
              >
                Work Experience
              </div>
            ),

            children: workExperience.map((exp, idx) => (
              <Card
                key={idx}
                type="inner"
                style={{ marginBottom: 12 }}
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      {exp.role} @ {exp.payrollCompanyName}
                    </span>
                    <span style={{ color: "#777" }}>
                      {dayjs(exp.startDate).format("MM/YYYY")} –{" "}
                      {exp.endDate?.toLowerCase?.() === "present"
                        ? "Present"
                        : dayjs(exp.endDate).format("MM/YYYY")}
                    </span>
                  </div>
                }
              >
                {/* {exp.projects?.map((proj, i) => (
                  <Card key={i} size="small" style={{ marginTop: 8 }}>
                    <Text strong>{proj.projectName}</Text>
                    <p>{proj.projectDescription}</p>
                  </Card>
                ))} */}
                {exp.projects?.map((proj, i) => (
                  <Card
                    key={i}
                    size="small"
                    style={{
                      marginTop: 8,
                      borderRadius: 8,
                    }}
                  >
                    {/* Project Name */}
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        Project Name:&nbsp;
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>
                        {proj.projectName || "-"}
                      </span>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>
                        Description:&nbsp;
                      </span>
                      <span style={{ fontSize: 13, color: "#555" }}>
                        {proj.projectDescription || "-"}
                      </span>
                    </div>

                    {/* Roles & Responsibilities */}
                    <div>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>
                        Roles & Responsibilities:&nbsp;
                      </span>
                      <span style={{ fontSize: 13, color: "#555" }}>
                        {proj.rolesAndResponsibilities || "-"}
                      </span>
                    </div>
                  </Card>
                ))}
              </Card>
            )),
          },
        ]}
      />

      <Divider />

      {/* ================= PDF TEMPLATE ================= */}
      <div style={{ display: "none" }}>
        <ResumeTemplate ref={resumeRef} candidate={candidate} />
      </div>
    </Card>
  );
};

export default BenchCandidateDetails;
