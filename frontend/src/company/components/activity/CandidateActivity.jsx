import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Tag,
  message,
  Tabs,
  Space,
  Popconfirm,
  Progress,
} from "antd";
import dayjs from "dayjs";

import { GetCandidateActivities, DeleteActivity } from "../../api/api";
import AddNoteModal from "./AddNoteModal";
import AddScheduleModal from "./AddScheduleModal";
import TodoList from "./TodoList";

// const CandidateActivity = ({ candidateId, jobId }) => {
const CandidateActivity = ({
  candidateId,
  jobId,
  defaultTab,
  onActivityCreated,
}) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const [noteOpen, setNoteOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  // const [activeTab, setActiveTab] = useState("ALL");
  const [activeTab, setActiveTab] = useState(defaultTab || "NOTE");

  const [deletingId, setDeletingId] = useState(null);
  const [messageAPI, contextHolder] = message.useMessage();

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  useEffect(() => {
    if (initialLoading || loading) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 10 : prev + 10));
      }, 400);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [initialLoading, loading]);

  const fetchActivities = async () => {
    try {
      if (!candidateId) return;
      setLoading(true);

      const payload = {
        candidateProfileId: candidateId,
        jobId,
      };

      const res = await GetCandidateActivities(payload);

      if (res.status === "success") {
        setActivities(res.data || []);
      }
    } catch {
      messageAPI.error("Failed to load activities");
    } finally {
      setLoading(false);
      setInitialLoading(false); // 🔥 IMPORTANT
    }
  };

  useEffect(() => {
    if (candidateId) fetchActivities();
  }, [candidateId]);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
      await DeleteActivity(id);
      messageAPI.success("Activity deleted");
    } catch {
      messageAPI.error("Delete failed");
      fetchActivities();
    } finally {
      setDeletingId(null);
    }
  };

  const addActivityOptimistically = (activity) => {
    console.log("activity", activity);
    setActivities((prev) => [activity, ...prev]);
    onActivityCreated?.();
  };

  const filteredActivities =
    activeTab === "ALL"
      ? activities
      : activities.filter((a) => a.category === activeTab);

  /* ---------------- Tabs ---------------- */
  const items = [
    // { key: "ALL", label: "All" },
    { key: "NOTE", label: "Notes" },
    // { key: "SCHEDULE", label: "Schedule" },
    { key: "TODO", label: "Todos" },
  ];

  /* ---------------- Action Buttons ---------------- */
  const renderFooterButtons = () => {
    if (activeTab === "TODO") return null;

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          paddingTop: 12,
        }}
      >
        <Button
          type="primary"
          style={{ borderRadius: 100 }}
          onClick={() => setNoteOpen(true)}
        >
          Add Note
        </Button>
      </div>
    );
  };

  return (
    <>
      {contextHolder}

      {/* ================= OUTER CARD ================= */}

      <div
        style={{
          height: "80vh", // ✅ fixed modal height
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          border: "1px solid #EBEBEB",
          borderRadius: 10,
        }}
      >
        {/* 🔥 TOP LOADING BAR */}
        {(initialLoading || loading) && (
          <Progress
            percent={progress}
            showInfo={false}
            strokeWidth={3}
            strokeColor={{
              "0%": "#4F63F6",
              "100%": "#7C8CFF",
            }}
          />
        )}

        {/* ================= HEADER ================= */}
        <div style={{ padding: "20px 20px 0 20px" }}>
          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
            Activity
          </div>

          <Divider style={{ margin: "0 0 12px 0" }} />

          {/* ================= TABS ================= */}
          <Tabs activeKey={activeTab} items={items} onChange={setActiveTab} />
        </div>
        {/* ================= BODY ================= */}

        <div
          style={{
            flex: 1, // fills space between header & footer
            overflowY: "auto", // ✅ ONLY notes / todos scroll
            padding: "0 20px",
          }}
        >
          {/* ============ TODO VIEW (UNCHANGED) ============ */}
          {activeTab === "TODO" && (
            <div style={{ marginTop: 12 }}>
              {/* <TodoList /> */}
              <TodoList candidateId={candidateId} jobId={jobId} />
            </div>
          )}

          {/* ============ ACTIVITY CARDS ============ */}
          {activeTab !== "TODO" &&
            filteredActivities.map((item) => (
              <div
                key={item.id}
                style={{
                  position: "relative",
                  display: "flex",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                {/* TIMELINE */}
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#1677FF",
                      marginTop: 6,
                    }}
                  />
                  <div
                    style={{
                      width: 2,
                      height: "100%",
                      background: "#D0D0D0",
                      margin: "4px auto 0",
                    }}
                  />
                </div>

                {/* CARD */}
                <div
                  style={{
                    flex: 1,
                    background: "#fff",
                    border: "1px solid #EBEBEB",
                    borderRadius: 8,
                    padding: 10,
                  }}
                >
                  {/* TOP */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <Tag
                      style={{
                        borderRadius: 8,
                        padding: "2px 8px",
                        fontWeight: 600,
                        fontSize: 11,
                        background:
                          item.category === "NOTE" ? "#EBEBFA" : "#E8FFE8",
                        color: item.category === "NOTE" ? "#3F41D1" : "#1CAC1C",
                        border:
                          item.category === "NOTE"
                            ? "1px solid #3F41D1"
                            : "1px solid #1CAC1C",
                      }}
                    >
                      {item.category}
                    </Tag>

                    <Popconfirm
                      title={
                        <div style={{ width: 280 }}>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 600,
                              marginBottom: 10,
                            }}
                          >
                            Delete activity?
                          </div>
                          <div style={{ fontSize: 14, color: "#667085" }}>
                            Are you sure you want to delete this activity?
                          </div>
                        </div>
                      }
                      okText="Yes"
                      cancelText="No"
                      okButtonProps={{ loading: deletingId === item.id }}
                      onConfirm={() => handleDelete(item.id)}
                    >
                      <Button type="link" danger>
                        Delete
                      </Button>
                    </Popconfirm>
                  </div>

                  {/* CONTENT */}

                  {item.note && (
                    <>
                      {/* TYPE + DATE ROW */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        {/* TYPE */}
                        <Tag color="blue" style={{ borderRadius: 6 }}>
                          {item.note.noteType}
                        </Tag>

                        {/* DATE */}
                        <span
                          style={{
                            fontSize: 11,
                            color: "#8A8A8A",
                          }}
                        >
                          {dayjs(item.note.interactedAt).format("DD MMM YYYY")}
                        </span>
                      </div>

                      {/* TIME */}
                      {item.note.startTime && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#8A8A8A",
                            marginBottom: 6,
                          }}
                        >
                          {dayjs(item.note.startTime).format("h:mm A")}
                          {item.note.endTime &&
                            ` - ${dayjs(item.note.endTime).format("h:mm A")}`}
                        </div>
                      )}

                      {/* DESCRIPTION */}
                      <div
                        style={{
                          fontSize: 12,
                          color: "#555",
                        }}
                      >
                        {item.note.description}
                      </div>
                    </>
                  )}

                  {item.schedule && (
                    <>
                      <div
                        style={{
                          fontWeight: 600,
                          marginBottom: 2,
                          fontSize: 12,
                        }}
                      >
                        {item.schedule.title}
                      </div>
                      <div style={{ color: "#666", fontSize: 11 }}>
                        {item.schedule.notes}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* ================= FOOTER ================= */}
        {/* {renderFooterButtons()} */}
        {/* ================= FOOTER (FIXED) ================= */}
        {activeTab !== "TODO" && (
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "flex-end",
              background: "#ffffff",
            }}
          >
            <Button
              type="primary"
              style={{ borderRadius: 100 }}
              onClick={() => setNoteOpen(true)}
            >
              Add Note
            </Button>
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}
      <AddNoteModal
        open={noteOpen}
        jobId={jobId}
        candidateId={candidateId}
        onClose={() => setNoteOpen(false)}
        // candidateId={candidateId}
        onSuccess={addActivityOptimistically}
      />

      {/* <AddScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        candidateId={candidateId}
        onSuccess={addActivityOptimistically}
      /> */}
    </>
  );
};

export default CandidateActivity;
