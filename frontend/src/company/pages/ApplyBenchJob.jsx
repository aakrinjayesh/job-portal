import React, { useEffect, useState } from "react";
import { Table, Spin, message, Button } from "antd";
import { GetVendorCandidates, ApplyBenchCandidate } from "../api/api";
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

const ApplyBenchJob = ({ jobId, hasQuestions }) => {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [applyLoading, setApplyLoading] = useState(false);

  // ── Shared screening hook ──────────────────────────────────────────────────
  // NOTE: jobId must be defined when this component mounts.
  // Previously hasQuestions was checked but jobId was never passed to
  // GetJobQuestions — that was the bug causing the modal not to appear.
  const screening = useScreeningQuestions(jobId);
  const { messageApi, contextHolder } = screening;
  // ──────────────────────────────────────────────────────────────────────────

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, selectedRow) => {
      // console.log("ids selected", newSelectedRowKeys);
      setSelectedRowKeys(newSelectedRowKeys);
    },
    preserveSelectedRowKeys: true,
  };

  // ── Core submit ────────────────────────────────────────────────────────────
  const submitApplication = async (answers) => {
    setApplyLoading(true);

    const payload = {
      jobId,
      candidateProfileIds: selectedRowKeys,
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
          setSelectedRowKeys([]);
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

        setSelectedRowKeys([]);
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
    if (selectedRowKeys.length === 0) {
      messageApi.warning("Please select at least one candidate");
      return;
    }
    await screening.initiateApply(hasQuestions, submitApplication);
  };

  // ── Modal OK: validate → build answers → submit ────────────────────────────
  const handleScreeningSubmit = async () => {
    const answers = screening.buildAnswers();
    if (answers === null) return; // validation failed
    await submitApplication(answers);
  };

  // ── Load candidates ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await GetVendorCandidates();
        const active = (res?.data || []).filter(
          (x) => x.status === null || x.status?.toLowerCase() === "active",
        );
        setCandidates(active || []);
      } catch {
        messageApi.error("Failed to load candidates");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const columns = [
    { title: "Name", dataIndex: "name", width: 180 },
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
        }}
      >
        <h3 style={{ margin: 0 }}>Candidate List</h3>
        <div>
          <Button
            disabled
            style={{
              background: "#E6F0FF",
              color: "#1D4ED8",
              border: "1px solid #C7D2FE",
              borderRadius: 20,
              padding: "4px 16px",
              height: 32,
              fontSize: 13,
              fontWeight: 500,
              marginRight: 5,
            }}
          >
            AI Eligibility Check
          </Button>

          <Button
            onClick={handleApplyClick}
            loading={applyLoading || screening.questionsLoading}
            disabled={!selectedRowKeys.length || screening.questionsLoading}
            style={{
              background: "#E6F0FF",
              color: "#1D4ED8",
              border: "1px solid #C7D2FE",
              borderRadius: 20,
              padding: "4px 16px",
              height: 32,
              fontSize: 13,
              fontWeight: 500,
              marginTop: 20,
            }}
          >
            Apply With Selected Bench
          </Button>
        </div>
      </div>

      <TableDesign
        loading={loading}
        columns={columns}
        dataSource={candidates}
        rowKey="id"
        rowSelection={rowSelection}
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
        selectedCount={selectedRowKeys.length}
      />
    </Spin>
  );
};

export default ApplyBenchJob;
