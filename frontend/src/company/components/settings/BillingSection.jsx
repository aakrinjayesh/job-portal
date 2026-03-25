// import { useState, useEffect } from "react";
// import {
//   Typography,
//   Card,
//   Button,
//   Tag,
//   Divider,
//   Modal,
//   message,
//   Spin,
// } from "antd";
// import {
//   ReloadOutlined,
//   StopOutlined,
//   CheckCircleOutlined,
// } from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";
// import { getSubscriptionStatus, cancelSubscription } from "../../api/api";

// const { Title, Text, Paragraph } = Typography;

// const TIER_COLOR = {
//   BASIC: "default",
//   PROFESSIONAL: "blue",
//   ORGANIZATION: "purple",
//   ENTERPRISE: "gold",
// };

// export default function BillingSection() {
//   const navigate = useNavigate();
//   const [subscription, setSubscription] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
//   const [messageApi, contextHolder] = message.useMessage();

//   const fetchSubscription = async () => {
//     try {
//       const res = await getSubscriptionStatus();
//       if (res.status === "success") setSubscription(res.subscription);
//     } catch {
//       // non-admin or no subscription — silently ignore
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSubscription();
//   }, []);

//   const handleCancel = async () => {
//     setActionLoading(true);
//     try {
//       const res = await cancelSubscription();
//       messageApi.success(res.message);
//       setCancelConfirmOpen(false);
//       await fetchSubscription();
//     } catch (err) {
//       messageApi.error(
//         err.response?.data?.message || "Failed to cancel subscription",
//       );
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const periodEndDate = subscription?.currentPeriodEnd
//     ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       })
//     : null;

//   const isExpired =
//     subscription?.currentPeriodEnd &&
//     new Date(subscription.currentPeriodEnd) < new Date();

//   if (loading) {
//     return (
//       <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
//         <Spin />
//       </div>
//     );
//   }

//   if (!subscription) {
//     return (
//       <div>
//         <Title level={4} style={{ marginTop: 0 }}>
//           Billing & Plan
//         </Title>
//         <Paragraph type="secondary">No active subscription found.</Paragraph>
//         <Button type="primary" onClick={() => navigate("/company/pricing")}>
//           View Plans
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <>
//       {contextHolder}

//       {/* Cancel Confirm Modal */}
//       <Modal
//         title="Cancel Subscription?"
//         open={cancelConfirmOpen}
//         onCancel={() => setCancelConfirmOpen(false)}
//         footer={[
//           <Button key="back" onClick={() => setCancelConfirmOpen(false)}>
//             Keep Subscription
//           </Button>,
//           <Button
//             key="confirm"
//             danger
//             loading={actionLoading}
//             onClick={handleCancel}
//           >
//             Yes, Cancel
//           </Button>,
//         ]}
//       >
//         <Paragraph>
//           Auto-renewal will be turned off. You'll retain full access until{" "}
//           <Text strong>{periodEndDate}</Text>. After that, your account will
//           revert to the free plan.
//         </Paragraph>
//         <Paragraph type="secondary" style={{ fontSize: 13 }}>
//           You can re-enable auto-renewal at any time before this date.
//         </Paragraph>
//       </Modal>

//       <div>
//         <Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
//           Billing & Plan
//         </Title>
//         <Paragraph type="secondary" style={{ marginBottom: 24 }}>
//           Manage your subscription and billing preferences.
//         </Paragraph>

//         {/* Current Plan */}
//         <div
//           style={{
//             background: "#f8faff",
//             border: "1px solid #e0e7ff",
//             borderRadius: 10,
//             padding: "20px 24px",
//             marginBottom: 20,
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "flex-start",
//             }}
//           >
//             <div>
//               <Text
//                 type="secondary"
//                 style={{
//                   fontSize: 12,
//                   textTransform: "uppercase",
//                   letterSpacing: 0.5,
//                 }}
//               >
//                 Current Plan
//               </Text>
//               <div
//                 style={{
//                   marginTop: 6,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 10,
//                 }}
//               >
//                 <Title level={3} style={{ margin: 0 }}>
//                   {subscription.planName}
//                 </Title>
//                 <Tag color={TIER_COLOR[subscription.planTier] || "default"}>
//                   {subscription.planTier}
//                 </Tag>
//               </div>
//               <Text
//                 type="secondary"
//                 style={{ fontSize: 13, marginTop: 4, display: "block" }}
//               >
//                 Billed {subscription.billingCycle?.toLowerCase()}
//               </Text>
//             </div>
//             <Button onClick={() => navigate("/company/pricing")}>
//               Change Plan
//             </Button>
//           </div>
//         </div>

