// import React, { useEffect, useState } from "react";

// import {
//   Button,
//   Divider,
//   Timeline,
//   Tag,
//   message,
//   Tabs,
//   Space,
//   Popconfirm,
//   Spin,
// } from "antd";

// import { GetCandidateActivities, DeleteActivity } from "../../api/api";
// import AddNoteModal from "./AddNoteModal";
// import AddScheduleModal from "./AddScheduleModal";
// import TodoList from "./TodoList";


// const CandidateActivity = ({ candidateId }) => {
//   const [activities, setActivities] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [noteOpen, setNoteOpen] = useState(false);
//   const [scheduleOpen, setScheduleOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("ALL");
//   const [deletingId, setDeletingId] = useState(null);
//   const [messageAPI, contextHolder] = message.useMessage();

//   const fetchActivities = async () => {
//     try {
//       if (!candidateId) return;
//       setLoading(true);
//       const res = await GetCandidateActivities(candidateId);
//       if (res.status === "success") {
//         setActivities(res.data || []);
//         setLoading(false);
//       }
//     } catch {
//       messageAPI.error("Failed to load activities");
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (candidateId) fetchActivities();
//   }, [candidateId]);

 

//   const handleDelete = async (id) => {
//     try {
//       setDeletingId(id);

//       // 🚀 OPTIMISTIC REMOVE
//       setActivities((prev) => prev.filter((a) => a.id !== id));

//       await DeleteActivity(id);
//       messageAPI.success("Activity deleted");
//     } catch {
//       messageAPI.error("Delete failed");

