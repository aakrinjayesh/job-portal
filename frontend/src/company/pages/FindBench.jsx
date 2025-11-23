import React, { useEffect, useState, useRef, useCallback } from "react";
import { Col, Row, Card, message, Spin, Tag } from "antd";
import FiltersPanel from "../../candidate/components/Job/FilterPanel";
import BenchCandidateDetails from "../components/Bench/BenchCandidateDetails";
import { GetVendorCandidates } from "../api/api";

function FindBench() {
  const [allCandidates, setAllCandidates] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // ✅ Fetch bench candidates (paginated)
  const fetchCandidates = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await GetVendorCandidates(pageNum, 10);
      const list = Array.isArray(response?.data)
        ? response.data
        : response || [];

      if (pageNum === 1) {
        setAllCandidates(list);
        setCandidates(list);
      } else {
        setAllCandidates((prev) => [...prev, ...list]);
        setCandidates((prev) => [...prev, ...list]);
      }

      setHasMore(list.length > 0);
    } catch (error) {
      console.error("Error fetching bench candidates:", error);
      message.error("Failed to fetch bench candidates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates(1);
  }, [fetchCandidates]);

  // ✅ Infinite scroll observer
  const lastCandidateRef = useCallback(
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

  useEffect(() => {
    if (page > 1) fetchCandidates(page);
  }, [page]);

  // ✅ Filter logic (using FiltersPanel)
  const handleFiltersChange = (filters) => {
    const filtered = allCandidates.filter((cand) => {
      // Filter by location
      if (filters.location && filters.location.length > 0) {
        const candLoc = (cand.preferredLocation || []).join(", ").toLowerCase();
        const matches = filters.location.some((loc) =>
          candLoc.includes(loc.toLowerCase())
        );
        if (!matches) return false;
      }

      // Filter by skills
      if (filters.skills && filters.skills.length > 0) {
        const candSkills =
          cand.skillsJson?.map((s) => s.name.toLowerCase()) ||
          cand.skills?.map((s) => s.toLowerCase()) ||
          [];
        const matches = filters.skills.some((skill) =>
          candSkills.includes(skill.toLowerCase())
        );
        if (!matches) return false;
      }

      return true;
    });

    setCandidates(filtered);
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
        <Col span={6} style={{ height: "100%", overflowY: "auto" }}>
          <FiltersPanel onFiltersChange={handleFiltersChange} />
        </Col>

        {/* Main Candidate List */}
        <Col span={18} style={{ height: "100%", overflowY: "auto" }}>
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
            <Row gutter={[16, 16]}>
              {candidates.map((cand, index) => {
                const isLast = index === candidates.length - 1;
                return (
                  <Col span={24} key={cand.id || index}>
                    <Card
                      hoverable
                      ref={isLast ? lastCandidateRef : null}
                      onClick={() => setSelectedCandidate(cand)}
                      style={{
                        transition: "0.3s",
                        cursor: "pointer",
                        borderRadius: 10,
                      }}
                    >
                      <h3 style={{ marginBottom: 8 }}>
                        {cand.name || "Unnamed Candidate"}
                      </h3>
                      <p style={{ margin: "4px 0", color: "#666" }}>
                        {cand.title || "No Title"}
                      </p>
                      <p style={{ margin: "4px 0", color: "#888" }}>
                        📍 {(cand.preferredLocation || []).join(", ") || "-"}
                      </p>
                      <div style={{ marginTop: 8 }}>
                        {(cand.skillsJson?.slice(0, 3) || []).map((s, i) => (
                          <Tag color="blue" key={i}>
                            {s.name}
                          </Tag>
                        ))}
                        {cand.skillsJson?.length > 3 && (
                          <Tag>+{cand.skillsJson.length - 3}</Tag>
                        )}
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {loading && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Spin />
              </div>
            )}
            {!hasMore && !loading && (
              <p style={{ textAlign: "center", marginTop: 16, color: "#888" }}>
                🎉 You’ve reached the end!
              </p>
            )}
            {!loading && candidates.length === 0 && (
              <p style={{ textAlign: "center", marginTop: 16, color: "#888" }}>
                No bench candidates found.
              </p>
            )}
          </Card>
        </Col>
      </Row>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <BenchCandidateDetails
          selectedCandidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}

export default FindBench;
