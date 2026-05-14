// import { useState, useEffect, useCallback } from "react";
// import {
//   Row,
//   Col,
//   Input,
//   Select,
//   Empty,
//   Spin,
//   Typography,
//   Pagination,
//   Space,
//   Tabs,
//   Badge,
// } from "antd";
// import {
//   SearchOutlined,
//   BookOutlined,
//   HeartOutlined,
//   ShoppingCartOutlined,
// } from "@ant-design/icons";
// import CourseCard from "../components/CourseCard.jsx";
// import {
//   GetAllCourses,
//   GetMyEnrollments,
//   GetWishlist,
//   GetCart,
//   AddToWishlist,
//   RemoveFromWishlist,
//   AddToCart,
//   RemoveFromCart,
// } from "../api/courseApi.js";

// const { Title, Text } = Typography;
// const { Option } = Select;

// const CoursePage = () => {
//   const [courses, setCourses] = useState([]);
//   const [enrollments, setEnrollments] = useState([]);
//   const [wishlistIds, setWishlistIds] = useState([]);
//   const [cartIds, setCartIds] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [isFreeFilter, setIsFreeFilter] = useState(undefined);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [activeTab, setActiveTab] = useState("browse");
//   const [searchError, setSearchError] = useState("");

//   const enrollmentMap = {};

//   enrollments.forEach((e) => {
//     if (e.course?.id) {
//       enrollmentMap[e.course.id] = e;
//     }
//   });

//   const limit = 12;
//   // const enrolledCourses = courses.filter((c) => enrollments.includes(c.id));
//   const enrolledCourses = enrollments.map((e) => e.course).filter(Boolean);

//   // const displayCourses = activeTab === "browse" ? courses : enrolledCourses;
//   const cartCourses = courses.filter((course) => cartIds.includes(course.id));
//   const wishlistCourses = courses.filter((course) =>
//     wishlistIds.includes(course.id),
//   );

//   // const displayCourses =
//   //   activeTab === "browse"
//   //     ? courses
//   //     : activeTab === "enrolled"
//   //       ? enrolledCourses
//   //       : cartCourses;

//   // const displayCourses =
//   //   activeTab === "browse"
//   //     ? courses
//   //     : activeTab === "enrolled"
//   //       ? enrolledCourses
//   //       : activeTab === "wishlist"
//   //         ? wishlistCourses
//   //         : cartCourses;
//   const currentCourses =
//     activeTab === "browse"
//       ? courses
//       : activeTab === "enrolled"
//         ? enrolledCourses
//         : activeTab === "wishlist"
//           ? wishlistCourses
//           : cartCourses;

//   // const displayCourses = currentCourses.filter((course) =>
//   //   course?.title?.toLowerCase().includes(search.toLowerCase()),
//   // );

//   const displayCourses = currentCourses.filter((course) => {
//     // ✅ Search filter
//     const matchesSearch = course?.title
//       ?.toLowerCase()
//       .includes(search.toLowerCase());

//     // ✅ Price filter
//     let matchesPrice = true;

//     if (isFreeFilter === "true") {
//       matchesPrice = course?.isFree === true;
//     }

//     if (isFreeFilter === "false") {
//       matchesPrice = course?.isFree === false;
//     }

//     return matchesSearch && matchesPrice;
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
//       // setEnrollments(
//       //   (enrollRes.data || []).map((e) => e.course?.id).filter(Boolean),
//       // );
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
//     } catch {
//       // Silent fail
//     }
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
//     } catch {
//       // Silent fail
//     }
//   };

//   const calculateProgress = (course, enrollment) => {
//     if (!course || !enrollment) return 0;

//     // ✅ If completed → 100%
//     if (enrollment.completedAt) return 100;

//     // const totalLectures = course.sections?.reduce(
//     //   (acc, s) => acc + (s.lectures?.length || 0),
//     //   0,
//     // );
//     const totalLectures =
//       course.sections?.reduce((acc, s) => acc + (s.lectures?.length || 0), 0) ||
//       0;

//     const completedLectures =
//       enrollment.progress?.filter((p) => p.isCompleted).length || 0;

//     if (!totalLectures) return 0;

//     return Math.round((completedLectures / totalLectures) * 100);
//   };

//   return (
//     <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
//       {/* Header */}
//       <div style={{ marginBottom: 24 }}>
//         <Title level={3} style={{ margin: 0 }}>
//           <BookOutlined style={{ marginRight: 8, color: "#1677ff" }} />
//           Courses
//         </Title>
//         <Text type="secondary">
//           Upskill with Salesforce courses built for you
//         </Text>
//       </div>

//       {/* Filters */}
//       <div
//         style={{
//           display: "flex",
//           gap: 12,
//           marginBottom: 24,
//           flexWrap: "wrap",
//           alignItems: "center",
//         }}
//       >
//         <div
//           style={{
//             position: "relative",
//             width: 280,
//           }}
//         >
//           <Input
//             prefix={<SearchOutlined />}
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

//               const validatedValue = value.replace(/[^a-zA-Z0-9_\- ]/g, "");

//               setSearch(validatedValue);
//               setPage(1);
//             }}
//             allowClear
//             status={searchError ? "error" : ""}
//           />

