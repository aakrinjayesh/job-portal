import React, { useState, useMemo, useEffect } from "react";
import { googleLogout } from "@react-oauth/google";
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  Button,
  Breadcrumb,
  Space,
  ConfigProvider,
  Modal,
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
  ContactsOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { logout } from "../../candidate/api/api";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const { Sider, Header, Content } = Layout;
const { Text, Title } = Typography;

const CompanyLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const timer = setTimeout(() => {
      sessionStorage.removeItem("justLoggedIn");
    }, 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const history = JSON.parse(sessionStorage.getItem("appHistory") || "[]");

    // Don't add duplicate consecutive pages
    const last = history[history.length - 1];
    if (last !== location.pathname) {
      history.push(location.pathname);
      sessionStorage.setItem("appHistory", JSON.stringify(history));
    }

    // Can go back only if there's a DIFFERENT previous page
    setCanGoBack(history.length > 1);
  }, [location.pathname]);

  // const user = JSON.parse(localStorage.getItem("user")) || {
  //   name: "Aakrin Company",
  //   role: "Company",
  // };
  const userData = JSON.parse(localStorage.getItem("user")) || {};

  const user = {
    name: userData.name || "Guest",
    role: userData.role || "Company",
    profileUrl: userData.profileUrl || null,
  };

  /* 🔗 Menu → Route mapping */
  const menuRoutes = {
    dashboard: ["/company/dashboard"],
    myactivity: ["/company/my-activity"],
    findjob: ["/company/job/find"],
    savedjobs: ["/company/jobs/saved"],
    appliedcandidatesbyjob: ["/company/appliedcandidatesbyjob"],
    bench: ["/company/bench"],
    findbench: ["/company/candidate/find"],
    savedcandidates: ["/company/bench/saved"],
    chat: ["/company/chat"],
    profile: ["/company/profile"],
    pricing: ["/company/pricing"],
    settings: ["/company/settings"],
    contact: ["/contact"],
    jobs: [
      "/company/jobs",
      // "/company/job",
      // "/companys/candidates",
      "/company/candidate",
    ],
    companyprofile: ["/company/public/"],
    renew: ["/company/renew"],
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
    } finally {
      const loginRole = localStorage.getItem("loginRole");
      localStorage.clear();
      if (loginRole) localStorage.setItem("loginRole", loginRole);
      sessionStorage.removeItem("companyPopupClosed");
      googleLogout();
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
    if (path.startsWith("/company/settings")) return "settings";
    if (path.startsWith("/company/dashboard")) return "dashboard";
    if (path.startsWith("/company/jobs")) return "jobs";

    // ✅ Public Company Profile (/company/:slug)

    if (path.startsWith("/company/public/")) {
      if (highlight) return highlight;
      return "companyprofile";
    }

    if (path.startsWith("/company/renew")) return "renew";

    return "dashboard";
  }, [location.pathname, location.state]);

  /* 🧠 Menu Click */
  const onMenuClick = ({ key }) => {
    const protectedPages = [
      "dashboard",
      "myactivity",
      "savedjobs",
      "appliedcandidatesbyjob",
      "bench",
      "findbench",
      "savedcandidates",
      "chat",
      "jobs",
      "profile",
    ];

    const token = localStorage.getItem("token");

    if (protectedPages.includes(key) && !token) {
      setShowLoginModal(true);
      return;
    }

    if (key === "logout") {
      handleLogout();
      return;
    }

    if (key === "findjob") {
      sessionStorage.removeItem("isReturning");
      sessionStorage.removeItem("findJobSortOrder_returning");
      sessionStorage.removeItem("savedFilters"); // ✅ add this
      sessionStorage.removeItem("filterOpen");
    }

    if (key === "contact") {
      window.open("/contact", "_blank");
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

    if (path.startsWith("/company/public/")) return "Company Profile";

    if (path.startsWith("/contact")) return "";

    const pageTitleMap = {
      dashboard: "Dashboard",
      jobs: "My Jobs",
      myactivity: "My Activity",
      findjob: "Find Jobs",
      savedjobs: "Saved Jobs",
      appliedcandidatesbyjob: "Applied Jobs",
      bench: "My Bench",
      findbench: "Find Candidate",
      savedcandidates: "Saved Candidates",
      chat: "Chats",
      profile: "Profile",
      pricing: "Pricing",
      settings: "Settings",
      companyprofile: "Company Profile",
      renew: "Renew Subscription",
    };

    return pageTitleMap[selectedKey] || "Dashboard";
  };

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Layout hasSider>
        {/* SIDEBAR */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          // trigger={null} // 👈 removes collapse icon below logout
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
              gap: collapsed ? 0 : 12,
              padding: collapsed ? "24px 0" : 24,
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            {/* <Avatar size={40} style={{ backgroundColor: "#1677FF" }}>
              {user.name?.charAt(0)}
            </Avatar> */}
            <Avatar
              size={40}
              src={user.profileUrl}
              style={{ backgroundColor: "#1677FF" }}
            >
              {!user.profileUrl && user.name?.charAt(0)}
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
              defaultOpenKeys={["jobs-group"]}
              style={{ background: "transparent", border: "none" }}
              items={[
                {
                  key: "jobs-group",
                  icon: <FileTextOutlined />,
                  label: "Jobs",
                  children: [
                    {
                      key: "jobs",
                      label: "My Jobs",
                    },
                    {
                      key: "findjob",
                      label: "Find Jobs",
                    },
                    {
                      key: "savedjobs",
                      label: "Saved Jobs",
                    },
                    //  { key: "appliedcandidatesbyjob", label: "Applied Jobs"},
                  ],
                },
                {
                  key: "myactivity",
                  icon: <AppstoreOutlined />,
                  label: "My Activity",
                },

                { key: "bench", icon: <TeamOutlined />, label: "My Bench" },
                {
                  key: "candidates-group",
                  icon: <TeamOutlined />,
                  label: "Candidates",
                  children: [
                    {
                      key: "findbench",
                      label: "Find Candidates",
                    },
                    {
                      key: "savedcandidates",
                      label: "Saved Candidates",
                    },
                  ],
                },
                { key: "chat", icon: <MessageOutlined />, label: "Chat" },

                {
                  key: "profile-group",
                  icon: <UserOutlined />,
                  label: "Profile",
                  children: [
                    {
                      key: "profile",
                      label: "Profile",
                    },
                    // {
                    //   key: "pricing",
                    //   label: "Pricing",
                    // },
                    {
                      key: "renew",
                      label: "Renew Subscription",
                      style: { display: "none" },
                    },
                  ],
                },
                {
                  key: "settings",
                  icon: <SettingOutlined />,
                  label: "Settings",
                },
                {
                  key: "contact",
                  icon: <ContactsOutlined />,
                  label: "Contact & Support",
                },
                {
                  key: "logout",
                  icon: <LogoutOutlined />,
                  label: "Logout",
                },
              ]}
            />{" "}
          </ConfigProvider>
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
              {/* {selectedKey !== "dashboard" && ( */}

              {selectedKey !== "dashboard" && (
                <Button
                  icon={<ArrowLeftOutlined />}
                  disabled={!canGoBack}
                  onClick={() => {
                    const history = JSON.parse(
                      sessionStorage.getItem("appHistory") || "[]",
                    );
                    history.pop();
                    sessionStorage.setItem(
                      "appHistory",
                      JSON.stringify(history),
                    );
                    setCanGoBack(history.length > 1);
                    navigate(-1);
                  }}
                  style={{
                    borderRadius: 20,
                    background: "#F8F8F8",
                    border: "none",
                    fontWeight: 500,
                    opacity: canGoBack ? 1 : 0.4,
                    cursor: canGoBack ? "pointer" : "not-allowed",
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
              {/* <Avatar
                size={56}
                style={{
                  background: "#F0F2F4",
                  color: "#666",
                  fontWeight: 600,
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </Avatar> */}
              <Avatar
                size={56}
                src={user.profileUrl}
                style={{
                  background: "#F0F2F4",
                  color: "#666",
                  fontWeight: 600,
                }}
              >
                {!user.profileUrl && user.name?.charAt(0).toUpperCase()}
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

export default CompanyLayout;
