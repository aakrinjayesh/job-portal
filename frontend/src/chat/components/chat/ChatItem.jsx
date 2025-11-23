// import {
//   EllipsisVerticalIcon,
//   PaperClipIcon,
//   TrashIcon,
// } from "@heroicons/react/20/solid";
// import { InformationCircleIcon } from "@heroicons/react/24/outline";
// import moment from "moment";
// import { useState } from "react";
// import { deleteOneOnOneChat } from "../../api";
// import { useAuth } from "../../context/AuthContext";
// import { classNames, getChatObjectMetadata, requestHandler } from "../../utils";
// import GroupChatDetailsModal from "./GroupChatDetailsModal";

// const ChatItem = ({
//   chat,
//   onClick,
//   isActive,
//   unreadCount = 0,
//   onChatDelete,
// }) => {
//   const { user } = useAuth();
//   const [openOptions, setOpenOptions] = useState(false);
//   const [openGroupInfo, setOpenGroupInfo] = useState(false);

//   const deleteChat = async () => {
//     await requestHandler(
//       async () => await deleteOneOnOneChat(chat._id),
//       null,
//       () => onChatDelete(chat._id),
//       alert
//     );
//   };

//   if (!chat) return null;

//   return (
//     <>
//       <GroupChatDetailsModal
//         open={openGroupInfo}
//         onClose={() => setOpenGroupInfo(false)}
//         chatId={chat._id}
//         onGroupDelete={onChatDelete}
//       />

