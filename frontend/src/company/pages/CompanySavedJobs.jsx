import React, { useEffect, useState, useRef, useCallback } from "react";
import { Progress, message } from "antd";
import JobList from "../../candidate/components/Job/JobList";
import { SavedJobsList, UserJobsids } from "../../candidate/api/api";
import { useLocation } from "react-router-dom";


function CompanySavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const observer = useRef();
  const [ids, setIds] = useState();
  const controllerRef = useRef(null);
  const location = useLocation();
  const [progress, setProgress] = useState(0);




  // Fetch saved jobs
 const fetchSavedJobs = useCallback(async (pageNum = 1) => {
  if (controllerRef.current) controllerRef.current.abort();
  controllerRef.current = new AbortController();

  if (pageNum === 1) {
    setProgress(10);
    setLoading(true);
  }

  try {
    const resp = await SavedJobsList(
      pageNum,
      10,
      controllerRef.current.signal
    );

    if (resp?.status === "success") {
      const { savedJobs, pagination } = resp.data || {};

      setJobs((prev) =>
        pageNum === 1 ? savedJobs : [...prev, ...savedJobs]
      );

      setHasMore(pagination?.page < pagination?.totalPages);
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      message.error("Error fetching saved jobs");
    }
  } finally {
    if (pageNum === 1) {
      setProgress(100);           // ✅ only now reach 100%
      setTimeout(() => {
        setLoading(false);        // ✅ hide loader AFTER 100%
        setProgress(0);
      }, 300);
    } else {
      setLoading(false);
    }
  }
}, []);


  useEffect(() => {
  return () => {
    if (controllerRef.current) {
      console.log("🔥 Aborting SavedJobs API due to tab switch");
      controllerRef.current.abort();
    }
  };
}, [location.pathname]);

useEffect(() => {
  if (!loading || page !== 1) return;

  const interval = setInterval(() => {
    setProgress((prev) => (prev < 85 ? prev + 5 : prev));
  }, 300);

  return () => clearInterval(interval);
}, [loading, page]);




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

  return (
    <div style={{ padding: "16px" }}>
     {loading && page === 1 ? (
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
      Loading your saved jobs…
    </div>
  </div>
)

      : jobs.length > 0 ? (
        <JobList
          jobs={jobs}
          lastJobRef={lastJobRef}
          type="save"
          jobids={ids}
          portal={"company"}
          onUnsave={handleRemoveJob}
           hideSortAndFilter={true}  
        />
      ) : (
        <p style={{ textAlign: "center", color: "#999", marginTop: 40 }}>
          No saved jobs found.
        </p>
      )}
    </div>
  );
}

export default CompanySavedJobs;
