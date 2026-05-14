// import { Card, Tag, Typography, Progress, Button, Tooltip } from "antd";
// import {
//   PlayCircleOutlined,
//   BookOutlined,
//   ClockCircleOutlined,
//   TrophyOutlined,
//   HeartOutlined,
//   HeartFilled,
//   ShoppingCartOutlined,
//   UserOutlined,
// } from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";

// const { Text, Title, Paragraph } = Typography;

// const CourseCard = ({
//   course,
//   mode = "browse", // "browse" | "enrolled" | "instructor"
//   progressPercent = 0,
//   isWishlisted = false,
//   isInCart = false,
//   onWishlistToggle,
//   onCartToggle,
//   onContinue,
// }) => {
//   const navigate = useNavigate();

//   const handleCardClick = () => {
//     if (mode === "enrolled") {
//       navigate(`/candidate/courses/player/${course.id}`);
//     } else if (mode === "instructor") {
//       navigate(`/company/courses/edit/${course.id}`);
//     } else {
//       navigate(`/candidate/courses/${course.slug || course.id}`);
//     }
//   };

//   const statusColor = {
//     PUBLISHED: "green",
//     DRAFT: "orange",
//     DELETED: "red",
//   };

//   return (
//     <Card
//       hoverable
//       style={{
//         borderRadius: 12,
//         overflow: "hidden",
//         border: "1px solid #e8e8e8",
//         height: "100%",
//         display: "flex",
//         flexDirection: "column",
//       }}
//       bodyStyle={{
//         padding: 16,
//         flex: 1,
//         display: "flex",
//         flexDirection: "column",
//       }}
//       cover={
//         <div
//           style={{ position: "relative", cursor: "pointer" }}
//           onClick={handleCardClick}
//         >
//           <img
//             src={course.thumbnailUrl || "/course-placeholder.png"}
//             alt={course.title}
//             style={{ width: "100%", height: 180, objectFit: "cover" }}
//             // onError={(e) => {
//             //   e.target.src = "https://via.placeholder.com/320x180?text=Course";
//             // }}
//             onError={(e) => {
//               e.target.src = "https://placehold.co/320x180/png?text=Course";
//             }}
//           />
//           {/* Free / Paid badge */}
//           <Tag
//             color={course.isFree ? "blue" : "gold"}
//             style={{ position: "absolute", top: 10, left: 10, fontWeight: 600 }}
//           >
//             {/* {course.isFree ? "FREE" : `₹${(course.price / 100).toFixed(0)}`} */}
//             {course.isFree || !course.price
//               ? "FREE"
//               : `₹${(Number(course.price) / 100).toFixed(0)}`}
//           </Tag>
//           {/* Instructor status badge */}
//           {mode === "instructor" && (
//             <Tag
//               color={statusColor[course.status] || "default"}
//               style={{
//                 position: "absolute",
//                 top: 10,
//                 right: 10,
//                 fontWeight: 600,
//               }}
//             >
//               {course.status}
//             </Tag>
//           )}
//           {/* Certificate badge */}
//           {course.hasCertificate && (
//             <Tooltip title="Certificate included">
//               <TrophyOutlined
//                 style={{
//                   position: "absolute",
//                   bottom: 10,
//                   right: 10,
//                   fontSize: 20,
//                   color: "#faad14",
//                   background: "rgba(0,0,0,0.5)",
//                   borderRadius: "50%",
//                   padding: 4,
//                 }}
//               />
//             </Tooltip>
//           )}
//         </div>
//       }
//     >
//       {/* Title */}
//       <Title
//         level={5}
//         ellipsis={{ rows: 2 }}
//         style={{ marginBottom: 4, cursor: "pointer" }}
//         onClick={handleCardClick}
//       >
//         {course.title}
//       </Title>

//       {/* Instructor */}
//       <Text
//         type="secondary"
//         style={{ fontSize: 12, marginBottom: 8, display: "block" }}
//       >
//         <UserOutlined style={{ marginRight: 4 }} />
//         {course.creator?.name || "Instructor"}
//       </Text>

//       {/* Stats row */}
//       <div
//         style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}
//       >
//         <Text type="secondary" style={{ fontSize: 12 }}>
//           <BookOutlined style={{ marginRight: 4 }} />
//           {course._count?.sections || 0} sections
//         </Text>
//         <Text type="secondary" style={{ fontSize: 12 }}>
//           <UserOutlined style={{ marginRight: 4 }} />
//           {course._count?.enrollments || 0} enrolled
//         </Text>
//         {course.accessDuration !== "LIFETIME" && (
//           <Text type="secondary" style={{ fontSize: 12 }}>
//             <ClockCircleOutlined style={{ marginRight: 4 }} />
//             {course.accessDuration?.replace(/_/g, " ")}
//           </Text>
//         )}
//       </div>

