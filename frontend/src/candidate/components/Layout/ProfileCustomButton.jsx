import React, { useState } from "react";
import { MenuOutlined, BellOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Drawer } from "antd";
import { Avatar, Space } from "antd";
import { useNavigate } from "react-router-dom";

const ProfileCustomButton = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* Custom Button */}
      <div
        onClick={() => setDrawerVisible(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "6px 12px",
          background: "#1677ff",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "0.3s",
        }}
        // onMouseEnter={(e) => (e.currentTarget.style.background = "#0958d9")}
        // onMouseLeave={(e) => (e.currentTarget.style.background = "#1677ff")}
      >
        <MenuOutlined style={{ color: "white", fontSize: 18 }} />
        <Avatar
          // style={{ backgroundColor: "#87d068" }}
          icon={<UserOutlined />}
        />
        {/* <img
          src="https://via.placeholder.com/30"
          alt="user"
          style={{ width: 30, height: 30, borderRadius: "50%" }}
        /> */}
      </div>

      {/* Drawer */}
      <Drawer
        title="Profile Settings"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            danger
            block
            onClick={() => {
              navigate("/");
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              setDrawerVisible(false);
            }}
          >
            Logout
          </Button>
          <Button
            type="primary"
            block
            onClick={() => {
              navigate("/updateprofile");
              setDrawerVisible(false);
            }}
          >
            Update Profile
          </Button>
          <Button
            block
            onClick={() => {
              navigate("/settings");
              setDrawerVisible(false);
            }}
          >
            Settings
          </Button>
          <Button
            block
            onClick={() => {
              navigate("/faq");
              setDrawerVisible(false);
            }}
          >
            FAQ
          </Button>
        </Space>
      </Drawer>
    </>
  );
};

export default ProfileCustomButton;
