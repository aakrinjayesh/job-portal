// import { useState, useEffect } from "react";
// import {
//   Row,
//   Col,
//   Button,
//   Typography,
//   Spin,
//   Empty,
//   Statistic,
//   Card,
//   Space,
//   message,
// } from "antd";
// import {
//   PlusOutlined,
//   BookOutlined,
//   EyeOutlined,
//   TeamOutlined,
//   TrophyOutlined,
// } from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";
// import { GetMyCourses } from "../api/courseApi.js";
// import CourseCard from "../components/CourseCard.jsx";

// const { Title, Text } = Typography;

// const InstructorDashboard = () => {
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       try {
//         const res = await GetMyCourses();
//         setCourses(res.data || []);
//       } catch {
//         message.error("Failed to load courses");
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);

//   const publishedCount = courses.filter((c) => c.status === "PUBLISHED").length;
//   const draftCount = courses.filter((c) => c.status === "DRAFT").length;
//   const totalEnrollments = courses.reduce(
//     (sum, c) => sum + (c._count?.enrollments || 0),
//     0,
//   );

//   return (
//     <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
//       {/* Header */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 24,
//         }}
//       >
//         <div>
//           <Title level={3} style={{ margin: 0 }}>
//             <BookOutlined style={{ marginRight: 8, color: "#1677ff" }} />
//             My Courses
//           </Title>
//           <Text type="secondary">Manage and track your courses</Text>
//         </div>
//         <Button
//           type="primary"
//           icon={<PlusOutlined />}
//           size="large"
//           onClick={() => navigate("/company/courses/create")}
//         >
//           Create Course
//         </Button>
//       </div>

//       {/* Stats */}
//       <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
//         {[
//           {
//             title: "Published",
//             value: publishedCount,
//             icon: <EyeOutlined />,
//             color: "#52c41a",
//           },
//           {
//             title: "Drafts",
//             value: draftCount,
//             icon: <BookOutlined />,
//             color: "#faad14",
//           },
//           {
//             title: "Total Courses",
//             value: courses.length,
//             icon: <BookOutlined />,
//             color: "#1677ff",
//           },
//           {
//             title: "Total Enrollments",
//             value: totalEnrollments,
//             icon: <TeamOutlined />,
//             color: "#722ed1",
//           },
//         ].map((stat) => (
//           <Col xs={12} sm={6} key={stat.title}>
//             <Card style={{ borderRadius: 12, textAlign: "center" }}>
//               <Statistic
//                 title={stat.title}
//                 value={stat.value}
//                 prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
//                 valueStyle={{ color: stat.color }}
//               />
//             </Card>
//           </Col>
//         ))}
//       </Row>

//       {/* Courses grid */}
//       {loading ? (
//         <div style={{ textAlign: "center", padding: 80 }}>
//           <Spin size="large" />
//         </div>
//       ) : courses.length === 0 ? (
//         <Empty
//           description="No courses yet"
//           image={<BookOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />}
//         >
//           <Button
//             type="primary"
//             icon={<PlusOutlined />}
//             onClick={() => navigate("/company/courses/create")}
//           >
//             Create Your First Course
//           </Button>
//         </Empty>
//       ) : (
//         <Row gutter={[20, 20]}>
//           {courses.map((course) => (
//             <Col xs={24} sm={12} md={8} key={course.id}>
//               <CourseCard course={course} mode="instructor" />
//             </Col>
//           ))}
//         </Row>
//       )}
//     </div>
//   );
// };

// export default InstructorDashboard;

import { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Button,
  Typography,
  Spin,
  Empty,
  Statistic,
  Card,
  Space,
  message,
  Pagination,
} from "antd";
import {
  PlusOutlined,
  BookOutlined,
  EyeOutlined,
  TeamOutlined,
  AppstoreOutlined,
  PlaySquareOutlined,
  SearchOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  GetMyCourses,
  GetAllCourses,
  GetMyEnrollments,
  GetWishlist,
  GetCart,
  AddToWishlist,
  RemoveFromWishlist,
  AddToCart,
  RemoveFromCart,
} from "../api/courseApi.js";
import CourseCard from "../components/CourseCard.jsx";

const { Title, Text } = Typography;

