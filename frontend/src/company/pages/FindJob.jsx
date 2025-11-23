import React, { useEffect, useState, useRef, useCallback } from "react";
import { Col, Row, Card, message, Spin } from "antd";
import FiltersPanel from "../../candidate/components/Job/FilterPanel";
import JobList from "../../candidate/components/Job/JobList";
import { GetJobsList } from "../../company/api/api";
import { UserJobsids } from "../api/api";

function FindJob() {
  const [allJobs, setAllJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const [ids, setIds] = useState();

  const fetchJobs = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      console.log("api call#############", pageNum);
      const response = await GetJobsList(pageNum, 10);
      console.log("API Response:", response); // Add this to debug
      const newJobs = response?.jobs || [];

      if (pageNum === 1) {
        setAllJobs(newJobs);
        setJobs(newJobs);
      } else {
        setAllJobs((prev) => [...prev, ...newJobs]);
        setJobs((prev) => [...prev, ...newJobs]);
      }

      // check if more pages exist
      if (pageNum >= response.totalPages) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      message.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array

  useEffect(() => {
    console.log("Component mounted, fetching jobs..."); // Add this
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
    [loading, hasMore]
  );

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

  useEffect(() => {
    if (page > 1) fetchJobs(page);
  }, [page]);

  const filterJobs = useCallback((filters, allJobs) => {
    return allJobs.filter((job) => {
      // --- EXPERIENCE FILTER ---
      if (filters.experience && filters.experience !== "Any") {
        const jobExp = job.experience?.toString().toLowerCase() || "";
        const filterExp = filters.experience.toLowerCase();

        // Regex: match "3", "3 years", "3+ years", etc.
        const expRegex = new RegExp(
          `\\b${filterExp.replace("+", "\\+")}\\b`,
          "i"
        );
        if (!expRegex.test(jobExp)) return false;
      }

      // --- SALARY FILTER ---
      if (filters.salary && filters.salary.length > 0) {
        // Convert job.salary (number) to lakhs for easier comparison
        const jobSalaryInLakhs = job.salary / 100000;

        const matches = filters.salary.some((range) => {
          // e.g. "0-3 Lakhs", "3-6 Lakhs", "10+ Lakhs"
          const clean = range.replace(" Lakhs", "").trim();

          if (clean.includes("-")) {
            const [minStr, maxStr] = clean.split("-");
            const min = parseFloat(minStr);
            const max = parseFloat(maxStr);
            return jobSalaryInLakhs >= min && jobSalaryInLakhs <= max;
          } else if (clean.includes("+")) {
            const min = parseFloat(clean);
            return jobSalaryInLakhs >= min;
          } else {
            // exact match (e.g. "5 Lakhs")
            const exact = parseFloat(clean);
            return Math.abs(jobSalaryInLakhs - exact) < 0.1;
          }
        });

        if (!matches) return false;
      }

      // --- LOCATION FILTER ---
      if (filters.location && filters.location.length > 0) {
        const jobLocation = job.location?.toLowerCase() || "";
        const matches = filters.location.some((loc) => {
          const regex = new RegExp(loc.toLowerCase(), "i");
          return regex.test(jobLocation);
        });
        if (!matches) return false;
      }

      return true;
    });
  }, []);

  // const handleFiltersChange = (filters) => {
  //   console.log("Received in jobs.jsx:", filters);
  // };

  const handleFiltersChange = (filters) => {
    console.log("Received filters:", filters);
    const filtered = filterJobs(filters, allJobs);
    setJobs(filtered);
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

        {/* Main Content */}
        <Col
          span={18}
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
            <JobList jobs={jobs} lastJobRef={lastJobRef} jobids={ids} />
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
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default FindJob;
