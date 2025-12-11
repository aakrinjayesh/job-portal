import React from "react";
import { Row, Col } from "antd";
import BenchCard from "./BenchCard";

const BenchList = ({ bench, isFilterOpen, toggleFilter, onViewDetails, lastBenchRef }) => {
  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700 }}>Find Candidate</div>

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

      
      <Row gutter={[16, 16]}>
  {bench.map((c, index) => {
    const isLast = index === bench.length - 1;

    return (
      <Col
        span={24}
        key={c.id}
        ref={isLast ? lastBenchRef : null}   // ⭐ ADD THIS
      >
        <BenchCard candidate={c} onViewDetails={() => onViewDetails(c)} />
      </Col>
    );
  })}
</Row>

    </div>
  );
};

export default BenchList;
