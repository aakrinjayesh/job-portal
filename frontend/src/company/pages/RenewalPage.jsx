import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Typography,
  Divider,
  Select,
  Segmented,
  Tag,
  Spin,
  Checkbox,
  message,
  Result,
} from "antd";
import {
  UserOutlined,
  CheckCircleFilled,
  ReloadOutlined,
  CloseCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getRenewalInfo,
  createRenewalOrder,
  verifyRenewalPayment,
} from "../api/api";
import { loadRazorpay } from "../../utils/loadRazorpay";

const { Title, Text, Paragraph } = Typography;

const GST_RATE = 0.18;

const COUNTRY_OPTIONS = [
  { value: "IN", label: "🇮🇳 India" },
  { value: "US", label: "🇺🇸 United States" },
  { value: "UK", label: "🇬🇧 United Kingdom" },
  { value: "AU", label: "🇦🇺 Australia" },
  { value: "SG", label: "🇸🇬 Singapore" },
];

// Color per plan tier for the badge
const PLAN_TAG_COLOR = {
  BASIC: "default",
  PROFESSIONAL: "blue",
  ORGANIZATION: "purple",
};

export default function RenewalPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [data, setData] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [country, setCountry] = useState("IN");

  useEffect(() => {
    (async () => {
      try {
        const res = await getRenewalInfo();
        if (res.status === "success") {
          setData(res.data);
          setBillingCycle(res.data.billingCycle?.toLowerCase() || "monthly");
          // Default: all licenses selected
          setSelectedIds(new Set(res.data.licenses.map((l) => l.id)));
        }
      } catch (err) {
        const msg = err?.response?.data?.message || "";
        // Detect admin-only rejection from the backend
        if (
          err?.response?.status === 403 ||
          msg.toLowerCase().includes("admin") ||
          msg.toLowerCase().includes("only organization")
        ) {
          setAccessDenied(true);
        } else {
          messageApi.error(msg || "Failed to load renewal info");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Derived pricing — each license has its own plan price ─────────────────

  const isIndia = country === "IN";

  const getLicensePrice = useCallback(
    (license) =>
      billingCycle === "monthly"
        ? license.plan.monthlyPrice
        : license.plan.yearlyPrice,
    [billingCycle],
  );

  // Only selected licenses contribute to the total
  const selectedLicenses = data
    ? data.licenses.filter((l) => selectedIds.has(l.id))
    : [];

  const subtotal = selectedLicenses.reduce(
    (sum, l) => sum + getLicensePrice(l),
    0,
  );
  const tax = isIndia ? Math.round(subtotal * GST_RATE) : 0;
  const total = subtotal + tax;
  const quantity = selectedIds.size;

  // ── Selection helpers ─────────────────────────────────────────────────────

  const toggleLicense = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Sort: assigned first
  const sortedLicenses = data
    ? [
        ...data.licenses.filter((l) => l.assignedTo),
        ...data.licenses.filter((l) => !l.assignedTo),
      ]
    : [];

  const allSelected = data && selectedIds.size === data.licenses.length;
  const noneSelected = selectedIds.size === 0;

  // Earliest expiry for the header subtitle
  const earliestExpiry = data?.licenses?.length
    ? new Date(
        Math.min(...data.licenses.map((l) => new Date(l.validUntil).getTime())),
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  // ── Payment ───────────────────────────────────────────────────────────────

  const handlePay = async () => {
    if (quantity === 0) {
      messageApi.warning("Please select at least one license to renew.");
      return;
    }

    setPaying(true);
    try {
      const order = await createRenewalOrder({
        licenseIds: [...selectedIds],
        billingCycle,
        country,
      });

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay SDK failed to load");

      const options = {
        key: order.key,
        order_id: order.orderId,
        name: "ForceHead",
        description: `License Renewal — ${quantity} seat${quantity > 1 ? "s" : ""}`,
        handler: async (response) => {
          try {
            await verifyRenewalPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              invoiceId: order.invoiceId,
            });
            messageApi.success("Renewal successful! Licenses updated.");
            setTimeout(() => navigate("/company/settings"), 1200);
          } catch {
            messageApi.error("Payment verification failed. Contact support.");
          }
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      messageApi.error(
        err?.response?.data?.message || "Failed to initiate payment",
      );
    } finally {
      setPaying(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div style={{ maxWidth: 520, margin: "80px auto", padding: "0 24px" }}>
        <Result
          icon={<LockOutlined style={{ color: "#1677ff" }} />}
          title="Admin Access Required"
          subTitle="Only your organization admin can manage license renewals. Please contact your admin to renew or update your subscription."
          extra={[
            <Button
              key="dashboard"
              type="primary"
              onClick={() => navigate("/company/jobs")}
            >
              Go to Dashboard
            </Button>,
            <Button
              key="settings"
              onClick={() => navigate("/company/settings")}
            >
              View Settings
            </Button>,
          ]}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Paragraph type="secondary">No active licenses found.</Paragraph>
        <Button type="primary" onClick={() => navigate("/company/pricing")}>
          View Plans
        </Button>
      </div>
    );
  }

  return (
    <>
      {contextHolder}

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0 }}>
            Renew Your Licenses
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 6 }}>
            {data.currentLicenseCount} active seat
            {data.currentLicenseCount > 1 ? "s" : ""} across multiple plans
            &nbsp;·&nbsp; Earliest expiry <Text strong>{earliestExpiry}</Text>
          </Paragraph>
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* ── Left: Billing cycle + License selector ── */}
          <div style={{ flex: 1, minWidth: 340 }}>
            {/* Billing cycle */}
            <Card style={{ borderRadius: 12, marginBottom: 20 }}>
              <Text strong style={{ display: "block", marginBottom: 12 }}>
                Billing Cycle
              </Text>
              <Segmented
                block
                value={billingCycle}
                onChange={setBillingCycle}
                options={[
                  { label: "Monthly", value: "monthly" },
                  { label: "Yearly (Save 17%)", value: "yearly" },
                ]}
              />
            </Card>

            {/* License selector */}
            <Card style={{ borderRadius: 12 }}>
              {/* Card header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <div>
                  <Text strong>Choose Seats to Renew</Text>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, display: "block", marginTop: 2 }}
                  >
                    Uncheck any seats you don't want to renew — they'll expire
                    naturally.
                  </Text>
                </div>
              </div>

              {/* License rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sortedLicenses.map((license) => {
                  const checked = selectedIds.has(license.id);
                  const price = getLicensePrice(license);
                  const isFree = price === 0;

                  return (
                    <div
                      key={license.id}
                      onClick={() => toggleLicense(license.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        borderRadius: 8,
                        border: `1px solid ${checked ? "#1677ff" : "#d9d9d9"}`,
                        background: checked ? "#e6f4ff" : "transparent",
                        cursor: "pointer",
                        transition: "border-color 0.15s, background 0.15s",
                        userSelect: "none",
                      }}
                    >
                      {/* Checkbox */}
                      <Checkbox
                        checked={checked}
                        onChange={() => toggleLicense(license.id)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Avatar */}
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: license.assignedTo
                            ? "#1677ff1a"
                            : "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <UserOutlined
                          style={{
                            color: license.assignedTo ? "#1677ff" : "#bfbfbf",
                            fontSize: 14,
                          }}
                        />
                      </div>

                      {/* Name / email + plan badge */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {license.assignedTo ? (
                          <>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                flexWrap: "wrap",
                              }}
                            >
                              <Text
                                strong
                                style={{
                                  fontSize: 13,
                                  color: checked ? "#003eb3" : undefined,
                                }}
                              >
                                {license.assignedTo.name}
                              </Text>
                              <Tag
                                color={
                                  PLAN_TAG_COLOR[license.plan.tier] || "default"
                                }
                                style={{ fontSize: 11, margin: 0 }}
                              >
                                {license.plan.name}
                              </Tag>
                            </div>
                            <Text
                              type="secondary"
                              style={{
                                fontSize: 12,
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {license.assignedTo.email}
                            </Text>
                          </>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              Unassigned seat
                            </Text>
                            <Tag
                              color={
                                PLAN_TAG_COLOR[license.plan.tier] || "default"
                              }
                              style={{ fontSize: 11, margin: 0 }}
                            >
                              {license.plan.name}
                            </Tag>
                          </div>
                        )}

                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Expires{" "}
                          {new Date(license.validUntil).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </Text>
                      </div>

                      {/* Per-seat price */}
                      <div
                        style={{
                          textAlign: "right",
                          flexShrink: 0,
                          minWidth: 64,
                        }}
                      >
                        {isFree ? (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Free
                          </Text>
                        ) : (
                          <>
                            <Text
                              strong
                              style={{
                                fontSize: 13,
                                color: checked ? "#003eb3" : undefined,
                                display: "block",
                              }}
                            >
                              ₹{price.toLocaleString()}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              /{billingCycle === "monthly" ? "mo" : "yr"}
                            </Text>
                          </>
                        )}
                      </div>

                      {/* Status tag */}
                      {checked ? (
                        <Tag
                          color="success"
                          icon={<CheckCircleFilled />}
                          style={{ flexShrink: 0, margin: 0 }}
                        >
                          Renewing
                        </Tag>
                      ) : (
                        <Tag
                          color="default"
                          icon={<CloseCircleOutlined />}
                          style={{ flexShrink: 0, margin: 0 }}
                        >
                          Will expire
                        </Tag>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Warning: some seats deselected */}
              {quantity > 0 && quantity < data.currentLicenseCount && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "8px 12px",
                    background: "#fffbe6",
                    border: "1px solid #ffe58f",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#92400e",
                  }}
                >
                  {data.currentLicenseCount - quantity} seat
                  {data.currentLicenseCount - quantity > 1 ? "s" : ""} will not
                  be renewed and will expire on their respective dates.
                </div>
              )}

              {/* Warning: nothing selected */}
              {noneSelected && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "8px 12px",
                    background: "#fff2f0",
                    border: "1px solid #ffccc7",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#a8071a",
                  }}
                >
                  No seats selected. Please select at least one seat to renew.
                </div>
              )}
            </Card>
          </div>

          {/* ── Right: Summary ── */}
          <div style={{ width: 300, flexShrink: 0 }}>
            <Card style={{ borderRadius: 12, position: "sticky", top: 24 }}>
              <Title level={5} style={{ margin: "0 0 16px" }}>
                Renewal Summary
              </Title>

              {/* Per-license line items */}
              {selectedLicenses.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  {selectedLicenses.map((license) => {
                    const price = getLicensePrice(license);
                    return (
                      <div
                        key={license.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            style={{
                              fontSize: 13,
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {license.assignedTo
                              ? license.assignedTo.name
                              : "Unassigned seat"}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {license.plan.name} plan
                          </Text>
                        </div>
                        <Text style={{ fontSize: 13, flexShrink: 0 }}>
                          {price === 0 ? (
                            <Text type="secondary">Free</Text>
                          ) : (
                            `₹${price.toLocaleString()}`
                          )}
                        </Text>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Text
                  type="secondary"
                  style={{
                    fontSize: 13,
                    display: "block",
                    marginBottom: 12,
                    fontStyle: "italic",
                  }}
                >
                  No seats selected
                </Text>
              )}

              {/* Billing cycle */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Billing
                </Text>
                <Text style={{ fontSize: 12, textTransform: "capitalize" }}>
                  {billingCycle}
                </Text>
              </div>

              <Divider style={{ margin: "10px 0" }} />

              {/* Subtotal */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Text>Subtotal</Text>
                <Text>₹{subtotal.toLocaleString()}</Text>
              </div>

              {/* Tax */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Text>Tax {isIndia ? "18% (GST)" : "(exempt)"}</Text>
                <Text>₹{tax.toLocaleString()}</Text>
              </div>

              {/* Country selector */}
              <div style={{ marginBottom: 16 }}>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block", marginBottom: 6 }}
                >
                  Billing Country
                </Text>
                <Select
                  value={country}
                  onChange={setCountry}
                  style={{ width: "100%" }}
                  options={COUNTRY_OPTIONS}
                />
              </div>

              <Divider style={{ margin: "0 0 16px" }} />

              {/* Total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <Text strong style={{ fontSize: 16 }}>
                  Total due today
                </Text>
                <Text strong style={{ fontSize: 16 }}>
                  ₹{total.toLocaleString()}
                </Text>
              </div>

              <Button
                type="primary"
                block
                size="large"
                icon={<ReloadOutlined />}
                loading={paying}
                disabled={noneSelected}
                onClick={handlePay}
              >
                {noneSelected
                  ? "Pay & Renew"
                  : `Pay & Renew ${quantity} Seat${quantity > 1 ? "s" : ""}`}
              </Button>

              <Text
                type="secondary"
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: 10,
                  fontSize: 12,
                }}
              >
                Secure Razorpay checkout · Currency: INR
              </Text>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
