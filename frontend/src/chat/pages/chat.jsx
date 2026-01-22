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
} from "antd";
import {
  SendOutlined,
  PaperClipOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import {
  deleteMessage,
  getChatMessages,
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
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [caption, setCaption] = useState("");

  const currentChat = useRef(null);
  const typingTimeoutRef = useRef(null);

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
  const messagesEndRef = useRef(null);


  const getChats = async () => {
    requestHandler(
      async () => await getUserChats(),
      setLoadingChats,
      (res) => setChats(res.data || [])
    );
  };

  const getMessages = async () => {
    if (!currentChat.current?._id || !socket) return;
    socket.emit(JOIN_CHAT_EVENT, currentChat.current._id);

    setUnreadMessages(
      unreadMessages.filter((m) => m.chat !== currentChat.current._id)
    );

    requestHandler(
      async () => await getChatMessages(currentChat.current._id),
      setLoadingMessages,
      (res) => setMessages(res.data || [])
    );
  };

  const sendChatMessage = async () => {
    if (!currentChat.current?._id || !socket) return;
    socket.emit(STOP_TYPING_EVENT, currentChat.current._id);

    await requestHandler(
      async () =>
        await sendMessage(
          currentChat.current._id,
          message,
          attachedFiles
        ),
      null,
      (res) => {
        setMessage("");
        setAttachedFiles([]);
       setMessages((prev) => [...prev, res.data]);
      }
    );
  };

  useEffect(() => {
 messagesEndRef.current?.scrollIntoView({
  behavior: "smooth",
});

}, [messages]);


  const handleOnMessageChange = (e) => {
    setMessage(e.target.value);
    if (!socket) return;

    if (!selfTyping) {
      setSelfTyping(true);
      socket.emit(TYPING_EVENT, currentChat.current?._id);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);
      setSelfTyping(false);
    }, 3000);
  };

  useEffect(() => {
    getChats();
  }, []);

  const filteredChats = chats.filter((chat) =>
    localSearchQuery
      ? getChatObjectMetadata(chat, user)
          .title?.toLowerCase()
          .includes(localSearchQuery)
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
            background: "#EEF2F5",
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
    <Text style={{ fontSize: 16, fontWeight: 600 }}>
      All Chats
    </Text>

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
    background: "#f9fbfdff",
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
            <div style={{ fontWeight: 600 }}>
              {chatMetadata?.title}
            </div>
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
              />
            ))}

            {/* ✅ ONLY PLACE FOR REF */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* INPUT (ALWAYS VISIBLE) */}
      <div
        style={{
          padding: 14,
          background: "#E9EEF3",
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
                     const files = info.fileList.map((f) => f.originFileObj);
                     setPreviewFiles(files);
                     setCaption("");
                     setPreviewOpen(true);
          }}

          >
            <Button
              type="text"
              icon={<PlusOutlined />}
              style={{ fontSize: 18, color: "#8c8c8c" }}
            />
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
<Modal
  open={previewOpen}
  onCancel={() => setPreviewOpen(false)}
  footer={null}
  width={500}
  centered
>
  {/* FILE PREVIEW */}
  <div style={{ textAlign: "center", marginBottom: 16 }}>
    {previewFiles.map((file, idx) => (
      file.type?.startsWith("image") ? (
        <Image
          key={idx}
          src={URL.createObjectURL(file)}
          style={{ maxHeight: 240, borderRadius: 8 }}
        />
      ) : (
        <div
          key={idx}
          style={{
            padding: 12,
            background: "#F5F5F5",
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          📎 {file.name}
        </div>
      )
    ))}
  </div>

  {/* CAPTION INPUT */}
  <Input
    placeholder="Add a caption…"
    value={caption}
    onChange={(e) => setCaption(e.target.value)}
    style={{
      borderRadius: 20,
      marginBottom: 12,
    }}
  />

  {/* ACTION BUTTONS */}
  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
    <Button onClick={() => setPreviewOpen(false)}>Cancel</Button>
    <Button
      type="primary"
      onClick={() => {
        setAttachedFiles(previewFiles);
        setMessage(caption);
        setPreviewOpen(false);
        sendChatMessage();
      }}
    >
      Send
    </Button>
  </div>
</Modal>

      </Layout>
    </>
  );
};

export default Chat;