//       // 🔁 Rollback on failure
//       fetchActivities();
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const addActivityOptimistically = (activity) => {
//     setActivities((prev) => [activity, ...prev]);
//   };

//   const filteredActivities =
//     activeTab === "ALL"
//       ? activities
//       : activities.filter((item) => item.category === activeTab);

//   /* -------------------------------
//      Action button based on tab
//   -------------------------------- */
//   const renderActionButton = () => {
//     if (activeTab === "NOTE") {
//       return (
//         <Button type="primary" onClick={() => setNoteOpen(true)}>
//           Add Note
//         </Button>
//       );
//     }

//     if (activeTab === "SCHEDULE") {
//       return (
//         <Button type="primary" onClick={() => setScheduleOpen(true)}>
//           Schedule
//         </Button>
//       );
//     }

    
//   if (activeTab === "TODO") {
//     return null; // 👈 Todo has inline add input
//   }

//     return (
//       <Space>
//         <Button type="primary" onClick={() => setNoteOpen(true)}>
//           Add Note
//         </Button>
//         <Button onClick={() => setScheduleOpen(true)}>Schedule</Button>
//       </Space>
//     );
//   };

//   /* -------------------------------
//      Tabs configuration (AntD v5)
//   -------------------------------- */
//   const items = [
//     {
//       key: "ALL",
//       label: "All",
//     },
//     {
//       key: "NOTE",
//       label: "Notes",
//     },
//     {
//       key: "SCHEDULE",
//       label: "Schedules",
//     },
//      {
//     key: "TODO",
//     label: "Todos",
//   },
//   ];

//   const onChange = (key) => {
//     setActiveTab(key);
//   };

// //   return (
// //     <>
// //       {contextHolder}
// //       {/* <Divider /> */}
// //       <h3>Activity</h3>

// //       {/* 🔘 Dynamic action button */}
// //       <div style={{ marginBottom: 16 }}>{renderActionButton()}</div>

// //       {/* 📑 Tabs */}
// //       <Tabs defaultActiveKey="ALL" items={items} onChange={onChange} />

// //       {loading && (
// //         <div
// //           style={{
// //             textAlign: "center",
// //             marginTop: 16,
// //             padding: "20px",
// //           }}
// //         >
// //           <Spin size="large" />
// //         </div>
// //       )}
// //       {/* 📌 Timeline */}
// //       {activeTab === "TODO" && (
// //   <div style={{ marginTop: 16 }}>
// //     <TodoList />
// //      {/* <TodoList candidateId={candidateId} /> */}
// //   </div>
// // )}
// // {/* 📌 Timeline (ONLY for ALL / NOTE / SCHEDULE) */}
// // {activeTab !== "TODO" && (
// //       <Timeline>
// //         {filteredActivities.map((item) => (
// //           <Timeline.Item key={item.id}>
// //             <Space style={{ marginBottom: 8 }}>
// //               <Tag color={item.category === "NOTE" ? "blue" : "green"}>
// //                 {item.category}
// //               </Tag>

// //               <Popconfirm
// //                 title="Delete activity?"
// //                 description="Are you sure you want to delete this activity?"
// //                 okText="Yes"
// //                 cancelText="No"
// //                 okButtonProps={{ loading: deletingId === item.id }}
// //                 onConfirm={() => handleDelete(item.id)}
// //               >
// //                 <Button
// //                   type="link"
// //                   danger
// //                   // loading={deletingId === item.id}
// //                   // disabled={deletingId === item.id}
// //                 >
// //                   Delete
// //                 </Button>
// //               </Popconfirm>
// //             </Space>

// //             {item.note && (
// //               <>
// //                 <div>
// //                   <strong>{item.note.subject}</strong>
// //                 </div>
// //                 <div>{item.note.noteType}</div>
// //                 <div>{item.note.description}</div>
// //               </>
// //             )}

// //             {item.schedule && (
// //               <>
// //                 <div>
// //                   <strong>{item.schedule.title}</strong>
// //                 </div>
// //                 <div>{item.schedule.scheduleType}</div>
// //                 <div>{item.schedule.notes}</div>
// //                 <div>{new Date(item.schedule.startTime).toLocaleString()}</div>
// //               </>
// //             )}
// //           </Timeline.Item>
// //         ))}
// //       </Timeline>

// //       )}

// //       {/* 🧩 Modals */}
// //       <AddNoteModal
// //         open={noteOpen}
// //         onClose={() => setNoteOpen(false)}
// //         candidateId={candidateId}
// //         onSuccess={addActivityOptimistically}
// //       />

// //       <AddScheduleModal
// //         open={scheduleOpen}
// //         onClose={() => setScheduleOpen(false)}
// //         candidateId={candidateId}
// //         onSuccess={addActivityOptimistically}
// //       />
// //     </>
// //   );


// return (
//   <>
//     {contextHolder}

//     <div
//       style={{
//         minWidth: 100,                 // ✅ stabilizes width
//         width: "100%",
//         background: "#FFFFFF",
//         borderRadius: 10,
//         border: "1px solid #EBEBEB",
//         padding: 24,
//         display: "flex",
//         flexDirection: "column",
//         gap: 24,
//       }}
//     >
//       {/* ================= HEADER ================= */}
//       <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//         <div
//           style={{
//             fontSize: 22,
//             fontWeight: 600,
//             color: "#101828",
//           }}
//         >
//           Activity
//         </div>

//         <Divider style={{ margin: 0 }} />

//         {/* ================= TABS ================= */}
//         <div style={{ display: "flex", height: 48 }}>
//           {["ALL", "NOTE", "SCHEDULE"].map((tab) => {
//             const active = activeTab === tab;
//             return (
//               <div
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 style={{
//                   padding: "10px 20px",
//                   cursor: "pointer",
//                   borderBottom: active
//                     ? "3px solid #3F41D1"
//                     : "3px solid transparent",
//                   background: active ? "#EBEBFA" : "transparent",
//                 }}
//               >
//                 <span
//                   style={{
//                     fontSize: 14,
//                     fontWeight: active ? 600 : 400,
//                     color: active ? "#3F41D1" : "#A3A3A3",
//                   }}
//                 >
//                   {tab === "ALL"
//                     ? "All"
//                     : tab === "NOTE"
//                     ? "Notes"
//                     : "Schedule"}
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* ================= BODY ================= */}
//       <div
//         style={{
//           display: "flex",
//           gap: 24,
//           paddingLeft: 8,          // ✅ matches figma spacing
//         }}
//       >
//         {/* TIMELINE */}
//         <div
//           style={{
//             width: 24,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             gap: 12,
//             paddingTop: 12,
//           }}
//         >
//           {filteredActivities.map((_, i) => (
//             <React.Fragment key={i}>
//               <div
//                 style={{
//                   width: 12,
//                   height: 12,
//                   borderRadius: "50%",
//                   background: "#066AFE",
//                 }}
//               />
//               <div
//                 style={{
//                   width: 2,
//                   height: 96,
//                   background: "#C9C9C9",
//                 }}
//               />
//             </React.Fragment>
//           ))}
//         </div>

//         {/* CARDS */}
//         <div
//           style={{
//             flex: 1,
//             display: "flex",
//             flexDirection: "column",
//             gap: 16,
//           }}
//         >
//           {filteredActivities.map((item) => (
//             <div
//               key={item.id}
//               style={{
//                 background: "#FFFFFF",
//                 border: "1px solid #EBEBEB",
//                 borderRadius: 10,
//                 padding: 16,
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: 16,
//               }}
//             >
//               {/* CARD HEADER */}
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                 }}
//               >
//                 <div
//                   style={{
//                     padding: "6px 14px",
//                     borderRadius: 8,
//                     fontSize: 13,
//                     fontWeight: 600,
//                     border:
//                       item.category === "SCHEDULE"
//                         ? "1px solid #1CAC1C"
//                         : "1px solid #3F41D1",
//                     background:
//                       item.category === "SCHEDULE"
//                         ? "#E8FFE8"
//                         : "#EBEBFA",
//                     color:
//                       item.category === "SCHEDULE"
//                         ? "#1CAC1C"
//                         : "#3F41D1",
//                   }}
//                 >
//                   {item.category}
//                 </div>

