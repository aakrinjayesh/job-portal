// import {
//   Card,
//   Row,
//   Col,
//   Button,
//   Typography,
//   Badge,
//   InputNumber,
//   Divider,
//   Space,
//   Tooltip,
//   message,
//   Segmented,
// } from "antd";
// import {
//   InfoCircleOutlined,
//   CheckCircleFilled,
//   RocketOutlined,
//   TeamOutlined,
//   GlobalOutlined,
// } from "@ant-design/icons";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   getSubscriptionPlans,
//   createInvoice,
//   createRazorpayOrder,
//   verifyRazorpayPayment,
// } from "../company/api/api";
// import { loadRazorpay } from "../utils/loadRazorpay";

// const { Title, Text, Paragraph } = Typography;

// /* ===================== CONSTANTS ===================== */

// const GST_RATE = 0.18;

// const FEATURE_LABELS = {
//   JOB_POST_CREATION: "Job Posts",
//   CANDIDATE_DETAILS_VIEW: "Candidate Views",
//   JOB_APPLICATIONS: "Applications",
//   AI_TOKENS_TOTAL: "AI Tokens",
//   TEAM_MEMBERS: "Team Members",
// };

// const PLAN_ICONS = {
//   BASIC: <RocketOutlined />,
//   PROFESSIONAL: <TeamOutlined />,
//   ORGANIZATION: <GlobalOutlined />,
// };

// /* ===================== COMPONENT ===================== */

// export default function PricingPage() {
//   const navigate = useNavigate();
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [quantities, setQuantities] = useState({});
//   const [billingCycle, setBillingCycle] = useState("monthly");

//   /* ===================== FETCH PLANS ===================== */

//   useEffect(() => {
//     getSubscriptionPlans()
//       .then((data) => {
//         setPlans(data);
//         const initial = {};
//         data.forEach((p) => (initial[p.tier] = 1));
//         setQuantities(initial);
//       })
//       .catch(() => message.error("Failed to load plans"));
//   }, []);

//   /* ===================== HELPERS ===================== */

//   const calculateBasePrice = (plan) => {
//     const qty = quantities[plan.tier] || 1;
//     return billingCycle === "monthly"
//       ? plan.monthlyPrice * qty
//       : plan.yearlyPrice * qty;
//   };

//   const calculateGST = (price) => Math.round(price * GST_RATE);

//   const calculateTotal = (price) => price + calculateGST(price);

//   const monthlyEquivalent = (plan) => {
//     const qty = quantities[plan.tier] || 1;
//     if (billingCycle === "yearly" && plan.yearlyPrice > 0) {
//       return Math.round((plan.yearlyPrice / 12) * qty);
//     }
//     return plan.monthlyPrice * qty;
//   };

//   const savingsPercent = (plan) => {
//     if (billingCycle !== "yearly") return 0;
//     const monthlyCost = plan.monthlyPrice * 12;
//     return Math.round(((monthlyCost - plan.yearlyPrice) / monthlyCost) * 100);
//   };

//   const groupFeatures = (features) => {
//     const grouped = {};
//     features.forEach((f) => {
//       if (!grouped[f.feature]) grouped[f.feature] = [];
//       grouped[f.feature].push(f);
//     });
//     return grouped;
//   };

//   const formatFeatureValue = (f) => {
//     const value = f.maxAllowed === -1 ? "Unlimited" : f.maxAllowed;
//     const period =
//       f.period === "MONTHLY"
//         ? "/month"
//         : f.period === "DAILY"
//           ? "/day"
//           : "/year";
//     return `${value} ${period}`;
//   };

//   /* ===================== PURCHASE FLOW ===================== */

//   const handlePurchase = async (plan) => {
//     console.log("plan", plan);
//     if (plan.tier === "BASIC") {
//       navigate("/company/dashboard");
//       return;
//     }

//     try {
//       setLoading(true);

//       const quantity = quantities[plan.tier];

//       const invoice = await createInvoice({
//         planTier: plan.tier,
//         quantity,
//         billingCycle,
//       });

//       const order = await createRazorpayOrder(invoice.invoiceId);

//       const loaded = await loadRazorpay();
//       if (!loaded) throw new Error("Razorpay SDK failed");

//       const options = {
//         key: order.key,
//         order_id: order.orderId,
//         amount: order.amount,
//         currency: order.currency,
//         name: "Aakrin",
//         description: `${plan.name} Plan`,
//         handler: async (response) => {
//           await verifyRazorpayPayment({
//             ...response,
//             invoiceId: invoice.invoiceId,
//             planTier: plan.tier,
//             quantity,
//           });
//           message.success("Payment successful");
//           navigate("/company/dashboard");
//         },
//       };

