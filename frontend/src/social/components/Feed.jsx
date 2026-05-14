import { useEffect, useState } from "react";
import { Layout, Spin, Row, Col, Empty, Alert, Tabs, Badge, Avatar, Button, Card, Typography} from "antd";
import { AppstoreOutlined, TeamOutlined,BankOutlined, UserAddOutlined, CheckOutlined} from "@ant-design/icons";
import { getFeed } from "../api/api";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";
import PeopleSidebar from "./PeopleSidebar";
import CompanyCard from "../pages/CompanyCard";
import CompaniesSidebar from "./CompanySidebar";
import { useSearchParams } from "react-router-dom";

import { getSuggestedUsers, followUser, unfollowUser } from "../api/api";
import { useNavigate } from "react-router-dom";

const { Content, Header } = Layout;

const { Text, Title } = Typography;

function SimplePersonRow({ user: initialUser, onFollowChange }) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const profile = user.CandidateProfile;
  const avatar = profile?.profilePicture || user.profileUrl;
  const title = profile?.title || "Salesforce Professional";

  const handleFollow = async () => {
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
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      padding: "12px 0",
      borderBottom: "1px solid #f0f0f0",
    }}>
      {/* Avatar */}
      <Avatar
        size={44}
        src={avatar}
        onClick={() => navigate(`/profile/${user.id}`)}
        style={{
          background: "#0a66c2", fontWeight: 700,
          flexShrink: 0, cursor: "pointer",
        }}
      >
        {user.name?.charAt(0)}
      </Avatar>

      {/* Name + title + follow button stacked */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text
          strong
          onClick={() => navigate(`/profile/${user.id}`)}
          style={{
            fontSize: 13, display: "block",
            cursor: "pointer", lineHeight: 1.3,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#0a66c2")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "")}
        >
          {user.name}
        </Text>

        {/* Full title — no truncation */}
        <Text
          type="secondary"
          style={{
            fontSize: 12,
            display: "block",
            lineHeight: 1.4,
            marginBottom: 8,
            marginTop: 2,
          }}
        >
          {title}
        </Text>

        {/* Follow button below */}
        <Button
          size="small"
          shape="round"
          type={user.isFollowedByMe ? "default" : "primary"}
          icon={user.isFollowedByMe ? <CheckOutlined /> : <UserAddOutlined />}
          loading={loading}
          onClick={handleFollow}
          style={{
            fontSize: 12,
            fontWeight: 500,
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

function PeopleWidget() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetch = async () => {
    try {
      const res = await getSuggestedUsers(1, 5);
      setUsers(res.data.users ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <Card
      style={{ borderRadius: 12, marginBottom: 16 }}
      bodyStyle={{ padding: "12px 16px" }}
      title={
        <Title level={5} style={{ margin: 0, fontSize: 14 }}>
          People you may know
        </Title>
      }
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 16 }}>
          <Spin size="small" />
        </div>
      ) : users.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No suggestions" />
      ) : (
        <>
          {users.map((u) => (
            <SimplePersonRow key={u.id} user={u} onFollowChange={fetch} />
          ))}

          {/* Show all — at the bottom */}
          <div
           onClick={() => navigate("/networking?tab=people")}
            style={{
              textAlign: "center",
              paddingTop: 12,
              fontSize: 13,
              color: "#0a66c2",
              fontWeight: 500,
              cursor: "pointer",
              borderTop: "1px solid #f0f0f0",
              marginTop: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Show all →
          </div>
        </>
      )}
    </Card>
  );
}

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
   const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
  const tab = searchParams.get("tab");
  if (tab) setActiveTab(tab);
}, [searchParams]);

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFeed();
      const rawData = res.data;
      if (!Array.isArray(rawData)) {
        setError("Unexpected response: " + JSON.stringify(rawData));
        return;
      }
      setPosts(rawData);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const renderPosts = () => {
    if (posts.length === 0) {
      return (
        <Empty
          description="No posts yet. Follow people or create your first post!"
          style={{ marginTop: 60 }}
        />
      );
    }
    return posts.map((f) => {
      const post = f.post ?? f;
      if (!post?.id) return null;
      return <PostCard key={post.id} post={post} />;
    });
  };

  const tabItems = [
  {
    key: "posts",
    label: (
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <AppstoreOutlined />
        Posts
        {posts.length > 0 && (
          <Badge
            count={posts.length}
            size="small"
            style={{ background: activeTab === "posts" ? "#1677ff" : "#bbb" }}
          />
        )}
      </span>
    ),
  },
  {
    key: "people",
    label: (
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <TeamOutlined />
        People
      </span>
    ),
  },
  {
    key: "companies",                             // ← new
    label: (
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <BankOutlined />                          
        Companies
      </span>
    ),
  },
];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* LinkedIn-style sticky tab header */}
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          borderBottom: "1px solid #e8e8e8",
          height: "auto",
          lineHeight: "normal",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <Row justify="center">
          <Col xs={24} sm={24} md={22} lg={20}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              size="large"
              tabBarStyle={{ marginBottom: 0, borderBottom: "none" }}
              tabBarGutter={40}
            />
          </Col>
        </Row>
      </Header>

      <Content style={{ padding: "24px 16px" }}>
        <Row justify="center" gutter={24}>

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <>
              <Col xs={24} sm={24} md={14} lg={14}>
                <CreatePost refreshFeed={fetchFeed} />

                {error && (
                  <Alert
                    message="Could not load feed"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  />
                )}

                {loading ? (
                  <div style={{ textAlign: "center", marginTop: 60 }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  renderPosts()
                )}
              </Col>

              {/* Sidebar only visible on Posts tab, medium+ screens */}
              <Col xs={0} sm={0} md={8} lg={7}>
                <PeopleWidget /> 
              </Col>
            </>
          )}

          {/* People Tab — full-width people grid */}
          {activeTab === "people" && (
  <Col xs={24} sm={24} md={24} lg={22} xl={20}>
    <PeopleSidebar fullPage />
  </Col>
)}

          {/* Companies Tab */}
{activeTab === "companies" && (
  <Col xs={24} sm={24} md={24} lg={22} xl={20}>
    <CompaniesSidebar fullPage />
  </Col>
)}

        </Row>
      </Content>
    </Layout>
  );
}