//                 <Popconfirm
//                   title="Delete activity?"
//                   onConfirm={() => handleDelete(item.id)}
//                 >
//                   <span
//                     style={{
//                       color: "#FF0000",
//                       fontWeight: 600,
//                       cursor: "pointer",
//                     }}
//                   >
//                     Delete
//                   </span>
//                 </Popconfirm>
//               </div>

//               {/* CONTENT */}
//               {item.schedule && (
//                 <>
//                   <div style={{ fontWeight: 600, fontSize: 14 }}>
//                     {item.schedule.scheduleType}
//                   </div>
//                   <div style={{ color: "#666", fontSize: 14 }}>
//                     {item.schedule.notes}
//                   </div>
//                 </>
//               )}

//               {item.note && (
//                 <>
//                   <div style={{ fontWeight: 600, fontSize: 14 }}>
//                     {item.note.noteType}
//                   </div>
//                   <div style={{ color: "#666", fontSize: 14 }}>
//                     {item.note.description}
//                   </div>
//                 </>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ================= FOOTER ================= */}
//       <Divider style={{ margin: 0 }} />

//       <div
//         style={{
//           display: "flex",
//           justifyContent: "flex-end",
//           gap: 16,
//         }}
//       >
//         <Button
//           style={{
//             borderRadius: 100,
//             background: "#F0F2F4",
//             color: "#666",
//           }}
//           onClick={() => setScheduleOpen(true)}
//         >
//           Schedule
//         </Button>

//         <Button
//           style={{
//             borderRadius: 100,
//             background: "#D1E4FF",
//             color: "#310000",
//             fontWeight: 600,
//           }}
//           onClick={() => setNoteOpen(true)}
//         >
//           Add Note
//         </Button>
//       </div>
//     </div>

//     {/* MODALS */}
//     <AddNoteModal
//       open={noteOpen}
//       onClose={() => setNoteOpen(false)}
//       candidateId={candidateId}
//       onSuccess={addActivityOptimistically}
//     />

//     <AddScheduleModal
//       open={scheduleOpen}
//       onClose={() => setScheduleOpen(false)}
//       candidateId={candidateId}
//       onSuccess={addActivityOptimistically}
//     />
//   </>
// );


// };

// export default CandidateActivity;




import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
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
import TodoList from "./TodoList";

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
      }
    } catch {
      messageAPI.error("Failed to load activities");
    } finally {
      setLoading(false);
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
    setActivities((prev) => [activity, ...prev]);
  };

  const filteredActivities =
    activeTab === "ALL"
      ? activities
      : activities.filter((a) => a.category === activeTab);

  /* ---------------- Tabs ---------------- */
  const items = [
    { key: "ALL", label: "All" },
    { key: "NOTE", label: "Notes" },
    { key: "SCHEDULE", label: "Schedule" },
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
          style={{ borderRadius: 100 }}
          onClick={() => setScheduleOpen(true)}
        >
          Schedule
        </Button>
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
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          border: "1px solid #EBEBEB",
          borderRadius: 10,
          padding: 20,
        }}
      >
        {/* ================= HEADER ================= */}
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
          Activity
        </div>

        <Divider style={{ margin: "0 0 12px 0" }} />

        {/* ================= TABS ================= */}
        <Tabs
          activeKey={activeTab}
          items={items}
          onChange={setActiveTab}
        />

        {/* ================= BODY ================= */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            // paddingRight: 8,
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Spin />
            </div>
          )}

          {/* ============ TODO VIEW (UNCHANGED) ============ */}
          {activeTab === "TODO" && (
            <div style={{ marginTop: 12 }}>
              <TodoList />
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
                          item.category === "NOTE"
                            ? "#EBEBFA"
                            : "#E8FFE8",
                        color:
                          item.category === "NOTE"
                            ? "#3F41D1"
                            : "#1CAC1C",
                        border:
                          item.category === "NOTE"
                            ? "1px solid #3F41D1"
                            : "1px solid #1CAC1C",
                      }}
                    >
                      {item.category}
                    </Tag>

                    <Popconfirm
                      title="Delete activity?"
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
                      <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 12,  }}>
                        {item.note.subject}
                      </div>
                      <div style={{ color: "#666" }}>
                        {item.note.description}
                      </div>
                    </>
                  )}

                  {item.schedule && (
                    <>
                      <div style={{ fontWeight: 600, marginBottom: 2 , fontSize: 12, }}>
                        {item.schedule.title}
                      </div>
                      <div style={{ color: "#666" ,fontSize: 11,}}>
                        {item.schedule.notes}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* ================= FOOTER ================= */}
        {renderFooterButtons()}
      </div>

      {/* ================= MODALS ================= */}
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

