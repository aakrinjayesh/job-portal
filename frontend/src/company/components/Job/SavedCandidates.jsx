import React, { useEffect, useState, useRef, useCallback } from "react";
import { Progress, message, Spin, Row, Col, Card } from "antd";
import BenchCard from "../Bench/BenchCard";
import { SavedCandidatesList } from "../../api/api";
import FiltersPanel from "../../../candidate/components/Job/FilterPanel";

function SavedCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [readyToShow, setReadyToShow] = useState(false);

  const [page, setPage] = useState(1);
  const observer = useRef(null);
  // ADD after the filters useState:
  const filtersRef = useRef({
    experience: null,
    location: [],
    jobType: [],
    employmentType: [],
    skills: [],
    clouds: [],
    candidateType: [],
  });

  const [filters, setFilters] = useState(filtersRef.current);

  const handleFiltersChange = (newFilters) => {
    filtersRef.current = newFilters;
    setFilters(newFilters);
    setPage(1);
    fetchSavedCandidates(1, newFilters);
  };

  // const fetchSavedCandidates = useCallback(async (pageNum = 1) => {
  //   setLoading(true);
  //   setReadyToShow(false);

  //   if (pageNum === 1) {
  //     setProgress(10); // start progress only on first page
  //   }

  //   try {
  //     const resp = await SavedCandidatesList(pageNum, 10);

  //     if (resp?.status === "success") {
  //       const { savedCandidates, pagination } = resp.data;

  //       const mappedCandidates = savedCandidates.map((c) => ({
  //         ...c,
  //         id: c.id || c._id,
  //         candidateName: c.name,
  //         role: c.title || "N/A",
  //         location: c.currentLocation || "N/A",
  //         experience: c.totalExperience ? `${c.totalExperience} yrs` : "N/A",
  //         skills: c.skillsJson || [],
  //         clouds: c.primaryClouds || [],
  //         avatar: c.profilePicture,
  //         isSaved: true,
  //       }));

  //       setCandidates((prev) =>
  //         pageNum === 1 ? mappedCandidates : [...prev, ...mappedCandidates],
  //       );

  //       // setHasMore(pagination.page < pagination.totalPages);
  //       setHasMore(pageNum < pagination.totalPages);
  //     }
  //   } catch (err) {
  //     message.error("Failed to load saved candidates");
  //   } finally {
  //     if (pageNum === 1) {
  //       setProgress(100); // ✅ ONLY HERE
  //       setTimeout(() => {
  //         setInitialLoading(false);
  //         setReadyToShow(true); // 🔑 unlock rendering
  //         setProgress(0);
  //       }, 250);
  //     }
  //     setLoading(false);
  //   }
  // }, []);
  // const fetchSavedCandidates = useCallback(async (pageNum = 1) => {
  const fetchSavedCandidates = useCallback(
    async (pageNum = 1, appliedFilters = null) => {
      const filtersToUse = appliedFilters ?? filtersRef.current; // ✅ different names

      if (pageNum === 1) {
        setReadyToShow(false);
        setProgress(10);
      }

      try {
        // const resp = await SavedCandidatesList(pageNum, 10);
        const resp = await SavedCandidatesList(pageNum, 10, filtersToUse);

        if (resp?.status === "success") {
          const { savedCandidates, pagination } = resp.data;

          const mappedCandidates = savedCandidates.map((c) => ({
            ...c,
            id: c.id || c._id,
            candidateName: c.name,
            role: c.title || "N/A",
            location: c.currentLocation || "N/A",
            experience: c.totalExperience ? `${c.totalExperience} yrs` : "N/A",
            skills: c.skillsJson || [],
            clouds: c.primaryClouds || [],
            avatar: c.profilePicture,
            isSaved: true,
            vendorId: c.vendorId || null, // ✅ pass vendorId
            candidateType: c.vendorId // ✅ derive label here
              ? "Vendor Candidate"
              : "Individual Candidate",
          }));

          setCandidates((prev) =>
            pageNum === 1 ? mappedCandidates : [...prev, ...mappedCandidates],
          );

          setHasMore(pageNum < pagination.totalPages);
        }
      } catch (err) {
        message.error("Failed to load saved candidates");
      } finally {
        if (pageNum === 1) {
          setProgress(100);
          setTimeout(() => {
            setInitialLoading(false);
            setReadyToShow(true);
            setProgress(0);
          }, 250);
        }
        setLoading(false);
      }
    },
    [],
  );

  // useEffect(() => {
  //   fetchSavedCandidates(1);
  // }, [fetchSavedCandidates]);
  // useEffect(() => {
  //   fetchSavedCandidates(1, filters);
  // }, []); // ✅ runs once on mount only

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 300);

    return () => clearInterval(interval);
  }, [loading]);

  const lastCandidateRef = useCallback(
    (node) => {
      // if (loading) return;
      if (loading && page !== 1) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        // if (entries[0].isIntersecting && hasMore) {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    // [loading, hasMore],
    [loading, hasMore, page],
  );

  // useEffect(() => {
  //   if (page > 1) fetchSavedCandidates(page);
  // }, [page, fetchSavedCandidates]);
  useEffect(() => {
    if (page > 1) fetchSavedCandidates(page);
  }, [page]);

  const handleRemoveCandidate = (id) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    message.success("Candidate removed!");
  };

  // return (

  //   <div style={{ padding: 16 }}>
  //     {!readyToShow ? (
  //       <div
  //         style={{
  //           display: "flex",
  //           flexDirection: "column",
  //           justifyContent: "center",
  //           alignItems: "center",
  //           minHeight: "400px",
  //         }}
  //       >
  //         <Progress
  //           type="circle"
  //           percent={progress}
  //           width={90}
  //           strokeColor={{
  //             "0%": "#4F63F6",
  //             "100%": "#7C8CFF",
  //           }}
  //           trailColor="#E6E8FF"
  //           showInfo={false}
  //         />
  //         <div
  //           style={{
  //             marginTop: 16,
  //             color: "#555",
  //             fontSize: 14,
  //             fontWeight: 500,
  //           }}
  //         >
  //           Loading saved candidates…
  //         </div>
  //       </div>
  //     ) : candidates.length > 0 ? (
  //       <>
  //         {/* {candidates.map((candidate, index) => (
  //           <BenchCard
  //             key={candidate.id}
  //             candidate={candidate}
  //             lastBenchRef={
  //               index === candidates.length - 1 ? lastCandidateRef : null
  //             }
  //             type="save"
  //             onUnsave={handleRemoveCandidate}
  //           />
  //         ))} */}
  //         {candidates.map((candidate, index) => {
  //           const isLast = index === candidates.length - 1;

  //           return (
  //             <div ref={isLast ? lastCandidateRef : null} key={candidate.id}>
  //               <BenchCard
  //                 candidate={candidate}
  //                 type="save"
  //                 onUnsave={handleRemoveCandidate}
  //               />
  //             </div>
  //           );
  //         })}

  //         {loading && page > 1 && (
  //           <div style={{ textAlign: "center", padding: 20 }}>
  //             <Spin size="large" />
  //           </div>
  //         )}
  //       </>
  //     ) : (
  //       <p style={{ textAlign: "center", color: "#999" }}>
  //         No saved candidates found.
  //       </p>
  //     )}
  //   </div>
  // );

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
        {/* LEFT FILTER PANEL */}
        <Col span={6} style={{ height: "100%", overflowY: "auto" }}>
          <FiltersPanel
            onFiltersChange={handleFiltersChange}
            showCandidateType={true}
            savedFilters={filters}
          />
        </Col>

        {/* RIGHT CONTENT */}
        <Col span={18} style={{ height: "100%" }}>
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
            {!readyToShow ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "400px",
                }}
              >
                <Progress
                  type="circle"
                  percent={progress}
                  width={90}
                  strokeColor={{
                    "0%": "#4F63F6",
                    "100%": "#7C8CFF",
                  }}
                  trailColor="#E6E8FF"
                  showInfo={false}
                />
                <div
                  style={{
                    marginTop: 16,
                    color: "#555",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Loading saved candidates…
                </div>
              </div>
            ) : candidates.length > 0 ? (
              <>
                {candidates.map((candidate, index) => {
                  const isLast = index === candidates.length - 1;

                  return (
                    <div
                      ref={isLast ? lastCandidateRef : null}
                      key={candidate.id}
                    >
                      <BenchCard
                        candidate={candidate}
                        type="save"
                        onUnsave={handleRemoveCandidate}
                      />
                    </div>
                  );
                })}

                {loading && page > 1 && (
                  <div style={{ textAlign: "center", padding: 20 }}>
                    <Spin size="large" />
                  </div>
                )}
              </>
            ) : (
              <p style={{ textAlign: "center", color: "#999" }}>
                No saved candidates found.
              </p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default SavedCandidates;
