import React, { useCallback, useEffect, useState, useRef } from "react";
import { Col, Row, Card, message, Progress, Modal, Empty } from "antd";
import FiltersPanel from "../../candidate/components/Job/FilterPanel";
import BenchList from "../components/Bench/BenchList";
import BenchCandidateDetails from "../components/Bench/BenchCandidateDetails";
import { GetAllVendorCandidates } from "../api/api";
import { useLocation } from "react-router-dom";

function FindBench() {
  const FILTER_KEY = "findBench_filters";
  const [bench, setBench] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // ✅ Added
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // const [currentFilters, setCurrentFilters] = useState({}); // ✅ Track filters
  const [currentFilters, setCurrentFilters] = useState(() => {
    const saved = sessionStorage.getItem(FILTER_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [totalCount, setTotalCount] = useState(0); // ✅ Added
  const [progress, setProgress] = useState(0);

  const observer = useRef();
  const controllerRef = useRef(null);
  const location = useLocation();
  const cardRef = useRef(null);

  const handleCandidateClick = (candidateId) => {
    const scrollTop = cardRef.current?.scrollTop || 0;
    sessionStorage.setItem("benchScrollPos", scrollTop);
    sessionStorage.setItem("benchLastId", candidateId);
    sessionStorage.setItem("benchIsReturning", "true");
  };
  const [sortBy, setSortBy] = useState(() => {
    return sessionStorage.getItem("findBench_sortBy") || "newest";
  });

  // const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(() => {
    return sessionStorage.getItem("findBench_filterOpen") === "true";
  });
  // const [selectedCandidate, setSelectedCandidate] = useState(null);
  // const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // ✅ Server-side filtering: pass filters to API
  const handleSortChange = (value) => {
    setSortBy(value);
    sessionStorage.setItem("findBench_sortBy", value);
    setHasMore(true);
  };
  const fetchBench = useCallback(
    async (pageNum = 1, filters = {}, sort = "newest") => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      controllerRef.current = new AbortController();

      if (pageNum === 1) {
        setInitialLoading(true);
        setLoading(true);
        setProgress(10);
      } else {
        setLoading(true);
      }

      try {
        const res = await GetAllVendorCandidates(
          pageNum,
          10,
          filters,
          sort,
          controllerRef.current.signal,
        );

        const newList = res?.candidates || [];

        setBench((prev) => (pageNum === 1 ? newList : [...prev, ...newList]));
        // const newList = res?.candidates || [];

        // // ✅ FILTER ONLY ACTIVE CANDIDATES
        // const activeCandidates = newList.filter(
        //   (candidate) => candidate.status === "active",
        // );

        // setBench((prev) =>
        //   pageNum === 1 ? activeCandidates : [...prev, ...activeCandidates],
        // );

        setTotalCount(res.totalCount || 0);
        setHasMore(pageNum < res.totalPages);
      } catch (error) {
        if (error.code !== "ERR_CANCELED") {
          message.error("Failed to load bench candidates");
        }
      } finally {
        if (pageNum === 1) {
          setProgress(100);

          setTimeout(() => {
            setInitialLoading(false);
            setLoading(false);
            setProgress(0);
          }, 300);
        } else {
          setLoading(false);
        }
      }
    },
    [],
  );

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
    setPage(1);
    fetchBench(1, currentFilters, sortBy);
  }, [currentFilters, sortBy]);

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
    [loading, hasMore],
  );

  // Fetch next page when page changes
  useEffect(() => {
    if (page > 1) {
      fetchBench(page, currentFilters, sortBy);
    }
  }, [page]);
  useEffect(() => {
    const isReturning = sessionStorage.getItem("benchIsReturning");
    if (isReturning && bench.length > 0 && !initialLoading) {
      const savedScroll = parseInt(
        sessionStorage.getItem("benchScrollPos") || "0",
        10,
      );
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.scrollTop = savedScroll;
          sessionStorage.removeItem("benchIsReturning");
        }
      }, 300);
    }
  }, [bench, initialLoading]);

  useEffect(() => {
    if (initialLoading || (loading && page === 1)) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 10 : prev + 10));
      }, 400);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [initialLoading, loading, page]);

  // ✅ Handle filter changes - reset to page 1 and fetch from server
  // const handleFiltersChange = (filters) => {
  //   console.log("Received filters:", filters);
  //   setCurrentFilters(filters);
  //   // setPage(1);
  //   // setProgress(0);
  //   setHasMore(true);
  //   // fetchBench(1, filters);
  // };
  const handleFiltersChange = (filters) => {
    setCurrentFilters(filters);
    sessionStorage.setItem(FILTER_KEY, JSON.stringify(filters));
    setHasMore(true);
  };

  // ✅ Clear filters and fetch all from server
  // const handleClearFilters = () => {
  //   setCurrentFilters({});
  //   setPage(1);
  //   setHasMore(true);
  //   setProgress(0);
  //   // fetchBench(1, {});
  // };
  // Update handleClearFilters to also clear sessionStorage:
  const handleClearFilters = () => {
    setCurrentFilters({});
    sessionStorage.removeItem(FILTER_KEY);
    setPage(1);
    setHasMore(true);
    setProgress(0);
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
        {/* {isFilterOpen && (
          <Col span={6} style={{ height: "100%", overflowY: "auto" }}>
            <FiltersPanel
              onFiltersChange={handleFiltersChange}
              handleClearFilters={handleClearFilters}
              hideJobFilters={true}
              showJoiningFilter={true}
              showCandidateType={true}
            />
          </Col>
        )} */}
        <Col
          span={6}
          style={{
            height: "100%",
            overflowY: "auto",
            display: isFilterOpen ? "block" : "none", // ✅ KEY FIX
          }}
        >
          <FiltersPanel
            onFiltersChange={handleFiltersChange}
            handleClearFilters={handleClearFilters}
            hideJobFilters={true}
            showJoiningFilter={true}
            showCandidateType={true}
            hideJobTypeFilters={true}
            savedFilters={currentFilters} // ✅ add this
            skipFirstEmit={true}
          />
        </Col>

        {/* Main Bench List */}
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
            {/* ✅ Show spinner on initial load or filter change (page 1 loading) */}
            {initialLoading || (loading && page === 1) ? (
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
                  Finding best bench candidates for you…
                </div>
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
                  // toggleFilter={() => setIsFilterOpen(!isFilterOpen)}
                  toggleFilter={() => {
                    const next = !isFilterOpen;
                    setIsFilterOpen(next);
                    sessionStorage.setItem("findBench_filterOpen", next);
                  }}
                  sortBy={sortBy} // ✅ add
                  onSortChange={handleSortChange}
                  onCandidateClick={handleCandidateClick}
                  highlightCandidateId={sessionStorage.getItem("benchLastId")}
                />

                {/* ✅ Show spinner only for page 2+ (infinite scroll loading) */}
                {loading && (
                  <Progress
                    percent={progress}
                    size="small"
                    status="active"
                    showInfo
                    style={{ marginBottom: 16 }}
                  />
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
