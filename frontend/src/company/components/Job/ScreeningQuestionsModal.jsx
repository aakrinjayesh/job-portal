import React, { useState, useEffect, useRef } from "react";
import { Modal } from "antd";
import { ArrowRightOutlined, CheckCircleFilled } from "@ant-design/icons";

/* ── Theme tokens matching HomePage exactly ── */
const NAVY = "#011026";
const PRIMARY = "#1677FF";
const PRIMARY_LIGHT = "#E6F0FF";
const CONTENT_BG = "#f5f6fa";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── Typing dots ── */
const TypingDots = () => (
  <div
    style={{ display: "flex", gap: 5, padding: "3px 0", alignItems: "center" }}
  >
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#9CA3AF",
          display: "inline-block",
          animation: `fh-sq-bounce 1.2s ${i * 0.18}s infinite ease-in-out`,
        }}
      />
    ))}
    <style>{`
      @keyframes fh-sq-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
      @keyframes fh-sq-fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    `}</style>
  </div>
);

/* ── Bot bubble ── */
const SysB = ({ children, visible }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-end",
      gap: 9,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: "opacity .3s ease, transform .3s ease",
      marginBottom: 14,
    }}
  >
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: NAVY,
        border: `2px solid rgba(22,119,255,0.5)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: 12,
        color: PRIMARY,
        fontWeight: 700,
      }}
    >
      FH
    </div>
    <div
      style={{
        background: "#fff",
        border: "1px solid #f0f0f0",
        borderRadius: "0 12px 12px 12px",
        padding: "10px 14px",
        maxWidth: "80%",
        fontSize: 13,
        color: "#1a1a1a",
        lineHeight: 1.6,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  </div>
);

/* ── User bubble ── */
const UserB = ({ children, visible }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(8px)",
      transition: "opacity .28s ease, transform .28s ease",
      marginBottom: 14,
    }}
  >
    <div
      style={{
        background: PRIMARY,
        borderRadius: "12px 0 12px 12px",
        padding: "10px 14px",
        maxWidth: "80%",
        fontSize: 13,
        color: "#fff",
        lineHeight: 1.6,
        boxShadow: "0 2px 8px rgba(22,119,255,0.22)",
      }}
    >
      {children}
    </div>
  </div>
);

/* ── Answer inputs ── */
// FIX: Accept onSubmitWithValue so SELECT/BOOLEAN can pass the chosen value
// directly, bypassing the stale-closure problem entirely.
const AnswerInput = ({ q, value, onChange, onSubmit, onSubmitWithValue }) => {
  const ref = useRef(null);
  useEffect(() => {
    setTimeout(() => ref.current?.focus?.(), 80);
  }, [q.id]);

  const base = {
    width: "100%",
    border: "1.5px solid #e8e8e8",
    borderRadius: 8,
    padding: "9px 13px",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    color: "#1a1a1a",
    background: "#fff",
    transition: "border-color .18s, box-shadow .18s",
    boxSizing: "border-box",
  };
  const onFocus = (e) => {
    e.target.style.borderColor = PRIMARY;
    e.target.style.boxShadow = `0 0 0 2px ${PRIMARY_LIGHT}`;
  };
  const onBlur = (e) => {
    e.target.style.borderColor = "#e8e8e8";
    e.target.style.boxShadow = "none";
  };
  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  if (q.type === "TEXTAREA")
    return (
      <textarea
        ref={ref}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer…"
        style={{ ...base, resize: "vertical", lineHeight: 1.6 }}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );

  if (q.type === "NUMBER")
    return (
      <input
        ref={ref}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter a number…"
        onKeyDown={onKey}
        style={base}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );

  if (q.type === "BOOLEAN")
    return (
      <div style={{ display: "flex", gap: 10 }}>
        {[
          { label: "Yes", val: "true" },
          { label: "No", val: "false" },
        ].map(({ label, val }) => {
          const sel = value === val;
          return (
            <button
              key={val}
              onClick={() => {
                // FIX: Pass the chosen value directly so handleNext reads it
                // immediately — no stale-closure issue.
                onSubmitWithValue(val);
              }}
              style={{
                flex: 1,
                padding: "9px 0",
                border: `1.5px solid ${sel ? PRIMARY : "#e8e8e8"}`,
                borderRadius: 8,
                background: sel ? PRIMARY : "#fff",
                color: sel ? "#fff" : "#595959",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all .2s",
                boxShadow: sel ? "0 2px 8px rgba(22,119,255,0.22)" : "none",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    );

  if (q.type === "SELECT")
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {(q.options || []).map((opt) => {
          const sel = value === opt;
          return (
            <button
              key={opt}
              onClick={() => {
                // FIX: Pass the chosen value directly — same fix as BOOLEAN.
                onSubmitWithValue(opt);
              }}
              style={{
                padding: "9px 13px",
                textAlign: "left",
                border: `1.5px solid ${sel ? PRIMARY : "#e8e8e8"}`,
                borderRadius: 8,
                background: sel ? PRIMARY_LIGHT : "#fff",
                color: sel ? PRIMARY : "#595959",
                fontSize: 13,
                fontWeight: sel ? 600 : 400,
                cursor: "pointer",
                transition: "all .2s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {sel && (
                <CheckCircleFilled style={{ color: PRIMARY, fontSize: 13 }} />
              )}
              {opt}
            </button>
          );
        })}
      </div>
    );

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer…"
      onKeyDown={onKey}
      style={base}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};

/* ════════════════════════════
   MAIN MODAL COMPONENT
════════════════════════════ */
const ScreeningQuestionsModal = ({
  screeningQuestions = [],
  screeningAnswers = {},
  screeningModalOpen,
  closeModal,
  updateAnswer,
  applyLoading,
  onSubmit,
  selectedCount,
}) => {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState("intro");
  const [showTyping, setShowTyping] = useState(false);
  const [bubbleVis, setBubbleVis] = useState(false);
  const [introBubbles, setIntroBubbles] = useState([false, false]);
  const [userBubbles, setUserBubbles] = useState({});
  const [localAnswers, setLocalAnswers] = useState({});
  const scrollRef = useRef(null);

  const q = screeningQuestions[step];

  useEffect(() => {
    if (!screeningModalOpen) return;
    setStep(0);
    setPhase("intro");
    setShowTyping(false);
    setBubbleVis(false);
    setUserBubbles({});
    setLocalAnswers({});
    setIntroBubbles([false, false]);
    (async () => {
      await sleep(300);
      setIntroBubbles([true, false]);
      await sleep(650);
      setIntroBubbles([true, true]);
      await sleep(480);
      await revealQ();
    })();
  }, [screeningModalOpen]);

  const revealQ = async () => {
    setShowTyping(true);
    setBubbleVis(false);
    await sleep(820);
    setShowTyping(false);
    setBubbleVis(true);
  };

  useEffect(() => {
    setTimeout(
      () =>
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        }),
      80,
    );
  }, [bubbleVis, userBubbles, phase, showTyping, introBubbles]);

  // FIX: Accept an optional `explicitAnswer` param so SELECT/BOOLEAN can pass
  // their value in directly, avoiding the stale localAnswers closure issue.
  const handleNext = async (explicitAnswer) => {
    const ans =
      explicitAnswer !== undefined
        ? explicitAnswer
        : (localAnswers[q?.id] ?? "");

    if (q?.required && !String(ans).trim()) return;

    // Sync local state and parent if an explicit value was supplied
    if (explicitAnswer !== undefined) {
      setLocalAnswers((prev) => ({ ...prev, [q.id]: explicitAnswer }));
    }

    updateAnswer(q.id, ans);
    setUserBubbles((prev) => ({ ...prev, [q.id]: ans }));

    const next = step + 1;
    if (next >= screeningQuestions.length) {
      await sleep(360);
      setPhase("done");
      return;
    }
    setStep(next);
    await sleep(260);
    await revealQ();
  };

  const setAns = (id, val) => {
    setLocalAnswers((prev) => ({ ...prev, [id]: val }));
    updateAnswer(id, val);
  };

  const displayAnswer = (ans) =>
    ans === "true" ? "Yes ✓" : ans === "false" ? "No" : ans;

  const currentAns = localAnswers[q?.id] ?? "";
  const canNext = !q?.required || String(currentAns).trim() !== "";
  const answered = Object.keys(userBubbles).length;
  const total = screeningQuestions.length;
  const pct = total > 0 ? (answered / total) * 100 : 0;

  const subtitle =
    selectedCount != null
      ? `Applied to all ${selectedCount} candidate${selectedCount > 1 ? "s" : ""}`
      : "Questions from the recruiter";

  return (
    <Modal
      centered
      open={screeningModalOpen}
      onCancel={() => !applyLoading && closeModal(applyLoading)}
      footer={null}
      width={500}
      closeIcon={
        <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>✕</span>
      }
      maskClosable={!applyLoading}
      closable={!applyLoading}
      styles={{
        content: {
          padding: 0,
          borderRadius: 12,
          overflow: "hidden",
          height: 520,
          display: "flex",
          flexDirection: "column",
        },
        body: {
          padding: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        },
        mask: { backdropFilter: "blur(2px)" },
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ background: NAVY, padding: "18px 22px 14px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              flexShrink: 0,
              background: "rgba(22,119,255,0.15)",
              border: "1px solid rgba(22,119,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            📋
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.2,
              }}
            >
              Application Questions
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {subtitle}
            </div>
          </div>
          <div
            style={{
              background: "rgba(22,119,255,0.15)",
              border: "1px solid rgba(22,119,255,0.3)",
              borderRadius: 100,
              padding: "3px 12px",
              fontSize: 11,
              fontWeight: 700,
              color: PRIMARY,
              whiteSpace: "nowrap",
            }}
          >
            {answered} / {total}
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 3,
            borderRadius: 3,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${PRIMARY}, #40a9ff)`,
              borderRadius: 3,
              transition: "width .5s ease",
            }}
          />
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      <div
        ref={scrollRef}
        style={{
          padding: "18px 20px 10px",
          flex: 1,
          overflowY: "auto",
          background: CONTENT_BG,
          scrollbarWidth: "thin",
          scrollbarColor: "#ddd transparent",
        }}
      >
        <SysB visible={introBubbles[0]}>
          👋 Hi there! I have a few quick questions for your application.
        </SysB>
        <SysB visible={introBubbles[1]}>
          Answer each one at your own pace — we'll wrap this up quickly!
        </SysB>

        {/* answered history */}
        {screeningQuestions.slice(0, step).map((prevQ) => (
          <React.Fragment key={prevQ.id}>
            <SysB visible>
              {prevQ.question}
              {prevQ.required && (
                <span style={{ color: "#ff4d4f", marginLeft: 3, fontSize: 11 }}>
                  *
                </span>
              )}
            </SysB>
            {userBubbles[prevQ.id] !== undefined && (
              <UserB visible>
                {/* FIX: Show the actual answer if present; only show "Skipped"
                    when the value is genuinely empty (user clicked Skip). */}
                {userBubbles[prevQ.id] ? (
                  displayAnswer(userBubbles[prevQ.id])
                ) : (
                  <span style={{ opacity: 0.6 }}>Skipped</span>
                )}
              </UserB>
            )}
          </React.Fragment>
        ))}

        {showTyping && (
          <SysB visible>
            <TypingDots />
          </SysB>
        )}

        {phase !== "done" && q && bubbleVis && (
          <SysB visible>
            {q.question}
            {q.required && (
              <span style={{ color: "#ff4d4f", marginLeft: 3, fontSize: 11 }}>
                *
              </span>
            )}
          </SysB>
        )}

        {phase === "done" && (
          <SysB visible>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircleFilled style={{ color: "#52C41A" }} />
              All done! Ready to submit your application?
            </span>
          </SysB>
        )}
      </div>

      {/* ── INPUT AREA ── */}
      <div
        style={{
          padding: "12px 20px 20px",
          borderTop: "1px solid #f0f0f0",
          background: "#fff",
          flexShrink: 0,
        }}
      >
        {phase !== "done" && q && bubbleVis ? (
          <div style={{ animation: "fh-sq-fadeup .22s ease" }}>
            <AnswerInput
              q={q}
              value={currentAns}
              onChange={(v) => setAns(q.id, v)}
              onSubmit={handleNext}
              // FIX: New prop — called by SELECT/BOOLEAN with the chosen value
              onSubmitWithValue={(val) => {
                setAns(q.id, val);
                handleNext(val);
              }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              {q.type !== "BOOLEAN" && q.type !== "SELECT" && (
                <button
                  onClick={() => handleNext()}
                  disabled={!canNext}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 8,
                    border: "none",
                    background: canNext ? PRIMARY : "#f5f5f5",
                    color: canNext ? "#fff" : "#bbb",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: canNext ? "pointer" : "not-allowed",
                    transition: "all .2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    boxShadow: canNext
                      ? "0 2px 8px rgba(22,119,255,0.22)"
                      : "none",
                  }}
                >
                  {step < screeningQuestions.length - 1 ? (
                    <>
                      Next <ArrowRightOutlined style={{ fontSize: 11 }} />
                    </>
                  ) : (
                    <>
                      Review <ArrowRightOutlined style={{ fontSize: 11 }} />
                    </>
                  )}
                </button>
              )}

              {/* FIX: Skip only clears the answer — doesn't clobber a typed value.
                  It now explicitly passes "" so handleNext records a genuine skip. */}
              {!q.required && (
                <button
                  onClick={() => handleNext("")}
                  style={{
                    height: 40,
                    padding: "0 16px",
                    borderRadius: 8,
                    border: "1.5px solid #e8e8e8",
                    background: "#fff",
                    color: "#595959",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  Skip
                </button>
              )}
            </div>

            {(q.type === "TEXT" || q.type === "NUMBER") && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "#c0c0c0",
                  marginTop: 7,
                }}
              >
                Press Enter to continue
              </div>
            )}
          </div>
        ) : phase === "done" ? (
          <button
            onClick={onSubmit}
            disabled={applyLoading}
            style={{
              width: "100%",
              height: 44,
              borderRadius: 8,
              border: "none",
              background: applyLoading ? "#f5f5f5" : PRIMARY,
              color: applyLoading ? "#bbb" : "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: applyLoading ? "wait" : "pointer",
              boxShadow: applyLoading
                ? "none"
                : "0 4px 12px rgba(22,119,255,0.28)",
              transition: "all .2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
          >
            {applyLoading ? (
              "Submitting…"
            ) : (
              <>
                <CheckCircleFilled style={{ fontSize: 14 }} /> Submit
                Application
              </>
            )}
          </button>
        ) : (
          <div style={{ height: 8 }} />
        )}
      </div>
    </Modal>
  );
};

export default ScreeningQuestionsModal;
