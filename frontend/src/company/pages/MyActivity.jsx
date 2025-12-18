import React, { useEffect, useState, useRef } from "react";
import { Card, List, Button, Tag, Spin, message } from "antd";
import { GetMyActivity } from "../api/api";
import CandidateActivity from "../components/activity/CandidateActivity";
import { useLocation } from "react-router-dom";

const MyActivity = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCandidateId, setActiveCandidateId] = useState(null);
  const controllerRef = useRef(null);
const location = useLocation();


  const fetchMyActivity = async () => {
     if (controllerRef.current) {
    controllerRef.current.abort();
  }

  // 🔵 create new controller
  controllerRef.current = new AbortController();
    try {
      setLoading(true);
      const res = await GetMyActivity(controllerRef.current.signal);
      setData(res.data || []);
    } catch(error) {
       // ✅ ignore abort errors
    if (error.code === "ERR_CANCELED") {
      console.log("MyActivity API aborted");
      return;
    }
      message.error("Failed to load my activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  return () => {
    if (controllerRef.current) {
      console.log("🔥 Aborting MyActivity API due to tab switch");
      controllerRef.current.abort();
    }
  };
}, [location.pathname]);


  useEffect(() => {
    fetchMyActivity();
  }, []);

  // 🔑 Find selected candidate
  const activeItem = data.find(
    (item) => item.candidate.id === activeCandidateId
  );

  return (
    <>
      <h2>My Activity</h2>

      {loading && <Spin />}

      {/* ===================== TIMELINE VIEW ===================== */}
      {!loading && activeItem && (
        <>
          {/* Back Button */}
          <Button
            type="link"
            style={{ marginBottom: 16 }}
            onClick={() => setActiveCandidateId(null)}
          >
            ← Back to My Activity
          </Button>

          {/* Selected Candidate Card */}
          <Card
            style={{
              marginBottom: 24,
              borderRadius: 12,
              background: "linear-gradient(135deg, #f9f9ff, #eef3ff)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ display: "flex", gap: 16 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#1677ff",
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {activeItem.candidate.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <div style={{ fontSize: 17, fontWeight: 600 }}>
                  {activeItem.candidate.name}
                </div>

                <div style={{ color: "#555" }}>
                  {activeItem.candidate.email}
                </div>

                <div style={{ marginTop: 8 }}>
                  <Tag color="blue">
                    Total Activities: {activeItem.totalActivities}
                  </Tag>

                  <Tag color="purple">
                    Last Activity:{" "}
                    {new Date(
                      activeItem.lastActivityAt
                    ).toLocaleDateString()}
                  </Tag>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <CandidateActivity
            candidateId={activeItem.candidate.id}
          />
        </>
      )}

      {/* ===================== LIST VIEW ===================== */}
      {!loading && !activeItem && (
        <List
          dataSource={data}
          renderItem={(item) => (
            <Card
              style={{
                marginBottom: 16,
                borderRadius: 12,
                background: "linear-gradient(135deg, #f9f9ff, #eef3ff)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* LEFT */}
                <div style={{ display: "flex", gap: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "#1677ff",
                      color: "#fff",
                      fontSize: 20,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.candidate.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>
                      {item.candidate.name}
                    </div>

                    <div style={{ color: "#555", fontSize: 13 }}>
                      {item.candidate.email}
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <Tag color="blue">
                        Total Activities: {item.totalActivities}
                      </Tag>

                      <Tag color="purple">
                        Last Activity:{" "}
                        {new Date(
                          item.lastActivityAt
                        ).toLocaleDateString()}
                      </Tag>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <Button
                  type="primary"
                  style={{
                    borderRadius: 8,
                    background:
                      "linear-gradient(135deg, #1677ff, #69b1ff)",
                    border: "none",
                  }}
                  onClick={() =>
                    setActiveCandidateId(item.candidate.id)
                  }
                >
                  View Timeline
                </Button>
              </div>
            </Card>
          )}
        />
      )}
    </>
  );
};

export default MyActivity;
