// import React from "react";
// import { Modal, Progress, Tag } from "antd";

// const FitScoreDetailsModal = ({ open, onClose, data }) => {
//   if (!data) return null;

//   const analysis = data?.aiAnalysis || {};
//   const deep = analysis?.analysis || {};

//   return (
//     <Modal
//       open={open}
//       onCancel={onClose}
//       footer={null}
//       width={700}
//       title="AI Fit Score Details"
//     >
//       {/* Score */}
//       <div style={{ textAlign: "center", marginBottom: 20 }}>
//         <Progress type="circle" percent={data?.matchScore || 0} width={120} />
//         <div style={{ marginTop: 10, fontWeight: 600 }}>
//           {analysis?.matchQuality}
//         </div>
//       </div>

//       {/* Key Strengths */}
//       <div style={{ marginBottom: 16 }}>
//         <h4>✅ Key Match Skills</h4>
//         {(analysis?.key_match_skills || []).map((s) => (
//           <Tag color="green" key={s}>
//             {s}
//           </Tag>
//         ))}
//       </div>

//       {/* Gaps */}
//       <div style={{ marginBottom: 16 }}>
//         <h4>❌ Missing Skills</h4>
//         {(analysis?.key_gap_skills || []).map((s) => (
//           <Tag color="red" key={s}>
//             {s}
//           </Tag>
//         ))}
//       </div>

//       {/* Experience */}
//       <div style={{ marginBottom: 16 }}>
//         <h4>📊 Experience</h4>
//         <p>{deep?.experience_validation?.validation_notes}</p>
//       </div>

//       {/* Role Fit */}
//       <div style={{ marginBottom: 16 }}>
//         <h4>🎯 Role Alignment</h4>
//         <p>{deep?.role_type_analysis?.alignment_reason}</p>
//       </div>

//       {/* Recruiter Insight */}
//       <div>
//         <h4>💡 Recruiter Insight</h4>
//         <p>{analysis?.analysis?.recruiter_insights}</p>
//       </div>
//     </Modal>
//   );
// };

// export default FitScoreDetailsModal;

import { useState } from "react";

