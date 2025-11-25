import {
  Drawer,
  Avatar,
  Button,
  Input,
  Select,
  Space,
  Tag,
  List,
  Modal,
  Divider,
  message,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  TeamOutlined,
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

const GroupChatDetailsModal = ({ open, onClose, chatId, onGroupDelete }) => {
  const { user } = useAuth();
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [renamingGroup, setRenamingGroup] = useState(false);
  const [participantToBeAdded, setParticipantToBeAdded] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [groupDetails, setGroupDetails] = useState(null);
  const [users, setUsers] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

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
        messageApi.success("Group name updated to " + data.name);
      }
      // alert
    );
  };

  const getUsers = async () => {
    requestHandler(
      async () => await getAvailableUsers(),
      null,
      (res) => {
        const { data } = res;
        setUsers(data || []);
      }
      // alert
    );
  };

  const deleteGroupChat = async () => {
    if (groupDetails?.admin !== user?._id) {
      return messageApi.info("You are not the admin of the group");
    }
    await requestHandler(
      async () => await deleteGroup(chatId),
      null,
      () => {
        onGroupDelete(chatId);
        handleClose();
      }
      // alert
    );
  };

  const removeParticipant = async (participantId) => {
    await requestHandler(
      async () => await removeParticipantFromGroup(chatId, participantId),
      null,
      () => {
        const updatedGroupDetails = {
          ...groupDetails,
          participants:
            groupDetails?.participants?.filter(
              (p) => p._id !== participantId
            ) || [],
        };
        setGroupDetails(updatedGroupDetails);
        messageApi.success("Participant removed");
      }
      // alert
    );
  };

  const addParticipant = async () => {
    if (!participantToBeAdded)
      return messageApi.error("Please select a participant to add.");
    requestHandler(
      async () => await addParticipantToGroup(chatId, participantToBeAdded),
      null,
      (res) => {
        const { data } = res;
        const updatedGroupDetails = {
          ...groupDetails,
          participants: data?.participants || [],
        };
        setGroupDetails(updatedGroupDetails);
        setParticipantToBeAdded("");
        setAddingParticipant(false);
        messageApi.success("Participant added");
      }
      // alert
    );
  };

  const fetchGroupInformation = async () => {
    requestHandler(
      async () => await getGroupInfo(chatId),
      null,
      (res) => {
        const { data } = res;
        setGroupDetails(data);
        setNewGroupName(data?.name || "");
      }
      // alert
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

  const isAdmin = groupDetails?.admin === user?._id;

  return (
    <Drawer
      title={null}
      placement="right"
      onClose={handleClose}
      open={open}
      width={600}
      closeIcon={<CloseOutlined />}
    >
      {contextHolder}
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        {/* Group Avatar */}
        <div style={{ textAlign: "center" }}>
          <Avatar.Group maxCount={3} size={80}>
            {groupDetails?.participants.slice(0, 3).map((p) => (
              <Avatar key={p._id} src={p.avatar.url} size={80} />
            ))}
          </Avatar.Group>
          {groupDetails?.participants?.length > 3 && (
            <div style={{ marginTop: 8 }}>
              +{groupDetails.participants.length - 3} more
            </div>
          )}
        </div>

        {/* Group Name */}
        <div style={{ textAlign: "center" }}>
          {renamingGroup ? (
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Enter new group name..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                size="large"
              />
              <Button type="primary" onClick={handleGroupNameUpdate}>
                Save
              </Button>
              <Button onClick={() => setRenamingGroup(false)}>Cancel</Button>
            </Space.Compact>
          ) : (
            <Space>
              <h2 style={{ margin: 0 }}>{groupDetails?.name}</h2>
              {isAdmin && (
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => setRenamingGroup(true)}
                />
              )}
            </Space>
          )}
          <div style={{ color: "#8c8c8c", marginTop: 4 }}>
            Group · {groupDetails?.participants.length} participants
          </div>
        </div>

        <Divider />

        {/* Participants List */}
        <div>
          <div
            style={{ marginBottom: 16, display: "flex", alignItems: "center" }}
          >
            <TeamOutlined style={{ marginRight: 8, fontSize: 18 }} />
            <span style={{ fontSize: 16, fontWeight: 500 }}>
              {groupDetails?.participants.length} Participants
            </span>
          </div>

          <List
            dataSource={groupDetails?.participants || []}
            renderItem={(participant) => (
              <List.Item
                actions={
                  isAdmin
                    ? [
                        <Popconfirm
                          title="Remove Participant?"
                          description="Are you sure you want to remove this participant?"
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => removeParticipant(participant._id)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            danger
                            size="small"
                            // onClick={() => }
                          >
                            Remove
                          </Button>
                        </Popconfirm>,
                      ]
                    : []
                }
              >
                <List.Item.Meta
                  avatar={<Avatar src={participant.avatar.url} size={48} />}
                  title={
                    <Space>
                      {participant.username}
                      {participant._id === groupDetails.admin && (
                        <Tag color="success">admin</Tag>
                      )}
                    </Space>
                  }
                  description={participant.email}
                />
              </List.Item>
            )}
          />

          {isAdmin && (
            <Space
              direction="vertical"
              style={{ width: "100%", marginTop: 16 }}
            >
              {!addingParticipant ? (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  block
                  onClick={() => setAddingParticipant(true)}
                >
                  Add participant
                </Button>
              ) : (
                <Space.Compact style={{ width: "100%" }}>
                  <Select
                    placeholder="Select a user to add..."
                    value={participantToBeAdded}
                    onChange={setParticipantToBeAdded}
                    style={{ flex: 1 }}
                    options={users.map((u) => ({
                      label: u.username,
                      value: u._id,
                    }))}
                  />
                  <Button type="primary" onClick={addParticipant}>
                    Add
                  </Button>
                  <Button
                    onClick={() => {
                      setAddingParticipant(false);
                      setParticipantToBeAdded("");
                    }}
                  >
                    Cancel
                  </Button>
                </Space.Compact>
              )}
              <Popconfirm
                title="Delete Group"
                description="Are you sure you want to delete this group?"
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                onConfirm={deleteGroupChat}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  block
                  // onClick={deleteGroupChat}
                >
                  Delete group
                </Button>
              </Popconfirm>
            </Space>
          )}
        </div>
      </Space>
    </Drawer>
  );
};

export default GroupChatDetailsModal;
