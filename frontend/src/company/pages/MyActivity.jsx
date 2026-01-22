import React, { useEffect, useState, useRef } from "react";
import { Card, List, Button, Tag, Spin, message, Empty } from "antd";
import { GetMyActivity } from "../api/api";
import CandidateActivity from "../components/activity/CandidateActivity";
import { useLocation } from "react-router-dom";

const MyActivity = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageAPI, contextHolder] = message.useMessage();

  // 🔵 Selected candidate
  const [activeCandidateId, setActiveCandidateId] = useState(null);

  // 🔵 Right panel spinner
  const [detailLoading, setDetailLoading] = useState(false);

  const controllerRef = useRef(null);
  const location = useLocation();
  const [hoveredId, setHoveredId] = useState(null);


  /* ================= FETCH MY ACTIVITY ================= */
  const fetchMyActivity = async () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();

    try {
      setLoading(true);
      const res = await GetMyActivity(controllerRef.current.signal);
      if (res.status === "success") {
        setData(res.data || []);
        setLoading(false);
        messageAPI.success("Fetched Details Successfully!");
      }
    } catch (error) {
      if (error.code === "ERR_CANCELED") return;
      messageAPI.error("Failed to Load  Activity");
      setLoading(false);
    }
  };

  /* ================= CLEANUP ON TAB SWITCH ================= */
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [location.pathname]);

  useEffect(() => {
    fetchMyActivity();
  }, []);

  /* ================= HANDLE SELECT ================= */
  const handleSelectCandidate = (candidateId) => {
    setDetailLoading(true);
    setActiveCandidateId(candidateId);

    // ⏳ Stop spinner AFTER render
    setTimeout(() => {
      setDetailLoading(false);
    }, 300);
  };

  return (
    <>
      {/* <h2>My Activity</h2> */}
      <h2 style={{ marginBottom: 12, marginTop: 0 }}>
  My Activity
</h2>

      {contextHolder}
      {/* ================= PAGE LOADING ================= */}
      {loading ? (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ display: "flex", gap: 24 }}>
          {/* ================= LEFT PANEL (60%) ================= */}
          {/* <Card style={{ width: "60%" }}> */}
          <Card
  style={{
    width: "60%",
    height: "100%",
    // padding: 12,
    background: "#ffffff",
    borderRadius: 10,
  }}
>
            <List
              dataSource={data}
                style={{
    display: "flex",
    flexDirection: "column",
    // gap: 32,
     gap: 12,
  }}
              renderItem={(item) => (


<Card
  hoverable
  onClick={() => handleSelectCandidate(item.candidate.id)}
  onMouseEnter={() => setHoveredId(item.candidate.id)}
  onMouseLeave={() => setHoveredId(null)}
  bodyStyle={{
    padding: 12,
  }}
  style={{
    marginBottom: 6,
    borderRadius: 12,

   background:
  hoveredId === item.candidate.id ||
  activeCandidateId === item.candidate.id
    ? "rgba(22, 119, 255, 0.08)"
    : "#FFFFFF",




border:
  activeCandidateId === item.candidate.id
    ? "1px solid rgba(22, 119, 255, 0.4)"
    : "1px solid #EDEDED",

boxShadow:
  activeCandidateId === item.candidate.id
    ? "0 2px 8px rgba(22,119,255,0.15)"
    : "0 2px 8px rgba(0,0,0,0.06)",


    cursor: "pointer",
    transition: "all 0.2s ease",
  }}
>


  {/* TOP ROW */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    }}
  >
    {/* LEFT: Avatar + Details */}
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "#1677FF",
          color: "#fff",
          fontSize: 18,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.candidate.name.charAt(0).toUpperCase()}
      </div>

      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: "#0A0A0A",
            lineHeight: "12px",
            
          }}
        >
          {item.candidate.name}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#6A7282",
            lineHeight: "20px",
          }}
        >
          {item.candidate.email}
        </div>
      </div>
    </div>

   
    {/* <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#F7F7F7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: 18, color: "#666" }}>⋯</span>
    </div> */}
  </div>

  {/* TAGS */}
  <div style={{ display: "flex", gap: 8 }}>
   

<div
  style={{
    padding: "4px 10px",
    background: "#E7F0FE",          // light blue
    borderRadius: 100,
    border: "0.5px solid #1677FF",  // blue border
    fontSize: 11,
    lineHeight: "16px",
    fontWeight: 500,
    color: "#1677FF",               // blue text
    whiteSpace: "nowrap",
  }}
>
  Total Activities : {item.totalActivities}
</div>




<div
  style={{
    padding: "4px 10px",
    background: "#F3E8FF",          // light purple
    borderRadius: 100,
    border: "0.5px solid #9254DE",  // purple border
    fontSize: 11,
    lineHeight: "16px",
    fontWeight: 500,
    color: "#9254DE",               // purple text
    whiteSpace: "nowrap",
  }}
>
  Last Activity :{" "}
  {new Date(item.lastActivityAt).toLocaleDateString()}
</div>


  </div>
</Card>

              )}
            />
          </Card>

          {/* ================= RIGHT PANEL (40%) ================= */}
          <div
            style={{
              width: "40%",
              minHeight: 300,
              padding: 16,
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            {!activeCandidateId && (
              <div
                style={{
                  textAlign: "center",
                  color: "#999",
                  marginTop: 80,
                }}
              >
                <Empty description="Select a candidate to view activity timeline" />
                ;{/* Select a candidate to view activity timeline */}
              </div>
            )}

            {detailLoading && (
              <div style={{ textAlign: "center", marginTop: 80 }}>
                <Spin size="large" />
              </div>
            )}

            {!detailLoading && activeCandidateId && (
              <CandidateActivity candidateId={activeCandidateId} />
  

            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MyActivity;
