// import {
//   ArrowDownTrayIcon,
//   EllipsisVerticalIcon,
//   MagnifyingGlassPlusIcon,
//   PaperClipIcon,
//   TrashIcon,
//   XMarkIcon,
// } from "@heroicons/react/20/solid";
// import moment from "moment";
// import { useState } from "react";
// import { classNames } from "../../utils";

// const MessageItem = ({
//   isOwnMessage,
//   isGroupChatMessage,
//   message,
//   deleteChatMessage,
// }) => {
//   const [resizedImage, setResizedImage] = useState(null);
//   const [openOptions, setOpenOptions] = useState(false);

//   return (
//     <>
//       {resizedImage && (
//         <div className="h-full z-40 p-8 absolute inset-0 bg-black/70 flex justify-center items-center">
//           <XMarkIcon
//             className="absolute top-5 right-5 w-9 h-9 text-white cursor-pointer"
//             onClick={() => setResizedImage(null)}
//           />
//           <img
//             className="w-full h-full object-contain"
//             src={resizedImage}
//             alt="chat image"
//           />
//         </div>
//       )}

//       <div
//         className={classNames(
//           "flex justify-start items-end gap-3 max-w-lg",
//           isOwnMessage ? "ml-auto" : ""
//         )}
//       >
//         <img
//           src={message.sender?.avatar?.url}
//           alt={message.sender?.username}
//           className={classNames(
//             "h-7 w-7 rounded-full object-cover",
//             isOwnMessage ? "order-2" : "order-1"
//           )}
//         />

//         <div
//           onMouseLeave={() => setOpenOptions(false)}
//           className={classNames(
//             "p-4 rounded-3xl flex flex-col cursor-pointer group",
//             isOwnMessage
//               ? "order-1 bg-primary rounded-br-none"
//               : "order-2 bg-secondary rounded-bl-none"
//           )}
//         >
//           {isGroupChatMessage && !isOwnMessage && (
//             <p className="text-xs font-semibold mb-2 text-success">
//               {message.sender?.username}
//             </p>
//           )}

//           {message?.attachments?.length > 0 && (
//             <div>
//               {isOwnMessage && (
//                 <button
//                   className="self-center p-1 relative"
//                   onClick={() => setOpenOptions(!openOptions)}
//                 >
//                   <EllipsisVerticalIcon className="w-4 text-zinc-300" />
//                   {openOptions && (
//                     <div className="absolute z-30 bg-dark p-2 rounded-lg border border-secondary">
//                       <p
//                         onClick={() => {
//                           if (confirm("Delete this message?")) {
//                             deleteChatMessage(message);
//                           }
//                         }}
//                         className="text-danger cursor-pointer text-xs flex items-center"
//                       >
//                         <TrashIcon className="h-4 w-4 mr-1" /> Delete Message
//                       </p>
//                     </div>
//                   )}
//                 </button>
//               )}

