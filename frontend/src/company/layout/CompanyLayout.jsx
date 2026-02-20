import React, { useState, useMemo } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  Button,
  Breadcrumb,
  Space,
  ConfigProvider,
} from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  SearchOutlined,
  SaveFilled,
  TeamOutlined,
  MessageOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { logout } from "../../candidate/api/api";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider, Header, Content } = Layout;
const { Text, Title } = Typography;

const CompanyLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Aakrin Company",
    role: "Company",
  };

  /* 🔗 Menu → Route mapping */
  const menuRoutes = {
    dashboard: ["/company/dashboard"],
    myactivity: ["/company/my-activity"],
    findjob: ["/company/job/find"],
    savedjobs: ["/company/jobs/saved"],
    bench: ["/company/bench"],
    findbench: ["/company/candidate/find"],
    savedcandidates: ["/company/bench/saved"],
    chat: ["/company/chat"],
    profile: ["/company/profile"],
    pricing: ["/company/pricing"],
    jobs: [
      "/company/jobs",
      // "/company/job",
      // "/companys/candidates",
      "/company/candidate",
    ],
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

 /* 🎯 ACTIVE MENU LOGIC */
const selectedKey = useMemo(() => {
  const path = location.pathname;
  const highlight = location.state?.highlight;

  /* 1️⃣ Most specific routes FIRST */

  // ✅ Find Jobs
  if (path.startsWith("/company/job/find")) {
    return "findjob";
  }

  // ✅ Saved Jobs
  if (path.startsWith("/company/jobs/saved")) {
    return "savedjobs";
  }

  // ✅ Find Candidate
  if (path.startsWith("/company/candidate/find")) {
    return "findbench";
  }

  // ✅ Saved Candidates
  if (path.startsWith("/company/bench/saved")) {
    return "savedcandidates";
  }

  // ✅ Bench Page
  if (path.startsWith("/company/bench")) {
    return "bench";
  }

  // ✅ Candidate Details (dynamic)
  if (path.startsWith("/company/candidate/")) {
    if (highlight) return highlight;
    return "jobs";
  }

  if (path.startsWith("/company/candidate")) {
    if (highlight) return highlight;
    return "jobs";
  }

  // ✅ Job Details (dynamic) - FIXED
  if (path.startsWith("/company/job/")) {
    // If coming from Find Jobs
    if (highlight === "findjob") return "findjob";
    // If coming from Saved Jobs
    if (highlight === "savedjobs") return "savedjobs";
    // Default: coming from My Jobs
    return "jobs";
  }

  // ✅ Direct Matches
  if (path.startsWith("/company/my-activity")) return "myactivity";
  if (path.startsWith("/company/chat")) return "chat";
  if (path.startsWith("/company/profile")) return "profile";
  if (path.startsWith("/company/pricing")) return "pricing";
  if (path.startsWith("/company/dashboard")) return "dashboard";
  if (path.startsWith("/company/jobs")) return "jobs";

  return "dashboard";
}, [location.pathname, location.state]);

  /* 🧠 Menu Click */
  const onMenuClick = ({ key }) => {
    if (key === "logout") {
      handleLogout();
      return;
    }

    const route = menuRoutes[key];
    if (route && route.length) {
      navigate(route[0]);
    }
  };

  /* 🧭 PAGE TITLE LOGIC */
  const getPageTitle = () => {
    const path = location.pathname;
    const highlight = location.state?.highlight;

    if (path.startsWith("/company/job/find")) return "Find Jobs";

    if (path.startsWith("/company/job/")) return "Job Details";

    if (path.startsWith("/company/candidate/")) {
      if (highlight === "bench") return "Bench Resource Details";
      return "Candidate Details";
    }

    if (path.startsWith("/company/candidates")) return "View Candidates";

    const pageTitleMap = {
      dashboard: "Dashboard",
      jobs: "My Jobs",
      myactivity: "My Activity",
      findjob: "Find Jobs",
      savedjobs: "Saved Jobs",
      bench: "My Bench",
      findbench: "Find Candidate",
      savedcandidates: "Saved Candidates",
      chat: "Chats",
      profile: "Profile",
      pricing: "Pricing",
    };

    return pageTitleMap[selectedKey] || "Dashboard";
  };

  return (
    <Layout hasSider>
      {/* SIDEBAR */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null} // 👈 removes collapse icon below logout
        width={240}
        style={{
          background: "#011026",
          height: "100vh",
          position: "sticky",
          top: 0,
          borderRight: "none",
        }}
      >
        {/* 🧑 Company Info */}
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: 24,
            alignItems: "center",
          }}
        >
          <Avatar size={40} style={{ backgroundColor: "#1677FF" }}>
            {user.name?.charAt(0)}
          </Avatar>

          {!collapsed && (
            <div>
              <Text style={{ color: "#fff", fontWeight: 600 }}>
                {user.name}
              </Text>
              <br />
              <Text style={{ color: "#AAAAAA", fontSize: 12 }}>
                {user.role}
              </Text>
            </div>
          )}
        </div>

        {/* 📌 Main Menu */}

        <ConfigProvider
          theme={{
            components: {
              Menu: {
                darkItemBg: "transparent",
                darkItemHoverBg: "#1677FF",
                darkItemSelectedBg: "#1677FF",
                darkItemSelectedColor: "#fff",
              },
            },
          }}
        >
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[selectedKey]}
            onClick={onMenuClick}
            style={{ background: "transparent", border: "none" }}
            items={[
              // {
              //   key: "dashboard",
              //   icon: <DashboardOutlined />,
              //   label: "Dashboard",
              // },
              { key: "jobs", icon: <FileTextOutlined />, label: "My Jobs" },
              {
                key: "myactivity",
                icon: <AppstoreOutlined />,
                label: "My Activity",
              },
              { key: "findjob", icon: <SearchOutlined />, label: "Find Jobs" },
              { key: "savedjobs", icon: <SaveFilled />, label: "Saved Jobs" },
              { key: "bench", icon: <TeamOutlined />, label: "My Bench" },
              {
                key: "findbench",
                icon: <SearchOutlined />,
                label: "Find Candidate",
              },
              {
                key: "savedcandidates",
                icon: <SaveFilled />,
                label: "Saved Candidates",
              },
              { key: "chat", icon: <MessageOutlined />, label: "Chat" },
            ]}
          />{" "}
        </ConfigProvider>

        <div
          style={{
            height: 1,
            background: "#E0E0E0",
            margin: "16px 0",
            opacity: 0.3,
          }}
        />

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          theme="dark"
          onClick={onMenuClick}
          style={{ background: "transparent", border: "none" }}
          items={[
            { key: "profile", icon: <UserOutlined />, label: "Profile" },
            { key: "pricing", icon: <UserOutlined />, label: "Pricing" },
            { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
          ]}
        />
      </Sider>

      {/* MAIN */}
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 80,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <Space size={16}>
            {selectedKey !== "dashboard" && (
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                style={{
                  borderRadius: 20,
                  background: "#F8F8F8",
                  border: "none",
                  fontWeight: 500,
                }}
              >
                Back
              </Button>
            )}

            <div style={{ width: 1, height: 48, background: "#F0F0F0" }} />

            <div>
              <Breadcrumb
              // items={[
              //   { title: "Dashboard" },
              //   { title: pageTitle },
              // ]}
              />
              <Title level={4} style={{ margin: 0 }}>
                {getPageTitle()}
              </Title>
            </div>
          </Space>

          <Space>
            <Avatar
              size={56}
              style={{
                background: "#F0F2F4",
                color: "#666",
                fontWeight: 600,
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>

            <div style={{ lineHeight: 1.2 }}>
              <Space size={4}>
                <Text strong style={{ margin: 0 }}>
                  Hi, {user.name}
                </Text>
              </Space>

              <Text
                type="secondary"
                style={{
                  display: "block",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {user.role}
              </Text>
            </div>
          </Space>
        </Header>

        <Content
          style={{
            padding: 16,
            background: "#f5f6fa",
            minHeight: "calc(100vh - 80px)",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default CompanyLayout;
