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
  // console.log("chatmetadata", chatMetadata);

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
              {/* {chat.isGroupChat ? (
                <Avatar.Group maxCount={3} size={48}>
                  {chat.participants.slice(0, 3).map((p) => (
                    <Avatar key={p._id} src={p.avatar.url} />
                  ))}
                </Avatar.Group>
              ) : (
                <Avatar src={chatMetadata.avatar} size={48} />
              )} */}
              <Avatar src={chatMetadata.avatar} size={48} />
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
