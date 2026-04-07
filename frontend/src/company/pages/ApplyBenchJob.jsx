import React, { useEffect, useState } from "react";
import { Table, Spin, message, Button, Progress, Tooltip } from "antd";

import {
  GetVendorCandidates,
  ApplyBenchCandidate,
  GenerateFitScore,
  GetCandidatesFitScore,
} from "../api/api";
import TableDesign from "./TableDesign";
import { Tag } from "antd";
import useScreeningQuestions from "../../utils/Usescreeningquestions";
import ScreeningQuestionsModal from "../components/Job/ScreeningQuestionsModal";

// ── Tag helpers ────────────────────────────────────────────────────────────────

const renderGreenTags = (items = [], max = 3) => {
  if (!items.length) return "-";
  const visible = items.slice(0, max);
  const extra = items.length - max;
  return (
    <div
      style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: "100%" }}
    >
      {visible.map((item, idx) => (
        <Tag
          key={idx}
          style={{
            background: "#FBEBFF",
            borderRadius: 100,
            border: "1px solid #800080",
            whiteSpace: "nowrap",
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
            whiteSpace: "nowrap",
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
      style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: "100%" }}
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

// ── Component ──────────────────────────────────────────────────────────────────

const ApplyBenchJob = ({ jobId, hasQuestions, jobStatus }) => {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  // const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // const [applyLoading, setApplyLoading] = useState(false);
  const [applySelectedKeys, setApplySelectedKeys] = useState([]);
  const [aiSelectedKeys, setAiSelectedKeys] = useState([]);
  const [applyLoading, setApplyLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSelected, setAiSelected] = useState(false);
  const [actionType, setActionType] = useState(null);
  // "AI" | "APPLY" | null

  // ── Shared screening hook ──────────────────────────────────────────────────
  // NOTE: jobId must be defined when this component mounts.
  // Previously hasQuestions was checked but jobId was never passed to
  // GetJobQuestions — that was the bug causing the modal not to appear.
  const screening = useScreeningQuestions(jobId);
  const { messageApi, contextHolder } = screening;
  // ──────────────────────────────────────────────────────────────────────────

  // const rowSelection = {
  //   selectedRowKeys,
  //   onChange: (newSelectedRowKeys, selectedRow) => {
  //     // console.log("ids selected", newSelectedRowKeys);
  //     setSelectedRowKeys(newSelectedRowKeys);
  //   },
  //   preserveSelectedRowKeys: true,
  // };
  const applyRowSelection = {
    selectedRowKeys: applySelectedKeys,
    onChange: (newKeys) => {
      setApplySelectedKeys(newKeys);
    },
    preserveSelectedRowKeys: true,
  };

  // ── Core submit ────────────────────────────────────────────────────────────
  const submitApplication = async (answers) => {
    setApplyLoading(true);

    const payload = {
      jobId,
      // candidateProfileIds: selectedRowKeys,
      candidateProfileIds: applySelectedKeys,

      answers,
    };

    let hide;
    try {
      hide = messageApi.loading({
        content: "Applying selected candidates...",
        duration: 0,
      });

      const res = await ApplyBenchCandidate(payload);
      hide?.();

      const { status, code, message: msg, metadata } = res || {};

      if (code === "LIMIT_EXCEEDED") {
        const { feature, period, maxAllowed, currentUsage } = metadata || {};
        messageApi.warning({
          content: `${feature} ${period?.toLowerCase()} limit exceeded. Usage: ${currentUsage}/${maxAllowed}`,
          duration: 5,
        });
        return;
      }

      if (status === "success") {
        const applied = res?.appliedCandidates || [];
        const skipped = res?.skippedCandidates || [];

        screening.closeModal(false);

        if (applied.length === 0 && skipped.length > 0) {
          const names = skipped.map((c) => c.candidateName).join(", ");
          messageApi.error({
            content: `Already applied for this job: ${names}`,
            duration: 5,
          });
          // setSelectedRowKeys([]);
          setApplySelectedKeys([]);
          await loadCandidates();
          return;
        }

        if (applied.length > 0) {
          messageApi.success({
            content: `${applied.length} candidate${applied.length > 1 ? "s" : ""} applied successfully`,
            duration: 3,
          });
        }

        if (skipped.length > 0) {
          const names = skipped.map((c) => c.candidateName).join(", ");
          messageApi.warning({
            content: `Already applied — skipped: ${names}`,
            duration: 5,
          });
        }

        // setSelectedRowKeys([]);
        setApplySelectedKeys([]);
        return;
      }

      messageApi.error(msg || "Unexpected response from server");
    } catch (err) {
      hide?.();
      messageApi.error(
        err?.response?.data?.message || "Failed to apply candidates",
      );
    } finally {
      setApplyLoading(false);
    }
  };

  // ── "Apply With Selected Bench" click ─────────────────────────────────────
  const handleApplyClick = async () => {
    if (jobStatus?.toLowerCase() !== "open") {
      messageApi.warning("Job is closed, you cannot perform any action");
      return;
    }
    if (applySelectedKeys.length === 0) {
      messageApi.warning("Please select at least one candidate");
      return;
    }

    // ❌ prevent mixing actions
    if (actionType === "AI") {
      messageApi.warning(
        "You already selected AI action. Please clear selection.",
      );
      return;
    }

    setActionType("APPLY");

    await screening.initiateApply(hasQuestions, submitApplication);

    setActionType(null); // reset after flow
  };

  // ── Modal OK: validate → build answers → submit ────────────────────────────
  const handleScreeningSubmit = async () => {
    const answers = screening.buildAnswers();
    if (answers === null) return; // validation failed
    await submitApplication(answers);
  };

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await GetVendorCandidates();

      const active = (res?.data || []).filter(
        (x) => x.status === null || x.status?.toLowerCase() === "active",
      );

      let fitScoreMap = {};

      try {
        const fitRes = await GetCandidatesFitScore(jobId);

        const fitData = fitRes.data || [];

        fitScoreMap = fitData.reduce((acc, item) => {
          acc[item.candidateProfileId] = {
            fitPercentage: item.fitPercentage,
            details: item.details,
          };
          return acc;
        }, {});
      } catch (err) {
        console.log("Fit score fetch failed", err);
      }

      const merged = active.map((candidate) => ({
        ...candidate,
        analysis: fitScoreMap[candidate.id] || null,
      }));

      setCandidates(merged || []);
    } catch {
      messageApi.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
    setAiSelectedKeys([]);
    setAiSelected(false);
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const handleAIButtonClick = async () => {
    if (jobStatus?.toLowerCase() !== "open") {
      messageApi.warning("Job is closed, you cannot perform any action");
      return;
    }
    if (applySelectedKeys.length === 0) {
      messageApi.warning("Please select at least one candidate");
      return;
    }

    // ❌ prevent mixing actions
    if (actionType === "APPLY") {
      messageApi.warning(
        "You already selected Apply action. Please clear selection.",
      );
      return;
    }

    setActionType("AI");

    try {
      setAiLoading(true);

      await GenerateFitScore({
        jobId,
        candidateIds: applySelectedKeys,
      });

      messageApi.success("Fit score generated");

      await loadCandidates();
      setApplySelectedKeys([]);
      setActionType(null); // reset
    } catch {
      messageApi.error("Fit score generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  // const columns = [
  //   { title: "Name", dataIndex: "name", width: 180 },
  const aiSelectionColumn = aiSelected
    ? [
        {
          title: "AI Select",
          key: "aiSelect",
          width: 80,
          render: (_, record) => (
            <input
              type="checkbox"
              checked={aiSelectedKeys.includes(record.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setAiSelectedKeys((prev) => [...prev, record.id]);
                } else {
                  setAiSelectedKeys((prev) =>
                    prev.filter((k) => k !== record.id),
                  );
                }
              }}
            />
          ),
        },
      ]
    : [];

  const columns = [
    ...aiSelectionColumn,
    // { title: "Name", dataIndex: "name", width: 180 },
    {
      title: "Name",
      dataIndex: "name",
      width: 180,
      render: (text) => {
        if (!text) return "-";
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      },
    },
    // {
    //   title: "Fit Score",
    //   key: "fitScore",
    //   width: 120,
    //   render: (_, record) => {
    //     if (!record.analysis) {
    //       return (
    //         <span style={{ color: "#aaa", fontSize: 12 }}>Not Generated</span>
    //       );
    //     }
    //     const score = record.analysis.fitPercentage;
    //     const color =
    //       score >= 70 ? "#52c41a" : score >= 40 ? "#fa8c16" : "#f5222d";
    //     return (
    //       <span
    //         style={{
    //           background: `${color}20`,
    //           color: color,
    //           border: `1px solid ${color}`,
    //           borderRadius: 6,
    //           padding: "2px 10px",
    //           fontWeight: 700,
    //           fontSize: 13,
    //         }}
    //       >
    //         {score}%
    //       </span>
    //     );
    //   },
    // },
    {
      title: "Fit Score",
      key: "fitScore",
      width: 120,

      // ✅ ADD THIS
      sorter: (a, b) => {
        const scoreA = a.analysis?.fitPercentage || 0;
        const scoreB = b.analysis?.fitPercentage || 0;
        return scoreA - scoreB;
      },
      sortDirections: ["ascend", "descend"],

      render: (_, record) => {
        if (!record.analysis) {
          return (
            <span style={{ color: "#aaa", fontSize: 12 }}>Not Generated</span>
          );
        }

        const score = record.analysis.fitPercentage;

        const color =
          score >= 70 ? "#52c41a" : score >= 40 ? "#fa8c16" : "#f5222d";

        return (
          <span
            style={{
              background: `${color}20`,
              color: color,
              border: `1px solid ${color}`,
              borderRadius: 6,
              padding: "2px 10px",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {score}%
          </span>
        );
      },
    },
    {
      title: "Clouds",
      key: "clouds",
      width: 260,
      render: (_, r) =>
        renderPinkTags(r.primaryClouds.map((s) => s.name) || [], 3),
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

  return (
    <Spin spinning={loading}>
      {contextHolder}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          marginTop: 20,
        }}
      >
        <h3 style={{ margin: 0 }}>Candidate List</h3>
        <div>
          <Tooltip
            title={
              jobStatus?.toLowerCase() !== "open"
                ? "Job is closed, you cannot perform any action"
                : ""
            }
          >
            <span>
              <Button
                onClick={handleAIButtonClick}
                loading={aiLoading}
                // disabled={aiLoading || (aiSelected && aiSelectedKeys.length === 0)}
                disabled={
                  applySelectedKeys.length === 0 ||
                  aiLoading ||
                  actionType === "APPLY" ||
                  jobStatus?.toLowerCase() !== "open"
                }
                style={{
                  background: aiSelected ? "#FFF7E6" : "#E6F0FF",
                  color: aiSelected ? "#D46B08" : "#1D4ED8",
                  border: aiSelected
                    ? "1px solid #FFC069"
                    : "1px solid #C7D2FE",
                  borderRadius: 20,
                  padding: "4px 16px",
                  height: 32,
                  fontSize: 13,
                  fontWeight: 500,
                  marginRight: 5,
                }}
              >
                Generate Fit Score
              </Button>
            </span>
          </Tooltip>

          <Tooltip
            title={
              jobStatus?.toLowerCase() !== "open"
                ? "Job is closed, you cannot perform any action"
                : ""
            }
          >
            <span>
              <Button
                onClick={handleApplyClick}
                loading={applyLoading || screening.questionsLoading}
                disabled={
                  applySelectedKeys.length === 0 ||
                  applyLoading ||
                  screening.questionsLoading ||
                  actionType === "AI" ||
                  jobStatus?.toLowerCase() !== "open"
                }
                style={{
                  background: "#E6F0FF",
                  color: "#1D4ED8",
                  border: "1px solid #C7D2FE",
                  borderRadius: 20,
                  padding: "4px 16px",
                  height: 32,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Apply With Selected Bench
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>

      <TableDesign
        loading={loading}
        columns={columns}
        dataSource={candidates}
        rowKey="id"
        // rowSelection={rowSelection}
        rowSelection={applyRowSelection}
        scroll={{ y: 400 }}
        emptyText="No bench candidates available"
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
        }}
      />

      {/* SCREENING QUESTIONS MODAL — shared component, no duplication */}
      <ScreeningQuestionsModal
        {...screening}
        applyLoading={applyLoading}
        onSubmit={handleScreeningSubmit}
        // selectedCount={selectedRowKeys.length}
        selectedCount={applySelectedKeys.length}
      />
    </Spin>
  );
};

export default ApplyBenchJob;
