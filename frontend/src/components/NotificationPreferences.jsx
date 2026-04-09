import { useEffect, useState } from "react";
import { Card, Switch, Radio, Typography, Space, message, Spin } from "antd";
import { BellOutlined } from "@ant-design/icons";
import {
  GetNotificationPreferences,
  UpdateNotificationPreferences,
} from "../candidate/api/api";

const { Title, Text } = Typography;

export default function NotificationPreferences() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    notificationsEnabled: true,
    notificationType: "WEEKLY",
    // reminderNotificationsEnabled: true,
  });

  useEffect(() => {
    GetNotificationPreferences()
      .then((res) => {
        if (res?.data) setPrefs(res.data);
      })
      .catch(() => message.error("Failed to load notification preferences"))
      .finally(() => setLoading(false));
  }, []);

  const update = async (patch) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setSaving(true);
    try {
      await UpdateNotificationPreferences(patch);
      // message.success("Preferences saved");
      // if (patch.notificationsEnabled !== undefined) {
      //   message.success(
      //     patch.notificationsEnabled
      //       ? "Notifications enabled successfully"
      //       : "Notifications disabled successfully",
      //   );
      // } else if (patch.notificationType) {
      //   message.success("Notification frequency updated");
      // }
      if (patch.notificationsEnabled !== undefined) {
        if (patch.notificationsEnabled) {
          const type = (
            patch.notificationType || prefs.notificationType
          ).toLowerCase();
          message.success(
            `${type.charAt(0).toUpperCase() + type.slice(1)} notifications enabled`,
          );
        } else {
          message.success("Notifications turned OFF");
        }
      } else if (patch.notificationType) {
        message.success(
          `${patch.notificationType === "DAILY" ? "Daily" : "Weekly"} notifications enabled`,
        );
      }
    } catch {
      message.error("Failed to save preferences");
      setPrefs(prefs); // revert
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <Spin />
      </div>
    );
  }

  return (
    <Card
      style={{ maxWidth: 560, borderRadius: 12 }}
      styles={{ body: { padding: "24px 28px" } }}
    >
      {/* <Space align="center" style={{ marginBottom: 20 }}>
        <BellOutlined style={{ fontSize: 20, color: "#2563eb" }} />
        <Title level={4} style={{ margin: 0 }}>
          Job Notifications
        </Title>
        {saving && <Spin size="small" />}
      </Space> */}
      <Space align="center" style={{ marginBottom: 20 }}>
        <BellOutlined style={{ fontSize: 20, color: "#2563eb" }} />

        <Text strong style={{ fontSize: 18 }}>
          Job Notifications
        </Text>

        {saving && <Spin size="small" />}
      </Space>

      {/* Enable / Disable toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 0",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div>
          <Text strong style={{ fontSize: 14 }}>
            Email notifications
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Receive emails when new jobs are posted
          </Text>
        </div>
        <Switch
          checked={prefs.notificationsEnabled}
          onChange={(checked) => update({ notificationsEnabled: checked })}
        />
      </div>
      {/* Reminder toggle */}
      {/* <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 0",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div>
          <Text strong style={{ fontSize: 14 }}>
            Reminder emails
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Receive reminders before scheduled activities
          </Text>
        </div>

        <Switch
          checked={prefs.reminderNotificationsEnabled}
          onChange={(checked) =>
            update({ reminderNotificationsEnabled: checked })
          }
        />
      </div> */}

      {/* Frequency selector — only visible when enabled */}
      {prefs.notificationsEnabled && (
        <div style={{ paddingTop: 18 }}>
          <Text
            strong
            style={{ fontSize: 14, display: "block", marginBottom: 12 }}
          >
            Notification frequency
          </Text>
          <Radio.Group
            value={prefs.notificationType}
            onChange={(e) => update({ notificationType: e.target.value })}
          >
            <Space direction="vertical" size={10}>
              <Radio value="DAILY">
                <div>
                  <Text strong>Daily</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Get an email every morning with jobs posted the previous day
                  </Text>
                </div>
              </Radio>
              <Radio value="WEEKLY">
                <div>
                  <Text strong>Weekly</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Get a Friday digest with all jobs from the past week
                  </Text>
                </div>
              </Radio>
            </Space>
          </Radio.Group>
        </div>
      )}
    </Card>
  );
}
