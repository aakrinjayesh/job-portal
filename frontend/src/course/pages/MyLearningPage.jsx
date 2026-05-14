import { useState, useEffect } from "react";
import { Row, Col, Typography, Spin, Empty, Tabs, message } from "antd";
import { BookOutlined, TrophyOutlined } from "@ant-design/icons";
import { GetMyEnrollments, GetAllMyCertificates } from "../api/courseApi.js";
import CourseCard from "../components/CourseCard.jsx";
import CertificateCard from "../components/CertificateCard.jsx";

const { Title, Text } = Typography;

const MyLearningPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certLoading, setCertLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await GetMyEnrollments();
        setEnrollments(res.data || []);
      } catch {
        message.error("Failed to load enrollments");
      } finally {
        setLoading(false);
      }
    };
    const loadCerts = async () => {
      try {
        const res = await GetAllMyCertificates();
        setCertificates(res.data || []);
      } catch {
        // No certs
      } finally {
        setCertLoading(false);
      }
    };
    load();
    loadCerts();
  }, []);

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <BookOutlined style={{ marginRight: 8, color: "#1677ff" }} />
          My Learning
        </Title>
        <Text type="secondary">Track your courses and certificates</Text>
      </div>

      <Tabs
        defaultActiveKey="courses"
        items={[
          {
            key: "courses",
            label: `My Courses (${enrollments.length})`,
            children: loading ? (
              <div style={{ textAlign: "center", padding: 80 }}>
                <Spin size="large" />
              </div>
            ) : enrollments.length === 0 ? (
              <Empty description="You haven't enrolled in any courses yet." />
            ) : (
              <Row gutter={[20, 20]} style={{ marginTop: 16 }}>
                {enrollments.map((enrollment) => (
                  <Col xs={24} sm={12} md={8} key={enrollment.enrollmentId}>
                    {/* <CourseCard
                      course={enrollment.course}
                      mode="enrolled"
                      progressPercent={enrollment.progressPercent}
                    /> */}
                    <CourseCard
                      course={enrollment.course}
                      mode="enrolled"
                      progressPercent={enrollment.progressPercent}
                      basePath="/candidate"
                    />
                  </Col>
                ))}
              </Row>
            ),
          },
          {
            key: "certificates",
            label: (
              <span>
                <TrophyOutlined /> Certificates ({certificates.length})
              </span>
            ),
            children: certLoading ? (
              <div style={{ textAlign: "center", padding: 80 }}>
                <Spin size="large" />
              </div>
            ) : certificates.length === 0 ? (
              <Empty description="No certificates yet. Pass a course assessment to earn one." />
            ) : (
              <Row gutter={[20, 20]} style={{ marginTop: 16 }}>
                {certificates.map((cert) => (
                  <Col xs={24} md={12} key={cert.id}>
                    <CertificateCard certificate={cert} />
                  </Col>
                ))}
              </Row>
            ),
          },
        ]}
      />
    </div>
  );
};

export default MyLearningPage;
