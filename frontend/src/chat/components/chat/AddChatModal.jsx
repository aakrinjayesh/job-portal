import {
  Modal,
  Switch,
  Input,
  Select,
  Tag,
  Avatar,
  Button,
  Space,
  Typography,
} from "antd";
import { UserOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { createGroupChat, createUserChat, getAvailableUsers } from "../../api";
import { requestHandler } from "../../utils";

const { Text } = Typography;

const AddChatModal = ({ open, onClose, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupParticipants, setGroupParticipants] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [creatingChat, setCreatingChat] = useState(false);

  const getUsers = async () => {
    requestHandler(
      async () => await getAvailableUsers(),
      null,
      (res) => setUsers(res.data || []),
      alert
    );
  };

  const handleClose = () => {
    setUsers([]);
    setSelectedUserId(null);
    setGroupName("");
    setGroupParticipants([]);
    setIsGroupChat(false);
    onClose();
  };

  const handleSelectChange = (value) => {
    if (isGroupChat && !groupParticipants.includes(value)) {
      setGroupParticipants([...groupParticipants, value]);
    } else {
      setSelectedUserId(value);
    }
  };

  const removeParticipant = (id) => {
    setGroupParticipants(groupParticipants.filter((p) => p !== id));
  };

  const createNewChat = async () => {
    if (!selectedUserId) return alert("Please select a user");
    await requestHandler(
      async () => await createUserChat(selectedUserId),
      setCreatingChat,
      (res) => {
        onSuccess(res.data);
        handleClose();
      },
      alert
    );
  };

  const createNewGroupChat = async () => {
    if (!groupName) return alert("Group name is required");
    if (groupParticipants.length < 2)
      return alert("At least 2 participants required");

    await requestHandler(
      async () =>
        await createGroupChat({
          name: groupName,
          participants: groupParticipants,
        }),
      setCreatingChat,
      (res) => {
        onSuccess(res.data);
        handleClose();
      },
      alert
    );
  };

  useEffect(() => {
    if (open) getUsers();
  }, [open]);

  const selectedUsers = users.filter((u) =>
    groupParticipants.includes(u._id)
  );

  return (
    <Modal
      title={
        <div>
          <Text strong>Create Chat</Text>
          <div style={{ fontSize: 12, color: "#6B7280" }}>
            Create new chat by adding a name and the members you want in the
            group
          </div>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={520}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {/* GROUP SWITCH */}
        <Space align="center">
          <Switch checked={isGroupChat} onChange={setIsGroupChat} />
          <Text strong>Is it a Group Chat?</Text>
        </Space>

        {/* GROUP NAME */}
        {isGroupChat && (
          <div>
            <Text>Enter a group name</Text>
            <Input
              placeholder="Enter a group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{ marginTop: 6 }}
            />
          </div>
        )}

        {/* SELECT USERS */}
        <div>
          <Text>Select Group Participants</Text>
          <Select
            placeholder={
              isGroupChat
                ? "Select Group Participants"
                : "Select User"
            }
            value={isGroupChat ? undefined : selectedUserId}
            onChange={handleSelectChange}
            style={{ width: "100%", marginTop: 6 }}
            options={users.map((u) => ({
              label: u.username,
              value: u._id,
            }))}
          />
        </div>

        {/* SELECTED USERS */}
        {isGroupChat && selectedUsers.length > 0 && (
          <Space wrap>
            {selectedUsers.map((user) => (
              <Tag
                key={user._id}
                closable
                closeIcon={<CloseCircleOutlined />}
                onClose={() => removeParticipant(user._id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 20,
                  padding: "4px 10px",
                }}
              >
                <Avatar
                  size="small"
                  src={user.avatar?.url}
                  style={{ marginRight: 6 }}
                />
                {user.username}
              </Tag>
            ))}
          </Space>
        )}

        {/* FOOTER BUTTONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 12,
          }}
        >
          <Button onClick={handleClose} shape="round">Close</Button>
          <Button
            type="primary"
            shape="round"
            loading={creatingChat}
            onClick={isGroupChat ? createNewGroupChat : createNewChat}
          >
            Create
          </Button>
        </div>
      </Space>
    </Modal>
  );
};

export default AddChatModal;
