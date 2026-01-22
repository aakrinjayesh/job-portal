import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  List,
  Avatar,
  Button,
  Tag,
  Spin,
  Empty,
  Divider,
  Typography,
  message,
} from "antd";
import { GetMyActivity } from "../api/api";
import CandidateActivity from "../components/activity/CandidateActivity";
import { useLocation } from "react-router-dom";

const { Title, Text } = Typography;

const MyActivity = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCandidateId, setActiveCandidateId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const controllerRef = useRef(null);
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();

  /* ================= FETCH ================= */
  const fetchMyActivity = async () => {
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    try {
      setLoading(true);
      const res = await GetMyActivity(controllerRef.current.signal);
      if (res.status === "success") {
        setJobs(res.data || []);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      if (err.code !== "ERR_CANCELED") {
        messageApi.error("Failed to load activity");
      }
    }
  };

  useEffect(() => {
    fetchMyActivity();
    return () => controllerRef.current?.abort();
  }, [location.pathname]);

  const handleSelectCandidate = (id) => {
    setDetailLoading(true);
    setActiveCandidateId(id);
    setTimeout(() => setDetailLoading(false), 300);
  };

  /* ================= UI ================= */
  return (
    <>
      {contextHolder}

      <div style={{ display: "flex", gap: 24 }}>
        {/* ================= LEFT ================= */}
        <Card
          style={{
            width: "60%",
            padding: 24,
            borderRadius: 10,
          }}
        >
          {loading ? (
            <Spin size="large" style={{ width: "100%" }} />
          ) : jobs.length === 0 ? (
            <Empty description="No activity found" />
          ) : (
            jobs.map((jobBlock) => (
              <Card key={jobBlock.job.id} style={{ marginBottom: 32 }}>
                {/* JOB HEADER */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <div>
                    <Title level={4} style={{ marginBottom: 0 }}>
                      {jobBlock.job.role}
                    </Title>
                    <Text type="secondary">{jobBlock.job.companyName}</Text>
                  </div>

                  <Button
                    type="primary"
                    shape="round"
                    style={{ background: "#D1E4FF", color: "#310000" }}
                  >
                    View Job Profile
                  </Button>
                </div>

                <Divider />

                {/* CANDIDATES */}
                <List
                  dataSource={jobBlock.candidates}
                  renderItem={(item) => (
                    <Card
                      hoverable
                      onClick={() => handleSelectCandidate(item.candidate.id)}
                      style={{
                        marginBottom: 16,
                        borderRadius: 16,
                        background:
                          activeCandidateId === item.candidate.id
                            ? "#F4F9FF"
                            : "#fff",
                        border:
                          activeCandidateId === item.candidate.id
                            ? "1px solid #1677FF"
                            : "1px solid #E3E3E3",
                        cursor: "pointer",
                      }}
                      bodyStyle={{ padding: 24 }}
                    >
                      {/* TOP */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ display: "flex", gap: 12 }}>
                          <Avatar size={44}>
                            {item.candidate.name.charAt(0).toUpperCase()}
                          </Avatar>

                          <div>
                            <Text strong>{item.candidate.name}</Text>
                            <br />
                            <Text type="secondary">{item.candidate.email}</Text>
                          </div>
                        </div>
                      </div>

                      {/* TAGS */}
                      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                        <Tag color="blue">
                          Total Activities : {item.totalActivities}
                        </Tag>
                        <Tag color="blue">
                          Last Activity :{" "}
                          {new Date(item.lastActivityAt).toLocaleDateString()}
                        </Tag>
                      </div>
                    </Card>
                  )}
                />
              </Card>
            ))
          )}
        </Card>

        {/* ================= RIGHT ================= */}
        <Card
          style={{
            width: "40%",
            borderRadius: 12,
            minHeight: 300,
          }}
        >
          {!activeCandidateId && (
            <Empty description="Select a candidate to view activity timeline" />
          )}

          {detailLoading && (
            <div style={{ textAlign: "center", marginTop: 80 }}>
              <Spin size="large" />
            </div>
          )}

          {!detailLoading && activeCandidateId && (
            <CandidateActivity candidateId={activeCandidateId} />
          )}
        </Card>
      </div>
    </>
  );
};

export default MyActivity;
