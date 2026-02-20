import {
  Avatar,
  Dropdown,
  Image,
  Button,
  Popconfirm,
  Space,
  Typography,
} from "antd";
import {
  MoreOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FileZipOutlined,
  EyeOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useState } from "react";

const { Text } = Typography;

const MessageItem = ({
  isOwnMessage,
  isGroupChatMessage,
  message,
  deleteChatMessage,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [hoveredFile, setHoveredFile] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = () => {
    deleteChatMessage(message);
  };

  const menuItems = [
    {
      key: "delete",
      label: (
        <Popconfirm
          title="Delete this message?"
          description="Are you sure you want to delete this message?"
          okText="Delete"
          okType="danger"
          cancelText="Cancel"
          onConfirm={handleDelete}
          onClick={(e) => e.stopPropagation()}
        >
          <Text type="danger">Delete Message</Text>
        </Popconfirm>
      ),
      icon: <DeleteOutlined />,
      danger: true,
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
      return <FilePdfOutlined style={{ fontSize: 32, color: "#D32F2F" }} />;
    if (lowerUrl.includes(".doc") || lowerUrl.includes(".docx"))
      return <FileWordOutlined style={{ fontSize: 32, color: "#2196F3" }} />;
    if (lowerUrl.includes(".xls") || lowerUrl.includes(".xlsx"))
      return <FileExcelOutlined style={{ fontSize: 32, color: "#4CAF50" }} />;
    if (lowerUrl.includes(".txt"))
      return <FileTextOutlined style={{ fontSize: 32, color: "#757575" }} />;
    if (lowerUrl.includes(".zip") || lowerUrl.includes(".rar"))
      return <FileZipOutlined style={{ fontSize: 32, color: "#FF9800" }} />;
    if (isImageFile(url))
      return <FileImageOutlined style={{ fontSize: 32, color: "#E91E63" }} />;
    return <FileOutlined style={{ fontSize: 32, color: "#9C27B0" }} />;
  };

  // Helper to get filename from URL
  const getFileName = (url) => {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1];
    const decodedName = decodeURIComponent(fileName);
    return decodedName.length > 30
      ? decodedName.substring(0, 27) + "..."
      : decodedName;
  };

  // Helper to format file size
  const getFileSize = (url) => {
    const sizes = ["1.2 MB", "856 KB", "3.4 MB", "512 KB", "2.1 MB"];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  // Helper to get file type label
  const getFileType = (url) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes(".pdf")) return "PDF";
    if (lowerUrl.includes(".doc") || lowerUrl.includes(".docx")) return "DOC";
    if (lowerUrl.includes(".xls") || lowerUrl.includes(".xlsx")) return "XLS";
    if (lowerUrl.includes(".txt")) return "TXT";
    if (lowerUrl.includes(".zip")) return "ZIP";
    if (lowerUrl.includes(".rar")) return "RAR";
    return "FILE";
  };

  // Separate images and files
  const images =
    message?.attachments?.filter((file) => isImageFile(file.url)) || [];
  const files =
    message?.attachments?.filter((file) => !isImageFile(file.url)) || [];

  const hasContent = message.content && message.content.trim();
  const hasImages = images.length > 0;
  const hasFiles = files.length > 0;

  return (
    <Image.PreviewGroup
      preview={{
        visible: previewVisible,
        onVisibleChange: setPreviewVisible,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: isOwnMessage ? "flex-end" : "flex-start",
          alignItems: "flex-start",
          marginBottom: 8,
          paddingLeft: isOwnMessage ? "60px" : "8px",
          paddingRight: isOwnMessage ? "8px" : "60px",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Avatar for group chat (received messages) */}
        {!isOwnMessage && isGroupChatMessage && (
          <Avatar
            src={message.sender?.avatar?.url}
            size={32}
            style={{ marginTop: 4, marginRight: 8 }}
          >
            {message.sender?.username?.[0]?.toUpperCase()}
          </Avatar>
        )}

        {/* Message Bubble */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "65%",
            position: "relative",
          }}
        >
          <div
            style={{
              padding: 0,
              borderRadius: 8,
              background: isOwnMessage ? "#D9FDD3" : "#FFFFFF",
              color: "#000000",
              position: "relative",
              display: "inline-block",
              maxWidth: "100%",
              wordBreak: "break-word",
              boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
              overflow: "hidden",
            }}
          >
            {/* Group chat sender name */}
            {isGroupChatMessage && !isOwnMessage && (
              <div
                style={{
                  padding: "8px 12px 4px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#00897B",
                }}
              >
                {message.sender?.username}
              </div>
            )}

            {/* RENDER IMAGES */}
            {hasImages && (
              <div
                style={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns:
                    images.length === 1
                      ? "1fr"
                      : images.length === 2
                        ? "1fr 1fr"
                        : "1fr 1fr",
                  maxWidth: images.length === 1 ? "300px" : "260px",
                  position: "relative",
                  margin: 0,
                }}
              >
                {images.slice(0, 4).map((file, index) => (
                  <div
                    key={file._id}
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      overflow: "hidden",
                      cursor: "pointer",
                      backgroundColor: "#F0F0F0",
                      gridColumn:
                        images.length === 3 && index === 0 ? "1 / -1" : "auto",
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
                          <Space>
                            <EyeOutlined style={{ fontSize: 20 }} />
                            <a
                              href={file.url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{ color: "white" }}
                            >
                              <DownloadOutlined style={{ fontSize: 20 }} />
                            </a>
                          </Space>
                        ),
                      }}
                    />
                    {images.length > 4 && index === 3 && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "rgba(0,0,0,0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: 24,
                          fontWeight: 600,
                        }}
                      >
                        +{images.length - 4}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* RENDER NON-IMAGE FILES */}
            {hasFiles && (
              <div
                style={{
                  padding: hasImages ? "8px 8px 0 8px" : "8px",
                }}
              >
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  {files.map((file) => (
                    <div
                      key={file._id}
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        cursor: "pointer",
                        transition: "background 0.2s",
                        background:
                          hoveredFile === file._id
                            ? isOwnMessage
                              ? "#B8E6B3"
                              : "#E0E0E0"
                            : isOwnMessage
                              ? "#CBF4C9"
                              : "#F0F0F0",
                      }}
                      onClick={() => window.open(file.url, "_blank")}
                      onMouseEnter={() => setHoveredFile(file._id)}
                      onMouseLeave={() => setHoveredFile(null)}
                    >
                      {/* File Icon */}
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          background: "white",
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {getFileIcon(file.url)}
                      </div>

                      {/* File Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#000",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginBottom: 2,
                          }}
                        >
                          {getFileName(file.url)}
                        </div>
                        <Space
                          size={4}
                          style={{
                            fontSize: 12,
                            color: "#667781",
                          }}
                        >
                          <Text style={{ fontSize: 12, color: "#667781" }}>
                            {getFileType(file.url)}
                          </Text>
                          {/* <Text style={{ fontSize: 12, color: "#667781" }}>
                            •
                          </Text>
                          <Text style={{ fontSize: 12, color: "#667781" }}>
                            {getFileSize(file.url)}
                          </Text> */}
                        </Space>
                      </div>

                      {/* Download Button */}
                      <a
                        href={file.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DownloadOutlined
                          style={{
                            fontSize: 20,
                            color: "#667781",
                          }}
                        />
                      </a>
                    </div>
                  ))}
                </Space>
              </div>
            )}

            {/* RENDER TEXT CONTENT */}
            {hasContent && (
              <div
                style={{
                  padding: hasImages
                    ? "8px 12px 0 12px"
                    : hasFiles
                      ? "0 12px 0 12px"
                      : isGroupChatMessage && !isOwnMessage
                        ? "0 12px 0 12px"
                        : "8px 12px 0 12px",
                }}
              >
                <Text
                  style={{
                    fontSize: 14.2,
                    lineHeight: "19px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    color: "#000",
                    display: "block",
                  }}
                >
                  {message.content}
                </Text>
              </div>
            )}

            {/* TIMESTAMP & STATUS */}
            <div
              style={{
                padding:
                  hasContent || hasFiles
                    ? "4px 12px 8px 12px"
                    : "8px 12px 8px 12px",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 4,
                color:
                  hasImages && !hasContent && !hasFiles ? "#fff" : "#667781",
                position:
                  hasImages && !hasContent && !hasFiles
                    ? "absolute"
                    : "relative",
                bottom: hasImages && !hasContent && !hasFiles ? 8 : "auto",
                right: hasImages && !hasContent && !hasFiles ? 12 : "auto",
                background:
                  hasImages && !hasContent && !hasFiles
                    ? "rgba(0,0,0,0.4)"
                    : "transparent",
                borderRadius: hasImages && !hasContent && !hasFiles ? 4 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color:
                    hasImages && !hasContent && !hasFiles ? "#fff" : "#667781",
                }}
              >
                {moment(message.createdAt).format("h:mm A")}
              </Text>
              {isOwnMessage && (
                <CheckOutlined
                  style={{
                    fontSize: 16,
                    color:
                      hasImages && !hasContent && !hasFiles
                        ? "#fff"
                        : "#53BDEB",
                  }}
                />
              )}
            </div>

            {/* Dropdown Menu - Only for own messages */}
            {isOwnMessage && (
              <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <div
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    cursor: "pointer",
                    opacity: isHovered ? 1 : 0,
                    transition: "opacity 0.2s",
                    zIndex: 10,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    size="small"
                    style={{
                      fontSize: 18,
                      color: "#667781",
                      background: "rgba(0,0,0,0.05)",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      minWidth: 24,
                    }}
                  />
                </div>
              </Dropdown>
            )}
          </div>
        </div>

        {/* Avatar for own messages */}
        {isOwnMessage && (
          <Avatar
            src={message.sender?.avatar?.url}
            size={32}
            style={{ marginTop: 4, marginLeft: 8 }}
          >
            {message.sender?.username?.[0]?.toUpperCase()}
          </Avatar>
        )}
      </div>
    </Image.PreviewGroup>
  );
};

export default MessageItem;
