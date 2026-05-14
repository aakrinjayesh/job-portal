import { useState, useEffect, useCallback } from "react";
import {
  Avatar, Button, Typography, Input, Spin, Empty,
  Modal, message, Divider, List, Checkbox
} from "antd";
import {
  LikeOutlined, LikeFilled, MessageOutlined,
  SendOutlined, ShareAltOutlined, LinkOutlined,
  WhatsAppOutlined, TwitterOutlined, LinkedinOutlined,
  CopyOutlined, CheckCircleFilled,EllipsisOutlined,ThunderboltOutlined, RetweetOutlined 
} from "@ant-design/icons";
import {
  likePost, unlikePost, getComments, commentPost,
  getPostLikes, getShareSuggestions, sendPostToUser,repostPost
} from "../api/api";

const { Text, Paragraph } = Typography;

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(dateStr).toLocaleDateString();
}

function MediaGrid({ mediaUrls }) {
  if (!mediaUrls?.length) return null;

  const count = mediaUrls.length;
  const full = (url) => url;

  const isVideo = (url) =>
    /\.(mp4|webm|ogg|mov)$/i.test(url);

  const isDocument = (url) =>
    /\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/i.test(url);

  const getFileName = (url) => {
    try {
      return decodeURIComponent(url.split("/").pop().split("?")[0]);
    } catch {
      return "Document";
    }
  };

  const gridStyles = {
    1: { grid: "1fr", heights: ["420px"] },
    2: { grid: "1fr 1fr", heights: ["300px", "300px"] },
    3: { grid: "1fr 1fr", heights: ["300px", "150px", "150px"] },
    4: { grid: "1fr 1fr", heights: ["200px", "200px", "200px", "200px"] },
  };

  const cfg = gridStyles[Math.min(count, 4)] || gridStyles[4];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: cfg.grid,
        gap: 2,
        marginTop: 10,
        borderRadius: 8,
        overflow: "hidden",
        maxHeight: 500,
      }}
    >
      {mediaUrls.slice(0, 4).map((url, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            overflow: "hidden",
            background: "#f3f2ef",
            borderRadius: 8,
          }}
        >
          {/* ── VIDEO ───────────────────────── */}
          {isVideo(url) ? (
            <video
              src={full(url)}
              controls
              playsInline
              style={{
                width: "100%",
                height: cfg.heights[i] || "200px",
                objectFit: "cover",
                display: "block",
                background: "#000",
              }}
            />
          ) : isDocument(url) ? (
            /* ── DOCUMENT ───────────────────── */
            <a
              href={full(url)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "18px 16px",
                minHeight: cfg.heights[i] || "120px",
                textDecoration: "none",
                color: "#111",
                background: "#f7f7f7",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 10,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  flexShrink: 0,
                  border: "1px solid #e0e0e0",
                }}
              >
                📄
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getFileName(url)}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#666",
                    marginTop: 4,
                  }}
                >
                  Click to open document
                </div>
              </div>
            </a>
          ) : (
            /* ── IMAGE ──────────────────────── */
            <img
              src={full(url)}
              alt=""
              style={{
                width: "100%",
                height: cfg.heights[i] || "200px",
                objectFit: "cover",
                display: "block",
                transition: "transform 0.2s",
                cursor: "pointer",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              onError={(e) => {
                e.target.parentElement.style.display = "none";
              }}
            />
          )}

          {/* ── +N overlay ─────────────────── */}
          {i === 3 && count > 4 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              +{count - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function PostCard({ post: initialPost }) {
  const [likesCount, setLikesCount] = useState(initialPost.likesCount ?? 0);
  const [liked, setLiked] = useState(initialPost.isLikedByMe ?? false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likesOpen, setLikesOpen] = useState(false);
  const [likesList, setLikesList] = useState([]);
  const [likesListLoading, setLikesListLoading] = useState(false);
  const [repostOpen, setRepostOpen] = useState(false);
const [repostText, setRepostText]  = useState("");
const [reposting, setReposting]    = useState(false);


  const [commentsCount, setCommentsCount] = useState(initialPost.commentsCount ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [shareUsers, setShareUsers]       = useState([]);
  const [shareSearch, setShareSearch]     = useState("");
  const [shareLoading, setShareLoading]   = useState(false);
  const [selected, setSelected]           = useState([]);
  const [shareMsg, setShareMsg]           = useState("");
  const [sending, setSending]             = useState(false);
  const [linkCopied, setLinkCopied]       = useState(false);

  const [shareOpen, setShareOpen] = useState(false);
  const postUrl = `${window.location.origin}/posts/${initialPost.id}`;

  const CONTENT_LIMIT = 200;
  const content = initialPost.content ?? "";
  const isLong = content.length > CONTENT_LIMIT;

  // ── Like ────────────────────────────────────────
  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    if (liked) {
      setLiked(false); setLikesCount((c) => c - 1);
      try { await unlikePost(initialPost.id); }
      catch { setLiked(true); setLikesCount((c) => c + 1); }
    } else {
      setLiked(true); setLikesCount((c) => c + 1);
      try { await likePost(initialPost.id); }
      catch { setLiked(false); setLikesCount((c) => c - 1); }
    }
    setLikeLoading(false);
  };


const handleRepost = async () => {
  setReposting(true);
  try {
    await repostPost({ postId: initialPost.id, content: repostText });
    message.success("Reposted!");
    setRepostOpen(false);
    setRepostText("");
  } catch {
    message.error("Failed to repost");
  } finally {
    setReposting(false);
  }
};

  const openLikes = async () => {
    setLikesOpen(true);
    setLikesListLoading(true);
    try {
      const res = await getPostLikes(initialPost.id);
      setLikesList(res.data);
    } catch (err) { console.error(err); }
    finally { setLikesListLoading(false); }
  };

  // ── Comments ────────────────────────────────────
  const toggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) {
      setCommentsLoading(true);
      try {
        const res = await getComments(initialPost.id);
        setComments(res.data);
      } catch (err) { console.error(err); }
      finally { setCommentsLoading(false); }
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await commentPost({ postId: initialPost.id, content: commentText });
      setComments((prev) => [...prev, { ...res.data, user: { name: "You" } }]);
      setCommentsCount((c) => c + 1);
      setCommentText("");
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  // ── Share ───────────────────────────────────────
  const shareNative = () => {
    if (navigator.share) {
      navigator.share({ title: `Post by ${initialPost.author?.name}`, text: content.slice(0, 200), url: postUrl });
    } else { setShareOpen(true); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(postUrl);
    message.success("Link copied!");
    setShareOpen(false);
  };

  const openShare = async () => {
    setShareOpen(true);
    setShareLoading(true);
    setSelected([]);
    setShareMsg("");
    setShareSearch("");
    try {
      const res = await getShareSuggestions(initialPost.id);
      setShareUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    message.success("Link copied!");
  };

  const toggleSelect = (userId) => {
    setSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSend = async () => {
    if (selected.length === 0) return;
    setSending(true);
    try {
      await Promise.all(
        selected.map((recipientId) =>
          sendPostToUser({ postId: initialPost.id, recipientId, message: shareMsg })
        )
      );
      message.success(`Shared with ${selected.length} person${selected.length > 1 ? "s" : ""}!`);
      setShareOpen(false);
    } catch (err) {
      message.error("Failed to share");
    } finally {
      setSending(false);
    }
  };

   const filteredShareUsers = shareUsers.filter((u) =>
    u.name?.toLowerCase().includes(shareSearch.toLowerCase())
  );

  return (
    <>
      {/* ── Card ── */}
      <div style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e0e0e0",
        marginBottom: 12,
        overflow: "hidden",
      }}>

        {/* ── Header ── */}
       {/* ── Header ── */}
<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "14px 16px 0" }}>
  <div style={{ display: "flex", gap: 10, flex: 1 }}>

    {/* Avatar — company logo or user initial */}
    <Avatar
      size={48}
      src={
        initialPost.organizationId
          ? initialPost.organization?.companyProfile?.logoUrl
          : initialPost.author?.profileUrl
      }
      style={{ background: "#0a66c2", fontWeight: 700, fontSize: 18, flexShrink: 0 }}
    >
      {initialPost.organizationId
        ? initialPost.organization?.name?.charAt(0)
        : initialPost.author?.name?.charAt(0)}
    </Avatar>

    <div>
      {initialPost.organizationId ? (
        // ── Company post ──
        <>
          <Text strong style={{ fontSize: 15, display: "block", lineHeight: 1.3 }}>
            {initialPost.organization?.name}
          </Text>
          {/* <Text type="secondary" style={{ fontSize: 12 }}>
            Posted by {initialPost.author?.name}
          </Text> */}
        </>
      ) : (
        // ── User post ──
        <>
          <Text strong style={{ fontSize: 15, display: "block", lineHeight: 1.3 }}>
            {initialPost.author?.name}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {initialPost.author?.role}
          </Text>
        </>
      )}

      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
        {timeAgo(initialPost.createdAt)} · 🌐
      </div>
    </div>
  </div>

  <Button type="text" icon={<EllipsisOutlined />} style={{ color: "#666" }} />
</div>

        {/* ── Content ── */}
        <div style={{ padding: "10px 16px 0" }}>
          <Paragraph style={{ fontSize: 14, marginBottom: 0, whiteSpace: "pre-wrap" }}>
            {isLong && !expanded ? content.slice(0, CONTENT_LIMIT) : content}
            {isLong && !expanded && (
              <>
                {"... "}
                <span
                  onClick={() => setExpanded(true)}
                  style={{ color: "#0a66c2", cursor: "pointer", fontWeight: 500 }}
                >
                  see more
                </span>
              </>
            )}
          </Paragraph>
        </div>

        {/* ── Media ── */}
        {initialPost.mediaUrls?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <MediaGrid mediaUrls={initialPost.mediaUrls} />
          </div>
        )}

        {/* ── Embedded repost ── */}

{initialPost.repostOf && (
  <div style={{
    margin: "10px 16px",
    border: "1px solid #e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
  }}>
    <div style={{ display: "flex", gap: 10, padding: "12px 14px 8px", alignItems: "flex-start" }}>
      <Avatar
        size={36}
        src={
          initialPost.repostOf.organizationId
            ? initialPost.repostOf.organization?.companyProfile?.logoUrl
            : initialPost.repostOf.author?.profileUrl
        }
        style={{ background: "#0a66c2", flexShrink: 0 }}
      >
        {initialPost.repostOf.organizationId
          ? initialPost.repostOf.organization?.name?.charAt(0)
          : initialPost.repostOf.author?.name?.charAt(0)}
      </Avatar>
      <div>
        <Text strong style={{ fontSize: 13, display: "block" }}>
          {initialPost.repostOf.organizationId
            ? initialPost.repostOf.organization?.name
            : initialPost.repostOf.author?.name}
        </Text>
        <Text type="secondary" style={{ fontSize: 11 }}>
          {initialPost.repostOf.author?.role} · {timeAgo(initialPost.repostOf.createdAt)}
        </Text>
      </div>
    </div>

    <div style={{ padding: "0 14px 12px" }}>
      <Text style={{ fontSize: 13, color: "#444", whiteSpace: "pre-wrap" }}>
        {initialPost.repostOf.content?.slice(0, 300)}
        {initialPost.repostOf.content?.length > 300 ? "..." : ""}
      </Text>
    </div>

    {/* ✅ Use MediaGrid instead of hardcoded <img> */}
    {initialPost.repostOf.mediaUrls?.length > 0 && (
      <MediaGrid mediaUrls={initialPost.repostOf.mediaUrls} />
    )}
  </div>
)}

        {/* ── Stats row ── */}
        {(likesCount > 0 || commentsCount > 0) && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 16px 0", fontSize: 13, color: "#666",
          }}>
            {likesCount > 0 ? (
              <span
                onClick={openLikes}
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                <span style={{
                  background: "#0a66c2", borderRadius: "50%",
                  width: 18, height: 18, display: "inline-flex",
                  alignItems: "center", justifyContent: "center", fontSize: 10
                }}>
                  👍
                </span>
                <span style={{ marginLeft: 2 }}>{likesCount}</span>
              </span>
            ) : <span />}

            {commentsCount > 0 && (
              <span
                onClick={toggleComments}
                style={{ cursor: "pointer", color: "#666" }}
              >
                {commentsCount} comment{commentsCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* ── Action bar ── */}
        <div style={{ padding: "4px 8px", borderTop: "1px solid #e0e0e0", marginTop: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {[
              {
                label: "Like",
                icon: liked ? <LikeFilled style={{ color: "#0a66c2" }} /> : <LikeOutlined />,
                onClick: handleLike,
                active: liked,
                loading: likeLoading,
              },
              {
                label: "Comment",
                icon: <MessageOutlined />,
                onClick: toggleComments,
                active: showComments,
              },
             {
  label: "Repost",
  icon: <RetweetOutlined />,
  onClick: () => setRepostOpen(true),
},
              {
                label: "Send",
                icon: <ShareAltOutlined />,
                onClick: openShare,
              },
            ].map((action) => (
              <Button
                key={action.label}
                type="text"
                icon={action.icon}
                onClick={action.onClick}
                loading={action.loading}
                style={{
                  color: action.active ? "#0a66c2" : "#666",
                  fontWeight: action.active ? 600 : 400,
                  fontSize: 13,
                  height: 36,
                  flex: 1,
                  borderRadius: 6,
                }}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* ── Inline comments ── */}
        {showComments && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0" }}>
            {/* Input row */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <Avatar size={36} style={{ background: "#0a66c2", flexShrink: 0 }}>
                Me
              </Avatar>
              <div style={{ flex: 1, display: "flex", gap: 6 }}>
                <Input
                  placeholder="Add a comment…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onPressEnter={handleComment}
                  style={{
                    borderRadius: 20, background: "#f3f2ef",
                    border: "1px solid #ddd", padding: "6px 14px",
                  }}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined />}
                  loading={submitting}
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  style={{ background: "#0a66c2" }}
                />
              </div>
            </div>

            {/* Comments list */}
            {commentsLoading ? (
              <div style={{ textAlign: "center", padding: 20 }}><Spin /></div>
            ) : comments.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No comments yet" style={{ margin: "8px 0" }} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {comments.map((c) => (
                  <div key={c.id} style={{ display: "flex", gap: 8 }}>
                    <Avatar size={36} style={{ background: "#0a66c2", flexShrink: 0 }}>
                      {c.user?.name?.charAt(0)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        background: "#f3f2ef", borderRadius: 12,
                        padding: "8px 12px", display: "inline-block", maxWidth: "100%",
                      }}>
                        <Text strong style={{ fontSize: 13, display: "block" }}>{c.user?.name}</Text>
                        <Text style={{ fontSize: 13 }}>{c.content}</Text>
                      </div>

                      {/* Replies */}
                      {c.replies?.length > 0 && (
                        <div style={{ marginLeft: 12, marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                          {c.replies.map((r) => (
                            <div key={r.id} style={{ display: "flex", gap: 8 }}>
                              <Avatar size={28} style={{ background: "#0a66c2", flexShrink: 0 }}>
                                {r.user?.name?.charAt(0)}
                              </Avatar>
                              <div style={{
                                background: "#f3f2ef", borderRadius: 10,
                                padding: "6px 10px", display: "inline-block",
                              }}>
                                <Text strong style={{ fontSize: 12, display: "block" }}>{r.user?.name}</Text>
                                <Text style={{ fontSize: 12 }}>{r.content}</Text>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Likes Modal ── */}
      <Modal open={likesOpen} onCancel={() => setLikesOpen(false)} footer={null} title="Liked by" width={380}>
        {likesListLoading ? <Spin style={{ display: "block", textAlign: "center" }} /> :
          likesList.length === 0 ? <Empty description="No likes yet" /> :
            likesList.map((l) => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Avatar style={{ background: "#0a66c2" }}>{l.user?.name?.charAt(0)}</Avatar>
                <Text>{l.user?.name}</Text>
              </div>
            ))
        }
      </Modal>

      {/* ── Share Modal ── */}
      <Modal
        open={shareOpen}
        onCancel={() => setShareOpen(false)}
        footer={null}
        title={
          <span style={{ fontSize: 16, fontWeight: 600 }}>Share post</span>
        }
        width={500}
        styles={{ body: { padding: "0 24px 24px" } }}
      >
        {/* ── Copy link row ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "16px 0 14px",
          borderBottom: "1px solid #f0f0f0",
        }}>
          <div style={{
            flex: 1, background: "#f3f2ef", borderRadius: 8,
            padding: "8px 12px", fontSize: 13, color: "#555",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {postUrl}
          </div>
          <Button
            icon={linkCopied ? <CheckCircleFilled style={{ color: "#057642" }} /> : <CopyOutlined />}
            onClick={handleCopyLink}
            shape="round"
            style={{
              fontWeight: 500, flexShrink: 0,
              borderColor: linkCopied ? "#057642" : undefined,
              color: linkCopied ? "#057642" : undefined,
            }}
          >
            {linkCopied ? "Copied!" : "Copy link"}
          </Button>
        </div>

        {/* ── External share buttons ── */}
        {/* <div style={{
          display: "flex", gap: 10, padding: "14px 0",
          borderBottom: "1px solid #f0f0f0", flexWrap: "wrap",
        }}>
          <Button
            icon={<WhatsAppOutlined />}
            style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: 8, fontWeight: 500 }}
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(content.slice(0, 100) + " " + postUrl)}`, "_blank")}
          >
            WhatsApp
          </Button>
          <Button
            icon={<LinkedinOutlined />}
            style={{ background: "#0A66C2", color: "#fff", border: "none", borderRadius: 8, fontWeight: 500 }}
            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, "_blank")}
          >
            LinkedIn
          </Button>
          <Button
            icon={<TwitterOutlined />}
            style={{ background: "#1DA1F2", color: "#fff", border: "none", borderRadius: 8, fontWeight: 500 }}
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(content.slice(0, 200))}&url=${encodeURIComponent(postUrl)}`, "_blank")}
          >
            X (Twitter)
          </Button>
        </div> */}

        {/* ── Send to connections ── */}
        {/* <div style={{ paddingTop: 14 }}>
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, color: "#111" }}>
            Send to connections
          </p> */}

          {/* Search */}
          {/* <Input
            placeholder="Search people…"
            value={shareSearch}
            onChange={(e) => setShareSearch(e.target.value)}
            style={{ borderRadius: 20, marginBottom: 12 }}
            prefix={<span style={{ color: "#aaa" }}>🔍</span>}
          /> */}

          {/* Optional message */}
          {/* <Input.TextArea
            placeholder="Add a message (optional)"
            value={shareMsg}
            onChange={(e) => setShareMsg(e.target.value)}
            rows={2}
            style={{ borderRadius: 8, marginBottom: 12, resize: "none" }}
          /> */}

          {/* People list */}
          {/* <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {shareLoading ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <Spin />
              </div>
            ) : filteredShareUsers.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={shareSearch ? "No matching connections" : "No connections yet"}
                style={{ margin: "12px 0" }}
              />
            ) : (
              filteredShareUsers.map((u) => {
                const isSelected = selected.includes(u.id);
                const avatar = u.CandidateProfile?.profilePicture || u.profileUrl;
                const title = u.CandidateProfile?.title || "";
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleSelect(u.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 4px", cursor: "pointer", borderRadius: 8,
                      background: isSelected ? "#f0f7ff" : "transparent",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "#f9f9f9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isSelected ? "#f0f7ff" : "transparent";
                    }}
                  >
                    <Avatar
                      size={40}
                      src={avatar}
                      style={{ background: "#0a66c2", flexShrink: 0 }}
                    >
                      {u.name?.charAt(0)}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#111" }}>
                        {u.name}
                      </div>
                      {title && (
                        <div style={{
                          fontSize: 11, color: "#888",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {title}
                        </div>
                      )}
                    </div>
                    <Checkbox checked={isSelected} onChange={() => toggleSelect(u.id)} />
                  </div>
                );
              })
            )}
          </div> */}

          {/* Send button */}
          {/* <Button
            type="primary"
            block
            shape="round"
            loading={sending}
            disabled={selected.length === 0}
            onClick={handleSend}
            style={{
              marginTop: 14,
              background: selected.length > 0 ? "#0a66c2" : undefined,
              fontWeight: 600,
              height: 38,
            }}
          >
            {selected.length > 0
              ? `Send to ${selected.length} person${selected.length > 1 ? "s" : ""}`
              : "Select people to send"}
          </Button> */}
        {/* </div> */}
      </Modal>
      {/* ── Repost Modal ── */}
<Modal
  open={repostOpen}
  onCancel={() => { setRepostOpen(false); setRepostText(""); }}
  footer={null}
  title={<span style={{ fontSize: 16, fontWeight: 600 }}>Repost</span>}
  width={520}
  styles={{ body: { padding: "16px 24px 24px" } }}
>
  {/* Optional thought */}
  <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
    <Avatar size={38} style={{ background: "#0a66c2", flexShrink: 0 }}>
      Me
    </Avatar>
    <Input.TextArea
      placeholder="Add a thought (optional)..."
      value={repostText}
      onChange={(e) => setRepostText(e.target.value)}
      autoSize={{ minRows: 2, maxRows: 5 }}
      style={{
        borderRadius: 8, resize: "none",
        fontSize: 14, border: "1px solid #e0e0e0",
      }}
    />
  </div>

  {/* Original post preview */}
  <div style={{
    border: "1px solid #e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
    background: "#fafafa",
  }}>
    <div style={{ display: "flex", gap: 10, padding: "12px 14px 8px" }}>
      <Avatar
        size={36}
        src={
          initialPost.organizationId
            ? initialPost.organization?.companyProfile?.logoUrl
            : initialPost.author?.profileUrl
        }
        style={{ background: "#0a66c2", flexShrink: 0 }}
      >
        {initialPost.organizationId
          ? initialPost.organization?.name?.charAt(0)
          : initialPost.author?.name?.charAt(0)}
      </Avatar>
      <div>
        <Text strong style={{ fontSize: 13, display: "block" }}>
          {initialPost.organizationId
            ? initialPost.organization?.name
            : initialPost.author?.name}
        </Text>
        <Text type="secondary" style={{ fontSize: 11 }}>
          {initialPost.author?.role} · {timeAgo(initialPost.createdAt)}
        </Text>
      </div>
    </div>

    <div style={{ padding: "0 14px 12px" }}>
      <Text style={{ fontSize: 13, color: "#444", whiteSpace: "pre-wrap" }}>
        {content?.slice(0, 300)}{content?.length > 300 ? "..." : ""}
      </Text>
    </div>

   {initialPost.mediaUrls?.length > 0 && (
  <MediaGrid mediaUrls={initialPost.mediaUrls} />
)}
  </div>

  <Button
    type="primary"
    block
    shape="round"
    loading={reposting}
    onClick={handleRepost}
    style={{ background: "#0a66c2", fontWeight: 600, height: 38 }}
  >
    Repost
  </Button>
</Modal>
    </>
  );
}