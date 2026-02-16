import React from "react";
import { Tabs, Card } from "antd";
import PersonalProfile from "./PersonalProfile"; // 👈 your first component code
import Settings from "./Settings"; // 👈 org settings + activity
import SettingsTodoManager from "./SettingsTodoManager";
import UsageDashboard from "../components/Profile/UsageDashboard";
import OrganizationSettings from "./OrganizationSettings";

const MyProfile = () => {
  return (
    <div style={{ padding: 24, background: "#f5f7fb", minHeight: "100vh" }}>
      <Card
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Tabs
          defaultActiveKey="profile"
          size="large"
          tabBarStyle={{
            paddingLeft: 24,
            marginBottom: 0,
          }}
          items={[
            {
              key: "profile",
              label: "My Profile",
              children: (
                <div style={{ padding: 24 }}>
                  <PersonalProfile />
                </div>
              ),
            },
            {
              key: "organization",
              label: "Organization Settings",
              children: (
                <div style={{ padding: 24 }}>
                  {/* <Settings /> */}
                  <OrganizationSettings />
                </div>
              ),
            },
            {
              key: "activity",
              label: "My Activity",
              children: (
                <div style={{ padding: 24 }}>
                  <SettingsTodoManager />
                </div>
              ),
            },
            {
              key: "usage",
              label: "Usage Dashboard",
              children: (
                <div style={{ padding: 24 }}>
                  <UsageDashboard />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default MyProfile;