//           {searchError && (
//             <Text
//               type="danger"
//               style={{
//                 position: "absolute",
//                 top: "100%",
//                 left: 0,
//                 marginTop: 4,
//                 fontSize: 12,
//                 whiteSpace: "nowrap",
//               }}
//             >
//               {searchError}
//             </Text>
//           )}
//         </div>
//         <Select
//           placeholder="Filter by price"
//           value={isFreeFilter}
//           onChange={(val) => {
//             setIsFreeFilter(val);
//             setPage(1);
//           }}
//           style={{ width: 160 }}
//           allowClear
//         >
//           <Option value="true">Free</Option>
//           <Option value="false">Paid</Option>
//         </Select>
//         <Text type="secondary" style={{ marginLeft: "auto" }}>
//           {total} course{total !== 1 ? "s" : ""} found
//         </Text>
//       </div>

//       {/* Tab: Browse / My Learning */}
//       <Tabs
//         activeKey={activeTab}
//         onChange={setActiveTab}
//         style={{ marginBottom: 24 }}
//         items={[
//           {
//             key: "browse",
//             label: (
//               <span>
//                 <BookOutlined /> Browse
//               </span>
//             ),
//           },
//           {
//             key: "enrolled",
//             label: (
//               <span>
//                 <Badge count={enrollments.length} size="small">
//                   My Learning
//                 </Badge>
//               </span>
//             ),
//           },
//           {
//             key: "cart",
//             label: (
//               <span>
//                 <Badge count={cartIds.length} size="small">
//                   <ShoppingCartOutlined /> Cart
//                 </Badge>
//               </span>
//             ),
//           },
//           {
//             key: "wishlist",
//             label: (
//               <span>
//                 <Badge count={wishlistIds.length} size="small">
//                   <HeartOutlined /> Wishlist
//                 </Badge>
//               </span>
//             ),
//           },
//         ]}
//       />

//       {loading ? (
//         <div style={{ textAlign: "center", padding: 80 }}>
//           <Spin size="large" />
//         </div>
//       ) : // courses.length === 0 ? (
//       displayCourses.length === 0 ? (
//         <Empty description="No courses found" style={{ marginTop: 60 }} />
//       ) : (
//         <>
//           <Row gutter={[20, 20]}>
//             {
//               // displayCourses.map((course) => {
//               displayCourses?.map((course) => {
//                 const enrollment = enrollmentMap[course.id]; // ✅ HERE

//                 return (
//                   <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
//                     <CourseCard
//                       course={course}
//                       mode={enrollment ? "enrolled" : "browse"}
//                       progressPercent={calculateProgress(course, enrollment)}
//                       isWishlisted={wishlistIds.includes(course.id)}
//                       isInCart={cartIds.includes(course.id)}
//                       onWishlistToggle={handleWishlistToggle}
//                       onCartToggle={handleCartToggle}
//                     />
//                   </Col>
//                 );
//               })
//             }
//           </Row>

//           <div style={{ textAlign: "center", marginTop: 32 }}>
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
//     </div>
//   );
// };

// export default CoursePage;

// import { useState, useEffect, useCallback } from "react";
// import { Spin, Pagination } from "antd";
// import {
//   SearchOutlined,
//   BookOutlined,
//   HeartOutlined,
//   ShoppingCartOutlined,
//   AppstoreOutlined,
//   PlaySquareOutlined,
//   FilterOutlined,
//   CloseOutlined,
// } from "@ant-design/icons";
// import CourseCard from "../components/CourseCard.jsx";
// import {
//   GetAllCourses,
//   GetMyEnrollments,
//   GetWishlist,
//   GetCart,
//   AddToWishlist,
//   RemoveFromWishlist,
//   AddToCart,
//   RemoveFromCart,
// } from "../api/courseApi.js";

// const CoursePage = () => {
//   const [courses, setCourses] = useState([]);
//   const [enrollments, setEnrollments] = useState([]);
//   const [wishlistIds, setWishlistIds] = useState([]);
//   const [cartIds, setCartIds] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [isFreeFilter, setIsFreeFilter] = useState(undefined);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [activeTab, setActiveTab] = useState("browse");
//   const [searchError, setSearchError] = useState("");

//   const enrollmentMap = {};
//   enrollments.forEach((e) => {
//     if (e.course?.id) enrollmentMap[e.course.id] = e;
//   });

//   const limit = 12;
//   const enrolledCourses = enrollments.map((e) => e.course).filter(Boolean);
//   const cartCourses = courses.filter((course) => cartIds.includes(course.id));
//   const wishlistCourses = courses.filter((course) =>
//     wishlistIds.includes(course.id),
//   );

//   const currentCourses =
//     activeTab === "browse"
//       ? courses
//       : activeTab === "enrolled"
//         ? enrolledCourses
//         : activeTab === "wishlist"
//           ? wishlistCourses
//           : cartCourses;

//   const displayCourses = currentCourses.filter((course) => {
//     const matchesSearch = course?.title
//       ?.toLowerCase()
//       .includes(search.toLowerCase());
//     let matchesPrice = true;
//     if (isFreeFilter === "true") matchesPrice = course?.isFree === true;
//     if (isFreeFilter === "false") matchesPrice = course?.isFree === false;
//     return matchesSearch && matchesPrice;
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

