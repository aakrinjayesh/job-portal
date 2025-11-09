import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin, message, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { GetCandidateDeatils } from "../../api/api"; // your API call function

const CandidateList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location.state?.id;

  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const payload = { jobId };
        const response = await GetCandidateDeatils(payload);

        if (response?.data) {
          setCandidates(response.data);
        } else {
          message.warning("No candidates found");
        }
      } catch (error) {
        console.error("Error fetching candidates:", error);
        message.error("Failed to load candidates");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchCandidates();
  }, [jobId]);

  const handleCardClick = (candidate) => {
    navigate(`/company/candidate/${candidate.userId}`, {
      state: { candidate, jobId },
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      {loading ? (
        <Spin tip="Loading applicants..." />
      ) : (
        <>
          <Button
            type="link"
            onClick={() => navigate("/company/jobs")}
            icon={<ArrowLeftOutlined />}
          >
            Back
          </Button>
          <Row gutter={[16, 16]}>
            {candidates.map((candidate) => (
              <Col span={24} key={candidate.applicationId}>
                <Card
                  hoverable
                  title={candidate.name}
                  onClick={() => handleCardClick(candidate)}
                  style={{ borderRadius: 12 }}
                >
                  <p>
                    <strong>Email:</strong> {candidate.email}
                  </p>
                  <p>
                    <strong>Status:</strong> {candidate.status}
                  </p>
                  <p>
                    <strong>Applied:</strong>{" "}
                    {new Date(candidate.appliedAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Title:</strong> {candidate.profile?.title || "N/A"}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {candidate.profile?.currentLocation || "N/A"}
                  </p>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
};

export default CandidateList;
