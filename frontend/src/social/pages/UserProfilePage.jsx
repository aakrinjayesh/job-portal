import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Avatar, Button, Tag, Typography, Spin, Divider, Tooltip,
} from "antd";
import {
  UserAddOutlined, CheckOutlined, ArrowLeftOutlined,
  EnvironmentOutlined, TrophyOutlined, LinkOutlined,
  LinkedinOutlined, GlobalOutlined,
} from "@ant-design/icons";
import { getUserProfile } from "../api/api";
import { followUser, unfollowUser } from "../api/api";

const { Text, Title, Paragraph } = Typography;

function Section({ title, children }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      border: "1px solid #e0e0e0",
      padding: "20px 24px",
      marginBottom: 12,
    }}>
      <Title level={5} style={{ marginBottom: 16, marginTop: 0 }}>{title}</Title>
      {children}
    </div>
  );
}

function WorkExpItem({ item }) {
  // item could be { company, role, startDate, endDate, description }
  const title = item?.role || item?.title || item?.position || "Role";
  const company = item?.company || item?.companyName || "";
  const start = item?.startDate || item?.start || "";
  const end = item?.endDate || item?.end || "Present";
  const desc = item?.description || item?.summary || "";

  return (
    <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 6,
        background: "#e8f0fe", display: "flex",
        alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 18, color: "#0a66c2",
      }}>
        🏢
      </div>
      <div style={{ flex: 1 }}>
        <Text strong style={{ fontSize: 14, display: "block" }}>{title}</Text>
        <Text style={{ fontSize: 13, display: "block" }}>{company}</Text>
        {(start || end) && (
          <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
            {[start, end].filter(Boolean).join(" – ")}
          </Text>
        )}
        {desc && (
          <Paragraph
            style={{ fontSize: 13, marginTop: 6, marginBottom: 0, color: "#444" }}
            ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
          >
            {desc}
          </Paragraph>
        )}
      </div>
    </div>
  );
}

