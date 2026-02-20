import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  List,
  Avatar,
  Button,
  Tag,
  Progress,
  Empty,
  Divider,
  Typography,
  message,
  Collapse,
} from "antd";
import { GetMyActivity } from "../api/api";
import CandidateActivity from "../components/activity/CandidateActivity";
import { useLocation } from "react-router-dom";

const { Title, Text } = Typography;

const MyActivity = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCandidateId, setActiveCandidateId] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  const controllerRef = useRef(null);
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();

  /* ================= FETCH ================= */
  const fetchMyActivity = async () => {
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    try {
      setInitialLoading(true);
      setLoading(true);
      setProgress(10);

      const interval = setInterval(() => {
        setProgress((p) => (p < 90 ? p + 10 : p));
      }, 200);

      const res = await GetMyActivity(controllerRef.current.signal);

      if (res.status === "success") {
        setJobs(res.data || []);
      }

      clearInterval(interval);
      setProgress(100);
    } catch (err) {
      if (err.code !== "ERR_CANCELED") {
        messageApi.error("Failed to load activity");
      }
    } finally {
      setTimeout(() => {
        setLoading(false);
        setInitialLoading(false);
        setProgress(0);
      }, 300);
    }
  };

  useEffect(() => {
    fetchMyActivity();
    return () => controllerRef.current?.abort();
  }, [location.pathname]);

  const handleSelectCandidate = (candidateId, jobId) => {
    setDetailLoading(true);
    setActiveCandidateId(candidateId);
    setActiveJobId(jobId); // 👈 store jobId
    setTimeout(() => setDetailLoading(false), 300);
  };

  /* ================= UI ================= */
  return (
    <>
      {contextHolder}

      <div
        style={{
          display: "flex",
          gap: 24,
          height: "calc(100vh - 100px)", // adjust if your header is taller
          overflow: "hidden", // 🚫 disables page scroll
        }}
      >
        {/* ================= LEFT ================= */}
        <Card
          style={{
            width: "60%",
            padding: "8px 16px",
            borderRadius: 10,
            height: "100%", // 🔑 fill parent height
            overflowY: "auto", // ✅ LEFT CARD SCROLLS
            position: "relative",
          }}
        >
          {loading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100%",
                background: "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: 80,
                zIndex: 10,
              }}
            >
              {/* <Progress
  type="circle"
  percent={progress}
  width={90}
  strokeColor={{
    "0%": "#4F63F6",
    "100%": "#7C8CFF",
  }}
  trailColor="#E6E8FF"
  showInfo={false}
/> */}
            </div>
          )}
          {initialLoading ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Progress
                type="circle"
                percent={progress}
                width={90}
                strokeColor={{
                  "0%": "#4F63F6",
                  "100%": "#7C8CFF",
                }}
                trailColor="#E6E8FF"
                showInfo={false}
              />
            </div>
          ) : jobs.length === 0 ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: 40,
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "#F0F5FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 44,
                  marginBottom: 24,
                }}
              >
                🤷‍♂️
              </div>

              <Title level={4}>Oops! No activity yet</Title>

              <Text
                type="secondary"
                style={{ maxWidth: 340, marginBottom: 24 }}
              >
                No candidate interactions found. Post a job or invite candidates
                to start seeing activity here.
              </Text>
            </div>
          ) : (
            jobs.map((jobBlock) => {
              const jobKey = String(jobBlock.job.id);

              return (
                <Collapse
                  key={jobKey}
                  defaultActiveKey={[jobKey]} // ✅ OPEN BY DEFAULT
                  expandIconPosition="end"
                  style={{ marginBottom: 32 }}
                  items={[
                    {
                      key: jobKey,
                      label: (
                        <div>
                          <Title level={4} style={{ margin: 0 }}>
                            {jobBlock.job.role}
                          </Title>
                          <Text type="secondary">
                            {jobBlock.job.companyName}
                          </Text>
                        </div>
                      ),
                      children: (
                        <>
                          <Divider />

                          {/* CANDIDATE LIST */}
                          <div
                            style={{
                              maxHeight: 320, // 👈 height for 2 cards
                              overflowY: "auto", // 👈 enable scroll
                              paddingRight: 8, // 👈 space for scrollbar
                            }}
                          >
                            <List
                              dataSource={jobBlock.candidates}
                              renderItem={(item) => (
                                <Card
                                  hoverable
                                  onClick={() =>
                                    handleSelectCandidate(
                                      item.candidate.id,
                                      jobBlock.job.id,
                                    )
                                  }
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
                                  <div style={{ display: "flex", gap: 12 }}>
                                    <Avatar size={44}>
                                      {item.candidate.name
                                        .charAt(0)
                                        .toUpperCase()}
                                    </Avatar>

                                    <div>
                                      <Text strong>{item.candidate.name}</Text>
                                      <br />
                                      <Text type="secondary">
                                        {item.candidate.email}
                                      </Text>
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      marginTop: 16,
                                      display: "flex",
                                      gap: 8,
                                    }}
                                  >
                                    <Tag color="blue">
                                      Total Activities :{item.totalActivities}
                                    </Tag>
                                    <Tag color="blue">
                                      Last Activity :
                                      {new Date(
                                        item.lastActivityAt,
                                      ).toLocaleDateString()}
                                    </Tag>
                                  </div>
                                </Card>
                              )}
                            />
                          </div>
                        </>
                      ),
                    },
                  ]}
                />
              );
            })
          )}
        </Card>

        {/* ================= RIGHT ================= */}
        <Card
          style={{
            width: "40%",
            borderRadius: 12,
            height: "100%",
            overflow: "hidden", // ⬅️ important
            display: "flex",
            flexDirection: "column",
          }}
        >
          {!activeCandidateId && (
            <Empty description="Select a candidate to view activity timeline" />
          )}

          {detailLoading && (
            <div style={{ textAlign: "center", marginTop: 80 }}>
              <Progress
                type="circle"
                percent={70}
                width={70}
                showInfo={false}
              />
            </div>
          )}

          {/* {!detailLoading && activeCandidateId && (
            <CandidateActivity
              candidateId={activeCandidateId}
              jobId={activeJobId}
            />
          )} */}
          {!detailLoading && activeCandidateId && (
            <div
              style={{
                flex: 1, // ⬅️ take remaining height
                overflowY: "auto", // ✅ enable scroll
                paddingRight: 8,
              }}
            >
              <CandidateActivity
                candidateId={activeCandidateId}
                jobId={activeJobId}
                onActivityCreated={fetchMyActivity}
              />
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default MyActivity;
