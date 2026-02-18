import React, { useEffect, useState, useRef, useCallback } from "react";
import { Col, Row, Card, message, Progress } from "antd";
import AppliedJobsList from "../../candidate/components/Job/AppliedJobsList";
import { AppliedJobsList as GetAppliedJobs } from "../../candidate/api/api"; // your API call function

function AppliedJobs() {
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [readyToShow, setReadyToShow] = useState(false);

  const observer = useRef();

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 300);

    return () => clearInterval(interval);
  }, [loading]);

  // Fetch applied jobs
  const fetchJobs = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) {
      setReadyToShow(false);
      setProgress(10);
    }

    setLoading(true);

    try {
      const response = await GetAppliedJobs(pageNum, 10);

      const newApplications = response?.data?.applications || [];
      const pagination = response?.data?.pagination;

      if (pageNum === 1) {
        setApplications(newApplications);
      } else {
        setApplications((prev) => [...prev, ...newApplications]);
      }

      if (!pagination || pageNum >= pagination.totalPages) {
        setHasMore(false);
      }
    } catch (error) {
      message.error("Failed to fetch applied jobs");
    } finally {
      if (pageNum === 1) {
        setProgress(100); // ✅ force completion
        setTimeout(() => {
          setInitialLoading(false);
          setReadyToShow(true); // 🔓 unlock UI
          setProgress(0);
        }, 250);
      }
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

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
    [loading, hasMore],
  );

  // Load next page
  useEffect(() => {
    if (page > 1) fetchJobs(page);
  }, [page, fetchJobs]);

  return (
    <div
      style={{
        // height: "100vh",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f6fa",
        padding: "16px",
        // overflow: "hidden",
        overflowY: "auto",
      }}
    >
      <Row style={{ flex: 1, minHeight: 0 }}>
        <Col span={24} style={{ height: "100%", minHeight: 0 }}>
          <Card
            style={{
              height: "100%",
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
            }}
            bodyStyle={{ padding: "16px 24px" }}
          >
            {!readyToShow ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
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
                <div style={{ marginTop: 16, color: "#555", fontWeight: 500 }}>
                  Loading applied jobs…
                </div>
              </div>
            ) : (
              <>
                <AppliedJobsList
                  applications={applications}
                  lastJobRef={lastJobRef}
                />

                {loading && page > 1 && (
                  <div style={{ textAlign: "center", marginTop: 16 }}>
                    <Spin />
                  </div>
                )}

                {!hasMore && !loading && applications.length > 0 && (
                  <p
                    style={{
                      textAlign: "center",
                      margin: "16px 0",
                      color: "#888",
                    }}
                  >
                    You’ve reached the end!
                  </p>
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AppliedJobs;
