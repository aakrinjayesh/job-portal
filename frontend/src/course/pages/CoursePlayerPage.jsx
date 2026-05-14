// import { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Layout,
//   Typography,
//   Space,
//   Tag,
//   Spin,
//   Progress,
//   Tabs,
//   Button,
//   message,
//   Collapse,
//   Tooltip,
// } from "antd";
// import {
//   CheckCircleOutlined,
//   PlayCircleOutlined,
//   FileTextOutlined,
//   TrophyOutlined,
//   ArrowLeftOutlined,
//   CheckOutlined,
// } from "@ant-design/icons";
// import {
//   GetCourseById,
//   GetEnrollmentStatus,
//   GetCourseProgress,
//   UpdateLectureProgress,
//   GetMyCertificate,
// } from "../api/courseApi.js";
// import AssessmentPlayer from "../components/AssessmentPlayer.jsx";
// import CertificateCard from "../components/CertificateCard.jsx";

// const { Sider, Content } = Layout;
// const { Title, Text } = Typography;
// const { Panel } = Collapse;

// const CoursePlayerPage = () => {
//   const { courseId } = useParams();
//   const navigate = useNavigate();

//   const [course, setCourse] = useState(null);
//   const [enrollment, setEnrollment] = useState(null);
//   const [progress, setProgress] = useState({
//     progress: [],
//     totalLectures: 0,
//     progressPercent: 0,
//   });
//   const [activeLecture, setActiveLecture] = useState(null);
//   const [activeTab, setActiveTab] = useState("lecture");
//   const [certificate, setCertificate] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const videoRef = useRef(null);
//   const progressTimer = useRef(null);

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       try {
//         const [courseRes, enrollRes, progressRes] = await Promise.all([
//           GetCourseById(courseId),
//           GetEnrollmentStatus(courseId),
//           GetCourseProgress(courseId),
//         ]);

//         if (!enrollRes.isEnrolled) {
//           message.warning("You are not enrolled in this course");
//           navigate(`/candidate/courses/${courseRes.data?.slug || courseId}`);
//           return;
//         }

//         setCourse(courseRes.data);
//         setEnrollment(enrollRes.data);
//         setProgress(progressRes.data);

//         // Set first incomplete lecture as active
//         const allLectures = (courseRes.data?.sections || []).flatMap(
//           (s) => s.lectures || [],
//         );
//         const completedIds = (progressRes.data?.progress || [])
//           .filter((p) => p.isCompleted)
//           .map((p) => p.lectureId);

//         const firstIncomplete = allLectures.find(
//           (l) => !completedIds.includes(l.id),
//         );
//         setActiveLecture(firstIncomplete || allLectures[0] || null);

//         // Try loading certificate
//         try {
//           const certRes = await GetMyCertificate(courseId);
//           setCertificate(certRes.data);
//         } catch {
//           // No cert yet
//         }
//       } catch {
//         message.error("Failed to load course");
//         navigate(-1);
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [courseId]);

//   const isLectureCompleted = (lectureId) => {
//     return progress.progress?.some(
//       (p) => p.lectureId === lectureId && p.isCompleted,
//     );
//   };

//   const handleLectureSelect = (lecture) => {
//     setActiveLecture(lecture);
//     setActiveTab("lecture");
//   };

//   const handleMarkComplete = async () => {
//     if (!activeLecture) return;
//     try {
//       await UpdateLectureProgress({
//         courseId,
//         lectureId: activeLecture.id,
//         isCompleted: true,
//         watchedSeconds: videoRef.current?.currentTime || 0,
//       });

//       setProgress((prev) => {
//         const alreadyIn = prev.progress?.some(
//           (p) => p.lectureId === activeLecture.id,
//         );
//         const updated = alreadyIn
//           ? prev.progress.map((p) =>
//               p.lectureId === activeLecture.id
//                 ? { ...p, isCompleted: true }
//                 : p,
//             )
//           : [
//               ...(prev.progress || []),
//               { lectureId: activeLecture.id, isCompleted: true },
//             ];

