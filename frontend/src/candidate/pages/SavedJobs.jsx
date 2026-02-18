import React, { useEffect, useState, useRef, useCallback } from "react";
import { Progress, message } from "antd";
import JobList from "../components/Job/JobList";
import { SavedJobsList, UserJobsids } from "../api/api";

function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const observer = useRef();
  const [ids, setIds] = useState();
  const [initialLoading, setInitialLoading] = useState(true);
const [progress, setProgress] = useState(0);
const [readyToShow, setReadyToShow] = useState(false);


  // Fetch saved jobs
 const fetchSavedJobs = useCallback(async (pageNum = 1) => {
  setLoading(true);
  setReadyToShow(false);

  if (pageNum === 1) {
    setProgress(10); // start only on first load
  }

  try {
    const resp = await SavedJobsList(pageNum, 10);

    if (resp?.status === "success") {
      const { savedJobs, pagination } = resp.data || {};

      const formattedJobs =
        savedJobs?.map((item) => ({
          ...item,
          savedAt: item.savedAt,
        })) || [];

      setJobs((prev) =>
        pageNum === 1 ? formattedJobs : [...prev, ...formattedJobs]
      );

      setHasMore(pagination?.page < pagination?.totalPages);
    } else {
      message.error("Failed to load saved jobs");
    }
  } catch (error) {
    message.error("Error fetching saved jobs");
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
}, []);


  useEffect(() => {
    fetchSavedJobs(1);
  }, [fetchSavedJobs]);

  useEffect(() => {
  if (!loading) return;

  const interval = setInterval(() => {
    setProgress((prev) => (prev < 90 ? prev + 5 : prev));
  }, 300);

  return () => clearInterval(interval);
}, [loading]);


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
      Loading saved jobs…
    </div>
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
