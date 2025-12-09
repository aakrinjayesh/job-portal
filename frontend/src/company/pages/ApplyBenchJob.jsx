import React, { useEffect, useState } from "react";
import { Table, Spin, message, Button } from "antd";
import { GetVendorCandidates } from "../api/api";
import { ApplyBenchCandidate } from "../api/api";

const ApplyBenchJob = ({ jobId }) => {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // ------------------- HANDLE CHECKBOX -------------------
  const handleCheckboxChange = (id, checked) => {
    setSelectedRowKeys((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  // ------------------- APPLY BUTTON FUNCTION -------------------
  const handleApply = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one candidate");
      return;
    }

    const payload = {
      jobId: jobId, // or get from props/location
      candidateIds: selectedRowKeys,
    };

    try {
      setLoading(true);
      const res = await ApplyBenchCandidate(payload);
      message.success("Applied successfully");
      messageApi.success("✅ Candidates applied successfully!"); 
      console.log(res);
    } catch (err) {
      messageApi.error("Something went wrong:"+err.response.data.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- TABLE COLUMNS -------------------
  const columns = [
   {
  title: "",
  render: (_, record) => (
    <input
      type="checkbox"
      checked={selectedRowKeys.includes(record.id)}
      onChange={(e) => handleCheckboxChange(record.id, e.target.checked)}
      onClick={(e) => e.stopPropagation()}
    />
  ),
},
{ title: "Id", dataIndex: "id", key: "id" },

    { title: "Name", dataIndex: "name", width: 200 },
    {
      title: "Skills",
      key: "skills",
      render: (_, r) =>
        r.skillsJson
          ?.filter((s) => s.level === "primary")
          .map((s) => s.name)
          .join(", ") || "-",
    },
     { title: "Location", dataIndex: "currentLocation", width: 200 },
      { title: "Experience", dataIndex: "totalExperience", width: 200 },
    {
      title: "Status",
      dataIndex: "status",
      width: 150,
    },
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

      <Table
        columns={columns}
        dataSource={candidates}
       rowKey="userId"
        scroll={{ x: 1200, y: 500 }}
      />

      <Button type="primary" onClick={handleApply}>
        Apply with Selected Bench
      </Button>
    </Spin>
  );
};

export default ApplyBenchJob;
