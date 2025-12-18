import React, { useState } from "react";
import {
  Layout,
  Menu,
  Card,
  Button,
  Row,
  Col,
  Avatar,
  Tag,
  Space,
  Typography,
  Divider,
  Tooltip,
  Checkbox,
} from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
  AppstoreOutlined,
  SearchOutlined,
  LogoutOutlined,
  WhatsAppOutlined,
  SaveFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

const CompanyLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuRoutes = {
    dashboard: "/company/dashboard",
    jobs: "/company/jobs",
    myactivity: "/company/my-activity",
    bench: "/company/bench",
    findjob: "/company/job/find",
    findbench: "/company/bench/find",
    savedjobs: "/company/jobs/saved",
    chat: "/company/chat",
    profile: "/company/profile",
    logout: "/login",
  };

  const items = [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "jobs", label: "My Jobs", icon: <FileTextOutlined /> },
    { key: "myactivity", label: "My Activity", icon: <AppstoreOutlined /> },
    { key: "findjob", label: "Find Jobs", icon: <SearchOutlined /> },
    { key: "savedjobs", label: "Saved Jobs", icon: <SaveFilled /> },
    { key: "bench", label: "My Bench", icon: <TeamOutlined /> },
    { key: "findbench", label: "Find Candidate", icon: <SearchOutlined /> },
    { key: "chat", label: "Chat", icon: <WhatsAppOutlined /> },
    { key: "profile", label: "Profile", icon: <FileTextOutlined /> },
    { key: "logout", label: "Logout", icon: <LogoutOutlined /> },
  ];

  const onClick = ({ key }) => {
    const route = menuRoutes[key];

    if (key === "logout") {
      localStorage.clear();
      navigate("/login");
      return;
    }

    if (key === "chat") {
      navigate("/company/chat", { state: { userType: "company" } });
      return;
    }

    if (route) navigate(route);
  };

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Guest",
    role: "Company",
  };
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
    <Layout hasSider>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={230}
        style={siderStyle}
      >
        <div
          style={{
            padding: 16,
            textAlign: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Avatar
            size={48}
            icon={<UserOutlined />}
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/company/dashboard")}
          />
          {!collapsed && (
            <>
              <div style={{ marginTop: 8, fontWeight: 600 }}>{user.name}</div>
              <Text type="secondary">{user.role}</Text>
            </>
          )}
        </div>

        <Menu
          mode="inline"
          items={items}
          onClick={onClick}
          style={{
            height: "calc(100vh - 110px)", // 🔥 important
            overflowY: "auto",
            borderRight: 0,
          }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            position: "fixed",
            top: 0,
            left: collapsed ? 80 : 230,
            right: 0,
            height: 64,
            background: "#fff",
            zIndex: 100,
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "left 0.2s",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Welcome <span style={{ color: "#1677ff" }}>{user.name}</span>
          </Title>
        </Header>

        <Content
          style={{
            marginTop: 64,
            // padding: 16,
            background: "#f5f6fa",
            minHeight: "calc(100vh - 64px)",
            overflowY: "auto",
            //  width: "100%",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default CompanyLayout;