//   const tabs = [
//     {
//       key: "browse",
//       label: "Browse",
//       icon: <AppstoreOutlined />,
//       count: null,
//     },
//     {
//       key: "enrolled",
//       label: "My Learning",
//       icon: <PlaySquareOutlined />,
//       count: enrollments.length,
//     },
//     {
//       key: "cart",
//       label: "Cart",
//       icon: <ShoppingCartOutlined />,
//       count: cartIds.length,
//     },
//     {
//       key: "wishlist",
//       label: "Wishlist",
//       icon: <HeartOutlined />,
//       count: wishlistIds.length,
//     },
//   ];

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

//         .cp-root {
//           font-family: 'DM Sans', sans-serif;
//           min-height: 100vh;
//           background: #f8f7ff;
//         }

//         .cp-hero {
//           background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%);
//           padding: 40px 32px 0;
//           position: relative;
//           overflow: hidden;
//         }
//         .cp-hero::before {
//           content: '';
//           position: absolute;
//           top: -60px;
//           right: -60px;
//           width: 300px;
//           height: 300px;
//           background: rgba(167, 139, 250, 0.12);
//           border-radius: 50%;
//         }
//         .cp-hero::after {
//           content: '';
//           position: absolute;
//           bottom: 20px;
//           left: 40%;
//           width: 160px;
//           height: 160px;
//           background: rgba(99, 102, 241, 0.1);
//           border-radius: 50%;
//         }

//         .cp-hero-inner {
//           max-width: 1200px;
//           margin: 0 auto;
//           position: relative;
//           z-index: 1;
//         }

//         .cp-eyebrow {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           background: rgba(167, 139, 250, 0.2);
//           border: 1px solid rgba(167, 139, 250, 0.3);
//           color: #c4b5fd;
//           font-size: 11px;
//           font-weight: 600;
//           letter-spacing: 1.5px;
//           text-transform: uppercase;
//           padding: 5px 12px;
//           border-radius: 999px;
//           margin-bottom: 16px;
//         }

//         .cp-hero-title {
//           font-family: 'Sora', sans-serif;
//           font-size: 36px;
//           font-weight: 800;
//           color: #ffffff;
//           margin: 0 0 8px;
//           line-height: 1.15;
//           letter-spacing: -1px;
//         }
//         .cp-hero-title span {
//           background: linear-gradient(90deg, #a78bfa, #f472b6);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           background-clip: text;
//         }

//         .cp-hero-sub {
//           color: #a5b4fc;
//           font-size: 14px;
//           margin-bottom: 28px;
//           font-weight: 400;
//         }

//         .cp-search-bar {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           flex-wrap: wrap;
//           margin-bottom: 28px;
//         }

//         .cp-search-wrap {
//           position: relative;
//           flex: 1;
//           min-width: 240px;
//           max-width: 400px;
//         }
//         .cp-search-input {
//           width: 100%;
//           height: 44px;
//           padding: 0 16px 0 44px;
//           background: rgba(255,255,255,0.08);
//           border: 1.5px solid rgba(255,255,255,0.15);
//           border-radius: 12px;
//           color: white;
//           font-family: 'DM Sans', sans-serif;
//           font-size: 14px;
//           outline: none;
//           transition: all 0.2s ease;
//           backdrop-filter: blur(8px);
//           box-sizing: border-box;
//         }
//         .cp-search-input::placeholder { color: rgba(255,255,255,0.4); }
//         .cp-search-input:focus {
//           border-color: rgba(167,139,250,0.6);
//           background: rgba(255,255,255,0.12);
//           box-shadow: 0 0 0 3px rgba(167,139,250,0.15);
//         }
//         .cp-search-icon {
//           position: absolute;
//           left: 14px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: rgba(255,255,255,0.4);
//           font-size: 15px;
//           pointer-events: none;
//         }
//         .cp-search-error {
//           position: absolute;
//           top: calc(100% + 4px);
//           left: 0;
//           font-size: 11px;
//           color: #fca5a5;
//           font-weight: 500;
//         }

//         .cp-filter-select {
//           height: 44px;
//           padding: 0 14px;
//           background: rgba(255,255,255,0.08);
//           border: 1.5px solid rgba(255,255,255,0.15);
//           border-radius: 12px;
//           color: white;
//           font-family: 'DM Sans', sans-serif;
//           font-size: 13px;
//           font-weight: 500;
//           outline: none;
//           cursor: pointer;
//           backdrop-filter: blur(8px);
//           transition: all 0.2s ease;
//           appearance: none;
//           background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
//           background-repeat: no-repeat;
//           background-position: right 10px center;
//           padding-right: 30px;
//         }
//         .cp-filter-select option { background: #312e81; color: white; }
//         .cp-filter-select:focus {
//           border-color: rgba(167,139,250,0.6);
//         }

//         .cp-results-badge {
//           margin-left: auto;
//           background: rgba(255,255,255,0.1);
//           border: 1px solid rgba(255,255,255,0.15);
//           color: rgba(255,255,255,0.7);
//           font-size: 12px;
//           font-weight: 600;
//           padding: 6px 14px;
//           border-radius: 999px;
//           white-space: nowrap;
//         }

