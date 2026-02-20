import React, { useEffect, useState } from "react";
import { Table, Spin, message, Button } from "antd";
import { GetVendorCandidates } from "../api/api";
import { ApplyBenchCandidate } from "../api/api";
import TableDesign from "./TableDesign";

import { Tag, Tooltip } from "antd";

const renderGreenTags = (items = [], max = 3) => {
  if (!items.length) return "-";

  const visible = items.slice(0, max);
  const extra = items.length - max;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        maxWidth: "100%",
      }}
    >
      {visible.map((item, idx) => (
        <Tag
          key={idx}
          style={{
            background: "#FBEBFF",
            borderRadius: 100,
            border: "1px solid #800080",
            whiteSpace: "nowrap", // ✅ prevent wrap
            maxWidth: 100,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item}
        </Tag>
      ))}

      {extra > 0 && (
        <Tag
          style={{
            background: "transparent",
            borderRadius: 100,
            color: "#1976d2",
            whiteSpace: "nowrap", // ✅ prevent wrap
            cursor: "pointer",
            maxWidth: 100,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          +{extra} more
        </Tag>
      )}
    </div>
  );
};

const renderPinkTags = (items = [], max = 3) => {
  if (!items.length) return "-";

  const visible = items.slice(0, max);
  const extra = items.length - max;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        maxWidth: "100%",
      }}
    >
      {visible.map((item, idx) => (
        <Tag
          key={idx}
          style={{
            background: "#E7F0FE",
            borderRadius: 100,
            border: "1px solid #1677FF",
            whiteSpace: "normal",
          }}
        >
          {item}
        </Tag>
      ))}

      {extra > 0 && (
        <Tag
          style={{
            color: "#1976d2",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          +{extra} more
        </Tag>
      )}
    </div>
  );
};

const renderTagsWithMore = (items = [], max = 3) => {
  if (!items.length) return "-";

  const visible = items.slice(0, max);
  const extraCount = items.length - max;

  return (
    <>
      {visible.map((item, idx) => (
        <Tag key={idx} color="blue" style={{ marginBottom: 4 }}>
          {item}
        </Tag>
      ))}

      {extraCount > 0 && (
        <Tooltip title={items.join(", ")}>
          <Tag color="default">+{extraCount} more</Tag>
        </Tooltip>
      )}
    </>
  );
};

const ApplyBenchJob = ({ jobId }) => {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, selectedRow) => {
      console.log("ids selected", newSelectedRowKeys);
      setSelectedRowKeys(newSelectedRowKeys);
    },
    preserveSelectedRowKeys: true,
  };

  // ------------------- APPLY BUTTON FUNCTION -------------------
  const handleApply = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning("Please select at least one candidate");
      return;
    }

    const payload = {
      jobId,
      candidateProfileIds: selectedRowKeys,
    };

    try {
      // ✅ Show loading message immediately
      const hide = messageApi.loading({
        content: "Applying selected candidates...",
        duration: 0, // keep until manually closed
      });

      const res = await ApplyBenchCandidate(payload);

      hide(); // remove loading message

      messageApi.success({
        content: `${selectedRowKeys.length} candidate(s) applied successfully`,
        duration: 3,
      });

      setSelectedRowKeys([]);
    } catch (err) {
      messageApi.error(
        err?.response?.data?.message || "❌ Failed to apply candidates",
      );
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", width: 180 },

    {
      title: "Clouds",
      key: "clouds",
      width: 260,
      render: (_, r) => {
        const clouds = r.primaryClouds.map((s) => s.name) || [];
        return renderPinkTags(clouds, 3);
      },
    },

    {
      title: "Skills",
      key: "skills",
      width: 280,
      render: (_, r) => {
        const skills =
          r.skillsJson
            ?.filter((s) => s.level === "primary")
            .map((s) => s.name) || [];
        return renderGreenTags(skills, 3);
      },
    },

    { title: "Location", dataIndex: "currentLocation", width: 180 },
    { title: "Experience", dataIndex: "totalExperience", width: 140 },
  ];

  // ------------------- FETCH CANDIDATES -------------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await GetVendorCandidates();
        const active = res?.data?.filter(
          (x) => x.status?.toLowerCase() === "active",
        );

        setCandidates(active || []);
      } catch (err) {
        message.error("Failed to load candidates");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Spin spinning={loading}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3 style={{ margin: 0 }}>Candidate List</h3>
        <div>
          <Button
            // onClick={handleApply}
            disabled={true}
            style={{
              background: "#E6F0FF",
              color: "#1D4ED8",
              border: "1px solid #C7D2FE",
              borderRadius: 20,
              padding: "4px 16px",
              height: 32,
              fontSize: 13,
              fontWeight: 500,
              marginRight: 5,
            }}
          >
            AI Eligibility Check
          </Button>

          {contextHolder}

          <Button
            onClick={handleApply}
            disabled={!selectedRowKeys.length}
            style={{
              background: "#E6F0FF",
              color: "#1D4ED8",
              border: "1px solid #C7D2FE",
              borderRadius: 20,
              padding: "4px 16px",
              height: 32,
              fontSize: 13,
              fontWeight: 500,
              marginTop: 20,
            }}
          >
            Apply With Selected Bench
          </Button>
        </div>
      </div>

      <TableDesign
        loading={loading}
        columns={columns}
        dataSource={candidates}
        rowKey="id"
        rowSelection={rowSelection}
        scroll={{ y: 400 }}
        emptyText="No bench candidates available"
        pagination={{
          pageSize: 5, // ✅ Number of candidates per page
          showSizeChanger: true, // Optional: allow user to change page size
          pageSizeOptions: ["5", "10", "20"], // Optional page size options
        }}
      />
    </Spin>
  );
};

export default ApplyBenchJob;
