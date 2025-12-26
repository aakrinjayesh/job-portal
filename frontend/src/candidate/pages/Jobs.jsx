import React, { useEffect, useState, useRef, useCallback } from "react";
import { Col, Row, Card, message, Spin, Empty } from "antd";
import FiltersPanel from "../components/Job/FilterPanel";
import JobList from "../components/Job/JobList";
import { GetJobsList } from "../../company/api/api";
import { UserJobsids } from "../api/api";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState({});
  const [totalCount, setTotalCount] = useState(0);

  // ⭐ filter open / close
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const observer = useRef();
  const [ids, setIds] = useState();

  const controllerRef = useRef(null);

  // ✅ Server-side filtering: pass filters to API
  const fetchJobs = useCallback(async (pageNum = 1, filters = {}) => {
    // 🔥 Cancel previous API if exists
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    // 🔥 Create new controller
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);

    try {
      console.log("api call#############", pageNum, "filters:", filters);

      // ✅ Pass filters to API for server-side filtering
      const response = await GetJobsList(
        pageNum,
        10,
        filters,
        controller.signal
      );

      const newJobs = response?.jobs || [];

      if (pageNum === 1) {
        setJobs(newJobs);
      } else {
        setJobs((prev) => [...prev, ...newJobs]);
      }

      setTotalCount(response.totalCount || 0);

      if (pageNum >= response.totalPages) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      if (error.name !== "CanceledError" && error.code !== "ERR_CANCELED") {
        console.error("Error fetching jobs:", error);
        message.error(
          "Failed to fetch jobs: " + error?.response?.data?.message
        );
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    console.log("Component mounted, fetching jobs...");
    fetchJobs(1, currentFilters);
  }, []);

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

  // ✅ Fetch user's saved job IDs in background (non-blocking)
  useEffect(() => {
    const fetchIds = async () => {
      try {
        const resp = await UserJobsids();
        if (resp.status === "success") {
          setIds(resp.jobids);
        }
      } catch (error) {
        console.log("Background fetch error:", error);
        // ✅ Silent fail - doesn't block UI or show error
      }
    };

    fetchIds();
  }, []);

  // Fetch next page when page changes
  useEffect(() => {
    if (page > 1) {
      fetchJobs(page, currentFilters);
    }
  }, [page, currentFilters, fetchJobs]);

  // ✅ Handle filter changes - reset to page 1 and fetch from server
  const handleFiltersChange = (filters) => {
    console.log("Received filters:", filters);
    setCurrentFilters(filters);
    setPage(1);
    setHasMore(true);
    fetchJobs(1, filters);
  };

  // ✅ Clear filters and fetch all jobs from server
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
        {/* Sidebar */}
        {isFilterOpen && (
          <Col span={6} style={{ height: "100%", overflowY: "auto" }}>
            <FiltersPanel
              onFiltersChange={handleFiltersChange}
              handleClearFilters={handleClearFilters}
              showCandidateType={false}
            />
          </Col>
        )}

        {/* Main Content */}
        <Col
          span={isFilterOpen ? 18 : 24}
          style={{
            height: "100%",
            overflowY: "auto",
          }}
        >
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
                  jobids={ids}
                  portal="candidate"
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

                {!loading && totalCount === 0 && (
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

export default Jobs;
