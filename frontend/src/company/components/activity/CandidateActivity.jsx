import React, { useEffect, useState } from "react";
import { Button, Divider, Timeline, Tag, message,Segmented  } from "antd";


import {
  GetCandidateActivities,
  DeleteActivity
} from "../../api/api";

import AddNoteModal from "./AddNoteModal";
import AddScheduleModal from "./AddScheduleModal";

const CandidateActivity = ({ candidateId }) => {
  

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");


const fetchActivities = async () => {
  try {
    if (!candidateId) return;

    setLoading(true);
    const res = await GetCandidateActivities(candidateId);
    setActivities(res.data || []);
  } catch {
    message.error("Failed to load activities");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (candidateId) fetchActivities();
  }, [candidateId]);

  const handleDelete = async (id) => {
    try {
      await DeleteActivity(id);
      message.success("Activity deleted");
      fetchActivities();
    } catch {
      message.error("Delete failed");
    }
  };

  const filteredActivities =
  activeTab === "ALL"
    ? activities
    : activities.filter(item => item.category === activeTab);


  return (
    <>
      <Divider />
      <h3>Activity</h3>

      {/* <div style={{ marginBottom: 12 }}>
        <Button type="primary" onClick={() => setNoteOpen(true)}>
          Add Note
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={() => setScheduleOpen(true)}>
          Schedule
        </Button>
      </div> */}

      <Segmented
  options={[
    { label: "Add Note", value: "NOTE" },
    { label: "Schedule", value: "SCHEDULE" },
  ]}
  onChange={(value) => {
    if (value === "NOTE") {
      setNoteOpen(true);
    }
    if (value === "SCHEDULE") {
      setScheduleOpen(true);
    }
  }}
  style={{ marginBottom: 12 }}
/>
< Divider/>

      <Segmented
  options={[
    { label: "All", value: "ALL" },
    { label: "Notes", value: "NOTE" },
    { label: "Schedules", value: "SCHEDULE" },
  ]}
  value={activeTab}
  onChange={setActiveTab}
  style={{ marginBottom: 16 }}
/>


      <Timeline>
        {filteredActivities.map((item) => (
          <Timeline.Item key={item.id}>
            <Tag color={item.category === "NOTE" ? "blue" : "green"}>
              {item.category}
            </Tag>

            <Button
              type="link"
              danger
              onClick={() => handleDelete(item.id)}
            >
              Delete
            </Button>

            {item.note && (
              <>
                <div><strong>{item.note.subject}</strong></div>
                <div>{item.note.noteType}</div>
                <div>{item.note.description}</div>
              </>
            )}

            {item.schedule && (
              <>
                <div><strong>{item.schedule.title}</strong></div>
                <div>{item.schedule.scheduleType}</div>
                <div>{item.schedule.notes}</div>
                <div>
                  {new Date(item.schedule.startTime).toLocaleString()}
                </div>
              </>
            )}
          </Timeline.Item>
        ))}
      </Timeline>

      <AddNoteModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        candidateId={candidateId}
        onSuccess={fetchActivities}
      />

      <AddScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        candidateId={candidateId}
        onSuccess={fetchActivities}
      />
    </>
  );
};

export default CandidateActivity;
