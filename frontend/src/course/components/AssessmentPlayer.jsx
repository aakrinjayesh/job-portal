import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Radio,
  Checkbox,
  Typography,
  Space,
  Result,
  Spin,
  message,
  Progress,
  Tag,
  Divider,
} from "antd";
import {
  TrophyOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  GetAssessment,
  SubmitAssessment,
  GetMyAttempts,
} from "../api/courseApi.js";

const { Title, Text } = Typography;

const AssessmentPlayer = ({ courseId, onCertificateIssued }) => {
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { score, isPassed, correctCount, totalQuestions, certificate }
  const [currentStep, setCurrentStep] = useState("quiz"); // "quiz" | "result"

  useEffect(() => {
    const load = async () => {
      try {
        const [assessRes, attemptsRes] = await Promise.all([
          GetAssessment(courseId),
          GetMyAttempts(courseId),
        ]);
        setAssessment(assessRes.data);
        setAttempts(attemptsRes.data || []);

        // If already passed
        const passed = (attemptsRes.data || []).find((a) => a.isPassed);
        if (passed) {
          setResult({ score: passed.score, isPassed: true });
          setCurrentStep("result");
        }
      } catch {
        // No assessment
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const handleAnswer = (questionId, value, type) => {
    if (type === "MULTI_CHOICE") {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    } else {
      setAnswers((prev) => ({ ...prev, [questionId]: [value] }));
    }
  };

  const handleSubmit = async () => {
    if (!assessment) return;

    // Validate all answered
    const unanswered = assessment.questions.filter(
      (q) => !answers[q.id]?.length,
    );
    if (unanswered.length > 0) {
      return message.warning(
        `Please answer all ${unanswered.length} remaining question(s)`,
      );
    }

    setSubmitting(true);
    try {
      const res = await SubmitAssessment(courseId, answers);
      setResult(res.data);
      setAttempts((prev) => [res.data.attempt, ...prev]);
      setCurrentStep("result");
      if (res.data.isPassed && res.data.certificate) {
        onCertificateIssued?.(res.data.certificate);
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    setCurrentStep("quiz");
  };

  if (loading)
    return <Spin style={{ display: "block", margin: "40px auto" }} />;

  if (!assessment) {
    return (
      <Card style={{ textAlign: "center", padding: 40, borderRadius: 12 }}>
        <Text type="secondary">No assessment available for this course.</Text>
      </Card>
    );
  }

  // ── Result screen ──────────────────────────────────────
  if (currentStep === "result" && result) {
    return (
      <Card style={{ borderRadius: 12 }}>
        <Result
          icon={
            result.isPassed ? (
              <TrophyOutlined style={{ color: "#faad14", fontSize: 64 }} />
            ) : (
              <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 64 }} />
            )
          }
          title={result.isPassed ? "🎉 You Passed!" : "Not Passed Yet"}
          subTitle={
            result.isPassed
              ? "Congratulations! You scored 100%. Your certificate has been issued."
              : `You scored ${result.score}%. You need 100% to pass. Try again!`
          }
          extra={[
            !result.isPassed && (
              <Button
                key="retry"
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleRetry}
              >
                Try Again
              </Button>
            ),
          ].filter(Boolean)}
        />

        <Divider>Previous Attempts</Divider>
        {attempts.map((a, i) => (
          <div
            key={a.id || i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Text>Attempt {a.attemptNumber || attempts.length - i}</Text>
            <Space>
              <Tag color={a.isPassed ? "success" : "error"}>{a.score}%</Tag>
              {a.isPassed && <Tag color="gold">Passed</Tag>}
            </Space>
          </div>
        ))}
      </Card>
    );
  }

  // ── Quiz screen ────────────────────────────────────────
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k]?.length,
  ).length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          {assessment.title}
        </Title>
        <Text type="secondary">
          {answeredCount}/{assessment.questions.length} answered
        </Text>
      </div>

      <Progress
        percent={Math.round(
          (answeredCount / assessment.questions.length) * 100,
        )}
        size="small"
        style={{ marginBottom: 24 }}
        showInfo={false}
      />

      {assessment.questions.map((q, idx) => (
        <Card
          key={q.id}
          size="small"
          style={{ marginBottom: 16, borderRadius: 10 }}
          title={
            <Space>
              <Tag color="blue">Q{idx + 1}</Tag>
              <Text>{q.question}</Text>
            </Space>
          }
        >
          {q.type === "MULTI_CHOICE" ? (
            <Checkbox.Group
              value={answers[q.id] || []}
              onChange={(vals) => handleAnswer(q.id, vals, "MULTI_CHOICE")}
            >
              <Space direction="vertical">
                {q.options.map((opt, i) => (
                  <Checkbox key={i} value={opt}>
                    {opt}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          ) : (
            <Radio.Group
              value={answers[q.id]?.[0]}
              onChange={(e) => handleAnswer(q.id, e.target.value, q.type)}
            >
              <Space direction="vertical">
                {(q.type === "TRUE_FALSE" ? ["True", "False"] : q.options).map(
                  (opt, i) => (
                    <Radio key={i} value={opt}>
                      {opt}
                    </Radio>
                  ),
                )}
              </Space>
            </Radio.Group>
          )}
        </Card>
      ))}

      <Button
        type="primary"
        size="large"
        loading={submitting}
        onClick={handleSubmit}
        disabled={answeredCount < assessment.questions.length}
        style={{ width: "100%", height: 48, fontWeight: 600 }}
      >
        Submit Assessment
      </Button>
    </div>
  );
};

export default AssessmentPlayer;
