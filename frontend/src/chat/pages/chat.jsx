import {
  Layout,
  Input,
  Button,
  Space,
  Avatar,
  Typography,
  Upload,
  Spin,
  Empty,
  Image,
  Badge,
  Tooltip,
} from "antd";
import {
  SendOutlined,
  PaperClipOutlined,
  CloseCircleOutlined,
  LogoutOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import {
  deleteMessage,
  getChatMessages,
  getAvailableUsers,
  createUserChat,
  createGroupChat,
  getUserChats,
  sendMessage,
} from "../api";
import AddChatModal from "../components/chat/AddChatModal";
import ChatItem from "../components/chat/ChatItem";
import MessageItem from "../components/chat/MessageItem";
import Typing from "../components/chat/Typing";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { getChatObjectMetadata, requestHandler } from "../utils";
import { useLocation } from "react-router-dom";

const { Sider, Content } = Layout;
const { Text } = Typography;
const { Search } = Input;

const CONNECTED_EVENT = "connected";
const DISCONNECT_EVENT = "disconnect";
const JOIN_CHAT_EVENT = "joinChat";
const NEW_CHAT_EVENT = "newChat";
const TYPING_EVENT = "typing";
const STOP_TYPING_EVENT = "stopTyping";
const MESSAGE_RECEIVED_EVENT = "messageReceived";
const LEAVE_CHAT_EVENT = "leaveChat";
const UPDATE_GROUP_NAME_EVENT = "updateGroupName";
const MESSAGE_DELETE_EVENT = "messageDeleted";

const ChatPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const candidate = location?.state?.candidate;
  console.log("candidate", candidate);
  const userType = location?.state?.userType;
  console.log("userType", userType);

  // group
  const groupUserIds = location?.state?.groupUserIds;
  const groupName = location?.state?.groupName;
  console.log("group ids", groupUserIds);

  const currentChat = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [openAddChat, setOpenAddChat] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selfTyping, setSelfTyping] = useState(false);
  const [message, setMessage] = useState("");
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);

  const updateChatLastMessage = (chatToUpdateId, message) => {
    const chatToUpdate = chats.find((chat) => chat._id === chatToUpdateId);
    if (!chatToUpdate) return;
    chatToUpdate.lastMessage = message;
    chatToUpdate.updatedAt = message?.updatedAt;
    setChats([
      chatToUpdate,
      ...chats.filter((chat) => chat._id !== chatToUpdateId),
    ]);
  };

  const updateChatLastMessageOnDeletion = (chatToUpdateId, message) => {
    const chatToUpdate = chats.find((chat) => chat._id === chatToUpdateId);
    if (!chatToUpdate) return;

    if (chatToUpdate.lastMessage?._id === message._id) {
      requestHandler(
        async () => getChatMessages(chatToUpdateId),
        null,
        (req) => {
          const { data } = req;
          chatToUpdate.lastMessage = data[0];
          setChats([...chats]);
        },
        alert
      );
    }
  };

  const getChats = async () => {
    requestHandler(
      async () => await getUserChats(),
      setLoadingChats,
      (res) => setChats(res.data || [])
      // alert
    );
  };

  const getMessages = async () => {
    if (!currentChat.current?._id) return;
    if (!socket) return;
    // alert("Socket not available");

    socket.emit(JOIN_CHAT_EVENT, currentChat.current?._id);

    setUnreadMessages(
      unreadMessages.filter((msg) => msg.chat !== currentChat.current?._id)
    );

    requestHandler(
      async () => await getChatMessages(currentChat.current?._id || ""),
      setLoadingMessages,
      (res) => setMessages(res.data || []),
      alert
    );
  };

  const sendChatMessage = async () => {
    if (!currentChat.current?._id || !socket) {
      console.log("currentChat", currentChat);
      console.log("socket", socket);
      console.log("no socket and currentChat");
      return;
    }
    socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);

    await requestHandler(
      async () =>
        await sendMessage(
          currentChat.current?._id || "",
          message,
          attachedFiles
        ),
      null,
      (res) => {
        setMessage("");
        setAttachedFiles([]);
        setMessages((prev) => [res.data, ...prev]);
        updateChatLastMessage(currentChat.current?._id || "", res.data);
      },
      alert
    );
  };

  const deleteChatMessage = async (message) => {
    await requestHandler(
      async () => await deleteMessage(message.chat, message._id),
      null,
      (res) => {
        setMessages((prev) => prev.filter((msg) => msg._id !== res.data._id));
        updateChatLastMessageOnDeletion(message.chat, message);
      },
      alert
    );
  };

  const handleOnMessageChange = (e) => {
    setMessage(e.target.value);

    if (!socket || !isConnected) return;

    if (!selfTyping) {
      setSelfTyping(true);
      socket.emit(TYPING_EVENT, currentChat.current?._id);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);
      setSelfTyping(false);
    }, 3000);
  };

  const onConnect = () => setIsConnected(true);

  const onDisconnect = () => setIsConnected(false);

  const handleOnSocketTyping = (chatId) =>
    chatId === currentChat.current?._id && setIsTyping(true);

  const handleOnSocketStopTyping = (chatId) =>
    chatId === currentChat.current?._id && setIsTyping(false);

  const onMessageReceived = (message) => {
    if (message?.chat !== currentChat.current?._id) {
      setUnreadMessages((prev) => [message, ...prev]);
    } else {
      setMessages((prev) => [message, ...prev]);
    }
    updateChatLastMessage(message.chat || "", message);
  };

  const onNewChat = (chat) => setChats((prev) => [chat, ...prev]);

  const onChatLeave = (chat) => {
    if (chat._id === currentChat.current?._id) {
      currentChat.current = null;
      LocalStorage.remove("currentChat");
    }
    setChats((prev) => prev.filter((c) => c._id !== chat._id));
  };

  const onGroupNameChange = (chat) => {
    if (chat._id === currentChat.current?._id) {
      currentChat.current = chat;
      LocalStorage.set("currentChat", chat);
    }
    setChats((prev) => [
      ...prev.map((c) => {
        if (c._id === chat._id) {
          return chat;
        }
        return c;
      }),
    ]);
  };

  const onMessageDelete = (message) => {
    if (message?.chat !== currentChat.current?._id) {
      setUnreadMessages((prev) =>
        prev.filter((msg) => msg._id !== message._id)
      );
    } else {
      setMessages((prev) => prev.filter((msg) => msg._id !== message._id));
    }
    updateChatLastMessageOnDeletion(message.chat, message);
  };

  const handleFileChange = (info) => {
    const files = info.fileList.map((file) => file.originFileObj);
    setAttachedFiles(files);
  };

  const removeAttachment = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  useEffect(() => {
    console.log("one to one chat");
    if (!candidate) return;

    const startChatFlow = async () => {
      try {
        const chatResponse = await createUserChat(candidate.profile.chatuserid);
        const chat = chatResponse?.data;
        if (!chat) return;
        getChats();
        // localStorage.setItem("currentChat", JSON.stringify(chats[0]));
        // currentChat.current = chats[0];
        setMessage("");
        getMessages();
      } catch (err) {
        console.error("Failed to auto-open chat:", err);
      }
    };

    startChatFlow();
  }, [candidate]);

  const groupCreatedRef = useRef(false);

  useEffect(() => {
    if (!groupUserIds || groupUserIds.length === 0) return;
    if (groupCreatedRef.current) return;

    groupCreatedRef.current = true;

    const startGroupChatFlow = async () => {
      try {
        const payload = {
          name: groupName,
          participants: groupUserIds,
        };

        const res = await createGroupChat(payload);
        const chat = res?.data;
        if (!chat) return;

        getChats();
        setMessage("");
        getMessages();
      } catch (err) {
        console.error("Failed to create group chat", err);
      }
    };

    startGroupChatFlow();
  }, [groupUserIds, groupName]);

  useEffect(() => {
    getChats();
    const _currentChat = JSON.parse(localStorage.getItem("currentChat"));
    if (_currentChat) {
      currentChat.current = _currentChat;
      socket?.emit(JOIN_CHAT_EVENT, _currentChat._id);
      getMessages();
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on(CONNECTED_EVENT, onConnect);
    socket.on(DISCONNECT_EVENT, onDisconnect);
    socket.on(TYPING_EVENT, handleOnSocketTyping);
    socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
    socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
    socket.on(NEW_CHAT_EVENT, onNewChat);
    socket.on(LEAVE_CHAT_EVENT, onChatLeave);
    socket.on(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
    socket.on(MESSAGE_DELETE_EVENT, onMessageDelete);

    return () => {
      socket.off(CONNECTED_EVENT, onConnect);
      socket.off(DISCONNECT_EVENT, onDisconnect);
      socket.off(TYPING_EVENT, handleOnSocketTyping);
      socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
      socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
      socket.off(NEW_CHAT_EVENT, onNewChat);
      socket.off(LEAVE_CHAT_EVENT, onChatLeave);
      socket.off(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
      socket.off(MESSAGE_DELETE_EVENT, onMessageDelete);
    };
  }, [socket, chats]);

  const filteredChats = [...chats].filter((chat) =>
    localSearchQuery
      ? getChatObjectMetadata(chat, user)
          .title?.toLowerCase()
          ?.includes(localSearchQuery)
      : true
  );

  const chatMetadata = currentChat.current
    ? getChatObjectMetadata(currentChat.current, user)
    : null;

  return (
    <>
      <AddChatModal
        open={openAddChat}
        onClose={() => setOpenAddChat(false)}
        onSuccess={getChats}
      />

      <Layout style={{ height: "100vh", overflow: "hidden" }}>
        {/* Left Sidebar - Chat List */}
        <Sider
          width="33%"
          style={{
            background: "#fff",
            borderRight: "1px solid #f0f0f0",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid #f0f0f0",
              background: "#fff",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                {/* <Button
                  type="primary"
                  danger
                  icon={<LogoutOutlined />}
                  onClick={logout}
                >
                  Logout
                </Button> */}
                {userType !== "candidate" && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setOpenAddChat(true)}
                  >
                    Add Chat
                  </Button>
                )}
              </Space>
              <Search
                placeholder="Search user or group..."
                value={localSearchQuery}
                onChange={(e) =>
                  setLocalSearchQuery(e.target.value.toLowerCase())
                }
                prefix={<SearchOutlined />}
                allowClear
              />
            </Space>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px" }}>
            {loadingChats ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Spin size="large" />
              </div>
            ) : filteredChats.length === 0 ? (
              <Empty description="No chats found" />
            ) : (
              filteredChats.map((chat) => (
                <ChatItem
                  key={chat._id}
                  chat={chat}
                  isActive={chat._id === currentChat.current?._id}
                  unreadCount={
                    unreadMessages.filter((n) => n.chat === chat._id).length
                  }
                  onClick={(chat) => {
                    if (currentChat.current?._id === chat._id) return;
                    // localStorage.setItem("currentChat", chat);
                    localStorage.setItem("currentChat", JSON.stringify(chat));
                    currentChat.current = chat;
                    setMessage("");
                    getMessages();
                  }}
                  onChatDelete={(chatId) => {
                    setChats((prev) => prev.filter((c) => c._id !== chatId));
                    if (currentChat.current?._id === chatId) {
                      currentChat.current = null;
                      localStorage.removeItem("currentChat");
                    }
                  }}
                />
              ))
            )}
          </div>
        </Sider>

        {/* Right Content - Chat Messages */}
        <Content style={{ display: "flex", flexDirection: "column" }}>
          {currentChat.current && currentChat.current?._id ? (
            <>
              {/* Chat Header */}
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid #f0f0f0",
                  background: "#fff",
                }}
              >
                <Space size="middle">
                  <Avatar src={chatMetadata?.avatar} size={56} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                      {chatMetadata?.title}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {chatMetadata?.description}
                    </Text>
                  </div>
                </Space>
              </div>

              {/* Messages Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column-reverse",
                  gap: 16,
                  background: "#fafafa",
                }}
              >
                {loadingMessages ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Spin size="large" />
                  </div>
                ) : (
                  <>
                    {isTyping && <Typing />}
                    {messages?.map((msg) => (
                      <MessageItem
                        key={msg._id}
                        isOwnMessage={msg.sender?._id === user?._id}
                        isGroupChatMessage={currentChat.current?.isGroupChat}
                        message={msg}
                        deleteChatMessage={deleteChatMessage}
                      />
                    ))}
                  </>
                )}
              </div>

              {/* Attached Files Preview */}
              {attachedFiles.length > 0 && (
                <div
                  style={{
                    padding: "16px 24px",
                    borderTop: "1px solid #f0f0f0",
                    background: "#fff",
                  }}
                >
                  <Space wrap size="middle">
                    {attachedFiles.map((file, i) => (
                      <Badge
                        key={i}
                        count={
                          <CloseCircleOutlined
                            style={{
                              color: "#ff4d4f",
                              fontSize: 20,
                              cursor: "pointer",
                            }}
                            onClick={() => removeAttachment(i)}
                          />
                        }
                      >
                        <Image
                          width={120}
                          height={120}
                          src={URL.createObjectURL(file)}
                          style={{ borderRadius: 8, objectFit: "cover" }}
                          preview={false}
                        />
                      </Badge>
                    ))}
                  </Space>
                </div>
              )}

              {/* Message Input */}
              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid #f0f0f0",
                  background: "#fff",
                }}
              >
                <Space.Compact style={{ width: "100%" }} size="large">
                  <Upload
                    multiple
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleFileChange}
                    fileList={[]}
                  >
                    <Tooltip title="Attach files">
                      <Button
                        icon={<PaperClipOutlined />}
                        size="large"
                        style={{ borderRadius: "50%", width: 48, height: 48 }}
                      />
                    </Tooltip>
                  </Upload>

                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={handleOnMessageChange}
                    onPressEnter={sendChatMessage}
                    size="large"
                    style={{ flex: 1 }}
                  />

                  <Tooltip title="Send message">
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={sendChatMessage}
                      disabled={!message && attachedFiles.length <= 0}
                      size="large"
                      style={{ borderRadius: "50%", width: 48, height: 48 }}
                    />
                  </Tooltip>
                </Space.Compact>
              </div>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Empty
                description="No chat selected"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </Content>
      </Layout>
    </>
  );
};

export default ChatPage;
