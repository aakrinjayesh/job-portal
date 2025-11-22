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
  Calendar,
} from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
  AppstoreOutlined,
  SearchOutlined,
  LogoutOutlined,
  CloudOutlined,
  EnvironmentOutlined,
  StarFilled,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  CalendarOutlined,
   PlayCircleOutlined,
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
    bench: "/company/bench",
    findjob: "/company/job/find",
    findbench: "/company/bench/find",
    profile:"/myProfile/edit",
    calendar:"/Calendar",
    logout: "/login", 
    course:"/course"

  };

  const items = [
    {
      key: "dashboard",
      label: "DashBoard",
      icon: <DashboardOutlined />,
    },
    // post a job hari code created job
    {
      key: "jobs",
      label: "My Jobs",
      icon: <FileTextOutlined />,
    },
    {
      key: "bench",
      label: "My Bench",
      icon: <TeamOutlined />,
    },
    {
      key: "findjob",
      label: "Find Jobs",
      icon: <SearchOutlined />,
    },
    {
      key: "findbench",
      label: "Find Bench",
      icon: <SearchOutlined />,
    },
    { key: "profile",
       label: "My Profile",
        icon: <UserOutlined /> 
      },
       {
      key: "course",
      label: "Courses",
      icon: <PlayCircleOutlined />,
    },
   {
    key: "calendar",
    label: "Calendar",
    icon: <CalendarOutlined />,
  },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
    },
  ];

  const onClick = (e) => {
    const route = menuRoutes[e.key];
    if (route) {
      if (e.key === "logout") {
        // Handle logout
        localStorage.clear();
      }
      navigate(route);
    }
  };

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Guest",
    role: "Company",
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
      {/* Sidebar */}
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
          defaultSelectedKeys={["1"]}
          style={{ borderRight: 0, paddingTop: "16px" }}
          items={items}
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
            Welcome <span style={{ color: "#1677ff" }}>Aakrin Pvt. Ltd.</span>
          </Title>
        </Header>

        <Content
          style={{
            marginTop: 64,
            marginBottom: 64,
            padding: "10px",
            background: "#f5f6fa",
            height: "calc(100vh - 128px)",
            overflowY: "auto",
            width: "100%",
          }}
        >
          {children}
        </Content>
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

export default CompanyLayout;
