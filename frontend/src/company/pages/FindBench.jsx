import React, { useCallback, useEffect, useState, useRef } from "react";
import { Col, Row, Card, message, Spin, Modal } from "antd";
import FiltersPanel from "../../candidate/components/Job/FilterPanel";
import BenchList from "../components/Bench/BenchList";
import BenchCandidateDetails from "../components/Bench/BenchCandidateDetails";
import { GetAllVendorCandidates } from "../api/api";



function FindBench() {
  const [allBench, setAllBench] = useState([]);
  const [bench, setBench] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef();

  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);




  const fetchBench = useCallback(async (pageNum = 1) => {
  setLoading(true);
  try {
    const res = await GetAllVendorCandidates(pageNum, 10);

    // Backend returns ---> res.candidates
    const newList = res?.candidates || [];

    if (pageNum === 1) {
      setAllBench(newList);
      setBench(newList);
    } else {
      setAllBench((prev) => [...prev, ...newList]);
      setBench((prev) => [...prev, ...newList]);
    }

    // Stop loading more when last page reached
    if (pageNum >= res.totalPages) {
      setHasMore(false);
    }
  } catch (error) {
    console.error(error);
    message.error("Failed to load bench candidates.");
  } finally {
    setLoading(false);
  }
}, []);


  // Initial load
  useEffect(() => {
    fetchBench(1);
  }, [fetchBench]);

  // ===============================
  // INFINITE SCROLL OBSERVER
  // ===============================
  const lastBenchRef = useCallback(
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

  // Load more when page increases
  useEffect(() => {
    if (page > 1) fetchBench(page);
  }, [page, fetchBench]);

  // ===============================
  // FILTERING
  // ===============================
  const filterBench = useCallback((filters, items) => {
    if (!items) return [];

    return items.filter((cand) => {
      // EXPERIENCE (Exact Match)
      if (
        filters.experience !== null &&
        filters.experience !== undefined &&
        filters.experience !== "Any"
      ) {
        const exp =
          (!isNaN(parseInt(cand.totalExperience)) && parseInt(cand.totalExperience)) ??
          (!isNaN(parseInt(cand.relevantSalesforceExperience)) &&
            parseInt(cand.relevantSalesforceExperience)) ??
          (!isNaN(parseInt(cand.experience)) && parseInt(cand.experience));

        const entered = parseInt(filters.experience);

        if (!isNaN(exp) && !isNaN(entered) && exp !== entered) return false;
      }

      // SKILLS FILTER
      if (filters.skills?.length > 0) {
        const candSkills =
          cand.skillsJson?.map((s) => (s.name || s).toLowerCase()) || [];

        const matches = filters.skills.some((sk) =>
          candSkills.some((cs) => cs.includes(sk.toLowerCase()))
        );

        if (!matches) return false;
      }

      // CLOUDS FILTER
      if (filters.clouds?.length > 0) {
        const candClouds =
          cand.primaryClouds?.map((c) => (c.name || c).toLowerCase()) || [];

        const matches = filters.clouds.some((cl) =>
          candClouds.some((cc) => cc.includes(cl.toLowerCase()))
        );

        if (!matches) return false;
      }

      // LOCATION FILTER
      if (filters.location?.length > 0) {
        const prefs =
          cand.preferredLocation?.map((p) => p.toLowerCase()) || [];

        const matches = filters.location.some((loc) =>
          prefs.some((p) => p.includes(loc.toLowerCase()))
        );

        if (!matches) return false;
      }

      // JOINING PERIOD FILTER (Single Select)
if (filters.joiningPeriod) {
  const candJoining = cand.joiningPeriod?.toLowerCase() || "";
  const selectedJoining = filters.joiningPeriod.toLowerCase();

  if (candJoining !== selectedJoining) return false;
}


      return true;
    });
  }, []);

  const handleFiltersChange = (filters) => {
    const filtered = filterBench(filters, allBench);
    setBench(filtered);
  };

  // ===============================
  // VIEW DETAILS
  // ===============================
  const openDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setDetailsModalVisible(true);
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
            {/* <FiltersPanel onFiltersChange={handleFiltersChange} /> */}
            <FiltersPanel onFiltersChange={handleFiltersChange} hideJobFilters={true} showJoiningFilter={true}   />

          </Col>
        )}

        {/* Main Bench List */}
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
     

            <BenchList
              bench={bench}
              lastBenchRef={lastBenchRef}
              isFilterOpen={isFilterOpen}
              toggleFilter={() => setIsFilterOpen(!isFilterOpen)}
              onViewDetails={openDetails}
            />

            {loading && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Spin />
              </div>
            )}
          </Card>
        </Col>
      </Row>

     
    </div>
  );
}

export default FindBench;
