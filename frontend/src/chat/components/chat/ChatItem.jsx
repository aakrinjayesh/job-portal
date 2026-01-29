import React, { useState } from "react";
import { Avatar, Badge, Typography, Dropdown, Popconfirm } from "antd";
import {
  MoreOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
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
          padding: 16,
          background: isActive ? "lightblue" : "#FFFFFF",
          color: isActive ? "white" : "#0A0A0A",
          borderBottom: "1px solid #F3F4F6",
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          transition: "background 0.2s ease",
        }}
        onClick={() => onClick(chat)}
      >
        {/* Dropdown Menu */}
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
                      <Popconfirm title="Delete chat?" onConfirm={deleteChat}>
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
          <MoreOutlined
            onClick={(e) => e.stopPropagation()}
            style={{ color: "#9CA3AF" }}
          />
        </Dropdown>

        {/* Avatar */}
        <Avatar
          size={48}
          src={chatMetadata.avatar || "https://placehold.co/48x48"}
          style={{ borderRadius: 9999 }}
        />

        {/* Name + Last Message */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            overflow: "hidden",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: unreadCount ? 600 : 500,
                color: "#0A0A0A",
                display: "block",
                lineHeight: "24px",
              }}
              ellipsis
            >
              {chatMetadata.title}
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: "#6A7282",
              }}
              ellipsis
            >
              {chatMetadata.lastMessage}
            </Text>
          </div>

          {/* Time + Unread Badge */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "space-between",
              height: 48,
              marginLeft: 12,
              color:"white"
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#6A7282",
                lineHeight: "16px",
              }}
            >
              {moment(chat.updatedAt).fromNow()}
            </Text>

           {unreadCount > 0 && (
  <Badge
    count={unreadCount > 9 ? "9+" : unreadCount}
    style={{
                  backgroundColor: "#00C950",
                  fontSize: 12,
                  lineHeight: "16px",
                  height: 20,
                  minWidth: 20,
                  borderRadius: 9999,
    }}
  />
)}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatItem;
