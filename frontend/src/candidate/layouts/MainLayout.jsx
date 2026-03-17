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
  Drawer, // ✅ NEW
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
  MenuOutlined, // ✅ NEW
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const { Sider, Header, Content } = Layout;
const { Text, Title } = Typography;

// ✅ NEW: detect mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
};

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false); // ✅ NEW

  const isMobile = useIsMobile(); // ✅ NEW

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
    if (isMobile) setMobileDrawerOpen(false); // ✅ NEW: close drawer on tap

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
      const loginRole = localStorage.getItem("loginRole");
      localStorage.clear();
      if (loginRole) localStorage.setItem("loginRole", loginRole);
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

  // ✅ NEW: shared sidebar JSX — used in Drawer (mobile) and Sider (desktop)
  const SidebarMenuContent = () => (
    <>
      {/* 👤 User Info */}
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: 24,
          alignItems: "center",
        }}
      >
        <Avatar size={40} src={user?.profileUrl || undefined}>
          {!user?.profileUrl && user?.name?.slice(0, 2)?.toUpperCase()}
        </Avatar>
        <div>
          <Text style={{ color: "#fff", fontWeight: 600 }}>{user.name}</Text>
          <br />
          <Text style={{ color: "#AAAAAA", fontSize: 12 }}>{user.role}</Text>
        </div>
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
          { key: "savedjobs", icon: <SaveFilled />, label: "Saved Jobs" },
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
          { key: "settings", icon: <SettingOutlined />, label: "Settings" },
          { key: "profile", icon: <UserOutlined />, label: "Profile" },
          {
            key: "contact",
            icon: <ContactsOutlined />,
            label: "Contact & Support",
          },
          { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
        ]}
      />
    </>
  );

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
     <Layout hasSider style={{ position: "relative" }}>
        {/* 🧭 Sidebar */}
        <Sider
          // ✅ KEY FIX: on mobile always collapsed (icon-only), on desktop use state
          collapsed={isMobile ? true : collapsed}
          // ✅ on desktop allow toggling; on mobile keep fixed at icon width
          onCollapse={(val) => {
            if (!isMobile) setCollapsed(val);
          }}
          // ✅ on desktop show collapse trigger; on mobile hide it (we use drawer instead)
          width={260}
          collapsedWidth={60} // ✅ icon-only width on mobile
          style={{
            background: "#011026",
            height: "100vh",
            position: "sticky",
            top: 0,
             overflow: "visible",
          }}
          
        >
          {/* ✅ Floating edge toggle — desktop only */}
{!isMobile && (
  <div
    onClick={() => setCollapsed((prev) => !prev)}
    style={{
      position: "absolute",
      top: "50%",
      right: -14,
      transform: "translateY(-50%)",
      zIndex: 200,
      width: 28,
      height: 28,
      borderRadius: "50%",
      background: "#1a2942",
      border: "2px solid #2d4a7a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
      transition: "all 0.2s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#1677FF";
      e.currentTarget.style.borderColor = "#1677FF";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "#1a2942";
      e.currentTarget.style.borderColor = "#2d4a7a";
    }}
  >
    {collapsed ? (
      // Right arrow (expand)
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M9 18l6-6-6-6" stroke="#ffffff" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ) : (
      // Left arrow (collapse)
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M15 18l-6-6 6-6" stroke="#ffffff" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )}
  </div>
)}
          {/* 👤 User Info — avatar only when collapsed */}
          <div
            style={{
              display: "flex",
              gap: 12,
              padding: isMobile ? "20px 10px" : 24,
              alignItems: "center",
              justifyContent: isMobile ? "center" : "flex-start",
              // ✅ on mobile tap avatar to open full drawer
              cursor: isMobile ? "pointer" : "default",
            }}
            onClick={() => {
              if (isMobile) setMobileDrawerOpen(true);
            }}
          >
            <Avatar size={36} src={user?.profileUrl || undefined}>
              {!user?.profileUrl && user?.name?.slice(0, 2)?.toUpperCase()}
            </Avatar>

            {/* Only shown on desktop when not collapsed */}
            {!isMobile && !collapsed && (
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

          {/* ✅ MOBILE: hamburger button to open drawer */}
          {isMobile && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <Button
                type="text"
                icon={<MenuOutlined style={{ color: "#fff", fontSize: 16 }} />}
                onClick={() => setMobileDrawerOpen(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 4,
                }}
              />
            </div>
          )}

          {/* 📌 Main Menu */}
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[selectedKey]}
            onClick={onMenuClick}
            // ✅ always collapsed on mobile (icons only), respects state on desktop
            inlineCollapsed={isMobile ? true : collapsed}
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
            inlineCollapsed={isMobile ? true : collapsed} // ✅
            style={{ background: "transparent", border: "none" }}
            items={[
              { key: "settings", icon: <SettingOutlined />, label: "Settings" },
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

        {/* ✅ MOBILE DRAWER: slides in with full labels when hamburger tapped */}
        {isMobile && (
          <Drawer
            placement="left"
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            width={260}
            styles={{
              body: { padding: 0, background: "#011026" },
              header: { display: "none" },
            }}
            closable={false}
          >
            <SidebarMenuContent />
          </Drawer>
        )}

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
                  {/* ✅ hide "Back" text on mobile to save space */}
                  {!isMobile && "Back"}
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
              <Avatar
                size={isMobile ? 40 : 56}
                src={user?.profileUrl || undefined}
              >
                {!user?.profileUrl && user?.name?.slice(0, 2)?.toUpperCase()}
              </Avatar>

              {/* ✅ hide name/role on mobile */}
              {!isMobile && (
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
              )}
            </Space>
            {/* </Space> */}
          </Header>

          {/* 🧾 Content */}
          <Content
            style={{
              padding: isMobile ? 10 : 16,
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
