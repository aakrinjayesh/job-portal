import { useState, useEffect, useRef } from "react";
import { Tabs, Card, notification } from "antd";
import { useLocation } from "react-router-dom";
import PersonalProfile from "./PersonalProfile"; // 👈 your first component code
import SettingsTodoManager from "./SettingsTodoManager";
// import UsageDashboard from "../components/Profile/UsageDashboard";
import OrganizationSettings from "./OrganizationSettings";

const MyProfile = () => {
  const location = useLocation();
  const fromPopup = location.state?.fromPopup;
  const popupMessage = location.state?.popupMessage;
  const isFromSidebar = !!location.state?.activeTab;

  // const getInitialTab = () => {
  //   if (!fromPopup || !popupMessage) return "profile";
  //   if (popupMessage.toLowerCase().includes("company")) return "organization";
  //   return "profile";
  // };

  // const [activeKey, setActiveKey] = useState(getInitialTab);

  const [api, contextHolder] = notification.useNotification();
  const notifiedRef = useRef(false);
  const getInitialTab = () => {
    // ✅ FIRST priority: sidebar click
    if (location.state?.activeTab) {
      return location.state.activeTab === "org"
        ? "organization"
        : location.state.activeTab;
    }

    // ✅ fallback: your popup logic
    if (!fromPopup || !popupMessage) return "profile";
    if (popupMessage.toLowerCase().includes("company")) return "organization";

    return "profile";
  };

  const [activeKey, setActiveKey] = useState(getInitialTab);

  useEffect(() => {
    if (location.state?.activeTab) {
      const tab =
        location.state.activeTab === "org"
          ? "organization"
          : location.state.activeTab;

      setActiveKey(tab);
    }
  }, [location.state]);

  useEffect(() => {
    if (!fromPopup || !popupMessage || notifiedRef.current) return;
    notifiedRef.current = true;
    api.info({
      message: "Complete Your Profile",
      description: popupMessage,
      placement: "topRight",
      duration: 5,
    });
  }, []);

  const handleProfileSaveSuccess = () => {
    if (fromPopup) {
      setActiveKey("organization");
    }
  };

  return (
    <div style={{ padding: 24, background: "#f5f7fb", minHeight: "100vh" }}>
      {contextHolder}
      <Card
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
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
                  <PersonalProfile
                    onSaveSuccess={
                      fromPopup ? handleProfileSaveSuccess : undefined
                    }
                  />
                </div>
              ),
            },
            {
              key: "organization",
              label: "Organization Settings",
              children: (
                <div style={{ padding: 24 }}>
                  
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
            // {
            //   key: "usage",
            //   label: "Usage Dashboard",
            //   children: (
            //     <div style={{ padding: 24 }}>
            //       <UsageDashboard />
            //     </div>
            //   ),
            // },
          ]}
        /> */}
        {isFromSidebar ? (
          // ✅ ONLY SELECTED CONTENT (NO TABS)
          <div style={{ padding: 24 }}>
            {activeKey === "profile" && (
              <PersonalProfile
                onSaveSuccess={fromPopup ? handleProfileSaveSuccess : undefined}
              />
            )}

            {activeKey === "organization" && <OrganizationSettings />}

            {activeKey === "activity" && <SettingsTodoManager />}
          </div>
        ) : (
          // ✅ NORMAL TABS VIEW
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
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
                    <PersonalProfile
                      onSaveSuccess={
                        fromPopup ? handleProfileSaveSuccess : undefined
                      }
                    />
                  </div>
                ),
              },
              {
                key: "organization",
                label: "Organization Settings",
                children: (
                  <div style={{ padding: 24 }}>
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
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default MyProfile;
