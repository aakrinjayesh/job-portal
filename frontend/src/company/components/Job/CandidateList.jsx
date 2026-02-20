import React, { useEffect, useState } from "react";
import { Progress, message, Button, Table, Tag, Modal, Input } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { GetCandidateList, CVEligibility } from "../../api/api";
import { EyeOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import CandidateActivity from "../activity/CandidateActivity";

import {
  MarkCandidateReviewed,
  UpdateVendorCandidateStatus,
  MarkCandidateBookmark,
} from "../../api/api";

const CandidateList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location?.state?.id;
  const jobRole = location?.state?.jobRole;
  const highlight = location.state.highlight;

  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [messageAPI, contextHolder] = message.useMessage();
  const [total, setTotal] = useState(0);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState(jobRole);
  const [progress, setProgress] = useState(0);
  const [generatingMap, setGeneratingMap] = useState({});

  // ✅ NEW STATE FOR GROUP CHAT
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  const [candidateType, setCandidateType] = useState("ALL");

  const [searchText, setSearchText] = useState("");
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityCandidate, setActivityCandidate] = useState(null);
  const [activityTab, setActivityTab] = useState("NOTE");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setProgress(10);

        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) return prev;
            return prev + 10;
          });
        }, 200);

        const payload = { jobId };
        const response = await GetCandidateList(payload);

        clearInterval(interval);

        setProgress(100);

        setTimeout(() => {
          setLoading(false);
        }, 400);

        if (response?.data && response.data.length > 0) {
          const map = {};
          response.data.forEach((c) => {
            if (c.status === "Rejected") {
              map[c.applicationId] = "Rejected";
            } else if (c.status === "BookMark") {
              map[c.applicationId] = "BookMark";
            } else {
              map[c.applicationId] = "Not Updated";
            }
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
      }
    };

    if (jobId) fetchCandidates();
  }, [jobId]);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const payload = { jobId };
        const response = await GetCandidateList(payload);

        if (response?.data && response.data.length > 0) {
          const map = {};
          // response.data.forEach((c) => {
          //   map[c.applicationId] = c.status || "Pending";
          // });
          response.data.forEach((c) => {
            if (c.status === "Rejected") {
              map[c.applicationId] = "Rejected";
            } else if (c.status === "BookMark") {
              map[c.applicationId] = "BookMark";
            } else {
              map[c.applicationId] = "Not Updated";
            }
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
  // ✅ SHOW ONLY ACTIVE CANDIDATES
  .filter((c) => c?.status?.toLowerCase() === "active")

  // Existing Vendor Filter
  .filter((c) => {
    const vendorId = c?.profile?.vendorId;

    if (candidateType === "ALL") return true;
    if (candidateType === "NORMAL") return vendorId == null;
    if (candidateType === "VENDOR") return vendorId != null;

    return true;
  })
    // .filter((c) => {
    //   if (!searchText.trim()) return true;

    //   const name = c?.name?.toLowerCase() || "";
    //   const title = c?.profile?.title?.toLowerCase() || "";

    //   return (
    //     name.includes(searchText.toLowerCase()) ||
    //     title.includes(searchText.toLowerCase())
    //   );
    // })

    .filter((c) => {
      if (!searchText.trim()) return true;

      const q = searchText.toLowerCase();

      const name = c?.name?.toLowerCase() || "";
      const title = c?.profile?.title?.toLowerCase() || "";
      const email = c?.email?.toLowerCase() || "";
      const phone = c?.profile?.phoneNumber?.toLowerCase() || "";
      const location = c?.profile?.currentLocation?.toLowerCase() || "";
      // const fitScore = c?.matchScore?.toString() || "";
      const fitScore =
        c?.matchScore !== undefined && c?.matchScore !== null
          ? `${c.matchScore}%`
          : "";

      const keyMatchSkills =
        c?.aiAnalysis?.key_match_skills?.join(" ").toLowerCase() || "";

      const keyGapSkills =
        c?.aiAnalysis?.key_gap_skills?.join(" ").toLowerCase() || "";

      const keyMatchClouds =
        c?.aiAnalysis?.key_match_clouds?.join(" ").toLowerCase() || "";

      const keyGapClouds =
        c?.aiAnalysis?.key_gap_clouds?.join(" ").toLowerCase() || "";

      return (
        name.includes(q) ||
        title.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        location.includes(q) ||
        fitScore.includes(q) ||
        keyMatchSkills.includes(q) ||
        keyGapSkills.includes(q) ||
        keyMatchClouds.includes(q) ||
        keyGapClouds.includes(q)
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
    // Pending: { label: "Pending", color: "#bfbfbf" },
    // Reviewed: { label: "Reviewed", color: "#1890ff" },
    // Shortlisted: { label: "Shortlisted", color: "#52c41a" },
    Rejected: { label: "Rejected", color: "#f5222d" },
    BookMark: { label: "BookMark", color: "#faad14" }, // gold
    // Clear: { label: "Clear", color: "#ff16ecff" },
  };

  const MANUAL_STATUS_OPTIONS = [
    // "Pending",
    // "Shortlisted",
    "Rejected",
    "BookMark",
    // "Clear",
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
    // const currentStatus = statusMap[record.applicationId] || "Pending";
    const currentStatus = statusMap[record.applicationId] || "Not Updated";

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
              // onClick={async () => {
              //   const finalStatus = status === "Clear" ? "Pending" : status;

              //   await UpdateVendorCandidateStatus({
              //     jobApplicationId: record.applicationId,
              //     status: finalStatus,
              //   });

              //   setStatusMap((prev) => ({
              //     ...prev,
              //     [record.applicationId]: finalStatus,
              //   }));
              // }}
              onClick={async () => {
                const finalStatus = status === "Clear" ? "Pending" : status;

                try {
                  // if (finalStatus === "Bookmark") {
                  if (finalStatus === "BookMark") {
                    await MarkCandidateBookmark({
                      jobApplicationId: record.applicationId,
                    });
                  } else if (finalStatus === "Rejected") {
                    await UpdateVendorCandidateStatus({
                      jobApplicationId: record.applicationId,
                      status: "Rejected",
                    });
                  }

                  // ✅ Update UI
                  setStatusMap((prev) => ({
                    ...prev,
                    [record.applicationId]: finalStatus,
                  }));
                } catch (err) {
                  messageAPI.error("Failed to update status");
                }
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
    // "Pending",
    // "Reviewed",
    // "Shortlisted",
    "Rejected",
    "BookMark",
  ];

  // ✅ Generate Fit Score (Per-row loading + prevent double click + instant update)
  const generateFitScore = async (record) => {
    console.log("record generateFitscore", record);
    try {
      // 🔒 Prevent double clicks
      if (generatingMap[record.applicationId]) return;

      setGeneratingMap((prev) => ({
        ...prev,
        [record.applicationId]: true,
      }));

      messageAPI.loading({
        content: "Generating AI Fit Score...",
        key: `fitScore-${record.applicationId}`,
      });

      const payload = {
        jobApplicationId: record.applicationId,
        jobId: jobId,
        candidateProfileId: record.profile.id,
        force: false, // backend handles existing reuse
      };

      const response = await CVEligibility(payload);

      if (response?.status === "success") {
        messageAPI.success({
          content: response.message,
          key: `fitScore-${record.applicationId}`,
        });

        // ✅ Instant table update
        setCandidates((prev) =>
          prev.map((c) =>
            c.applicationId === record.applicationId
              ? {
                  ...c,
                  matchScore: response.data.fitPercentage,
                  aiAnalysis: response.data.analysis,
                }
              : c,
          ),
        );
      }
    } catch (error) {
      messageAPI.error({
        content: "Failed to generate Fit Score",
        key: `fitScore-${record.applicationId}`,
      });
    } finally {
      setGeneratingMap((prev) => ({
        ...prev,
        [record.applicationId]: false,
      }));
    }
  };

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
        // const currentStatus = statusMap[record.applicationId] || "Pending";
        const currentStatus = statusMap[record.applicationId] || "Not Updated";

        return currentStatus === value;
      },

      // ✅ KEEP THIS (row flag UI)
      render: (_, record) => {
        // const currentStatus = statusMap[record.applicationId] || "Pending";
        const currentStatus = statusMap[record.applicationId] || "Not Updated";

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

    // {
    //   title: "Name",
    //   dataIndex: "name",
    //   key: "name",
    //   fixed: "left",
    //   // sorter: (a, b) => a.name.localeCompare(b.name),
    // },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      render: (text, record) => (
        <span
          onClick={async (e) => {
            e.stopPropagation();

            try {
              await MarkCandidateReviewed({
                jobApplicationId: record.applicationId,
              });
            } catch {}

            setCandidates((prev) =>
              prev.map((c) =>
                c.applicationId === record.applicationId
                  ? { ...c, status: "Reviewed" }
                  : c,
              ),
            );

            navigate(`/company/candidate/${record.profile.id}`, {
              state: {
                candidate: { ...record, status: "Reviewed" },
                jobId,
                highlight: highlight || "findbench",
              },
            });
          }}
          style={{ color: "#1677ff", cursor: "pointer" }}
        >
          {text}
        </span>
      ),
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
                  // textDecoration: "underline",
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
                  // textDecoration: "underline",
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
                  // textDecoration: "underline",
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
                  // textDecoration: "underline",
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

    // {
    //   title: "Email",
    //   dataIndex: "email",
    //   key: "email",
    //   sorter: (a, b) => a.email.localeCompare(b.email),
    // },
    {
      title: "Email",
      key: "email",
      render: (_, record) => {
        const displayEmail =
          record?.isVendor && record?.vendor?.email
            ? record.vendor.email
            : record.email;

        return displayEmail || "N/A";
      },
      sorter: (a, b) => {
        const emailA =
          a?.isVendor && a?.vendor?.email ? a.vendor.email : a.email || "";
        const emailB =
          b?.isVendor && b?.vendor?.email ? b.vendor.email : b.email || "";

        return emailA.localeCompare(emailB);
      },
    },

    {
      title: "Phone Number",
      dataIndex: ["profile", "phoneNumber"],
      key: "phone",
      render: (phone) => phone || "N/A",
    },

    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   key: "status",
    // },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const currentStatus = statusMap[record.applicationId] || "Not Updated";

        return currentStatus;
      },
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
      render: (_, record) => {
        const openActivityOnly = async (type) => {
          // try {
          //   await MarkCandidateReviewed({
          //     jobApplicationId: record.applicationId,
          //   });
          // } catch {}

          // setCandidates((prev) =>
          //   prev.map((c) =>
          //     c.applicationId === record.applicationId
          //       ? { ...c, status: "Reviewed" }
          //       : c
          //   )
          // );

          // ✅ OPEN MODAL INSTEAD
          setActivityCandidate(record);
          setActivityTab(type); // "NOTE" or "TODO"
          setActivityModalOpen(true);
        };

        return (
          <Popover
            trigger="click"
            placement="left"
            content={
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* 🤖 Generate Fit Score */}
                <div
                  style={{
                    cursor: generatingMap[record.applicationId]
                      ? "not-allowed"
                      : "pointer",
                    padding: "6px 10px",
                    opacity: generatingMap[record.applicationId] ? 0.6 : 1,
                    fontWeight: 500,
                  }}
                  onClick={() =>
                    !generatingMap[record.applicationId] &&
                    generateFitScore(record)
                  }
                >
                  {generatingMap[record.applicationId]
                    ? "⏳ Generating..."
                    : record.matchScore
                      ? "🔄 Regenerate Fit Score"
                      : "🤖 Generate Fit Score"}
                </div>

                <div
                  style={{ cursor: "pointer", padding: "6px 10px" }}
                  onClick={() => openActivityOnly("NOTE")}
                >
                  📝 Notes
                </div>

                <div
                  style={{ cursor: "pointer", padding: "6px 10px" }}
                  onClick={() => openActivityOnly("TODO")}
                >
                  ✅ Todo
                </div>
              </div>
            }
          >
            <EyeOutlined
              style={{ fontSize: 18, cursor: "pointer" }}
              onClick={(e) => e.stopPropagation()}
            />
          </Popover>
        );
      },
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
          {/* <Input
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
          /> */}
          <Input
            placeholder="Search by name or title"
            allowClear
            value={searchText}
            onChange={(e) => {
              const value = e.target.value;

              // Allow only letters, numbers and space
              const filteredValue = value.replace(/[^a-zA-Z0-9 ]/g, "");

              setSearchText(filteredValue);
            }}
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

      {loading ? (
        <div
          style={{
            height: "60vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <Progress
            type="circle"
            percent={progress}
            width={120}
            strokeColor={{
              "0%": "#1677FF",
              "100%": "#52c41a",
            }}
            showInfo={false}
          />
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            Loading Candidates...
          </div>
        </div>
      ) : (
        <>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredCandidates}
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

              const uniqueIds = [...new Set(chatUserIds)];

              navigate("/company/chat", {
                state: {
                  groupUserIds: uniqueIds,
                  groupName: groupName.trim(),
                },
              });

              setIsGroupModalOpen(false);
              setGroupName("");
            }}
          >
            <Input
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={50}
            />
          </Modal>

          <Modal
            open={activityModalOpen}
            footer={null}
            width={420}
            destroyOnClose
            closable
            closeIcon={
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#595959",
                }}
              >
                ✕
              </span>
            }
            onCancel={() => setActivityModalOpen(false)}
          >
            {activityCandidate && (
              <CandidateActivity
                candidateId={activityCandidate.profile.id}
                jobId={jobId}
                defaultTab={activityTab}
              />
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default CandidateList;