//       new window.Razorpay(options).open();
//     } catch (err) {
//       console.error(err);
//       message.error("Payment failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ===================== RENDER ===================== */

//   return (
//     <div style={{ padding: "64px 24px", background: "#f5f5f5" }}>
//       <div style={{ maxWidth: 1200, margin: "0 auto" }}>
//         {/* HEADER */}
//         <div style={{ textAlign: "center", marginBottom: 48 }}>
//           <Title level={1}>Choose Your Perfect Plan</Title>
//           <Paragraph style={{ fontSize: 18, color: "#666" }}>
//             Transparent pricing. No hidden charges. GST included.
//           </Paragraph>

//           <Space size="middle">
//             <Text strong>Billing:</Text>
//             <Segmented
//               size="large"
//               value={billingCycle}
//               onChange={setBillingCycle}
//               options={[
//                 { label: "Monthly", value: "monthly" },
//                 {
//                   label: (
//                     <span>
//                       Yearly{" "}
//                       <Badge
//                         count="Save 17%"
//                         style={{
//                           backgroundColor: "#52c41a",
//                           marginLeft: 6,
//                           fontSize: 10,
//                         }}
//                       />
//                     </span>
//                   ),
//                   value: "yearly",
//                 },
//               ]}
//             />
//           </Space>
//         </div>

//         {/* PLANS */}
//         <Row gutter={[24, 24]} justify="center">
//           {plans.map((plan) => {
//             const base = calculateBasePrice(plan);
//             const total = calculateTotal(base);
//             const grouped = groupFeatures(plan.features);
//             const popular = plan.tier === "PROFESSIONAL";

//             return (
//               <Col xs={24} lg={8} key={plan.tier}>
//                 <Badge.Ribbon
//                   text="Most Popular"
//                   color="#1677ff"
//                   style={{ display: popular ? "block" : "none" }}
//                 >
//                   <Card
//                     hoverable
//                     style={{
//                       borderRadius: 12,
//                       border: popular
//                         ? "2px solid #1677ff"
//                         : "1px solid #d9d9d9",
//                     }}
//                   >
//                     {/* PLAN HEADER */}
//                     <div style={{ textAlign: "center" }}>
//                       <div style={{ fontSize: 32, marginBottom: 12 }}>
//                         {PLAN_ICONS[plan.tier]}
//                       </div>
//                       <Title level={3}>{plan.name}</Title>
//                     </div>

//                     {/* PRICE */}
//                     <div style={{ textAlign: "center", marginTop: 16 }}>
//                       <Title level={2}>
//                         ₹{total.toLocaleString()}
//                         <Text type="secondary" style={{ fontSize: 14 }}>
//                           {plan.tier !== "BASIC" && ` / user / ${billingCycle}`}
//                         </Text>
//                       </Title>

//                       <Text type="secondary" style={{ fontSize: 13 }}>
//                         Base ₹{base.toLocaleString()} + GST (18%) ₹
//                         {calculateGST(base).toLocaleString()}
//                       </Text>

//                       {billingCycle === "yearly" && (
//                         <Text
//                           type="success"
//                           style={{ display: "block", fontSize: 13 }}
//                         >
//                           Save {savingsPercent(plan)}% • ₹
//                           {monthlyEquivalent(plan).toLocaleString()} / month
//                         </Text>
//                       )}
//                     </div>

//                     <Divider />

//                     {/* FEATURES */}
//                     <Space direction="vertical" size={14}>
//                       {Object.entries(grouped).map(([key, list]) => (
//                         <Space key={key} align="start">
//                           <CheckCircleFilled style={{ color: "#52c41a" }} />
//                           <div>
//                             <Text strong>{FEATURE_LABELS[key] || key}</Text>
//                             <div style={{ fontSize: 13, color: "#666" }}>
//                               {list.map(formatFeatureValue).join(" • ")}
//                             </div>
//                           </div>
//                         </Space>
//                       ))}
//                     </Space>

//                     {/* USERS */}
//                     {plan.tier !== "BASIC" && (
//                       <>
//                         <Divider />
//                         <Text strong>
//                           Users{" "}
//                           <Tooltip title="One license per team member">
//                             <InfoCircleOutlined />
//                           </Tooltip>
//                         </Text>
//                         <InputNumber
//                           min={1}
//                           max={100}
//                           value={quantities[plan.tier]}
//                           onChange={(v) =>
//                             setQuantities((p) => ({
//                               ...p,
//                               [plan.tier]: v,
//                             }))
//                           }
//                           style={{ width: "100%", marginTop: 8 }}
//                           size="large"
//                         />
//                       </>
//                     )}

