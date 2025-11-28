// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { Col, Row, Card, message, Spin } from "antd";
// import FiltersPanel from "../components/Job/FilterPanel";
// import JobList from "../../candidate/components/Job/JobList";
// import { AppliedJobsList } from "../../candidate/api/api";

// function AppliedJobs() {
//   const [jobs, setJobs] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const observer = useRef();

//   const fetchJobs = useCallback(async (pageNum = 1) => {
//     setLoading(true);
//     try {
//       console.log("api call#############", pageNum);
//       const response = await AppliedJobsList(pageNum, 10);
//       console.log("API Response:", response); // Add this to debug
//       const newJobs = response?.jobs || [];

//       if (pageNum === 1) {
//         setJobs(newJobs);
//       } else {
//         setJobs((prev) => [...prev, ...newJobs]);
//       }

//       // check if more pages exist
//       if (pageNum >= response.totalPages) {
//         setHasMore(false);
//       }
//     } catch (error) {
//       console.error("Error fetching jobs:", error);
//       message.error("Failed to fetch jobs");
//     } finally {
//       setLoading(false);
//     }
//   }, []); // Empty dependency array

//   useEffect(() => {
//     console.log("Component mounted, fetching jobs..."); // Add this
//     fetchJobs(1);
//   }, [fetchJobs]);

//   // Infinite scroll observer
//   const lastJobRef = useCallback(
//     (node) => {
//       if (loading) return;
//       if (observer.current) observer.current.disconnect();

//       observer.current = new IntersectionObserver((entries) => {
//         if (entries[0].isIntersecting && hasMore) {
//           setPage((prevPage) => prevPage + 1);
//         }
//       });

//       if (node) observer.current.observe(node);
//     },
//     [loading, hasMore]
//   );

//   useEffect(() => {
//     if (page > 1) fetchJobs(page);
//   }, [page]);

//   const handleFiltersChange = (filters) => {
//     console.log("Received in jobs.jsx:", filters);
//   };

//   return (
//     <div
//       style={{
//         height: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         background: "#f5f6fa",
//         padding: "16px",
//       }}
//     >
//       <Row>
//         {/* Main Content */}
//         <Col
//           span={24}
//           // style={{
//           //   height: "100%",
//           //   overflowY: "auto",
//           // }}
//         >
//           <Card
//             style={{
//               height: "100%",
//               borderRadius: 12,
//               background: "#fff",
//               boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
//               overflowY: "auto",
//             }}
//             bodyStyle={{ padding: "16px 24px" }}
//           >
//             <JobList jobs={jobs} lastJobRef={lastJobRef} />
//             {loading && (
//               <div style={{ textAlign: "center", marginTop: 16 }}>
//                 <Spin />
//               </div>
//             )}
//             {!hasMore && !loading && (
//               <p style={{ textAlign: "center", marginTop: 16, color: "#888" }}>
//                 🎉 You’ve reached the end!
//               </p>
//             )}
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// }

// export default AppliedJobs;

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Col, Row, Card, message, Spin } from "antd";
import AppliedJobsList from "../../candidate/components/Job/AppliedJobsList";
import { AppliedJobsList as GetAppliedJobs } from "../../candidate/api/api"; // your API call function

function AppliedJobs() {
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef();

  // Fetch applied jobs
  const fetchJobs = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      console.log("📡 Fetching applied jobs page:", pageNum);
      const response = await GetAppliedJobs(pageNum, 10);
      console.log("✅ API Response:", response);

      const newApplications = response?.data?.applications || [];
      const pagination = response?.data?.pagination;

      if (pageNum === 1) {
        setApplications(newApplications);
      } else {
        setApplications((prev) => [...prev, ...newApplications]);
      }

      // Check pagination
      if (!pagination || pageNum >= pagination.totalPages) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("❌ Error fetching applied jobs:", error);
      message.error("Failed to fetch applied jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  // Infinite scroll observer
  const lastJobRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Load next page
  useEffect(() => {
    if (page > 1) fetchJobs(page);
  }, [page, fetchJobs]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f6fa",
        padding: "16px",
      }}
    >
      <Row>
        <Col span={24}>
          <Card
            style={{
              height: "100%",
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              overflowY: "auto",
            }}
            bodyStyle={{ padding: "16px 24px" }}
          >
            <AppliedJobsList applications={applications} />
            {loading && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Spin />
              </div>
            )}
            {!hasMore && !loading && (
              <p style={{ textAlign: "center", marginTop: 16, color: "#888" }}>
                 You’ve reached the end!
              </p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AppliedJobs;
