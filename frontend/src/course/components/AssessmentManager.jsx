import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Switch,
  Space,
  Typography,
  Divider,
  message,
  Spin,
  Tag,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  CreateOrUpdateAssessment,
  GetAssessment,
  DeleteAssessment,
} from "../api/courseApi.js";

const { Text, Title } = Typography;
const { Option } = Select;

const QUESTION_TYPES = [
  { value: "SINGLE_CHOICE", label: "Single Choice" },
  { value: "MULTI_CHOICE", label: "Multiple Choice" },
  { value: "TRUE_FALSE", label: "True / False" },
];

const defaultQuestion = () => ({
  question: "",
  type: "SINGLE_CHOICE",
  options: ["", ""],
  correctAnswer: [],
  order: 1,
});

const QuestionEditor = ({ question, index, onChange, onDelete }) => {
  const updateField = (field, value) =>
    onChange(index, { ...question, [field]: value });

  const updateOption = (optIdx, value) => {
    const opts = [...question.options];
    opts[optIdx] = value;
    updateField("options", opts);
  };

  const addOption = () => updateField("options", [...question.options, ""]);

  const removeOption = (optIdx) => {
    const opts = question.options.filter((_, i) => i !== optIdx);
    const answers = question.correctAnswer.filter(
      (a) => a !== question.options[optIdx],
    );
    onChange(index, { ...question, options: opts, correctAnswer: answers });
  };

  const toggleCorrect = (opt) => {
    if (question.type === "SINGLE_CHOICE" || question.type === "TRUE_FALSE") {
      updateField("correctAnswer", [opt]);
    } else {
      const current = question.correctAnswer || [];
      const updated = current.includes(opt)
        ? current.filter((a) => a !== opt)
        : [...current, opt];
      updateField("correctAnswer", updated);
    }
  };

  const getTrueFalseOptions = () => ["True", "False"];
  const displayOptions =
    question.type === "TRUE_FALSE" ? getTrueFalseOptions() : question.options;

  return (
    <Card
      size="small"
      style={{
        marginBottom: 16,
        borderRadius: 10,
        border: "1px solid #e8e8e8",
      }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Tag color="blue">Q{index + 1}</Tag>
          <Select
            value={question.type}
            onChange={(v) => updateField("type", v)}
            size="small"
            style={{ width: 160 }}
          >
            {QUESTION_TYPES.map((t) => (
              <Option key={t.value} value={t.value}>
                {t.label}
              </Option>
            ))}
          </Select>
        </div>
      }
      extra={
        <Popconfirm
          title="Remove this question?"
          onConfirm={() => onDelete(index)}
        >
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      }
    >
      <Input.TextArea
        placeholder="Enter question"
        value={question.question}
        onChange={(e) => updateField("question", e.target.value)}
        rows={2}
        style={{ marginBottom: 12 }}
      />

      <Text
        type="secondary"
        style={{ fontSize: 12, marginBottom: 6, display: "block" }}
      >
        Options — click ✓ to mark correct answer(s)
      </Text>

      {displayOptions.map((opt, optIdx) => (
        <div
          key={optIdx}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Button
            size="small"
            type={question.correctAnswer?.includes(opt) ? "primary" : "default"}
            icon={<CheckCircleOutlined />}
            onClick={() => toggleCorrect(opt)}
            style={{
              background: question.correctAnswer?.includes(opt)
                ? "#52c41a"
                : undefined,
              borderColor: question.correctAnswer?.includes(opt)
                ? "#52c41a"
                : undefined,
            }}
          />
          {question.type === "TRUE_FALSE" ? (
            <Text>{opt}</Text>
          ) : (
            <>
              <Input
                size="small"
                placeholder={`Option ${optIdx + 1}`}
                value={opt}
                onChange={(e) => updateOption(optIdx, e.target.value)}
                style={{ flex: 1 }}
              />
              {question.options.length > 2 && (
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeOption(optIdx)}
                />
              )}
            </>
          )}
        </div>
      ))}

      {question.type !== "TRUE_FALSE" && (
        <Button
          size="small"
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addOption}
          style={{ marginTop: 4 }}
        >
          Add Option
        </Button>
      )}
    </Card>
  );
};

const AssessmentManager = ({ courseId }) => {
  const [title, setTitle] = useState("Course Assessment");
  const [questions, setQuestions] = useState([defaultQuestion()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasAssessment, setHasAssessment] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await GetAssessment(courseId);
        if (res.data) {
          setTitle(res.data.title);
          setQuestions(
            res.data.questions.map((q) => ({
              ...q,
              correctAnswer: q.correctAnswer || [],
            })),
          );
          setHasAssessment(true);
        }
      } catch {
        // No assessment yet
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [courseId]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { ...defaultQuestion(), order: prev.length + 1 },
    ]);
  };

  const updateQuestion = (index, updated) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? updated : q)));
  };

  const deleteQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) return message.warning("Assessment title required");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim())
        return message.warning(`Question ${i + 1} text is empty`);
      if (q.type !== "TRUE_FALSE" && q.options.some((o) => !o.trim())) {
        return message.warning(`Question ${i + 1} has empty options`);
      }
      if (!q.correctAnswer?.length) {
        return message.warning(`Mark correct answer for question ${i + 1}`);
      }
    }

    setSaving(true);
    try {
      await CreateOrUpdateAssessment(courseId, {
        title,
        questions: questions.map((q, i) => ({ ...q, order: i + 1 })),
      });
      setHasAssessment(true);
      message.success("Assessment saved");
    } catch {
      message.error("Failed to save assessment");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await DeleteAssessment(courseId);
      setQuestions([defaultQuestion()]);
      setHasAssessment(false);
      message.success("Assessment deleted");
    } catch {
      message.error("Failed to delete assessment");
    }
  };

  if (loading) return <Spin />;

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
        <Title level={5} style={{ margin: 0 }}>
          {hasAssessment ? "Edit Assessment" : "Create Assessment"}
        </Title>
        {hasAssessment && (
          <Popconfirm
            title="Delete entire assessment?"
            onConfirm={handleDelete}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Delete Assessment
            </Button>
          </Popconfirm>
        )}
      </div>

      <Input
        placeholder="Assessment title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      {questions.map((q, i) => (
        <QuestionEditor
          key={i}
          question={q}
          index={i}
          onChange={updateQuestion}
          onDelete={deleteQuestion}
        />
      ))}

      <Space style={{ marginTop: 8 }}>
        <Button icon={<PlusOutlined />} onClick={addQuestion}>
          Add Question
        </Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
        >
          Save Assessment
        </Button>
      </Space>
    </div>
  );
};

export default AssessmentManager;