//       {/* Progress bar — enrolled mode */}
//       {mode === "enrolled" && (
//         <div style={{ marginBottom: 12 }}>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               marginBottom: 4,
//             }}
//           >
//             <Text style={{ fontSize: 12 }}>Progress</Text>
//             <Text style={{ fontSize: 12, fontWeight: 600 }}>
//               {progressPercent}%
//             </Text>
//           </div>
//           <Progress
//             percent={progressPercent}
//             size="small"
//             strokeColor={progressPercent === 100 ? "#52c41a" : "#1677ff"}
//             showInfo={false}
//           />
//         </div>
//       )}

//       {/* Spacer */}
//       <div style={{ flex: 1 }} />

//       {/* Actions */}
//       <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
//         {mode === "browse" && (
//           <>
//             <Button
//               type="primary"
//               size="small"
//               icon={<PlayCircleOutlined />}
//               style={{ flex: 1 }}
//               onClick={handleCardClick}
//             >
//               View Course
//             </Button>
//             <Tooltip
//               title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
//             >
//               <Button
//                 size="small"
//                 icon={
//                   isWishlisted ? (
//                     <HeartFilled style={{ color: "#ff4d4f" }} />
//                   ) : (
//                     <HeartOutlined />
//                   )
//                 }
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onWishlistToggle?.(course.id);
//                 }}
//               />
//             </Tooltip>
//             {!course.isFree && (
//               <Tooltip title={isInCart ? "Remove from cart" : "Add to cart"}>
//                 <Button
//                   size="small"
//                   icon={<ShoppingCartOutlined />}
//                   type={isInCart ? "primary" : "default"}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onCartToggle?.(course.id);
//                   }}
//                 />
//               </Tooltip>
//             )}
//           </>
//         )}

//         {mode === "enrolled" && (
//           <Button
//             type="primary"
//             size="small"
//             icon={<PlayCircleOutlined />}
//             style={{ flex: 1 }}
//             onClick={() => navigate(`/candidate/courses/player/${course.id}`)}
//           >
//             {progressPercent === 100
//               ? "Review"
//               : progressPercent > 0
//                 ? "Continue"
//                 : "Start"}
//           </Button>
//         )}

//         {mode === "instructor" && (
//           <>
//             <Button
//               size="small"
//               style={{ flex: 1 }}
//               onClick={() => navigate(`/company/courses/edit/${course.id}`)}
//             >
//               Edit
//             </Button>
//             <Button
//               type="primary"
//               size="small"
//               onClick={(e) => {
//                 e.stopPropagation(); // 🔥 VERY IMPORTANT
//                 navigate(`/company/courses/${course.id}/analytics`);
//               }}
//             >
//               Manage
//             </Button>
//           </>
//         )}
//       </div>
//     </Card>
//   );
// };

// export default CourseCard;

import {
  PlayCircleOutlined,
  BookOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  HeartOutlined,
  HeartFilled,
  ShoppingCartOutlined,
  UserOutlined,
  StarFilled,
  ArrowRightOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Popover } from "antd";