//                     {/* CTA */}
//                     <Button
//                       type={popular ? "primary" : "default"}
//                       block
//                       size="large"
//                       loading={loading}
//                       style={{ marginTop: 24 }}
//                       onClick={() => handlePurchase(plan)}
//                     >
//                       {plan.tier === "BASIC"
//                         ? "Continue Free"
//                         : `Pay ₹${total.toLocaleString()}`}
//                     </Button>

//                     <Text
//                       type="secondary"
//                       style={{
//                         display: "block",
//                         textAlign: "center",
//                         marginTop: 8,
//                         fontSize: 12,
//                       }}
//                     >
//                       Secure Razorpay checkout • GST included
//                     </Text>
//                   </Card>
//                 </Badge.Ribbon>
//               </Col>
//             );
//           })}
//         </Row>
//       </div>
//     </div>
//   );
// }

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
  message,
  Spin,
} from "antd";
import {
  InfoCircleOutlined,
  CheckCircleFilled,
  RocketOutlined,
  TeamOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSubscriptionPlans,
  createInvoice,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../company/api/api";
import { loadRazorpay } from "../utils/loadRazorpay";

const { Title, Text, Paragraph } = Typography;

const GST_RATE = 0.18;

const FEATURE_LABELS = {
  JOB_POST_CREATION: "Job Posts",
  CANDIDATE_DETAILS_VIEW: "Candidate Views",
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

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [billingCycle, setBillingCycle] = useState("monthly");

  /* ===================== FETCH PLANS ===================== */

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getSubscriptionPlans();
        setPlans(data);

        const initial = {};
        data.forEach((p) => (initial[p.tier] = 1));
        setQuantities(initial);
      } catch (err) {
        messageApi.error("Failed to load plans");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPlans();
  }, []);

  /* ===================== HELPERS ===================== */

  const calculateBasePrice = (plan) => {
    const qty = quantities[plan.tier] || 1;
    return billingCycle === "monthly"
      ? plan.monthlyPrice * qty
      : plan.yearlyPrice * qty;
  };

  const calculateGST = (price) => Math.round(price * GST_RATE);

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

  /* ===================== PURCHASE FLOW ===================== */

  const handlePurchase = async (plan) => {
    if (plan.tier === "BASIC") {
      setRedirecting(true);
      navigate("/company/dashboard");
      return;
    }

    try {
      setLoading(true);

      const quantity = quantities[plan.tier];

      const invoice = await createInvoice({
        planTier: plan.tier,
        quantity,
        billingCycle,
      });

      const order = await createRazorpayOrder(invoice.invoiceId);

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay SDK failed");

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
            navigate("/company/dashboard");
          }, 800);
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      messageApi.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== INITIAL LOADING ===================== */

  if (initialLoading) {
    return (
      <>
        {contextHolder}
        <div
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f5f5",
          }}
        >
          <Spin />
          {/* <Text style={{ marginTop: 20 }}>Loading Plans...</Text> */}
        </div>
      </>
    );
  }

  /* ===================== RENDER ===================== */

  return (
    <>
      {contextHolder}

      {/* Redirect Overlay */}
      {redirecting && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Spin />
        </div>
      )}

      <div style={{ padding: "64px 24px", background: "#f5f5f5" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* HEADER */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Title level={1}>Choose Your Perfect Plan</Title>
            <Paragraph style={{ fontSize: 18, color: "#666" }}>
              Transparent pricing. No hidden charges. GST included.
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

                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Base ₹{base.toLocaleString()} + GST ₹
                          {calculateGST(base).toLocaleString()}
                        </Text>

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
                              <div
                                style={{
                                  fontSize: 13,
                                  color: "#666",
                                }}
                              >
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
                              setQuantities((p) => ({
                                ...p,
                                [plan.tier]: v,
                              }))
                            }
                            style={{
                              width: "100%",
                              marginTop: 8,
                            }}
                            size="large"
                          />
                        </>
                      )}

                      <Button
                        type={popular ? "primary" : "default"}
                        block
                        size="large"
                        loading={loading}
                        style={{ marginTop: 24 }}
                        onClick={() => handlePurchase(plan)}
                      >
                        {plan.tier === "BASIC"
                          ? "Continue Free"
                          : `Pay ₹${total.toLocaleString()}`}
                      </Button>

                      <Text
                        type="secondary"
                        style={{
                          display: "block",
                          textAlign: "center",
                          marginTop: 8,
                          fontSize: 12,
                        }}
                      >
                        Secure Razorpay checkout • GST included
                      </Text>
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
