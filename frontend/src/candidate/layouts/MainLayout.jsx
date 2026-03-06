import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  Button,
  Breadcrumb,
  Space,
  Modal,
} from "antd";
import {
  FileTextOutlined,
  SearchOutlined,
  SaveFilled,
  WhatsAppOutlined,
  SettingOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
  ContactsOutlined,
  BellOutlined,
  // DownOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const { Sider, Header, Content } = Layout;
const { Text, Title } = Typography;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /* 👤 User Info */
  // const user = JSON.parse(localStorage.getItem("user")) || {
  //   name: "Guest",
  //   role: "Candidate",
  // };
  const [user, setUser] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("user")) || {
        name: "Guest",
        role: "Candidate",
      }
    );
  });

  // useEffect(() => {
  //   const updatedUser = JSON.parse(localStorage.getItem("user")) || {
  //     name: "Guest",
  //     role: "Candidate",
  //   };

  //   setUser(updatedUser);
  // }, [location.pathname]);
  useEffect(() => {
    const loadUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("user")) || {
        name: "Guest",
        role: "Candidate",
      };

      setUser(storedUser);
    };

    loadUser();

    // 🔥 this updates header + sidebar instantly after profile update
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  /* 🔗 Menu → Route mapping */
  const menuRoutes = {
    jobs: ["/candidate/jobs"],
    savedjobs: ["/candidate/jobs/saved"],
    appliedjobs: ["/candidate/jobs/applied"],
    chat: ["/candidate/chat"],
    settings: ["/candidate/settings"],
    profile: ["/candidate/profile"],
    contact: ["/contact"],
  };

  /* 🎯 Active menu */
  const selectedKey = React.useMemo(() => {
    const path = location.pathname;

    // 🔑 sort routes by longest path first
    const sortedRoutes = Object.entries(menuRoutes).sort(
      (a, b) =>
        Math.max(...b[1].map((p) => p.length)) -
        Math.max(...a[1].map((p) => p.length)),
    );

    for (const [key, paths] of sortedRoutes) {
      if (paths.some((p) => path.startsWith(p))) {
        return key;
      }
    }

    return "jobs";
  }, [location.pathname]);

  /* 🧠 Menu click */
  const onMenuClick = ({ key }) => {
    const protectedPages = [
      "savedjobs",
      "appliedjobs",
      "chat",
      "settings",
      "profile",
      "contactsupport",
    ];

    const token = localStorage.getItem("token");

    if (protectedPages.includes(key) && !token) {
      setShowLoginModal(true);
      return;
    }

    if (key === "logout") {
      localStorage.clear();
      navigate("/login");
      return;
    }

    if (key === "chat") {
      navigate("/candidate/chat", { state: { userType: "candidate" } });
      return;
    }

    if (key === "contact") {
      window.open("/contact", "_blank");
      return;
    }

    const route = menuRoutes[key];
    if (route && route.length) {
      navigate(route[0]); // always navigate to first route
    }
  };

  /* 🧭 Title mapping */
  const pageTitleMap = {
    jobs: "Find Jobs",
    savedjobs: "Saved Jobs",
    appliedjobs: "Applied Jobs",
    chat: "Chats",
    settings: "Settings",
    profile: "Profile",
    contactsupport: "Contact & Support",
  };

  const pageTitle = pageTitleMap[selectedKey] || "Find Jobs";

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
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
          {/* 👤 User Info */}
          <div
            style={{
              display: "flex",
              gap: 12,
              padding: 24,
              alignItems: "center",
            }}
          >
            {/* <Avatar size={40} icon={<UserOutlined />} /> */}
            <Avatar size={40} src={user?.profileUrl || undefined}>
              {!user?.profileUrl && user?.name?.slice(0, 2)?.toUpperCase()}
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
              { key: "jobs", icon: <SearchOutlined />, label: "Find Jobs" },
              {
                key: "savedjobs",
                icon: <SaveFilled />,
                label: "Saved Jobs",
              },
              {
                key: "appliedjobs",
                icon: <FileTextOutlined />,
                label: "Applied Jobs",
              },
              { key: "chat", icon: <WhatsAppOutlined />, label: "Chat" },
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
            selectedKeys={[selectedKey]}
            onClick={onMenuClick}
            style={{ background: "transparent", border: "none" }}
            items={[
              // { key: "settings", icon: <SettingOutlined />, label: "Settings" },
              { key: "profile", icon: <UserOutlined />, label: "Profile" },
              {
                key: "contact",
                icon: <ContactsOutlined />,
                label: "Contact & Support",
              },
              { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
            ]}
          />
        </Sider>

        {/* 📄 Main Layout */}
        <Layout>
          {/* 🔝 Header */}
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
              {selectedKey !== "profile" && (
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
                <Breadcrumb />
                <Title level={4} style={{ margin: 0 }}>
                  {pageTitle}
                </Title>
              </div>
            </Space>

            {/* Right */}
            {/* <Space size={24}>
            <Button
              shape="circle"
              icon={<BellOutlined />}
              style={{
                background: "#F0F2F4",
                border: "none",
                width: 48,
                height: 48,
              }}
            /> */}

            <Space>
              {/* <Avatar size={56}>
                {user.name?.slice(0, 2).toUpperCase()}
              </Avatar> */}
              <Avatar size={56} src={user?.profileUrl || undefined}>
                {!user?.profileUrl && user?.name?.slice(0, 2)?.toUpperCase()}
              </Avatar>

              <div style={{ lineHeight: 1.2 }}>
                <Space size={4}>
                  <Text strong>Hi, {user.name}</Text>
                  {/* <DownOutlined style={{ fontSize: 12 }} /> */}
                </Space>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: 12 }}
                >
                  {user.role}
                </Text>
              </div>
            </Space>
            {/* </Space> */}
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

        {/* 🔐 Login Modal */}
        <Modal
          open={showLoginModal}
          title="Login Required"
          onCancel={() => setShowLoginModal(false)}
          okText="Go to Login"
          onOk={() => navigate("/login")}
        >
          <p>Please login to use this feature.</p>
        </Modal>
      </Layout>
    </>
  );
};

export default MainLayout;
