import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Button,
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Space,
  Divider,
  Avatar,
  Badge,
} from "antd";
import {
  SearchOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  BankOutlined,
  UserOutlined,
  FireOutlined,
  ApartmentOutlined,
  SolutionOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  MessageOutlined,
  FileTextOutlined,
  SaveFilled,
  EnvironmentOutlined,
  ClockCircleOutlined,
  StarOutlined,
  DollarOutlined,
  SafetyCertificateOutlined as CertIcon,
  CheckOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

/* ─── THEME TOKENS (matching your app exactly) ─── */
const NAVY = "#011026"; // sidebar bg
const PRIMARY = "#1677FF"; // ant default blue
const PRIMARY_LIGHT = "#E6F0FF";
const CONTENT_BG = "#f5f6fa"; // your Content background
const HEADER_BG = "#ffffff";
const CARD_SHADOW = "0 2px 8px rgba(0,0,0,0.08)";

/* ─── INJECT STYLES ─── */
const injectStyles = () => {
  if (document.getElementById("fh-styles")) return;
  const s = document.createElement("style");
  s.id = "fh-styles";
  s.textContent = `
    html, body { margin: 0; padding: 0; }
    .fh-root { background: ${CONTENT_BG}; min-height: 100vh; }

    /* ── NAV: matches your Header exactly ── */
    .fh-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      height: 80px;
      background: ${HEADER_BG};
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      display: flex; align-items: center;
      padding: 0 40px;
      justify-content: space-between;
    }
    .fh-nav.scrolled { box-shadow: 0 2px 12px rgba(0,0,0,0.10); }
    .fh-logo {
      display: flex; align-items: center; gap: 10px;
      cursor: pointer; user-select: none;
    }
    .fh-logo-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: ${NAVY};
      display: flex; align-items: center; justify-content: center;
      color: ${PRIMARY}; font-size: 18px;
    }
    .fh-logo-text { font-size: 18px; font-weight: 700; color: ${NAVY}; line-height: 1; }
    .fh-logo-sub  { font-size: 11px; color: #888; font-weight: 400; }

    /* ── HERO ── */
    .fh-hero {
      padding: 140px 40px 80px;
      background: linear-gradient(165deg, #EEF5FF 0%, #F8FBFF 60%, ${CONTENT_BG} 100%);
      position: relative; overflow: hidden;
    }
    .fh-hero-blob {
      position: absolute; border-radius: 50%; pointer-events: none;
      background: radial-gradient(circle, rgba(22,119,255,0.07) 0%, transparent 65%);
    }
    .fh-hero-blob-1 { width: 800px; height: 800px; top: -300px; right: -200px; }
    .fh-hero-blob-2 { width: 600px; height: 600px; bottom: -200px; left: -200px; opacity: 0.6; }
    .fh-hero-inner { max-width: 1160px; margin: 0 auto; position: relative; z-index: 1; }

    /* ── PILL BADGE ── */
    .fh-pill {
      display: inline-flex; align-items: center; gap: 6px;
      background: ${PRIMARY_LIGHT}; color: ${PRIMARY};
      border: 1px solid #BAD7FF;
      font-size: 12px; font-weight: 600;
      padding: 4px 14px; border-radius: 100px;
      letter-spacing: 0.3px;
    }

    /* ── TRUST BAR ── */
    .fh-trust {
      background: ${HEADER_BG};
      border-top: 1px solid #f0f0f0;
      border-bottom: 1px solid #f0f0f0;
      padding: 0 40px;
      display: flex; justify-content: center; flex-wrap: wrap;
    }
    .fh-trust-item {
      padding: 18px 40px;
      text-align: center;
      border-right: 1px solid #f0f0f0;
    }
    .fh-trust-item:last-child { border-right: none; }

    /* ── GENERIC SECTION ── */
    .fh-section { padding: 80px 40px; max-width: 1160px; margin: 0 auto; }
    .fh-section-bg { background: ${HEADER_BG}; }
    .fh-section-alt { background: ${CONTENT_BG}; }
    .fh-section-label {
      font-size: 11px; font-weight: 700; letter-spacing: 2px;
      text-transform: uppercase; color: ${PRIMARY};
      display: block; margin-bottom: 10px;
    }

    /* ── STEP CARDS ── */
    .fh-step-card {
      height: 100% !important;
      border-radius: 12px !important;
      border: 1px solid #f0f0f0 !important;
      background: ${HEADER_BG} !important;
      box-shadow: ${CARD_SHADOW} !important;
      transition: all 0.25s ease !important;
    }
    .fh-step-card:hover {
      border-color: ${PRIMARY} !important;
      box-shadow: 0 8px 28px rgba(22,119,255,0.14) !important;
      transform: translateY(-4px) !important;
    }
    .fh-step-num {
      font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
      color: #d0d0d0; position: absolute; top: 20px; right: 20px;
    }
    .fh-icon-box {
      width: 48px; height: 48px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; margin-bottom: 18px;
    }

    /* ── DARK SECTION (matching your sidebar) ── */
    .fh-dark { background: ${NAVY}; padding: 80px 40px; }
    .fh-dark-inner { max-width: 1160px; margin: 0 auto; }
    .fh-path-card {
      height: 100% !important;
      background: rgba(255,255,255,0.04) !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      border-radius: 12px !important;
      transition: all 0.25s ease !important;
    }
    .fh-path-card:hover {
      background: rgba(255,255,255,0.07) !important;
      border-color: rgba(22,119,255,0.5) !important;
      box-shadow: 0 8px 32px rgba(22,119,255,0.15) !important;
    }
    .fh-path-card.blue-border { border-top: 3px solid ${PRIMARY} !important; }
    .fh-path-card.green-border { border-top: 3px solid #52C41A !important; }
    .fh-check-row { display: flex; align-items: flex-start; gap: 10px; }

    /* ── STATS ── */
    .fh-stats { background: ${PRIMARY}; padding: 60px 40px; }
    .fh-stats-inner { max-width: 1160px; margin: 0 auto; }

    /* ── SKILLS ── */
    .fh-tag-wrap { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
    .fh-skill-tag {
      font-size: 13px !important; padding: 5px 14px !important;
      border-radius: 100px !important; cursor: default;
      border: 1px solid #e0e0e0 !important; background: #fff !important;
      transition: all 0.2s !important; line-height: 1.5 !important;
    }
    .fh-skill-tag:hover {
      border-color: ${PRIMARY} !important;
      color: ${PRIMARY} !important;
      background: ${PRIMARY_LIGHT} !important;
    }

    /* ── PREVIEW WINDOW ── */
    .fh-preview-window {
      background: ${CONTENT_BG};
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 24px 64px rgba(1,16,38,0.22), 0 4px 16px rgba(0,0,0,0.08);
      border: 1px solid #e0e0e0;
      user-select: none;
    }

    /* title bar (macOS style) */
    .fh-preview-titlebar {
      background: #f0f0f0;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid #ddd;
    }
    .fh-preview-dot { width: 11px; height: 11px; border-radius: 50%; }
    .fh-preview-dot-r { background: #FF5F57; }
    .fh-preview-dot-y { background: #FEBC2E; }
    .fh-preview-dot-g { background: #28C840; }
    .fh-preview-titlebar-label {
      flex: 1; text-align: center;
      font-size: 11px; font-weight: 600; color: #777;
      margin-right: 56px;
    }

    /* inner layout */
    .fh-preview-body { display: flex; height: 340px; }

    /* sidebar */
    .fh-preview-sidebar {
      width: 148px; flex-shrink: 0;
      background: ${NAVY};
      display: flex; flex-direction: column;
      padding: 14px 0;
      gap: 2px;
    }
    .fh-preview-user {
      display: flex; align-items: center; gap: 8px;
      padding: 4px 14px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      margin-bottom: 6px;
    }
    .fh-preview-menu-item {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 14px;
      font-size: 11px; font-weight: 500;
      color: rgba(255,255,255,0.5);
      cursor: default; transition: all 0.2s;
      border-radius: 0;
    }
    .fh-preview-menu-item.active {
      background: ${PRIMARY};
      color: #fff;
    }

    /* header bar inside preview */
    .fh-preview-header {
      background: #fff;
      padding: 0 16px;
      height: 44px;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid #f0f0f0;
      flex-shrink: 0;
    }

    /* content area */
    .fh-preview-content {
      flex: 1; overflow: hidden;
      display: flex; flex-direction: column;
      background: ${CONTENT_BG};
    }
    .fh-preview-scroll {
      flex: 1; overflow-y: auto; overflow-x: hidden;
      padding: 10px 12px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .fh-preview-scroll::-webkit-scrollbar { width: 3px; }
    .fh-preview-scroll::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

    /* cards inside preview */
    .fh-preview-card {
      background: #fff;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      padding: 11px 13px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      flex-shrink: 0;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .fh-preview-card:hover {
      border-color: #d0d8ff;
      box-shadow: 0 2px 10px rgba(22,119,255,0.1);
    }

    /* view transition */
    .fh-preview-view {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: previewFadeIn 0.35s ease;
    }
    @keyframes previewFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* skeleton shimmer */
    .fh-shimmer {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* typing indicator */
    @keyframes blink { 0%,100%{opacity:0.2} 50%{opacity:1} }
    .fh-typing span {
      display:inline-block; width:5px; height:5px; border-radius:50%;
      background:#aaa; margin:0 1px;
      animation: blink 1.2s infinite;
    }
    .fh-typing span:nth-child(2) { animation-delay:.2s; }
    .fh-typing span:nth-child(3) { animation-delay:.4s; }

    /* notification dot */
    .fh-notif-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #ff4d4f; position: absolute; top: 1px; right: 1px;
    }


    /* ── CTA ── */
    .fh-cta { background: #fff; border-top: 1px solid #f0f0f0; padding: 96px 40px; text-align: center; }
    .fh-cta-inner { max-width: 580px; margin: 0 auto; }

    /* ── FOOTER ── */
    .fh-footer {
      background: ${NAVY};
      padding: 24px 40px;
      display: flex; align-items: center;
      justify-content: space-between; flex-wrap: wrap; gap: 12px;
    }

    /* ── SCROLL REVEAL ── */
    .rv { opacity: 0; transform: translateY(20px); transition: opacity 0.55s ease, transform 0.55s ease; }
    .rv.in { opacity: 1; transform: none; }
    .rv.d1 { transition-delay: 0.08s; }
    .rv.d2 { transition-delay: 0.16s; }
    .rv.d3 { transition-delay: 0.24s; }
    .rv.d4 { transition-delay: 0.32s; }

    @media (max-width: 768px) {
      .fh-nav { padding: 0 20px; height: 64px; }
      .fh-hero { padding: 100px 20px 60px; }
      .fh-section { padding: 60px 20px; }
      .fh-dark { padding: 60px 20px; }
      .fh-stats { padding: 48px 20px; }
      .fh-cta { padding: 72px 20px; }
      .fh-footer { padding: 20px; }
      .fh-trust-item { border-right: none; padding: 14px 20px; }
      .fh-trust { padding: 0 20px; }
    }
  `;
  document.head.appendChild(s);
};

/* ─── DUMMY DATA ─── */

const CANDIDATES = [
  {
    id: 1,
    name: "Ravi Mehta",
    initials: "RM",
    bg: "#0958D9",
    cloud: "Sales Cloud",
    exp: "8 yrs",
    certs: 6,
    avail: "Available",
    loc: "Bangalore",
    rate: "$85/hr",
  },
  {
    id: 2,
    name: "Priya Kapoor",
    initials: "PK",
    bg: "#389E0D",
    cloud: "Marketing Cloud",
    exp: "5 yrs",
    certs: 4,
    avail: "2 weeks",
    loc: "Mumbai",
    rate: "$70/hr",
  },
  {
    id: 3,
    name: "Arjun Shah",
    initials: "AS",
    bg: "#D46B08",
    cloud: "MuleSoft",
    exp: "6 yrs",
    certs: 5,
    avail: "Available",
    loc: "Pune",
    rate: "$90/hr",
  },
  {
    id: 4,
    name: "Sneha Rao",
    initials: "SR",
    bg: "#531DAB",
    cloud: "Experience Cloud",
    exp: "4 yrs",
    certs: 3,
    avail: "1 month",
    loc: "Hyderabad",
    rate: "$65/hr",
  },
  {
    id: 5,
    name: "Vikram Nair",
    initials: "VN",
    bg: "#C41D7F",
    cloud: "Service Cloud",
    exp: "7 yrs",
    certs: 7,
    avail: "Available",
    loc: "Chennai",
    rate: "$80/hr",
  },
];

const BENCH = [
  {
    id: 1,
    name: "Kiran Joshi",
    initials: "KJ",
    bg: "#1677FF",
    cloud: "CPQ & Billing",
    exp: "5 yrs",
    certs: 4,
    since: "3 days",
    status: "Active",
  },
  {
    id: 2,
    name: "Meera Pillai",
    initials: "MP",
    bg: "#52C41A",
    cloud: "Field Service",
    exp: "6 yrs",
    certs: 5,
    since: "1 week",
    status: "Active",
  },
  {
    id: 3,
    name: "Rohan Das",
    initials: "RD",
    bg: "#FA8C16",
    cloud: "Tableau CRM",
    exp: "4 yrs",
    certs: 3,
    since: "2 weeks",
    status: "Pending",
  },
  {
    id: 4,
    name: "Anita Kumar",
    initials: "AK",
    bg: "#722ED1",
    cloud: "Health Cloud",
    exp: "7 yrs",
    certs: 6,
    since: "5 days",
    status: "Active",
  },
];

const MY_JOBS = [
  {
    id: 1,
    title: "SF Architect",
    applicants: 12,
    cloud: "Sales Cloud",
    status: "Active",
    posted: "3 days ago",
  },
  {
    id: 2,
    title: "Marketing Cloud Dev",
    applicants: 7,
    cloud: "Mktg Cloud",
    status: "Active",
    posted: "1 week ago",
  },
  {
    id: 3,
    title: "CPQ Consultant",
    applicants: 4,
    cloud: "CPQ & Billing",
    status: "Closed",
    posted: "2 weeks ago",
  },
  {
    id: 4,
    title: "LWC Developer",
    applicants: 9,
    cloud: "Platform",
    status: "Active",
    posted: "5 days ago",
  },
];

const FIND_JOBS = [
  {
    id: 1,
    title: "Salesforce Architect",
    company: "TechCorp India",
    cloud: "Sales Cloud",
    type: "Remote",
    budget: "$100/hr",
    posted: "2h ago",
    hot: true,
  },
  {
    id: 2,
    title: "Marketing Cloud Dev",
    company: "Acme Solutions",
    cloud: "Marketing Cloud",
    type: "Hybrid",
    budget: "$75/hr",
    posted: "5h ago",
    hot: false,
  },
  {
    id: 3,
    title: "MuleSoft Integrator",
    company: "CloudBase Ltd",
    cloud: "MuleSoft",
    type: "Remote",
    budget: "$90/hr",
    posted: "1d ago",
    hot: true,
  },
  {
    id: 4,
    title: "CPQ Consultant",
    company: "Nexus Partners",
    cloud: "CPQ & Billing",
    type: "Onsite",
    budget: "$80/hr",
    posted: "2d ago",
    hot: false,
  },
];

const CHAT_MSGS = [
  {
    id: 1,
    name: "TechCorp India",
    initials: "TC",
    bg: "#0958D9",
    msg: "Is Ravi available next week?",
    time: "10:32 AM",
    unread: 2,
  },
  {
    id: 2,
    name: "Acme Solutions",
    initials: "AC",
    bg: "#389E0D",
    msg: "Can you share Priya's CV?",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: 3,
    name: "CloudBase Ltd",
    initials: "CB",
    bg: "#D46B08",
    msg: "Thanks for the profile 👍",
    time: "Mon",
    unread: 0,
  },
  {
    id: 4,
    name: "Nexus Partners",
    initials: "NP",
    bg: "#722ED1",
    msg: "We'd like to interview him",
    time: "Sun",
    unread: 1,
  },
];

const ACTIVE_CHAT = {
  with: "TechCorp India",
  initials: "TC",
  bg: "#0958D9",
  messages: [
    {
      from: "them",
      text: "Hi! We're looking for a Salesforce Architect.",
      time: "10:20 AM",
    },
    {
      from: "me",
      text: "Sure! We have Ravi Mehta available — 8 yrs exp, 6 certs.",
      time: "10:25 AM",
    },
    {
      from: "them",
      text: "Great. Is Ravi available to start next week?",
      time: "10:30 AM",
    },
    {
      from: "me",
      text: "Yes, he's available immediately 🎉",
      time: "10:31 AM",
    },
    {
      from: "them",
      text: "Perfect! Can we schedule a call tomorrow?",
      time: "10:32 AM",
    },
  ],
};

const AVAIL_COLOR = (v) =>
  v === "Available" || v === "Active"
    ? { color: "#52C41A", bg: "#F6FFED", border: "#B7EB8F" }
    : { color: PRIMARY, bg: PRIMARY_LIGHT, border: "#91CAFF" };

/* ── micro Pill ── */
const Pill = ({ label, color, bg, border }) => (
  <div
    style={{
      fontSize: 9,
      fontWeight: 700,
      color,
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 100,
      padding: "2px 8px",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </div>
);

/* ── MiniSearch bar ── */
const MiniSearch = ({ placeholder }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: "#f5f6fa",
      border: "1px solid #e8e8e8",
      borderRadius: 6,
      padding: "5px 10px",
      margin: "8px 12px 4px",
    }}
  >
    <SearchOutlined style={{ fontSize: 11, color: "#aaa" }} />
    <Text style={{ fontSize: 10, color: "#bbb" }}>{placeholder}</Text>
  </div>
);

/* ── Result count + filter chips ── */
const CountBar = ({
  count,
  label,
  filters = ["All", "Available", "Remote"],
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "4px 12px 6px",
    }}
  >
    <Text type="secondary" style={{ fontSize: 10 }}>
      {count} {label}
    </Text>
    <div style={{ display: "flex", gap: 4 }}>
      {filters.map((f, i) => (
        <span
          key={f}
          style={{
            fontSize: 9,
            padding: "1px 7px",
            borderRadius: 100,
            background: i === 0 ? PRIMARY_LIGHT : "#f5f5f5",
            color: i === 0 ? PRIMARY : "#888",
            border: `1px solid ${i === 0 ? "#91CAFF" : "#e8e8e8"}`,
            fontWeight: 600,
          }}
        >
          {f}
        </span>
      ))}
    </div>
  </div>
);

