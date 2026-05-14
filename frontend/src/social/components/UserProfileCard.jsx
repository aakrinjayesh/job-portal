import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, Typography, Tag } from "antd";
import { UserAddOutlined, CheckOutlined } from "@ant-design/icons";
import { followUser, unfollowUser } from "../api/api";

const { Text } = Typography;

export default function UserProfileCard({ user: initialUser, onFollowChange }) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const profile = user.CandidateProfile;
  const avatar = profile?.profilePicture || user.profileUrl;
  const headline = profile?.title || "Salesforce Professional";
  const location = profile?.currentLocation;
  const experience = profile?.totalExperience;

  // primaryClouds is Json — could be string[] or [{name}] depending on your data
  const clouds = Array.isArray(profile?.primaryClouds)
    ? profile.primaryClouds.slice(0, 2).map((c) =>
        typeof c === "string" ? c : c?.name
      )
    : [];

  const handleFollowToggle = async () => {
    if (loading) return;
    setLoading(true);
    const wasFollowing = user.isFollowedByMe;

    setUser((u) => ({
      ...u,
      isFollowedByMe: !wasFollowing,
      followersCount: wasFollowing ? u.followersCount - 1 : u.followersCount + 1,
    }));

    try {
      wasFollowing ? await unfollowUser(user.id) : await followUser(user.id);
      onFollowChange?.();
    } catch {
      setUser((u) => ({
        ...u,
        isFollowedByMe: wasFollowing,
        followersCount: wasFollowing ? u.followersCount + 1 : u.followersCount - 1,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e0e0e0",
      borderRadius: 10,
      marginBottom: 10,
      overflow: "hidden",
    }}>
      {/* Banner strip */}
      <div style={{
        height: 56,
        background: "linear-gradient(135deg, #0a66c2 0%, #004182 100%)",
      }} />

      {/* Body */}
      <div style={{ padding: "0 16px 14px", textAlign: "center" }}>
        {/* Avatar — overlaps banner */}
        <div style={{ marginTop: -28, marginBottom: 8 }}>
          <Avatar
            size={56}
            src={avatar}
            style={{
              border: "2px solid #fff",
              background: "#0a66c2",
              fontWeight: 700,
              fontSize: 22,
            }}
          >
            {user.name?.charAt(0)}
          </Avatar>
        </div>

        {/* Name */}
         <Text
        strong
        onClick={() => navigate(`/profile/${user.id}`)}
        style={{
          fontSize: 15,
          display: "block",
          lineHeight: 1.3,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
        onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
      >
        {user.name}
      </Text>

        {/* Headline */}
        <Text
          type="secondary"
          style={{
            fontSize: 12,
            marginTop: 2,
            lineHeight: 1.4,
            // clamp to 2 lines
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {headline}
        </Text>

        {/* Location + experience */}
        {/* {(location || experience) && (
          <Text
            type="secondary"
            style={{ fontSize: 11, display: "block", marginTop: 4 }}
          >
            {[location, experience && `${experience} exp`]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        )} */}

        {/* Cloud tags */}
        {/* {clouds.length > 0 && (
          <div style={{ marginTop: 6, display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
            {clouds.map((c) => (
              <Tag
                key={c}
                style={{
                  fontSize: 10,
                  padding: "1px 6px",
                  borderRadius: 10,
                  margin: 0,
                  background: "#e8f0fe",
                  color: "#0a66c2",
                  border: "none",
                }}
              >
                {c}
              </Tag>
            ))}
          </div>
        )} */}

        {/* Followers */}
        <Text style={{ fontSize: 11, color: "#888", display: "block", marginTop: 6 }}>
          {user.followersCount ?? 0} follower{user.followersCount !== 1 ? "s" : ""}
        </Text>

        {/* Follow button */}
        <Button
          type={user.isFollowedByMe ? "default" : "primary"}
          shape="round"
          size="small"
          icon={user.isFollowedByMe ? <CheckOutlined /> : <UserAddOutlined />}
          loading={loading}
          onClick={handleFollowToggle}
          style={{
            marginTop: 10,
            width: "100%",
            fontWeight: 500,
            fontSize: 13,
            ...(user.isFollowedByMe
              ? { borderColor: "#0a66c2", color: "#0a66c2" }
              : { background: "#0a66c2", borderColor: "#0a66c2" }),
          }}
        >
          {user.isFollowedByMe ? "Following" : "Follow"}
        </Button>
      </div>
    </div>
  );
}