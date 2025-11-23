// import {
//   PaperAirplaneIcon,
//   PaperClipIcon,
//   XCircleIcon,
// } from "@heroicons/react/20/solid";
// import { useEffect, useRef, useState } from "react";
// import {
//   deleteMessage,
//   getChatMessages,
//   getUserChats,
//   sendMessage,
// } from "../api";
// import AddChatModal from "../components/chat/AddChatModal";
// import ChatItem from "../components/chat/ChatItem";
// import MessageItem from "../components/chat/MessageItem";
// import Typing from "../components/chat/Typing";
// import Input from "../components/Input";
// import { useAuth } from "../context/AuthContext";
// import { useSocket } from "../context/SocketContext";
// import {
//   LocalStorage,
//   classNames,
//   getChatObjectMetadata,
//   requestHandler,
// } from "../utils";

// const CONNECTED_EVENT = "connected";
// const DISCONNECT_EVENT = "disconnect";
// const JOIN_CHAT_EVENT = "joinChat";
// const NEW_CHAT_EVENT = "newChat";
// const TYPING_EVENT = "typing";
// const STOP_TYPING_EVENT = "stopTyping";
// const MESSAGE_RECEIVED_EVENT = "messageReceived";
// const LEAVE_CHAT_EVENT = "leaveChat";
// const UPDATE_GROUP_NAME_EVENT = "updateGroupName";
// const MESSAGE_DELETE_EVENT = "messageDeleted";

// const ChatPage = () => {
//   const { user, logout } = useAuth();
//   const { socket } = useSocket();

//   const currentChat = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   const [isConnected, setIsConnected] = useState(false);
//   const [openAddChat, setOpenAddChat] = useState(false);
//   const [loadingChats, setLoadingChats] = useState(false);
//   const [loadingMessages, setLoadingMessages] = useState(false);
//   const [chats, setChats] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [unreadMessages, setUnreadMessages] = useState([]);
//   const [isTyping, setIsTyping] = useState(false);
//   const [selfTyping, setSelfTyping] = useState(false);
//   const [message, setMessage] = useState("");
//   const [localSearchQuery, setLocalSearchQuery] = useState("");
//   const [attachedFiles, setAttachedFiles] = useState([]);

//   const updateChatLastMessage = (chatToUpdateId, message) => {
//     const chatToUpdate = chats.find((chat) => chat._id === chatToUpdateId);
//     if (!chatToUpdate) return;
//     chatToUpdate.lastMessage = message;
//     chatToUpdate.updatedAt = message?.updatedAt;
//     setChats([
//       chatToUpdate,
//       ...chats.filter((chat) => chat._id !== chatToUpdateId),
//     ]);
//   };

//   const updateChatLastMessageOnDeletion = (chatToUpdateId, message) => {
//     const chatToUpdate = chats.find((chat) => chat._id === chatToUpdateId);
//     if (!chatToUpdate) return;

//     if (chatToUpdate.lastMessage?._id === message._id) {
//       requestHandler(
//         async () => getChatMessages(chatToUpdateId),
//         null,
//         (req) => {
//           const { data } = req;
//           chatToUpdate.lastMessage = data[0];
//           setChats([...chats]);
//         },
//         alert
//       );
//     }
//   };

//   const getChats = async () => {
//     requestHandler(
//       async () => await getUserChats(),
//       setLoadingChats,
//       (res) => setChats(res.data || []),
//       alert
//     );
//   };

//   const getMessages = async () => {
//     if (!currentChat.current?._id) return alert("No chat is selected");
//     if (!socket) return alert("Socket not available");

//     socket.emit(JOIN_CHAT_EVENT, currentChat.current?._id);

//     setUnreadMessages(
//       unreadMessages.filter((msg) => msg.chat !== currentChat.current?._id)
//     );

//     requestHandler(
//       async () => await getChatMessages(currentChat.current?._id || ""),
//       setLoadingMessages,
//       (res) => setMessages(res.data || []),
//       alert
//     );
//   };

//   const sendChatMessage = async () => {
//     if (!currentChat.current?._id || !socket) return;
//     socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);

//     await requestHandler(
//       async () =>
//         await sendMessage(
//           currentChat.current?._id || "",
//           message,
//           attachedFiles
//         ),
//       null,
//       (res) => {
//         setMessage("");
//         setAttachedFiles([]);
//         setMessages((prev) => [res.data, ...prev]);
//         updateChatLastMessage(currentChat.current?._id || "", res.data);
//       },
//       alert
//     );
//   };

//   const deleteChatMessage = async (message) => {
//     await requestHandler(
//       async () => await deleteMessage(message.chat, message._id),
//       null,
//       (res) => {
//         setMessages((prev) => prev.filter((msg) => msg._id !== res.data._id));
//         updateChatLastMessageOnDeletion(message.chat, message);
//       },
//       alert
//     );
//   };

