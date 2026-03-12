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
  SaveCandidate,
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

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  const [candidateType, setCandidateType] = useState("ALL");

  const [searchText, setSearchText] = useState("");
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityCandidate, setActivityCandidate] = useState(null);
  const [activityTab, setActivityTab] = useState("NOTE");

  // 🆕 SCREENING ANSWERS MODAL STATE
  const [answersModalOpen, setAnswersModalOpen] = useState(false);
  const [answersCandidate, setAnswersCandidate] = useState(null);
  const [actionPopoverId, setActionPopoverId] = useState(null);
  const [savedCandidateIds, setSavedCandidateIds] = useState(new Set());

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
          const savedIds = new Set();
          response.data.forEach((c) => {
            map[c.applicationId] = c.status || "Pending";
            // if (c?.profile?.isSaved) {
            //   savedIds.add(c.profile.id);
            // }
            // ✅ CHANGE TO
            if (c?.profile?.isSaved === true && c?.status === "BookMark") {
              savedIds.add(c.profile.id);
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
          const savedIds = new Set();
          response.data.forEach((c) => {
            map[c.applicationId] = c.status || "Pending";
            // if (c?.profile?.isSaved) {
            //   savedIds.add(c.profile.id);
            // }
            // ✅ CHANGE TO
            if (c?.profile?.isSaved === true && c?.status === "BookMark") {
              savedIds.add(c.profile.id);
            }
          });

          setStatusMap(map);
          setSavedCandidateIds(savedIds);
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

      const q = searchText.toLowerCase();
      const name = c?.name?.toLowerCase() || "";
      const title = c?.profile?.title?.toLowerCase() || "";
      const email = c?.email?.toLowerCase() || "";
      const phone = c?.profile?.phoneNumber?.toLowerCase() || "";
      const loc = c?.profile?.currentLocation?.toLowerCase() || "";
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
        loc.includes(q) ||
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
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedCandidates(rows);
    },
  };

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
    Shortlisted: { label: "Shortlisted", color: "#52c41a" },
    Rejected: { label: "Rejected", color: "#f5222d" },
    BookMark: { label: "BookMark", color: "#faad14" },
  };

  const MANUAL_STATUS_OPTIONS = ["Shortlisted", "Rejected", "BookMark"];

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
                let finalStatus = status;
                if (status === "Clear") {
                  finalStatus = "Pending";
                }

                try {
                  // if (finalStatus === "BookMark") {
                  //   // ⭐ NEW CHECK (added)
                  //   if (savedCandidateIds.has(record.profile.id)) {
                  //     messageAPI.warning("Candidate already saved");

                  //     setStatusMap((prev) => ({
                  //       ...prev,
                  //       [record.applicationId]: "BookMark",
                  //     }));

                  //     return;
                  //   }
                  //   await MarkCandidateBookmark({
                  //     jobApplicationId: record.applicationId,
                  //   });
                  //   await SaveCandidate({
                  //     candidateProfileId: record.profile.id,
                  //   });
                  //   // ⭐ store saved candidate locally
                  //   setSavedCandidateIds((prev) =>
                  //     new Set(prev).add(record.profile.id),
                  //   );

                  //   // ⭐ Update UI immediately
                  //   setStatusMap((prev) => ({
                  //     ...prev,
                  //     [record.applicationId]: "BookMark",
                  //   }));

                  //   return; // ⭐ important - stop here
                  // }
                  if (finalStatus === "BookMark") {
                    // ⭐ Check if candidate already saved
                    if (
                      // record?.profile?.isSaved ||
                      savedCandidateIds.has(record.profile.id)
                    ) {
                      // messageAPI.warning("Candidate already saved");

                      setStatusMap((prev) => ({
                        ...prev,
                        [record.applicationId]: "BookMark",
                      }));

                      return;
                    }

                    // ⭐ Save new candidate
                    await MarkCandidateBookmark({
                      jobApplicationId: record.applicationId,
                    });

                    await SaveCandidate({
                      candidateProfileId: record.profile.id,
                    });

                    // ⭐ Add to saved list locally
                    setSavedCandidateIds((prev) => {
                      const updated = new Set(prev);
                      updated.add(record.profile.id);
                      return updated;
                    });

                    setStatusMap((prev) => ({
                      ...prev,
                      [record.applicationId]: "BookMark",
                    }));

                    return;
                  } else {
                    await UpdateVendorCandidateStatus({
                      jobApplicationId: record.applicationId,
                      status: finalStatus,
                    });
                  }

                  setStatusMap((prev) => ({
                    ...prev,
                    [record.applicationId]: finalStatus,
                  }));
                } catch (err) {
                  // catch (err) {
                  //   messageAPI.error("Failed to update status");
                  // }
                  const apiMessage =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to update status";
                  console.log("API Error:", apiMessage);

                  if (apiMessage) {
                    messageAPI.warning(apiMessage);
                    // ⭐ update UI immediately
                    setStatusMap((prev) => ({
                      ...prev,
                      [record.applicationId]: "BookMark",
                    }));
                  }
                }
              }}
            >
              <PennantFlag color={STATUS_FLAG_MAP[status].color} />
              <span style={{ fontSize: 13 }}>
                {STATUS_FLAG_MAP[status].label}
              </span>
            </div>
          );
        })}
        <div
          onClick={async () => {
            try {
              await UpdateVendorCandidateStatus({
                jobApplicationId: record.applicationId,
                status: "Pending",
              });
              setStatusMap((prev) => ({
                ...prev,
                [record.applicationId]: "Pending",
              }));
            } catch {
              messageAPI.error("Failed to clear status");
            }
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
    );
  };

  const FLAG_FILTER_STATUSES = ["Shortlisted", "Rejected", "BookMark"];

  const generateFitScore = async (record) => {
    try {
      if (generatingMap[record.applicationId]) return;

      setGeneratingMap((prev) => ({ ...prev, [record.applicationId]: true }));

      messageAPI.loading({
        content: "Generating AI Fit Score...",
        key: `fitScore-${record.applicationId}`,
      });

      const payload = {
        jobApplicationId: record.applicationId,
        jobId: jobId,
        candidateProfileId: record.profile.id,
        force: false,
      };

      const response = await CVEligibility(payload);

      if (response?.status === "success") {
        messageAPI.success({
          content: response.message,
          key: `fitScore-${record.applicationId}`,
        });

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
      setGeneratingMap((prev) => ({ ...prev, [record.applicationId]: false }));
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
                  setSelectedKeys([status]);
                  confirm();
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
      onFilter: (value, record) => {
        const currentStatus = statusMap[record.applicationId] || "Pending";
        return currentStatus === value;
      },
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
              padding: "6px 16px",
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
        if (!list.length) return <Tag style={chipStyle}>NA</Tag>;

        const visibleSkills = list.slice(0, 2);
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
                  color: "#1677ff",
                  // cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "22px",
                }}
                onClick={(e) => e.stopPropagation()}
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
        if (!list.length) return <Tag style={chipStyle}>NA</Tag>;

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
                  color: "#1677ff",
                  // cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "22px",
                }}
                onClick={(e) => e.stopPropagation()}
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
        if (!list.length) return <Tag style={chipStyle}>NA</Tag>;

        const visibleClouds = list.slice(0, 2);
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
                  color: "#1677ff",
                  // cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "22px",
                }}
                onClick={(e) => e.stopPropagation()}
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
        if (!list.length) return <Tag style={chipStyle}>NA</Tag>;

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
                  color: "#1677ff",
                  // cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "22px",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                +{remainingCount} more
              </span>
            )}
          </div>
        );
      },
    },

    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const currentStatus = statusMap[record.applicationId] || "Pending";
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
          setActionPopoverId(null);
          setActivityCandidate(record);
          setActivityTab(type);
          setActivityModalOpen(true);
        };

        // 🆕 OPEN SCREENING ANSWERS MODAL
        const openAnswers = () => {
          setActionPopoverId(null);
          setAnswersCandidate(record);
          setAnswersModalOpen(true);
        };

        return (
          <Popover
            trigger="click"
            placement="left"
            open={actionPopoverId === record.applicationId}
            onOpenChange={(open) =>
              setActionPopoverId(open ? record.applicationId : null)
            }
            content={
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Generate Fit Score */}
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

                {/* 🆕 SCREENING ANSWERS — only show if answers exist */}
                {record?.screeningAnswers?.length > 0 && (
                  <div
                    style={{ cursor: "pointer", padding: "6px 10px" }}
                    // onClick={openAnswers}
                    onClick={(e) => {
                      e.stopPropagation(); // prevents popover from closing
                      openAnswers();
                    }}
                  >
                    📋 Screening Answers
                  </div>
                )}
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

      {/* HEADER CARD */}
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
        {/* LEFT — TOGGLES */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {["ALL", "NORMAL", "VENDOR"].map((type) => {
            const labels = {
              ALL: `All (${candidates.length})`,
              NORMAL: `Normal Candidates (${candidates.filter((c) => c?.profile?.vendorId == null).length})`,
              VENDOR: `Bench Candidates (${candidates.filter((c) => c?.profile?.vendorId != null).length})`,
            };
            return (
              <div
                key={type}
                onClick={() => setCandidateType(type)}
                style={{
                  height: 32,
                  borderRadius: 6,
                  outline:
                    candidateType === type
                      ? "1px solid #3F41D1"
                      : "1px solid #A3A3A3",
                  background: candidateType === type ? "#EBEBFA" : "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div style={{ padding: "4px 12px" }}>
                  <span
                    style={{
                      color: candidateType === type ? "#3F41D1" : "#666666",
                      fontSize: 13,
                      fontWeight: candidateType === type ? 500 : 400,
                    }}
                  >
                    {labels[type]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT — SEARCH + CREATE GROUP */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Input
            placeholder="Search by name or title"
            allowClear
            value={searchText}
            onChange={(e) => {
              const value = e.target.value;
              const filteredValue = value.replace(/[^a-zA-Z0-9 ]/g, "");
              setSearchText(filteredValue);
            }}
            style={{ width: 200, height: 36, borderRadius: 20, fontSize: 13 }}
          />

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
            strokeColor={{ "0%": "#1677FF", "100%": "#52c41a" }}
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

          {/* GROUP CHAT MODAL (unchanged) */}
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

              navigate("/company/chat", {
                state: {
                  groupUserIds: [...new Set(chatUserIds)],
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

          {/* ACTIVITY MODAL (unchanged) */}
          <Modal
            open={activityModalOpen}
            footer={null}
            width={420}
            destroyOnClose
            closable
            closeIcon={
              <span style={{ fontSize: 18, fontWeight: 600, color: "#595959" }}>
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

          {/* 🆕 SCREENING ANSWERS MODAL */}
          <Modal
            open={answersModalOpen}
            title={
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  📋 Screening Answers
                </div>
                {answersCandidate?.name && (
                  <div
                    style={{ fontSize: 13, color: "#6B7280", fontWeight: 400 }}
                  >
                    {answersCandidate.name}
                  </div>
                )}
              </div>
            }
            footer={null}
            width={480}
            destroyOnClose
            onCancel={() => {
              setAnswersModalOpen(false);
              setAnswersCandidate(null);
            }}
          >
            {answersCandidate?.screeningAnswers?.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                {answersCandidate.screeningAnswers.map((a, i) => (
                  <div
                    key={a.questionId}
                    style={{
                      background: "#FAFAFA",
                      border: "1px solid #EDEDED",
                      borderRadius: 10,
                      padding: "14px 18px",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        marginBottom: 6,
                      }}
                    >
                      Q{i + 1}. {a.question}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1A1A2E",
                      }}
                    >
                      {a.answer || "—"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "20px 0",
                  textAlign: "center",
                  color: "#9CA3AF",
                }}
              >
                No screening answers for this application.
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default CandidateList;