// ─────────────────────────────────────────────────────────
// Browse tab — reused from CoursePage logic
// ─────────────────────────────────────────────────────────
// const BrowseCoursesTab = () => {
//   const [courses, setCourses] = useState([]);
//   const [enrollments, setEnrollments] = useState([]);
//   const [wishlistIds, setWishlistIds] = useState([]);
//   const [cartIds, setCartIds] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [isFreeFilter, setIsFreeFilter] = useState(undefined);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [searchError, setSearchError] = useState("");

//   const limit = 12;

//   const enrollmentMap = {};
//   enrollments.forEach((e) => {
//     if (e.course?.id) enrollmentMap[e.course.id] = e;
//   });

//   const loadCourses = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await GetAllCourses(page, limit, search, isFreeFilter);
//       setCourses(res.data || []);
//       setTotal(res.pagination?.total || 0);
//     } catch {
//       setCourses([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, search, isFreeFilter]);

//   const loadUserData = async () => {
//     const token = localStorage.getItem("token");
//     if (!token) return;
//     try {
//       const [enrollRes, wishRes, cartRes] = await Promise.all([
//         GetMyEnrollments(),
//         GetWishlist(),
//         GetCart(),
//       ]);
//       setEnrollments(enrollRes.data || []);
//       setWishlistIds((wishRes.data?.items || []).map((i) => i.courseId));
//       setCartIds((cartRes.data?.items || []).map((i) => i.courseId));
//     } catch {
//       // Not logged in
//     }
//   };

//   useEffect(() => {
//     loadCourses();
//   }, [loadCourses]);

//   useEffect(() => {
//     loadUserData();
//   }, []);

//   const handleWishlistToggle = async (courseId) => {
//     const isIn = wishlistIds.includes(courseId);
//     try {
//       if (isIn) {
//         await RemoveFromWishlist(courseId);
//         setWishlistIds((prev) => prev.filter((id) => id !== courseId));
//       } else {
//         await AddToWishlist(courseId);
//         setWishlistIds((prev) => [...prev, courseId]);
//       }
//     } catch {}
//   };

//   const handleCartToggle = async (courseId) => {
//     const isIn = cartIds.includes(courseId);
//     try {
//       if (isIn) {
//         await RemoveFromCart(courseId);
//         setCartIds((prev) => prev.filter((id) => id !== courseId));
//       } else {
//         await AddToCart(courseId);
//         setCartIds((prev) => [...prev, courseId]);
//       }
//     } catch {}
//   };

//   const calculateProgress = (course, enrollment) => {
//     if (!course || !enrollment) return 0;
//     if (enrollment.completedAt) return 100;
//     const totalLectures =
//       course.sections?.reduce((acc, s) => acc + (s.lectures?.length || 0), 0) ||
//       0;
//     const completedLectures =
//       enrollment.progress?.filter((p) => p.isCompleted).length || 0;
//     if (!totalLectures) return 0;
//     return Math.round((completedLectures / totalLectures) * 100);
//   };

//   return (
//     <>
//       <style>{`
//         .browse-search-bar {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           flex-wrap: wrap;
//           margin-bottom: 20px;
//         }
//         .browse-search-wrap {
//           position: relative;
//           flex: 1;
//           min-width: 220px;
//           max-width: 360px;
//         }
//         .browse-search-input {
//           width: 100%;
//           height: 40px;
//           padding: 0 14px 0 40px;
//           background: #f5f5f5;
//           border: 1.5px solid #e5e7eb;
//           border-radius: 10px;
//           font-size: 13.5px;
//           outline: none;
//           transition: all 0.2s;
//           box-sizing: border-box;
//           font-family: 'DM Sans', sans-serif;
//           color: #111827;
//         }
//         .browse-search-input:focus {
//           border-color: #6366f1;
//           background: #fff;
//           box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
//         }
//         .browse-search-icon {
//           position: absolute;
//           left: 13px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #9ca3af;
//           font-size: 14px;
//           pointer-events: none;
//         }
//         .browse-filter-select {
//           height: 40px;
//           padding: 0 32px 0 12px;
//           background: #f5f5f5;
//           border: 1.5px solid #e5e7eb;
//           border-radius: 10px;
//           font-size: 13px;
//           font-weight: 500;
//           outline: none;
//           cursor: pointer;
//           appearance: none;
//           background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
//           background-repeat: no-repeat;
//           background-position: right 10px center;
//           color: #374151;
//           transition: all 0.2s;
//           font-family: 'DM Sans', sans-serif;
//         }
//         .browse-filter-select:focus {
//           border-color: #6366f1;
//           background-color: #fff;
//         }
//         .browse-results-badge {
//           margin-left: auto;
//           background: #f3f4f6;
//           border: 1px solid #e5e7eb;
//           color: #6b7280;
//           font-size: 12px;
//           font-weight: 600;
//           padding: 6px 14px;
//           border-radius: 999px;
//           white-space: nowrap;
//         }
//         .browse-filter-chip {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 4px 12px;
//           background: #ede9fe;
//           border: 1px solid #c4b5fd;
//           color: #5b21b6;
//           border-radius: 999px;
//           font-size: 12px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: background 0.15s;
//           margin-bottom: 14px;
//           margin-right: 6px;
//         }
//         .browse-filter-chip:hover { background: #ddd6fe; }
//         .browse-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
//           gap: 18px;
//         }
//         .browse-pagination {
//           display: flex;
//           justify-content: center;
//           margin-top: 32px;
//         }
//       `}</style>

