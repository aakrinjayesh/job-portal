import {
  Layout,
  Input,
  Button,
  Space,
  Avatar,
  Typography,
  Upload,
  Progress,
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
  SmileOutlined,
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
  const userType = location?.state?.userType;

  // group
  const groupUserIds = location?.state?.groupUserIds;
  const groupName = location?.state?.groupName;

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
  const [uploadFileList, setUploadFileList] = useState([]);

  const [progress, setProgress] = useState(0);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

useEffect(() => {
  if (loadingChats || loadingMessages) {
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // stop at 95%
        return prev + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  } else {
    setProgress(100);
  }
}, [loadingChats, loadingMessages]);


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
      (res) => {
        // Reverse the messages array so newest messages are at the bottom
        setMessages((res.data || []).reverse());
      },
      (error) => {
        console.error("Failed to load messages:", error);
        alertMessage.error(error || "Failed to load messages");
      },
    );
  };

  const sendChatMessage = async () => {
    if (!currentChat.current?._id || !socket) {
      return;
    }

    if (!message.trim() && attachedFiles.length === 0) {
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

  const newMessage = res.data;

  // If multiple attachments → split into multiple message objects
  if (newMessage.attachments?.length > 1) {
    const splitMessages = newMessage.attachments.map((file) => ({
      ...newMessage,
      _id: newMessage._id + "_" + file._id, // unique key
      attachments: [file], // only one file per message
    }));

    setMessages((prev) => [...prev, ...splitMessages]);
  } else {
    setMessages((prev) => [...prev, newMessage]);
  }

  updateChatLastMessage(currentChat.current?._id || "", newMessage);
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
      // Add new message at the end (bottom) of the array
    if (message.attachments?.length > 1) {
  const splitMessages = message.attachments.map((file) => ({
    ...message,
    _id: message._id + "_" + file._id,
    attachments: [file],
  }));

  setMessages((prev) => [...prev, ...splitMessages]);
} else {
  setMessages((prev) => [...prev, message]);
}


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
  if (info.fileList.length > 3) {
    alertMessage.error("Only 3 files allowed per message.");
    return;
  }

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

      <Layout style={{ height: "100vh", background: "#FFFFFF" }}>
        {/* SIDEBAR */}
        <Sider
          width={380}
          style={{
            background: "#FFFFFF",
            borderRight: "1px solid #E5E7EB",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: "20px 16px",
              background: "#F0F2F5",
              borderBottom: "1px solid #E5E7EB",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* TITLE ROW */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  Chats
                </Text>

                {userType !== "candidate" && (
                  <Button
                    onClick={() => setOpenAddChat(true)}
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{
                      borderRadius: 8,
                      height: 36,
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    New Chat
                  </Button>
                )}
              </div>

              {/* SEARCH */}
              <Search
                placeholder="Search conversations..."
                allowClear
                prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
                onChange={(e) =>
                  setLocalSearchQuery(e.target.value.toLowerCase())
                }
                style={{
                  borderRadius: 8,
                }}
                styles={{
                  input: {
                    background: "#FFFFFF",
                  },
                }}
              />
            </div>
          </div>

          {/* CHAT LIST */}
          <div
            style={{
              // // flex: 1,
              overflowY: "scroll",
              height: "80vh",
              // // background: "#FFFFFF",
            }}
          >
           {loadingChats ? (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      minHeight: "80vh", // match sidebar scroll height
      gap: 16,
    }}
  >

                <Progress
                  type="circle"
                  percent={progress}
                  width={80}
                  strokeColor={{
                   "0%": "#4F63F6",
        "100%": "#7C8CFF",
                  }}
                  trailColor="#E5E7EB"
                  showInfo={false}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#6B7280",
                  }}
                >
                  Loading chats...
                </Text>
              </div>
            ) : filteredChats.length === 0 ? (
              <Empty description="No chats yet" style={{ marginTop: 60 }} />
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
            background: "#E5DDD5",
          }}
        >
          {currentChat.current ? (
            <>
              {/* HEADER */}
              <div
                style={{
                  padding: "12px 20px",
                  background: "#F0F2F5",
                  borderBottom: "1px solid #D1D5DB",
                  flexShrink: 0,
                }}
              >
                <Space size={12}>
                  <Avatar src={chatMetadata?.avatar} size={42}>
                    {chatMetadata?.title?.[0]?.toUpperCase()}
                  </Avatar>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 16,
                        color: "#111827",
                        lineHeight: "20px",
                      }}
                    >
                      {chatMetadata?.title}
                    </div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        lineHeight: "16px",
                      }}
                    >
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
                  background: "#E5DDD5",
                  backgroundImage:
                    "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icGF0dGVybiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRTVEREQ1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')",
                  padding: 20,
                  minHeight: 0,
                }}
              >
                {loadingMessages ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      gap: 16,
                    }}
                  >
                    <Progress
                      type="circle"
                      percent={progress}
                      width={80}
                      strokeColor={{
                        "0%": "#4F63F6",
        "100%": "#7C8CFF",
                      }}
                      trailColor="#E5E7EB"
                      showInfo={false}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#6B7280",
                      }}
                    >
                      Loading messages...
                    </Text>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <MessageItem
                        key={msg._id}
                        message={msg}
                        isOwnMessage={msg.sender?._id === user?._id}
                        isGroupChatMessage={currentChat.current?.isGroupChat}
                        deleteChatMessage={deleteChatMessage}
                      />
                    ))}

                    {isTyping && <Typing />}

                    {/* Scroll anchor at the bottom */}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* ATTACHED FILES PREVIEW (ABOVE INPUT) */}
              {attachedFiles.length > 0 && (
                <div
                  style={{
                    padding: 12,
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
                            width: 70,
                            height: 70,
                            borderRadius: 8,
                            overflow: "hidden",
                            border: "2px solid #25D366",
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
                              background: "#EF4444",
                              color: "white",
                              borderRadius: "50%",
                              width: 22,
                              height: 22,
                              minWidth: 22,
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                              border: "none",
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: "10px 14px",
                            background: "#DCFCE7",
                            borderRadius: 8,
                            border: "1px solid #25D366",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            maxWidth: 180,
                            position: "relative",
                          }}
                        >
                          <FileOutlined
                            style={{ color: "#25D366", fontSize: 18 }}
                          />
                          <Text
                            ellipsis
                            style={{
                              fontSize: 13,
                              maxWidth: 100,
                              color: "#047857",
                            }}
                          >
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
                              background: "#EF4444",
                              color: "white",
                              borderRadius: "50%",
                              width: 22,
                              height: 22,
                              minWidth: 22,
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                              border: "none",
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
                  padding: 16,
                  background: "#F0F2F5",
                  borderTop: "1px solid #D1D5DB",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#FFFFFF",
                    padding: "8px 12px",
                    borderRadius: 24,
                  }}
                >
               <Upload
  multiple
  maxCount={3} // ✅ HARD LIMIT
  fileList={uploadFileList}
  showUploadList={false}
  beforeUpload={() => false}
  onChange={(info) => {
    if (info.fileList.length > 3) {
      alertMessage.error("You can send maximum 3 files at once.");
      return;
    }

    setUploadFileList(info.fileList);
    handleFileChange(info);
  }}
