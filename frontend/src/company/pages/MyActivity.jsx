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
      <h2>My Activity</h2>
      {contextHolder}
      {/* ================= PAGE LOADING ================= */}
      {loading ? (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ display: "flex", gap: 24 }}>
          {/* ================= LEFT PANEL (60%) ================= */}
          <Card style={{ width: "60%" }}>
            <List
              dataSource={data}
              renderItem={(item) => (
                <Card
                  hoverable
                  // style={{
                  //   marginBottom: 16,
                  //   borderRadius: 12,
                  //   background: "linear-gradient(135deg, #f9f9ff, #eef3ff)",
                  //   boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  // }}
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
                            {new Date(item.lastActivityAt).toLocaleDateString()}
                          </Tag>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <Button
                      type="primary"
                      onClick={() => handleSelectCandidate(item.candidate.id)}
                    >
                      View Timeline
                    </Button>
                  </div>
                </Card>
              )}
            />
          </Card>

          {/* ================= RIGHT PANEL (40%) ================= */}
          <div
            style={{
              width: "40%",
              minHeight: 400,
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