//   const handleOnMessageChange = (e) => {
//     setMessage(e.target.value);

//     if (!socket || !isConnected) return;

//     if (!selfTyping) {
//       setSelfTyping(true);
//       socket.emit(TYPING_EVENT, currentChat.current?._id);
//     }

//     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

//     typingTimeoutRef.current = setTimeout(() => {
//       socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);
//       setSelfTyping(false);
//     }, 3000);
//   };

//   const onMessageReceived = (message) => {
//     if (message?.chat !== currentChat.current?._id) {
//       setUnreadMessages((prev) => [message, ...prev]);
//     } else {
//       setMessages((prev) => [message, ...prev]);
//     }
//     updateChatLastMessage(message.chat || "", message);
//   };

//   const onMessageDelete = (message) => {
//     if (message?.chat !== currentChat.current?._id) {
//       setUnreadMessages((prev) =>
//         prev.filter((msg) => msg._id !== message._id)
//       );
//     } else {
//       setMessages((prev) => prev.filter((msg) => msg._id !== message._id));
//     }
//     updateChatLastMessageOnDeletion(message.chat, message);
//   };

//   const onNewChat = (chat) => setChats((prev) => [chat, ...prev]);
//   const onConnect = () => setIsConnected(true);
//   const onDisconnect = () => setIsConnected(false);
//   const handleOnSocketTyping = (chatId) =>
//     chatId === currentChat.current?._id && setIsTyping(true);
//   const handleOnSocketStopTyping = (chatId) =>
//     chatId === currentChat.current?._id && setIsTyping(false);

//   useEffect(() => {
//     getChats();
//     const _currentChat = LocalStorage.get("currentChat");
//     if (_currentChat) {
//       currentChat.current = _currentChat;
//       socket?.emit(JOIN_CHAT_EVENT, _currentChat._id);
//       getMessages();
//     }
//   }, []);

//   useEffect(() => {
//     if (!socket) return;

//     socket.on(CONNECTED_EVENT, onConnect);
//     socket.on(DISCONNECT_EVENT, onDisconnect);
//     socket.on(TYPING_EVENT, handleOnSocketTyping);
//     socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
//     socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
//     socket.on(NEW_CHAT_EVENT, onNewChat);
//     socket.on(MESSAGE_DELETE_EVENT, onMessageDelete);

//     return () => {
//       socket.off(CONNECTED_EVENT, onConnect);
//       socket.off(DISCONNECT_EVENT, onDisconnect);
//       socket.off(TYPING_EVENT, handleOnSocketTyping);
//       socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
//       socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
//       socket.off(NEW_CHAT_EVENT, onNewChat);
//       socket.off(MESSAGE_DELETE_EVENT, onMessageDelete);
//     };
//   }, [socket, chats]);

//   return (
//     <>
//       <AddChatModal
//         open={openAddChat}
//         onClose={() => setOpenAddChat(false)}
//         onSuccess={getChats}
//       />

//       <div className="w-full justify-between items-stretch h-screen flex flex-shrink-0">
//         {/* Left Chat List */}
//         <div className="w-1/3 relative overflow-y-auto px-4">
//           <div className="sticky top-0 bg-dark py-4 flex justify-between items-center gap-4">
//             <button
//               className="bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-sm px-5 py-4"
//               onClick={logout}
//             >
//               Log Out
//             </button>
//             <Input
//               placeholder="Search user or group..."
//               value={localSearchQuery}
//               onChange={(e) =>
//                 setLocalSearchQuery(e.target.value.toLowerCase())
//               }
//             />
//             <button
//               onClick={() => setOpenAddChat(true)}
//               className="bg-primary text-black py-4 px-5 rounded-xl"
//             >
//               + Add chat
//             </button>
//           </div>

//           {loadingChats ? (
//             <div className="flex justify-center items-center h-[calc(100%-88px)]">
//               <Typing />
//             </div>
//           ) : (
//             [...chats]
//               .filter((chat) =>
//                 localSearchQuery
//                   ? getChatObjectMetadata(chat, user)
//                       .title?.toLowerCase()
//                       ?.includes(localSearchQuery)
//                   : true
//               )
//               .map((chat) => (
//                 <ChatItem
//                   key={chat._id}
//                   chat={chat}
//                   isActive={chat._id === currentChat.current?._id}
//                   unreadCount={
//                     unreadMessages.filter((n) => n.chat === chat._id).length
//                   }
//                   onClick={(chat) => {
//                     if (currentChat.current?._id === chat._id) return;
//                     LocalStorage.set("currentChat", chat);
//                     currentChat.current = chat;
//                     setMessage("");
//                     getMessages();
//                   }}
//                   onChatDelete={(chatId) => {
//                     setChats((prev) => prev.filter((c) => c._id !== chatId));
//                     if (currentChat.current?._id === chatId) {
//                       currentChat.current = null;
//                       LocalStorage.remove("currentChat");
//                     }
//                   }}
//                 />
//               ))
//           )}
//         </div>

