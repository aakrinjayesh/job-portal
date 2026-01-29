import { Avatar, Dropdown, Modal, Image, Tag, Button } from "antd";
import {
  MoreOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  DownloadOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  EyeOutlined,
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

  // Helper to determine if file is an image
  const isImageFile = (url) => {
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".bmp",
      ".svg",
    ];
    return imageExtensions.some((ext) => url.toLowerCase().includes(ext));
  };

  // Helper to get file icon based on extension
  const getFileIcon = (url) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes(".pdf"))
      return <FilePdfOutlined style={{ fontSize: 24, color: "#ff4d4f" }} />;
    if (lowerUrl.includes(".doc") || lowerUrl.includes(".docx"))
      return <FileWordOutlined style={{ fontSize: 24, color: "#1890ff" }} />;
    if (lowerUrl.includes(".xls") || lowerUrl.includes(".xlsx"))
      return <FileExcelOutlined style={{ fontSize: 24, color: "#52c41a" }} />;
    if (lowerUrl.includes(".txt"))
      return <FileTextOutlined style={{ fontSize: 24, color: "#8c8c8c" }} />;
    return <FileOutlined style={{ fontSize: 24, color: "#722ed1" }} />;
  };

  // Helper to get filename from URL
  const getFileName = (url) => {
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

 const messageContainerStyle = {
  display: "flex",
  justifyContent: isOwnMessage ? "flex-end" : "flex-start",
  alignItems: "flex-end",
  gap: 12,
  marginLeft: isOwnMessage ? "auto" : 0,
  marginRight: isOwnMessage ? 0 : "auto",
  marginBottom: 16,
};

 const bubbleStyle = {
    padding: "8px 12px",
  borderRadius: 16,
  background: isOwnMessage ? "#1890ff" : "white",
  color: isOwnMessage ? "#fff" : "#000",
  position: "relative",
    display: "inline-flex",
    width: "fit-content",
    maxWidth: "100%",
  wordBreak: "break-word",
};

  if (isOwnMessage) {
    bubbleStyle.borderBottomRightRadius = 4;
  } else {
    bubbleStyle.borderBottomLeftRadius = 4;
  }

  // Separate images and files
  const images =
    message?.attachments?.filter((file) => isImageFile(file.url)) || [];
  const files =
    message?.attachments?.filter((file) => !isImageFile(file.url)) || [];

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

<div
  style={{
              display: "inline-flex",
    maxWidth: "70%",
  }}
>
            <div style={bubbleStyle}>
              {isGroupChatMessage && !isOwnMessage && (
                <Tag
                  color="success"
                  style={{ marginBottom: 8, fontSize: 11, padding: "0 6px" }}
                >
                  {message.sender?.username}
                </Tag>
              )}

              {/* RENDER IMAGES */}
              {images.length > 0 && (
                <div
                  style={{
                    marginBottom: message.content || files.length > 0 ? 8 : 0,
                  }}
                >
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
                          color: isOwnMessage ? "#fff" : "#000",
                          background: isOwnMessage
                            ? "rgba(0,0,0,0.2)"
                            : "rgba(0,0,0,0.05)",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
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
                        images.length === 1
                          ? "1fr"
                          : images.length === 2
                          ? "1fr 1fr"
                          : "1fr 1fr 1fr",
                    }}
                  >
                    {images.map((file) => (
                      <div
                        key={file._id}
                        style={{
                          position: "relative",
                          aspectRatio: "1",
                          borderRadius: 8,
                          overflow: "hidden",
                          cursor: "pointer",
                          minWidth: images.length === 1 ? 200 : 100,
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
                              <div
                                style={{
                                  display: "flex",
                                  gap: 12,
                                  alignItems: "center",
                                }}
                              >
                                <EyeOutlined style={{ fontSize: 18 }} />
                                <a
                                  href={file.url}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ color: "white" }}
                                >
                                  <DownloadOutlined style={{ fontSize: 18 }} />
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

              {/* RENDER NON-IMAGE FILES */}
              {files.length > 0 && (
                <div style={{ marginBottom: message.content ? 8 : 0 }}>
                  {files.map((file) => (
                    <div
                      key={file._id}
                      style={{
                        padding: "10px 12px",
                        background: isOwnMessage
                          ? "rgba(255,255,255,0.15)"
                          : "#fff",
                        borderRadius: 8,
                        marginBottom: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        border: isOwnMessage
                          ? "1px solid rgba(255,255,255,0.2)"
                          : "1px solid #E5E7EB",
                        maxWidth: 280,
                      }}
                    >
                      {getFileIcon(file.url)}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: isOwnMessage ? "#fff" : "#000",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getFileName(file.url)}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: isOwnMessage
                              ? "rgba(255,255,255,0.7)"
                              : "#8c8c8c",
                            marginTop: 2,
                          }}
                        >
                          {file.url.toLowerCase().includes(".pdf") &&
                            "PDF Document"}
                          {file.url.toLowerCase().includes(".doc") &&
                            "Word Document"}
                          {file.url.toLowerCase().includes(".xls") &&
                            "Excel Spreadsheet"}
                          {!file.url.toLowerCase().includes(".pdf") &&
                            !file.url.toLowerCase().includes(".doc") &&
                            !file.url.toLowerCase().includes(".xls") &&
                            "File"}
                        </div>
                      </div>

                      <a
                        href={file.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={
                            <DownloadOutlined
                              style={{
                                fontSize: 16,
                                color: isOwnMessage ? "#fff" : "#1890ff",
                              }}
                            />
                          }
                          style={{
                            border: "none",
                            background: "transparent",
                          }}
                        />
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* RENDER TEXT CONTENT */}
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

              {/* TIMESTAMP */}
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
  {moment(message.createdAt).format("hh:mm A")}
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