//               <div
//                 className={classNames(
//                   "grid gap-2",
//                   message.attachments.length === 1
//                     ? "grid-cols-1"
//                     : message.attachments.length === 2
//                     ? "grid-cols-2"
//                     : "grid-cols-3"
//                 )}
//               >
//                 {message.attachments.map((file) => (
//                   <div
//                     key={file._id}
//                     className="relative aspect-square rounded-xl overflow-hidden cursor-pointer"
//                   >
//                     <button
//                       onClick={() => setResizedImage(file.url)}
//                       className="absolute inset-0 flex justify-center items-center bg-black/60 opacity-0 group-hover:opacity-100 transition"
//                     >
//                       <MagnifyingGlassPlusIcon className="h-6 w-6 text-white" />
//                       <a
//                         href={file.url}
//                         download
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         <ArrowDownTrayIcon className="h-6 w-6 text-white ml-2" />
//                       </a>
//                     </button>
//                     <img
//                       src={file.url}
//                       alt="attachment"
//                       className="h-full w-full object-cover"
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {message.content && (
//             <div className="relative flex justify-between">
//               {isOwnMessage && (
//                 <button
//                   onClick={() => setOpenOptions(!openOptions)}
//                   className="relative"
//                 >
//                   <EllipsisVerticalIcon className="w-4 text-zinc-300" />
//                   {openOptions && (
//                     <div className="absolute left-[-100%] top-[-50%] bg-dark p-2 rounded-lg border border-secondary">
//                       <p
//                         onClick={() => {
//                           if (confirm("Delete this message?")) {
//                             deleteChatMessage(message);
//                           }
//                         }}
//                         className="text-danger cursor-pointer text-xs flex items-center"
//                       >
//                         <TrashIcon className="h-4 w-4 mr-1" /> Delete Message
//                       </p>
//                     </div>
//                   )}
//                 </button>
//               )}
//               <p className="text-sm">{message.content}</p>
//             </div>
//           )}

//           <p
//             className={classNames(
//               "mt-1 text-[10px] flex items-center justify-end",
//               isOwnMessage ? "text-zinc-50" : "text-zinc-400"
//             )}
//           >
//             {message.attachments.length > 0 && (
//               <PaperClipIcon className="h-3 w-3 mr-1" />
//             )}
//             {moment(message.updatedAt).fromNow()}
//           </p>
//         </div>
//       </div>
//     </>
//   );
// };

// export default MessageItem;

import { Avatar, Dropdown, Modal, Image, Tag } from "antd";
import {
  MoreOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useState } from "react";

const MessageItem = ({
  isOwnMessage,
  isGroupChatMessage,
  message,
  deleteChatMessage,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete this message?",
      okText: "Delete",
      okType: "danger",
      onOk: () => deleteChatMessage(message),
    });
  };

  const menuItems = [
    {
      key: "delete",
      label: "Delete Message",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: handleDelete,
    },
  ];

  const messageContainerStyle = {
    display: "flex",
    justifyContent: isOwnMessage ? "flex-end" : "flex-start",
    alignItems: "flex-end",
    gap: 12,
    maxWidth: "70%",
    marginLeft: isOwnMessage ? "auto" : 0,
    marginRight: isOwnMessage ? 0 : "auto",
    marginBottom: 16,
  };

  const bubbleStyle = {
    padding: "12px 16px",
    borderRadius: 16,
    background: isOwnMessage ? "#1890ff" : "#f5f5f5",
    color: isOwnMessage ? "#fff" : "#000",
    position: "relative",
    maxWidth: "100%",
  };

  if (isOwnMessage) {
    bubbleStyle.borderBottomRightRadius = 4;
  } else {
    bubbleStyle.borderBottomLeftRadius = 4;
  }

  return (
    <>
      <Image.PreviewGroup
        preview={{
          visible: previewVisible,
          onVisibleChange: setPreviewVisible,
          current: previewImage,
        }}
      >
        <div style={messageContainerStyle}>
          {!isOwnMessage && (
            <Avatar src={message.sender?.avatar?.url} size={32} />
          )}

          <div style={{ flex: 1, maxWidth: "100%" }}>
            <div style={bubbleStyle}>
              {isGroupChatMessage && !isOwnMessage && (
                <Tag
                  color="success"
                  style={{ marginBottom: 8, fontSize: 11, padding: "0 6px" }}
                >
                  {message.sender?.username}
                </Tag>
              )}

              {message?.attachments?.length > 0 && (
                <div style={{ marginBottom: message.content ? 8 : 0 }}>
                  {isOwnMessage && (
                    <Dropdown
                      menu={{ items: menuItems }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <MoreOutlined
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          cursor: "pointer",
                          fontSize: 16,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  )}

                  <div
                    style={{
                      display: "grid",
                      gap: 8,
                      gridTemplateColumns:
                        message.attachments.length === 1
                          ? "1fr"
                          : message.attachments.length === 2
                          ? "1fr 1fr"
                          : "1fr 1fr 1fr",
                    }}
                  >
                    {message.attachments.map((file) => (
                      <div
                        key={file._id}
                        style={{
                          position: "relative",
                          aspectRatio: "1",
                          borderRadius: 8,
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                      >
                        <Image
                          src={file.url}
                          alt="attachment"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          preview={{
                            mask: (
                              <div style={{ display: "flex", gap: 8 }}>
                                <span>Preview</span>
                                <a
                                  href={file.url}
                                  download
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <DownloadOutlined />
                                </a>
                              </div>
                            ),
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {message.content && (
                <div style={{ position: "relative" }}>
                  {isOwnMessage && !message.attachments?.length && (
                    <Dropdown
                      menu={{ items: menuItems }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <MoreOutlined
                        style={{
                          position: "absolute",
                          top: -4,
                          left: -28,
                          cursor: "pointer",
                          fontSize: 16,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  )}
                  <p style={{ margin: 0, fontSize: 14 }}>{message.content}</p>
                </div>
              )}

              <div
                style={{
                  marginTop: 4,
                  fontSize: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  opacity: 0.7,
                }}
              >
                {message.attachments?.length > 0 && (
                  <PaperClipOutlined style={{ marginRight: 4 }} />
                )}
                {moment(message.updatedAt).fromNow()}
              </div>
            </div>
          </div>

          {isOwnMessage && (
            <Avatar src={message.sender?.avatar?.url} size={32} />
          )}
        </div>
      </Image.PreviewGroup>
    </>
  );
};

export default MessageItem;
