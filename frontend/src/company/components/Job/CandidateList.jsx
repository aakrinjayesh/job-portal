import React, { useEffect, useState } from "react";
import { Spin, message, Button, Table, Tag } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { GetCandidateDeatils } from "../../api/api";

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

  // TABLE COLUMNS
  const columns = [
    {
      title: "Fit Score",
      dataIndex: "matchScore",
      key: "matchScore",
      //width: 200,
      fixed: "left",
      render: (score) => {
        if (score == null) return <Tag color="default">N/A</Tag>;

        let color = "default";
        if (score >= 80) color = "green";
        else if (score >= 60) color = "blue";
        else if (score >= 40) color = "orange";
        else color = "red";

        return <Tag color={color}>{score}%</Tag>;
      },
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      //width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },

    {
      title: "Key Match Skills",
      //width: 200,
      key: "keyMatchSkills",
      render: (_, record) => {
        const list = record?.aiAnalysis?.key_match_skills || [];
        return (
          <div style={{ maxHeight: 80, overflowY: "auto" }}>
            {list.length > 0 ? (
              list.map((s) => (
                <Tag color="green" key={s} style={{ marginBottom: 4 }}>
                  {s}
                </Tag>
              ))
            ) : (
              <Tag>N/A</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Key Gap Skills",
      width: 200,
      key: "keyGapSkills",
      render: (_, record) => {
        const list = record?.aiAnalysis?.key_gap_skills || [];
        return (
          <div style={{ maxHeight: 80, overflowY: "auto", scrollbarWidth: "none" }}>
            {list.length > 0 ? (
              list.map((s) => (
                <Tag color="red" key={s} style={{ marginBottom: 4 }}>
                  {s}
                </Tag>
              ))
            ) : (
              <Tag>N/A</Tag>
            )}
          </div>
        );
      },
    },


    {
      title: "Key Match Clouds",
      width: 200,
      key: "keyMatchClouds",
      render: (_, record) => {
        const list = record?.aiAnalysis?.key_match_clouds || [];
        return (
          <div style={{ maxHeight: 80, overflowY: "auto" }}>
            {list.length > 0 ? (
              list.map((c) => (
                <Tag color="blue" key={c} style={{ marginBottom: 4 }}>
                  {c}
                </Tag>
              ))
            ) : (
              <Tag>N/A</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Key Gap Clouds",
      width: 200,
      key: "keyGapClouds",
      render: (_, record) => {
        const list = record?.aiAnalysis?.key_gap_clouds || [];
        return (
          <div style={{ maxHeight: 80, overflowY: "auto" }}>
            {list.length > 0 ? (
              list.map((c) => (
                <Tag color="orange" key={c} style={{ marginBottom: 4 }}>
                  {c}
                </Tag>
              ))
            ) : (
              <Tag>N/A</Tag>
            )}
          </div>
        );
      },
    },

    // RIGHT FIXED COLUMNS
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      //width: 200,
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
     // width: 200,
    },
    {
      title: "Applied On",
      dataIndex: "appliedAt",
      key: "appliedAt",
     // width: 200,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Location",
      dataIndex: ["profile", "currentLocation"],
      key: "currentLocation",
      //width: 200,
      render: (text) => text || "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      //width: 100,
      fixed: "right",
      render: (_, record) => (
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
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Button
        type="text"
        onClick={() => navigate("/company/jobs")}
        icon={<ArrowLeftOutlined />}
        style={{ marginBottom: 5 }}
      >
        Back
      </Button>

      <Spin spinning={loading}>
        <div style={{ width: "100%", overflowX: "auto" }}>
          <Table
            columns={columns}
            dataSource={candidates}
            rowKey={(record) => record.id || record.userId}
            bordered
            scroll={{ x: "max-content" }} // FIXED SCROLL
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
          />
        </div>
      </Spin>
    </div>
  );
};

export default CandidateList;