//       {/* Search & filter */}
//       <div className="browse-search-bar">
//         <div className="browse-search-wrap">
//           <SearchOutlined className="browse-search-icon" />
//           <input
//             className="browse-search-input"
//             placeholder="Search courses..."
//             value={search}
//             onChange={(e) => {
//               const value = e.target.value;
//               const hasSpecialChar = /[^a-zA-Z0-9_\- ]/.test(value);
//               if (hasSpecialChar) {
//                 setSearchError("Special characters are not allowed.");
//               } else {
//                 setSearchError("");
//               }
//               setSearch(value.replace(/[^a-zA-Z0-9_\- ]/g, ""));
//               setPage(1);
//             }}
//           />
//           {searchError && (
//             <span
//               style={{
//                 position: "absolute",
//                 top: "calc(100% + 3px)",
//                 left: 0,
//                 fontSize: 11,
//                 color: "#ef4444",
//                 fontWeight: 500,
//               }}
//             >
//               {searchError}
//             </span>
//           )}
//         </div>

//         <select
//           className="browse-filter-select"
//           value={isFreeFilter ?? ""}
//           onChange={(e) => {
//             setIsFreeFilter(e.target.value || undefined);
//             setPage(1);
//           }}
//         >
//           <option value="">All Prices</option>
//           <option value="true">Free</option>
//           <option value="false">Paid</option>
//         </select>

//         <div className="browse-results-badge">
//           {total} course{total !== 1 ? "s" : ""}
//         </div>
//       </div>

//       {/* Active filter chips */}
//       {(search || isFreeFilter) && (
//         <div>
//           {search && (
//             <span className="browse-filter-chip" onClick={() => setSearch("")}>
//               "{search}" <CloseOutlined style={{ fontSize: 10 }} />
//             </span>
//           )}
//           {isFreeFilter && (
//             <span
//               className="browse-filter-chip"
//               onClick={() => setIsFreeFilter(undefined)}
//             >
//               {isFreeFilter === "true" ? "Free" : "Paid"}
//               <CloseOutlined style={{ fontSize: 10 }} />
//             </span>
//           )}
//         </div>
//       )}

//       {/* Course grid */}
//       {loading ? (
//         <div style={{ textAlign: "center", padding: 80 }}>
//           <Spin size="large" />
//         </div>
//       ) : courses.length === 0 ? (
//         <Empty description="No courses found" style={{ marginTop: 40 }} />
//       ) : (
//         <>
//           <div className="browse-grid">
//             {courses.map((course) => {
//               const enrollment = enrollmentMap[course.id];
//               return (
//                 // <CourseCard
//                 //   key={course.id}
//                 //   course={course}
//                 //   mode={enrollment ? "enrolled" : "browse"}
//                 //   progressPercent={calculateProgress(course, enrollment)}
//                 //   isWishlisted={wishlistIds.includes(course.id)}
//                 //   isInCart={cartIds.includes(course.id)}
//                 //   onWishlistToggle={handleWishlistToggle}
//                 //   onCartToggle={handleCartToggle}
//                 // />
//                 <CourseCard
//                   key={course.id}
//                   course={course}
//                   mode={enrollment ? "enrolled" : "browse"}
//                   progressPercent={calculateProgress(course, enrollment)}
//                   isWishlisted={wishlistIds.includes(course.id)}
//                   isInCart={cartIds.includes(course.id)}
//                   onWishlistToggle={handleWishlistToggle}
//                   onCartToggle={handleCartToggle}
//                   basePath="/company"
//                 />
//               );
//             })}
//           </div>

