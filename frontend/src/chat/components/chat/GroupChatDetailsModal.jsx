import {
  Drawer,
  Avatar,
  Button,
  Input,
  Select,
  Space,
  Tag,
  List,
  Divider,
  message,
  Popconfirm,
  Typography,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  addParticipantToGroup,
  deleteGroup,
  getAvailableUsers,
  getGroupInfo,
  removeParticipantFromGroup,
  updateGroupName,
} from "../../api";
import { useAuth } from "../../context/AuthContext";
import { requestHandler } from "../../utils";

const { Text, Title } = Typography;

const GroupChatDetailsModal = ({ open, onClose, chatId, onGroupDelete }) => {
  const { user } = useAuth();
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [renamingGroup, setRenamingGroup] = useState(false);
  const [participantToBeAdded, setParticipantToBeAdded] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [groupDetails, setGroupDetails] = useState(null);
  const [users, setUsers] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const isAdmin = groupDetails?.admin === user?._id;

  /* ================= LOGIC (UNCHANGED) ================= */

  const handleGroupNameUpdate = async () => {
    if (!newGroupName) return messageApi.error("Group name is required");
    requestHandler(
      async () => await updateGroupName(chatId, newGroupName),
      null,
      (res) => {
        const { data } = res;
        setGroupDetails(data);
        setNewGroupName(data.name);
        setRenamingGroup(false);
        messageApi.success("Group name updated");
      }
    );
  };

  const getUsers = async () => {
    requestHandler(
      async () => await getAvailableUsers(),
      null,
      (res) => setUsers(res.data || [])
    );
  };

  const deleteGroupChat = async () => {
    if (!isAdmin) {
      return messageApi.info("You are not the admin of the group");
    }
    await requestHandler(
      async () => await deleteGroup(chatId),
      null,
      () => {
        onGroupDelete(chatId);
        handleClose();
      }
    );
  };

  const removeParticipant = async (participantId) => {
    await requestHandler(
      async () => await removeParticipantFromGroup(chatId, participantId),
      null,
      () => {
        setGroupDetails({
          ...groupDetails,
          participants: groupDetails.participants.filter(
            (p) => p._id !== participantId
          ),
        });
        messageApi.success("Participant removed");
      }
    );
  };

  const addParticipant = async () => {
    if (!participantToBeAdded)
      return messageApi.error("Please select a participant");
    requestHandler(
      async () => await addParticipantToGroup(chatId, participantToBeAdded),
      null,
      (res) => {
        setGroupDetails({
          ...groupDetails,
          participants: res.data.participants,
        });
        setAddingParticipant(false);
        setParticipantToBeAdded("");
        messageApi.success("Participant added");
      }
    );
  };

  const fetchGroupInformation = async () => {
    requestHandler(
      async () => await getGroupInfo(chatId),
      null,
      (res) => {
        setGroupDetails(res.data);
        setNewGroupName(res.data?.name || "");
      }
    );
  };

  const handleClose = () => {
    setRenamingGroup(false);
    setAddingParticipant(false);
    setParticipantToBeAdded("");
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    fetchGroupInformation();
    getUsers();
  }, [open]);

  /* ================= UI ================= */

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      width={600}
      closeIcon={<CloseOutlined />}
      title={null}
    >
      {contextHolder}

      <div style={{ padding: 32, background: "#fff", height: "100%" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
          <Avatar size={48} />
          <div style={{ flex: 1 }}>
            {renamingGroup ? (
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <Button type="primary" onClick={handleGroupNameUpdate}>
                  Save
                </Button>
                <Button onClick={() => setRenamingGroup(false)}>Cancel</Button>
              </Space.Compact>
            ) : (
              <Space>
                <Title level={4} style={{ margin: 0 }}>
                  {groupDetails?.name}
                </Title>
                {isAdmin && (
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => setRenamingGroup(true)}
                  />
                )}
              </Space>
            )}
            <Text type="secondary">
              {groupDetails?.participants.length} Participants
            </Text>
          </div>
        </div>

        {/* Participants */}
        <List
          itemLayout="horizontal"
          dataSource={groupDetails?.participants || []}
          renderItem={(participant) => (
            <>
              <List.Item
                actions={
                  isAdmin
                    ? [
                        <Popconfirm
                          title="Remove participant?"
                          onConfirm={() =>
                            removeParticipant(participant._id)
                          }
                        >
                          <Button danger>
                            Remove
                          </Button>
                        </Popconfirm>,
                      ]
                    : []
                }
              >
                <List.Item.Meta
                  avatar={<Avatar src={participant.avatar?.url} />}
                  title={
                    <Space>
                      <Text>{participant.username}</Text>
                      {participant._id === groupDetails?.admin && (
                        <Tag color="blue">Admin</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Text type="secondary">{participant.email}</Text>
                  }
                />
              </List.Item>
              <Divider style={{ margin: 0 }} />
            </>
          )}
        />

        {/* Footer */}
        {isAdmin && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 16,
              marginTop: 32,
            }}
          >
            <Popconfirm
              title="Delete group?"
              onConfirm={deleteGroupChat}
            >
              <Button shape="round" >
                Delete Group
              </Button>
            </Popconfirm>

            {!addingParticipant ? (
              <Button
                type="primary"
                shape="round"
                icon={<UserAddOutlined />}
                onClick={() => setAddingParticipant(true)}
              >
                Add Participant
              </Button>
            ) : (
              <Space.Compact>
                <Select
                  placeholder="Select user"
                  value={participantToBeAdded}
                  onChange={setParticipantToBeAdded}
                  options={users.map((u) => ({
                    label: u.username,
                    value: u._id,
                  }))}
                  style={{ minWidth: 200 }}
                />
                <Button type="primary" onClick={addParticipant}>
                  Add
                </Button>
                <Button onClick={() => setAddingParticipant(false)}>
                  Cancel
                </Button>
              </Space.Compact>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default GroupChatDetailsModal;
