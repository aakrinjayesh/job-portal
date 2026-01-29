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
  Modal,
  Badge,
  Tooltip,
  message as msg,
} from "antd";
import {
  SendOutlined,
  PaperClipOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  FileOutlined,
  CloseOutlined,
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

const Chat = () => {
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
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [caption, setCaption] = useState("");

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
  const [alertMessage, contextHolder] = msg.useMessage();

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
        (error) => {
          console.error("Failed to update chat:", error);
          alertMessage.error(error || "Failed to update chat");
        },
      );
    }
  };

  const getChats = async () => {
    requestHandler(
      async () => await getUserChats(),
      setLoadingChats,
      (res) => setChats(res.data || []),
      (error) => {
        console.error("Failed to load chats:", error);
        alertMessage.error(error || "Failed to load chats");
      },
    );
  };

  const getMessages = async () => {
    if (!currentChat.current?._id) return;
    if (!socket) return;

    socket.emit(JOIN_CHAT_EVENT, currentChat.current?._id);

    setUnreadMessages(
      unreadMessages.filter((msg) => msg.chat !== currentChat.current?._id),
    );

  requestHandler(
      async () => await getChatMessages(currentChat.current?._id || ""),
    setLoadingMessages,
      (res) => setMessages(res.data || []),
      (error) => {
        console.error("Failed to load messages:", error);
        alertMessage.error(error || "Failed to load messages");
      },
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
          attachedFiles,
        ),
      null,
      (res) => {
        setMessage("");
        setAttachedFiles([]);
        setMessages((prev) => [res.data, ...prev]);
        updateChatLastMessage(currentChat.current?._id || "", res.data);
      },
      (error) => {
        console.error("Failed to send message:", error);
        alertMessage.error(error || "Failed to send message");
      },
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
      (error) => {
        console.error("Failed to delete message:", error);
        alertMessage.error(error || "Failed to delete message");
      },
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
      localStorage.removeItem("currentChat");
    }
    setChats((prev) => prev.filter((c) => c._id !== chat._id));
  };

  const onGroupNameChange = (chat) => {
    if (chat._id === currentChat.current?._id) {
      currentChat.current = chat;
      localStorage.setItem("currentChat", JSON.stringify(chat));
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
        prev.filter((msg) => msg._id !== message._id),
      );
    } else {
      setMessages((prev) => prev.filter((msg) => msg._id !== message._id));
    }
    updateChatLastMessageOnDeletion(message.chat, message);
  };

  const handleFileChange = (info) => {
    const files = info.fileList.map((file) => file.originFileObj);
    setPreviewFiles(files);
    setCaption("");
    setPreviewOpen(true);
  };

  const removeAttachment = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const removePreviewFile = (index) => {
    setPreviewFiles(previewFiles.filter((_, i) => i !== index));
  };

  useEffect(() => {
    console.log("one to one chat");
    if (!candidate) return;

    const startChatFlow = async () => {
      try {
        const chatResponse = await createUserChat(candidate.profile.chatuserid);
        const chat = chatResponse?.data;
        if (chat?.message) {
          alertMessage.success(chat.message);
        }
        if (!chat) return;
        getChats();
        // localStorage.setItem("currentChat", JSON.stringify(chats[0]));
        // currentChat.current = chats[0];
        setMessage("");
        getMessages();
      } catch (err) {
        console.error("Failed to auto-open chat:", err);
        alertMessage.error(
          err?.response?.data?.message || "Failed to create chat",
        );
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

        alertMessage.success("Group chat created successfully");
        getChats();
        setMessage("");
        getMessages();
      } catch (err) {
        console.error("Failed to create group chat", err);
        alertMessage.error(
          err?.response?.data?.message || "Failed to create group chat",
        );
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
      : true,
  );

  const chatMetadata = currentChat.current
    ? getChatObjectMetadata(currentChat.current, user)
    : null;

  return (
    <>
      {contextHolder}
      <AddChatModal
        open={openAddChat}
        onClose={() => setOpenAddChat(false)}
        onSuccess={getChats}
      />

      <Layout style={{ height: "100vh" }}>
        {/* SIDEBAR */}
        <Sider
          width={360}
          style={{
            background: "#F7F8FA",
            borderRight: "1px solid #E5E7EB",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: 16,
            background: "white",
              borderBottom: "1px solid #E5E7EB",
            }}
          >
           <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
  {/* HEADER ROW */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
                <Text style={{ fontSize: 16, fontWeight: 600 }}>All Chats</Text>

    {userType !== "candidate" && (
    <Button
  onClick={() => setOpenAddChat(true)}
  style={{
    background: "#E6F0FF",
    borderRadius: 999,
    padding: "4px 16px",
    height: 32,
    fontWeight: 500,
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "none",
  }}
>
  <PlusOutlined />
  Add Chat
</Button>
    )}
  </div>

  {/* SEARCH */}
 <Search
  placeholder="Search chats"
  allowClear
  //prefix={<SearchOutlined />}
  onChange={(e) =>
    setLocalSearchQuery(e.target.value.toLowerCase())
  }
  style={{
    background: "rgb(214, 220, 226)",
    borderRadius: 20,
  }}
  inputStyle={{
    background: "#F0F2F5",
  }}
/>
</div>
</div>

          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {loadingChats ? (
              <Spin style={{ marginTop: 40 }} />
            ) : filteredChats.length === 0 ? (
              <Empty />
            ) : (
              filteredChats.map((chat) => (
                <ChatItem
                  key={chat._id}
                  chat={chat}
                  unreadCount={
                    unreadMessages.filter((m) => m.chat === chat._id).length
                  }
                  isActive={chat._id === currentChat.current?._id}
               onClick={(c) => {
  currentChat.current = c;
                    localStorage.setItem("currentChat", JSON.stringify(c));
                    getMessages();
}}
                  onChatDelete={(id) =>
                    setChats((prev) => prev.filter((c) => c._id !== id))
                  }
                />
              ))
            )}
          </div>
        </Sider>

        {/* CHAT CONTENT */}
     <Content
  style={{
    display: "flex",
    flexDirection: "column",
    height: "100vh",
     minHeight: 0,
  }}
>
  {currentChat.current ? (
    <>
      {/* HEADER */}
      <div
        style={{
          padding: "16px 24px",
          background: "white",
          borderBottom: "1px solid #E5E7EB",
          flexShrink: 0,
        }}
      >
        <Space>
          <Avatar src={chatMetadata?.avatar} size={48} />
          <div>
                    <div style={{ fontWeight: 600 }}>{chatMetadata?.title}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {chatMetadata?.description}
            </Text>
          </div>
        </Space>
      </div>

      {/* MESSAGES */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#EEF2F5",
          padding: 24,
           minHeight: 0, 
        }}
      >
        {loadingMessages ? (
          <Spin />
        ) : (
          <>
            {isTyping && <Typing />}

            {messages.map((msg) => (
              <MessageItem
                key={msg._id}
                message={msg}
                isOwnMessage={msg.sender?._id === user?._id}
                isGroupChatMessage={currentChat.current?.isGroupChat}
                        deleteChatMessage={deleteChatMessage}
              />
            ))}

            {/* ✅ ONLY PLACE FOR REF */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

              {/* ATTACHED FILES PREVIEW (ABOVE INPUT) */}
              {attachedFiles.length > 0 && (
                <div
                  style={{
                    padding: "8px 14px",
                    background: "#F5F6F8",
                    borderTop: "1px solid #E5E7EB",
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {attachedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        display: "inline-block",
                      }}
                    >
                      {file.type?.startsWith("image") ? (
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 8,
                            overflow: "hidden",
                            border: "2px solid #1890ff",
                            position: "relative",
                          }}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt="preview"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => removeAttachment(idx)}
                            style={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              background: "white",
                              borderRadius: "50%",
                              width: 20,
                              height: 20,
                              minWidth: 20,
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: "8px 12px",
                            background: "#E6F0FF",
                            borderRadius: 8,
                            border: "1px solid #1890ff",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            maxWidth: 150,
                            position: "relative",
                          }}
                        >
                          <FileOutlined style={{ color: "#1890ff" }} />
                          <Text ellipsis style={{ fontSize: 12, maxWidth: 80 }}>
                            {file.name}
                          </Text>
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => removeAttachment(idx)}
                            style={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              background: "white",
                              borderRadius: "50%",
                              width: 20,
                              height: 20,
                              minWidth: 20,
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

      {/* INPUT (ALWAYS VISIBLE) */}
      <div
        style={{
          padding: 14,
          background: "white",
          borderTop: "1px solid #E5E7EB",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#F5F6F8",
            padding: "8px 14px",
            borderRadius: 30,
          }}
        >
          <Upload
            multiple
            showUploadList={false}
            beforeUpload={() => false}
           onChange={(info) => {
                      handleFileChange(info);
          }}
          >
                    <Badge count={attachedFiles.length} size="small">
            <Button
              type="text"
              icon={<PlusOutlined />}
              style={{ fontSize: 18, color: "#8c8c8c" }}
            />
                    </Badge>
          </Upload>

          <Input
            value={message}
            onChange={handleOnMessageChange}
            onPressEnter={sendChatMessage}
            placeholder="Type a message..."
            bordered={false}
            style={{
              flex: 1,
              background: "transparent",
            }}
          />

          <Button
            type="primary"
            shape="circle"
            icon={<SendOutlined />}
            onClick={sendChatMessage}
            disabled={!message && attachedFiles.length === 0}
          />
        </div>
      </div>
    </>
  ) : (
    <Empty description="Select a chat" />
  )}
</Content>

        {/* FILE PREVIEW MODAL */}
<Modal
  open={previewOpen}
          onCancel={() => {
            setPreviewOpen(false);
            setPreviewFiles([]);
            setCaption("");
          }}
  footer={null}
          width={600}
  centered
          title="Send Files"
>
          {/* FILE PREVIEW GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 12,
              marginBottom: 16,
              maxHeight: 400,
              overflowY: "auto",
            }}
          >
    {previewFiles.map((file, idx) => (
              <div
          key={idx}
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "2px solid #E5E7EB",
                  background: "#F5F5F5",
                }}
              >
                {file.type?.startsWith("image") ? (
                  <img
          src={URL.createObjectURL(file)}
                    alt="preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
        />
      ) : (
        <div
          style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 8,
                      textAlign: "center",
                    }}
                  >
                    <FileOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                    <Text
                      ellipsis
                      style={{ fontSize: 10, marginTop: 4, maxWidth: "100%" }}
        >
                      {file.name}
                    </Text>
        </div>
                )}

                {/* REMOVE BUTTON */}
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => removePreviewFile(idx)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 24,
                    height: 24,
                    minWidth: 24,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    fontSize: 10,
                  }}
                />
              </div>
    ))}
  </div>

  {/* CAPTION INPUT */}
          <Input.TextArea
            placeholder="Add a caption (optional)..."
    value={caption}
    onChange={(e) => setCaption(e.target.value)}
            autoSize={{ minRows: 2, maxRows: 4 }}
    style={{
              borderRadius: 8,
              marginBottom: 16,
    }}
  />

  {/* ACTION BUTTONS */}
  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button
              onClick={() => {
                setPreviewOpen(false);
                setPreviewFiles([]);
                setCaption("");
              }}
            >
              Cancel
            </Button>
    <Button
      type="primary"
              disabled={previewFiles.length === 0}
      onClick={() => {
        setAttachedFiles(previewFiles);
        setMessage(caption);
        setPreviewOpen(false);
                setPreviewFiles([]);
                setCaption("");
      }}
    >
              Attach {previewFiles.length} file
              {previewFiles.length > 1 ? "s" : ""}
    </Button>
  </div>
</Modal>
      </Layout>
    </>
  );
};

export default Chat;