//         .cp-tabs {
//           display: flex;
//           gap: 4px;
//           border-bottom: none;
//           overflow-x: auto;
//         }
//         .cp-tabs::-webkit-scrollbar { display: none; }

//         .cp-tab {
//           display: flex;
//           align-items: center;
//           gap: 7px;
//           padding: 12px 20px;
//           border-radius: 12px 12px 0 0;
//           cursor: pointer;
//           font-family: 'DM Sans', sans-serif;
//           font-size: 13px;
//           font-weight: 600;
//           color: rgba(255,255,255,0.55);
//           background: transparent;
//           border: none;
//           border-bottom: 3px solid transparent;
//           transition: all 0.2s ease;
//           white-space: nowrap;
//           position: relative;
//         }
//         .cp-tab:hover {
//           color: rgba(255,255,255,0.85);
//           background: rgba(255,255,255,0.06);
//         }
//         .cp-tab.active {
//           color: #ffffff;
//           background: rgba(255,255,255,0.1);
//           border-bottom-color: #a78bfa;
//         }

//         .cp-tab-count {
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           min-width: 20px;
//           height: 20px;
//           padding: 0 6px;
//           background: rgba(167,139,250,0.25);
//           color: #c4b5fd;
//           border-radius: 999px;
//           font-size: 11px;
//           font-weight: 700;
//         }
//         .cp-tab.active .cp-tab-count {
//           background: #7c3aed;
//           color: white;
//         }

//         .cp-body {
//           max-width: 1200px;
//           margin: 0 auto;
//           padding: 32px;
//         }

//         .cp-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
//           gap: 20px;
//           animation: fadeInUp 0.4s ease both;
//         }

//         @keyframes fadeInUp {
//           from { opacity: 0; transform: translateY(16px); }
//           to { opacity: 1; transform: translateY(0); }
//         }

//         .cp-empty {
//           text-align: center;
//           padding: 80px 20px;
//           animation: fadeInUp 0.3s ease;
//         }
//         .cp-empty-icon {
//           width: 72px;
//           height: 72px;
//           background: linear-gradient(135deg, #ede9fe, #ddd6fe);
//           border-radius: 20px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 28px;
//           color: #7c3aed;
//           margin: 0 auto 16px;
//         }
//         .cp-empty-title {
//           font-family: 'Sora', sans-serif;
//           font-size: 18px;
//           font-weight: 700;
//           color: #1f2937;
//           margin: 0 0 6px;
//         }
//         .cp-empty-sub {
//           font-size: 14px;
//           color: #9ca3af;
//           margin: 0;
//         }

//         .cp-loader {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           min-height: 300px;
//           gap: 16px;
//         }
//         .cp-loader-text {
//           font-size: 14px;
//           color: #9ca3af;
//           font-weight: 500;
//         }

//         .cp-pagination {
//           display: flex;
//           justify-content: center;
//           margin-top: 40px;
//           padding-bottom: 20px;
//         }

//         .cp-active-filters {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           flex-wrap: wrap;
//           margin-bottom: 20px;
//         }
//         .cp-filter-chip {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 5px 12px;
//           background: #ede9fe;
//           border: 1px solid #c4b5fd;
//           color: #5b21b6;
//           border-radius: 999px;
//           font-size: 12px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.15s;
//         }
//         .cp-filter-chip:hover { background: #ddd6fe; }
//         .cp-filter-chip svg { font-size: 10px; }

//         .cp-section-header {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin-bottom: 20px;
//         }
//         .cp-section-title {
//           font-family: 'Sora', sans-serif;
//           font-size: 18px;
//           font-weight: 700;
//           color: #111827;
//           margin: 0;
//         }
//         .cp-section-count {
//           font-size: 13px;
//           color: #9ca3af;
//           font-weight: 500;
//         }
//       `}</style>

//       <div className="cp-root">
//         {/* Hero header */}
//         <div className="cp-hero">
//           <div className="cp-hero-inner">
//             <div className="cp-eyebrow">
//               <BookOutlined style={{ fontSize: 10 }} />
//               Learning Platform
//             </div>
//             <h1 className="cp-hero-title">
//               Explore <span>Courses</span>
//             </h1>
//             <p className="cp-hero-sub">
//               Upskill with industry-leading courses built for professionals
//             </p>

//             {/* Search & filter bar */}
//             <div className="cp-search-bar">
//               <div className="cp-search-wrap">
//                 <SearchOutlined className="cp-search-icon" />
//                 <input
//                   className="cp-search-input"
//                   placeholder="Search courses..."
//                   value={search}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     const hasSpecialChar = /[^a-zA-Z0-9_\- ]/.test(value);
//                     if (hasSpecialChar) {
//                       setSearchError("Special characters are not allowed.");
//                     } else {
//                       setSearchError("");
//                     }
//                     const validatedValue = value.replace(
//                       /[^a-zA-Z0-9_\- ]/g,
//                       "",
//                     );
//                     setSearch(validatedValue);
//                     setPage(1);
//                   }}
//                 />
//                 {searchError && (
//                   <span className="cp-search-error">{searchError}</span>
//                 )}
//               </div>

//               <select
//                 className="cp-filter-select"
//                 value={isFreeFilter ?? ""}
//                 onChange={(e) => {
//                   setIsFreeFilter(e.target.value || undefined);
//                   setPage(1);
//                 }}
//               >
//                 <option value="">All Prices</option>
//                 <option value="true">Free</option>
//                 <option value="false">Paid</option>
//               </select>