// ─── Sample data mirroring your API response ────────────────────────────────
const SAMPLE_DATA = {
  matchScore: 34.5,
  aiAnalysis: {
    fit_percentage: 34.5,
    matchQuality: "POOR",
    total_experience_years: 1.9,
    key_match_skills: ["Apex", "SOQL", "LWC", "Flow", "Workflow Rules"],
    key_gap_skills: ["Process Builder", "Salesforce DX", "Git", "AWS"],
    key_match_clouds: [],
    key_gap_clouds: ["Salesforce Sales Cloud", "Salesforce Service Cloud"],
    scoring_breakdown: {
      education_match: false,
      experience_match: false,
      role_category_match: false,
      critical_skills_missed: 4,
      critical_skills_matched: 4,
      critical_clouds_missed: 2,
      critical_clouds_matched: 0,
      certifications_matched: 3,
    },
    analysis: {
      role_type_analysis: {
        job_role_type: "Developer",
        candidate_role_type: "Administrator",
        alignment: "Mismatch",
        alignment_reason:
          "Candidate's primary title is Administrator, not a developer role.",
      },
      skills_reality_check: {
        actual_proven_skills: [
          "Apex",
          "Apex Triggers",
          "Apex Classes",
          "SOQL",
          "Flow",
          "Validation Rules",
          "Formula Fields",
          "Approval Processes",
          "Page Layouts",
          "Security and Sharing Rules",
          "Batch Apex",
          "Test Classes",
          "Data Loader",
          "Import Wizard",
          "Change Sets",
          "Custom Objects",
          "Custom Fields",
          "Workflow Rules",
          "Email Alerts",
          "LWC",
          "JavaScript",
          "HTML",
          "CSS",
        ],
        claimed_but_not_proven: [
          "Process Builder",
          "Salesforce DX",
          "Git",
          "AWS",
          "Salesforce Sales Cloud",
          "Salesforce Service Cloud",
        ],
        critical_missing_skills: [
          "Process Builder",
          "Salesforce DX",
          "Git",
          "AWS",
          "Salesforce Sales Cloud",
          "Salesforce Service Cloud",
        ],
        skill_credibility:
          "High credibility for proven skills; missing critical skills reduce fit.",
      },
      experience_validation: {
        total_years: 1.9,
        relevant_technical_years: 1.9,
        experience_quality: "Limited but relevant; close to required 2 years.",
        validation_notes:
          "Experience spans 1.9 years, slightly below 2-year requirement.",
      },
      clouds_experience_verification: {
        verified_cloud_experience: [],
        unverified_cloud_claims: [
          "Salesforce Sales Cloud",
          "Salesforce Service Cloud",
        ],
        cloud_credibility_score: 0,
      },
      scoring_breakdown_detailed: {
        required_skills_score: 20,
        required_clouds_score: 0,
        experience_match_score: 9.5,
        education_bonus_score: 0,
        certifications_bonus: 5,
        penalties_applied: [
          "Role category mismatch penalty",
          "Missing critical skills penalty",
        ],
      },
      deal_breakers: [
        "Role category mismatch",
        "Missing critical skills",
        "Missing required clouds",
      ],
      key_strengths: [
        "Apex",
        "SOQL",
        "LWC",
        "Flow",
        "Workflow Rules",
        "Developer experience",
        "Certifications",
      ],
      risk_factors: [
        "Role mismatch",
        "Missing critical skills",
        "Missing required clouds",
        "Experience slightly below requirement",
      ],
      recruiter_insights:
        "Candidate shows strong foundational skills but lacks key development tools and cloud experience required for full stack role. Consider for roles focusing on admin or junior developer with limited scope.",
    },
  },
};

// ─── Colour helpers ──────────────────────────────────────────────────────────
function qualityMeta(q) {
  const map = {
    PERFECT_FIT: {
      label: "Perfect Fit",
      color: "#00c896",
      bg: "#e6fff8",
      ring: "#00c896",
    },
    GOOD: {
      label: "Good Fit",
      color: "#4f8ef7",
      bg: "#eef4ff",
      ring: "#4f8ef7",
    },
    MODERATE: {
      label: "Moderate",
      color: "#f59e0b",
      bg: "#fffbeb",
      ring: "#f59e0b",
    },
    POOR: {
      label: "Poor Fit",
      color: "#ef4444",
      bg: "#fff1f1",
      ring: "#ef4444",
    },
  };
  return map[q] || map.MODERATE;
}

// ─── Circular gauge ──────────────────────────────────────────────────────────
function ScoreRing({ percent, color }) {
  const r = 54,
    cx = 64,
    cy = 64;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width={128} height={128} viewBox="0 0 128 128">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#f0f0f0"
        strokeWidth={10}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 64 64)"
        style={{ transition: "stroke-dasharray .8s ease" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={22}
        fontWeight={700}
        fill={color}
      >
        {percent}%
      </text>
    </svg>
  );
}