//         {/* Renewal Status */}
//         <div
//           style={{
//             background: "#fff",
//             border: "1px solid #e5e7eb",
//             borderRadius: 10,
//             padding: "20px 24px",
//             marginBottom: 20,
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <div>
//               <Text strong>Auto-renewal</Text>
//               <div style={{ marginTop: 4 }}>
//                 {subscription.status !== "CANCELLED" ? (
//                   <Text type="secondary" style={{ fontSize: 13 }}>
//                     <CheckCircleOutlined
//                       style={{ color: "#52c41a", marginRight: 6 }}
//                     />
//                     Your plan is active until{" "}
//                     <Text strong>{periodEndDate}</Text>
//                   </Text>
//                 ) : (
//                   <Text type="secondary" style={{ fontSize: 13 }}>
//                     <StopOutlined
//                       style={{ color: "#ff4d4f", marginRight: 6 }}
//                     />
//                     Subscription is paused. Access remains until{" "}
//                     <Text strong>{periodEndDate}</Text>
//                   </Text>
//                 )}
//               </div>
//             </div>
//             {subscription.status !== "CANCELLED" ? (
//               <Tag color="success">Active</Tag>
//             ) : (
//               <Tag color="error">Paused</Tag>
//             )}
//           </div>
//         </div>

//         {subscription.status !== "CANCELLED" ? (
//           <>
//             <Divider style={{ margin: "24px 0 20px" }} />
//             <div
//               style={{
//                 background: "#fff8f8",
//                 border: "1px solid #fde8e8",
//                 borderRadius: 10,
//                 padding: "20px 24px",
//               }}
//             >
//               <Title level={5} style={{ color: "#c0392b" }}>
//                 Pause Subscription
//               </Title>
//               <div>
//                 {isExpired ? (
//                   <Text type="secondary" style={{ fontSize: 13 }}>
//                     <StopOutlined
//                       style={{ color: "#ff4d4f", marginRight: 6 }}
//                     />
//                     Your subscription has expired on{" "}
//                     <Text strong>{periodEndDate}</Text>
//                   </Text>
//                 ) : (
//                   <Text type="secondary" style={{ fontSize: 13 }}>
//                     <CheckCircleOutlined
//                       style={{ color: "#52c41a", marginRight: 6 }}
//                     />
//                     Your plan is active until{" "}
//                     <Text strong>{periodEndDate}</Text>
//                   </Text>
//                 )}
//               </div>
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "flex-end",
//                   gap: 10,
//                   marginTop: 12,
//                 }}
//               >
//                 {isExpired && (
//                   <Button
//                     type="primary"
//                     icon={<ReloadOutlined />}
//                     onClick={() => navigate("/company/renew")}
//                   >
//                     License Expired — Reactivate Now
//                   </Button>
//                 )}
//                 <Button
//                   danger
//                   icon={<StopOutlined />}
//                   onClick={() => setCancelConfirmOpen(true)}
//                 >
//                   Pause Subscription
//                 </Button>
//               </div>
//             </div>
//           </>
//         ) : (
//           <>
//             <Divider style={{ margin: "24px 0 20px" }} />
//             <div
//               style={{
//                 background: "#f6ffed",
//                 border: "1px solid #d9f7be",
//                 borderRadius: 10,
//                 padding: "20px 24px",
//               }}
//             >
//               <Title level={5} style={{ color: "#389e0d" }}>
//                 Subscription Paused
//               </Title>
//               <Paragraph type="secondary" style={{ fontSize: 13 }}>
//                 Your subscription will expire on{" "}
//                 <Text strong>{periodEndDate}</Text>.
//               </Paragraph>
//               <Button
//                 type="primary"
//                 icon={<ReloadOutlined />}
//                 onClick={() => navigate("/company/renew")}
//               >
//                 License Expired — Reactivate Now
//               </Button>
//             </div>
//           </>
//         )}
//       </div>
//     </>
//   );
// }