//       <div
//         role="button"
//         onClick={() => onClick(chat)}
//         onMouseLeave={() => setOpenOptions(false)}
//         className={classNames(
//           "group p-4 my-2 flex justify-between items-start cursor-pointer rounded-3xl hover:bg-secondary",
//           isActive ? "border border-zinc-500 bg-secondary" : "",
//           unreadCount > 0 ? "border border-success bg-success/20 font-bold" : ""
//         )}
//       >
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             setOpenOptions(!openOptions);
//           }}
//           className="self-center p-1 relative"
//         >
//           <EllipsisVerticalIcon className="h-6 text-zinc-300" />
//           <div
//             className={classNames(
//               "absolute bottom-0 translate-y-full text-sm w-52 bg-dark rounded-2xl p-2 border border-secondary",
//               openOptions ? "block" : "hidden"
//             )}
//           >
//             {chat.isGroupChat ? (
//               <p
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setOpenGroupInfo(true);
//                 }}
//                 className="p-4 inline-flex items-center hover:bg-secondary"
//               >
//                 <InformationCircleIcon className="h-4 w-4 mr-2" /> About group
//               </p>
//             ) : (
//               <p
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   const ok = confirm(
//                     "Are you sure you want to delete this chat?"
//                   );
//                   if (ok) deleteChat();
//                 }}
//                 className="p-4 text-danger inline-flex items-center hover:bg-secondary"
//               >
//                 <TrashIcon className="h-4 w-4 mr-2" /> Delete chat
//               </p>
//             )}
//           </div>
//         </button>

//         <div className="flex items-center flex-shrink-0">
//           {chat.isGroupChat ? (
//             <div className="w-12 relative h-12 flex-shrink-0">
//               {chat.participants.slice(0, 3).map((p, i) => (
//                 <img
//                   key={p._id}
//                   src={p.avatar.url}
//                   alt={p.username}
//                   className={classNames(
//                     "w-8 h-8 border border-white rounded-full absolute",
//                     i === 0
//                       ? "left-0 z-30"
//                       : i === 1
//                       ? "left-3 z-20"
//                       : "left-6 z-10"
//                   )}
//                 />
//               ))}
//             </div>
//           ) : (
//             <img
//               src={getChatObjectMetadata(chat, user).avatar}
//               className="w-12 h-12 rounded-full"
//               alt="chat avatar"
//             />
//           )}
//         </div>

//         <div className="w-full">
//           <p className="truncate font-semibold">
//             {getChatObjectMetadata(chat, user).title}
//           </p>
//           <div className="inline-flex items-center text-left text-sm text-zinc-400">
//             {chat.lastMessage && chat.lastMessage.attachments.length > 0 && (
//               <PaperClipIcon className="h-3 w-3 mr-1" />
//             )}
//             <span>{getChatObjectMetadata(chat, user).lastMessage}</span>
//           </div>
//         </div>

//         <div className="flex flex-col items-end text-xs text-zinc-400">
//           <small>{moment(chat.updatedAt).fromNow()}</small>
//           {unreadCount > 0 && (
//             <span className="bg-success text-white px-2 rounded-full text-xs">
//               {unreadCount > 9 ? "9+" : unreadCount}
//             </span>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default ChatItem;

import { Dropdown, Badge, Avatar, Card, Popconfirm } from "antd";
import {
  MoreOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useState } from "react";
import { deleteOneOnOneChat } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { getChatObjectMetadata, requestHandler } from "../../utils";
import GroupChatDetailsModal from "./GroupChatDetailsModal";

const ChatItem = ({
  chat,
  onClick,
  isActive,
  unreadCount = 0,
  onChatDelete,
}) => {
  const { user } = useAuth();
  const [openGroupInfo, setOpenGroupInfo] = useState(false);

  const deleteChat = async () => {
    await requestHandler(
      async () => await deleteOneOnOneChat(chat._id),
      null,
      () => onChatDelete(chat._id),
      alert
    );
  };

  const menuItems = chat.isGroupChat
    ? [
        {
          key: "info",
          label: "About group",
          icon: <InfoCircleOutlined />,
        },
      ]
    : [
        {
          key: "delete",
          label: (
            <Popconfirm
              title="Delete this chat?"
              description="This action cannot be undone."
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={deleteChat}
              onClick={(e) => e.stopPropagation()}
            >
              <span>Delete chat</span>
            </Popconfirm>
          ),
          icon: <DeleteOutlined />,
          danger: true,
        },
      ];

  if (!chat) return null;

  const chatMetadata = getChatObjectMetadata(chat, user);
  console.log("chatmetadata", chatMetadata);

  return (
    <>
      <GroupChatDetailsModal
        open={openGroupInfo}
        onClose={() => setOpenGroupInfo(false)}
        chatId={chat._id}
        onGroupDelete={onChatDelete}
      />
      <Badge count={unreadCount > 9 ? "9+" : unreadCount} offset={[-10, 10]}>
        <Card
          hoverable
          // className={isActive ? "border-gray-500" : ""}

          style={{
            marginBottom: 8,

            borderRadius: 24,
            background: isActive
              ? "#f5f5f5"
              : unreadCount > 0
              ? "#f6ffed"
              : "transparent",
            borderColor: unreadCount > 0 ? "#52c41a" : undefined,
          }}
          onClick={() => onClick(chat)}
          // bodyStyle={{ padding: "12px 16px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* <Dropdown
              // menu={{ items: menuItems }}
              onClick={menuOnClick}
              items={menuItems}
              trigger={["click"]}
              placement="bottomLeft"
            >
              <MoreOutlined
                style={{ fontSize: 20, cursor: "pointer", color: "#8c8c8c" }}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown> */}

            <Dropdown
              menu={{
                items: menuItems,
                onClick: ({ key }) => {
                  if (key === "info") setOpenGroupInfo(true);
                },
              }}
              trigger={["click"]}
              placement="bottomLeft"
            >
              <MoreOutlined
                style={{ fontSize: 20, cursor: "pointer", color: "#8c8c8c" }}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>

            <div style={{ flexShrink: 0 }}>
              {chat.isGroupChat ? (
                <Avatar.Group maxCount={3} size={48}>
                  {chat.participants.slice(0, 3).map((p) => (
                    <Avatar key={p._id} src={p.avatar.url} />
                  ))}
                </Avatar.Group>
              ) : (
                <Avatar src={chatMetadata.avatar} size={48} />
              )}
            </div>

            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontWeight: unreadCount > 0 ? 600 : 400,
                  marginBottom: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {chatMetadata.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#8c8c8c",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {chat.lastMessage &&
                  chat.lastMessage.attachments.length > 0 && (
                    <PaperClipOutlined style={{ marginRight: 4 }} />
                  )}
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {chatMetadata.lastMessage}
                </span>
              </div>
            </div>

            <div
              style={{
                fontSize: 11,
                color: "#8c8c8c",
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {moment(chat.updatedAt).fromNow()}
            </div>
          </div>
        </Card>
      </Badge>
    </>
  );
};

export default ChatItem;