//         {/* Right Chat Section */}
//         <div className="w-2/3 border-l border-secondary">
//           {currentChat.current && currentChat.current?._id ? (
//             <>
//               <div className="p-4 sticky top-0 bg-dark z-20 flex justify-between items-center border-b border-secondary">
//                 <div className="flex items-center gap-3">
//                   <img
//                     className="h-14 w-14 rounded-full object-cover"
//                     src={
//                       getChatObjectMetadata(currentChat.current, user).avatar
//                     }
//                   />
//                   <div>
//                     <p className="font-bold">
//                       {getChatObjectMetadata(currentChat.current, user).title}
//                     </p>
//                     <small className="text-zinc-400">
//                       {
//                         getChatObjectMetadata(currentChat.current, user)
//                           .description
//                       }
//                     </small>
//                   </div>
//                 </div>
//               </div>

//               <div
//                 className={classNames(
//                   "p-8 overflow-y-auto flex flex-col-reverse gap-6",
//                   attachedFiles.length > 0
//                     ? "h-[calc(100vh-336px)]"
//                     : "h-[calc(100vh-176px)]"
//                 )}
//               >
//                 {loadingMessages ? (
//                   <div className="flex justify-center items-center h-[calc(100%-88px)]">
//                     <Typing />
//                   </div>
//                 ) : (
//                   <>
//                     {isTyping ? <Typing /> : null}
//                     {messages?.map((msg) => (
//                       <MessageItem
//                         key={msg._id}
//                         isOwnMessage={msg.sender?._id === user?._id}
//                         isGroupChatMessage={currentChat.current?.isGroupChat}
//                         message={msg}
//                         deleteChatMessage={deleteChatMessage}
//                       />
//                     ))}
//                   </>
//                 )}
//               </div>

//               {attachedFiles.length > 0 && (
//                 <div className="grid gap-4 grid-cols-5 p-4">
//                   {attachedFiles.map((file, i) => (
//                     <div
//                       key={i}
//                       className="group w-32 h-32 relative rounded-xl cursor-pointer"
//                     >
//                       <button
//                         onClick={() =>
//                           setAttachedFiles(
//                             attachedFiles.filter((_, ind) => ind !== i)
//                           )
//                         }
//                         className="absolute -top-2 -right-2"
//                       >
//                         <XCircleIcon className="h-6 w-6 text-white" />
//                       </button>
//                       <img
//                         className="h-full w-full rounded-xl object-cover"
//                         src={URL.createObjectURL(file)}
//                         alt="attachment"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <div className="sticky bottom-0 p-4 flex items-center gap-2 border-t border-secondary">
//                 <input
//                   hidden
//                   id="attachments"
//                   type="file"
//                   multiple
//                   onChange={(e) => {
//                     if (e.target.files) {
//                       setAttachedFiles([...e.target.files]);
//                     }
//                   }}
//                 />
//                 <label
//                   htmlFor="attachments"
//                   className="p-4 rounded-full bg-dark hover:bg-secondary cursor-pointer"
//                 >
//                   <PaperClipIcon className="w-6 h-6" />
//                 </label>

//                 <Input
//                   placeholder="Message"
//                   value={message}
//                   onChange={handleOnMessageChange}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") sendChatMessage();
//                   }}
//                 />

//                 <button
//                   onClick={sendChatMessage}
//                   disabled={!message && attachedFiles.length <= 0}
//                   className="p-4 rounded-full bg-dark hover:bg-secondary disabled:opacity-50"
//                 >
//                   <PaperAirplaneIcon className="w-6 h-6" />
//                 </button>
//               </div>
//             </>
//           ) : (
//             <div className="w-full h-full flex justify-center items-center">
//               No chat selected
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default ChatPage;

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
  const userType = location?.state?.userType;

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
    if (!candidate) return;

    const startChatFlow = async () => {
      try {
        // 1️⃣ Get chat users
        const response = await getAvailableUsers();
        const allUsers = response?.data?.data || [];

        // 2️⃣ Match by name
        const matchedUser = allUsers.find(
          (u) =>
            u.username?.trim().toLowerCase() ===
            candidate.name?.trim().toLowerCase()
        );

        if (!matchedUser) {
          console.warn("No matching chat user found for:", candidate.name);
          return;
        }

        // 3️⃣ Create or get existing chat
        const chatResponse = await createUserChat(matchedUser._id);
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
