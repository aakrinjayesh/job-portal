import React, { useEffect, useState } from "react";
import { Spin, message, Button, Table, Tag, Modal, Input } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { GetCandidateDeatils } from "../../api/api";
import { EyeOutlined } from "@ant-design/icons";
import { Popover } from "antd";



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
const [flags, setFlags] = useState({});
 


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

// ================= FLAG CONFIG =================

const FLAG_OPTIONS = [
  { key: "shortlisted", label: "Shortlisted", color: "#52c41a" },
  { key: "maybe", label: "Maybe", color: "#faad14" },
  { key: "hold", label: "Hold", color: "#fa8c16" },
  { key: "rejected", label: "Rejected", color: "#f5222d" },
];

const DEFAULT_FLAG_COLOR = "#BFBFBF";

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

// Dropdown content
const FlagDropdown = ({ record }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {FLAG_OPTIONS.map((flag) => (
      <div
        key={flag.key}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
        }}
        onClick={() =>
          setFlags((prev) => ({
            ...prev,
            [record.userId]: flag,
          }))
        }
      >
        <PennantFlag color={flag.color} />
        <span style={{ fontSize: 13 }}>{flag.label}</span>
      </div>
    ))}
  </div>
);






  // TABLE COLUMNS
  const columns = [

 {
  title: "Flags",
  key: "flags",
  width: 60,
  fixed: "left",
  align: "center",
  render: (_, record) => {
    const selectedFlag = flags[record.userId];

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
          <PennantFlag
            color={selectedFlag?.color || DEFAULT_FLAG_COLOR}
          />
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
      sorter: (a, b) => a.name.localeCompare(b.name),
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
          padding: "6px 16px",       // ✅ SAME AS FIGMA
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
  width:200,
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
          <Tag
            key={skill}
            color="green"
            style={chipStyle}
          >
            {skill}
          </Tag>
        ))}

        {remainingCount > 0 && (
          <span
            style={{
              color: "#1677ff",      // Ant Design link blue
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
          <Tag
            key={skill}
            color="red"
            style={chipStyle}
          >
            {skill}
          </Tag>
        ))}

        {remainingCount > 0 && (
          <span
            style={{
              color: "#1677ff",      // AntD link blue
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

    const visibleClouds = list.slice(0, 2);   // 👈 same count as others
    const remainingCount = list.length - 2;

    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {visibleClouds.map((cloud) => (
          <Tag
            key={cloud}
            color="blue"
            style={chipStyle}
          >
            {cloud}
          </Tag>
        ))}

        {remainingCount > 0 && (
          <span
            style={{
              color: "#1677ff",       // AntD link blue
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
          <Tag
            key={cloud}
            color="orange"
            style={chipStyle}
          >
            {cloud}
          </Tag>
        ))}

        {remainingCount > 0 && (
          <span
            style={{
              color: "#1677ff",     // Ant Design blue
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
        fontSize: 18,        // 👁 icon size
        color: "#595959",    // same grey as screenshot
        cursor: "pointer",
      }}
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/company/candidate/${record.userId}`, {
          state: { candidate: record, jobId },
        });
      }}
    />
  ),
}

  ];

  return (
    <div style={{ padding: 20 }}>
      {contextHolder}
      {/* BACK BUTTON */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/company/jobs")}
        style={{ marginBottom: 8 ,marginRight:10}}
      >
        Back
      </Button>

      {/* ✅ CREATE GROUP BUTTON */}
      <Button
        type="primary"
        style={{ marginBottom: 12 }}
        disabled={selectedCandidates.length === 0}
        onClick={() => setIsGroupModalOpen(true)}
       
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
