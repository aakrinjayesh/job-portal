import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Timeline,
  Tag,
  message,
  Tabs,
  Space,
  Popconfirm,
  Spin,
} from "antd";

import { GetCandidateActivities, DeleteActivity } from "../../api/api";
import AddNoteModal from "./AddNoteModal";
import AddScheduleModal from "./AddScheduleModal";

const CandidateActivity = ({ candidateId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [deletingId, setDeletingId] = useState(null);
  const [messageAPI, contextHolder] = message.useMessage();

  const fetchActivities = async () => {
    try {
      if (!candidateId) return;
      setLoading(true);
      const res = await GetCandidateActivities(candidateId);
      if (res.status === "success") {
        setActivities(res.data || []);
        setLoading(false);
      }
    } catch {
      messageAPI.error("Failed to load activities");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidateId) fetchActivities();
  }, [candidateId]);

  // const handleDelete = async (id) => {
  //   try {
  //     setDeletingId(id);
  //     await DeleteActivity(id);
  //     message.success("Activity deleted");
  //     fetchActivities();
  //   } catch {
  //     message.error("Delete failed");
  //   } finally {
  //     setDeletingId(null);
  //   }
  // };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);

      // 🚀 OPTIMISTIC REMOVE
      setActivities((prev) => prev.filter((a) => a.id !== id));

      await DeleteActivity(id);
      messageAPI.success("Activity deleted");
    } catch {
      messageAPI.error("Delete failed");

      // 🔁 Rollback on failure
      fetchActivities();
    } finally {
      setDeletingId(null);
    }
  };

  const addActivityOptimistically = (activity) => {
    setActivities((prev) => [activity, ...prev]);
  };

  const filteredActivities =
    activeTab === "ALL"
      ? activities
      : activities.filter((item) => item.category === activeTab);

  /* -------------------------------
     Action button based on tab
  -------------------------------- */
  const renderActionButton = () => {
    if (activeTab === "NOTE") {
      return (
        <Button type="primary" onClick={() => setNoteOpen(true)}>
          Add Note
        </Button>
      );
    }

    if (activeTab === "SCHEDULE") {
      return (
        <Button type="primary" onClick={() => setScheduleOpen(true)}>
          Schedule
        </Button>
      );
    }

    return (
      <Space>
        <Button type="primary" onClick={() => setNoteOpen(true)}>
          Add Note
        </Button>
        <Button onClick={() => setScheduleOpen(true)}>Schedule</Button>
      </Space>
    );
  };

  /* -------------------------------
     Tabs configuration (AntD v5)
  -------------------------------- */
  const items = [
    {
      key: "ALL",
      label: "All",
    },
    {
      key: "NOTE",
      label: "Notes",
    },
    {
      key: "SCHEDULE",
      label: "Schedules",
    },
  ];

  const onChange = (key) => {
    setActiveTab(key);
  };

  return (
    <>
      {contextHolder}
      {/* <Divider /> */}
      <h3>Activity</h3>

      {/* 🔘 Dynamic action button */}
      <div style={{ marginBottom: 16 }}>{renderActionButton()}</div>

      {/* 📑 Tabs */}
      <Tabs defaultActiveKey="ALL" items={items} onChange={onChange} />

      {loading && (
        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            padding: "20px",
          }}
        >
          <Spin size="large" />
        </div>
      )}
      {/* 📌 Timeline */}
      <Timeline>
        {filteredActivities.map((item) => (
          <Timeline.Item key={item.id}>
            <Space style={{ marginBottom: 8 }}>
              <Tag color={item.category === "NOTE" ? "blue" : "green"}>
                {item.category}
              </Tag>

              <Popconfirm
                title="Delete activity?"
                description="Are you sure you want to delete this activity?"
                okText="Yes"
                cancelText="No"
                okButtonProps={{ loading: deletingId === item.id }}
                onConfirm={() => handleDelete(item.id)}
              >
                <Button
                  type="link"
                  danger
                  // loading={deletingId === item.id}
                  // disabled={deletingId === item.id}
                >
                  Delete
                </Button>
              </Popconfirm>
            </Space>

            {item.note && (
              <>
                <div>
                  <strong>{item.note.subject}</strong>
                </div>
                <div>{item.note.noteType}</div>
                <div>{item.note.description}</div>
              </>
            )}

            {item.schedule && (
              <>
                <div>
                  <strong>{item.schedule.title}</strong>
                </div>
                <div>{item.schedule.scheduleType}</div>
                <div>{item.schedule.notes}</div>
                <div>{new Date(item.schedule.startTime).toLocaleString()}</div>
              </>
            )}
          </Timeline.Item>
        ))}
      </Timeline>

      {/* 🧩 Modals */}
      <AddNoteModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        candidateId={candidateId}
        onSuccess={addActivityOptimistically}
      />

      <AddScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        candidateId={candidateId}
        onSuccess={addActivityOptimistically}
      />
    </>
  );
};

export default CandidateActivity;
