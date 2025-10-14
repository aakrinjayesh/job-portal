import React, { useState } from "react";
import { Layout, Drawer, Button, Dropdown, Space } from "antd";
import { BellOutlined } from "@ant-design/icons";
import ProfileCustomButton from "../components/Layout/ProfileCustomButton";
import { useNavigate } from "react-router-dom";

const { Header, Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();

  const dropdownItems = [
    { key: "1", label: "Option 1" },
    { key: "2", label: "Option 2" },
  ];

  return (
    <Layout style={{ height: "100vh" }}>
      {/* Header */}
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
        }}
      >
        <div
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: "18px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/home")}
        >
          LOGO
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          <Dropdown menu={{ items: dropdownItems }} placement="bottom">
            <Button type="text" style={{ color: "white" }}>
              Jobs
            </Button>
          </Dropdown>
          <Dropdown menu={{ items: dropdownItems }} placement="bottom">
            <Button type="text" style={{ color: "white" }}>
              Company
            </Button>
          </Dropdown>
          <Dropdown menu={{ items: dropdownItems }} placement="bottom">
            <Button type="text" style={{ color: "white" }}>
              Services
            </Button>
          </Dropdown>
        </div>

        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Button
            type="text"
            onClick={() => setDrawerVisible(true)}
            icon={<BellOutlined style={{ fontSize: 20, color: "white" }} />}
          />
          <ProfileCustomButton />
        </div>

        <Drawer
          title="Notifications"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
        >
          Notification details goes here...
        </Drawer>
      </Header>

      {/* Page Content */}
      <Content style={{ padding: "24px" }}>{children}</Content>

      <Footer style={{ textAlign: "center" }}>
        Aakrin ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default MainLayout;
