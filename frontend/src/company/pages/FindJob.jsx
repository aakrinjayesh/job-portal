import React, { useEffect, useState, useRef, useCallback } from "react";
import { Col, Row, Card, message, Spin, Empty } from "antd";
import FiltersPanel from "../../candidate/components/Job/FilterPanel";
import JobList from "../../candidate/components/Job/JobList";
import { GetJobsList } from "../../company/api/api";
// import { UserJobsids } from "../api/api";
import { useLocation } from "react-router-dom";

function FindJob() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState({});
  const [totalCount, setTotalCount] = useState(0);

  const observer = useRef();
  const controllerRef = useRef(null);
  const location = useLocation();

  // ⭐ filter open / close
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const fetchJobs = useCallback(async (pageNum = 1, filters = {}) => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();

    setLoading(true);
    try {
      const response = await GetJobsList(
        pageNum,
        10,
        filters,
        controllerRef.current.signal
      );

      const newJobs = response?.jobs || [];

      if (pageNum === 1) {
        setJobs(newJobs);
      } else {
        setJobs((prev) => [...prev, ...newJobs]);
      }

      setTotalCount(response.totalCount || 0);

      // Check if we have more pages using totalPages
      if (pageNum >= response.totalPages) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setLoading(false);
      setInitialLoading(false);
    } catch (error) {
      if (error.code === "ERR_CANCELED") {
        console.log("FindJobs API aborted");
        return;
      }
      console.error("Error fetching jobs:", error);
      setLoading(false);
      setInitialLoading(false);
    } finally {
      // setLoading(false);
      // setInitialLoading(false); // ✅ Turn off initial loading
    }
  }, []);

  // Cleanup on route change
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        console.log("🔥 Aborting FindJobs API due to tab switch");
        controllerRef.current.abort();
      }
    };
  }, [location.pathname]);

  // Initial fetch
  useEffect(() => {
    fetchJobs(1, currentFilters);
  }, []);

  // Infinite scroll
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

  // Fetch next page when page changes
  useEffect(() => {
    if (page > 1) {
      fetchJobs(page, currentFilters);
    }
  }, [page, currentFilters, fetchJobs]);

  // Handle filter changes - reset to page 1
  const handleFiltersChange = (filters) => {
    console.log("filters", filters);
    setCurrentFilters(filters);
    setPage(1);
    setHasMore(true);
    fetchJobs(1, filters);
  };

  // Clear filters
  const handleClearFilters = () => {
    setCurrentFilters({});
    setPage(1);
    setHasMore(true);
    fetchJobs(1, {});
  };

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
              showCandidateType={false}
            />
          </Col>
        )}

        {/* Main Job List */}
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
                <Spin size="large" tip="Loading jobs..." />
              </div>
            ) : (
              <>
                {/* Show total count */}
                {totalCount > 0 && (
                  <div style={{ marginBottom: 16, color: "#666" }}>
                    Found {totalCount} job{totalCount !== 1 ? "s" : ""}
                  </div>
                )}

                <JobList
                  jobs={jobs}
                  lastJobRef={lastJobRef}
                  type="find"
                  portal="company"
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

                {!hasMore && !loading && jobs.length > 0 && (
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

                {!loading && jobs.length === 0 && (
                  // <div
                  //   style={{
                  //     textAlign: "center",
                  //     marginTop: 40,
                  //     color: "#999",
                  //   }}
                  // >
                  //   <p style={{ fontSize: 16 }}>
                  //     No jobs found matching your filters
                  //   </p>
                  //   <p>Try adjusting your search criteria</p>
                  // </div>
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

export default FindJob;
