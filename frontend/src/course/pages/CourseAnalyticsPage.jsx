// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { Row, Col, Card, List, Tag, Avatar } from "antd";
// import axios from "../api/axiosInstance";

// const StatCard = ({ value, label }) => (
//   <div
//     style={{
//       background: "#1f1f1f",
//       padding: 20,
//       borderRadius: 12,
//       textAlign: "center",
//       color: "#fff",
//     }}
//   >
//     <h2 style={{ margin: 0 }}>{value}</h2>
//     <p style={{ margin: 0, color: "#aaa" }}>{label}</p>
//   </div>
// );

// const CourseAnalyticsPage = () => {
//   const { courseId } = useParams();
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     const res = await axios.get(`/courses/${courseId}/analytics`);
//     setData(res.data.data);
//   };

//   if (!data) return <div style={{ padding: 20 }}>Loading...</div>;

//   return (
//     <div style={{ padding: 20, background: "#0f0f0f", minHeight: "100vh" }}>
//       <h2 style={{ color: "#fff", marginBottom: 20 }}>{data.title}</h2>

//       {/* STATS */}
//       <Row gutter={16}>
//         <Col span={6}>
//           <StatCard value={data.totalEnrolled} label="Enrolled" />
//         </Col>
//         <Col span={6}>
//           <StatCard value={data.inProgress} label="In Progress" />
//         </Col>
//         <Col span={6}>
//           <StatCard value={data.completed} label="Completed" />
//         </Col>
//         <Col span={6}>
//           <StatCard value={data.avgCompletion + "%"} label="Avg Completion" />
//         </Col>
//       </Row>

//       <Row gutter={16} style={{ marginTop: 16 }}>
//         <Col span={6}>
//           <StatCard value={data.certificates} label="Certificates Issued" />
//         </Col>
//       </Row>

//       {/* RECENT ENROLLMENTS */}
//       <div
//         style={{
//           background: "#1f1f1f",
//           marginTop: 24,
//           padding: 20,
//           borderRadius: 12,
//         }}
//       >
//         <h3 style={{ color: "#fff" }}>Recent Enrollments</h3>

//         <List
//           dataSource={data.recent}
//           renderItem={(item) => (
//             <List.Item
//               style={{
//                 borderBottom: "1px solid #333",
//                 display: "flex",
//                 justifyContent: "space-between",
//               }}
//             >
//               <div style={{ display: "flex", gap: 12 }}>
//                 <Avatar>{item.name?.charAt(0)?.toUpperCase()}</Avatar>

//                 <div>
//                   <div style={{ color: "#fff" }}>{item.name}</div>
//                   <div style={{ color: "#aaa", fontSize: 12 }}>
//                     Enrolled {item.timeAgo} • {item.progress}% complete
//                   </div>
//                 </div>
//               </div>

//               <Tag
//                 color={
//                   item.status === "completed"
//                     ? "green"
//                     : item.status === "in-progress"
//                       ? "blue"
//                       : "default"
//                 }
//               >
//                 {item.status}
//               </Tag>
//             </List.Item>
//           )}
//         />
//       </div>
//     </div>
//   );
// };

// export default CourseAnalyticsPage;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col } from "antd";
import axios from "../api/axiosInstance";

