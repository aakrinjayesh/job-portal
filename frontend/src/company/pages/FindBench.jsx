import React, { useCallback, useEffect, useState, useRef } from "react";
import { Col, Row, Card, message, Spin, Modal, Empty } from "antd";
import FiltersPanel from "../../candidate/components/Job/FilterPanel";
import BenchList from "../components/Bench/BenchList";
import BenchCandidateDetails from "../components/Bench/BenchCandidateDetails";
import { GetAllVendorCandidates } from "../api/api";
import { useLocation } from "react-router-dom";

function FindBench() {
  const [bench, setBench] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // ✅ Added
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentFilters, setCurrentFilters] = useState({}); // ✅ Track filters
  const [totalCount, setTotalCount] = useState(0); // ✅ Added

  const observer = useRef();
  const controllerRef = useRef(null);
  const location = useLocation();

  const [isFilterOpen, setIsFilterOpen] = useState(true);
  // const [selectedCandidate, setSelectedCandidate] = useState(null);
  // const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // ✅ Server-side filtering: pass filters to API
  const fetchBench = useCallback(async (pageNum = 1, filters = {}) => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();

    setLoading(true);
    try {
      console.log("Fetching bench with filters:", filters);

      // ✅ Pass filters to API
      const res = await GetAllVendorCandidates(
        pageNum,
        10,
        filters,
        controllerRef.current.signal
      );
      if (res.status === "success") {
        const newList = res?.candidates || [];

        if (pageNum === 1) {
          setBench(newList);
        } else {
          setBench((prev) => [...prev, ...newList]);
        }

        setTotalCount(res.totalCount || 0);

        // Stop loading more when last page reached
        if (pageNum >= res.totalPages) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        setLoading(false);
        setInitialLoading(false);
      }
    } catch (error) {
      if (error.code === "ERR_CANCELED") {
        console.log("FindBench API aborted");
        return;
      }
      console.error(error);
      message.error("Failed to load bench candidates");
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  // Cleanup on route change
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        console.log("🔥 Aborting FindBench API due to tab switch");
        controllerRef.current.abort();
      }
    };
  }, [location.pathname]);

  // Initial load
  useEffect(() => {
    fetchBench(1, currentFilters);
  }, []);

  // ===============================
  // INFINITE SCROLL OBSERVER
  // ===============================
  const lastBenchRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Fetch next page when page changes
  useEffect(() => {
    if (page > 1) {
      fetchBench(page, currentFilters);
    }
  }, [page, currentFilters, fetchBench]);

  // ✅ Handle filter changes - reset to page 1 and fetch from server
  const handleFiltersChange = (filters) => {
    console.log("Received filters:", filters);
    setCurrentFilters(filters);
    setPage(1);
    setHasMore(true);
    fetchBench(1, filters);
  };

  // ✅ Clear filters and fetch all from server
  const handleClearFilters = () => {
    setCurrentFilters({});
    setPage(1);
    setHasMore(true);
    fetchBench(1, {});
  };

  // ===============================
  // VIEW DETAILS
  // ===============================
  // const openDetails = (candidate) => {
  //   setSelectedCandidate(candidate);
  //   setDetailsModalVisible(true);
  // };

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
      <Row gutter={[16, 16]} style={{ flex: 1, height: "100%" }}>
        {/* Filter Sidebar */}
        {isFilterOpen && (
          <Col span={6} style={{ height: "100%", overflowY: "auto" }}>
            <FiltersPanel
              onFiltersChange={handleFiltersChange}
              handleClearFilters={handleClearFilters}
              hideJobFilters={true}
              showJoiningFilter={true}
              showCandidateType={true}
            />
          </Col>
        )}

        {/* Main Bench List */}
        <Col span={isFilterOpen ? 18 : 24} style={{ height: "100%" }}>
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
            {/* ✅ Show spinner on initial load or filter change (page 1 loading) */}
            {initialLoading || (loading && page === 1) ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "400px",
                }}
              >
                <Spin size="large" tip="Loading candidates..." />
              </div>
            ) : (
              <>
                {/* Show total count */}
                {totalCount > 0 && (
                  <div style={{ marginBottom: 16, color: "#666" }}>
                    Found {totalCount} candidate{totalCount !== 1 ? "s" : ""}
                  </div>
                )}

                <BenchList
                  bench={bench}
                  lastBenchRef={lastBenchRef}
                  isFilterOpen={isFilterOpen}
                  toggleFilter={() => setIsFilterOpen(!isFilterOpen)}
                />

                {/* ✅ Show spinner only for page 2+ (infinite scroll loading) */}
                {loading && page > 1 && (
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: 16,
                      padding: "20px",
                    }}
                  >
                    <Spin size="large" />
                  </div>
                )}

                {!hasMore && !loading && bench.length > 0 && (
                  <p
                    style={{
                      textAlign: "center",
                      marginTop: 16,
                      color: "#888",
                    }}
                  >
                    You've reached the end!
                  </p>
                )}

                {!loading && bench.length === 0 && (
                  <Empty
                    style={{ marginTop: 70 }}
                    description="No jobs found matching your filters"
                  />
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default FindBench;

// import React, { useCallback, useEffect, useState, useRef } from "react";
// import { Col, Row, Card, message, Spin, Modal } from "antd";
// import FiltersPanel from "../../candidate/components/Job/FilterPanel";
// import BenchList from "../components/Bench/BenchList";
// import BenchCandidateDetails from "../components/Bench/BenchCandidateDetails";
// import { GetAllVendorCandidates } from "../api/api";
// import { useLocation } from "react-router-dom";

// function FindBench() {
//   const [bench, setBench] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [currentFilters, setCurrentFilters] = useState({});
//   const [totalCount, setTotalCount] = useState(0);

//   const observer = useRef();
//   const abortControllerRef = useRef(null);
//   const fetchTimeoutRef = useRef(null);
//   const location = useLocation();

//   const [isFilterOpen, setIsFilterOpen] = useState(true);
//   const [selectedCandidate, setSelectedCandidate] = useState(null);
//   const [detailsModalVisible, setDetailsModalVisible] = useState(false);

//   // ✅ Stable fetch function with proper cleanup and duplicate prevention
//   const fetchBench = useCallback(
//     async (pageNum = 1, filters = {}, isNewFilter = false) => {
//       // Cancel previous request
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort("New request initiated");
//       }

//       // Create new abort controller
//       abortControllerRef.current = new AbortController();

//       // Set loading state appropriately
//       if (pageNum === 1) {
//         setInitialLoading(true);
//       }
//       setLoading(true);

//       try {
//         console.log("Fetching bench with filters:", filters, "page:", pageNum);

//         const res = await GetAllVendorCandidates(
//           pageNum,
//           10,
//           filters,
//           abortControllerRef.current.signal
//         );

//         const newList = res?.candidates || [];

//         // ✅ Handle state updates based on whether it's a new filter or infinite scroll
//         if (pageNum === 1 || isNewFilter) {
//           setBench(newList);
//         } else {
//           setBench((prev) => {
//             // Avoid duplicates
//             const existingIds = new Set(prev.map((item) => item.id));
//             const uniqueNewItems = newList.filter(
//               (item) => !existingIds.has(item.id)
//             );
//             return [...prev, ...uniqueNewItems];
//           });
//         }

//         setTotalCount(res.totalCount || 0);
//         setHasMore(pageNum < (res.totalPages || 1));
//       } catch (error) {
//         if (error.name === "AbortError") {
//           console.log("Request was aborted:", error.message);
//           return;
//         }
//         console.error("Fetch bench error:", error);
//         message.error("Failed to load bench candidates");
//       } finally {
//         setLoading(false);
//         setInitialLoading(false);
//       }
//     },
//     []
//   ); // ✅ No dependencies needed

//   // ✅ Debounced fetch function for better performance
//   const debouncedFetch = useCallback(
//     (pageNum, filters, isNewFilter) => {
//       if (fetchTimeoutRef.current) {
//         clearTimeout(fetchTimeoutRef.current);
//       }

//       fetchTimeoutRef.current = setTimeout(() => {
//         fetchBench(pageNum, filters, isNewFilter);
//       }, 300);
//     },
//     [fetchBench]
//   );

//   // ✅ Initial load - runs once on mount
//   useEffect(() => {
//     fetchBench(1, currentFilters, true);

//     // Cleanup function
//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort("Component unmounted");
//       }
//       if (fetchTimeoutRef.current) {
//         clearTimeout(fetchTimeoutRef.current);
//       }
//     };
//   }, []);

//   // ✅ Handle filter changes with debouncing
//   const handleFiltersChange = useCallback(
//     (filters) => {
//       console.log("Received filters:", filters);
//       setCurrentFilters(filters);
//       setPage(1);
//       setHasMore(true);
//       debouncedFetch(1, filters, true);
//     },
//     [debouncedFetch]
//   );

//   // ✅ Clear filters
//   const handleClearFilters = useCallback(() => {
//     const emptyFilters = {};
//     console.log("Clearing filters");
//     setCurrentFilters(emptyFilters);
//     setPage(1);
//     setHasMore(true);
//     debouncedFetch(1, emptyFilters, true);
//   }, [debouncedFetch]);

//   // ✅ Infinite scroll observer with proper cleanup
//   const lastBenchRef = useCallback(
//     (node) => {
//       if (loading || !hasMore) return;

//       if (observer.current) {
//         observer.current.disconnect();
//       }

//       observer.current = new IntersectionObserver(
//         (entries) => {
//           if (entries[0].isIntersecting && hasMore && !loading) {
//             setPage((prev) => prev + 1);
//           }
//         },
//         {
//           threshold: 0.1, // Trigger when 10% of element is visible
//           rootMargin: "100px", // Load 100px before element becomes visible
//         }
//       );

//       if (node) {
//         observer.current.observe(node);
//       }

//       // Cleanup function
//       return () => {
//         if (observer.current) {
//           observer.current.disconnect();
//         }
//       };
//     },
//     [loading, hasMore]
//   );

//   // ✅ Fetch next page when page changes
//   useEffect(() => {
//     if (page > 1) {
//       debouncedFetch(page, currentFilters, false);
//     }
//   }, [page, currentFilters, debouncedFetch]);

//   // ===============================
//   // VIEW DETAILS
//   // ===============================
//   const openDetails = useCallback((candidate) => {
//     setSelectedCandidate(candidate);
//     setDetailsModalVisible(true);
//   }, []);

//   const closeDetails = useCallback(() => {
//     setDetailsModalVisible(false);
//     setSelectedCandidate(null);
//   }, []);

//   // ===============================
//   // TOGGLE FILTER PANEL
//   // ===============================
//   const toggleFilter = useCallback(() => {
//     setIsFilterOpen((prev) => !prev);
//   }, []);

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
//       <Row gutter={[16, 16]} style={{ flex: 1, height: "100%" }}>
//         {/* Filter Sidebar */}
//         {isFilterOpen && (
//           <Col span={6} style={{ height: "100%", overflowY: "auto" }}>
//             <FiltersPanel
//               onFiltersChange={handleFiltersChange}
//               handleClearFilters={handleClearFilters}
//               hideJobFilters={true}
//               showJoiningFilter={true}
//               showCandidateType={true}
//             />
//           </Col>
//         )}

//         {/* Main Bench List */}
//         <Col span={isFilterOpen ? 18 : 24} style={{ height: "100%" }}>
//           <Card
//             style={{
//               height: "100%",
//               borderRadius: 12,
//               background: "#fff",
//               boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
//               overflowY: "auto",
//               display: "flex",
//               flexDirection: "column",
//             }}
//             bodyStyle={{
//               padding: "16px 24px",
//               flex: 1,
//               display: "flex",
//               flexDirection: "column",
//             }}
//           >
//             {/* ✅ Show spinner on initial load or filter change (page 1 loading) */}
//             {initialLoading ? (
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   flex: 1,
//                 }}
//               >
//                 <Spin size="large" tip="Loading candidates..." />
//               </div>
//             ) : (
//               <div
//                 style={{ flex: 1, display: "flex", flexDirection: "column" }}
//               >
//                 {/* Show total count */}
//                 {totalCount > 0 && (
//                   <div style={{ marginBottom: 16, color: "#666" }}>
//                     Found {totalCount} candidate{totalCount !== 1 ? "s" : ""}
//                   </div>
//                 )}

//                 <div style={{ flex: 1, minHeight: 0 }}>
//                   <BenchList
//                     bench={bench}
//                     lastBenchRef={lastBenchRef}
//                     isFilterOpen={isFilterOpen}
//                     toggleFilter={toggleFilter}
//                     onViewDetails={openDetails}
//                   />
//                 </div>

//                 {/* ✅ Show spinner only for page 2+ (infinite scroll loading) */}
//                 {loading && page > 1 && (
//                   <div
//                     style={{
//                       textAlign: "center",
//                       marginTop: 16,
//                       padding: "20px",
//                     }}
//                   >
//                     <Spin size="large" />
//                   </div>
//                 )}

//                 {!hasMore && !loading && bench.length > 0 && (
//                   <p
//                     style={{
//                       textAlign: "center",
//                       marginTop: 16,
//                       color: "#888",
//                       padding: "8px",
//                     }}
//                   >
//                     You've reached the end!
//                   </p>
//                 )}

//                 {!loading && bench.length === 0 && !initialLoading && (
//                   <div
//                     style={{
//                       textAlign: "center",
//                       marginTop: 40,
//                       color: "#999",
//                       flex: 1,
//                       display: "flex",
//                       flexDirection: "column",
//                       justifyContent: "center",
//                       alignItems: "center",
//                     }}
//                   >
//                     <p style={{ fontSize: 16 }}>
//                       No candidates found matching your filters
//                     </p>
//                     <p>Try adjusting your search criteria</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </Card>
//         </Col>
//       </Row>

//       {/* Candidate Details Modal */}
//       <Modal
//         title="Candidate Details"
//         open={detailsModalVisible}
//         onCancel={closeDetails}
//         footer={null}
//         width={800}
//         destroyOnClose
//       >
//         {selectedCandidate && (
//           <BenchCandidateDetails candidate={selectedCandidate} />
//         )}
//       </Modal>
//     </div>
//   );
// }

// // ✅ Wrap with React.memo to prevent unnecessary re-renders
// export default React.memo(FindBench);
