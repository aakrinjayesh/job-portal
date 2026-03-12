import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Avatar,
  Spin,
  Tag,
  Divider,
  Tabs,
  Input,
  Card,
  Button,
  Typography,
  Row,
  Col,
  Empty,
  Tooltip,
  message,
} from "antd";
import {
  GlobalOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  InstagramOutlined,
  BuildOutlined,
  BankOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  UserOutlined,
  LinkOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { GetPublicCompanyProfileDetails } from "../company/api/api";
import { Modal } from "antd";

const { Text, Paragraph } = Typography;

const timeAgo = (iso) => {
  const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: ABOUT
// ─────────────────────────────────────────────────────────────────────────────
const AboutTab = ({ company }) => {
  const details = [
    { icon: <BuildOutlined />, label: "Industry", value: company.industry },
    {
      icon: <TeamOutlined />,
      label: "Company size",
      value: company.companySize ? `${company.companySize} employees` : null,
    },
    {
      icon: <CalendarOutlined />,
      label: "Founded",
      value: company.foundedYear,
    },
    {
      icon: <EnvironmentOutlined />,
      label: "Headquarters",
      value: company.headquarters,
    },
    {
      icon: <GlobalOutlined />,
      label: "Website",
      value: company.website,
      link: true,
    },
  ].filter((d) => d.value);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={16}>
        {/* Overview */}
        <Card title="Overview" size="small" style={{ marginBottom: 16 }}>
          <Paragraph style={{ margin: 0, color: "#374151", lineHeight: 1.7 }}>
            {company.description || "No description provided."}
          </Paragraph>
        </Card>

        {/* Specialties */}
        {company.specialties?.length > 0 && (
          <Card title="Specialties" size="small" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {company.specialties.map((s) => (
                <Tag
                  key={s}
                  color="blue"
                  style={{ borderRadius: 4, fontSize: 13, padding: "2px 10px" }}
                >
                  {s}
                </Tag>
              ))}
            </div>
          </Card>
        )}

        {/* Locations */}
        {company.locations?.length > 0 && (
          <Card title="Locations" size="small">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {company.locations.map((loc) => (
                <Tag
                  key={loc}
                  icon={<EnvironmentOutlined />}
                  style={{ borderRadius: 4, fontSize: 13, padding: "2px 10px" }}
                >
                  {loc}
                </Tag>
              ))}
            </div>
          </Card>
        )}
      </Col>

      <Col xs={24} md={8}>
        {/* Details sidebar */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {details.map(({ icon, label, value, link }) => (
              <div
                key={label}
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <span style={{ color: "#6B7280", fontSize: 16, marginTop: 2 }}>
                  {icon}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9CA3AF",
                      fontWeight: 500,
                      marginBottom: 2,
                    }}
                  >
                    {label}
                  </div>
                  {link ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 14,
                        color: "#1677ff",
                        wordBreak: "break-all",
                      }}
                    >
                      {value.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    <div
                      style={{
                        fontSize: 14,
                        color: "#111827",
                        fontWeight: 500,
                      }}
                    >
                      {value}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Social links */}
        {(company.socialLinks?.linkedin ||
          company.socialLinks?.twitter ||
          company.socialLinks?.instagram) && (
          <Card title="Connect" size="small">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {company.socialLinks?.linkedin && (
                <a
                  href={company.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#0A66C2",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <LinkedinOutlined style={{ fontSize: 18 }} /> LinkedIn
                </a>
              )}
              {company.socialLinks?.twitter && (
                <a
                  href={company.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#1DA1F2",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <TwitterOutlined style={{ fontSize: 18 }} /> Twitter / X
                </a>
              )}
              {company.socialLinks?.instagram && (
                <a
                  href={company.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#E1306C",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <InstagramOutlined style={{ fontSize: 18 }} /> Instagram
                </a>
              )}
            </div>
          </Card>
        )}
      </Col>
    </Row>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: PEOPLE
// ─────────────────────────────────────────────────────────────────────────────
const PeopleTab = ({ members = [], navigate, clickable = true }) => {
  const formatRole = (role) => {
    if (role === "COMPANY_ADMIN") return "Company Admin";
    if (role === "COMPANY_USER") return "Company User";
    return role;
  };

  const safeValue = (val) => {
    if (!val || val === "" || val === "null" || val === "undefined") {
      return "N/A";
    }
    return val;
  };

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) || m.role?.toLowerCase().includes(q),
    );
  }, [search, members]);

  return (
    <div>
      <Input
        prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
        placeholder="Search by name or role…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ marginBottom: 16, maxWidth: 360 }}
      />

      {filtered.length === 0 ? (
        <Empty description="No people found" />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((person) => (
            <Col xs={24} sm={12} md={8} key={person.id}>
              <Card
                size="small"
                hoverable={clickable}
                onClick={
                  clickable
                    ? () => navigate?.(`/company/candidate/${person.id}`)
                    : undefined
                }
                style={{
                  borderRadius: 8,
                  cursor: clickable ? "pointer" : "default",
                  height: 180,
                }}
                bodyStyle={{ padding: 16 }}
              >
                {/* Mini cover strip */}
                <div
                  style={{
                    height: 48,
                    margin: "-16px -16px 12px",
                    background: "linear-gradient(135deg, #e6f4ff, #bae0ff)",
                    borderRadius: "8px 8px 0 0",
                  }}
                />

                <div style={{ textAlign: "center" }}>
                  <Avatar
                    size={56}
                    src={person.profileUrl}
                    icon={<UserOutlined />}
                    style={{
                      marginTop: -28,
                      border: "3px solid #fff",
                      background: "#e6f4ff",
                      color: "#1677ff",
                      fontSize: 22,
                    }}
                  />
                  <div
                    style={{
                      marginTop: 8,
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#111827",
                    }}
                  >
                    {safeValue(person.name)}
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                    {formatRole(person.role)}
                  </div>
                  {person.location && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9CA3AF",
                        marginTop: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      <EnvironmentOutlined style={{ fontSize: 11 }} />
                      {safeValue(person.location)}
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: JOBS
// ─────────────────────────────────────────────────────────────────────────────
const JobsTab = ({ jobs = [], company, navigate }) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return jobs;
    const q = search.toLowerCase();
    return jobs.filter(
      (j) =>
        j.role?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q),
    );
  }, [search, jobs]);

  return (
    <div>
      <Input
        prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
        placeholder="Search by role or location…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ marginBottom: 16, maxWidth: 360 }}
      />

      {filtered.length === 0 ? (
        <Empty description="No jobs found" />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((job) => (
            <Col xs={24} sm={12} md={8} key={job.id}>
              <Card
                hoverable
                onClick={() => navigate?.(`/company/job/${job.id}`)}
                style={{ borderRadius: 8, cursor: "pointer", height: "100%" }}
                bodyStyle={{
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {/* Top row: logo + ellipsis */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 6,
                      flexShrink: 0,
                      background: company?.logoUrl
                        ? `url(${company.logoUrl}) center/cover no-repeat`
                        : "#fff",
                      border: "1px solid #f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {!company?.logoUrl && (
                      <BuildOutlined
                        style={{ fontSize: 24, color: "#d9d9d9" }}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      color: "#9CA3AF",
                      fontSize: 18,
                      lineHeight: 1,
                      cursor: "pointer",
                      padding: "0 4px",
                    }}
                  >
                    •••
                  </span>
                </div>

                {/* Role + verified icon */}
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#111827",
                    marginBottom: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {job.role}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ flexShrink: 0 }}
                  >
                    <circle cx="12" cy="12" r="11" fill="#057642" />
                    <path
                      d="M7 12.5l3.5 3.5 6.5-7"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Company name */}
                <div
                  style={{ fontSize: 13, color: "#374151", marginBottom: 2 }}
                >
                  {company?.name}
                </div>

                {/* Location */}
                <div
                  style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}
                >
                  {job.location}
                </div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Bottom: time ago */}
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 8 }}>
                  {timeAgo(job.createdAt)}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const PublicCompanyProfile = () => {
  const { slug } = useParams?.() || { slug: "forcehead" };
  const navigate = useNavigate?.();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const protectedMenu = ["people", "jobs", "bench"];

  const handleShare = () => {
    const url = window.location.href;
    const openJobs = company?.organization?.jobs?.length || 0;
    const msg = `
🏢 Check out ${company?.name} on Aakrin!

${company?.tagline ? `"${company.tagline}"\n` : ""}${company?.industry ? `🏭 Industry: ${company.industry}\n` : ""}${company?.headquarters ? `📍 Location: ${company.headquarters}\n` : ""}${openJobs > 0 ? `💼 Open Positions: ${openJobs}\n` : ""}
✨ View their full profile here:
${url}
    `.trim();
    setShareUrl(url);
    setShareMessage(msg);
    setShowShareModal(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      message.success("Link copied successfully!");
    } catch {
      message.error("Failed to copy link");
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      message.success("Share message copied!");
    } catch {
      message.error("Failed to copy message");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await GetPublicCompanyProfileDetails(slug);
        if (res?.status === "success") setCompany(res.data);
      } catch {
        /* handle error */
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!company) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <BankOutlined
          style={{ fontSize: 48, color: "#E5E7EB", marginBottom: 16 }}
        />
        <div style={{ fontSize: 18, fontWeight: 600, color: "#374151" }}>
          Company not found
        </div>
      </div>
    );
  }

  const jobs = company.organization?.jobs || [];
  const members = company.organization?.benchCandidates || [];
  const people = company.organization?.orgMembers || [];

  const tabItems = [
    {
      key: "about",
      label: "About",
      children: <AboutTab company={company} />,
    },
    {
      key: "people",
      label: `People${people.length ? ` (${people.length})` : ""}`,
      children: (
        <PeopleTab members={people} navigate={navigate} clickable={false} />
      ),
    },
    {
      key: "jobs",
      label: `Jobs${jobs.length ? ` (${jobs.length})` : ""}`,
      children: <JobsTab jobs={jobs} company={company} navigate={navigate} />,
    },
    {
      key: "bench",
      label: `Bench Candidates ${members.length ? ` (${members.length})` : ""}`,
      children: <PeopleTab members={members} navigate={navigate} />,
    },
  ];

  const handleTabChange = (key) => {
    const token = localStorage.getItem("token");

    if (protectedMenu.includes(key) && !token) {
      setShowLoginModal(true);
      return;
    }

    setActiveTab(key);
  };

  return (
    <div style={{ background: "#f4f5f7", minHeight: "100vh" }}>
      <div style={{ padding: "24px" }}>
        {/* ── Hero card (banner + logo + name) ── */}
        <Card
          style={{ marginBottom: 12, padding: 0, overflow: "hidden" }}
          bodyStyle={{ padding: 0 }}
        >
          {/* Cover / banner */}
          <div
            style={{
              height: 180,
              background: company.coverImage
                ? `url(${company.coverImage}) center/cover no-repeat`
                : "linear-gradient(135deg, #e6f4ff 0%, #bae0ff 60%, #91caff 100%)",
            }}
          />

          {/* Logo + info row */}
          <div style={{ padding: "0 24px 20px", position: "relative" }}>
            {/* Logo */}
            <div
              style={{
                position: "absolute",
                top: -40,
                width: 80,
                height: 80,
                borderRadius: 8,
                border: "3px solid #fff",
                background: company.logoUrl
                  ? `url(${company.logoUrl}) center/cover no-repeat`
                  : "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {!company.logoUrl && (
                <BuildOutlined style={{ fontSize: 32, color: "#d9d9d9" }} />
              )}
            </div>

            {/* Action button top-right */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 12,
                paddingTop: 12,
                marginBottom: 8,
              }}
            >
              {company.website && (
                <Button
                  icon={<LinkOutlined />}
                  href={company.website}
                  target="_blank"
                  style={{ borderRadius: 999, fontWeight: 600 }}
                >
                  Visit website
                </Button>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 12,
                paddingTop: 12,
                marginBottom: 8,
              }}
            >
              <Button
                icon={<ShareAltOutlined />}
                style={{ borderRadius: 999, fontWeight: 600 }}
                onClick={handleShare}
              >
                Share Company
              </Button>
            </div>

            {/* Name + tagline + meta — sits below the 80px logo */}
            <div style={{ paddingTop: 8 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#111827",
                  lineHeight: 1.3,
                }}
              >
                {company.name}
              </div>
              {company.tagline && (
                <div style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
                  {company.tagline}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  marginTop: 10,
                  alignItems: "center",
                }}
              >
                {company.industry && (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <BuildOutlined style={{ marginRight: 5 }} />
                    {company.industry}
                  </Text>
                )}
                {company.headquarters && (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <EnvironmentOutlined style={{ marginRight: 5 }} />
                    {company.headquarters}
                  </Text>
                )}
                {company.companySize && (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <TeamOutlined style={{ marginRight: 5 }} />
                    {company.companySize} employees
                  </Text>
                )}
                {jobs.length > 0 && (
                  <a
                    onClick={() => setActiveTab("jobs")}
                    style={{
                      fontSize: 13,
                      color: "#1677ff",
                      cursor: "pointer",
                    }}
                  >
                    {jobs.length} open job{jobs.length !== 1 ? "s" : ""}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Tabs — flush to card bottom */}
          <div style={{ borderTop: "1px solid #f0f0f0", padding: "0 24px" }}>
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              items={tabItems.map((t) => ({ key: t.key, label: t.label }))}
              style={{ marginBottom: 0 }}
              tabBarStyle={{ marginBottom: 0 }}
            />
          </div>
        </Card>

        {/* ── Tab content ── */}
        {/* <div>{tabItems.find((t) => t.key === activeTab)?.children}</div> */}
        <div>{tabItems.find((t) => t.key === activeTab)?.children}</div>
      </div>
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

      {/* 🔗 Share Modal */}
      <Modal
        centered
        open={showShareModal}
        title="Share This Company"
        onCancel={() => setShowShareModal(false)}
        footer={null}
        width={600}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <Typography.Text strong style={{ fontSize: 15 }}>
              🔗 Direct Profile Link
            </Typography.Text>
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <Input value={shareUrl} readOnly />
              <Button type="primary" onClick={handleCopyLink}>
                Copy
              </Button>
            </div>
          </div>
          <Divider />
          <div>
            <Typography.Text strong style={{ fontSize: 15 }}>
              ✨ Share with Custom Message
            </Typography.Text>
            <div
              style={{
                marginTop: 10,
                background: "#F9FAFB",
                padding: 16,
                borderRadius: 10,
                border: "1px solid #E5E7EB",
                whiteSpace: "pre-line",
                fontSize: 14,
              }}
            >
              {shareMessage}
            </div>
            <Button
              style={{ marginTop: 12 }}
              type="primary"
              block
              onClick={handleCopyMessage}
            >
              Copy Full Message
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PublicCompanyProfile;
