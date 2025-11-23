import React, { useEffect, useState } from "react";
import { Spin, message, Button, Table, Space, Popconfirm } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { GetCandidateDeatils } from "../../api/api"; // ✅ Correct API import

const CandidateList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location.state?.id;

  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const payload = { jobId, page, limit: pageSize };
        const response = await GetCandidateDeatils(payload);

        if (response?.data && response.data.length > 0) {
          setCandidates(response.data);
          setTotal(response.total || 0);
        } else {
          setCandidates([]);
          message.warning("No candidates found for this job.");
        }
      } catch (error) {
        console.error("Error fetching candidates:", error);
        message.error("Failed to load candidates.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchCandidates();
  }, [jobId, page, pageSize]);

  // ✅ Table Columns
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Applied On",
      dataIndex: "appliedAt",
      key: "appliedAt",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Title",
      dataIndex: ["profile", "title"],
      key: "title",
      render: (text) => text || "N/A",
    },
    {
      title: "Location",
      dataIndex: ["profile", "currentLocation"],
      key: "currentLocation",
      render: (text) => text || "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/company/candidate/${record.userId}`, {
                state: { candidate: record, jobId },
              });
            }}
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this candidate?"
            okText="Yes"
            cancelText="No"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(record);
            }}
            onCancel={(e) => e?.stopPropagation()}
          >
            <Button type="link" danger onClick={(e) => e.stopPropagation()}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleDelete = (record) => {
    message.info(`Delete clicked for ${record.name}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Button
        type="link"
        onClick={() => navigate("/company/jobs")}
        icon={<ArrowLeftOutlined />}
        style={{ marginBottom: "16px" }}
      >
        Back
      </Button>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={candidates}
          rowKey={(record) => record.id || record.userId}
          bordered
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            },
          }}
          onRow={(record) => ({
            onClick: () =>
              navigate(`/company/candidate/${record.userId}`, {
                state: { candidate: record, jobId },
              }),
          })}
          style={{ cursor: "pointer" }}
        />
      </Spin>
    </div>
  );
};

export default CandidateList;