//         const completed = updated.filter((p) => p.isCompleted).length;
//         return {
//           ...prev,
//           progress: updated,
//           completed,
//           progressPercent:
//             prev.totalLectures > 0
//               ? Math.round((completed / prev.totalLectures) * 100)
//               : 0,
//         };
//       });

//       message.success("Marked as complete!");

//       // Auto advance to next lecture
//       const allLectures = (course?.sections || []).flatMap(
//         (s) => s.lectures || [],
//       );
//       const currentIndex = allLectures.findIndex(
//         (l) => l.id === activeLecture.id,
//       );
//       if (currentIndex < allLectures.length - 1) {
//         setActiveLecture(allLectures[currentIndex + 1]);
//       }
//     } catch {
//       message.error("Failed to update progress");
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ textAlign: "center", padding: 80 }}>
//         <Spin size="large" />
//       </div>
//     );
//   }

//   if (!course) return null;

//   return (
//     <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
//       {/* Sidebar — curriculum */}
//       <Sider
//         width={300}
//         style={{
//           background: "white",
//           borderRight: "1px solid #e8e8e8",
//           overflow: "auto",
//           height: "100vh",
//           position: "fixed",
//           left: 0,
//           top: 0,
//         }}
//       >
//         {/* Header */}
//         <div style={{ padding: "16px", borderBottom: "1px solid #e8e8e8" }}>
//           <Button
//             icon={<ArrowLeftOutlined />}
//             type="text"
//             size="small"
//             onClick={() => navigate("/candidate/courses")}
//             style={{ padding: 0, marginBottom: 8 }}
//           >
//             Back
//           </Button>
//           <Title level={5} ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
//             {course.title}
//           </Title>
//           <div style={{ marginTop: 8 }}>
//             <Progress
//               percent={progress.progressPercent}
//               size="small"
//               strokeColor={
//                 progress.progressPercent === 100 ? "#52c41a" : "#1677ff"
//               }
//             />
//             <Text type="secondary" style={{ fontSize: 11 }}>
//               {progress.completed || 0}/{progress.totalLectures} completed
//             </Text>
//           </div>
//         </div>

//         {/* Sections */}
//         <Collapse
//           ghost
//           defaultActiveKey={course.sections?.map((s) => s.id)}
//           style={{ padding: "8px 0" }}
//         >
//           {(course.sections || []).map((section) => (
//             <Panel
//               key={section.id}
//               header={
//                 <Text strong style={{ fontSize: 13 }}>
//                   {section.title}
//                 </Text>
//               }
//             >
//               {(section.lectures || []).map((lec) => {
//                 const completed = isLectureCompleted(lec.id);
//                 const isActive = activeLecture?.id === lec.id;
//                 return (
//                   <div
//                     key={lec.id}
//                     onClick={() => handleLectureSelect(lec)}
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 8,
//                       padding: "8px 16px",
//                       cursor: "pointer",
//                       background: isActive
//                         ? "#e6f4ff"
//                         : completed
//                           ? "#f6ffed"
//                           : "transparent",
//                       borderLeft: isActive
//                         ? "3px solid #1677ff"
//                         : "3px solid transparent",
//                       transition: "all 0.2s",
//                     }}
//                   >
//                     {completed ? (
//                       <CheckCircleOutlined
//                         style={{ color: "#52c41a", fontSize: 14 }}
//                       />
//                     ) : lec.type === "VIDEO" ? (
//                       <PlayCircleOutlined
//                         style={{
//                           color: isActive ? "#1677ff" : "#bbb",
//                           fontSize: 14,
//                         }}
//                       />
//                     ) : (
//                       <FileTextOutlined
//                         style={{
//                           color: isActive ? "#1677ff" : "#bbb",
//                           fontSize: 14,
//                         }}
//                       />
//                     )}
//                     <Text
//                       style={{
//                         fontSize: 13,
//                         flex: 1,
//                         color: isActive ? "#1677ff" : "inherit",
//                         fontWeight: isActive ? 600 : 400,
//                       }}
//                       ellipsis
//                     >
//                       {lec.title}
//                     </Text>
//                   </div>
//                 );
//               })}
//             </Panel>
//           ))}
//         </Collapse>

