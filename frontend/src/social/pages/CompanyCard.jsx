import { useState } from "react";
import { Avatar, Button, Tag, Typography, Tooltip } from "antd";
import { PlusOutlined, CheckOutlined, EnvironmentOutlined, TeamOutlined } from "@ant-design/icons";
import { followCompany, unfollowCompany } from "../api/api";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const TIER_COLORS = {
  Crest:  { bg: "#fff7e6", color: "#d46b08", border: "#ffd591" },
  Summit: { bg: "#f0f5ff", color: "#1d39c4", border: "#adc6ff" },
  Ridge:  { bg: "#f6ffed", color: "#389e0d", border: "#b7eb8f" },
};

export default function CompanyCard({ company: initialCompany, onFollowChange }) {
  const [company, setCompany] = useState(initialCompany);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!company) return null;

  const tierStyle = company?.partnerTier ? TIER_COLORS[company.partnerTier] ?? null : null;

  const handleFollowToggle = async () => {
    if (loading) return;
    setLoading(true);
    const wasFollowing = company.isFollowedByMe;
    setCompany((c) => ({
      ...c,
      isFollowedByMe: !wasFollowing,
      followersCount: wasFollowing ? c.followersCount - 1 : c.followersCount + 1,
    }));
    try {
      wasFollowing ? await unfollowCompany(company.id) : await followCompany(company.id);
      onFollowChange?.();
    } catch {
      setCompany((c) => ({
        ...c,
        isFollowedByMe: wasFollowing,
        followersCount: wasFollowing ? c.followersCount + 1 : c.followersCount - 1,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e0e0e0",
      borderRadius: 12,
      overflow: "hidden",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      transition: "box-shadow 0.2s",
      cursor: "default",
    }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Cover */}
      <div style={{
        height: 64,
        background: company.coverImage
          ? `url(${company.coverImage}) center/cover no-repeat`
          : "linear-gradient(135deg, #1d39c4 0%, #0a66c2 100%)",
        flexShrink: 0,
      }} />

      {/* Body */}
      <div style={{
        padding: "0 16px 16px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}>

        {/* Logo */}
        <div style={{ marginTop: -26, marginBottom: 10 }}>
          <Avatar
            size={52}
            src={company.logoUrl}
            shape="square"
            style={{
              border: "2px solid #fff",
              borderRadius: 8,
              background: "#0a66c2",
              fontWeight: 700,
              fontSize: 20,
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
          >
            {company.name?.charAt(0)}
          </Avatar>
        </div>

        {/* Name */}
        <Tooltip title="View company profile">
          <Text
            strong
            onClick={() => navigate(`/company/public/${company.slug}`)}
            style={{
              fontSize: 14,
              display: "block",
              lineHeight: 1.3,
              cursor: "pointer",
              color: "#111",
              marginBottom: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0a66c2")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#111")}
          >
            {company.name}
          </Text>
        </Tooltip>

        {/* Tagline */}
        {company.tagline && (
          <Text type="secondary" style={{
            fontSize: 11,
            display: "block",
            marginBottom: 6,
            lineHeight: 1.4,
            overflow: "hidden",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {company.tagline}
          </Text>
        )}

        {/* Location + size */}
        {/* {(company.headquarters || company.companySize) && (
          <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 6 }}>
            {company.headquarters && (
              <span><EnvironmentOutlined style={{ marginRight: 3 }} />{company.headquarters}</span>
            )}
            {company.headquarters && company.companySize && " · "}
            {company.companySize && (
              <span><TeamOutlined style={{ marginRight: 3 }} />{company.companySize}</span>
            )}
          </Text>
        )} */}

        {/* Partner tier badge */}
        {company.partnerTier && tierStyle && (
          <div style={{ marginBottom: 6 }}>
            <span style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 10,
              background: tierStyle.bg,
              color: tierStyle.color,
              border: `1px solid ${tierStyle.border}`,
              fontWeight: 500,
            }}>
              {company.partnerTier} Partner
              {company.partnerType ? ` · ${company.partnerType}` : ""}
            </span>
          </div>
        )}

        {/* Cloud tags */}
        {/* {company.clouds?.length > 0 && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 4,
            flexWrap: "wrap",
            marginBottom: 6,
          }}>
            {company.clouds.slice(0, 2).map((c) => (
              <Tag key={c} style={{
                fontSize: 10,
                padding: "1px 6px",
                borderRadius: 10,
                margin: 0,
                background: "#e8f0fe",
                color: "#0a66c2",
                border: "none",
              }}>
                {c}
              </Tag>
            ))}
            {company.clouds.length > 2 && (
              <Tag style={{
                fontSize: 10, padding: "1px 6px",
                borderRadius: 10, margin: 0,
                background: "#f5f5f5", color: "#888", border: "none",
              }}>
                +{company.clouds.length - 2}
              </Tag>
            )}
          </div>
        )} */}

        {/* Spacer to push followers + button to bottom */}
        <div style={{ flex: 1 }} />

        {/* Followers */}
        <Text style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 8, marginTop: 6 }}>
          {(company.followersCount ?? 0).toLocaleString()} follower{company.followersCount !== 1 ? "s" : ""}
        </Text>

        {/* Follow button */}
        <Button
          type={company.isFollowedByMe ? "default" : "primary"}
          shape="round"
          size="small"
          icon={company.isFollowedByMe ? <CheckOutlined /> : <PlusOutlined />}
          loading={loading}
          onClick={handleFollowToggle}
          style={{
            width: "100%",
            fontWeight: 500,
            fontSize: 13,
            ...(company.isFollowedByMe
              ? { borderColor: "#0a66c2", color: "#0a66c2" }
              : { background: "#0a66c2", borderColor: "#0a66c2" }),
          }}
        >
          {company.isFollowedByMe ? "Following" : "Follow"}
        </Button>
      </div>
    </div>
  );
}