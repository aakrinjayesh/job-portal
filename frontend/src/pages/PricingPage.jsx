import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Badge,
  InputNumber,
  Divider,
  Space,
  Tooltip,
  Segmented,
  Select,
  Modal,
  message,
  Progress,
} from "antd";
import {
  InfoCircleOutlined,
  CheckCircleFilled,
  RocketOutlined,
  TeamOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getSubscriptionPlans,
  createInvoice,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../company/api/api";
import { loadRazorpay } from "../utils/loadRazorpay";

const { Title, Text, Paragraph } = Typography;

const GST_RATE = 0.18;

const COUNTRY_OPTIONS = [
  { value: "IN", label: "🇮🇳 India" },
  { value: "US", label: "🇺🇸 United States" },
  { value: "UK", label: "🇬🇧 United Kingdom" },
  { value: "AU", label: "🇦🇺 Australia" },
  { value: "SG", label: "🇸🇬 Singapore" },
];

const FEATURE_LABELS = {
  APPLY_BENCH_TO_JOB: "Apply Bench",
  CANDIDATE_PROFILE_VIEWS: "Candidate Views",
  JOB_POST_CREATION: "Job Creation",
  RESUME_EXTRACTION: "Resume Extract",
  JD_EXTRACTION: "Job Extract",
  AI_FIT_SCORE: "Fit Score",
  FIND_CANDIDATE_SEARCH: "Candidate Search",
  FIND_JOB_SEARCH: "Job Search",
  JOB_APPLICATIONS: "Applications",
  AI_TOKENS_TOTAL: "AI Tokens",
  TEAM_MEMBERS: "Team Members",
};

const PLAN_ICONS = {
  BASIC: <RocketOutlined />,
  PROFESSIONAL: <TeamOutlined />,
  ORGANIZATION: <GlobalOutlined />,
};

export default function PricingPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const location = useLocation();

  const redirectUrl = location?.state?.redirect;

  const [plans, setPlans] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [country, setCountry] = useState();
  const [progress, setProgress] = useState(0);
  const [readyToShow, setReadyToShow] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, plan: null });
  const [showLoginModal, setShowLoginModal] = useState(false);

  /* ===================== FETCH PLANS ===================== */

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setInitialLoading(true);
        setProgress(10);

        const interval = setInterval(() => {
          setProgress((prev) => (prev < 90 ? prev + 5 : prev));
        }, 300);

        const data = await getSubscriptionPlans();
        setPlans(data);

        const initial = {};
        data.forEach((p) => (initial[p.tier] = 1));
        setQuantities(initial);

        clearInterval(interval);
        setProgress(100);

        setTimeout(() => {
          setInitialLoading(false);
          setReadyToShow(true);
          setProgress(0);
        }, 250);
      } catch (err) {
        messageApi.error("Failed to load plans");
        setInitialLoading(false);
      }
    };

    fetchPlans();
  }, []);

  /* ===================== HELPERS ===================== */

  const isIndia = country === "IN";

  const calculateBasePrice = (plan) => {
    const qty = quantities[plan.tier] || 1;
    return billingCycle === "monthly"
      ? plan.monthlyPrice * qty
      : plan.yearlyPrice * qty;
  };

  const calculateGST = (price) => (isIndia ? Math.round(price * GST_RATE) : 0);

  const calculateTotal = (price) => price + calculateGST(price);

  const monthlyEquivalent = (plan) => {
    const qty = quantities[plan.tier] || 1;
    if (billingCycle === "yearly" && plan.yearlyPrice > 0) {
      return Math.round((plan.yearlyPrice / 12) * qty);
    }
    return plan.monthlyPrice * qty;
  };

  const savingsPercent = (plan) => {
    if (billingCycle !== "yearly") return 0;
    const monthlyCost = plan.monthlyPrice * 12;
    return Math.round(((monthlyCost - plan.yearlyPrice) / monthlyCost) * 100);
  };

  const groupFeatures = (features) => {
    const grouped = {};
    features.forEach((f) => {
      if (!grouped[f.feature]) grouped[f.feature] = [];
      grouped[f.feature].push(f);
    });
    return grouped;
  };

  const formatFeatureValue = (f) => {
    const value = f.maxAllowed === -1 ? "Unlimited" : f.maxAllowed;
    const period =
      f.period === "MONTHLY"
        ? "/month"
        : f.period === "DAILY"
          ? "/day"
          : "/year";
    return `${value} ${period}`;
  };

  const handlePurchase = (plan) => {
    if (plan.tier === "BASIC") {
      setRedirecting(true);
      navigate(redirectUrl ? redirectUrl : "/company/jobs");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    setConfirmModal({ open: true, plan });
  };

  // do not remove this comment this is for autopay for later

  // const handleConfirmPay = async () => {
  //   const plan = confirmModal.plan;
  //   try {
  //     setLoadingPlan(plan.tier);

  //     const quantity = quantities[plan.tier];

  //     const invoice = await createInvoice({
  //       planTier: plan.tier,
  //       quantity,
  //       billingCycle,
  //       country,
  //     });

  //     const subscription = await createRazorpaySubscription(invoice.invoiceId);

  //     const loaded = await loadRazorpay();
  //     if (!loaded) throw new Error("Razorpay SDK failed");

  //     setConfirmModal({ open: false, plan: null });

  //     const options = {
  //       key: subscription.key,
  //       subscription_id: subscription.subscriptionId,
  //       name: "ForceHead",
  //       description: `${plan.name} Plan`,
  //       handler: async (response) => {
  //         setRedirecting(true);
  //         await verifyRazorpaySubscriptionPayment({
  //           razorpay_payment_id: response.razorpay_payment_id,
  //           razorpay_subscription_id: response.razorpay_subscription_id,
  //           razorpay_signature: response.razorpay_signature,
  //           invoiceId: invoice.invoiceId,
  //         });
  //         messageApi.success("Payment successful 🎉");
  //         setTimeout(() => navigate("/company/jobs"), 800);
  //       },
  //     };

  //     new window.Razorpay(options).open();
  //   } catch (err) {
  //     console.error(err);
  //     messageApi.error(
  //       err?.response?.data?.error || "Payment failed. Please try again.",
  //     );
  //   } finally {
  //     setLoadingPlan(null);
  //   }
  // };

  const handleConfirmPay = async () => {
    const plan = confirmModal.plan;
    try {
      setLoadingPlan(plan.tier);

      const quantity = quantities[plan.tier];

      const invoice = await createInvoice({
        planTier: plan.tier,
        quantity,
        billingCycle,
        country,
      });

      const order = await createRazorpayOrder(invoice.invoiceId);

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay SDK failed");

      setConfirmModal({ open: false, plan: null });

      const options = {
        key: order.key,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "Aakrin",
        description: `${plan.name} Plan`,
        handler: async (response) => {
          setRedirecting(true);

          await verifyRazorpayPayment({
            ...response,
            invoiceId: invoice.invoiceId,
          });

          messageApi.success("Payment successful 🎉");

          setTimeout(() => {
            navigate("/company/jobs");
          }, 800);
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      messageApi.error(
        err?.response?.data?.error || "Payment failed. Please try again.",
      );
    } finally {
      setLoadingPlan(null);
    }
  };

  /* ===================== INITIAL LOADING ===================== */

  if (!readyToShow) {
    return (
      <>
        {contextHolder}
        <div
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "#f5f5f5",
          }}
        >
          <Progress
            type="circle"
            percent={progress}
            width={110}
            strokeColor={{ "0%": "#4F63F6", "100%": "#7C8CFF" }}
            trailColor="#E6E8FF"
            showInfo={false}
          />
          <div
            style={{
              marginTop: 16,
              color: "#555",
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            Loading subscription plans…
          </div>
        </div>
      </>
    );
  }

  /* ===================== CONFIRM MODAL ===================== */

  const ConfirmModal = () => {
    const plan = confirmModal.plan;
    if (!plan) return null;

    const qty = quantities[plan.tier] || 1;
    const base =
      billingCycle === "monthly"
        ? plan.monthlyPrice * qty
        : plan.yearlyPrice * qty;
    const gst = isIndia ? Math.round(base * GST_RATE) : 0;
    const total = base + gst;

    return (
      <Modal
        title={
          <Text strong style={{ fontSize: 16 }}>
            Confirm Plan Changes
          </Text>
        }
        open={confirmModal.open}
        onCancel={() => setConfirmModal({ open: false, plan: null })}
        footer={null}
        width={420}
        centered
      >
        {/* Plan name + total */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 4,
          }}
        >
          <div>
            <Text strong style={{ fontSize: 15 }}>
              {plan.name} Plan
            </Text>
            <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
              Billed {billingCycle}, starting today
            </div>
          </div>
          <Text strong style={{ fontSize: 15 }}>
            ₹{total.toLocaleString()}
          </Text>
        </div>

        <Divider style={{ margin: "16px 0" }} />

        {/* Subtotal */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <Text>Subtotal</Text>
          <Text>₹{base.toLocaleString()}</Text>
        </div>

        {/* Tax */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text>Tax {isIndia ? "18% (GST)" : "(exempt)"}</Text>
          <Text>₹{gst.toLocaleString()}</Text>
        </div>

        <Divider style={{ margin: "16px 0" }} />

        {/* Total due */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Text strong style={{ fontSize: 15 }}>
            Total due today
          </Text>
          <Text strong style={{ fontSize: 15 }}>
            ₹{total.toLocaleString()}
          </Text>
        </div>

        {/* Country selector */}
        <div style={{ marginBottom: 20 }}>
          <Text
            type="secondary"
            style={{ fontSize: 13, display: "block", marginBottom: 6 }}
          >
            Billing Country
          </Text>
          <Select
            value={country}
            onChange={setCountry}
            status={!country ? "Please Select This Field" : ""}
            style={{ width: "100%" }}
            options={COUNTRY_OPTIONS}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            block
            size="large"
            onClick={() => setConfirmModal({ open: false, plan: null })}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            block
            disabled={!country}
            size="large"
            loading={loadingPlan === plan.tier}
            onClick={handleConfirmPay}
          >
            Pay now
          </Button>
        </div>

        <Text
          type="secondary"
          style={{
            display: "block",
            textAlign: "center",
            marginTop: 12,
            fontSize: 12,
          }}
        >
          Secure Razorpay checkout · Currency: INR
        </Text>
      </Modal>
    );
  };

  /* ===================== RENDER ===================== */

  return (
    <>
      {contextHolder}
      <ConfirmModal />

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

      {/* Redirect Overlay */}
      {redirecting && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        />
      )}

      <div style={{ padding: "64px 24px", background: "#f5f5f5" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* HEADER */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Title level={1}>Choose Your Perfect Plan</Title>
            <Paragraph style={{ fontSize: 18, color: "#666" }}>
              Transparent pricing. No hidden charges. GST applies for Indian
              billing.
            </Paragraph>

            <Space size="middle">
              <Text strong>Billing:</Text>
              <Segmented
                size="large"
                value={billingCycle}
                onChange={setBillingCycle}
                options={[
                  { label: "Monthly", value: "monthly" },
                  { label: "Yearly (Save 17%)", value: "yearly" },
                ]}
              />
            </Space>
          </div>

          {/* PLANS */}
          <Row gutter={[24, 24]} justify="center">
            {plans.map((plan) => {
              const base = calculateBasePrice(plan);
              const total = calculateTotal(base);
              const grouped = groupFeatures(plan.features);
              const popular = plan.tier === "PROFESSIONAL";

              return (
                <Col xs={24} lg={8} key={plan.tier}>
                  <Badge.Ribbon
                    text="Most Popular"
                    color="#1677ff"
                    style={{ display: popular ? "block" : "none" }}
                  >
                    <Card
                      hoverable
                      style={{
                        borderRadius: 12,
                        border: popular
                          ? "2px solid #1677ff"
                          : "1px solid #d9d9d9",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>
                          {PLAN_ICONS[plan.tier]}
                        </div>
                        <Title level={3}>{plan.name}</Title>
                      </div>

                      <div style={{ textAlign: "center", marginTop: 16 }}>
                        <Title level={2}>
                          ₹{total.toLocaleString()}
                          <Text type="secondary" style={{ fontSize: 14 }}>
                            {plan.tier !== "BASIC" &&
                              ` / user / ${billingCycle}`}
                          </Text>
                        </Title>

                        {billingCycle === "yearly" && (
                          <Text
                            type="success"
                            style={{ display: "block", fontSize: 13 }}
                          >
                            Save {savingsPercent(plan)}% • ₹
                            {monthlyEquivalent(plan).toLocaleString()} / month
                          </Text>
                        )}
                      </div>

                      <Divider />

                      <Space direction="vertical" size={14}>
                        {Object.entries(grouped).map(([key, list]) => (
                          <Space key={key} align="start">
                            <CheckCircleFilled style={{ color: "#52c41a" }} />
                            <div>
                              <Text strong>{FEATURE_LABELS[key] || key}</Text>
                              <div style={{ fontSize: 13, color: "#666" }}>
                                {list.map(formatFeatureValue).join(" • ")}
                              </div>
                            </div>
                          </Space>
                        ))}
                      </Space>

                      {plan.tier !== "BASIC" && (
                        <>
                          <Divider />
                          <Text strong>
                            Users{" "}
                            <Tooltip title="One license per team member">
                              <InfoCircleOutlined />
                            </Tooltip>
                          </Text>
                          <InputNumber
                            min={1}
                            max={100}
                            value={quantities[plan.tier]}
                            onChange={(v) =>
                              setQuantities((p) => ({ ...p, [plan.tier]: v }))
                            }
                            style={{ width: "100%", marginTop: 8 }}
                            size="large"
                          />
                        </>
                      )}

                      <Button
                        type={popular ? "primary" : "default"}
                        block
                        size="large"
                        loading={loadingPlan === plan.tier}
                        style={{ marginTop: 24 }}
                        onClick={() => handlePurchase(plan)}
                      >
                        {plan.tier === "BASIC"
                          ? "Continue Free"
                          : "Upgrade Plan"}
                      </Button>

                      {plan.tier !== "BASIC" && (
                        <Text
                          type="secondary"
                          style={{
                            display: "block",
                            textAlign: "center",
                            marginTop: 8,
                            fontSize: 12,
                          }}
                        >
                          Secure Razorpay checkout
                        </Text>
                      )}
                    </Card>
                  </Badge.Ribbon>
                </Col>
              );
            })}
          </Row>
        </div>
      </div>
    </>
  );
}
