import { useState } from "react";
import { Typography, Card } from "antd";
import { CreditCardOutlined, BarChartOutlined } from "@ant-design/icons";
import BillingSection from "../components/settings/BillingSection";
import UsageDashboard from "../components/settings/UsageDashboard";

const { Text } = Typography;

const SECTIONS = [
  // { key: "billing", label: "Billing & Plan", icon: <CreditCardOutlined /> },
  { key: "usage", label: "Usage", icon: <BarChartOutlined /> },
];

export default function CompanySettings() {
  const [activeSection, setActiveSection] = useState("usage");

  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        height: "calc(100vh - 112px)",
        overflow: "hidden",
        padding: "4px 2px",
      }}
    >
      {/* ── Left Nav ── */}
      <div
        style={{
          width: 220,
          flexShrink: 0,
          height: "100%",
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        <Card
          styles={{ body: { padding: "16px 8px" } }}
          style={{
            borderRadius: 14,
            border: "1px solid #e8eaf0",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            height: "100%",
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              padding: "4px 14px",
              display: "block",
              marginBottom: 8,
              color: "#9ca3af",
            }}
          >
            Settings
          </Text>

          {SECTIONS.map((s) => {
            const isActive = activeSection === s.key;
            return (
              <div
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.color = "#374151";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#4b5563";
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 9,
                  cursor: "pointer",
                  background: isActive
                    ? "linear-gradient(135deg, #eff6ff 0%, #e8f0fe 100%)"
                    : "transparent",
                  color: isActive ? "#1d4ed8" : "#4b5563",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13.5,
                  transition: "all 0.18s ease",
                  marginBottom: 2,
                  borderLeft: isActive
                    ? "3px solid #3b82f6"
                    : "3px solid transparent",
                  boxShadow: isActive
                    ? "0 1px 4px rgba(59,130,246,0.12)"
                    : "none",
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    color: isActive ? "#3b82f6" : "#9ca3af",
                    transition: "color 0.18s",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {s.icon}
                </span>
                {s.label}
              </div>
            );
          })}
        </Card>
      </div>

      {/* ── Content ── */}
      <div
        style={{
          flex: 1,
          height: "100%",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#e2e8f0 transparent",
          borderRadius: 14,
        }}
      >
        {activeSection === "billing" && (
          <Card
            style={{
              borderRadius: 14,
              minHeight: "100%",
              border: "1px solid #e8eaf0",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
            styles={{ body: { padding: "28px 32px" } }}
          >
            <BillingSection />
          </Card>
        )}

        {activeSection === "usage" && (
          <div
            style={{
              borderRadius: 14,
              minHeight: "100%",
              border: "1px solid #e8eaf0",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              background: "#fff",
              overflow: "hidden",
            }}
          >
            <UsageDashboard />
          </div>
        )}
      </div>
    </div>
  );
}
