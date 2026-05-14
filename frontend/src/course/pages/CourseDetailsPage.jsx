import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Tag,
  Collapse,
  Spin,
  Card,
  Space,
  Divider,
  Button,
  message,
} from "antd";
import {
  PlayCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  GetCourseBySlug,
  GetEnrollmentStatus,
  AddToWishlist,
  RemoveFromWishlist,
} from "../api/courseApi.js";
import EnrollButton from "../components/EnrollButton.jsx";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const CourseDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const basePath = window.location.pathname.startsWith("/company")
    ? "/company"
    : "/candidate";
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  //   useEffect(() => {
  //     const load = async () => {
  //       setLoading(true);
  //       try {
  //         const res = await GetCourseBySlug(slug);
  //         // setCourse(res.data);
  //         setCourse(res.data.data);

  //         // Check enrollment status
  //         const token = localStorage.getItem("token");
  //         if (token) {
  //           try {
  //             // const enrollRes = await GetEnrollmentStatus(res.data.id);
  //             const enrollRes = await GetEnrollmentStatus(res.data.data.id);

  //             setIsEnrolled(enrollRes.isEnrolled);
  //           } catch {
  //             // Not logged in or no enrollment
  //           }
  //         }
  //       } catch {
  //         message.error("Course not found");
  //         navigate(-1);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     load();
  //   }, [slug]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const res = await GetCourseBySlug(slug);

        // ✅ Correct course data
        setCourse(res.data);

        // ✅ Check enrollment
        const token = localStorage.getItem("token");

        if (token) {
          try {
            const enrollRes = await GetEnrollmentStatus(res.data.id);

            setIsEnrolled(enrollRes.isEnrolled);
          } catch (err) {
            console.log(err);
          }
        }
      } catch (err) {
        console.log(err);

        message.error("Course not found");

        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!course) return null;

  const totalLectures =
    course.sections?.reduce((sum, s) => sum + (s.lectures?.length || 0), 0) ||
    0;

  const totalDurationSeconds =
    course.sections?.reduce(
      (total, section) =>
        total +
        (section.lectures || []).reduce(
          (sum, lec) => sum + (lec.durationSeconds || 0),
          0,
        ),
      0,
    ) || 0;

  const totalHours = Math.floor(totalDurationSeconds / 3600);

  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);

  const formattedDuration =
    totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`;

  const previewLectures =
    course.sections?.flatMap((s) =>
      (s.lectures || []).filter((l) => l.isPreview),
    ) || [];

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Hero */}
      <div
        style={{ background: "#001529", color: "white", padding: "32px 24px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            type="text"
            style={{
              color: "rgba(255,255,255,0.7)",
              marginBottom: 16,
              padding: 0,
            }}
            onClick={() => navigate(-1)}
          >
            Back to Courses
          </Button>

          <Row gutter={[32, 24]} align="middle">
            <Col xs={24} md={16}>
              <Space wrap style={{ marginBottom: 12 }}>
                <Tag color={course.isFree ? "blue" : "gold"}>
                  {course.isFree
                    ? "FREE"
                    : `₹${(course.price / 100).toFixed(0)}`}
                </Tag>
                {course.hasCertificate && (
                  <Tag color="gold" icon={<TrophyOutlined />}>
                    Certificate
                  </Tag>
                )}
                <Tag color="default">
                  {course.accessDuration?.replace(/_/g, " ")}
                </Tag>
              </Space>

              <Title level={2} style={{ color: "white", margin: "0 0 12px" }}>
                {course.title}
              </Title>
              {/* 
              <Paragraph
                style={{ color: "rgba(255,255,255,0.8)", marginBottom: 16 }}
              >
                {course.description}
              </Paragraph> */}

              <Space wrap>
                <Text style={{ color: "rgba(255,255,255,0.7)" }}>
                  <UserOutlined style={{ marginRight: 4 }} />
                  {course.creator?.name}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.7)" }}>
                  <BookOutlined style={{ marginRight: 4 }} />
                  {course.sections?.length || 0} sections · {totalLectures}{" "}
                  lectures
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.7)" }}>
                  <UserOutlined style={{ marginRight: 4 }} />
                  {course._count?.enrollments || 0} enrolled
                </Text>
                {course.assessment && (
                  <Text style={{ color: "rgba(255,255,255,0.7)" }}>
                    <CheckCircleOutlined style={{ marginRight: 4 }} />
                    Quiz included
                  </Text>
                )}
              </Space>
            </Col>

            {/* Thumbnail */}
            <Col xs={24} md={8}>
              <Card
                style={{ borderRadius: 12, overflow: "hidden", padding: 0 }}
                bodyStyle={{ padding: 0 }}
              >
                <img
                  src={
                    course.thumbnailUrl ||
                    // "https://via.placeholder.com/400x220?text=Course"
                    `https://placehold.co/400x220?text=Course`
                  }
                  alt={course.title}
                  style={{ width: "100%", height: 220, objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src =
                      //   "https://via.placeholder.com/400x220?text=Course";
                      `https://placehold.co/400x220?text=Course`;
                  }}
                />
                <div style={{ padding: 16 }}>
                  <EnrollButton
                    course={course}
                    isEnrolled={isEnrolled}
                    onSuccess={() => setIsEnrolled(true)}
                  />
                  {previewLectures.length > 0 && (
                    <Text
                      type="secondary"
                      style={{
                        display: "block",
                        textAlign: "center",
                        marginTop: 8,
                        fontSize: 12,
                      }}
                    >
                      {previewLectures.length} free preview lecture(s)
                    </Text>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <Row gutter={[32, 24]}>
          <Col xs={24} md={16}>
            <Card
              title="What you'll learn"
              style={{ borderRadius: 12, marginBottom: 24 }}
            >
              <Row gutter={[16, 16]}>
                {(course.whatYouWillLearn || "")
                  .split("\n")
                  .filter(Boolean)
                  .map((item, index) => (
                    <Col xs={24} md={12} key={index}>
                      <Space align="start">
                        <CheckCircleOutlined
                          style={{ color: "#52c41a", marginTop: 4 }}
                        />
                        <Text>{item}</Text>
                      </Space>
                    </Col>
                  ))}
              </Row>
            </Card>
            <Card
              // title="Requirements"
              title="Prerequisites"
              style={{ borderRadius: 12, marginBottom: 24 }}
            >
              <ul style={{ paddingLeft: 20 }}>
                {(course.prerequisities || "")
                  .split("\n")
                  .filter(Boolean)
                  .map((req, index) => (
                    <li key={index}>
                      <Text>{req}</Text>
                    </li>
                  ))}
              </ul>
            </Card>
            <Card
              title="Description"
              style={{ borderRadius: 12, marginBottom: 24 }}
            >
              <Paragraph
                style={{
                  marginBottom: 0,
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: "#444",
                }}
              >
                {course.description}
              </Paragraph>
            </Card>
            <Card
              title="Topics Covered"
              style={{ borderRadius: 12, marginBottom: 24 }}
            >
              <Space wrap>
                {/* {(course.syllabus || []).map((topic) => (
                  <Tag
                    key={topic}
                    color="blue"
                    style={{
                      padding: "6px 12px",
                      borderRadius: 20,
                    }}
                  >
                    {topic}
                  </Tag>
                ))} */}
                {(course.syllabus || "")
                  .split("\n")
                  .filter(Boolean)
                  .map((topic) => (
                    <Tag
                      key={topic}
                      color="blue"
                      style={{
                        padding: "6px 12px",
                        borderRadius: 20,
                      }}
                    >
                      {topic}
                    </Tag>
                  ))}
              </Space>
            </Card>
            {/* Curriculum */}
            <Card
              title={
                <span>
                  <BookOutlined style={{ marginRight: 8 }} />
                  Course Content
                </span>
              }
              style={{ borderRadius: 12, marginBottom: 24 }}
            >
              <Collapse ghost>
                {(course.sections || []).map((section) => (
                  <Panel
                    key={section.id}
                    header={
                      <Space>
                        <Text strong>{section.title}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          ({section.lectures?.length || 0} lectures)
                        </Text>
                      </Space>
                    }
                  >
                    {(section.lectures || []).map((lec) => (
                      <div
                        key={lec.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 0",
                          borderBottom: "1px solid #f0f0f0",
                        }}
                      >
                        {lec.type === "VIDEO" ? (
                          <VideoCameraOutlined style={{ color: "#1677ff" }} />
                        ) : (
                          <FileTextOutlined style={{ color: "#52c41a" }} />
                        )}
                        <Text style={{ flex: 1 }}>{lec.title}</Text>
                        {/* {lec.isPreview ? (
                          <Tag color="blue" style={{ fontSize: 11 }}>
                            Free Preview
                          </Tag>
                        ) : !isEnrolled ? (
                          <LockOutlined style={{ color: "#bbb" }} />
                        ) : null} */}
                        {lec.isPreview || course.isFree ? (
                          <Tag color="blue" style={{ fontSize: 11 }}>
                            Free
                          </Tag>
                        ) : !isEnrolled ? (
                          <LockOutlined style={{ color: "#bbb" }} />
                        ) : null}
                        {lec.durationSeconds && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {Math.floor(lec.durationSeconds / 60)}m
                          </Text>
                        )}
                      </div>
                    ))}
                  </Panel>
                ))}
              </Collapse>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} md={8}>
            <Card
              title="What you'll get"
              style={{ borderRadius: 12, marginBottom: 16 }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: 8 }}
                  />
                  {totalLectures} lectures
                </Text>
                <Text>
                  <ClockCircleOutlined
                    style={{ color: "#1677ff", marginRight: 8 }}
                  />
                  {formattedDuration} total duration
                </Text>
                <Text>
                  <BookOutlined style={{ color: "#722ed1", marginRight: 8 }} />
                  {course.courseLevel || "Beginner"} level
                </Text>
                {course.hasCertificate && (
                  <Text>
                    <TrophyOutlined
                      style={{ color: "#faad14", marginRight: 8 }}
                    />
                    Certificate of completion
                  </Text>
                )}
                {course.assessment && (
                  <Text>
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", marginRight: 8 }}
                    />
                    Assessment quiz
                  </Text>
                )}
                <Text>
                  <ClockCircleOutlined
                    style={{ color: "#1677ff", marginRight: 8 }}
                  />
                  {course.accessDuration === "LIFETIME"
                    ? "Lifetime access"
                    : course.accessDuration?.replace(/_/g, " ") + " access"}
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CourseDetailPage;