// ─── Score bar ───────────────────────────────────────────────────────────────
function ScoreBar({ label, value, max, color = "#4f8ef7" }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          marginBottom: 4,
          color: "#555",
        }}
      >
        <span>{label}</span>
        <span style={{ fontWeight: 600, color }}>
          {value}
          <span style={{ color: "#aaa" }}>/{max}</span>
        </span>
      </div>
      <div
        style={{
          height: 7,
          background: "#f0f0f0",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 99,
            transition: "width .6s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Chip tag ────────────────────────────────────────────────────────────────
function Chip({ label, type = "neutral" }) {
  const styles = {
    green: { bg: "#e6fff4", border: "#b7f5d8", text: "#1a7a4a" },
    red: { bg: "#fff1f0", border: "#ffc9c5", text: "#c0392b" },
    amber: { bg: "#fffbeb", border: "#fde68a", text: "#92610a" },
    blue: { bg: "#eef4ff", border: "#c3d9ff", text: "#1a4fad" },
    neutral: { bg: "#f5f5f5", border: "#e0e0e0", text: "#444" },
  };
  const s = styles[type];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        marginRight: 6,
        marginBottom: 6,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.text,
      }}
    >
      {label}
    </span>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ icon, title, children, accent = "#4f8ef7" }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "18px 20px",
        marginBottom: 14,
        boxShadow: "0 1px 6px rgba(0,0,0,.07)",
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 17 }}>{icon}</span>
        <span
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: "#1a1a2e",
            letterSpacing: ".3px",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── Bool badge ──────────────────────────────────────────────────────────────
function Bool({ label, value }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          background: value ? "#e6fff4" : "#fff1f0",
          color: value ? "#1a7a4a" : "#c0392b",
          border: `1.5px solid ${value ? "#b7f5d8" : "#ffc9c5"}`,
          flexShrink: 0,
        }}
      >
        {value ? "✓" : "✗"}
      </span>
      <span style={{ fontSize: 12.5, color: "#444" }}>{label}</span>
    </div>
  );
}

