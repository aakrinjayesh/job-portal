import React, { useEffect, useState, useRef, useCallback } from "react";
// import { Progress, message, Spin, Row, Col, Card } from "antd";
import { Progress, message, Spin, Row, Col, Card, Button, Tooltip } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
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
  const [isFilterOpen, setIsFilterOpen] = useState(() => {
    return sessionStorage.getItem("savedCandidates_filterOpen") === "true";
  });

  const [page, setPage] = useState(1);
  const observer = useRef(null);
  const cardRef = useRef(null);

  const handleCandidateClick = (candidateId) => {
    const scrollTop = cardRef.current?.scrollTop || 0;
    sessionStorage.setItem("savedCandScrollPos", scrollTop);
    sessionStorage.setItem("savedCandLastId", candidateId);
    sessionStorage.setItem("savedCandIsReturning", "true");
  };
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

  // const [filters, setFilters] = useState(filtersRef.current);
  const FILTER_KEY = "savedCandidates_filters";

  // const [filters, setFilters] = useState(() => {
  //   const saved = sessionStorage.getItem(FILTER_KEY);
  //   return saved ? JSON.parse(saved) : filtersRef.current;

  // });
  const [filters, setFilters] = useState(() => {
    const saved = sessionStorage.getItem(FILTER_KEY);
    const parsed = saved ? JSON.parse(saved) : filtersRef.current;
    filtersRef.current = parsed; // ✅ keep ref in sync
    return parsed;
  });

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

          // setCandidates((prev) =>
          //   pageNum === 1 ? mappedCandidates : [...prev, ...mappedCandidates],
          // );
          const filteredMapped = (() => {
            const hasRange =
              filtersToUse?.expMin != null || filtersToUse?.expMax != null;
            const hasSingle =
              !!filtersToUse?.experience &&
              filtersToUse.experience !== "Any" &&
              filtersToUse.experience !== 30;

            let result = mappedCandidates;

            if (hasRange) {
              const min = Number(filtersToUse.expMin ?? 0);
              const max = Number(filtersToUse.expMax ?? 99);
              result = result.filter((c) => {
                const exp = parseFloat(c?.totalExperience || 0);
                return exp >= min && exp <= max;
              });
            } else if (hasSingle) {
              const target = Math.floor(Number(filtersToUse.experience));
              result = result.filter((c) => {
                const exp = parseFloat(c?.totalExperience || 0);
                return Math.floor(exp) === target;
              });
            }
            if (filtersToUse?.candidateType?.length) {
              const wantsVendor = filtersToUse.candidateType.includes("vendor");
              const wantsIndividual =
                filtersToUse.candidateType.includes("individual");
              result = result.filter((c) => {
                const isVendor = c.vendorId != null && c.vendorId !== "";
                if (wantsVendor && wantsIndividual) return true; // both selected — show all
                if (wantsVendor) return isVendor; // only vendor selected
                if (wantsIndividual) return !isVendor; // only individual selected
                return true;
              });
            }
            // ✅ Location filter
            if (filtersToUse?.location?.length) {
              result = result.filter((c) => {
                const preferred = c?.preferredLocation || [];
                const current = c?.currentLocation || "";
                return filtersToUse.location.some(
                  (loc) =>
                    preferred.some(
                      (pl) =>
                        pl?.toLowerCase().includes(loc.toLowerCase()) ||
                        loc.toLowerCase().includes(pl?.toLowerCase()),
                    ) || current.toLowerCase().includes(loc.toLowerCase()),
                );
              });
            }

            return result;

            // return result;
          })();

          setCandidates((prev) => {
            const merged =
              pageNum === 1 ? filteredMapped : [...prev, ...filteredMapped];
            // ✅ Sort ascending by experience when range is active
            if (filtersToUse?.expMin != null || filtersToUse?.expMax != null) {
              return [...merged].sort(
                (a, b) =>
                  parseFloat(a.totalExperience || 0) -
                  parseFloat(b.totalExperience || 0),
              );
            }
            return merged;
          });

          setHasMore(pageNum < pagination.totalPages);

          // ✅ If filtered result is empty but more pages exist, auto-fetch next page
          if (filteredMapped.length === 0 && pageNum < pagination.totalPages) {
            setTimeout(() => setPage((prev) => prev + 1), 100);
          }
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

  const handleFiltersChange = (newFilters) => {
    filtersRef.current = newFilters;
    setFilters(newFilters);
    sessionStorage.setItem(FILTER_KEY, JSON.stringify(newFilters)); // ✅
    setPage(1);
    fetchSavedCandidates(1, newFilters);
  };
  const handleClearFilters = () => {
    const empty = {
      experience: null,
      location: [],
      jobType: [],
      employmentType: [],
      skills: [],
      clouds: [],
      candidateType: [],
    };
    filtersRef.current = empty;
    setFilters(empty);
    sessionStorage.removeItem(FILTER_KEY);
    setPage(1);
    fetchSavedCandidates(1, empty);
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
  useEffect(() => {
    fetchSavedCandidates(1, filters);
  }, []);

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
  useEffect(() => {
    const isReturning = sessionStorage.getItem("savedCandIsReturning");
    if (isReturning && candidates.length > 0 && readyToShow) {
      const savedScroll = parseInt(
        sessionStorage.getItem("savedCandScrollPos") || "0",
        10,
      );
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.scrollTop = savedScroll;
          sessionStorage.removeItem("savedCandIsReturning");
        }
      }, 300);
    }
  }, [candidates, readyToShow]);

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
        <Col
          span={6}
          style={{
            height: "100%",
            overflowY: "auto",
            display: isFilterOpen ? "block" : "none",
          }}
        >
          {/* <FiltersPanel
            onFiltersChange={handleFiltersChange}
            showCandidateType={true}
            savedFilters={filters}
          /> */}
          <FiltersPanel
            onFiltersChange={handleFiltersChange}
            handleClearFilters={handleClearFilters}
            showCandidateType={true}
            hideJobTypeFilters={true}
            savedFilters={filters}
            skipFirstEmit={true}
          />
        </Col>

        {/* RIGHT CONTENT */}
        {/* <Col span={18} style={{ height: "100%" }}> */}
        <Col span={isFilterOpen ? 18 : 24} style={{ height: "100%" }}>
          <Card
            ref={cardRef}
            style={{
              height: "100%",
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              overflowY: "auto",
            }}
            bodyStyle={{ padding: "16px 24px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                <Tooltip title={isFilterOpen ? "Hide Filters" : "Show Filters"}>
                  <Button
                    type="text"
                    onClick={() => {
                      const next = !isFilterOpen;
                      setIsFilterOpen(next);
                      sessionStorage.setItem(
                        "savedCandidates_filterOpen",
                        next,
                      );
                    }}
                    style={{ fontSize: 20 }}
                    icon={
                      isFilterOpen ? (
                        <MenuFoldOutlined />
                      ) : (
                        <MenuUnfoldOutlined />
                      )
                    }
                  />
                </Tooltip>
                Saved Candidates
              </div>
            </div>
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
                        onCandidateClick={handleCandidateClick}
                        isHighlighted={false}
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
