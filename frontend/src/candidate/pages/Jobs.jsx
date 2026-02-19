import React, { useEffect, useState, useRef, useCallback } from "react";
import { Col, Row, Card, message, Progress, Empty } from "antd";
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
  const [progress, setProgress] = useState(0);


  // ⭐ filter open / close
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const observer = useRef();
  const [ids, setIds] = useState();

  const controllerRef = useRef(null);

  const toggleFilter = () => {
  setIsFilterOpen(prev => !prev);
};


  // ✅ Server-side filtering: pass filters to API
  const fetchJobs = useCallback(async (pageNum = 1, filters = {}) => {
  if (controllerRef.current) {
    controllerRef.current.abort();
  }

  const controller = new AbortController();
  controllerRef.current = controller;

  setLoading(true);

  let timer;
  if (pageNum === 1) {
    setProgress(0);
    timer = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 200);
  }

  try {
    const response = await GetJobsList(
      pageNum,
      10,
      filters,
      controller.signal
    );

    const newJobs = response?.jobs || [];

    if (pageNum === 1) {
      setJobs(newJobs);
      setTotalCount(response.totalCount || 0);
      setInitialLoading(false); // ✅ HERE ONLY
    } else {
      setJobs((prev) => [...prev, ...newJobs]);
    }

    setHasMore(pageNum < response.totalPages);
    setProgress(100);
  } catch (error) {
    if (error.name !== "CanceledError") {
      message.error("Failed to fetch jobs");
    }
  } finally {
    clearInterval(timer);
    setLoading(false);
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
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "400px",
      gap: 16,
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
  status={progress === 100 ? "success" : "active"}
  showInfo={false}
/>

    <span style={{ color: "#666" }}>Loading jobs...</span>
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
                  toggleFilter={toggleFilter}
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
                    {/* <Spin size="large" /> */}
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

              {!initialLoading && !loading && totalCount === 0 && (
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
