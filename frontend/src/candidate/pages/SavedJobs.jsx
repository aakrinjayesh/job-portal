import React, { useEffect, useState, useRef, useCallback } from "react";
import { Spin, message } from "antd";
import JobList from "../components/Job/JobList";
import { SavedJobsList, UserJobsids } from "../api/api";

function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const observer = useRef();
  const [ids, setIds] = useState();

  // Fetch saved jobs
  const fetchSavedJobs = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const resp = await SavedJobsList(pageNum, 10); // Assuming pagination support
      if (resp?.status === "success") {
        const { savedJobs, pagination } = resp.data || {};

        // Flatten nested job structure
        // const formattedJobs =
        //   savedJobs?.map((item) => ({
        //     ...item.job, // Extract job info
        //     savedId: item.id,
        //     deadlineWarning: item.deadlineWarning,
        //     daysUntilDeadline: item.daysUntilDeadline,
        //     savedAt: item.savedAt,
        //   })) || [];

        // if (pageNum === 1) {
        //   setJobs(formattedJobs);
        // } else {
        //   setJobs((prev) => [...prev, ...formattedJobs]);
        // }

        if (pageNum === 1) {
          setJobs(savedJobs);
        } else {
          setJobs((prev) => [...prev, ...savedJobs]);
        }

        setHasMore(pagination?.page < pagination?.totalPages);
      } else {
        message.error("Failed to load saved jobs");
      }
    } catch (error) {
      console.error("Error fetching saved job list:", error);
      message.error("Error fetching saved jobs:" + error.response.data.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedJobs(1);
  }, [fetchSavedJobs]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const resp = await UserJobsids();
        if (resp.status === "success") {
          setIds(resp.jobids);
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    fetch();
  }, []);

  // Infinite scroll logic
  const lastJobRef = useCallback(
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

  useEffect(() => {
    if (page > 1) fetchSavedJobs(page);
  }, [page, fetchSavedJobs]);

  const handleRemoveJob = (jobId) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  // return (
  //   <div style={{ padding: "16px" }}>
  //     {loading && page === 1 ? (
  //       <div style={{ textAlign: "center", marginTop: 40 }}>
  //         <Spin size="large" />
  //       </div>
  //     ) : jobs.length > 0 ? (
  //       <JobList
  //         jobs={jobs}
  //         lastJobRef={lastJobRef}
  //         type="save"
  //         jobids={ids}
  //         portal={"candidate"}
  //         onUnsave={handleRemoveJob}
  //         hideSortAndFilter={true}
  //       />
  //     ) : (
  //       <p style={{ textAlign: "center", color: "#999", marginTop: 40 }}>
  //         No saved jobs found.
  //       </p>
  //     )}
  //   </div>
  // );

  return (
    <div
      style={{
        height: "100vh", // 🔑 lock page height
        display: "flex",
        flexDirection: "column",
        padding: "16px",
        overflow: "hidden", // 🔑 prevent page scroll
        background: "#f5f6fa",
      }}
    >
      {/* 🔹 TOP FIXED AREA (title / filters if any later) */}
      <div style={{ marginBottom: 12 }}>
        {/* keep empty or add heading later */}
      </div>

      {/* 🔹 SCROLLABLE JOB LIST AREA */}
      <div
        style={{
          flex: 1, // 🔑 take remaining height
          overflowY: "auto", // 🔑 vertical scroll only here
          overflowX: "hidden",
          minHeight: 0, // 🔑 CRITICAL for flex scroll
        }}
      >
        {loading && page === 1 ? (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Spin size="large" />
          </div>
        ) : jobs.length > 0 ? (
          <JobList
            jobs={jobs}
            lastJobRef={lastJobRef}
            type="save"
            jobids={ids}
            portal={"candidate"}
            onUnsave={handleRemoveJob}
            hideSortAndFilter={true}
          />
        ) : (
          <p style={{ textAlign: "center", color: "#999", marginTop: 40 }}>
            No saved jobs found.
          </p>
        )}

        {loading && page > 1 && (
          <div style={{ textAlign: "center", margin: 16 }}>
            <Spin />
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedJobs;
