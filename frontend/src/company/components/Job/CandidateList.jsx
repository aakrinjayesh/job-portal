import React, { useEffect, useState } from "react";
import { Spin, message, Button, Table, Tag, Modal, Input } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { GetCandidateDeatils } from "../../api/api";

const CandidateList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location?.state?.id;
  const jobRole = location?.state?.jobRole;

  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [messageAPI, contextHolder] = message.useMessage();
  const [total, setTotal] = useState(0);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState(jobRole);

  // ✅ NEW STATE FOR GROUP CHAT
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const payload = { jobId };
        const response = await GetCandidateDeatils(payload);

        if (response?.data && response.data.length > 0) {
          setCandidates(response.data);
          setTotal(response.total || response.data.length);
        } else {
          setCandidates([]);
          messageAPI.warning("No candidates found for this job.");
        }
      } catch (error) {
        console.error("Error fetching candidates:", error);
        messageAPI.error("Failed to load candidates.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchCandidates();
  }, [jobId, page, pageSize]);

  // ✅ ROW SELECTION (CHECKBOX)
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedCandidates(rows);
    },
  };

  // TABLE COLUMNS
  const columns = [
    {
      title: "Fit Score",
      dataIndex: "matchScore",
      key: "matchScore",
      fixed: "left",
      render: (score) => {
        if (score == null) return <Tag>N/A</Tag>;

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
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Key Match Skills",
      key: "keyMatchSkills",
      render: (_, record) => {
        const list = record?.aiAnalysis?.key_match_skills || [];
        return (
          <div style={{ maxHeight: 80, overflowY: "auto" }}>
            {list.length ? (
              list.map((s) => (
                <Tag color="green" key={s}>
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
      key: "keyGapSkills",
      render: (_, record) => {
        const list = record?.aiAnalysis?.key_gap_skills || [];
        return (
          <div style={{ maxHeight: 80, overflowY: "auto" }}>
            {list.length ? (
              list.map((s) => (
                <Tag color="red" key={s}>
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
      key: "keyMatchClouds",
      render: (_, record) => {
        const list = record?.aiAnalysis?.key_match_clouds || [];
        return (
          <div style={{ maxHeight: 80, overflowY: "auto" }}>
            {list.length ? (
              list.map((c) => (
                <Tag color="blue" key={c}>
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
      key: "keyGapClouds",
      render: (_, record) => {
        const list = record?.aiAnalysis?.key_gap_clouds || [];
        return (
          <div style={{ maxHeight: 80, overflowY: "auto" }}>
            {list.length ? (
              list.map((c) => (
                <Tag color="orange" key={c}>
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
      title: "Location",
      dataIndex: ["profile", "currentLocation"],
      key: "currentLocation",
      render: (text) => text || "N/A",
    },
    {
      title: "Actions",
      key: "actions",
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
    <div style={{ padding: 20 }}>
      {contextHolder}
      {/* BACK BUTTON */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/company/jobs")}
        style={{ marginBottom: 8 }}
      >
        Back
      </Button>

      {/* ✅ CREATE GROUP BUTTON */}
      <Button
        type="primary"
        style={{ marginBottom: 12 }}
        disabled={selectedCandidates.length === 0}
        onClick={() => setIsGroupModalOpen(true)}
        // onClick={() => {
        //   const chatUserIds = selectedCandidates
        //     .map((c) => c?.profile?.chatuserid)
        //     .filter(Boolean);

        //   console.log("candidates ids", chatUserIds);
        //   if (!chatUserIds.length) {
        //     messageAPI.warning("No valid chat users found");
        //     return;
        //   }

        //   if (chatUserIds.length < 2) {
        //     messageAPI.warning("Select atleast 2 candidates to create group");
        //     return;
        //   }

        //   navigate("/company/chat", {
        //     state: {
        //       groupUserIds: chatUserIds,
        //       jobId,
        //     },
        //   });
        // }}
      >
        Create Group
      </Button>

      <Spin spinning={loading}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={candidates}
          rowKey={(record) => record.id || record.userId}
          bordered
          scroll={{ x: "max-content" }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
        <Modal
          title="Create Group Chat"
          open={isGroupModalOpen}
          onCancel={() => {
            setIsGroupModalOpen(false);
            setGroupName("");
          }}
          okText="Create"
          onOk={() => {
            if (!groupName.trim()) {
              message.warning("Please enter a group name");
              return;
            }

            const chatUserIds = selectedCandidates
              .map((c) => c?.profile?.chatuserid)
              .filter(Boolean);

            if (!chatUserIds.length) {
              message.warning("No valid chat users selected");
              return;
            }

            setIsGroupModalOpen(false);
            setGroupName("");

            console.log("participat", chatUserIds);
            console.log("groupname", groupName);

            if (chatUserIds.length < 1) {
              messageAPI.warning("Select atleast 2 candidates to create group");
              return;
            }

            const uniqueIds = [...new Set(chatUserIds)];
            console.log("uniueid", uniqueIds);
            navigate("/company/chat", {
              state: {
                groupUserIds: uniqueIds,
                groupName: groupName.trim(), // ✅ PASS GROUP NAME
              },
            });
          }}
        >
          <Input
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            maxLength={50}
          />
        </Modal>
      </Spin>
    </div>
  );
};

export default CandidateList;