//               <div className="cp-results-badge">
//                 {total} course{total !== 1 ? "s" : ""} found
//               </div>
//             </div>

//             {/* Tabs */}
//             <div className="cp-tabs">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab.key}
//                   className={`cp-tab ${activeTab === tab.key ? "active" : ""}`}
//                   onClick={() => setActiveTab(tab.key)}
//                 >
//                   {tab.icon}
//                   {tab.label}
//                   {tab.count > 0 && (
//                     <span className="cp-tab-count">{tab.count}</span>
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="cp-body">
//           {/* Active filters */}
//           {(search || isFreeFilter) && (
//             <div className="cp-active-filters">
//               {search && (
//                 <span className="cp-filter-chip" onClick={() => setSearch("")}>
//                   "{search}"
//                   <CloseOutlined />
//                 </span>
//               )}
//               {isFreeFilter && (
//                 <span
//                   className="cp-filter-chip"
//                   onClick={() => setIsFreeFilter(undefined)}
//                 >
//                   {isFreeFilter === "true" ? "Free" : "Paid"}
//                   <CloseOutlined />
//                 </span>
//               )}
//             </div>
//           )}

//           {/* Section header */}
//           {!loading && displayCourses.length > 0 && (
//             <div className="cp-section-header">
//               <h2 className="cp-section-title">
//                 {activeTab === "browse" && "All Courses"}
//                 {activeTab === "enrolled" && "My Learning"}
//                 {activeTab === "cart" && "Cart"}
//                 {activeTab === "wishlist" && "Wishlist"}
//               </h2>
//               <span className="cp-section-count">
//                 {displayCourses.length} course
//                 {displayCourses.length !== 1 ? "s" : ""}
//               </span>
//             </div>
//           )}

//           {/* Content */}
//           {loading ? (
//             <div className="cp-loader">
//               <Spin size="large" />
//               <p className="cp-loader-text">Loading courses...</p>
//             </div>
//           ) : displayCourses.length === 0 ? (
//             <div className="cp-empty">
//               <div className="cp-empty-icon">
//                 <BookOutlined />
//               </div>
//               <p className="cp-empty-title">No courses found</p>
//               <p className="cp-empty-sub">
//                 {search
//                   ? `No results for "${search}". Try a different keyword.`
//                   : activeTab === "enrolled"
//                     ? "You haven't enrolled in any courses yet."
//                     : activeTab === "cart"
//                       ? "Your cart is empty."
//                       : activeTab === "wishlist"
//                         ? "No courses in your wishlist yet."
//                         : "No courses available at the moment."}
//               </p>
//             </div>
//           ) : (
//             <>
//               <div className="cp-grid">
//                 {displayCourses.map((course) => {
//                   const enrollment = enrollmentMap[course.id];
//                   return (
//                     <CourseCard
//                       key={course.id}
//                       course={course}
//                       mode={enrollment ? "enrolled" : "browse"}
//                       progressPercent={calculateProgress(course, enrollment)}
//                       isWishlisted={wishlistIds.includes(course.id)}
//                       isInCart={cartIds.includes(course.id)}
//                       onWishlistToggle={handleWishlistToggle}
//                       onCartToggle={handleCartToggle}
//                     />
//                   );
//                 })}
//               </div>

//               <div className="cp-pagination">
//                 <Pagination
//                   current={page}
//                   total={total}
//                   pageSize={limit}
//                   onChange={setPage}
//                   showSizeChanger={false}
//                 />
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default CoursePage;

