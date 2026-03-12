import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Tag,
  Popconfirm,
  message,
  Progress,
  Typography,
  Space,
  Tooltip,
  Divider,
  Skeleton,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  GlobalOutlined,
  LinkOutlined,
  CopyOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  getOrganizationMembers,
  inviteOrganizationMember,
  removeOrganizationMember,
  revokeOrganizationInvite,
} from "../api/api";
import { GetUserProfileDetails } from "../api/api";
import CompanyProfile from "./CompanyProfile"; // ← new component

const { Option } = Form; // not used but kept for safety
const { Text, Link } = Typography;

const OrganizationSettings = () => {
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [isSiteModalVisible, setIsSiteModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [companySlug, setCompanySlug] = useState(null);
  const [slugLoading, setSlugLoading] = useState(true);
  const firstLoadRef = React.useRef(true);

  const [form] = Form.useForm();

  // ── derive public profile URL from slug ──
  const publicProfileUrl = companySlug
    ? `${window.location.origin}/company/${companySlug}`
    : null;

  // ── fetch slug from profile ──
  const fetchCompanySlug = async () => {
    setSlugLoading(true);
    try {
      const res = await GetUserProfileDetails();
      if (res?.status === "success" && res.data?.companyProfile?.slug) {
        setCompanySlug(res.data.companyProfile.slug);
      }
    } catch {
      // silently ignore — slug may not exist yet
    } finally {
      setSlugLoading(false);
    }
  };

  // Fetch Members & Invites
  const fetchData = async () => {
    if (firstLoadRef.current) {
      setInitialLoading(true);
    }

    setLoading(true);

    try {
      const res = await getOrganizationMembers();
      if (res.status === "success") {
        setMembers(res.data.members || []);
        setInvites(res.data.invites || []);
      }
    } catch (error) {
      message.error("Failed to fetch organization data");
    } finally {
      setLoading(false);

      if (firstLoadRef.current) {
        setTimeout(() => {
          setInitialLoading(false);
          firstLoadRef.current = false;
        }, 300);
      }
    }
  };

  useEffect(() => {
    fetchData();
    fetchCompanySlug();
  }, []);

  useEffect(() => {
    if (initialLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 10 : prev + 10));
      }, 400);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [initialLoading]);

  // Invite Member
  const handleInvite = async (values) => {
    setConfirmLoading(true);
    try {
      const payload = {
        name: values.name,
        email: values.email,
      };

      const resp = await inviteOrganizationMember(payload);

      if (resp.status === "success") {
        message.success("Invite sent successfully");
        setIsInviteModalVisible(false);
      }

      form.resetFields();
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to send invite");
    } finally {
      setConfirmLoading(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberId) => {
    try {
      await removeOrganizationMember({ memberId });
      message.success("Member removed");
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to remove member");
    }
  };

  // Revoke Invite
  const handleRevokeInvite = async (inviteId) => {
    try {
      await revokeOrganizationInvite({ inviteId });
      message.success("Invite revoked");
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to revoke invite");
    }
  };

  const getAdminDomain = () => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return null;

      const parsed = JSON.parse(rawUser);
      const email = parsed?.email?.trim().toLowerCase();
      if (!email || !email.includes("@")) return null;

      return email.split("@")[1];
    } catch {
      return null;
    }
  };

  const adminDomain = getAdminDomain();

  // ── copy URL to clipboard ──
  const handleCopyUrl = () => {
    if (!publicProfileUrl) return;
    navigator.clipboard
      .writeText(publicProfileUrl)
      .then(() => message.success("Profile URL copied to clipboard"))
      .catch(() => message.error("Failed to copy URL"));
  };

  const tableProgressLoader = (
    <div
      style={{
        padding: "50px 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Progress type="circle" percent={progress} status="active" size={80} />
    </div>
  );

  const memberColumns = [
    {
      title: "Name",
      dataIndex: ["user", "name"],
      key: "name",
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "COMPANY_ADMIN" ? "blue" : "green"}>{role}</Tag>
      ),
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Remove member?"
          onConfirm={() => handleRemoveMember(record.id)}
        >
          <Button
            type="text"
            danger
            disabled={record.role === "COMPANY_ADMIN"}
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      ),
    },
  ];

  const inviteColumns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      key: "status",
      render: () => <Tag color="orange">Pending</Tag>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Revoke invite?"
          onConfirm={() => handleRevokeInvite(record.id)}
        >
          <Button type="text" danger>
            Revoke
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* ── Header row ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Organization Settings</h2>

        <Space wrap>
          {/* ── Company public profile URL ── */}
          {slugLoading ? (
            <Skeleton.Input active style={{ width: 320, height: 32, borderRadius: 8 }} />
          ) : publicProfileUrl ? (
            <Space
              style={{
                background: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: 8,
                padding: "6px 14px",
              }}
            >
              <GlobalOutlined style={{ color: "#52c41a" }} />
              <Text style={{ fontSize: 13 }}>Your public profile:</Text>
              <Link
                href={publicProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 13,
                  maxWidth: 260,
                  display: "inline-block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}
              >
                {publicProfileUrl}
              </Link>
              <Tooltip title="Copy URL">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={handleCopyUrl}
                />
              </Tooltip>
            </Space>
          ) : (
            <Text type="secondary" style={{ fontSize: 13, lineHeight: "32px" }}>
              No public profile yet — click "Create Company Profile" to set one
              up
            </Text>
          )}

          {/* ── Create / Edit Site button ── */}
          {slugLoading ? (
            <Skeleton.Button active style={{ width: 180, borderRadius: 6 }} />
          ) : (
            <Button
              type="primary"
              icon={publicProfileUrl ? <EditOutlined /> : <GlobalOutlined />}
              onClick={() => setIsSiteModalVisible(true)}
            >
              {publicProfileUrl
                ? "Edit Company Profile"
                : "Create Company Profile"}
            </Button>
          )}

          {/* ── Add Member button ── */}
          <Button
            icon={<PlusOutlined />}
            onClick={() => setIsInviteModalVisible(true)}
          >
            Add Member
          </Button>
        </Space>
      </div>

      {/* ── Members table ── */}
      <h3>Members</h3>
      <Table
        columns={memberColumns}
        dataSource={members}
        rowKey="id"
        loading={{
          spinning: loading,
          indicator: tableProgressLoader,
        }}
        pagination={{ pageSize: 5 }}
      />

      {/* ── Pending invites table ── */}
      {invites.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Pending Invites</h3>
          <Table
            columns={inviteColumns}
            dataSource={invites}
            rowKey="id"
            pagination={false}
          />
        </div>
      )}

      {/* ════════ Invite Member Modal ════════ */}
      <Modal
        title="Invite New Member"
        open={isInviteModalVisible}
        onOk={form.submit}
        onCancel={() => setIsInviteModalVisible(false)}
        confirmLoading={confirmLoading}
      >
        <Form form={form} onFinish={handleInvite} layout="vertical">
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: "Please enter name" },
              {
                pattern: /^[A-Za-z. ]+$/,
                message: "Name can contain only letters, spaces and dots",
              },
              {
                max: 50,
                message: "Name cannot exceed 50 characters",
              },
            ]}
          >
            <Input placeholder="Enter member name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();

                  if (!adminDomain) {
                    return Promise.reject(
                      new Error(
                        "Unable to verify organization domain. Please re-login.",
                      ),
                    );
                  }

                  const cleanedEmail = value.trim().toLowerCase();

                  const emailRegex = new RegExp(
                    `^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\\.)*${adminDomain.replace(
                      ".",
                      "\\.",
                    )}$`,
                  );

                  if (!emailRegex.test(cleanedEmail)) {
                    return Promise.reject(
                      new Error(
                        `Only ${adminDomain} organization emails are allowed`,
                      ),
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Enter member email" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ════════ Create / Edit Site Modal ════════ */}
      <Modal
        title={
          <Space>
            <GlobalOutlined />
            {publicProfileUrl ? "Edit Company Site" : "Create Company Site"}
          </Space>
        }
        centered
        open={isSiteModalVisible}
        onCancel={() => setIsSiteModalVisible(false)}
        footer={null} // CompanyProfile renders its own Save button
        width={900}
        style={{ marginLeft: 120 }}
        styles={{
          body: { maxHeight: "75vh", overflowY: "auto", padding: "12px 24px" },
        }}
        destroyOnClose
      >
        <CompanyProfile
          compact
          onSaveSuccess={() => {
            // re-fetch slug in case it was just created
            fetchCompanySlug();
            setIsSiteModalVisible(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default OrganizationSettings;