//         {/* Assessment tab in sidebar */}
//         {course.assessment && (
//           <div
//             onClick={() => setActiveTab("assessment")}
//             style={{
//               padding: "12px 16px",
//               cursor: "pointer",
//               borderTop: "1px solid #e8e8e8",
//               background:
//                 activeTab === "assessment" ? "#e6f4ff" : "transparent",
//               display: "flex",
//               alignItems: "center",
//               gap: 8,
//             }}
//           >
//             <CheckCircleOutlined style={{ color: "#faad14" }} />
//             <Text strong>Final Assessment</Text>
//           </div>
//         )}
//         {certificate && (
//           <div
//             onClick={() => setActiveTab("certificate")}
//             style={{
//               padding: "12px 16px",
//               cursor: "pointer",
//               background:
//                 activeTab === "certificate" ? "#fffbe6" : "transparent",
//               display: "flex",
//               alignItems: "center",
//               gap: 8,
//             }}
//           >
//             <TrophyOutlined style={{ color: "#faad14" }} />
//             <Text strong>My Certificate</Text>
//           </div>
//         )}
//       </Sider>

//       {/* Main content */}
//       <Content style={{ marginLeft: 300, padding: "24px", minHeight: "100vh" }}>
//         {activeTab === "lecture" && activeLecture && (
//           <div>
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 marginBottom: 16,
//               }}
//             >
//               <Title level={4} style={{ margin: 0 }}>
//                 {activeLecture.title}
//               </Title>
//               <Button
//                 type="primary"
//                 icon={<CheckOutlined />}
//                 onClick={handleMarkComplete}
//                 disabled={isLectureCompleted(activeLecture.id)}
//                 style={
//                   isLectureCompleted(activeLecture.id)
//                     ? { background: "#52c41a", borderColor: "#52c41a" }
//                     : {}
//                 }
//               >
//                 {isLectureCompleted(activeLecture.id)
//                   ? "Completed"
//                   : "Mark Complete"}
//               </Button>
//             </div>

//             {/* Video player */}
//             {activeLecture.type === "VIDEO" && activeLecture.contentUrl && (
//               <div
//                 style={{
//                   borderRadius: 12,
//                   overflow: "hidden",
//                   background: "#000",
//                   marginBottom: 16,
//                 }}
//               >
//                 <video
//                   ref={videoRef}
//                   src={activeLecture.contentUrl}
//                   controls
//                   style={{ width: "100%", maxHeight: 480 }}
//                   onEnded={handleMarkComplete}
//                 />
//               </div>
//             )}

//             {/* Text lecture */}
//             {/* {activeLecture.type === "TEXT" && activeLecture.contentUrl && (
//               <div style={{ marginBottom: 16 }}>
//                 <Button
//                   type="primary"
//                   href={activeLecture.contentUrl}
//                   target="_blank"
//                   icon={<FileTextOutlined />}
//                 >
//                   Open Reading Material
//                 </Button>
//               </div>
//             )} */}
//             {/* Text lecture */}
//             {activeLecture.type === "TEXT" && activeLecture.contentUrl && (
//               <div style={{ marginBottom: 16 }}>
//                 <Button
//                   type="primary"
//                   icon={<FileTextOutlined />}
//                   style={{ marginBottom: 16 }}
//                 >
//                   Reading Material
//                 </Button>

//                 <div
//                   style={{
//                     width: "100%",
//                     height: "75vh",
//                     border: "1px solid #d9d9d9",
//                     borderRadius: 12,
//                     overflow: "hidden",
//                     background: "#fff",
//                   }}
//                 >
//                   <iframe
//                     src={activeLecture.contentUrl}
//                     title="Reading Material"
//                     width="100%"
//                     height="100%"
//                     style={{ border: "none" }}
//                   />
//                 </div>
//               </div>
//             )}