function EduItem({ item }) {
  const school = item?.school || item?.institution || item?.name || "";
  const degree = item?.degree || item?.qualification || "";
  const field = item?.field || item?.fieldOfStudy || "";
  const year = item?.year || item?.graduationYear || "";

  return (
    <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 6,
        background: "#fef3e2", display: "flex",
        alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 18,
      }}>
        🎓
      </div>
      <div>
        <Text strong style={{ fontSize: 14, display: "block" }}>{school}</Text>
        {(degree || field) && (
          <Text style={{ fontSize: 13, display: "block" }}>
            {[degree, field].filter(Boolean).join(", ")}
          </Text>
        )}
        {year && (
          <Text type="secondary" style={{ fontSize: 12 }}>{year}</Text>
        )}
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getUserProfile(userId);
        setUser(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    const wasFollowing = user.isFollowedByMe;
    setUser((u) => ({
      ...u,
      isFollowedByMe: !wasFollowing,
      followersCount: wasFollowing ? u.followersCount - 1 : u.followersCount + 1,
    }));
    try {
      wasFollowing ? await unfollowUser(userId) : await followUser(userId);
    } catch {
      setUser((u) => ({
        ...u,
        isFollowedByMe: wasFollowing,
        followersCount: wasFollowing ? u.followersCount + 1 : u.followersCount - 1,
      }));
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Text type="secondary">User not found.</Text>
      </div>
    );
  }

  const profile = user.CandidateProfile;
  const avatar = profile?.profilePicture || user.profileUrl;
  const headline = profile?.title || "Salesforce Professional";
  const location = profile?.currentLocation;
  const experience = profile?.totalExperience;
  const summary = profile?.summary;

  const clouds = Array.isArray(profile?.primaryClouds)
    ? profile.primaryClouds.map((c) => (typeof c === "string" ? c : c?.name)).filter(Boolean)
    : [];

  const skills = Array.isArray(profile?.skillsJson)
    ? profile.skillsJson.map((s) => (typeof s === "string" ? s : s?.name)).filter(Boolean)
    : [];

  const certs = profile?.certifications ?? [];

  const workExp = Array.isArray(profile?.workExperience) ? profile.workExperience : [];
  const education = Array.isArray(profile?.education) ? profile.education : [];

  const hasTrailhead =
  (profile?.trailheadPoints ?? 0) > 0 ||
  (profile?.trailheadBadgesCount ?? 0) > 0 ||
  (profile?.trailheadTrailsCount ?? 0) > 0;

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", paddingBottom: 40 }}>

      {/* Back button */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "16px 16px 0" }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ color: "#0a66c2", fontWeight: 500, paddingLeft: 0 }}
        >
          Back
        </Button>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 16px" }}>

        {/* ── Top card ── */}
        <div style={{
          background: "#fff",
          borderRadius: 10,
          border: "1px solid #e0e0e0",
          marginBottom: 12,
          overflow: "hidden",
        }}>
          {/* Cover */}
          <div style={{
            height: 140,
            background: "linear-gradient(135deg, #0a66c2 0%, #004182 100%)",
          }} />

          {/* Avatar + actions row */}
          <div style={{ padding: "0 24px 20px", position: "relative" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: -40,
              marginBottom: 12,
            }}>
              <Avatar
                size={100}
                src={avatar}
                style={{
                  border: "4px solid #fff",
                  background: "#0a66c2",
                  fontWeight: 700,
                  fontSize: 36,
                  flexShrink: 0,
                }}
              >
                {user.name?.charAt(0)}
              </Avatar>

              <div style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
                <Button
                  type={user.isFollowedByMe ? "default" : "primary"}
                  shape="round"
                  icon={user.isFollowedByMe ? <CheckOutlined /> : <UserAddOutlined />}
                  loading={followLoading}
                  onClick={handleFollowToggle}
                  style={user.isFollowedByMe
                    ? { borderColor: "#0a66c2", color: "#0a66c2" }
                    : { background: "#0a66c2", borderColor: "#0a66c2" }}
                >
                  {user.isFollowedByMe ? "Following" : "Follow"}
                </Button>
              </div>
            </div>

            {/* Name */}
            <Title level={4} style={{ marginBottom: 2, marginTop: 0 }}>
              {user.name}
            </Title>

            {/* Headline */}
            <Text style={{ fontSize: 15, color: "#444", display: "block", marginBottom: 8 }}>
              {headline}
            </Text>

            {/* Location · experience */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 10 }}>
              {location && (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  {location}
                </Text>
              )}
              {experience && (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  🕐 {experience} experience
                </Text>
              )}
            </div>

            {/* Followers / following */}
            <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
              <Text style={{ fontSize: 13 }}>
                <strong>{user.followersCount ?? 0}</strong>{" "}
                <span style={{ color: "#0a66c2", cursor: "pointer" }}>followers</span>
              </Text>
              <Text style={{ fontSize: 13 }}>
                <strong>{user.followingCount ?? 0}</strong>{" "}
                <span style={{ color: "#0a66c2", cursor: "pointer" }}>following</span>
              </Text>
            </div>

            {/* Links */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {profile?.linkedInUrl && (
                <Tooltip title="LinkedIn">
                  <a href={profile.linkedInUrl} target="_blank" rel="noreferrer">
                    <Button size="small" shape="round" icon={<LinkedinOutlined />}>
                      LinkedIn
                    </Button>
                  </a>
                </Tooltip>
              )}
              {profile?.trailheadUrl && (
                <Tooltip title="Trailhead">
                  <a href={profile.trailheadUrl} target="_blank" rel="noreferrer">
                    <Button size="small" shape="round" icon={<TrophyOutlined />}>
                      Trailhead
                    </Button>
                  </a>
                </Tooltip>
              )}
              {profile?.portfolioLink && (
                <Tooltip title="Portfolio">
                  <a href={profile.portfolioLink} target="_blank" rel="noreferrer">
                    <Button size="small" shape="round" icon={<GlobalOutlined />}>
                      Portfolio
                    </Button>
                  </a>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {/* ── Trailhead stats ── */}
        {hasTrailhead && (
          <Section title="⚡ Trailhead">
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {profile.trailheadPoints && (
                <div style={{ textAlign: "center" }}>
                  <Text strong style={{ fontSize: 22, color: "#0a66c2", display: "block" }}>
                    {profile.trailheadPoints.toLocaleString()}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>Points</Text>
                </div>
              )}
              {profile.trailheadBadgesCount && (
                <div style={{ textAlign: "center" }}>
                  <Text strong style={{ fontSize: 22, color: "#0a66c2", display: "block" }}>
                    {profile.trailheadBadgesCount}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>Badges</Text>
                </div>
              )}
              {profile.trailheadTrailsCount && (
                <div style={{ textAlign: "center" }}>
                  <Text strong style={{ fontSize: 22, color: "#0a66c2", display: "block" }}>
                    {profile.trailheadTrailsCount}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>Trails</Text>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ── About ── */}
        {summary && (
          <Section title="About">
            <Paragraph
              style={{ fontSize: 14, color: "#444", marginBottom: 0, whiteSpace: "pre-wrap" }}
              ellipsis={{ rows: 4, expandable: true, symbol: "see more" }}
            >
              {summary}
            </Paragraph>
          </Section>
        )}

        {/* ── Salesforce Clouds ── */}
        {clouds.length > 0 && (
          <Section title="Salesforce Clouds">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {clouds.map((c) => (
                <Tag key={c} style={{
                  background: "#e8f0fe", color: "#0a66c2",
                  border: "none", borderRadius: 20,
                  padding: "4px 12px", fontSize: 13,
                }}>
                  {c}
                </Tag>
              ))}
            </div>
          </Section>
        )}

        {/* ── Certifications ── */}
        {certs.length > 0 && (
          <Section title="Certifications">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {certs.map((c) => (
                <Tag key={c} icon={<TrophyOutlined />} style={{
                  background: "#fffbe6", color: "#d46b08",
                  border: "1px solid #ffd591", borderRadius: 20,
                  padding: "4px 12px", fontSize: 13,
                }}>
                  {c}
                </Tag>
              ))}
            </div>
          </Section>
        )}

        {/* ── Skills ── */}
        {skills.length > 0 && (
          <Section title="Skills">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {skills.map((s) => (
                <Tag key={s} style={{
                  background: "#f3f2ef", color: "#333",
                  border: "1px solid #ddd", borderRadius: 20,
                  padding: "4px 12px", fontSize: 13,
                }}>
                  {s}
                </Tag>
              ))}
            </div>
          </Section>
        )}

        {/* ── Work Experience ── */}
        {workExp.length > 0 && (
          <Section title="Experience">
            {workExp.map((item, i) => (
              <div key={i}>
                <WorkExpItem item={item} />
                {i < workExp.length - 1 && <Divider style={{ margin: "0 0 16px" }} />}
              </div>
            ))}
          </Section>
        )}

        {/* ── Education ── */}
        {education.length > 0 && (
          <Section title="Education">
            {education.map((item, i) => (
              <div key={i}>
                <EduItem item={item} />
                {i < education.length - 1 && <Divider style={{ margin: "0 0 16px" }} />}
              </div>
            ))}
          </Section>
        )}

      </div>
    </div>
  );
}