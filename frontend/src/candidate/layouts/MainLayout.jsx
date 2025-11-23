import React, { useState } from "react";
import { Layout, Menu, Avatar, Typography } from "antd";
import {
  FileTextOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  SaveFilled,
  LogoutOutlined,
  WhatsAppOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuRoutes = {
    dashboard: "/candidate/dashboard",
    profile: "/candidate/profile",
    job: "/candidate/jobs",
    chat: "/candidate/chat",
    appliedjobs: "/candidate/jobs/applied",
    savedjobs: "/candidate/jobs/saved",
    settings: "/candidate/settings",
    faq: "/candidate/faq",
    logout: "/login",
  };

  const items = [
    { key: "profile", label: "Profile", icon: <FileTextOutlined /> },
    { key: "job", label: "Find Jobs", icon: <SearchOutlined /> },
    { key: "appliedjobs", label: "Applied Jobs", icon: <FileTextOutlined /> },
    { key: "savedjobs", label: "Saved Jobs", icon: <SaveFilled /> },
    { key: "chat", label: "Chat", icon: <WhatsAppOutlined /> },
    { key: "logout", label: "Logout", icon: <LogoutOutlined /> },
    { key: "settings", label: "Settings", icon: <SettingOutlined /> },
    { key: "faq", label: "FAQ", icon: <QuestionCircleOutlined /> },
  ];

  const onClick = (e) => {
    const route = menuRoutes[e.key];
    if (route) {
      if (e.key === "logout") localStorage.clear();
      if (e.key === "chat") {
        navigate("/candidate/chat", { state: { userType: "candidate" } });
        return;
      }
      navigate(route);
    }
  };

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Guest",
    role: "Candidate",
  };
  const { name, role } = user;

  const siderStyle = {
    overflow: "auto",
    height: "100vh",
    position: "sticky",
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: "thin",
    scrollbarGutter: "stable",
    background: "#fff",
    boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar (unchanged as requested) */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={230}
        style={siderStyle}
      >
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Avatar
            size={54}
            icon={<UserOutlined />}
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/candidate/dashboard")}
          />
          {!collapsed && (
            <>
              <div style={{ marginTop: "8px", fontWeight: "bold" }}>{name}</div>
              <Text type="secondary">{role}</Text>
            </>
          )}
        </div>

        <Menu
          mode="inline"
          onClick={onClick}
          style={{ borderRight: 0, paddingTop: "16px" }}
          items={items}
        />
      </Sider>

      {/* Main Layout */}
      <Layout>
        {/* Fixed Header */}
        <Header
          style={{
            position: "fixed",
            top: 0,
            left: collapsed ? 80 : 230,
            right: 0,
            height: 64,
            zIndex: 100,
            background: "#ffffff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "left 0.2s",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Welcome <span style={{ color: "#1677ff" }}>{name}</span>
          </Title>
        </Header>

        {/* Scrollable Content */}
        <Content
          style={{
            marginTop: 64,
            // marginBottom: 64,
            padding: "10px",
            paddingBottom: "0px",
            background: "#f5f6fa",
            height: "calc(100vh - 128px)",
            overflowY: "auto",
            width: "100%",
          }}
        >
          {children}
        </Content>

        {/* Fixed Footer */}
        {/* <Footer
          style={{
            position: "fixed",
            bottom: 0,
            left: collapsed ? 80 : 230,
            right: 0,
            height: 50,
            background: "#fff",
            textAlign: "center",
            boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
            lineHeight: "64px",
            transition: "left 0.2s",
            padding: 0,
          }}
        >
          <a
            href="https://aakrin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Aakrin ©
          </a>{" "}
          {new Date().getFullYear()}
        </Footer> */}
      </Layout>
    </Layout>
  );
};

export default MainLayout;
