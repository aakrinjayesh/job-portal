import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Popconfirm,
  message,
  Progress,
  Tabs,
} from "antd";
import SettingsTodoManager from "./SettingsTodoManager";

import MyActivity from "./MyActivity";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getOrganizationMembers,
  inviteOrganizationMember,
  removeOrganizationMember,
  revokeOrganizationInvite,
} from "../api/api";

const { Option } = Select;

const Settings = () => {
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const firstLoadRef = React.useRef(true);

  const [form] = Form.useForm();

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
        firstLoadRef.current = false; // 🔒 lock forever
      }, 300);
    }
  }
};


  useEffect(() => {
    fetchData();
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


  // Handle Invite
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
        setIsModalVisible(false);
      }
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to send invite");
    } finally {
      setConfirmLoading(false);
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async (memberId) => {
    try {
      await removeOrganizationMember({ memberId });
      message.success("Member removed");
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to remove member");
    }
  };

  // Handle Revoke Invite
  const handleRevokeInvite = async (inviteId) => {
    try {
      await revokeOrganizationInvite({ inviteId });
      message.success("Invite revoked");
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to revoke invite");
    }
  };

  const memberColumns = [
    {
      title: "Name",
      dataIndex: ["user", "name"], // Nested data access
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

 const tableProgressLoader = (
  <div
    style={{
      padding: "50px 0",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Progress
      type="circle"
      percent={progress}
      status="active"
      size={80}
    />
  </div>
);



  return (
    <div style={{ padding: "24px" }}>
      <Tabs
        defaultActiveKey="org"
        items={[
          {
            key: "org",
            label: "Organization Settings",
            children: (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <h2>Organization Settings</h2>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalVisible(true)}
                  >
                    Add Member
                  </Button>
                </div>

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
              </>
            ),
          },
          {
            key: "activity",
            label: "My Activity",
            children: (
              <>
                <SettingsTodoManager />
              </>
            ),
          },
        ]}
      />

      <Modal
        title="Invite New Member"
        open={isModalVisible}
        onOk={form.submit}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={confirmLoading}
      >
        <Form form={form} onFinish={handleInvite} layout="vertical">
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please enter name" },
                {
      pattern: /^[A-Za-z]{2,}(?: [A-Za-z])+$/,
      message:
        "Enter first and last name using letters only ",
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

                  // 🔥 Regex for same domain OR subdomain
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
    </div>
  );
};

export default Settings;
