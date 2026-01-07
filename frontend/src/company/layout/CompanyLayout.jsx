import React, { useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  Button,
  Breadcrumb,
  Space,
} from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  SearchOutlined,
  SaveFilled,
  TeamOutlined,
  MessageOutlined,
  SettingOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
  BellOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider, Header, Content } = Layout;
const { Text, Title } = Typography;

const CompanyLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  /* 👤 User Info */
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Aakrin Company",
    role: "Company",
  };

  /* 🔗 Menu → Route mapping */
  const menuRoutes = {
    dashboard: "/company/dashboard",
    jobs: "/company/jobs",
    myactivity: "/company/my-activity",
    findjob: "/company/job/find",
    savedjobs: "/company/jobs/saved",
    bench: "/company/bench",
    findbench: "/company/bench/find",
    savedcandidates: "/company/bench/saved",
    chat: "/company/chat",
    settings: "/company/settings",
  };

  /* 🎯 Active menu */
  const selectedKey =
    Object.keys(menuRoutes).find((key) =>
      location.pathname.startsWith(menuRoutes[key])
    ) || "dashboard";

  /* 🧠 Menu click handler */
  const onMenuClick = ({ key }) => {
    if (key === "logout") {
      localStorage.clear();
      navigate("/login");
      return;
    }

    const route = menuRoutes[key];
    if (route) navigate(route);
  };

  /* 🧭 Breadcrumb + title logic */
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
    settings: "Settings",
  };

  const pageTitle = pageTitleMap[selectedKey] || "Dashboard";

  return (
    <Layout hasSider>
      {/* 🧭 Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        style={{
          background: "#011026",
          height: "100vh",
          position: "sticky",
          top: 0,
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
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          onClick={onMenuClick}
          style={{ background: "transparent", border: "none" }}
          items={[
            { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
            { key: "jobs", icon: <FileTextOutlined />, label: "My Jobs" },
            { key: "myactivity", icon: <AppstoreOutlined />, label: "My Activity" },
            { key: "findjob", icon: <SearchOutlined />, label: "Find Jobs" },
            { key: "savedjobs", icon: <SaveFilled />, label: "Saved Jobs" },
            { key: "bench", icon: <TeamOutlined />, label: "My Bench" },
            { key: "findbench", icon: <SearchOutlined />, label: "Find Candidate" },
            {
              key: "savedcandidates",
              icon: <SaveFilled />,
              label: "Saved Candidates",
            },
            { key: "chat", icon: <MessageOutlined />, label: "Chat" },
          ]}
        />

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "#E0E0E0",
            margin: "16px 0",
            opacity: 0.3,
          }}
        />

        {/* ⚙️ Bottom Menu */}
        <Menu
          mode="inline"
          theme="dark"
          onClick={onMenuClick}
          style={{ background: "transparent", border: "none" }}
          items={[
            { key: "settings", icon: <SettingOutlined />, label: "Settings" },
            { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
          ]}
        />
      </Sider>

      {/* 📄 Main Layout */}
      <Layout>
        {/* 🔝 Header (Merged ChatHeader here) */}
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
          {/* Left */}
          <Space size={16}>
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

            <div style={{ width: 1, height: 48, background: "#F0F0F0" }} />

            <div>
              <Breadcrumb
                items={[
                  { title: "Dashboard" },
                  { title: pageTitle },
                ]}
              />
              <Title level={4} style={{ margin: 0 }}>
                {pageTitle}
              </Title>
            </div>
          </Space>

          {/* Right */}
          <Space size={24}>
            <Button
              shape="circle"
              icon={<BellOutlined />}
              style={{
                background: "#F0F2F4",
                border: "none",
                width: 48,
                height: 48,
              }}
            />

            <Space>
              <Avatar
                size={56}
                style={{
                  background: "#F0F2F4",
                  color: "#666",
                  fontWeight: 600,
                }}
              >
                {user.name?.slice(0, 2).toUpperCase()}
              </Avatar>

             <div style={{ lineHeight: 1.2 }}>
  <Space size={4}>
    <Text strong style={{ margin: 0 }}>
      Hi, {user.name}
    </Text>
    <DownOutlined style={{ color: "#666", fontSize: 12 }} />
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
          </Space>
        </Header>

        {/* 🧾 Content */}
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
