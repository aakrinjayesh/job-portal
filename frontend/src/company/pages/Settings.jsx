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
  Tabs,
} from "antd";
import SettingsTodoManager from "./SettingsTodoManager";

import MyActivity from "./MyActivity";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;

const Settings = () => {
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  // Fetch Members & Invites
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Assuming standard token storage
      const res = await axios.get(
        "http://localhost:3000/api/v1/organization/members",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.status === "success") {
        setMembers(res.data.data.members || []);
        setInvites(res.data.data.invites || []);
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch organization data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Invite
  const handleInvite = async (values) => {
    setConfirmLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/v1/organization/invite",
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Invite sent successfully");
      setIsModalVisible(false);
      form.resetFields();
      fetchData(); // Refresh list to show pending invite if needed (though structure separates them usually)
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Failed to send invite");
    } finally {
      setConfirmLoading(false);
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async (memberId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/v1/organization/member/remove",
        { memberId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Member removed");
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to remove member");
    }
  };

  // Handle Revoke Invite
  const handleRevokeInvite = async (inviteId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/v1/organization/invite/revoke",
        { inviteId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
                  loading={loading}
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
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter member email" />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="Permissions"
            initialValue="VIEW_ONLY"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="FULL_ACCESS">Full Access</Option>
              <Option value="VIEW_EDIT">Edit</Option>
              <Option value="VIEW_ONLY">View Only</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;
