import React, { useState } from "react";
import { Avatar, Badge, Typography, Dropdown, Popconfirm, Space } from "antd";
import {
  MoreOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import { getChatObjectMetadata, requestHandler } from "../../utils";
import { deleteOneOnOneChat } from "../../api";
import GroupChatDetailsModal from "./GroupChatDetailsModal";

const { Text } = Typography;

const ChatItem = ({
  chat,
  onClick,
  isActive,
  unreadCount = 0,
  onChatDelete,
}) => {
  const { user } = useAuth();
  const [openGroupInfo, setOpenGroupInfo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const chatMetadata = getChatObjectMetadata(chat, user);

  const deleteChat = async () => {
    await requestHandler(
      async () => await deleteOneOnOneChat(chat._id),
      null,
      () => onChatDelete(chat._id),
    );
  };

  return (
    <>
      {/* Group Chat Modal */}
      <GroupChatDetailsModal
        open={openGroupInfo}
        onClose={() => setOpenGroupInfo(false)}
        chatId={chat._id}
        onGroupDelete={onChatDelete}
      />

      <div
        style={{
          width: "100%",
          padding: "12px 16px",
          background: isActive ? "#F0F2F5" : isHovered ? "#F5F5F5" : "#FFFFFF",
          borderBottom: "1px solid #F0F0F0",
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          transition: "background 0.2s ease",
          position: "relative",
        }}
        onClick={() => onClick(chat)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Avatar */}
        <Avatar
          size={52}
          src={chatMetadata.avatar}
          style={{
            flexShrink: 0,
            background: "#25D366",
            color: "white",
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          {chatMetadata.title?.[0]?.toUpperCase()}
        </Avatar>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* Name and Time Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: unreadCount > 0 ? 600 : 500,
                color: "#111827",
                lineHeight: "20px",
              }}
              ellipsis
            >
              {chatMetadata.title}
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: unreadCount > 0 ? "#25D366" : "#667781",
                flexShrink: 0,
                lineHeight: "16px",
              }}
            >
              {moment(chat.updatedAt).format("h:mm A")}
            </Text>
          </div>

          {/* Last Message and Badge Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {chat.lastMessage?.sender?._id === user?._id && (
                <CheckOutlined
                  style={{
                    fontSize: 14,
                    color: "#53BDEB",
                    flexShrink: 0,
                  }}
                />
              )}
              <Text
                style={{
                  fontSize: 14,
                  color: unreadCount > 0 ? "#111827" : "#667781",
                  fontWeight: unreadCount > 0 ? 500 : 400,
                }}
                ellipsis
              >
                {chatMetadata.lastMessage || "No messages yet"}
              </Text>
            </div>

            {/* Unread Badge */}
            {unreadCount > 0 && (
              <Badge
                count={unreadCount > 99 ? "99+" : unreadCount}
                style={{
                  backgroundColor: "#25D366",
                  fontSize: 11,
                  height: 20,
                  minWidth: 20,
                  lineHeight: "20px",
                  borderRadius: 10,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        </div>

        {/* Dropdown Menu */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            opacity: isHovered || isActive ? 1 : 0,
            transition: "opacity 0.2s",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Dropdown
            trigger={["click"]}
            menu={{
              items: chat.isGroupChat
                ? [
                    {
                      key: "info",
                      label: "Group Info",
                      icon: <InfoCircleOutlined />,
                    },
                  ]
                : [
                    {
                      key: "delete",
                      label: (
                        <Popconfirm
                          title="Delete chat?"
                          description="This will permanently delete this conversation"
                          onConfirm={deleteChat}
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          Delete Chat
                        </Popconfirm>
                      ),
                      icon: <DeleteOutlined />,
                      danger: true,
                    },
                  ],
              onClick: ({ key }) => {
                if (key === "info") setOpenGroupInfo(true);
              },
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.05)",
                cursor: "pointer",
              }}
            >
              <MoreOutlined
                style={{
                  color: "#667781",
                  fontSize: 18,
                }}
              />
            </div>
          </Dropdown>
        </div>
      </div>
    </>
  );
};

export default ChatItem;
