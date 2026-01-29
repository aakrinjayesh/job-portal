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
          />
        </Col>

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