import { useState, useEffect, useCallback } from "react";
import { Spin, Pagination, message } from "antd";
import {
  SearchOutlined,
  BookOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  PlaySquareOutlined,
  CloseOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CourseCard from "../components/CourseCard.jsx";
import {
  GetAllCourses,
  GetMyEnrollments,
  GetWishlist,
  GetCart,
  AddToWishlist,
  RemoveFromWishlist,
  AddToCart,
  RemoveFromCart,
  GetMyCourses,
  DeleteCourse,
} from "../api/courseApi.js";

// ─────────────────────────────────────────────────────────
// Create Course tab — candidate's own instructor view
// ─────────────────────────────────────────────────────────
const CreateCourseTab = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // const handleDeleteCourse = async (courseId) => {
  //   console.log("DELETE FUNCTION CALLED", courseId);

  //   try {
  //     const res = await DeleteCourse(courseId);

  //     console.log("DELETE RESPONSE", res);

  //     message.success("Course deleted successfully");

  //     setCourses((prev) => prev.filter((c) => c.id !== courseId));
  //   } catch (error) {
  //     console.error("DELETE ERROR", error);

  //     message.error(
  //       error?.response?.data?.message || "Failed to delete course",
  //     );
  //   }
  // };
  const handleDeleteCourse = async (courseId) => {
    console.log("STEP 1 - handleDeleteCourse called with:", courseId);
    try {
      console.log("STEP 2 - calling DeleteCourse API");
      const res = await DeleteCourse(courseId);
      console.log("STEP 3 - API response:", res);
      message.success("Course deleted successfully");
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (error) {
      console.log("STEP 4 - ERROR:", error);
      console.log("STEP 5 - status:", error?.response?.status);
      console.log("STEP 6 - message:", error?.response?.data);
      message.error(
        error?.response?.data?.message || "Failed to delete course",
      );
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await GetMyCourses();
        setCourses(res.data || []);
      } catch {
        // Not authorized or no courses yet — silently ignore
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

  console.log("courses in CreateCourseTab:", courses);
  console.log("handleDeleteCourse:", handleDeleteCourse);

  return (
    <>
      <style>{`
        .cct-stats-row {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .cct-stat-card {
          flex: 1;
          min-width: 120px;
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 14px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .cct-stat-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .cct-stat-value {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 800;
          line-height: 1;
          margin: 0 0 2px;
        }
        .cct-stat-label {
          font-size: 11.5px;
          color: #9ca3af;
          font-weight: 500;
          margin: 0;
        }
        .cct-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .cct-section-title {
          font-family: 'Sora', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .cct-create-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 20px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(99,102,241,0.3);
        }
        .cct-create-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(99,102,241,0.4);
        }
        .cct-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 18px;
        }
        .cct-empty {
          text-align: center;
          padding: 60px 20px;
          background: #fff;
          border-radius: 16px;
          border: 1px dashed #e5e7eb;
        }
        .cct-empty-icon {
          width: 64px; height: 64px;
          background: linear-gradient(135deg, #ede9fe, #ddd6fe);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; color: #7c3aed;
          margin: 0 auto 14px;
        }
        .cct-empty-title {
          font-family: 'Sora', sans-serif;
          font-size: 17px; font-weight: 700;
          color: #1f2937; margin: 0 0 6px;
        }
        .cct-empty-sub { font-size: 13px; color: #9ca3af; margin: 0 0 18px; }
      `}</style>

      {/* Stats */}
      {!loading && (
        <div className="cct-stats-row">
          {[
            {
              icon: "✅",
              value: publishedCount,
              label: "Published",
              bg: "rgba(16,185,129,0.12)",
              color: "#10b981",
            },
            {
              icon: "📝",
              value: draftCount,
              label: "Drafts",
              bg: "rgba(245,158,11,0.12)",
              color: "#f59e0b",
            },
            // {
            //   icon: "📚",
            //   value: courses.length,
            //   label: "Total Courses",
            //   bg: "rgba(99,102,241,0.12)",
            //   color: "#6366f1",
            // },
            // {
            //   icon: "👥",
            //   value: totalEnrollments,
            //   label: "Total Enrollments",
            //   bg: "rgba(139,92,246,0.12)",
            //   color: "#7c3aed",
            // },
          ].map((s) => (
            <div className="cct-stat-card" key={s.label}>
              <div className="cct-stat-icon" style={{ background: s.bg }}>
                {s.icon}
              </div>
              <div>
                <p className="cct-stat-value" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="cct-stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header row */}
      <div className="cct-header-row">
        <h2 className="cct-section-title">My Courses</h2>
        <button
          className="cct-create-btn"
          onClick={() => navigate("/candidate/courses/create")}
        >
          <PlusOutlined style={{ fontSize: 12 }} />
          Create Course
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : courses.length === 0 ? (
        <div className="cct-empty">
          <div className="cct-empty-icon">
            <BookOutlined />
          </div>
          <p className="cct-empty-title">No courses yet</p>
          <p className="cct-empty-sub">
            Create your first course and start teaching
          </p>
          <button
            className="cct-create-btn"
            onClick={() => navigate("/candidate/courses/create")}
          >
            <PlusOutlined style={{ fontSize: 12 }} />
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="cct-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              mode="instructor"
              onDelete={(id) => console.log("DIRECT DELETE", id)}
            />
          ))}
        </div>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────
// Main CoursePage
// ─────────────────────────────────────────────────────────
const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [cartIds, setCartIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isFreeFilter, setIsFreeFilter] = useState(undefined);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState("browse");
  const [searchError, setSearchError] = useState("");

  const enrollmentMap = {};
  enrollments.forEach((e) => {
    if (e.course?.id) enrollmentMap[e.course.id] = e;
  });

  const limit = 12;
  const enrolledCourses = enrollments.map((e) => e.course).filter(Boolean);
  const cartCourses = courses.filter((course) => cartIds.includes(course.id));
  const wishlistCourses = courses.filter((course) =>
    wishlistIds.includes(course.id),
  );

  const currentCourses =
    activeTab === "browse"
      ? courses
      : activeTab === "enrolled"
        ? enrolledCourses
        : activeTab === "wishlist"
          ? wishlistCourses
          : cartCourses;

  const displayCourses = currentCourses.filter((course) => {
    const matchesSearch = course?.title
      ?.toLowerCase()
      .includes(search.toLowerCase());
    let matchesPrice = true;
    if (isFreeFilter === "true") matchesPrice = course?.isFree === true;
    if (isFreeFilter === "false") matchesPrice = course?.isFree === false;
    return matchesSearch && matchesPrice;
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

  const loadUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const [enrollRes, wishRes, cartRes] = await Promise.all([
        GetMyEnrollments(),
        GetWishlist(),
        GetCart(),
      ]);
      setEnrollments(enrollRes.data || []);
      setWishlistIds((wishRes.data?.items || []).map((i) => i.courseId));
      setCartIds((cartRes.data?.items || []).map((i) => i.courseId));
    } catch {
      // Not logged in
    }
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
      } else {
        await AddToWishlist(courseId);
        setWishlistIds((prev) => [...prev, courseId]);
      }
    } catch {}
  };

  const handleCartToggle = async (courseId) => {
    const isIn = cartIds.includes(courseId);
    try {
      if (isIn) {
        await RemoveFromCart(courseId);
        setCartIds((prev) => prev.filter((id) => id !== courseId));
      } else {
        await AddToCart(courseId);
        setCartIds((prev) => [...prev, courseId]);
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

  const tabs = [
    {
      key: "browse",
      label: "Browse",
      icon: <AppstoreOutlined />,
      count: null,
    },
    {
      key: "enrolled",
      label: "My Learning",
      icon: <PlaySquareOutlined />,
      count: enrollments.length,
    },
    {
      key: "cart",
      label: "Cart",
      icon: <ShoppingCartOutlined />,
      count: cartIds.length,
    },
    {
      key: "wishlist",
      label: "Wishlist",
      icon: <HeartOutlined />,
      count: wishlistIds.length,
    },
    {
      key: "create",
      label: "Create Course",
      icon: <PlusOutlined />,
      count: null,
    },
  ];

  // Tabs that show the search/filter bar
  const showFilterBar = ["browse", "enrolled", "cart", "wishlist"].includes(
    activeTab,
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

        .cp-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #f8f7ff;
        }

        .cp-hero {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%);
          padding: 40px 32px 0;
          position: relative;
          overflow: hidden;
        }
        .cp-hero::before {
          content: '';
          position: absolute;
          top: -60px;
          right: -60px;
          width: 300px;
          height: 300px;
          background: rgba(167, 139, 250, 0.12);
          border-radius: 50%;
        }
        .cp-hero::after {
          content: '';
          position: absolute;
          bottom: 20px;
          left: 40%;
          width: 160px;
          height: 160px;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 50%;
        }

        .cp-hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .cp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(167, 139, 250, 0.2);
          border: 1px solid rgba(167, 139, 250, 0.3);
          color: #c4b5fd;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 999px;
          margin-bottom: 16px;
        }

        .cp-hero-title {
          font-family: 'Sora', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 8px;
          line-height: 1.15;
          letter-spacing: -1px;
        }
        .cp-hero-title span {
          background: linear-gradient(90deg, #a78bfa, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cp-hero-sub {
          color: #a5b4fc;
          font-size: 14px;
          margin-bottom: 28px;
          font-weight: 400;
        }

        .cp-search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .cp-search-wrap {
          position: relative;
          flex: 1;
          min-width: 240px;
          max-width: 400px;
        }
        .cp-search-input {
          width: 100%;
          height: 44px;
          padding: 0 16px 0 44px;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
          box-sizing: border-box;
        }
        .cp-search-input::placeholder { color: rgba(255,255,255,0.4); }
        .cp-search-input:focus {
          border-color: rgba(167,139,250,0.6);
          background: rgba(255,255,255,0.12);
          box-shadow: 0 0 0 3px rgba(167,139,250,0.15);
        }
        .cp-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.4);
          font-size: 15px;
          pointer-events: none;
        }
        .cp-search-error {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          font-size: 11px;
          color: #fca5a5;
          font-weight: 500;
        }

        .cp-filter-select {
          height: 44px;
          padding: 0 14px;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          outline: none;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 30px;
        }
        .cp-filter-select option { background: #312e81; color: white; }
        .cp-filter-select:focus {
          border-color: rgba(167,139,250,0.6);
        }

        .cp-results-badge {
          margin-left: auto;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.7);
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .cp-tabs {
          display: flex;
          gap: 4px;
          border-bottom: none;
          overflow-x: auto;
        }
        .cp-tabs::-webkit-scrollbar { display: none; }

        .cp-tab {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 12px 20px;
          border-radius: 12px 12px 0 0;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.55);
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
          white-space: nowrap;
          position: relative;
        }
        .cp-tab:hover {
          color: rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.06);
        }
        .cp-tab.active {
          color: #ffffff;
          background: rgba(255,255,255,0.1);
          border-bottom-color: #a78bfa;
        }

        /* Special styling for Create Course tab */
        .cp-tab.create-tab {
          color: rgba(167,139,250,0.8);
          border: 1px solid rgba(167,139,250,0.3);
          border-bottom: 3px solid transparent;
          border-radius: 12px 12px 0 0;
          background: rgba(167,139,250,0.08);
        }
        .cp-tab.create-tab:hover {
          color: #c4b5fd;
          background: rgba(167,139,250,0.15);
        }
        .cp-tab.create-tab.active {
          color: #fff;
          background: rgba(167,139,250,0.2);
          border-bottom-color: #a78bfa;
        }

        .cp-tab-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: rgba(167,139,250,0.25);
          color: #c4b5fd;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
        }
        .cp-tab.active .cp-tab-count {
          background: #7c3aed;
          color: white;
        }

        .cp-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px;
        }

        .cp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
          animation: fadeInUp 0.4s ease both;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .cp-empty {
          text-align: center;
          padding: 80px 20px;
          animation: fadeInUp 0.3s ease;
        }
        .cp-empty-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #ede9fe, #ddd6fe);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: #7c3aed;
          margin: 0 auto 16px;
        }
        .cp-empty-title {
          font-family: 'Sora', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 6px;
        }
        .cp-empty-sub {
          font-size: 14px;
          color: #9ca3af;
          margin: 0;
        }

        .cp-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          gap: 16px;
        }
        .cp-loader-text {
          font-size: 14px;
          color: #9ca3af;
          font-weight: 500;
        }

        .cp-pagination {
          display: flex;
          justify-content: center;
          margin-top: 40px;
          padding-bottom: 20px;
        }

        .cp-active-filters {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .cp-filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: #ede9fe;
          border: 1px solid #c4b5fd;
          color: #5b21b6;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .cp-filter-chip:hover { background: #ddd6fe; }
        .cp-filter-chip svg { font-size: 10px; }

        .cp-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .cp-section-title {
          font-family: 'Sora', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .cp-section-count {
          font-size: 13px;
          color: #9ca3af;
          font-weight: 500;
        }
      `}</style>

      <div className="cp-root">
        {/* Hero header */}
        <div className="cp-hero">
          <div className="cp-hero-inner">
            <div className="cp-eyebrow">
              <BookOutlined style={{ fontSize: 10 }} />
              Learning Platform
            </div>
            <h1 className="cp-hero-title">
              Explore <span>Courses</span>
            </h1>
            <p className="cp-hero-sub">
              Upskill with industry-leading courses built for professionals
            </p>

            {/* Search & filter bar — only for non-create tabs */}
            {showFilterBar && (
              <div className="cp-search-bar">
                <div className="cp-search-wrap">
                  <SearchOutlined className="cp-search-icon" />
                  <input
                    className="cp-search-input"
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
                      const validatedValue = value.replace(
                        /[^a-zA-Z0-9_\- ]/g,
                        "",
                      );
                      setSearch(validatedValue);
                      setPage(1);
                    }}
                  />
                  {searchError && (
                    <span className="cp-search-error">{searchError}</span>
                  )}
                </div>

                <select
                  className="cp-filter-select"
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

                <div className="cp-results-badge">
                  {total} course{total !== 1 ? "s" : ""} found
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="cp-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`cp-tab ${tab.key === "create" ? "create-tab" : ""} ${
                    activeTab === tab.key ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="cp-tab-count">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="cp-body">
          {/* ── CREATE COURSE TAB ── */}
          {activeTab === "create" && <CreateCourseTab />}

          {/* ── BROWSE / ENROLLED / CART / WISHLIST TABS ── */}
          {activeTab !== "create" && (
            <>
              {/* Active filters */}
              {(search || isFreeFilter) && (
                <div className="cp-active-filters">
                  {search && (
                    <span
                      className="cp-filter-chip"
                      onClick={() => setSearch("")}
                    >
                      "{search}"
                      <CloseOutlined />
                    </span>
                  )}
                  {isFreeFilter && (
                    <span
                      className="cp-filter-chip"
                      onClick={() => setIsFreeFilter(undefined)}
                    >
                      {isFreeFilter === "true" ? "Free" : "Paid"}
                      <CloseOutlined />
                    </span>
                  )}
                </div>
              )}

              {/* Section header */}
              {!loading && displayCourses.length > 0 && (
                <div className="cp-section-header">
                  <h2 className="cp-section-title">
                    {activeTab === "browse" && "All Courses"}
                    {activeTab === "enrolled" && "My Learning"}
                    {activeTab === "cart" && "Cart"}
                    {activeTab === "wishlist" && "Wishlist"}
                  </h2>
                  <span className="cp-section-count">
                    {displayCourses.length} course
                    {displayCourses.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Content */}
              {loading ? (
                <div className="cp-loader">
                  <Spin size="large" />
                  <p className="cp-loader-text">Loading courses...</p>
                </div>
              ) : displayCourses.length === 0 ? (
                <div className="cp-empty">
                  <div className="cp-empty-icon">
                    <BookOutlined />
                  </div>
                  <p className="cp-empty-title">No courses found</p>
                  <p className="cp-empty-sub">
                    {search
                      ? `No results for "${search}". Try a different keyword.`
                      : activeTab === "enrolled"
                        ? "You haven't enrolled in any courses yet."
                        : activeTab === "cart"
                          ? "Your cart is empty."
                          : activeTab === "wishlist"
                            ? "No courses in your wishlist yet."
                            : "No courses available at the moment."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="cp-grid">
                    {displayCourses.map((course) => {
                      const enrollment = enrollmentMap[course.id];
                      return (
                        <CourseCard
                          key={course.id}
                          course={course}
                          mode={enrollment ? "enrolled" : "browse"}
                          progressPercent={calculateProgress(
                            course,
                            enrollment,
                          )}
                          isWishlisted={wishlistIds.includes(course.id)}
                          isInCart={cartIds.includes(course.id)}
                          onWishlistToggle={handleWishlistToggle}
                          onCartToggle={handleCartToggle}
                        />
                      );
                    })}
                  </div>

                  <div className="cp-pagination">
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
        </div>
      </div>
    </>
  );
};

export default CoursePage;
