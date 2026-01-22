import React, { useEffect, useState } from "react";
import { Spin, message, Button, Table, Tag, Modal, Input } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { GetCandidateDeatils } from "../../api/api";
import { EyeOutlined } from "@ant-design/icons";
import { Popover } from "antd";

import {
  MarkCandidateReviewed,
  UpdateVendorCandidateStatus,
} from "../../api/api";

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
  const [statusMap, setStatusMap] = useState({});

  const [candidateType, setCandidateType] = useState("ALL");

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const payload = { jobId };
        const response = await GetCandidateDeatils(payload);

        if (response?.data && response.data.length > 0) {
          const map = {};
          response.data.forEach((c) => {
            map[c.applicationId] = c.status || "Pending";
          });
          setStatusMap(map);
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

  const filteredCandidates = candidates
    .filter((c) => {
      const vendorId = c?.profile?.vendorId;

      if (candidateType === "ALL") return true;
      if (candidateType === "NORMAL") return vendorId == null;
      if (candidateType === "VENDOR") return vendorId != null;

      return true;
    })
    .filter((c) => {
      if (!searchText.trim()) return true;

      const name = c?.name?.toLowerCase() || "";
      const title = c?.profile?.title?.toLowerCase() || "";

      return (
        name.includes(searchText.toLowerCase()) ||
        title.includes(searchText.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (!searchText.trim()) return 0;

      const aName = a?.name?.toLowerCase() || "";
      const bName = b?.name?.toLowerCase() || "";

      const q = searchText.toLowerCase();

      const aMatch = aName.includes(q);
      const bMatch = bName.includes(q);

      // 👇 matches come to top
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

  // ✅ ROW SELECTION (CHECKBOX)
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedCandidates(rows);
    },
  };

  // ✅ write this at the TOP of the file (below imports)
  const chipStyle = {
    padding: "6px 8px",
    borderRadius: 4,
    fontSize: 12,
    lineHeight: "14px",
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  };

  const DEFAULT_FLAG_COLOR = "#BFBFBF";

  const STATUS_FLAG_MAP = {
    Pending: { label: "Pending", color: "#bfbfbf" },
    Reviewed: { label: "Reviewed", color: "#1890ff" },
    Shortlisted: { label: "Shortlisted", color: "#52c41a" },
    Rejected: { label: "Rejected", color: "#f5222d" },
    Bookmark: { label: "Bookmark", color: "#faad14" }, // gold
    Clear: { label: "Clear", color: "#1677ff" },
  };

  // const MANUAL_STATUS_OPTIONS = [
  //   "Shortlisted", "Pending", "Rejected", "Clear","Bookmark",];

  const MANUAL_STATUS_OPTIONS = [
    "Pending",
    "Shortlisted",
    "Rejected",
    "Bookmark",
    "Clear",
  ];

  // Triangle flag (same as Figma)
  const PennantFlag = ({ color = DEFAULT_FLAG_COLOR }) => (
    <div
      style={{
        width: 0,
        height: 0,
        borderTop: "7px solid transparent",
        borderBottom: "7px solid transparent",
        borderLeft: `14px solid ${color}`,
      }}
    />
  );

  const FlagDropdown = ({ record }) => {
    // const currentStatus = record.status || "Pending";
    const currentStatus = statusMap[record.applicationId] || "Pending";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MANUAL_STATUS_OPTIONS.map((status) => {
          const isActive = currentStatus === status;

          return (
            <div
              key={status}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: 6,
                backgroundColor: isActive ? "#f5f5f5" : "transparent",
                fontWeight: isActive ? 600 : 400,
              }}
              onClick={async () => {
                const finalStatus = status === "Clear" ? "Pending" : status;

                await UpdateVendorCandidateStatus({
                  jobApplicationId: record.applicationId,
                  status: finalStatus,
                });

                // setCandidates((prev) =>
                //   prev.map((c) =>
                //     c.id === record.applicationId
                //       ? { ...c, status: finalStatus }
                //       : c
                //   )
                // );
                setStatusMap((prev) => ({
                  ...prev,
                  [record.applicationId]: finalStatus,
                }));
              }}
            >
              {/* ✅ KEEP ORIGINAL FLAG COLOR ALWAYS */}
              <PennantFlag color={STATUS_FLAG_MAP[status].color} />

              <span style={{ fontSize: 13 }}>
                {STATUS_FLAG_MAP[status].label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const FLAG_FILTER_STATUSES = [
    "Pending",
    "Reviewed",
    "Shortlisted",
    "Rejected",
    "Bookmark",
  ];

  // TABLE COLUMNS
  const columns = [
    {
      title: "Flags",
      key: "flags",
      width: 60,
      fixed: "left",
      align: "center",

      // ✅ ADD THIS (custom flag UI)
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8, minWidth: 160 }}>
          {FLAG_FILTER_STATUSES.map((status) => {
            const isActive = selectedKeys[0] === status;

            return (
              <div
                key={status}
                onClick={() => {
                  setSelectedKeys([status]); // single select
                  confirm(); // apply instantly
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "6px 8px",
                  borderRadius: 6,
                  backgroundColor: isActive ? "#f5f5f5" : "transparent",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <PennantFlag color={STATUS_FLAG_MAP[status].color} />
                <span>{STATUS_FLAG_MAP[status].label}</span>
              </div>
            );
          })}

          <div
            onClick={() => {
              clearFilters();
              confirm();
            }}
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#1677ff",
              cursor: "pointer",
              textAlign: "right",
            }}
          >
            Clear
          </div>
        </div>
      ),

      // ✅ KEEP THIS (filter logic)
      onFilter: (value, record) => {
        const currentStatus = statusMap[record.applicationId] || "Pending";
        return currentStatus === value;
      },

      // ✅ KEEP THIS (row flag UI)
      render: (_, record) => {
        const currentStatus = statusMap[record.applicationId] || "Pending";
        const flagMeta = STATUS_FLAG_MAP[currentStatus];

        return (
          <Popover
            trigger="click"
            placement="right"
            content={<FlagDropdown record={record} />}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: "pointer" }}
            >
              <PennantFlag color={flagMeta?.color || DEFAULT_FLAG_COLOR} />
            </div>
          </Popover>
        );
      },
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      // sorter: (a, b) => a.name.localeCompare(b.name),
    },

    {
      title: "Fit Score",
      dataIndex: "matchScore",
      key: "matchScore",
      render: (score) => {
        if (score == null) return <Tag>N/A</Tag>;

        let bgColor = "#f5f5f5";
        let textColor = "#000";
        let borderColor = "#d9d9d9";

        if (score >= 80) {
          bgColor = "#f6ffed";
          textColor = "#389e0d";
          borderColor = "#b7eb8f";
        } else if (score >= 60) {
          bgColor = "#e6f4ff";
          textColor = "#0958d9";
          borderColor = "#91caff";
        } else if (score >= 40) {
          bgColor = "#fff7e6";
          textColor = "#d46b08";
          borderColor = "#ffd591";
        } else {
          bgColor = "#fff1f0";
          textColor = "#cf1322";
          borderColor = "#ffa39e";
        }

        return (
          <span
            style={{
              padding: "6px 16px", // ✅ SAME AS FIGMA
              borderRadius: "8px",
              fontWeight: 500,
              fontSize: "13px",
              backgroundColor: bgColor,
              color: textColor,
              border: `1px solid ${borderColor}`,
              display: "inline-block",
              minWidth: 60,
              textAlign: "center",
            }}
          >
            {score}%
          </span>
        );
      },
    },

    {
      title: "Key Match Skills",
      width: 200,
      key: "keyMatchSkills",
      render: (_, record) => {
        const list = record?.aiAnalysis?.key_match_skills || [];

        if (!list.length) {
          return <Tag style={chipStyle}>NA</Tag>;
        }

        const visibleSkills = list.slice(0, 2); // 👈 show first 2
        const remainingCount = list.length - 2;

        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {visibleSkills.map((skill) => (
              <Tag key={skill} color="green" style={chipStyle}>
                {skill}
              </Tag>
            ))}

            {remainingCount > 0 && (
              <span
                style={{
                  color: "#1677ff", // Ant Design link blue
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "22px",
                  textDecoration: "underline",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // optional: modal / tooltip later
                  console.log("All match skills:", list);
                }}
              >
                +{remainingCount} more
              </span>
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

        if (!list.length) {
          return <Tag style={chipStyle}>NA</Tag>;
        }

        const visibleSkills = list.slice(0, 2);
        const remainingCount = list.length - 2;

        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {visibleSkills.map((skill) => (
              <Tag key={skill} color="red" style={chipStyle}>
                {skill}
              </Tag>
            ))}

            {remainingCount > 0 && (
              <span
                style={{
                  color: "#1677ff", // AntD link blue
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "22px",
                  textDecoration: "underline",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // OPTIONAL: later you can open modal / tooltip here
                  console.log("All gap skills:", list);
                }}
              >
                +more
              </span>
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

        if (!list.length) {
          return <Tag style={chipStyle}>NA</Tag>;
        }

        const visibleClouds = list.slice(0, 2); // 👈 same count as others
        const remainingCount = list.length - 2;

        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {visibleClouds.map((cloud) => (
              <Tag key={cloud} color="blue" style={chipStyle}>
                {cloud}
              </Tag>
            ))}

            {remainingCount > 0 && (
              <span
                style={{
                  color: "#1677ff", // AntD link blue
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "22px",
                  textDecoration: "underline",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // later: open modal / tooltip if needed
                  console.log("All match clouds:", list);
                }}
              >
                +{remainingCount} more
              </span>
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

        // If no data
        if (!list.length) {
          return <Tag style={chipStyle}>NA</Tag>;
        }

        // Show only first 2
        const visibleClouds = list.slice(0, 2);
        const remainingCount = list.length - 2;

        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {visibleClouds.map((cloud) => (
              <Tag key={cloud} color="orange" style={chipStyle}>
                {cloud}
              </Tag>
            ))}

            {remainingCount > 0 && (
              <span
                style={{
                  color: "#1677ff", // Ant Design blue
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "22px",
                  textDecoration: "underline",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // optional: open modal / tooltip later
                  console.log("All gap clouds:", list);
                }}
              >
                +{remainingCount} more
              </span>
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
      align: "center",
      render: (_, record) => (
        <EyeOutlined
          style={{
            fontSize: 18, // 👁 icon size
            color: "#595959", // same grey as screenshot
            cursor: "pointer",
          }}
          onClick={async (e) => {
            e.stopPropagation();

            // ✅ 1. Try marking reviewed (do NOT block navigation)
            try {
              if (record?.id) {
                await MarkCandidateReviewed({
                  // jobApplicationId: record.id,
                  // jobApplicationId: record.jobApplicationId,
                  jobApplicationId: record.applicationId,
                });
              }
            } catch (err) {
              console.warn("Mark reviewed failed, continuing navigation");
            }

            // ✅ 2. Update UI optimistically
            setCandidates((prev) =>
              prev.map((c) =>
                // c.id === record.id
                c.applicationId === record.applicationId
                  ? { ...c, status: "Reviewed" }
                  : c,
              ),
            );

            // ✅ 3. ALWAYS navigate
            navigate(`/company/candidate/${record.profile.id}`, {
              state: {
                candidate: { ...record, status: "Reviewed" },
                jobId,
              },
            });
          }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      {contextHolder}

      {/* ================= FIGMA HEADER CARD ================= */}
      <div
        style={{
          width: "100%",
          padding: 8,
          background: "#FFFFFF",
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {/* LEFT SIDE – TOGGLES */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/company/jobs")}
            style={{ marginBottom: 8, marginRight: 10 }}
          >
            Back
          </Button>

          {/* ALL */}
          <div
            onClick={() => setCandidateType("ALL")}
            style={{
              height: 32,
              borderRadius: 6,
              outline:
                candidateType === "ALL"
                  ? "1px solid #3F41D1"
                  : "1px solid #A3A3A3",
              background: candidateType === "ALL" ? "#EBEBFA" : "#FFFFFF",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <div style={{ padding: "4px 12px" }}>
              <span
                style={{
                  color: candidateType === "ALL" ? "#3F41D1" : "#666666",
                  fontSize: 13,
                  fontWeight: candidateType === "ALL" ? 500 : 400,
                }}
              >
                All ({candidates.length})
              </span>
            </div>
          </div>

          {/* NORMAL */}
          <div
            onClick={() => setCandidateType("NORMAL")}
            style={{
              height: 32,

              borderRadius: 6,
              outline:
                candidateType === "NORMAL"
                  ? "1px solid #3F41D1"
                  : "1px solid #A3A3A3",
              background: candidateType === "NORMAL" ? "#EBEBFA" : "#FFFFFF",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <div style={{ padding: "4px 12px" }}>
              <span
                style={{
                  color: candidateType === "NORMAL" ? "#3F41D1" : "#666666",
                  fontSize: 13,
                  fontWeight: candidateType === "NORMAL" ? 500 : 400,
                }}
              >
                Normal Candidates (
                {candidates.filter((c) => c?.profile?.vendorId == null).length})
              </span>
            </div>
          </div>

          {/* VENDOR */}
          <div
            onClick={() => setCandidateType("VENDOR")}
            style={{
              height: 32,
              borderRadius: 6,
              outline:
                candidateType === "VENDOR"
                  ? "1px solid #3F41D1"
                  : "1px solid #A3A3A3",
              background: candidateType === "VENDOR" ? "#EBEBFA" : "#FFFFFF",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <div style={{ padding: "4px 12px" }}>
              <span
                style={{
                  color: candidateType === "VENDOR" ? "#3F41D1" : "#666666",
                  fontSize: 13,
                  fontWeight: candidateType === "VENDOR" ? 500 : 400,
                }}
              >
                Bench Candidates (
                {candidates.filter((c) => c?.profile?.vendorId != null).length})
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE – SEARCH + CREATE GROUP */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* SEARCH */}
          <Input
            placeholder="Search by name or title"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: 200,
              height: 36,
              borderRadius: 20,
              fontSize: 13,
            }}
          />

          {/* CREATE GROUP CHAT (SAME LOGIC, FIGMA STYLE) */}
          <div
            onClick={() =>
              selectedCandidates.length === 0 ? null : setIsGroupModalOpen(true)
            }
            style={{
              height: 36,
              borderRadius: 20,
              padding: "6px 18px",
              background:
                selectedCandidates.length === 0 ? "#EBEBEB" : "#1677FF",
              display: "flex",
              alignItems: "center",
              cursor:
                selectedCandidates.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            <span
              style={{
                color: selectedCandidates.length === 0 ? "#A3A3A3" : "#FFFFFF",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              + Create Group Chat
            </span>
          </div>
        </div>
      </div>

      <Spin spinning={loading}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          // dataSource={candidates}
          dataSource={filteredCandidates}
          // rowKey={(record) => record.id || record.userId}
          // rowKey={(record) => record.id}
          rowKey={(record) => record.applicationId}
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