import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Tag,
  Spin,
  Table,
  Progress,
  Tooltip,
  Modal,
  message,
} from "antd";
import {
  ReloadOutlined,
  UserOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getOrgLicenses,
  getSubscriptionStatus,
  cancelSubscription,
} from "../../api/api";

const { Title, Text, Paragraph } = Typography;

const TIER_COLOR = {
  BASIC: "default",
  PROFESSIONAL: "blue",
  ORGANIZATION: "purple",
  ENTERPRISE: "gold",
};

function groupLicensesByTier(licenses) {
  const map = {};
  for (const lic of licenses) {
    const tier = lic.plan;
    if (!map[tier]) {
      map[tier] = { tier, planName: lic.planName, licenses: [] };
    }
    map[tier].licenses.push(lic);
  }
  return Object.values(map);
}

function SubscriptionBanner({ subscription, onCancel, actionLoading }) {
  const periodEndDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const isCancelled = subscription?.status === "CANCELLED";
  const isExpired =
    subscription?.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd) < new Date();

  return (
    <div
      style={{
        border: `1px solid ${isCancelled ? "#fde8e8" : "#e0e7ff"}`,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 28,
      }}
    >
      {/* Top row: plan name + status */}
      <div
        style={{
          background: isCancelled ? "#fff8f8" : "#f8faff",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Text
            type="secondary"
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Organization Subscription
          </Text>
          <Tag color={isCancelled ? "error" : "success"}>
            {isCancelled ? "Paused" : "Active"}
          </Tag>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Tag color={TIER_COLOR[subscription.planTier] || "default"}>
            {subscription.planTier}
          </Tag>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Billed {subscription.billingCycle?.toLowerCase()}
          </Text>
        </div>
      </div>

      {/* Bottom row: period info + actions */}
      <div
        style={{
          padding: "14px 24px",
          background: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          {!isCancelled && (
            <Button
              danger
              icon={<StopOutlined />}
              loading={actionLoading}
              onClick={onCancel}
            >
              Pause Subscription
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function LicenseGroup({ group, onRenew }) {
  const now = new Date();
  const total = group.licenses.length;
  const assigned = group.licenses.filter((l) => l.isAssigned).length;
  const unassigned = total - assigned;

  const sortedByExpiry = [...group.licenses].sort(
    (a, b) => new Date(a.validUntil) - new Date(b.validUntil),
  );
  const soonestExpiry = sortedByExpiry[0]?.validUntil;
  const isExpired = soonestExpiry && new Date(soonestExpiry) < now;
  const daysLeft = soonestExpiry
    ? Math.ceil((new Date(soonestExpiry) - now) / (1000 * 60 * 60 * 24))
    : null;
  const isExpiringSoon = !isExpired && daysLeft !== null && daysLeft <= 14;

  const expiryDate = soonestExpiry
    ? new Date(soonestExpiry).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const columns = [
    {
      title: "License ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (id) => (
        <Text code style={{ fontSize: 11 }}>
          {id.slice(0, 8)}…
        </Text>
      ),
    },
    {
      title: "Assigned To",
      key: "assignedTo",
      render: (_, rec) =>
        rec.isAssigned && rec.assignedTo ? (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <UserOutlined style={{ color: "#1677ff" }} />
            <Text strong style={{ fontSize: 13 }}>
              {rec.assignedTo.name}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ({rec.assignedTo.email})
            </Text>
          </span>
        ) : (
          <Tag color="default">Unassigned</Tag>
        ),
    },
    {
      title: "Valid Until",
      dataIndex: "validUntil",
      key: "validUntil",
      width: 160,
      render: (date) => {
        const d = new Date(date);
        const expired = d < now;
        const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        return (
          <Tooltip title={expired ? "Expired" : `${days} days left`}>
            <Text
              type={expired ? "danger" : days <= 14 ? "warning" : "secondary"}
            >
              {expired && <WarningOutlined style={{ marginRight: 4 }} />}
              {d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      render: (_, rec) => {
        const expired = new Date(rec.validUntil) < now;
        const days = Math.ceil(
          (new Date(rec.validUntil) - now) / (1000 * 60 * 60 * 24),
        );
        return expired ? (
          <Tag color="error">Expired</Tag>
        ) : days <= 14 ? (
          <Tag color="warning">Expiring Soon</Tag>
        ) : (
          <Tag color="success">Active</Tag>
        );
      },
    },
  ];

  return (
    <div
      style={{
        border: `1px solid ${isExpired ? "#fde8e8" : isExpiringSoon ? "#fff7e6" : "#e0e7ff"}`,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 20,
      }}
    >
      {/* Group header */}
      <div
        style={{
          background: isExpired
            ? "#fff8f8"
            : isExpiringSoon
              ? "#fffbe6"
              : "#f8faff",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Title level={5} style={{ margin: 0 }}>
            {group.planName}
          </Title>
          <Tag color={TIER_COLOR[group.tier] || "default"}>{group.tier}</Tag>
          {isExpired && <Tag color="error">Expired</Tag>}
          {isExpiringSoon && !isExpired && (
            <Tag color="warning">Expiring Soon</Tag>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {isExpired ? `Expired ${expiryDate}` : `Expires ${expiryDate}`}
          </Text>
          <Button
            type={isExpired ? "primary" : "default"}
            danger={isExpiringSoon && !isExpired}
            icon={<ReloadOutlined />}
            onClick={() => onRenew(group.tier)}
          >
            {isExpired ? "Reactivate" : "Renew"}
          </Button>
        </div>
      </div>

      {/* Seat summary */}
      <div
        style={{
          padding: "12px 20px",
          background: "#fff",
          display: "flex",
          gap: 32,
          alignItems: "center",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        {[
          { label: "Total Seats", value: total, color: undefined },
          { label: "Assigned", value: assigned, color: "#52c41a" },
          { label: "Available", value: unassigned, color: "#1677ff" },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {label}
            </Text>
            <div>
              <Text strong style={{ fontSize: 18, color }}>
                {value}
              </Text>
            </div>
          </div>
        ))}
      </div>

      {/* License rows */}
      <Table
        dataSource={group.licenses}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
        style={{ margin: 0 }}
      />
    </div>
  );
}

export default function BillingSection() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchAll = async () => {
    try {
      const [subRes, licRes] = await Promise.all([
        getSubscriptionStatus(),
        getOrgLicenses(),
      ]);
      if (subRes.status === "success") setSubscription(subRes.subscription);
      if (licRes.status === "success") {
        setLicenses(licRes.licenses.filter((l) => l.plan !== "BASIC"));
      }
    } catch {
      // silently ignore — non-admin or no subscription
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await cancelSubscription();
      messageApi.success(res.message);
      setCancelConfirmOpen(false);
      await fetchAll();
    } catch (err) {
      messageApi.error(
        err.response?.data?.message || "Failed to pause subscription",
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

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spin />
      </div>
    );
  }

  const groups = groupLicensesByTier(licenses);

  return (
    <>
      {contextHolder}

      {/* Cancel confirm modal */}
      <Modal
        title="Pause Subscription?"
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
            Yes, Pause
          </Button>,
        ]}
      >
        <Paragraph>Are you sure you want to cancel the subscription?</Paragraph>
      </Modal>

      <div>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Billing & Licenses
          </Title>
          <Button type="primary" onClick={() => navigate("/company/pricing")}>
            Purchase Seats
          </Button>
        </div>
        <Paragraph type="secondary" style={{ marginBottom: 24 }}>
          Manage your organization subscription and license seats.
        </Paragraph>

        {/* Subscription banner */}
        {subscription ? (
          <SubscriptionBanner
            subscription={subscription}
            onCancel={() => setCancelConfirmOpen(true)}
            actionLoading={actionLoading}
          />
        ) : (
          <div style={{ marginBottom: 28 }}>
            <Paragraph type="secondary">
              No active subscription found.
            </Paragraph>
            <Button type="primary" onClick={() => navigate("/company/pricing")}>
              View Plans
            </Button>
          </div>
        )}

        {/* License groups */}
        <Title level={5} style={{ marginBottom: 16 }}>
          License Seats
        </Title>

        {groups.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 0",
              border: "1px dashed #d9d9d9",
              borderRadius: 10,
            }}
          >
            <Paragraph type="secondary">No purchased licenses found.</Paragraph>
            <Button type="primary" onClick={() => navigate("/company/pricing")}>
              View Plans
            </Button>
          </div>
        ) : (
          groups.map((group) => (
            <LicenseGroup
              key={group.tier}
              group={group}
              onRenew={(tier) => navigate(`/company/renew`)}
            />
          ))
        )}
      </div>
    </>
  );
}