//           <div className="browse-pagination">
//             <Pagination
//               current={page}
//               total={total}
//               pageSize={limit}
//               onChange={setPage}
//               showSizeChanger={false}
//             />
//           </div>
//         </>
//       )}
//     </>
//   );
// };
const BrowseCoursesTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("browse");
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [cartIds, setCartIds] = useState([]);
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [cartCourses, setCartCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isFreeFilter, setIsFreeFilter] = useState(undefined);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchError, setSearchError] = useState("");

  const limit = 12;

  const enrollmentMap = {};
  enrollments.forEach((e) => {
    if (e.course?.id) enrollmentMap[e.course.id] = e;
  });

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetAllCourses(page, limit, search, isFreeFilter);
      setCourses(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, isFreeFilter]);

  // const loadUserData = async () => {
  //   const token = localStorage.getItem("token");
  //   if (!token) return;

  //   try {
  //     const enrollRes = await GetMyEnrollments();
  //     setEnrollments(enrollRes.data || []);
  //   } catch {}

  //   try {
  //     const wishRes = await GetWishlist();
  //     const items = wishRes.data?.items || [];
  //     setWishlistIds(items.map((i) => i.courseId));
  //     setWishlistCourses(items.map((i) => i.course));
  //   } catch {}

  //   try {
  //     const cartRes = await GetCart();
  //     const items = cartRes.data?.items || [];
  //     setCartIds(items.map((i) => i.courseId));
  //     setCartCourses(items.map((i) => i.course));
  //   } catch {}
  // };

  const loadUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const enrollRes = await GetMyEnrollments();
      setEnrollments(enrollRes.data || []);
    } catch {}

    try {
      const wishRes = await GetWishlist();
      const items = wishRes.data?.items || [];
      setWishlistIds(items.map((i) => i.courseId));
      setWishlistCourses(items.map((i) => i.course));
    } catch {}

    try {
      const cartRes = await GetCart();
      const items = cartRes.data?.items || [];
      setCartIds(items.map((i) => i.courseId));
      setCartCourses(items.map((i) => i.course));
    } catch {}
  };

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    loadUserData();
  }, []);

  const handleWishlistToggle = async (courseId) => {
    const isIn = wishlistIds.includes(courseId);
    try {
      if (isIn) {
        await RemoveFromWishlist(courseId);
        setWishlistIds((prev) => prev.filter((id) => id !== courseId));
        setWishlistCourses((prev) => prev.filter((c) => c.id !== courseId));
      } else {
        await AddToWishlist(courseId);
        setWishlistIds((prev) => [...prev, courseId]);
        const course = courses.find((c) => c.id === courseId);
        if (course) setWishlistCourses((prev) => [...prev, course]);
      }
    } catch {}
  };

  const handleCartToggle = async (courseId) => {
    const isIn = cartIds.includes(courseId);
    try {
      if (isIn) {
        await RemoveFromCart(courseId);
        setCartIds((prev) => prev.filter((id) => id !== courseId));
        setCartCourses((prev) => prev.filter((c) => c.id !== courseId));
      } else {
        await AddToCart(courseId);
        setCartIds((prev) => [...prev, courseId]);
        const course = courses.find((c) => c.id === courseId);
        if (course) setCartCourses((prev) => [...prev, course]);
      }
    } catch {}
  };

  const calculateProgress = (course, enrollment) => {
    if (!course || !enrollment) return 0;
    if (enrollment.completedAt) return 100;
    const totalLectures =
      course.sections?.reduce((acc, s) => acc + (s.lectures?.length || 0), 0) ||
      0;
    const completedLectures =
      enrollment.progress?.filter((p) => p.isCompleted).length || 0;
    if (!totalLectures) return 0;
    return Math.round((completedLectures / totalLectures) * 100);
  };

  const subTabs = [
    { key: "browse", label: "Browse" },
    {
      key: "cart",
      label: `Cart${cartIds.length ? ` (${cartIds.length})` : ""}`,
    },
    {
      key: "wishlist",
      label: `Wishlist${wishlistIds.length ? ` (${wishlistIds.length})` : ""}`,
    },
  ];

  return (
    <>
      <style>{`
        .browse-search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .browse-search-wrap {
          position: relative;
          flex: 1;
          min-width: 220px;
          max-width: 360px;
        }
        .browse-search-input {
          width: 100%;
          height: 40px;
          padding: 0 14px 0 40px;
          background: #f5f5f5;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 13.5px;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
          font-family: 'DM Sans', sans-serif;
          color: #111827;
        }
        .browse-search-input:focus {
          border-color: #6366f1;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .browse-search-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 14px;
          pointer-events: none;
        }
        .browse-filter-select {
          height: 40px;
          padding: 0 32px 0 12px;
          background: #f5f5f5;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          outline: none;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          color: #374151;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .browse-filter-select:focus {
          border-color: #6366f1;
          background-color: #fff;
        }
        .browse-results-badge {
          margin-left: auto;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .browse-filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: #ede9fe;
          border: 1px solid #c4b5fd;
          color: #5b21b6;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          margin-bottom: 14px;
          margin-right: 6px;
        }
        .browse-filter-chip:hover { background: #ddd6fe; }
        .browse-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 18px;
        }
        .browse-pagination {
          display: flex;
          justify-content: center;
          margin-top: 32px;
        }
        .sub-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 0;
        }
        .sub-tab {
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: none;
          color: #6b7280;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .sub-tab:hover { color: #4f46e5; }
        .sub-tab.active { color: #4f46e5; border-bottom-color: #4f46e5; }
      `}</style>

      {/* Sub tabs */}
      <div className="sub-tabs">
        {subTabs.map((t) => (
          <button
            key={t.key}
            className={`sub-tab ${activeSubTab === t.key ? "active" : ""}`}
            onClick={() => setActiveSubTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* BROWSE sub-tab */}
      {activeSubTab === "browse" && (
        <>
          <div className="browse-search-bar">
            <div className="browse-search-wrap">
              <SearchOutlined className="browse-search-icon" />
              <input
                className="browse-search-input"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => {
                  const value = e.target.value;
                  const hasSpecialChar = /[^a-zA-Z0-9_\- ]/.test(value);
                  if (hasSpecialChar) {
                    setSearchError("Special characters are not allowed.");
                  } else {
                    setSearchError("");
                  }
                  setSearch(value.replace(/[^a-zA-Z0-9_\- ]/g, ""));
                  setPage(1);
                }}
              />
              {searchError && (
                <span
                  style={{
                    position: "absolute",
                    top: "calc(100% + 3px)",
                    left: 0,
                    fontSize: 11,
                    color: "#ef4444",
                    fontWeight: 500,
                  }}
                >
                  {searchError}
                </span>
              )}
            </div>
            <select
              className="browse-filter-select"
              value={isFreeFilter ?? ""}
              onChange={(e) => {
                setIsFreeFilter(e.target.value || undefined);
                setPage(1);
              }}
            >
              <option value="">All Prices</option>
              <option value="true">Free</option>
              <option value="false">Paid</option>
            </select>
            <div className="browse-results-badge">
              {total} course{total !== 1 ? "s" : ""}
            </div>
          </div>

          {(search || isFreeFilter) && (
            <div>
              {search && (
                <span
                  className="browse-filter-chip"
                  onClick={() => setSearch("")}
                >
                  "{search}" <CloseOutlined style={{ fontSize: 10 }} />
                </span>
              )}
              {isFreeFilter && (
                <span
                  className="browse-filter-chip"
                  onClick={() => setIsFreeFilter(undefined)}
                >
                  {isFreeFilter === "true" ? "Free" : "Paid"}
                  <CloseOutlined style={{ fontSize: 10 }} />
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: 80 }}>
              <Spin size="large" />
            </div>
          ) : courses.length === 0 ? (
            <Empty description="No courses found" style={{ marginTop: 40 }} />
          ) : (
            <>
              <div className="browse-grid">
                {courses.map((course) => {
                  const enrollment = enrollmentMap[course.id];
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      mode={enrollment ? "enrolled" : "browse"}
                      progressPercent={calculateProgress(course, enrollment)}
                      isWishlisted={wishlistIds.includes(course.id)}
                      isInCart={cartIds.includes(course.id)}
                      onWishlistToggle={handleWishlistToggle}
                      onCartToggle={handleCartToggle}
                      basePath="/company"
                    />
                  );
                })}
              </div>
              <div className="browse-pagination">
                <Pagination
                  current={page}
                  total={total}
                  pageSize={limit}
                  onChange={setPage}
                  showSizeChanger={false}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* CART sub-tab */}
      {activeSubTab === "cart" && (
        <>
          {cartCourses.length === 0 ? (
            <Empty description="Your cart is empty" style={{ marginTop: 40 }} />
          ) : (
            <div className="browse-grid">
              {cartCourses.map(
                (course) =>
                  course && (
                    <CourseCard
                      key={course.id}
                      course={course}
                      mode="browse"
                      isWishlisted={wishlistIds.includes(course.id)}
                      isInCart={cartIds.includes(course.id)}
                      onWishlistToggle={handleWishlistToggle}
                      onCartToggle={handleCartToggle}
                      basePath="/company"
                    />
                  ),
              )}
            </div>
          )}
        </>
      )}

      {/* WISHLIST sub-tab */}
      {activeSubTab === "wishlist" && (
        <>
          {wishlistCourses.length === 0 ? (
            <Empty
              description="Your wishlist is empty"
              style={{ marginTop: 40 }}
            />
          ) : (
            <div className="browse-grid">
              {wishlistCourses.map(
                (course) =>
                  course && (
                    <CourseCard
                      key={course.id}
                      course={course}
                      mode="browse"
                      isWishlisted={wishlistIds.includes(course.id)}
                      isInCart={cartIds.includes(course.id)}
                      onWishlistToggle={handleWishlistToggle}
                      onCartToggle={handleCartToggle}
                      basePath="/company"
                    />
                  ),
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────
// My Learning tab for company — enrolled courses
// ─────────────────────────────────────────────────────────
const MyLearningTab = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await GetMyEnrollments();
        setEnrollments(res.data || []);
      } catch {
        message.error("Failed to load enrollments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <Empty
        description="You haven't enrolled in any courses yet."
        style={{ marginTop: 60 }}
      />
    );
  }

  return (
    <Row gutter={[20, 20]} style={{ marginTop: 8 }}>
      {enrollments.map((enrollment) => (
        <Col xs={24} sm={12} md={8} key={enrollment.enrollmentId}>
          {/* <CourseCard
            course={enrollment.course}
            mode="enrolled"
            progressPercent={enrollment.progressPercent}
          /> */}
          <CourseCard
            course={enrollment.course}
            mode="enrolled"
            progressPercent={enrollment.progressPercent}
            basePath="/company"
          />
        </Col>
      ))}
    </Row>
  );
};

// ─────────────────────────────────────────────────────────
// Main InstructorDashboard
// ─────────────────────────────────────────────────────────
const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-courses");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await GetMyCourses();
        setCourses(res.data || []);
      } catch {
        message.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const publishedCount = courses.filter((c) => c.status === "PUBLISHED").length;
  const draftCount = courses.filter((c) => c.status === "DRAFT").length;
  const totalEnrollments = courses.reduce(
    (sum, c) => sum + (c._count?.enrollments || 0),
    0,
  );

  const tabs = [
    {
      key: "my-courses",
      label: "My Courses",
      icon: <BookOutlined />,
    },
    {
      key: "browse",
      label: "Browse Courses",
      icon: <AppstoreOutlined />,
    },
    {
      key: "my-learning",
      label: "My Learning",
      icon: <PlaySquareOutlined />,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .id-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #f8f7ff;
        }

        .id-hero {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%);
          padding: 32px 32px 0;
          position: relative;
          overflow: hidden;
        }
        .id-hero::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 260px; height: 260px;
          background: rgba(167,139,250,0.12);
          border-radius: 50%;
        }
        .id-hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .id-hero-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .id-hero-title {
          font-family: 'Sora', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 4px;
          letter-spacing: -0.6px;
        }
        .id-hero-sub {
          color: #a5b4fc;
          font-size: 13px;
          margin: 0;
        }
        .id-create-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 22px;
          height: 42px;
          background: linear-gradient(135deg, #818cf8, #6366f1);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
          flex-shrink: 0;
        }
        .id-create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.45);
        }

        /* Stats strip */
        .id-stats-strip {
          display: flex;
          gap: 12px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .id-stat-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          backdrop-filter: blur(8px);
        }
        .id-stat-icon {
          width: 28px; height: 28px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
        }
        .id-stat-value {
          font-family: 'Sora', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }
        .id-stat-label {
          font-size: 11px;
          color: rgba(255,255,255,0.55);
          font-weight: 500;
          margin-top: 1px;
        }

        /* Tabs */
        .id-tabs {
          display: flex;
          gap: 4px;
          overflow-x: auto;
        }
        .id-tabs::-webkit-scrollbar { display: none; }
        .id-tab {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 12px 20px;
          border-radius: 12px 12px 0 0;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .id-tab:hover {
          color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.06);
        }
        .id-tab.active {
          color: #fff;
          background: rgba(255,255,255,0.1);
          border-bottom-color: #a78bfa;
        }

        /* Body */
        .id-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 28px 32px;
        }

        /* Course grid for my-courses */
        .id-courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .id-empty {
          text-align: center;
          padding: 80px 20px;
        }
        .id-empty-icon {
          width: 64px; height: 64px;
          background: linear-gradient(135deg, #ede9fe, #ddd6fe);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
          color: #7c3aed;
          margin: 0 auto 16px;
        }
        .id-empty-title {
          font-family: 'Sora', sans-serif;
          font-size: 18px; font-weight: 700;
          color: #1f2937; margin: 0 0 6px;
        }
        .id-empty-sub { font-size: 14px; color: #9ca3af; margin: 0 0 20px; }
        .id-empty-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 22px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          border: none; border-radius: 10px;
          color: #fff; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 700; cursor: pointer;
          transition: all 0.2s;
        }
        .id-empty-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.35); }
      `}</style>

      <div className="id-root">
        {/* Hero */}
        <div className="id-hero">
          <div className="id-hero-inner">
            <div className="id-hero-top">
              <div>
                <h1 className="id-hero-title">Courses</h1>
                <p className="id-hero-sub">
                  Create, manage and explore courses
                </p>
              </div>
              <button
                className="id-create-btn"
                onClick={() => navigate("/company/courses/create")}
              >
                <PlusOutlined style={{ fontSize: 13 }} />
                Create Course
              </button>
            </div>

            {/* Stats strip — only visible on my-courses tab */}
            {activeTab === "my-courses" && (
              <div className="id-stats-strip">
                {[
                  {
                    icon: "✅",
                    value: publishedCount,
                    label: "Published",
                    bg: "rgba(16,185,129,0.2)",
                  },
                  {
                    icon: "📝",
                    value: draftCount,
                    label: "Drafts",
                    bg: "rgba(245,158,11,0.2)",
                  },
                  // {
                  //   icon: "📚",
                  //   value: courses.length,
                  //   label: "Total Courses",
                  //   bg: "rgba(99,102,241,0.2)",
                  // },
                  // {
                  //   icon: "👥",
                  //   value: totalEnrollments,
                  //   label: "Enrollments",
                  //   bg: "rgba(167,139,250,0.2)",
                  // },
                ].map((s) => (
                  <div className="id-stat-pill" key={s.label}>
                    <div className="id-stat-icon" style={{ background: s.bg }}>
                      {s.icon}
                    </div>
                    <div>
                      <div className="id-stat-value">{s.value}</div>
                      <div className="id-stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="id-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`id-tab ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="id-body">
          {/* ── MY COURSES TAB ── */}
          {activeTab === "my-courses" && (
            <>
              {loading ? (
                <div style={{ textAlign: "center", padding: 80 }}>
                  <Spin size="large" />
                </div>
              ) : courses.length === 0 ? (
                <div className="id-empty">
                  <div className="id-empty-icon">
                    <BookOutlined />
                  </div>
                  <p className="id-empty-title">No courses yet</p>
                  <p className="id-empty-sub">
                    Create your first course to get started
                  </p>
                  <button
                    className="id-empty-btn"
                    onClick={() => navigate("/company/courses/create")}
                  >
                    <PlusOutlined style={{ fontSize: 12 }} />
                    Create Your First Course
                  </button>
                </div>
              ) : (
                <div className="id-courses-grid">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      mode="instructor"
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── BROWSE TAB ── */}
          {activeTab === "browse" && <BrowseCoursesTab />}

          {/* ── MY LEARNING TAB ── */}
          {activeTab === "my-learning" && <MyLearningTab />}
        </div>
      </div>
    </>
  );
};

export default InstructorDashboard;
