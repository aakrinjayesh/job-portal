import { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Button,
  Tag,
  Divider,
  Modal,
  message,
  Spin,
} from "antd";
import {
  ReloadOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getSubscriptionStatus, cancelSubscription } from "../../api/api";

const { Title, Text, Paragraph } = Typography;

const TIER_COLOR = {
  BASIC: "default",
  PROFESSIONAL: "blue",
  ORGANIZATION: "purple",
  ENTERPRISE: "gold",
};

export default function BillingSection() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchSubscription = async () => {
    try {
      const res = await getSubscriptionStatus();
      if (res.status === "success") setSubscription(res.subscription);
    } catch {
      // non-admin or no subscription — silently ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await cancelSubscription();
      messageApi.success(res.message);
      setCancelConfirmOpen(false);
      await fetchSubscription();
    } catch (err) {
      messageApi.error(
        err.response?.data?.message || "Failed to cancel subscription",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const periodEndDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const isExpired =
    subscription?.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd) < new Date();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spin />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div>
        <Title level={4} style={{ marginTop: 0 }}>
          Billing & Plan
        </Title>
        <Paragraph type="secondary">No active subscription found.</Paragraph>
        <Button type="primary" onClick={() => navigate("/company/pricing")}>
          View Plans
        </Button>
      </div>
    );
  }

  return (
    <>
      {contextHolder}

      {/* Cancel Confirm Modal */}
      <Modal
        title="Cancel Subscription?"
        open={cancelConfirmOpen}
        onCancel={() => setCancelConfirmOpen(false)}
        footer={[
          <Button key="back" onClick={() => setCancelConfirmOpen(false)}>
            Keep Subscription
          </Button>,
          <Button
            key="confirm"
            danger
            loading={actionLoading}
            onClick={handleCancel}
          >
            Yes, Cancel
          </Button>,
        ]}
      >
        <Paragraph>
          Auto-renewal will be turned off. You'll retain full access until{" "}
          <Text strong>{periodEndDate}</Text>. After that, your account will
          revert to the free plan.
        </Paragraph>
        <Paragraph type="secondary" style={{ fontSize: 13 }}>
          You can re-enable auto-renewal at any time before this date.
        </Paragraph>
      </Modal>

      <div>
        <Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
          Billing & Plan
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 24 }}>
          Manage your subscription and billing preferences.
        </Paragraph>

        {/* Current Plan */}
        <div
          style={{
            background: "#f8faff",
            border: "1px solid #e0e7ff",
            borderRadius: 10,
            padding: "20px 24px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Current Plan
              </Text>
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Title level={3} style={{ margin: 0 }}>
                  {subscription.planName}
                </Title>
                <Tag color={TIER_COLOR[subscription.planTier] || "default"}>
                  {subscription.planTier}
                </Tag>
              </div>
              <Text
                type="secondary"
                style={{ fontSize: 13, marginTop: 4, display: "block" }}
              >
                Billed {subscription.billingCycle?.toLowerCase()}
              </Text>
            </div>
            <Button onClick={() => navigate("/company/pricing")}>
              Change Plan
            </Button>
          </div>
        </div>

        {/* Renewal Status */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "20px 24px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Text strong>Auto-renewal</Text>
              <div style={{ marginTop: 4 }}>
                {subscription.status !== "CANCELLED" ? (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", marginRight: 6 }}
                    />
                    Your plan is active until{" "}
                    <Text strong>{periodEndDate}</Text>
                  </Text>
                ) : (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <StopOutlined
                      style={{ color: "#ff4d4f", marginRight: 6 }}
                    />
                    Subscription is paused. Access remains until{" "}
                    <Text strong>{periodEndDate}</Text>
                  </Text>
                )}
              </div>
            </div>
            {subscription.status !== "CANCELLED" ? (
              <Tag color="success">Active</Tag>
            ) : (
              <Tag color="error">Paused</Tag>
            )}
          </div>
        </div>

        {subscription.status !== "CANCELLED" ? (
          <>
            <Divider style={{ margin: "24px 0 20px" }} />
            <div
              style={{
                background: "#fff8f8",
                border: "1px solid #fde8e8",
                borderRadius: 10,
                padding: "20px 24px",
              }}
            >
              <Title level={5} style={{ color: "#c0392b" }}>
                Pause Subscription
              </Title>
              <div>
                {isExpired ? (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <StopOutlined
                      style={{ color: "#ff4d4f", marginRight: 6 }}
                    />
                    Your subscription has expired on{" "}
                    <Text strong>{periodEndDate}</Text>
                  </Text>
                ) : (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", marginRight: 6 }}
                    />
                    Your plan is active until{" "}
                    <Text strong>{periodEndDate}</Text>
                  </Text>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 12,
                }}
              >
                {isExpired && (
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={() => navigate("/company/renew")}
                  >
                    License Expired — Reactivate Now
                  </Button>
                )}
                <Button
                  danger
                  icon={<StopOutlined />}
                  onClick={() => setCancelConfirmOpen(true)}
                >
                  Pause Subscription
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Divider style={{ margin: "24px 0 20px" }} />
            <div
              style={{
                background: "#f6ffed",
                border: "1px solid #d9f7be",
                borderRadius: 10,
                padding: "20px 24px",
              }}
            >
              <Title level={5} style={{ color: "#389e0d" }}>
                Subscription Paused
              </Title>
              <Paragraph type="secondary" style={{ fontSize: 13 }}>
                Your subscription will expire on{" "}
                <Text strong>{periodEndDate}</Text>.
              </Paragraph>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => navigate("/company/renew")}
              >
                License Expired — Reactivate Now
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