// ─── Main Modal component ────────────────────────────────────────────────────
export default function FitScoreDetailsModal({
  open = true,
  onClose,
  data = SAMPLE_DATA,
}) {
  const [tab, setTab] = useState("overview");

  if (!open || !data) return null;

  //   const analysis = data?.aiAnalysis || {};
  //   const deep = analysis?.analysis || {};
  const analysis = data?.aiAnalysis || {};
  const deep = analysis?.analysis || {};
  const sb = analysis?.scoring_breakdown || {};
  const sbd = deep?.scoring_breakdown_detailed || {};
  const qm = qualityMeta(analysis?.matchQuality);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "skills", label: "Skills" },
    { id: "scoring", label: "Scoring" },
    { id: "insights", label: "Insights" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(10,10,30,.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#f7f8fc",
          borderRadius: 20,
          width: "100%",
          maxWidth: 740,
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0,0,0,.25)",
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
            padding: "22px 24px 18px",
            borderRadius: "20px 20px 0 0",
            position: "relative",
          }}
        >
          {/* close */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 16,
              background: "rgba(255,255,255,.12)",
              border: "none",
              borderRadius: "50%",
              width: 30,
              height: 30,
              cursor: "pointer",
              color: "#fff",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* ring */}
            <div
              style={{
                background: "rgba(255,255,255,.07)",
                borderRadius: 16,
                padding: 10,
                flexShrink: 0,
              }}
            >
              <ScoreRing
                // percent={Math.round(analysis.fit_percentage || 0)}
                percent={Math.round(
                  data?.matchScore || analysis.fit_percentage || 0,
                )}
                color={qm.color}
              />
            </div>

            {/* meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    background: qm.bg,
                    color: qm.color,
                    border: `1.5px solid ${qm.ring}`,
                    padding: "3px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".5px",
                    textTransform: "uppercase",
                  }}
                >
                  {qm.label}
                </span>
              </div>
              <div
                style={{
                  color: "#e8e8f0",
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                AI Fit Score Analysis
              </div>
              <div style={{ color: "#9098b8", fontSize: 12.5 }}>
                {analysis.total_experience_years} yrs experience ·{" "}
                {sb.certifications_matched} certs matched
              </div>

              {/* quick pills */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                <span
                  style={{
                    background: "rgba(255,255,255,.1)",
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 11.5,
                    fontWeight: 500,
                  }}
                >
                  🎯 Role: {deep?.role_type_analysis?.alignment || "—"}
                </span>
                <span
                  style={{
                    background: "rgba(255,255,255,.1)",
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 11.5,
                    fontWeight: 500,
                  }}
                >
                  ✅ {sb.critical_skills_matched} skills matched
                </span>
                <span
                  style={{
                    background: "rgba(255,255,255,.1)",
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 11.5,
                    fontWeight: 500,
                  }}
                >
                  ❌ {sb.critical_skills_missed} skills missing
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div
          style={{
            display: "flex",
            borderBottom: "2px solid #eef0f6",
            background: "#fff",
            padding: "0 24px",
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "12px 16px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? "#4f8ef7" : "#888",
                borderBottom:
                  tab === t.id ? "2px solid #4f8ef7" : "2px solid transparent",
                marginBottom: -2,
                transition: "all .2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          {/* ═══ OVERVIEW ═══ */}
          {tab === "overview" && (
            <>
              {/* Score breakdown quick view */}
              <Section icon="📊" title="Score Breakdown" accent="#4f8ef7">
                <ScoreBar
                  label="Required Skills"
                  value={sbd.required_skills_score ?? 20}
                  max={40}
                  color="#4f8ef7"
                />
                <ScoreBar
                  label="Required Clouds"
                  value={sbd.required_clouds_score ?? 0}
                  max={20}
                  color="#8b5cf6"
                />
                <ScoreBar
                  label="Experience Match"
                  value={sbd.experience_match_score ?? 9.5}
                  max={20}
                  color="#f59e0b"
                />
                <ScoreBar
                  label="Education Bonus"
                  value={sbd.education_bonus_score ?? 0}
                  max={10}
                  color="#10b981"
                />
                <ScoreBar
                  label="Certifications"
                  value={sbd.certifications_bonus ?? 5}
                  max={10}
                  color="#06b6d4"
                />
              </Section>

              {/* Criteria checklist */}
              <Section icon="✅" title="Evaluation Criteria" accent="#10b981">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "4px 16px",
                  }}
                >
                  <Bool label="Education Match" value={sb.education_match} />
                  <Bool label="Experience Match" value={sb.experience_match} />
                  <Bool
                    label="Role Category Match"
                    value={sb.role_category_match}
                  />
                  <Bool
                    label="Cloud Experience"
                    value={sb.critical_clouds_matched > 0}
                  />
                  <Bool
                    label="Skills Threshold"
                    value={
                      sb.critical_skills_matched >= sb.critical_skills_missed
                    }
                  />
                  <Bool
                    label="Certifications"
                    value={sb.certifications_matched > 0}
                  />
                </div>
              </Section>

              {/* Deal breakers */}
              {deep?.deal_breakers?.length > 0 && (
                <Section icon="🚨" title="Deal Breakers" accent="#ef4444">
                  {deep.deal_breakers.map((d) => (
                    <div
                      key={d}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ color: "#ef4444", fontSize: 14 }}>●</span>
                      <span style={{ fontSize: 13, color: "#333" }}>{d}</span>
                    </div>
                  ))}
                </Section>
              )}

              {/* Role alignment */}
              <Section icon="🎯" title="Role Alignment" accent="#f59e0b">
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      minWidth: 130,
                      background: "#fff7ed",
                      border: "1px solid #fed7aa",
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#9a3412",
                        textTransform: "uppercase",
                        letterSpacing: ".5px",
                        marginBottom: 4,
                      }}
                    >
                      Job Role
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#1a1a2e",
                      }}
                    >
                      {deep?.role_type_analysis?.job_role_type}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: 18,
                      color: "#f59e0b",
                    }}
                  >
                    ↔
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minWidth: 130,
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#9a1212",
                        textTransform: "uppercase",
                        letterSpacing: ".5px",
                        marginBottom: 4,
                      }}
                    >
                      Candidate Role
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#1a1a2e",
                      }}
                    >
                      {deep?.role_type_analysis?.candidate_role_type}
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 12.5,
                    color: "#555",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {deep?.role_type_analysis?.alignment_reason}
                </p>
              </Section>
            </>
          )}

          {/* ═══ SKILLS ═══ */}
          {tab === "skills" && (
            <>
              <Section icon="💪" title="Key Match Skills" accent="#10b981">
                <div>
                  {(analysis.key_match_skills || []).map((s) => (
                    <Chip key={s} label={s} type="green" />
                  ))}
                </div>
              </Section>

              <Section icon="🔬" title="All Proven Skills" accent="#06b6d4">
                <div>
                  {(deep?.skills_reality_check?.actual_proven_skills || []).map(
                    (s) => (
                      <Chip key={s} label={s} type="blue" />
                    ),
                  )}
                </div>
              </Section>

              <Section icon="⚠️" title="Claimed But Unproven" accent="#f59e0b">
                <div>
                  {(
                    deep?.skills_reality_check?.claimed_but_not_proven || []
                  ).map((s) => (
                    <Chip key={s} label={s} type="amber" />
                  ))}
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "#777",
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  {deep?.skills_reality_check?.skill_credibility}
                </p>
              </Section>

              <Section
                icon="❌"
                title="Critical Missing Skills"
                accent="#ef4444"
              >
                <div>
                  {(analysis.key_gap_skills || []).map((s) => (
                    <Chip key={s} label={s} type="red" />
                  ))}
                </div>
              </Section>

              {/* Clouds */}
              <Section icon="☁️" title="Cloud Experience" accent="#8b5cf6">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#1a7a4a",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      ✅ Verified
                    </div>
                    {deep?.clouds_experience_verification
                      ?.verified_cloud_experience?.length ? (
                      deep.clouds_experience_verification.verified_cloud_experience.map(
                        (c) => <Chip key={c} label={c} type="green" />,
                      )
                    ) : (
                      <span
                        style={{
                          fontSize: 12,
                          color: "#aaa",
                          fontStyle: "italic",
                        }}
                      >
                        None verified
                      </span>
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#c0392b",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      ❌ Unverified
                    </div>
                    {(
                      deep?.clouds_experience_verification
                        ?.unverified_cloud_claims || []
                    ).map((c) => (
                      <Chip key={c} label={c} type="red" />
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 12,
                    background: "#f5f5ff",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 12,
                    color: "#555",
                  }}
                >
                  <strong>Cloud Credibility Score:</strong>{" "}
                  {deep?.clouds_experience_verification
                    ?.cloud_credibility_score ?? 0}
                  /100
                </div>
              </Section>
            </>
          )}

          {/* ═══ SCORING ═══ */}
          {tab === "scoring" && (
            <>
              <Section
                icon="🏆"
                title="Detailed Score Breakdown"
                accent="#4f8ef7"
              >
                {[
                  {
                    label: "Required Skills Score",
                    value: sbd.required_skills_score ?? 20,
                    max: 40,
                    color: "#4f8ef7",
                  },
                  {
                    label: "Required Clouds Score",
                    value: sbd.required_clouds_score ?? 0,
                    max: 20,
                    color: "#8b5cf6",
                  },
                  {
                    label: "Experience Match Score",
                    value: sbd.experience_match_score ?? 9.5,
                    max: 20,
                    color: "#f59e0b",
                  },
                  {
                    label: "Education Bonus",
                    value: sbd.education_bonus_score ?? 0,
                    max: 10,
                    color: "#10b981",
                  },
                  {
                    label: "Certifications Bonus",
                    value: sbd.certifications_bonus ?? 5,
                    max: 10,
                    color: "#06b6d4",
                  },
                ].map((b) => (
                  <ScoreBar key={b.label} {...b} />
                ))}
              </Section>

              <Section icon="⬇️" title="Penalties Applied" accent="#ef4444">
                {(sbd.penalties_applied || []).map((p) => (
                  <div
                    key={p}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        background: "#fff1f0",
                        color: "#ef4444",
                        border: "1px solid #ffc9c5",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: 11.5,
                        fontWeight: 600,
                      }}
                    >
                      −
                    </span>
                    <span style={{ fontSize: 13, color: "#444" }}>{p}</span>
                  </div>
                ))}
              </Section>

              <Section icon="📈" title="Experience Validation" accent="#f59e0b">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  {[
                    {
                      label: "Total Years",
                      value: `${deep?.experience_validation?.total_years} yrs`,
                    },
                    {
                      label: "Relevant Tech Years",
                      value: `${deep?.experience_validation?.relevant_technical_years} yrs`,
                    },
                  ].map((r) => (
                    <div
                      key={r.label}
                      style={{
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "#92610a",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          marginBottom: 4,
                        }}
                      >
                        {r.label}
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: "#1a1a2e",
                        }}
                      >
                        {r.value}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    background: "#f9fafb",
                    borderRadius: 8,
                    padding: "10px 14px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 12.5,
                      color: "#555",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    <strong>Quality:</strong>{" "}
                    {deep?.experience_validation?.experience_quality}
                  </p>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: "#555",
                      margin: "6px 0 0",
                      lineHeight: 1.6,
                    }}
                  >
                    {deep?.experience_validation?.validation_notes}
                  </p>
                </div>
              </Section>
            </>
          )}

          {/* ═══ INSIGHTS ═══ */}
          {tab === "insights" && (
            <>
              <Section icon="🌟" title="Key Strengths" accent="#10b981">
                <div>
                  {(deep?.key_strengths || []).map((s) => (
                    <Chip key={s} label={s} type="green" />
                  ))}
                </div>
              </Section>

              <Section icon="⚡" title="Risk Factors" accent="#ef4444">
                {(deep?.risk_factors || []).map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 10,
                      marginBottom: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        marginTop: 2,
                        width: 20,
                        height: 20,
                        background: "#fff1f0",
                        border: "1px solid #ffc9c5",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: "#ef4444",
                        fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}
                    >
                      {r}
                    </span>
                  </div>
                ))}
              </Section>

              <Section icon="💡" title="Recruiter Insights" accent="#4f8ef7">
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #eef4ff 0%, #f0f7ff 100%)",
                    border: "1px solid #c3d9ff",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 13.5,
                      color: "#1a3a6b",
                      lineHeight: 1.7,
                      margin: 0,
                      fontStyle: "italic",
                    }}
                  >
                    "{deep?.recruiter_insights}"
                  </p>
                </div>
              </Section>

              {/* Scoring summary */}
              <Section icon="📋" title="Scoring Summary" accent="#8b5cf6">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 10,
                  }}
                >
                  {[
                    {
                      label: "Skills Matched",
                      value: sb.critical_skills_matched,
                      color: "#10b981",
                      bg: "#e6fff4",
                    },
                    {
                      label: "Skills Missed",
                      value: sb.critical_skills_missed,
                      color: "#ef4444",
                      bg: "#fff1f0",
                    },
                    {
                      label: "Clouds Matched",
                      value: sb.critical_clouds_matched,
                      color: "#4f8ef7",
                      bg: "#eef4ff",
                    },
                    {
                      label: "Clouds Missed",
                      value: sb.critical_clouds_missed,
                      color: "#f59e0b",
                      bg: "#fffbeb",
                    },
                    {
                      label: "Certs Matched",
                      value: sb.certifications_matched,
                      color: "#8b5cf6",
                      bg: "#f5f3ff",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        background: s.bg,
                        borderRadius: 10,
                        padding: "12px 10px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: s.color,
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: "#666",
                          marginTop: 3,
                          fontWeight: 500,
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: "12px 20px",
            background: "#fff",
            borderTop: "1px solid #eef0f6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: "0 0 20px 20px",
          }}
        >
          <span style={{ fontSize: 11.5, color: "#aaa" }}>
            AI-generated · {new Date().toLocaleDateString()}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                padding: "8px 20px",
                borderRadius: 10,
                border: "1.5px solid #e0e0e0",
                background: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "#555",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
