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

  // ⭐ filter open / close
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const fetchJobs = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await GetJobsList(pageNum, 10);
      const newJobs = response?.jobs || [];

      if (pageNum === 1) {
        setAllJobs(newJobs);
        setJobs(newJobs);
      } else {
        setAllJobs((prev) => [...prev, ...newJobs]);
        setJobs((prev) => [...prev, ...newJobs]);
      }

      if (pageNum >= response.totalPages) setHasMore(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      message.error("Failed to fetch jobs: " + error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  // Infinite scroll
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

  const fuzzyMatch = (a, b) => {
    if (!a || !b) return false;

    a = a.toLowerCase().trim();
    b = b.toLowerCase().trim();

    // 1. Direct substring check
    if (a.includes(b) || b.includes(a)) return true;

    // 2. Regex partial match (checks large similar segments)
    const pattern = b.split("").join(".*");
    const regex = new RegExp(pattern, "i");
    if (regex.test(a)) return true;

    // 3. Similarity score
    let matches = 0;
    for (let char of b) {
      if (a.includes(char)) matches++;
    }
    const score = matches / Math.max(a.length, b.length);
    return score >= 0.6; // tuning threshold
  };

  // FILTERING

  const levenshtein = (a, b) => {
    if (!a || !b) return Infinity;

    const m = a.length,
      n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
        else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }
    return dp[m][n];
  };

  const smartMatch = (text, search) => {
    if (!text || !search) return false;

    text = text.toLowerCase();
    search = search.toLowerCase();

    const words = text.split(/\s+/); // tokenization

    // 1. Exact token match
    if (words.includes(search)) return true;

    // 2. Levenshtein on each token
    for (const word of words) {
      const dist = levenshtein(word, search);

      if (dist <= 2) return true; // allows misspellings
    }

    // 3. Prefix match (hyd → hyderabad)
    for (const word of words) {
      if (word.startsWith(search) || search.startsWith(word)) {
        return true;
      }
    }

    return false;
  };

  const filterJobs = useCallback((filters, allJobs) => {
    console.log("filters", filters);
    return allJobs.filter((job) => {
      // --- EXPERIENCE FILTER ---
      // --- EXPERIENCE FILTER (Exact Match) ---
      if (
        filters.experience !== null &&
        filters.experience !== undefined &&
        filters.experience !== "Any"
      ) {
        const enteredExp = parseInt(filters.experience);
        const jobExp = parseInt(job.experience?.number); // FIXED

        if (!isNaN(enteredExp) && !isNaN(jobExp)) {
          if (jobExp !== enteredExp) return false;
        }
      }

      // --- SKILLS FILTER ---
      if (filters.skills && filters.skills.length > 0) {
        const jobSkills = (job.skills || []).map((s) => s.toLowerCase());

        const matches = filters.skills.every((skill) =>
          // jobSkills.includes(skill.toLowerCase())
          jobSkills.some((js) => smartMatch(js, skill))
        );

        if (!matches) return false;
      }

      // --- CLOUDS FILTER ---
      if (filters.clouds && filters.clouds.length > 0) {
        const jobClouds = (job.clouds || []).map((s) => s.toLowerCase());

        const matches = filters.clouds.every((cloud) =>
          // jobClouds.includes(cloud.toLowerCase())
          jobClouds.some((jc) => smartMatch(jc, cloud))
        );

        if (!matches) return false;
      }

      // --- SALARY FILTER ---
      if (filters.salary && filters.salary.length > 0) {
        const jobSalaryInLakhs = job.salary / 100000;

        const matches = filters.salary.some((range) => {
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
          // const regex = new RegExp(loc.toLowerCase(), "i");
          // return regex.test(jobLocation);
          return fuzzyMatch(jobLocation, loc);
        });
        if (!matches) return false;
      }

      // --- JOBTYPE FILTER ---
      if (filters.jobType && filters.jobType.length > 0) {
        const jobType = job.jobType?.toLowerCase() || "";
        const matches = filters.jobType.some((type) => {
          jobType.includes(type.toLowerCase());
        });
        if (!matches) return false;
      }

      // --- EMPLOYMENT TYPE FILTER ---
      if (filters.employmentType && filters.employmentType.length > 0) {
        const jobEmployment = job.employmentType?.toLowerCase() || "";

        const matches = filters.employmentType.some((emp) =>
          jobEmployment.includes(emp.toLowerCase())
        );

        if (!matches) return false;
      }

      return true;
    });
  }, []);

  const handleFiltersChange = (filters) => {
    const filtered = filterJobs(filters, allJobs);
    setJobs(filtered);
  };

  const handleClearFilters = () => {
    setJobs(allJobs);
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
        {/* Filter Sidebar */}
        {isFilterOpen && (
          <Col span={6} style={{ height: "100%", overflowY: "auto" }}>
            <FiltersPanel
              onFiltersChange={handleFiltersChange}
              handleClearFilters={handleClearFilters}
            />
          </Col>
        )}

        {/* Main Job List */}
        <Col span={isFilterOpen ? 18 : 24} style={{ height: "100%" }}>
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
            <JobList
              jobs={jobs}
              lastJobRef={lastJobRef}
              jobids={ids}
              type="find"
              portal="company"
              isFilterOpen={isFilterOpen}
              toggleFilter={() => setIsFilterOpen(!isFilterOpen)}
            />

            {loading && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Spin />
              </div>
            )}

            {!hasMore && !loading && (
              <p style={{ textAlign: "center", marginTop: 16, color: "#888" }}>
                You’ve reached the end!
              </p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default FindJob;