/* ── Skeleton loader ── */
const Skeletons = () => (
  <>
    {[1, 2, 3].map((k) => (
      <div
        key={k}
        className="fh-preview-card"
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            className="fh-shimmer"
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            <div className="fh-shimmer" style={{ height: 10, width: "60%" }} />
            <div className="fh-shimmer" style={{ height: 8, width: "80%" }} />
          </div>
          <div
            className="fh-shimmer"
            style={{ height: 16, width: 55, borderRadius: 100 }}
          />
        </div>
        <div className="fh-shimmer" style={{ height: 8, width: "45%" }} />
      </div>
    ))}
  </>
);

/* ════════════════════════════════════
   VIEW RENDERERS
════════════════════════════════════ */

/* MY JOBS */
const MyJobsView = () => (
  <>
    <MiniSearch placeholder="Search your posted jobs…" />
    <CountBar
      count={MY_JOBS.length}
      label="jobs posted"
      filters={["All", "Active", "Closed"]}
    />
    <div className="fh-preview-scroll">
      <div className="fh-preview-view">
        {MY_JOBS.map((j) => {
          const isActive = j.status === "Active";
          return (
            <div key={j.id} className="fh-preview-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 6,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    strong
                    style={{ fontSize: 12, display: "block", lineHeight: 1.3 }}
                  >
                    {j.title}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    {j.cloud} · {j.posted}
                  </Text>
                </div>
                <Pill
                  label={j.status}
                  color={isActive ? "#52C41A" : "#999"}
                  bg={isActive ? "#F6FFED" : "#f5f5f5"}
                  border={isActive ? "#B7EB8F" : "#ddd"}
                />
              </div>
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <TeamOutlined style={{ fontSize: 9, color: "#aaa" }} />
                <Text style={{ fontSize: 9, color: "#aaa" }}>
                  {j.applicants} applicants
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </>
);

/* FIND JOBS */
const FindJobsView = () => (
  <>
    <MiniSearch placeholder="Search jobs, companies…" />
    <CountBar
      count={FIND_JOBS.length}
      label="jobs found"
      filters={["All", "Remote", "Hybrid"]}
    />
    <div className="fh-preview-scroll">
      <div className="fh-preview-view">
        {FIND_JOBS.map((j) => (
          <div key={j.id} className="fh-preview-card">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginBottom: 2,
                  }}
                >
                  <Text strong style={{ fontSize: 12, lineHeight: 1.3 }}>
                    {j.title}
                  </Text>
                  {j.hot && (
                    <span
                      style={{
                        fontSize: 8,
                        fontWeight: 700,
                        color: "#FF4D4F",
                        background: "#FFF1F0",
                        border: "1px solid #FFCCC7",
                        borderRadius: 100,
                        padding: "1px 5px",
                      }}
                    >
                      HOT
                    </span>
                  )}
                </div>
                <Text type="secondary" style={{ fontSize: 10 }}>
                  {j.company}
                </Text>
              </div>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#52C41A",
                  whiteSpace: "nowrap",
                }}
              >
                {j.budget}
              </Text>
            </div>
            <div
              style={{
                marginTop: 6,
                display: "flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: "#f5f5f5",
                  border: "1px solid #e8e8e8",
                  color: "#555",
                }}
              >
                {j.cloud}
              </span>
              <span
                style={{
                  fontSize: 9,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: j.type === "Remote" ? PRIMARY_LIGHT : "#f5f5f5",
                  border: `1px solid ${j.type === "Remote" ? "#91CAFF" : "#e8e8e8"}`,
                  color: j.type === "Remote" ? PRIMARY : "#555",
                }}
              >
                {j.type}
              </span>
              <Text style={{ fontSize: 9, color: "#aaa", marginLeft: "auto" }}>
                <ClockCircleOutlined style={{ marginRight: 3 }} />
                {j.posted}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);

/* MY BENCH */
const MyBenchView = () => (
  <>
    <MiniSearch placeholder="Search your bench resources…" />
    <CountBar
      count={BENCH.length}
      label="resources"
      filters={["All", "Active", "Pending"]}
    />
    <div className="fh-preview-scroll">
      <div className="fh-preview-view">
        {BENCH.map((c) => {
          const p = AVAIL_COLOR(c.status);
          return (
            <div key={c.id} className="fh-preview-card">
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Avatar
                  size={30}
                  style={{ background: c.bg, fontSize: 11, flexShrink: 0 }}
                >
                  {c.initials}
                </Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text strong style={{ fontSize: 12 }}>
                      {c.name}
                    </Text>
                    <Pill label={c.status} {...p} />
                  </div>
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    {c.cloud} · {c.exp} · {c.certs} Certs
                  </Text>
                </div>
              </div>
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <ClockCircleOutlined style={{ fontSize: 9, color: "#aaa" }} />
                <Text style={{ fontSize: 9, color: "#aaa" }}>
                  On bench for {c.since}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </>
);

/* FIND CANDIDATES */
const FindCandidatesView = () => (
  <>
    <MiniSearch placeholder="Search by cloud, certification…" />
    <CountBar
      count={CANDIDATES.length}
      label="consultants"
      filters={["All", "Available", "Remote"]}
    />
    <div className="fh-preview-scroll">
      <div className="fh-preview-view">
        {CANDIDATES.map((c) => {
          const p = AVAIL_COLOR(c.avail);
          return (
            <div key={c.id} className="fh-preview-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 6,
                }}
              >
                <Avatar
                  size={30}
                  style={{ background: c.bg, fontSize: 11, flexShrink: 0 }}
                >
                  {c.initials}
                </Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text strong style={{ fontSize: 12, lineHeight: 1.3 }}>
                      {c.name}
                    </Text>
                    <Pill label={c.avail} {...p} />
                  </div>
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    {c.cloud} · {c.exp}
                  </Text>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <SafetyCertificateOutlined
                    style={{ fontSize: 9, color: "#FAAD14" }}
                  />
                  <Text style={{ fontSize: 9, color: "#888" }}>
                    {c.certs} Certs
                  </Text>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <EnvironmentOutlined style={{ fontSize: 9, color: "#888" }} />
                  <Text style={{ fontSize: 9, color: "#888" }}>{c.loc}</Text>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <DollarOutlined style={{ fontSize: 9, color: "#888" }} />
                  <Text style={{ fontSize: 9, color: "#888" }}>{c.rate}</Text>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </>
);

/* CHAT */
const ChatView = () => {
  const [openChat, setOpenChat] = useState(false);
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* conversation list */}
      <div
        style={{
          width: openChat ? 110 : "100%",
          borderRight: "1px solid #f0f0f0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          flexShrink: 0,
          transition: "width 0.25s ease",
        }}
      >
        <div style={{ padding: "8px 10px 4px" }}>
          <div
            style={{
              background: "#f5f6fa",
              border: "1px solid #e8e8e8",
              borderRadius: 6,
              padding: "4px 8px",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <SearchOutlined style={{ fontSize: 9, color: "#aaa" }} />
            {!openChat && (
              <Text style={{ fontSize: 9, color: "#bbb" }}>
                Search conversations…
              </Text>
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {CHAT_MSGS.map((c) => (
            <div
              key={c.id}
              onClick={() => setOpenChat(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                cursor: "pointer",
                borderBottom: "1px solid #f8f8f8",
                background: openChat && c.id === 1 ? "#EEF5FF" : "transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!(openChat && c.id === 1))
                  e.currentTarget.style.background = "#fafafa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  openChat && c.id === 1 ? "#EEF5FF" : "transparent";
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Avatar size={26} style={{ background: c.bg, fontSize: 9 }}>
                  {c.initials}
                </Avatar>
                {c.unread > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 13,
                      height: 13,
                      borderRadius: "50%",
                      background: PRIMARY,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{ fontSize: 7, color: "#fff", fontWeight: 700 }}
                    >
                      {c.unread}
                    </Text>
                  </div>
                )}
              </div>
              {!openChat && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text strong style={{ fontSize: 10, lineHeight: 1.3 }}>
                      {c.name}
                    </Text>
                    <Text style={{ fontSize: 8, color: "#aaa" }}>{c.time}</Text>
                  </div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 9,
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.msg}
                  </Text>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* message thread */}
      {openChat && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "previewFadeIn 0.25s ease",
          }}
        >
          {/* chat header */}
          <div
            style={{
              padding: "8px 10px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 9,
                color: PRIMARY,
                cursor: "pointer",
                fontWeight: 600,
              }}
              onClick={() => setOpenChat(false)}
            >
              ← Back
            </span>
            <Avatar
              size={20}
              style={{ background: ACTIVE_CHAT.bg, fontSize: 8 }}
            >
              {ACTIVE_CHAT.initials}
            </Avatar>
            <Text strong style={{ fontSize: 10 }}>
              {ACTIVE_CHAT.with}
            </Text>
          </div>

          {/* messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 10px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {ACTIVE_CHAT.messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.from === "me" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "5px 9px",
                    borderRadius:
                      m.from === "me"
                        ? "10px 10px 2px 10px"
                        : "10px 10px 10px 2px",
                    background: m.from === "me" ? PRIMARY : "#f0f0f0",
                    fontSize: 9,
                    color: m.from === "me" ? "#fff" : "#333",
                    lineHeight: 1.5,
                  }}
                >
                  {m.text}
                  <div
                    style={{
                      fontSize: 7,
                      color: m.from === "me" ? "rgba(255,255,255,0.6)" : "#aaa",
                      marginTop: 2,
                      textAlign: "right",
                    }}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* input */}
          <div
            style={{
              padding: "6px 10px",
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                flex: 1,
                background: "#f5f6fa",
                border: "1px solid #e8e8e8",
                borderRadius: 100,
                padding: "4px 10px",
              }}
            >
              <Text style={{ fontSize: 9, color: "#ccc" }}>
                Type a message…
              </Text>
            </div>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: PRIMARY,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ArrowRightOutlined style={{ fontSize: 9, color: "#fff" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════
   MAIN DYNAMIC APP PREVIEW
════════════════════════════════════ */
const MENU_ITEMS = [
  {
    key: "myjobs",
    icon: <FileTextOutlined />,
    label: "My Jobs",
    title: "My Jobs",
  },
  {
    key: "findjobs",
    icon: <SearchOutlined />,
    label: "Find Jobs",
    title: "Find Jobs",
  },
  {
    key: "mybench",
    icon: <SaveFilled />,
    label: "My Bench",
    title: "My Bench",
  },
  {
    key: "findcand",
    icon: <TeamOutlined />,
    label: "Find Candidate",
    title: "Find Candidate",
  },
  {
    key: "chat",
    icon: <MessageOutlined />,
    label: "Chat",
    title: "Chat",
    badge: 3,
  },
];

const DynamicAppPreview = () => {
  const [activeKey, setActiveKey] = useState("findcand");
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef(null);

  const handleMenuClick = (key) => {
    if (key === activeKey) return;
    setIsLoading(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setActiveKey(key);
      setIsLoading(false);
    }, 350);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const activeItem = MENU_ITEMS.find((m) => m.key === activeKey);

  const renderContent = () => {
    if (isLoading)
      return (
        <div
          style={{
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Skeletons />
        </div>
      );
    switch (activeKey) {
      case "myjobs":
        return <MyJobsView />;
      case "findjobs":
        return <FindJobsView />;
      case "mybench":
        return <MyBenchView />;
      case "findcand":
        return <FindCandidatesView />;
      case "chat":
        return <ChatView />;
      default:
        return null;
    }
  };

  return (
    <div className="fh-preview-window">
      {/* macOS title bar */}
      <div className="fh-preview-titlebar">
        <div className="fh-preview-dot fh-preview-dot-r" />
        <div className="fh-preview-dot fh-preview-dot-y" />
        <div className="fh-preview-dot fh-preview-dot-g" />
        <div className="fh-preview-titlebar-label">
          forcehead.com — {activeItem?.title}
        </div>
      </div>

      <div className="fh-preview-body">
        {/* ── Sidebar ── */}
        <div className="fh-preview-sidebar">
          <div className="fh-preview-user">
            <Avatar
              size={26}
              style={{ background: PRIMARY, fontSize: 10, flexShrink: 0 }}
            >
              FH
            </Avatar>
            <div style={{ minWidth: 0 }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 600,
                  display: "block",
                  lineHeight: 1.2,
                }}
              >
                Partner Co.
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>
                Company
              </Text>
            </div>
          </div>

          {MENU_ITEMS.map((item) => (
            <div
              key={item.key}
              className={`fh-preview-menu-item${item.key === activeKey ? " active" : ""}`}
              onClick={() => handleMenuClick(item.key)}
              style={{ cursor: "pointer", position: "relative" }}
            >
              <span style={{ fontSize: 11 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && item.key !== activeKey && (
                <span
                  style={{
                    minWidth: 14,
                    height: 14,
                    borderRadius: 100,
                    background: "#ff4d4f",
                    color: "#fff",
                    fontSize: 8,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ── Content Panel ── */}
        <div className="fh-preview-content">
          {/* inner header */}
          <div className="fh-preview-header">
            <Text strong style={{ fontSize: 12, color: "#222" }}>
              {activeItem?.title}
            </Text>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative" }}>
                <MessageOutlined style={{ fontSize: 13, color: "#888" }} />
                <div className="fh-notif-dot" />
              </div>
              <Avatar size={22} style={{ background: NAVY, fontSize: 9 }}>
                PC
              </Avatar>
            </div>
          </div>

          {/* view content */}
          <div
            key={activeKey}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "previewFadeIn 0.3s ease",
            }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

const Counter = ({ end, suffix = "" }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        let cur = 0;
        const step = Math.max(1, Math.ceil(end / 55));
        const t = setInterval(() => {
          cur = Math.min(cur + step, end);
          setVal(cur);
          if (cur >= end) clearInterval(t);
        }, 18);
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
};

/* ─── MAIN ─── */
const HomePage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    injectStyles();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "company")
      navigate("/company/dashboard", { replace: true });
    if (token && role === "candidate")
      navigate("/candidate/dashboard", { replace: true });

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    // Scroll reveal
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        }),
      { threshold: 0.1 },
    );
    document.querySelectorAll(".rv").forEach((el) => obs.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      obs.disconnect();
    };
  }, [navigate]);

  const steps = [
    {
      num: "01",
      icon: <SolutionOutlined />,
      bg: PRIMARY_LIGHT,
      color: PRIMARY,
      title: "Register & Verify",
      body: "Sign up as a Salesforce implementation partner, consulting firm, or MSP. Verify your partner status and complete your profile.",
    },
    {
      num: "02",
      icon: <TeamOutlined />,
      bg: "#F6FFED",
      color: "#52C41A",
      title: "List or Search Talent",
      body: "Post bench consultants with cloud expertise and certifications — or search and filter to find exactly who you need.",
    },
    {
      num: "03",
      icon: <SafetyCertificateOutlined />,
      bg: "#FFFBE6",
      color: "#FAAD14",
      title: "Connect Directly",
      body: "Reach out to verified Salesforce partners directly. No middlemen — full transparency in every collaboration.",
    },
    {
      num: "04",
      icon: <ThunderboltOutlined />,
      bg: "#FFF1F0",
      color: "#FF4D4F",
      title: "Place & Monetize",
      body: "Deploy consultants quickly, convert idle bench time into revenue, and build trusted long-term partner relationships.",
    },
  ];

  const skills = [
    "Sales Cloud",
    "Service Cloud",
    "Marketing Cloud",
    "Commerce Cloud",
    "CPQ & Billing",
    "Pardot / MCAE",
    "Experience Cloud",
    "MuleSoft",
    "Tableau CRM",
    "Field Service",
    "Health Cloud",
    "Financial Services Cloud",
    "Apex Development",
    "Lightning Web Components",
    "Flow Builder",
    "Data Cloud",
  ];

  const vendorPerks = [
    "List unlimited bench resources",
    "Showcase certifications & cloud expertise",
    "Set availability and engagement type",
    "Receive inbound hiring requests",
    "Build long-term partner relationships",
  ];

  const hiringPerks = [
    "Search by Salesforce Cloud & skills",
    "Filter by certification and experience",
    "View real-time consultant availability",
    "Direct partner-to-partner contact",
    "Hire in days, not weeks",
  ];

  return (
    <>
      <Helmet>
        <title>
          ForceHead – Salesforce Vendor Marketplace for Bench Resources
        </title>
        <meta
          name="description"
          content="ForceHead is a Salesforce-focused B2B vendor marketplace where partners list bench resources, hire certified Salesforce consultants, and monetize unused talent."
        />
        <meta
          name="keywords"
          content="Salesforce vendor marketplace, Salesforce bench resources, Salesforce partner hiring, Salesforce B2B hiring platform"
        />
        <link rel="canonical" href="https://www.forcehead.com/" />
        <meta
          property="og:title"
          content="ForceHead – The Salesforce Vendor Marketplace"
        />
        <meta
          property="og:description"
          content="A B2B marketplace for Salesforce vendors to list bench consultants and hire trusted Salesforce talent."
        />
        <meta property="og:url" content="https://www.forcehead.com/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ForceHead",
            url: "https://www.forcehead.com",
            description:
              "Salesforce-focused vendor marketplace to list and hire bench resources.",
          })}
        </script>
      </Helmet>

      <div className="fh-root">
        {/* ── NAV (matches your Header style exactly) ── */}
        <nav className={`fh-nav${scrolled ? " scrolled" : ""}`}>
          <div className="fh-logo" onClick={() => navigate("/")}>
            <div className="fh-logo-icon">
              <ApartmentOutlined />
            </div>
            <div>
              <div className="fh-logo-text">ForceHead</div>
              <div className="fh-logo-sub">Salesforce Vendor Marketplace</div>
            </div>
          </div>

          <Space size={8}>
            <Button
              type="text"
              onClick={() => navigate("/login")}
              style={{ fontWeight: 500, color: "#595959" }}
            >
              Login
            </Button>
            <Button
              type="primary"
              icon={<RocketOutlined />}
              onClick={() => navigate("/login")}
            >
              Join Free
            </Button>
          </Space>
        </nav>

        {/* ── HERO ── */}
        <section className="fh-hero">
          <div className="fh-hero-blob fh-hero-blob-1" />
          <div className="fh-hero-blob fh-hero-blob-2" />

          <div className="fh-hero-inner">
            <Row gutter={[64, 48]} align="middle">
              {/* LEFT: Copy */}
              <Col xs={24} lg={12}>
                <div className="fh-pill" style={{ marginBottom: 20 }}>
                  <FireOutlined />
                  Exclusive Salesforce Partner Network
                </div>

                <Title
                  level={1}
                  style={{
                    fontSize: "clamp(36px, 4.5vw, 58px)",
                    fontWeight: 700,
                    lineHeight: 1.18,
                    letterSpacing: "-0.5px",
                    marginBottom: 20,
                    color: "#0a0a0a",
                  }}
                >
                  The Salesforce{" "}
                  <span style={{ color: PRIMARY }}>Vendor Marketplace</span>
                </Title>

                <Paragraph
                  style={{
                    fontSize: 16,
                    color: "#595959",
                    lineHeight: 1.8,
                    marginBottom: 36,
                    maxWidth: 480,
                  }}
                >
                  A B2B platform built exclusively for Salesforce partners —
                  list bench resources, hire certified consultants, and build a
                  trusted network that drives real revenue.
                </Paragraph>

                <Space size={10} wrap>
                  <Button
                    type="primary"
                    size="large"
                    icon={<BankOutlined />}
                    onClick={() => navigate("/login")}
                    style={{
                      height: 46,
                      paddingInline: 24,
                      fontSize: 15,
                      fontWeight: 500,
                    }}
                  >
                    List Bench Resources
                  </Button>
                  <Button
                    size="large"
                    icon={<SearchOutlined />}
                    onClick={() => navigate("/login")}
                    style={{
                      height: 46,
                      paddingInline: 24,
                      fontSize: 15,
                      fontWeight: 500,
                      borderColor: PRIMARY,
                      color: PRIMARY,
                    }}
                  >
                    Hire Talent
                  </Button>
                </Space>

                <div
                  style={{
                    marginTop: 28,
                    display: "flex",
                    gap: 20,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { val: "500+", label: "Partners" },
                    { val: "8K+", label: "Consultants" },
                    { val: "95%", label: "Success Rate" },
                  ].map((s) => (
                    <div key={s.label}>
                      <Text strong style={{ fontSize: 20, color: PRIMARY }}>
                        {s.val}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: "#888", marginLeft: 4 }}
                      >
                        {s.label}
                      </Text>
                    </div>
                  ))}
                </div>
              </Col>

              {/* RIGHT: Dynamic App Preview */}
              <Col xs={0} lg={12}>
                <DynamicAppPreview />
              </Col>
            </Row>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <div className="fh-trust">
          {[
            { num: "500+", label: "Verified SF Partners" },
            { num: "8,000+", label: "Certified Consultants" },
            { num: "2,400+", label: "Successful Placements" },
            { num: "16+", label: "Salesforce Clouds" },
          ].map((t) => (
            <div key={t.label} className="fh-trust-item">
              <Text
                strong
                style={{
                  fontSize: 22,
                  color: PRIMARY,
                  display: "block",
                  lineHeight: 1.2,
                }}
              >
                {t.num}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t.label}
              </Text>
            </div>
          ))}
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ background: CONTENT_BG }}>
          <div className="fh-section">
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <span className="fh-section-label rv">How It Works</span>
              <Title
                level={2}
                className="rv d1"
                style={{
                  fontSize: "clamp(26px, 3.5vw, 42px)",
                  fontWeight: 700,
                  marginBottom: 12,
                  letterSpacing: "-0.3px",
                }}
              >
                Two paths, one platform
              </Title>
              <Paragraph
                className="rv d2"
                style={{
                  fontSize: 15,
                  color: "#595959",
                  maxWidth: 460,
                  margin: "0 auto",
                  lineHeight: 1.8,
                }}
              >
                Whether you have consultants on the bench or need certified
                Salesforce talent fast — ForceHead connects both sides with
                speed and trust.
              </Paragraph>
            </div>

            <Row gutter={[20, 20]}>
              {steps.map((step, i) => (
                <Col key={step.num} xs={24} sm={12} lg={6}>
                  <div className={`rv d${i + 1}`} style={{ height: "100%" }}>
                    <Card
                      className="fh-step-card"
                      styles={{
                        body: {
                          padding: 24,
                          height: "100%",
                          boxSizing: "border-box",
                          position: "relative",
                        },
                      }}
                    >
                      <span className="fh-step-num">{step.num}</span>
                      <div
                        className="fh-icon-box"
                        style={{ background: step.bg, color: step.color }}
                      >
                        {step.icon}
                      </div>
                      <Title
                        level={5}
                        style={{
                          marginTop: 0,
                          marginBottom: 10,
                          fontSize: 15,
                          fontWeight: 600,
                        }}
                      >
                        {step.title}
                      </Title>
                      <Paragraph
                        style={{
                          color: "#595959",
                          fontSize: 13,
                          lineHeight: 1.75,
                          marginBottom: 0,
                        }}
                      >
                        {step.body}
                      </Paragraph>
                    </Card>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* ── STATS STRIP ── */}
        <div className="fh-stats">
          <div className="fh-stats-inner">
            <Row gutter={[32, 24]} justify="center">
              {[
                {
                  end: 500,
                  suffix: "+",
                  label: "Verified Salesforce Partners",
                },
                {
                  end: 8000,
                  suffix: "+",
                  label: "Certified Consultants Listed",
                },
                { end: 95, suffix: "%", label: "Placement Success Rate" },
                { end: 16, suffix: "+", label: "Salesforce Clouds Covered" },
              ].map((s) => (
                <Col
                  key={s.label}
                  xs={12}
                  sm={6}
                  style={{ textAlign: "center" }}
                >
                  <Title
                    level={2}
                    style={{
                      color: "#fff",
                      margin: "0 0 4px",
                      fontSize: "clamp(32px, 4vw, 52px)",
                      fontWeight: 700,
                      lineHeight: 1.1,
                    }}
                  >
                    <Counter end={s.end} suffix={s.suffix} />
                  </Title>
                  <Text
                    style={{ color: "rgba(255,255,255,0.72)", fontSize: 13 }}
                  >
                    {s.label}
                  </Text>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* ── DUAL PATH (dark, matching sidebar NAVY) ── */}
        <div className="fh-dark">
          <div className="fh-dark-inner">
            <div style={{ marginBottom: 44 }}>
              <span
                className="rv"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 10,
                }}
              >
                Choose Your Path
              </span>
              <Title
                level={2}
                className="rv d1"
                style={{
                  color: "#fff",
                  fontSize: "clamp(26px, 3.5vw, 42px)",
                  fontWeight: 700,
                  marginBottom: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                Built for both sides of the ecosystem
              </Title>
            </div>

            <Row gutter={[24, 24]}>
              {/* VENDOR */}
              <Col xs={24} md={12}>
                <div className="rv d1" style={{ height: "100%" }}>
                  <Card
                    className="fh-path-card blue-border"
                    styles={{
                      body: {
                        padding: 36,
                        height: "100%",
                        boxSizing: "border-box",
                      },
                    }}
                  >
                    <Space align="center" style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 10,
                          background: "rgba(22,119,255,0.18)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <BankOutlined
                          style={{ color: PRIMARY, fontSize: 18 }}
                        />
                      </div>
                      <Title
                        level={4}
                        style={{ color: "#fff", margin: 0, fontWeight: 700 }}
                      >
                        Vendor / Partner
                      </Title>
                    </Space>

                    <Paragraph
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 14,
                        lineHeight: 1.8,
                        marginBottom: 22,
                      }}
                    >
                      Have certified Salesforce consultants between projects?
                      Monetize your bench by listing them on ForceHead and
                      connecting with partners actively hiring.
                    </Paragraph>

                    <Divider
                      style={{
                        borderColor: "rgba(255,255,255,0.08)",
                        margin: "18px 0",
                      }}
                    />

                    <Space
                      direction="vertical"
                      size={10}
                      style={{ width: "100%", marginBottom: 28 }}
                    >
                      {vendorPerks.map((item) => (
                        <div key={item} className="fh-check-row">
                          <CheckCircleFilled
                            style={{
                              color: PRIMARY,
                              fontSize: 14,
                              marginTop: 2,
                              flexShrink: 0,
                            }}
                          />
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.78)",
                              fontSize: 13,
                              lineHeight: 1.6,
                            }}
                          >
                            {item}
                          </Text>
                        </div>
                      ))}
                    </Space>

                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate("/login")}
                      style={{ height: 46, fontWeight: 500 }}
                    >
                      Join as Vendor
                    </Button>
                  </Card>
                </div>
              </Col>

              {/* HIRING */}
              <Col xs={24} md={12}>
                <div className="rv d2" style={{ height: "100%" }}>
                  <Card
                    className="fh-path-card green-border"
                    styles={{
                      body: {
                        padding: 36,
                        height: "100%",
                        boxSizing: "border-box",
                      },
                    }}
                  >
                    <Space align="center" style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 10,
                          background: "rgba(82,196,26,0.18)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <SearchOutlined
                          style={{ color: "#52C41A", fontSize: 18 }}
                        />
                      </div>
                      <Title
                        level={4}
                        style={{ color: "#fff", margin: 0, fontWeight: 700 }}
                      >
                        Hiring Partner
                      </Title>
                    </Space>

                    <Paragraph
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 14,
                        lineHeight: 1.8,
                        marginBottom: 22,
                      }}
                    >
                      Need a certified Salesforce consultant fast? Search by
                      cloud, certification, experience, and availability — from
                      verified partners only, no agencies.
                    </Paragraph>

                    <Divider
                      style={{
                        borderColor: "rgba(255,255,255,0.08)",
                        margin: "18px 0",
                      }}
                    />

                    <Space
                      direction="vertical"
                      size={10}
                      style={{ width: "100%", marginBottom: 28 }}
                    >
                      {hiringPerks.map((item) => (
                        <div key={item} className="fh-check-row">
                          <CheckCircleFilled
                            style={{
                              color: "#52C41A",
                              fontSize: 14,
                              marginTop: 2,
                              flexShrink: 0,
                            }}
                          />
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.78)",
                              fontSize: 13,
                              lineHeight: 1.6,
                            }}
                          >
                            {item}
                          </Text>
                        </div>
                      ))}
                    </Space>

                    <Button
                      size="large"
                      block
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate("/login")}
                      style={{
                        height: 46,
                        fontWeight: 500,
                        background: "#52C41A",
                        borderColor: "#52C41A",
                        color: "#fff",
                      }}
                    >
                      Start Hiring
                    </Button>
                  </Card>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* ── SKILLS / CLOUDS ── */}
        <div style={{ background: "#fff" }}>
          <div className="fh-section">
            <Row gutter={[64, 40]} align="middle">
              <Col xs={24} md={10}>
                <span className="fh-section-label rv">Coverage</span>
                <Title
                  level={2}
                  className="rv d1"
                  style={{
                    fontSize: "clamp(26px, 3.5vw, 42px)",
                    fontWeight: 700,
                    marginBottom: 14,
                    letterSpacing: "-0.3px",
                  }}
                >
                  Every Salesforce Cloud. Covered.
                </Title>
                <Paragraph
                  className="rv d2"
                  style={{
                    fontSize: 15,
                    color: "#595959",
                    lineHeight: 1.8,
                    marginBottom: 28,
                  }}
                >
                  From classic Sales & Service Cloud to cutting-edge Data Cloud
                  and MuleSoft integrations — find expertise across the full
                  Salesforce portfolio.
                </Paragraph>
                <div className="rv d3">
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate("/login")}
                    style={{ height: 46, paddingInline: 24 }}
                  >
                    Browse All Experts <ArrowRightOutlined />
                  </Button>
                </div>
              </Col>

              <Col xs={24} md={14}>
                <div className="rv d2 fh-tag-wrap">
                  {skills.map((sk) => (
                    <Tag key={sk} className="fh-skill-tag">
                      {sk}
                    </Tag>
                  ))}
                </div>
              </Col>
            </Row>
          </div>
        </div>

        <Divider style={{ margin: 0 }} />

        <div style={{ background: "#f5f6fa" }}>
          <div className="fh-section">
            <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
              Learn More About ForceHead
            </Title>

            <Row gutter={[32, 32]}>
              <Col xs={24} md={12}>
                <Card hoverable>
                  <Title level={4}>Salesforce Vendor Marketplace</Title>
                  <Paragraph>
                    Discover how ForceHead enables structured vendor-to-vendor
                    hiring within the Salesforce ecosystem.
                  </Paragraph>
                  <Button
                    type="link"
                    onClick={() => navigate("/salesforce-vendor-marketplace")}
                  >
                    Explore Marketplace →
                  </Button>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card hoverable>
                  <Title level={4}>Salesforce Bench Resources</Title>
                  <Paragraph>
                    Learn how to monetize idle Salesforce consultants and
                    optimize bench utilization globally.
                  </Paragraph>
                  <Button
                    type="link"
                    onClick={() => navigate("/salesforce-bench-resources")}
                  >
                    Learn About Bench →
                  </Button>
                </Card>
              </Col>
            </Row>
          </div>
        </div>

        {/* ── FINAL CTA ── */}
        <div className="fh-cta">
          <div className="fh-cta-inner">
            <Tag
              color="blue"
              style={{
                marginBottom: 18,
                fontSize: 12,
                padding: "3px 12px",
                borderRadius: 100,
              }}
            >
              Free to Join
            </Tag>

            <Title
              level={2}
              className="rv"
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 700,
                marginBottom: 14,
                letterSpacing: "-0.3px",
              }}
            >
              Start collaborating today
            </Title>

            <Paragraph
              className="rv d1"
              style={{
                fontSize: 15,
                color: "#595959",
                lineHeight: 1.8,
                marginBottom: 36,
              }}
            >
              Join 500+ Salesforce partners already on the platform. No setup
              fees. No hidden costs. Just smarter bench monetization and faster
              hiring.
            </Paragraph>

            <Space
              size={10}
              wrap
              style={{ justifyContent: "center" }}
              className="rv d2"
            >
              <Button
                type="primary"
                size="large"
                icon={<BankOutlined />}
                onClick={() => navigate("/login")}
                style={{ height: 46, paddingInline: 24, fontWeight: 500 }}
              >
                List Bench Resources
              </Button>
              <Button
                size="large"
                icon={<UserOutlined />}
                onClick={() => navigate("/login")}
                style={{
                  height: 46,
                  paddingInline: 24,
                  fontWeight: 500,
                  borderColor: PRIMARY,
                  color: PRIMARY,
                }}
              >
                Hire Consultants
              </Button>
            </Space>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="fh-footer">
          <Space align="center">
            <div
              className="fh-logo-icon"
              style={{ width: 32, height: 32, borderRadius: 8, fontSize: 14 }}
            >
              <ApartmentOutlined />
            </div>
            <Text style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
              ForceHead
            </Text>
          </Space>

          <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
            © {new Date().getFullYear()} ForceHead. B2B Salesforce Vendor
            Marketplace.
          </Text>

          <Space size={20}>
            {[
              { label: "Privacy", path: "/terms-and-conditions" },
              { label: "Terms", path: "/terms-and-conditions" },
              { label: "Contact", path: "/contact" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.path}
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 12,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.target.style.color = "rgba(255,255,255,0.4)")
                }
              >
                {l.label}
              </a>
            ))}
          </Space>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
