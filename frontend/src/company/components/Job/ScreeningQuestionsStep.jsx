import React, { useState } from "react";
import { Input, Select, Switch, Button, Tag } from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const QUESTION_TYPE_OPTIONS = [
  { label: "Short Text", value: "TEXT" },
  { label: "Long Text", value: "TEXTAREA" },
  { label: "Number", value: "NUMBER" },
  { label: "Yes / No", value: "BOOLEAN" },
  { label: "Multiple Choice", value: "SELECT" },
];

const SUGGESTED_QUESTIONS = [
  // CTC & Compensation
  {
    question: "What is your current CTC (Cost to Company)?",
    type: "NUMBER",
    required: false,
    options: [],
  },
  {
    question: "What is your expected CTC?",
    type: "NUMBER",
    required: false,
    options: [],
  },
  {
    question: "Are you open to salary negotiation?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "What is your current in-hand monthly salary?",
    type: "NUMBER",
    required: false,
    options: [],
  },
  {
    question: "Do you have any competing offers currently?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },

  // Notice Period & Availability
  {
    question: "What is your notice period?",
    type: "SELECT",
    required: false,
    options: [
      "Immediate",
      "15 Days",
      "30 Days",
      "45 Days",
      "60 Days",
      "90 Days",
    ],
  },
  {
    question: "Can you serve a shorter notice period if required?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "What is your preferred joining date?",
    type: "TEXT",
    required: false,
    options: [],
  },
  {
    question: "Are you available for an immediate start?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "Are you currently serving a notice period?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },

  // Employment Status
  {
    question: "Are you currently employed?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "How long have you been in your current role?",
    type: "TEXT",
    required: false,
    options: [],
  },
  {
    question: "What is your reason for looking for a new opportunity?",
    type: "TEXTAREA",
    required: false,
    options: [],
  },
  {
    question: "Have you previously worked with our company?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "Are you currently a freelancer or contractor?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },

  // Experience
  {
    question: "How many years of relevant experience do you have?",
    type: "NUMBER",
    required: false,
    options: [],
  },
  {
    question: "How many years of total professional experience do you have?",
    type: "NUMBER",
    required: false,
    options: [],
  },
  {
    question: "Have you led a team before? If yes, what was the team size?",
    type: "TEXT",
    required: false,
    options: [],
  },
  {
    question: "Have you worked in a startup environment before?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "Have you worked in a product-based company before?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },

  // Work Mode & Location
  {
    question: "Are you open to relocate?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "What is your preferred work mode?",
    type: "SELECT",
    required: false,
    options: ["Remote", "Hybrid", "Onsite"],
  },
  {
    question: "Are you comfortable with occasional travel for work?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "What is your current city of residence?",
    type: "TEXT",
    required: false,
    options: [],
  },
  {
    question: "Are you willing to work in rotational shifts?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },

  // Education
  {
    question: "What is your highest level of education?",
    type: "SELECT",
    required: false,
    options: ["High School", "Diploma", "Bachelor's", "Master's", "PhD"],
  },
  {
    question: "What was your field of study?",
    type: "TEXT",
    required: false,
    options: [],
  },
  {
    question: "What is the name of your university or institution?",
    type: "TEXT",
    required: false,
    options: [],
  },
  {
    question: "What is your graduation year?",
    type: "NUMBER",
    required: false,
    options: [],
  },
  {
    question: "What is your aggregate percentage or CGPA?",
    type: "TEXT",
    required: false,
    options: [],
  },

  // Skills & Certifications
  {
    question: "Do you hold any relevant certifications?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "Which certifications do you currently hold?",
    type: "TEXTAREA",
    required: false,
    options: [],
  },
  {
    question: "What is your proficiency level in the primary required skill?",
    type: "SELECT",
    required: false,
    options: ["Beginner", "Intermediate", "Advanced", "Expert"],
  },
  {
    question: "Have you worked with cloud platforms? If yes, which ones?",
    type: "TEXTAREA",
    required: false,
    options: [],
  },
  {
    question: "Are you comfortable working with Agile/Scrum methodology?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },

  // Technical / Role Specific
  {
    question: "Have you worked in an Agile/Scrum environment?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "Have you managed end-to-end project delivery before?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "Do you have experience with client-facing roles?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "Have you worked on international projects or with global teams?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "What tools or technologies do you use daily?",
    type: "TEXTAREA",
    required: false,
    options: [],
  },

  // Availability & Interview
  {
    question: "Are you available for a video interview?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "What is your preferred time slot for an interview?",
    type: "SELECT",
    required: false,
    options: [
      "Morning (9AM-12PM)",
      "Afternoon (12PM-3PM)",
      "Evening (3PM-6PM)",
    ],
  },
  {
    question: "How did you hear about this job opening?",
    type: "SELECT",
    required: false,
    options: ["LinkedIn", "Company Website", "Job Portal", "Referral", "Other"],
  },
  {
    question: "Are you applying to multiple positions simultaneously?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "Do you require any visa or work permit sponsorship?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },

  // Background & Compliance
  {
    question: "Are you comfortable undergoing a background verification check?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "Do you have any prior legal proceedings or criminal record?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "Are you a person with disability (PwD)?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "Do you have a valid government-issued photo ID?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
  {
    question: "Are you willing to sign a non-disclosure agreement (NDA)?",
    type: "BOOLEAN",
    required: false,
    options: [],
  },
];

const ScreeningQuestionsStep = ({
  screeningQuestions,
  setScreeningQuestions,
  messageApi,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionSearch, setSuggestionSearch] = useState("");

  const addQuestion = () => {
    setScreeningQuestions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        question: "",
        type: "TEXT",
        required: true,
        options: [],
      },
    ]);
  };

  const removeQuestion = (id) => {
    setScreeningQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setScreeningQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  const alreadyAdded = (suggestionQuestion) =>
    screeningQuestions.some(
      (q) =>
        q.question.trim().toLowerCase() ===
        suggestionQuestion.trim().toLowerCase(),
    );

  const handleAddSuggestion = (suggestion) => {
    if (screeningQuestions.length >= 10) {
      messageApi?.error("Maximum 10 questions allowed");
      return;
    }
    if (alreadyAdded(suggestion.question)) return;
    setScreeningQuestions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        question: suggestion.question,
        type: suggestion.type,
        // required: suggestion.required,
        required: false,
        options: [...suggestion.options],
      },
    ]);
  };

  return (
    <div
      style={{
        maxHeight: "70vh",
        overflowY: "auto",
        paddingRight: 4,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: "#6B7280" }}>
          Add screening questions candidates must answer before applying.
          Questions marked required must be answered to submit.
        </div>
      </div>

      {/* Suggested Questions Toggle */}
      <div
        style={{
          marginBottom: 16,
          border: "1px solid #E0E7FF",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          //   onClick={() => setShowSuggestions((prev) => !prev)}
          onClick={() => {
            setShowSuggestions((prev) => {
              if (prev) setSuggestionSearch(""); // reset on hide
              return !prev;
            });
          }}
          style={{
            background: "#EEF2FF",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThunderboltOutlined style={{ color: "#4F46E5", fontSize: 15 }} />
            <span style={{ fontWeight: 600, fontSize: 13, color: "#4338CA" }}>
              Frequently Asked Questions
            </span>
            <Tag
              style={{
                background: "#4F46E5",
                color: "#fff",
                border: "none",
                borderRadius: 100,
                fontSize: 11,
                padding: "0 8px",
              }}
            >
              {SUGGESTED_QUESTIONS.length} suggestions
            </Tag>
          </div>
          <span style={{ color: "#6366F1", fontSize: 13, fontWeight: 500 }}>
            {showSuggestions ? "Hide ▲" : "Show ▼"}
          </span>
        </div>

        {/* {showSuggestions && (
          <div
            style={{
              background: "#F5F7FF",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 280, // ← ADD THIS
              overflowY: "auto",
            }}
          >
            {SUGGESTED_QUESTIONS.map((suggestion, i) => { */}
        <div
          style={{
            background: "#F5F7FF",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Search Input */}
          <input
            type="text"
            value={suggestionSearch}
            onChange={(e) => setSuggestionSearch(e.target.value)}
            placeholder="Search questions..."
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #D1D5DB",
              fontSize: 13,
              outline: "none",
              marginBottom: 4,
              boxSizing: "border-box",
              background: "#fff",
            }}
          />

          {/* Scrollable list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            {SUGGESTED_QUESTIONS.filter((s) =>
              s.question.toLowerCase().includes(suggestionSearch.toLowerCase()),
            ).map((suggestion, i) => {
              const added = alreadyAdded(suggestion.question);
              const atMax = screeningQuestions.length >= 10;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 14px",
                    background: added ? "#F0FDF4" : "#FFFFFF",
                    border: added ? "1px solid #86EFAC" : "1px solid #E5E7EB",
                    borderRadius: 8,
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#111827",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {suggestion.question}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        marginTop: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      <Tag
                        style={{
                          fontSize: 11,
                          borderRadius: 100,
                          padding: "0 8px",
                          background: "#EFF6FF",
                          border: "1px solid #BFDBFE",
                          color: "#1D4ED8",
                        }}
                      >
                        {QUESTION_TYPE_OPTIONS.find(
                          (o) => o.value === suggestion.type,
                        )?.label || suggestion.type}
                      </Tag>
                      {/* {suggestion.required && (
                        <Tag
                          style={{
                            fontSize: 11,
                            borderRadius: 100,
                            padding: "0 8px",
                            background: "#FFF7ED",
                            border: "1px solid #FED7AA",
                            color: "#C2410C",
                          }}
                        >
                          Required
                        </Tag>
                      )} */}
                      {suggestion.options.length > 0 && (
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                          {suggestion.options.slice(0, 3).join(", ")}
                          {suggestion.options.length > 3 ? "..." : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="small"
                    disabled={added || atMax}
                    onClick={() => handleAddSuggestion(suggestion)}
                    style={{
                      borderRadius: 100,
                      fontSize: 12,
                      height: 28,
                      padding: "0 12px",
                      background: added
                        ? "#DCFCE7"
                        : atMax
                          ? "#F3F4F6"
                          : "#4F46E5",
                      color: added ? "#16A34A" : atMax ? "#9CA3AF" : "#FFFFFF",
                      border: "none",
                      flexShrink: 0,
                      fontWeight: 600,
                    }}
                  >
                    {added ? "✓ Added" : "+ Add"}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* )} */}
        </div>

        {/* Added Questions */}
        {screeningQuestions.length === 0 ? (
          <div
            style={{
              border: "1px dashed #D1D5DB",
              borderRadius: 10,
              padding: "32px 20px",
              textAlign: "center",
              color: "#9CA3AF",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 14, marginBottom: 8 }}>
              No questions added yet
            </div>
            <div style={{ fontSize: 12 }}>
              Click "Add Question" or pick from suggestions above
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {screeningQuestions.map((q, index) => (
              <div
                key={q.id}
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  padding: "16px",
                  background: "#FAFAFA",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
                  >
                    Question {index + 1}
                  </div>
                  <div
                    onClick={() => removeQuestion(q.id)}
                    style={{
                      cursor: "pointer",
                      color: "#EF4444",
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <DeleteOutlined /> Remove
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}
                  >
                    Question Text <span style={{ color: "#EF4444" }}>*</span>
                  </div>
                  <Input
                    value={q.question}
                    onChange={(e) =>
                      updateQuestion(q.id, "question", e.target.value)
                    }
                    placeholder="e.g. What is your current CTC?"
                    maxLength={300}
                    status={q.question.trim() === "" ? "error" : ""}
                  />
                  {q.question.trim() === "" && (
                    <div
                      style={{ color: "#EF4444", fontSize: 11, marginTop: 2 }}
                    >
                      Question text is required
                    </div>
                  )}
                </div>

                <div
                  style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        marginBottom: 4,
                      }}
                    >
                      Answer Type
                    </div>
                    <Select
                      value={q.type}
                      onChange={(val) => {
                        updateQuestion(q.id, "type", val);
                        if (val !== "SELECT")
                          updateQuestion(q.id, "options", []);
                      }}
                      style={{ width: "100%" }}
                      options={QUESTION_TYPE_OPTIONS}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <div style={{ fontSize: 12, color: "#6B7280" }}>
                      Required
                    </div>
                    <Switch
                      checked={q.required}
                      onChange={(val) => updateQuestion(q.id, "required", val)}
                      size="small"
                    />
                  </div>
                </div>

                {q.type === "SELECT" && (
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        marginBottom: 4,
                      }}
                    >
                      Options{" "}
                      <span style={{ color: "#9CA3AF" }}>
                        (press Enter to add each option)
                      </span>
                    </div>
                    <Select
                      mode="tags"
                      value={q.options}
                      onChange={(val) => updateQuestion(q.id, "options", val)}
                      placeholder="Type an option and press Enter"
                      style={{ width: "100%" }}
                      tokenSeparators={[","]}
                      status={q.options.length < 2 ? "warning" : ""}
                    />
                    {q.options.length < 2 && (
                      <div
                        style={{ color: "#D97706", fontSize: 11, marginTop: 2 }}
                      >
                        Add at least 2 options
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addQuestion}
          style={{ width: "100%", borderRadius: 8, height: 40 }}
          disabled={screeningQuestions.length >= 10}
        >
          Add Question{screeningQuestions.length >= 10 ? " (max 10)" : ""}
        </Button>

        {screeningQuestions.length > 0 && (
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              color: "#9CA3AF",
              textAlign: "right",
            }}
          >
            {screeningQuestions.length} / 10 questions added
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreeningQuestionsStep;
