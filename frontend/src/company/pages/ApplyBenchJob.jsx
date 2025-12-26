import React, { useEffect, useState } from "react";
import { Table, Spin, message, Button } from "antd";
import { GetVendorCandidates } from "../api/api";
import { ApplyBenchCandidate } from "../api/api";

import { Tag, Tooltip } from "antd";

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
    onChange: (newSelectedRowKeys) => {
      console.log("ids selected", newSelectedRowKeys);
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  // ------------------- APPLY BUTTON FUNCTION -------------------
  const handleApply = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one candidate");
      return;
    }

    const payload = {
      jobId: jobId, // or get from props/location
      candidateProfileIds: selectedRowKeys,
    };

    try {
      setLoading(true);
      console.log("SelectedRowKeys:", selectedRowKeys);
      console.log("Candidates list:", candidates);
      const res = await ApplyBenchCandidate(payload);
      message.success("Applied successfully");
      messageApi.success("✅ Candidates applied successfully!");
      console.log(res);
    } catch (err) {
      messageApi.error("Something went wrong:" + err.response.data.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", width: 200 },

    // ✅ SKILLS COLUMN
    {
      title: "Skills",
      key: "skills",
      render: (_, r) => {
        const skills =
          r.skillsJson
            ?.filter((s) => s.level === "primary")
            .map((s) => s.name) || [];

        return renderTagsWithMore(skills, 3);
      },
    },

    // ✅ CLOUDS COLUMN
    {
      title: "Clouds",
      key: "clouds",
      render: (_, r) => {
        const clouds = r.primaryClouds.map((s) => s.name) || [];
        return renderTagsWithMore(clouds, 3);
      },
    },

    { title: "Location", dataIndex: "currentLocation", width: 200 },
    { title: "Experience", dataIndex: "totalExperience", width: 200 },
  ];

  // ------------------- FETCH CANDIDATES -------------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await GetVendorCandidates();
        const active = res?.data?.filter((x) => x.status !== "active");
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
      <h3>Apply with your Bench</h3>
      {contextHolder}
      <Button type="primary" style={{ marginBottom: 20 }} onClick={handleApply}>
        Apply with Selected Bench
      </Button>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        scroll={{ y: 400 }}
        dataSource={candidates}
        rowKey="id"
        // scroll={{ x: 1200, y: 500 }}
      />
    </Spin>
  );
};

export default ApplyBenchJob;
