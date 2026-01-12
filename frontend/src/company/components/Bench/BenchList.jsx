import React, { useState, useEffect } from "react";
import { Row, Col, Select } from "antd";
import BenchCard from "./BenchCard";

const BenchList = ({ bench, isFilterOpen, toggleFilter, lastBenchRef }) => {
  const [sortedCandidates, setSortedCandidates] = useState([]);
  const [sortOrder, setSortOrder] = useState("dsc");

  const sortOptions = [
    { value: "dsc", label: "Posted Time: Newest First" },
    { value: "asc", label: "Posted Time: Oldest First" },
    { value: "exp", label: "Experience: High to Low" },
    { value: "rate", label: "Rate: High to Low" },
  ];

  /* 🔁 Sync incoming bench data */
  useEffect(() => {
    setSortedCandidates(bench || []);
  }, [bench]);

  /* 🔃 Sort handler */
  const handleSort = (value) => {
    setSortOrder(value);

    let sorted = [...sortedCandidates];

    switch (value) {
      case "asc":
        sorted.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;

      case "dsc":
        sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;

      case "exp":
        sorted.sort(
          (a, b) =>
            (b.totalExperience || 0) - (a.totalExperience || 0)
        );
        break;

      case "rate":
        sorted.sort(
          (a, b) =>
            (b.rateCardPerHour?.value || b.rateCardPerHour || 0) -
            (a.rateCardPerHour?.value || a.rateCardPerHour || 0)
        );
        break;

      default:
        break;
    }

    setSortedCandidates(sorted);
  };

  return (
    <div>
      {/* 🔝 Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700 }}>
          Find Candidate
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Select
            value={sortOrder}
            options={sortOptions}
            onChange={handleSort}
            style={{ width: 280 }}
            placeholder="Sort Candidates"
          />

          <button
            onClick={toggleFilter}
            style={{
              border: "none",
              background: "#f0f0f0",
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {isFilterOpen ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      {/* 🧾 Candidate Cards */}
      <Row gutter={[16, 16]}>
        {sortedCandidates.map((candidate, index) => {
          const isLast = index === sortedCandidates.length - 1;

          return (
            <Col
              xs={24}
              key={candidate.id}
              ref={isLast ? lastBenchRef : null}
            >
              <BenchCard candidate={candidate} />
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default BenchList;
