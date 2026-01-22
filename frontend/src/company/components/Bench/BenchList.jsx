import React, { useState, useEffect } from "react";
import { Row, Col, Dropdown,Button,Tooltip } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import BenchCard from "./BenchCard";

const BenchList = ({ bench, isFilterOpen, toggleFilter, lastBenchRef }) => {
  const [sortedCandidates, setSortedCandidates] = useState([]);
  const [sortOrder, setSortOrder] = useState("dsc");

 const sortMenu = {
  items: [
    { key: "dsc", label: "Posted Time" },
    { key: "asc", label: "Posted Time (Oldest)" },
    { key: "exp", label: "Experience (High to Low)" },
    { key: "rate", label: "Rate (High to Low)" },
  ],
  onClick: ({ key }) => handleSort(key),
};


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
      {/* FILTER TOGGLE */}
    <Tooltip title={isFilterOpen ? "Hide Filters" : "Show Filters"}>
      <Button
        type="text"
        onClick={toggleFilter}
        style={{ fontSize: 20 }}
        icon={
          isFilterOpen ? <LeftOutlined /> : <LeftOutlined />
        }
      />
    </Tooltip>
    Find Candidate
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

    {/* SORT TEXT STYLE */}
    <Dropdown menu={sortMenu} trigger={["click"]}>
      <span
        style={{
          cursor: "pointer",
          fontSize: 14,
          color: "#6B7280",
          userSelect: "none",
        }}
      >
        Sort by:{" "}
        <span style={{ color: "#1677FF", fontWeight: 500 }}>
          {sortOrder === "asc"
            ? "Posted Time (Oldest)"
            : sortOrder === "exp"
            ? "Experience"
            : sortOrder === "rate"
            ? "Rate"
            : "Posted Time"}
        </span>{" "}
        <DownOutlined />
      </span>
    </Dropdown>
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