>

                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      style={{
                        fontSize: 20,
                        color: "#6B7280",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                      }}
                    />
                  </Upload>

                  <Input
                    value={message}
                    onChange={handleOnMessageChange}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        sendChatMessage();
                      }
                    }}
                    placeholder="Type a message"
                    bordered={false}
                    style={{
                      flex: 1,
                      background: "transparent",
                      fontSize: 15,
                    }}
                  />

                  <Button
                    type="primary"
                    shape="circle"
                    icon={<SendOutlined />}
                    onClick={sendChatMessage}
                    disabled={!message.trim() && attachedFiles.length === 0}
                    style={{
                      background: "#25D366",
                      borderColor: "#25D366",
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                background: "#F9FAFB",
              }}
            >
              <Empty
                description={
                  <Text style={{ fontSize: 16, color: "#6B7280" }}>
                    Select a chat to start messaging
                  </Text>
                }
              />
            </div>
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
          width={700}
          centered
          title={
            <Text style={{ fontSize: 18, fontWeight: 600 }}>
              Send {previewFiles.length} file
              {previewFiles.length > 1 ? "s" : ""}
            </Text>
          }
        >
          {/* FILE PREVIEW GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 12,
              marginBottom: 16,
              maxHeight: 450,
              overflowY: "auto",
              padding: 4,
            }}
          >
            {previewFiles.map((file, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "2px solid #E5E7EB",
                  background: "#F9FAFB",
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
                      padding: 12,
                      textAlign: "center",
                    }}
                  >
                    <FileOutlined style={{ fontSize: 40, color: "#25D366" }} />
                    <Text
                      ellipsis
                      style={{
                        fontSize: 11,
                        marginTop: 8,
                        maxWidth: "100%",
                        color: "#6B7280",
                      }}
                    >
                      {file.name}
                    </Text>
                  </div>
                )}

                {/* REMOVE BUTTON */}
                <Button
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => removePreviewFile(idx)}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 28,
                    height: 28,
                    minWidth: 28,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    fontSize: 12,
                    background: "#EF4444",
                    color: "white",
                    border: "none",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
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
              fontSize: 14,
            }}
          />

          {/* ACTION BUTTONS */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button
              size="large"
              onClick={() => {
                setPreviewOpen(false);
                setPreviewFiles([]);
                setCaption("");
              }}
              style={{
                borderRadius: 8,
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              disabled={previewFiles.length === 0}
              onClick={() => {
                setAttachedFiles(previewFiles);
                setMessage(caption);
                setPreviewOpen(false);
                setPreviewFiles([]);
                setCaption("");
                setUploadFileList([]); 
              }}
              style={{
                borderRadius: 8,
                background: "#25D366",
                borderColor: "#25D366",
              }}
            >
              Send {previewFiles.length} file
              {previewFiles.length > 1 ? "s" : ""}
            </Button>
          </div>
        </Modal>
      </Layout>
    </>
  );
};

export default Chat;