//             {!activeLecture.contentUrl && (
//               <div
//                 style={{
//                   height: 300,
//                   background: "#f0f0f0",
//                   borderRadius: 12,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   marginBottom: 16,
//                 }}
//               >
//                 <Text type="secondary">
//                   No content uploaded for this lecture yet.
//                 </Text>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === "assessment" && (
//           <div style={{ maxWidth: 720 }}>
//             <Title level={4} style={{ marginBottom: 24 }}>
//               <CheckCircleOutlined
//                 style={{ marginRight: 8, color: "#faad14" }}
//               />
//               Final Assessment
//             </Title>
//             <AssessmentPlayer
//               courseId={courseId}
//               onCertificateIssued={(cert) => {
//                 setCertificate(cert);
//                 setActiveTab("certificate");
//               }}
//             />
//           </div>
//         )}

//         {activeTab === "certificate" && (
//           <div style={{ maxWidth: 600 }}>
//             <Title level={4} style={{ marginBottom: 24 }}>
//               <TrophyOutlined style={{ marginRight: 8, color: "#faad14" }} />
//               Your Certificate
//             </Title>
//             <CertificateCard certificate={certificate} />
//           </div>
//         )}
//       </Content>
//     </Layout>
//   );
// };

// export default CoursePlayerPage;

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Progress, message } from "antd";
import {
  CheckCircleOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  TrophyOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import {
  GetCourseById,
  GetEnrollmentStatus,
  GetCourseProgress,
  UpdateLectureProgress,
  GetMyCertificate,
} from "../api/courseApi.js";
import AssessmentPlayer from "../components/AssessmentPlayer.jsx";
import CertificateCard from "../components/CertificateCard.jsx";

const CoursePlayerPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [progress, setProgress] = useState({
    progress: [],
    totalLectures: 0,
    progressPercent: 0,
  });
  const [activeLecture, setActiveLecture] = useState(null);
  const [activeTab, setActiveTab] = useState("lecture");
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  // const videoRef = useRef(null);
  const basePath = window.location.pathname.startsWith("/company")
    ? "/company"
    : "/candidate";
  const videoRef = useRef(null);
  const progressTimer = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [courseRes, enrollRes, progressRes] = await Promise.all([
          GetCourseById(courseId),
          GetEnrollmentStatus(courseId),
          GetCourseProgress(courseId),
        ]);

        if (!enrollRes.isEnrolled) {
          message.warning("You are not enrolled in this course");
          // navigate(`/candidate/courses/${courseRes.data?.slug || courseId}`);
          navigate(`${basePath}/courses/${courseRes.data?.slug || courseId}`);
          return;
        }

        setCourse(courseRes.data);
        setEnrollment(enrollRes.data);
        setProgress(progressRes.data);

        // Expand all sections by default
        const expanded = {};
        (courseRes.data?.sections || []).forEach((s) => {
          expanded[s.id] = true;
        });
        setExpandedSections(expanded);

        const allLectures = (courseRes.data?.sections || []).flatMap(
          (s) => s.lectures || [],
        );
        const completedIds = (progressRes.data?.progress || [])
          .filter((p) => p.isCompleted)
          .map((p) => p.lectureId);

        const firstIncomplete = allLectures.find(
          (l) => !completedIds.includes(l.id),
        );
        setActiveLecture(firstIncomplete || allLectures[0] || null);

        try {
          const certRes = await GetMyCertificate(courseId);
          setCertificate(certRes.data);
        } catch {
          // No cert yet
        }
      } catch {
        message.error("Failed to load course");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const isLectureCompleted = (lectureId) =>
    progress.progress?.some((p) => p.lectureId === lectureId && p.isCompleted);

  const handleLectureSelect = (lecture) => {
    setActiveLecture(lecture);
    setActiveTab("lecture");
  };

  const handleMarkComplete = async () => {
    if (!activeLecture) return;
    try {
      await UpdateLectureProgress({
        courseId,
        lectureId: activeLecture.id,
        isCompleted: true,
        watchedSeconds: videoRef.current?.currentTime || 0,
      });

      setProgress((prev) => {
        const alreadyIn = prev.progress?.some(
          (p) => p.lectureId === activeLecture.id,
        );
        const updated = alreadyIn
          ? prev.progress.map((p) =>
              p.lectureId === activeLecture.id
                ? { ...p, isCompleted: true }
                : p,
            )
          : [
              ...(prev.progress || []),
              { lectureId: activeLecture.id, isCompleted: true },
            ];

        const completed = updated.filter((p) => p.isCompleted).length;
        return {
          ...prev,
          progress: updated,
          completed,
          progressPercent:
            prev.totalLectures > 0
              ? Math.round((completed / prev.totalLectures) * 100)
              : 0,
        };
      });

      message.success("Marked as complete!");

      const allLectures = (course?.sections || []).flatMap(
        (s) => s.lectures || [],
      );
      const currentIndex = allLectures.findIndex(
        (l) => l.id === activeLecture.id,
      );
      if (currentIndex < allLectures.length - 1) {
        setActiveLecture(allLectures[currentIndex + 1]);
      }
    } catch {
      message.error("Failed to update progress");
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f0f13",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Spin size="large" />
        <span
          style={{
            color: "#6b7280",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
          }}
        >
          Loading course...
        </span>
      </div>
    );
  }

  if (!course) return null;

  const pct = progress.progressPercent || 0;
  const progressColor =
    pct === 100 ? "#10b981" : pct > 50 ? "#6366f1" : "#f59e0b";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .cpp-root {
          display: flex;
          min-height: 100vh;
          background: #0f0f13;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── SIDEBAR ── */
        .cpp-sidebar {
          width: 300px;
          flex-shrink: 0;
          background: #16161e;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow: hidden;
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .cpp-sidebar.collapsed { width: 0; border: none; }

        .cpp-sb-header {
          padding: 18px 16px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .cpp-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.3px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          margin-bottom: 12px;
          transition: color 0.2s;
        }
        .cpp-back-btn:hover { color: #a78bfa; }

        .cpp-course-title {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #f9fafb;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0 0 12px;
        }

        .cpp-progress-wrap { margin-top: 6px; }
        .cpp-progress-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .cpp-progress-label { font-size: 11px; color: #6b7280; font-weight: 500; }
        .cpp-progress-pct { font-size: 11px; font-weight: 700; color: ${progressColor}; }
        .cpp-progress-track {
          height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 999px;
          overflow: hidden;
        }
        .cpp-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: ${progressColor};
          width: ${pct}%;
          transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
        }
        .cpp-progress-count { font-size: 10px; color: #4b5563; margin-top: 4px; }

        .cpp-sb-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }
        .cpp-sb-scroll::-webkit-scrollbar { width: 4px; }
        .cpp-sb-scroll::-webkit-scrollbar-track { background: transparent; }
        .cpp-sb-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        .cpp-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px 8px;
          cursor: pointer;
          user-select: none;
        }
        .cpp-section-title {
          font-size: 11px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .cpp-section-chevron {
          font-size: 10px;
          color: #4b5563;
          transition: transform 0.2s;
        }
        .cpp-section-chevron.open { transform: rotate(180deg); }

        .cpp-lec-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 16px;
          cursor: pointer;
          border-left: 3px solid transparent;
          transition: all 0.15s ease;
          position: relative;
        }
        .cpp-lec-item:hover { background: rgba(255,255,255,0.04); }
        .cpp-lec-item.active {
          background: rgba(99,102,241,0.12);
          border-left-color: #6366f1;
        }
        .cpp-lec-item.done { border-left-color: rgba(16,185,129,0.4); }

        .cpp-lec-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
        }
        .cpp-lec-icon.done { background: rgba(16,185,129,0.15); color: #10b981; }
        .cpp-lec-icon.active { background: rgba(99,102,241,0.2); color: #818cf8; }
        .cpp-lec-icon.idle { background: rgba(255,255,255,0.06); color: #4b5563; }

        .cpp-lec-title {
          font-size: 12.5px;
          line-height: 1.4;
          flex: 1;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          color: #9ca3af;
          transition: color 0.15s;
        }
        .cpp-lec-item.active .cpp-lec-title { color: #e0e7ff; font-weight: 600; }
        .cpp-lec-item.done .cpp-lec-title { color: #6b7280; }

        .cpp-sb-footer {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 6px 0;
          flex-shrink: 0;
        }
        .cpp-footer-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          cursor: pointer;
          transition: background 0.15s;
          border-left: 3px solid transparent;
        }
        .cpp-footer-item:hover { background: rgba(255,255,255,0.04); }
        .cpp-footer-item.active {
          background: rgba(250,173,20,0.1);
          border-left-color: #faad14;
        }
        .cpp-footer-item.cert-active {
          background: rgba(251,191,36,0.08);
          border-left-color: #fbbf24;
        }
        .cpp-footer-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }
        .cpp-footer-icon.assess { background: rgba(250,173,20,0.15); color: #faad14; }
        .cpp-footer-icon.cert { background: rgba(251,191,36,0.12); color: #fbbf24; }
        .cpp-footer-text { font-size: 13px; font-weight: 600; color: #d1d5db; }

        /* ── MAIN ── */
        .cpp-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          overflow: hidden;
        }

        .cpp-topbar {
          height: 56px;
          background: #16161e;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 14px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .cpp-toggle-btn {
          width: 34px;
          height: 34px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #9ca3af;
          font-size: 15px;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .cpp-toggle-btn:hover { background: rgba(255,255,255,0.1); color: #e5e7eb; }

        .cpp-topbar-title {
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #f9fafb;
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .cpp-mark-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 16px;
          height: 34px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .cpp-mark-btn.done {
          background: rgba(16,185,129,0.15);
          color: #10b981;
          cursor: default;
        }
        .cpp-mark-btn.todo {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          box-shadow: 0 4px 12px rgba(99,102,241,0.3);
        }
        .cpp-mark-btn.todo:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(99,102,241,0.4);
        }

        .cpp-content {
          flex: 1;
          padding: 28px 32px;
          overflow-y: auto;
        }
        .cpp-content::-webkit-scrollbar { width: 6px; }
        .cpp-content::-webkit-scrollbar-track { background: transparent; }
        .cpp-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        /* Lecture header */
        .cpp-lec-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 16px;
        }
        .cpp-lec-heading {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #f9fafb;
          margin: 0;
          line-height: 1.3;
          letter-spacing: -0.5px;
        }
        .cpp-lec-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          margin-top: 6px;
        }
        .cpp-lec-type-badge.video {
          background: rgba(99,102,241,0.15);
          color: #818cf8;
          border: 1px solid rgba(99,102,241,0.2);
        }
        .cpp-lec-type-badge.text {
          background: rgba(16,185,129,0.1);
          color: #34d399;
          border: 1px solid rgba(16,185,129,0.15);
        }

        /* Video player */
        .cpp-video-wrap {
          border-radius: 14px;
          overflow: hidden;
          background: #000;
          margin-bottom: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          position: relative;
        }
        .cpp-video-wrap video {
          width: 100%;
          max-height: 500px;
          display: block;
        }

        /* No content placeholder */
        .cpp-no-content {
          height: 300px;
          background: rgba(255,255,255,0.03);
          border: 1px dashed rgba(255,255,255,0.1);
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
          color: #4b5563;
        }
        .cpp-no-content-icon { font-size: 32px; }
        .cpp-no-content-text { font-size: 14px; font-weight: 500; }

        /* Text content iframe */
        .cpp-iframe-wrap {
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }

        /* Nav row */
        .cpp-nav-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 16px;
        }
        .cpp-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 16px;
          height: 38px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #9ca3af;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .cpp-nav-btn:hover { background: rgba(255,255,255,0.09); color: #e5e7eb; }

        /* Section heading for assessment/cert */
        .cpp-section-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .cpp-section-heading-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .cpp-section-heading-icon.assess {
          background: rgba(250,173,20,0.15);
          color: #faad14;
        }
        .cpp-section-heading-icon.cert {
          background: rgba(251,191,36,0.12);
          color: #fbbf24;
        }
        .cpp-section-heading-title {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #f9fafb;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .cpp-section-heading-sub {
          font-size: 13px;
          color: #6b7280;
          margin: 2px 0 0;
        }
      `}</style>

      <div className="cpp-root">
        {/* ── SIDEBAR ── */}
        <div className={`cpp-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
          <div className="cpp-sb-header">
            <button
              className="cpp-back-btn"
              // onClick={() => navigate("/candidate/courses")}
              onClick={() => navigate(`${basePath}/courses`)}
            >
              <ArrowLeftOutlined style={{ fontSize: 11 }} />
              Back to Courses
            </button>
            <p className="cpp-course-title">{course.title}</p>
            <div className="cpp-progress-wrap">
              <div className="cpp-progress-row">
                <span className="cpp-progress-label">Progress</span>
                <span className="cpp-progress-pct">{pct}%</span>
              </div>
              <div className="cpp-progress-track">
                <div className="cpp-progress-fill" />
              </div>
              <div className="cpp-progress-count">
                {progress.completed || 0} / {progress.totalLectures} lectures
              </div>
            </div>
          </div>

          <div className="cpp-sb-scroll">
            {(course.sections || []).map((section) => (
              <div key={section.id}>
                <div
                  className="cpp-section-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <span className="cpp-section-title">{section.title}</span>
                  <span
                    className={`cpp-section-chevron ${expandedSections[section.id] ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </div>

                {expandedSections[section.id] &&
                  (section.lectures || []).map((lec) => {
                    const done = isLectureCompleted(lec.id);
                    const isActive = activeLecture?.id === lec.id;
                    return (
                      <div
                        key={lec.id}
                        className={`cpp-lec-item ${isActive ? "active" : ""} ${done ? "done" : ""}`}
                        onClick={() => handleLectureSelect(lec)}
                      >
                        <div
                          className={`cpp-lec-icon ${done ? "done" : isActive ? "active" : "idle"}`}
                        >
                          {done ? (
                            <CheckCircleOutlined />
                          ) : lec.type === "VIDEO" ? (
                            <PlayCircleOutlined />
                          ) : (
                            <FileTextOutlined />
                          )}
                        </div>
                        <span className="cpp-lec-title">{lec.title}</span>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>

          <div className="cpp-sb-footer">
            {course.assessment && (
              <div
                className={`cpp-footer-item ${activeTab === "assessment" ? "active" : ""}`}
                onClick={() => setActiveTab("assessment")}
              >
                <div className="cpp-footer-icon assess">
                  <CheckCircleOutlined />
                </div>
                <span className="cpp-footer-text">Final Assessment</span>
              </div>
            )}
            {certificate && (
              <div
                className={`cpp-footer-item ${activeTab === "certificate" ? "cert-active" : ""}`}
                onClick={() => setActiveTab("certificate")}
              >
                <div className="cpp-footer-icon cert">
                  <TrophyOutlined />
                </div>
                <span className="cpp-footer-text">My Certificate</span>
              </div>
            )}
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="cpp-main">
          {/* Topbar */}
          <div className="cpp-topbar">
            <div
              className="cpp-toggle-btn"
              onClick={() => setSidebarOpen((v) => !v)}
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            </div>

            <span className="cpp-topbar-title">
              {activeTab === "lecture"
                ? activeLecture?.title || course.title
                : activeTab === "assessment"
                  ? "Final Assessment"
                  : "My Certificate"}
            </span>

            {activeTab === "lecture" && activeLecture && (
              <button
                className={`cpp-mark-btn ${isLectureCompleted(activeLecture.id) ? "done" : "todo"}`}
                onClick={handleMarkComplete}
                disabled={isLectureCompleted(activeLecture.id)}
              >
                <CheckOutlined style={{ fontSize: 12 }} />
                {isLectureCompleted(activeLecture.id)
                  ? "Completed"
                  : "Mark Complete"}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="cpp-content">
            {/* ── LECTURE TAB ── */}
            {activeTab === "lecture" && activeLecture && (
              <div>
                <div className="cpp-lec-header">
                  <div>
                    <h1 className="cpp-lec-heading">{activeLecture.title}</h1>
                    <span
                      className={`cpp-lec-type-badge ${activeLecture.type === "VIDEO" ? "video" : "text"}`}
                    >
                      {activeLecture.type === "VIDEO" ? (
                        <PlayCircleOutlined style={{ fontSize: 10 }} />
                      ) : (
                        <FileTextOutlined style={{ fontSize: 10 }} />
                      )}
                      {activeLecture.type === "VIDEO"
                        ? "Video Lecture"
                        : "Reading Material"}
                    </span>
                  </div>
                </div>

                {/* Video */}
                {activeLecture.type === "VIDEO" && activeLecture.contentUrl && (
                  <div className="cpp-video-wrap">
                    <video
                      ref={videoRef}
                      src={activeLecture.contentUrl}
                      controls
                      onEnded={handleMarkComplete}
                    />
                  </div>
                )}

                {/* Text / iframe */}
                {activeLecture.type === "TEXT" && activeLecture.contentUrl && (
                  <div className="cpp-iframe-wrap">
                    <iframe
                      src={activeLecture.contentUrl}
                      title="Reading Material"
                      width="100%"
                      height="600"
                      style={{ border: "none", display: "block" }}
                    />
                  </div>
                )}

                {/* No content */}
                {!activeLecture.contentUrl && (
                  <div className="cpp-no-content">
                    <div className="cpp-no-content-icon">📭</div>
                    <div className="cpp-no-content-text">
                      No content uploaded for this lecture yet.
                    </div>
                  </div>
                )}

                {/* Prev / Next nav */}
                {(() => {
                  const all = (course?.sections || []).flatMap(
                    (s) => s.lectures || [],
                  );
                  const idx = all.findIndex((l) => l.id === activeLecture.id);
                  return (
                    <div className="cpp-nav-row">
                      {idx > 0 && (
                        <button
                          className="cpp-nav-btn"
                          onClick={() => handleLectureSelect(all[idx - 1])}
                        >
                          ← Previous
                        </button>
                      )}
                      {idx < all.length - 1 && (
                        <button
                          className="cpp-nav-btn"
                          style={{ marginLeft: "auto" }}
                          onClick={() => handleLectureSelect(all[idx + 1])}
                        >
                          Next →
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── ASSESSMENT TAB ── */}
            {activeTab === "assessment" && (
              <div style={{ maxWidth: 740 }}>
                <div className="cpp-section-heading">
                  <div className="cpp-section-heading-icon assess">
                    <CheckCircleOutlined />
                  </div>
                  <div>
                    <h1 className="cpp-section-heading-title">
                      Final Assessment
                    </h1>
                    <p className="cpp-section-heading-sub">
                      Score 100% to earn your certificate
                    </p>
                  </div>
                </div>
                <AssessmentPlayer
                  courseId={courseId}
                  onCertificateIssued={(cert) => {
                    setCertificate(cert);
                    setActiveTab("certificate");
                  }}
                />
              </div>
            )}

            {/* ── CERTIFICATE TAB ── */}
            {activeTab === "certificate" && (
              <div style={{ maxWidth: 680 }}>
                <div className="cpp-section-heading">
                  <div className="cpp-section-heading-icon cert">
                    <TrophyOutlined />
                  </div>
                  <div>
                    <h1 className="cpp-section-heading-title">
                      Your Certificate
                    </h1>
                    <p className="cpp-section-heading-sub">
                      Congratulations on completing the course!
                    </p>
                  </div>
                </div>
                <CertificateCard certificate={certificate} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursePlayerPage;
