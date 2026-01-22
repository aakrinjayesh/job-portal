import React, { useEffect, useState, useRef, useCallback } from "react";
import { Spin, message } from "antd";
import BenchCard from "../Bench/BenchCard";
import { SavedCandidatesList } from "../../api/api";

function SavedCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // what BenchCard expects
   id: c.id || c._id, 
  candidateName: c.name,
  role: c.title || "N/A",
  location: c.currentLocation || "N/A",
  experience: c.totalExperience
    ? `${c.totalExperience} yrs`
    : "N/A",

  // optional extras
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
    }
  }, []);

  useEffect(() => {
    fetchSavedCandidates(1);
  }, [fetchSavedCandidates]);

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
      {loading && page === 1 ? (
        <Spin size="large" />
      ) : candidates.length > 0 ? (
        candidates.map((candidate, index) => (
          <BenchCard
            key={candidate.id}
            candidate={candidate}
            lastBenchRef={
              index === candidates.length - 1 ? lastCandidateRef : null
            }
            type="save"
            onUnsave={handleRemoveCandidate}
          />
        ))
      ) : (
        <p style={{ textAlign: "center", color: "#999" }}>
          No saved candidates found.
        </p>
      )}
    </div>
  );
}

export default SavedCandidates;