const CourseAnalyticsPage = () => {
  const { courseId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get(`/courses/${courseId}/analytics`);
    setData(res.data.data);
  };

  if (!data)
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
          .cap-loader {
            min-height: 100vh;
            background: #09090f;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'DM Sans', sans-serif;
            color: #4b5563;
            font-size: 14px;
            gap: 10px;
          }
          .cap-loader-dot {
            width: 8px; height: 8px; border-radius: 50%; background: #6366f1;
            animation: bounce 1.2s infinite ease-in-out;
          }
          .cap-loader-dot:nth-child(2) { animation-delay: 0.2s; background: #818cf8; }
          .cap-loader-dot:nth-child(3) { animation-delay: 0.4s; background: #a78bfa; }
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
        <div className="cap-loader">
          <div className="cap-loader-dot" />
          <div className="cap-loader-dot" />
          <div className="cap-loader-dot" />
        </div>
      </>
    );

  const stats = [
    {
      value: data.totalEnrolled,
      label: "Total Enrolled",
      icon: "👥",
      color: "#6366f1",
      bg: "rgba(99,102,241,0.12)",
      border: "rgba(99,102,241,0.2)",
    },
    {
      value: data.inProgress,
      label: "In Progress",
      icon: "⚡",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.2)",
    },
    {
      value: data.completed,
      label: "Completed",
      icon: "✅",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
      border: "rgba(16,185,129,0.2)",
    },
    {
      value: data.avgCompletion + "%",
      label: "Avg Completion",
      icon: "📈",
      color: "#ec4899",
      bg: "rgba(236,72,153,0.1)",
      border: "rgba(236,72,153,0.2)",
    },
    {
      value: data.certificates,
      label: "Certificates Issued",
      icon: "🏆",
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.1)",
      border: "rgba(251,191,36,0.2)",
    },
  ];

  const statusConfig = {
    completed: {
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      label: "Completed",
    },
    "in-progress": {
      color: "#6366f1",
      bg: "rgba(99,102,241,0.12)",
      label: "In Progress",
    },
    default: {
      color: "#6b7280",
      bg: "rgba(107,114,128,0.12)",
      label: "Not Started",
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }

        .cap-root {
          min-height: 100vh;
          background: #09090f;
          font-family: 'DM Sans', sans-serif;
          padding: 0;
        }

        /* Hero header */
        .cap-hero {
          background: linear-gradient(135deg, #0f0f1a 0%, #13131f 60%, #16101f 100%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 32px 36px 28px;
          position: relative;
          overflow: hidden;
        }
        .cap-hero::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .cap-hero::after {
          content: '';
          position: absolute;
          bottom: -40px; left: 20%;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .cap-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.2);
          color: #818cf8;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 999px;
          margin-bottom: 12px;
        }
        .cap-title {
          font-family: 'Sora', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #f9fafb;
          margin: 0;
          letter-spacing: -0.8px;
          position: relative;
          z-index: 1;
        }
        .cap-subtitle {
          font-size: 13px;
          color: #4b5563;
          margin: 6px 0 0;
          font-weight: 500;
        }

        /* Body */
        .cap-body { padding: 28px 36px; }

        /* Stats grid */
        .cap-stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
          margin-bottom: 28px;
        }
        @media (max-width: 1100px) {
          .cap-stats-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 700px) {
          .cap-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .cap-stat-card {
          border-radius: 14px;
          padding: 20px 18px;
          border: 1px solid;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .cap-stat-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 14px 14px 0 0;
        }
        .cap-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.3);
        }
        .cap-stat-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .cap-stat-value {
          font-family: 'Sora', sans-serif;
          font-size: 28px;
          font-weight: 800;
          line-height: 1;
          margin: 0;
        }
        .cap-stat-label {
          font-size: 11.5px;
          font-weight: 600;
          color: #6b7280;
          letter-spacing: 0.2px;
          margin: 0;
        }

        /* Section card */
        .cap-card {
          background: #13131f;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }
        .cap-card-header {
          padding: 18px 22px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cap-card-title {
          font-family: 'Sora', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #f9fafb;
          margin: 0;
        }
        .cap-card-badge {
          background: rgba(255,255,255,0.06);
          color: #6b7280;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 999px;
        }

        /* Table */
        .cap-table { width: 100%; border-collapse: collapse; }
        .cap-table-head th {
          padding: 10px 22px;
          text-align: left;
          font-size: 10.5px;
          font-weight: 700;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .cap-table-row {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .cap-table-row:last-child { border-bottom: none; }
        .cap-table-row:hover { background: rgba(255,255,255,0.02); }
        .cap-table-row td { padding: 14px 22px; vertical-align: middle; }

        .cap-user-cell { display: flex; align-items: center; gap: 12px; }
        .cap-avatar {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .cap-user-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #e5e7eb;
          margin: 0 0 2px;
        }
        .cap-user-meta {
          font-size: 11.5px;
          color: #4b5563;
          font-weight: 500;
          margin: 0;
        }

        /* Progress bar inline */
        .cap-mini-progress {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cap-mini-track {
          flex: 1;
          height: 5px;
          background: rgba(255,255,255,0.06);
          border-radius: 999px;
          overflow: hidden;
          min-width: 80px;
        }
        .cap-mini-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.6s ease;
        }
        .cap-mini-pct {
          font-size: 12px;
          font-weight: 700;
          color: #9ca3af;
          width: 34px;
          text-align: right;
          flex-shrink: 0;
        }

        .cap-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 11px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 600;
        }
        .cap-status-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
        }

        /* Avatar colors cycling */
        .av-0 { background: rgba(99,102,241,0.2); color: #818cf8; }
        .av-1 { background: rgba(16,185,129,0.15); color: #34d399; }
        .av-2 { background: rgba(245,158,11,0.15); color: #fbbf24; }
        .av-3 { background: rgba(236,72,153,0.12); color: #f472b6; }
        .av-4 { background: rgba(139,92,246,0.15); color: #a78bfa; }
      `}</style>

      <div className="cap-root">
        {/* Hero */}
        <div className="cap-hero">
          <div className="cap-eyebrow">📊 Analytics Dashboard</div>
          <h1 className="cap-title">{data.title}</h1>
          <p className="cap-subtitle">
            Course performance overview and enrollment insights
          </p>
        </div>

        <div className="cap-body">
          {/* Stats */}
          <div className="cap-stats-grid">
            {stats.map((s, i) => (
              <div
                key={i}
                className="cap-stat-card"
                style={{
                  background: s.bg,
                  borderColor: s.border,
                }}
              >
                <style>{`.cap-stat-card:nth-child(${i + 1})::after { background: ${s.color}; }`}</style>
                <div
                  className="cap-stat-icon"
                  style={{ background: `${s.bg}`, fontSize: 18 }}
                >
                  {s.icon}
                </div>
                <p className="cap-stat-value" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="cap-stat-label">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent enrollments */}
          <div className="cap-card">
            <div className="cap-card-header">
              <h3 className="cap-card-title">Recent Enrollments</h3>
              <span className="cap-card-badge">
                {data.recent?.length || 0} students
              </span>
            </div>

            <table className="cap-table">
              <thead>
                <tr className="cap-table-head">
                  <th>Student</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {(data.recent || []).map((item, i) => {
                  const sc = statusConfig[item.status] || statusConfig.default;
                  const pct = parseInt(item.progress) || 0;
                  const fillColor =
                    pct === 100 ? "#10b981" : pct > 50 ? "#6366f1" : "#f59e0b";
                  return (
                    <tr key={i} className="cap-table-row">
                      {/* Student */}
                      <td>
                        <div className="cap-user-cell">
                          <div className={`cap-avatar av-${i % 5}`}>
                            {item.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="cap-user-name">{item.name}</p>
                          </div>
                        </div>
                      </td>

                      {/* Progress */}
                      <td style={{ minWidth: 160 }}>
                        <div className="cap-mini-progress">
                          <div className="cap-mini-track">
                            <div
                              className="cap-mini-fill"
                              style={{
                                width: `${pct}%`,
                                background: fillColor,
                              }}
                            />
                          </div>
                          <span className="cap-mini-pct">{pct}%</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className="cap-status-pill"
                          style={{
                            background: sc.bg,
                            color: sc.color,
                          }}
                        >
                          <span
                            className="cap-status-dot"
                            style={{ background: sc.color }}
                          />
                          {sc.label}
                        </span>
                      </td>

                      {/* Time */}
                      <td>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#4b5563",
                            fontWeight: 500,
                          }}
                        >
                          {item.timeAgo}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseAnalyticsPage;
