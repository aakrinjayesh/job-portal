import React, { useEffect, useState, useRef, useCallback } from "react";
import { Progress, message } from "antd";
import BenchCard from "../Bench/BenchCard";
import { SavedCandidatesList } from "../../api/api";

function SavedCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
const [initialLoading, setInitialLoading] = useState(true);
const [progress, setProgress] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const observer = useRef(null);

  const fetchSavedCandidates = useCallback(async (pageNum = 1) => {
  setLoading(true);
  try {
    const resp = await SavedCandidatesList(pageNum, 10);

    if (resp?.status === "success") {
      const { savedCandidates, pagination } = resp.data;

      const mappedCandidates = savedCandidates.map((c) => ({
        ...c,
        id: c.id || c._id,
        candidateName: c.name,
        role: c.title || "N/A",
        location: c.currentLocation || "N/A",
        experience: c.totalExperience
          ? `${c.totalExperience} yrs`
          : "N/A",
        skills: c.skillsJson || [],
        clouds: c.primaryClouds || [],
        avatar: c.profilePicture,
      }));

      setCandidates((prev) =>
        pageNum === 1 ? mappedCandidates : [...prev, ...mappedCandidates]
      );

      setHasMore(pagination.page < pagination.totalPages);
    }
  } catch (err) {
    message.error("Failed to load saved candidates");
  } finally {
    setLoading(false);
    setInitialLoading(false);
  }
}, []);


  useEffect(() => {
    fetchSavedCandidates(1);
  }, [fetchSavedCandidates]);

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


  const lastCandidateRef = useCallback(
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
    if (page > 1) fetchSavedCandidates(page);
  }, [page, fetchSavedCandidates]);

  const handleRemoveCandidate = (id) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
      message.success("Candidate removed!");
  };

  return (
    <div style={{ padding: 16 }}>
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
      Loading saved candidates…
    </div>
  </div>
) : candidates.length > 0 ? (
  <>
    {candidates.map((candidate, index) => (
      <BenchCard
        key={candidate.id}
        candidate={candidate}
        lastBenchRef={
          index === candidates.length - 1 ? lastCandidateRef : null
        }
        type="save"
        onUnsave={handleRemoveCandidate}
      />
    ))}

    {/* Infinite scroll spinner */}
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

    </div>
  );
}

export default SavedCandidates;