const CourseCard = ({
  course,
  mode = "browse",
  progressPercent = 0,
  isWishlisted = false,
  isInCart = false,
  onWishlistToggle,
  onCartToggle,
  onContinue,
  onDelete,
  // basePath = "/candidate",
}) => {
  console.log("course", course);
  console.log("mode", mode);
  console.log("progressPercent", progressPercent);
  console.log("isWishlisted", isWishlisted);
  console.log("isInCart", isInCart);
  console.log("onWishlistToggle", onWishlistToggle);
  console.log("onCartToggle", onCartToggle);
  console.log("onContinue", onContinue);
  console.log("onDelete", onDelete);

  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const [deletePopoverOpen, setDeletePopoverOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const basePath = user?.role === "company" ? "/company" : "/candidate";

  const handleCardClick = () => {
    if (mode === "enrolled") {
      // navigate(`/candidate/courses/player/${course.id}`);
      navigate(`${basePath}/courses/player/${course.id}`);
      // } else if (mode === "instructor") {
      //   navigate(`/company/courses/edit/${course.id}`);
    } else if (mode === "instructor") {
      navigate(`${basePath}/courses/edit/${course.id}`);
    } else {
      // navigate(`/candidate/courses/${course.slug || course.id}`);
      navigate(`${basePath}/courses/${course.slug || course.id}`);
    }
  };

  const statusConfig = {
    PUBLISHED: { color: "#10b981", bg: "#ecfdf5", label: "Published" },
    DRAFT: { color: "#f59e0b", bg: "#fffbeb", label: "Draft" },
    DELETED: { color: "#ef4444", bg: "#fef2f2", label: "Deleted" },
  };

  const durationLabel = {
    LIFETIME: "Lifetime",
    ONE_MONTH: "1 Month",
    THREE_MONTHS: "3 Months",
    SIX_MONTHS: "6 Months",
    ONE_YEAR: "1 Year",
  };

  const statusInfo = statusConfig[course.status] || statusConfig.DRAFT;

  // Generate a gradient based on course title for placeholder
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  ];
  const gradientIndex = course.title
    ? course.title.charCodeAt(0) % gradients.length
    : 0;

  const progressColor =
    progressPercent === 100
      ? "#10b981"
      : progressPercent > 50
        ? "#3b82f6"
        : "#f59e0b";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');
        
        .course-card-pro {
          font-family: 'DM Sans', sans-serif;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #f0f0f0;
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
        }
        .course-card-pro:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08);
          border-color: #e0e7ff;
        }
        .course-card-thumb {
          position: relative;
          height: 185px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .course-card-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .course-card-pro:hover .course-card-thumb img {
          transform: scale(1.06);
        }
        .thumb-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .course-card-pro:hover .thumb-overlay {
          opacity: 1;
        }
        .play-btn {
          width: 48px;
          height: 48px;
          background: rgba(255,255,255,0.95);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #4f46e5;
          transform: scale(0.8);
          transition: transform 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .course-card-pro:hover .play-btn {
          transform: scale(1);
        }
        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        .badge-free {
          background: #dbeafe;
          color: #1d4ed8;
        }
        .badge-paid {
          background: #fef3c7;
          color: #92400e;
        }
        .badge-status {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .card-body {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .course-title {
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
          letter-spacing: -0.1px;
        }
        .instructor-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .instructor-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .instructor-name {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }
        .stats-row {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          color: #9ca3af;
          font-weight: 500;
        }
        .stat-item svg, .stat-item .anticon {
          font-size: 11px;
          color: #d1d5db;
        }
        .divider {
          height: 1px;
          background: #f3f4f6;
          margin: 0;
        }
        .progress-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .progress-label {
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
        }
        .progress-pct {
          font-size: 12px;
          font-weight: 700;
          color: ${progressColor};
        }
        .progress-track {
          height: 5px;
          background: #f3f4f6;
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 999px;
          background: ${progressColor};
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cert-strip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          background: linear-gradient(135deg, #fef9e7 0%, #fdf3d0 100%);
          border-radius: 8px;
          border: 1px solid #fde68a;
        }
        .cert-strip-text {
          font-size: 11px;
          color: #92400e;
          font-weight: 500;
        }
        .actions-row {
          display: flex;
          gap: 8px;
          margin-top: auto;
          padding-top: 4px;
        }
        .btn-primary {
          flex: 1;
          height: 36px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
          letter-spacing: 0.1px;
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
        }
        .btn-primary:active {
          transform: translateY(0);
        }
        .btn-primary.enrolled {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        .btn-primary.enrolled:hover {
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
        }
        .btn-primary.review {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }
        .btn-icon {
          width: 36px;
          height: 36px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.2s ease;
          color: #9ca3af;
          flex-shrink: 0;
        }
        .btn-icon:hover {
          border-color: #4f46e5;
          color: #4f46e5;
          background: #f5f3ff;
        }
        .btn-icon.active {
          border-color: #ef4444;
          color: #ef4444;
          background: #fef2f2;
        }
        .btn-icon.cart-active {
          border-color: #4f46e5;
          color: #4f46e5;
          background: #eef2ff;
        }
        .btn-secondary {
          flex: 1;
          height: 36px;
          background: white;
          color: #374151;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .btn-secondary:hover {
          border-color: #4f46e5;
          color: #4f46e5;
          background: #f5f3ff;
        }
        .btn-manage {
          flex: 1;
          height: 36px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .btn-manage:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
        }
        .top-left-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
        }
        .top-right-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
        }
        .trophy-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          z-index: 2;
          width: 30px;
          height: 30px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fbbf24;
          font-size: 14px;
        }
        .placeholder-thumb {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: rgba(255,255,255,0.8);
          font-family: 'Sora', sans-serif;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.5px;
          text-align: center;
          padding: 16px;
        }
        .placeholder-thumb span {
          font-size: 11px;
          font-weight: 400;
          opacity: 0.7;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
          .btn-delete {
  width: 36px;
  height: 36px;
  border: 1.5px solid #fecaca;
  border-radius: 10px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  color: #ef4444;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.btn-delete:hover {
  border-color: #ef4444;
  background: #fef2f2;
}
      `}</style>

      <div
        className="course-card-pro"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Thumbnail */}
        <div className="course-card-thumb" onClick={handleCardClick}>
          {!imgError && course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              style={{
                background: gradients[gradientIndex],
                width: "100%",
                height: "100%",
              }}
            >
              <div className="placeholder-thumb">
                {/* {course.title?.slice(0, 2).toUpperCase()} */}
                {course.title}
                <span>Course</span>
              </div>
            </div>
          )}

          <div className="thumb-overlay">
            <div className="play-btn">
              <PlayCircleOutlined />
            </div>
          </div>

          {/* Free/Paid badge */}
          <div className="top-left-badge">
            <span
              className={`badge-pill ${course.isFree || !course.price ? "badge-free" : "badge-paid"}`}
            >
              {course.isFree || !course.price
                ? "FREE"
                : `₹${(Number(course.price) / 100).toFixed(0)}`}
            </span>
          </div>

          {/* Status badge for instructor */}
          {mode === "instructor" && (
            <div className="top-right-badge">
              <span
                className="badge-status"
                style={{
                  background: statusInfo.bg,
                  color: statusInfo.color,
                }}
              >
                {statusInfo.label}
              </span>
            </div>
          )}

          {/* Certificate badge */}
          {course.hasCertificate && (
            <div className="trophy-badge" title="Certificate included">
              <TrophyOutlined />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="card-body">
          {/* Title */}
          <p className="course-title" onClick={handleCardClick}>
            {course.title}
          </p>

          {/* Instructor */}
          <div className="instructor-row">
            <div className="instructor-avatar">
              {course.creator?.name?.charAt(0)?.toUpperCase() || "I"}
            </div>
            <span className="instructor-name">
              {course.creator?.name || "Instructor"}
            </span>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-item">
              <BookOutlined />
              {course._count?.sections || 0} sections
            </div>
            <div className="stat-item">
              <UserOutlined />
              {course._count?.enrollments || 0} enrolled
            </div>
            {course.accessDuration && course.accessDuration !== "LIFETIME" && (
              <div className="stat-item">
                <ClockCircleOutlined />
                {durationLabel[course.accessDuration] ||
                  course.accessDuration.replace(/_/g, " ")}
              </div>
            )}
          </div>

          {/* Certificate strip */}
          {course.hasCertificate && (
            <div className="cert-strip">
              <TrophyOutlined style={{ color: "#d97706", fontSize: 12 }} />
              <span className="cert-strip-text">Certificate of Completion</span>
            </div>
          )}

          {/* Progress — enrolled mode */}
          {mode === "enrolled" && (
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Your progress</span>
                <span className="progress-pct">{progressPercent}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Divider */}
          <div className="divider" />

          {/* Actions */}
          <div className="actions-row">
            {mode === "browse" && (
              <>
                <button className="btn-primary" onClick={handleCardClick}>
                  View Course <ArrowRightOutlined style={{ fontSize: 11 }} />
                </button>
                <button
                  className={`btn-icon ${isWishlisted ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onWishlistToggle?.(course.id);
                  }}
                  title={
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  {isWishlisted ? (
                    <HeartFilled style={{ color: "#ef4444" }} />
                  ) : (
                    <HeartOutlined />
                  )}
                </button>
                {!course.isFree && (
                  <button
                    className={`btn-icon ${isInCart ? "cart-active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCartToggle?.(course.id);
                    }}
                    title={isInCart ? "Remove from cart" : "Add to cart"}
                  >
                    <ShoppingCartOutlined />
                  </button>
                )}
              </>
            )}

            {mode === "instructor" && (
              <>
                <button
                  className="btn-secondary"
                  onClick={() =>
                    navigate(`${basePath}/courses/edit/${course.id}`)
                  }
                >
                  Edit
                </button>
                <button
                  className="btn-manage"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`${basePath}/courses/${course.id}/analytics`);
                  }}
                >
                  Manage
                </button>

                <Popover
                  title="Delete Course"
                  trigger="click"
                  placement="topRight"
                  open={deletePopoverOpen}
                  onOpenChange={(open) => setDeletePopoverOpen(open)}
                  content={
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        maxWidth: 200,
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>
                        Are you sure? This cannot be undone.
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          style={{
                            padding: "4px 12px",
                            border: "1.5px solid #e5e7eb",
                            borderRadius: 7,
                            background: "white",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#374151",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletePopoverOpen(false);
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          style={{
                            padding: "4px 12px",
                            border: "none",
                            borderRadius: 7,
                            background: "#ef4444",
                            color: "white",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            setDeletePopoverOpen(false);
                            if (onDelete) {
                              console.log("onDelete called:");
                              await onDelete(course.id);
                            } else {
                              console.log("not called");
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  }
                >
                  <button
                    className="btn-delete"
                    onClick={(e) => e.stopPropagation()}
                    title="Delete course"
                  >
                    <DeleteOutlined />
                  </button>
                </Popover>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseCard;
