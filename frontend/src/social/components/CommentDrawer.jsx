import { useState, useEffect } from "react";
import { Drawer, Avatar, Input, Button, Space, Typography, Divider, Spin, Empty } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { commentPost, getComments } from "../api/api";

const { Text } = Typography;
const { TextArea } = Input;

export default function CommentDrawer({ open, onClose, post }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    if (!post?.id) return;
    setLoading(true);
    try {
      const res = await getComments(post.id);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchComments();
  }, [open, post?.id]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await commentPost({ postId: post.id, content });
      setContent("");
      fetchComments(); // refresh
    } catch (err) {
      console.error("Failed to comment", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      title={`Comments (${post?.commentsCount ?? 0})`}
      placement="right"
      onClose={onClose}
      open={open}
      width={420}
      styles={{ body: { display: "flex", flexDirection: "column", padding: 16 } }}
    >
      {/* Comment Input */}
      <div style={{ marginBottom: 16 }}>
        <TextArea
          rows={2}
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ borderRadius: 8 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={submitting}
          onClick={handleSubmit}
          style={{ marginTop: 8, float: "right" }}
        >
          Comment
        </Button>
        <div style={{ clear: "both" }} />
      </div>

      <Divider style={{ margin: "8px 0 16px" }} />

      {/* Comments List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <Spin size="large" style={{ display: "block", textAlign: "center", marginTop: 40 }} />
        ) : comments.length === 0 ? (
          <Empty description="No comments yet. Be the first!" />
        ) : (
          comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))
        )}
      </div>
    </Drawer>
  );
}

function CommentItem({ comment }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Space align="start">
        <Avatar size={32}>{comment.user?.name?.charAt(0)}</Avatar>
        <div
          style={{
            background: "#f5f5f5",
            borderRadius: 10,
            padding: "8px 12px",
            maxWidth: 320,
          }}
        >
          <Text strong style={{ fontSize: 13 }}>{comment.user?.name}</Text>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#333" }}>{comment.content}</p>
        </div>
      </Space>

      {/* Nested replies */}
      {comment.replies?.length > 0 && (
        <div style={{ marginLeft: 40, marginTop: 8 }}>
          {comment.replies.map((r) => (
            <CommentItem key={r.id} comment={r} />
          ))}
        </div>
      )}
    </div>
  );
}