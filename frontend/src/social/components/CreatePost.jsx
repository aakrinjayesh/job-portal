import { useState, useRef } from "react";
import { Card, Input, Button, Space, Avatar, Modal, message } from "antd";
import {
  PictureOutlined, VideoCameraOutlined, FileTextOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { createPost, uploadPostMedia } from "../api/api";

const { TextArea } = Input;

const MEDIA_TYPES = {
  image:    { accept: "image/*",                              label: "Photo",    icon: <PictureOutlined    style={{ color: "#378ADD" }} /> },
  video:    { accept: "video/*",                              label: "Video",    icon: <VideoCameraOutlined style={{ color: "#1D9E75" }} /> },
  document: { accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx", label: "Document", icon: <FileTextOutlined   style={{ color: "#D85A30" }} /> },
};

const FILE_LIMITS_MB = { image: 5, video: 100, document: 5 };

export default function CreatePost({ refreshFeed, currentUser }) {
  const [modalOpen, setModalOpen]     = useState(false);
  const [content, setContent]         = useState("");
  const [mediaFiles, setMediaFiles]   = useState([]); // [{ file, previewUrl, type, name }]
  const [loading, setLoading]         = useState(false);
  const [activeMediaType, setActiveMediaType] = useState(null);
  const fileInputRef = useRef(null);

  const openModal  = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setContent("");
    setMediaFiles([]);
  };

  const handleFileSelect = (type) => {
    setActiveMediaType(type);
    fileInputRef.current.accept = MEDIA_TYPES[type].accept;
    fileInputRef.current.click();
  };

  // ── Validate size then add to mediaFiles ──────────────────
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const valid = [];

    for (const file of files) {
      const limitMB = FILE_LIMITS_MB[activeMediaType] ?? 5;
      const limitBytes = limitMB * 1024 * 1024;

      if (file.size > limitBytes) {
        message.error(`"${file.name}" exceeds the ${limitMB}MB limit for ${activeMediaType}s.`);
        continue; // skip this file, keep others
      }

      valid.push({
        file,
        previewUrl: URL.createObjectURL(file),
        type: activeMediaType,
        name: file.name,
      });
    }

    if (valid.length > 0) {
      setMediaFiles((prev) => [...prev, ...valid]);
    }

    e.target.value = ""; // reset so same file can be re-selected
  };

  const removeMedia = (idx) => {
    setMediaFiles((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // ── Upload to S3 then create post ─────────────────────────
  const handlePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;
    setLoading(true);

    try {
      let mediaUrls = [];

      if (mediaFiles.length > 0) {
        const rawFiles = mediaFiles.map((m) => m.file);
        const res = await uploadPostMedia(rawFiles);
        mediaUrls = res.data.urls;
      }

      await createPost({ content, mediaUrls });

      message.success("Post created!");
      closeModal();
      refreshFeed?.();
    } catch (err) {
      console.error("handlePost error:", err);
      message.error(err?.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const canPost = content.trim().length > 0 || mediaFiles.length > 0;

  return (
    <>
      {/* ── Trigger card ── */}
      <Card style={{ marginBottom: 12, borderRadius: 12 }} bodyStyle={{ padding: "12px 16px" }}>
        <Space style={{ width: "100%", marginBottom: 10 }}>
          <Avatar size={40} style={{ background: "#1677ff", flexShrink: 0 }}>
            {currentUser?.name?.charAt(0) ?? "U"}
          </Avatar>
          <div
            onClick={openModal}
            style={{
              flex: 1, border: "1px solid #d9d9d9", borderRadius: 24,
              padding: "8px 16px", color: "#888", fontSize: 14,
              cursor: "pointer", background: "#fafafa", userSelect: "none",
            }}
          >
            Create a post
          </div>
        </Space>

        <Space style={{ justifyContent: "space-around", width: "100%", display: "flex" }}>
          {Object.entries(MEDIA_TYPES).map(([key, val]) => (
            <Button
              key={key}
              type="text"
              icon={val.icon}
              onClick={() => { openModal(); setActiveMediaType(key); }}
              style={{ color: "#555", fontSize: 13 }}
            >
              {val.label}
            </Button>
          ))}
        </Space>
      </Card>

      {/* ── Hidden file input ── */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* ── Compose modal ── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={560}
        style={{ top: 60 }}
        styles={{ body: { padding: 0 } }}
        closeIcon={<CloseOutlined />}
        title={
          <Space>
            <Avatar size={36} style={{ background: "#1677ff" }}>
              {currentUser?.name?.charAt(0) ?? "U"}
            </Avatar>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{currentUser?.name ?? "You"}</div>
              <div style={{ fontSize: 12, color: "#888" }}>Post to anyone</div>
            </div>
          </Space>
        }
      >
        <div style={{ padding: "12px 20px 0" }}>
          <TextArea
            autoFocus
            placeholder="What do you want to talk about?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoSize={{ minRows: 4, maxRows: 12 }}
            bordered={false}
            style={{ fontSize: 15, padding: 0, resize: "none" }}
          />

          {/* ── Media previews ── */}
          {mediaFiles.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: mediaFiles.length === 1 ? "1fr" : "1fr 1fr",
              gap: 6, marginTop: 12, borderRadius: 8, overflow: "hidden",
            }}>
              {mediaFiles.map((m, i) => (
                <div key={i} style={{ position: "relative" }}>
                  {m.type === "image" && (
                    <img
                      src={m.previewUrl}
                      alt=""
                      style={{ width: "100%", height: 180, objectFit: "cover", display: "block", borderRadius: 6 }}
                    />
                  )}
                  {m.type === "video" && (
                    <video
                      src={m.previewUrl}
                      style={{ width: "100%", height: 180, objectFit: "cover", display: "block", borderRadius: 6 }}
                      controls
                    />
                  )}
                  {m.type === "document" && (
                    <div style={{
                      background: "#f0f2f5", borderRadius: 6,
                      padding: "16px 12px", display: "flex",
                      alignItems: "center", gap: 10, height: 70,
                    }}>
                      <FileTextOutlined style={{ fontSize: 28, color: "#D85A30" }} />
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {m.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#888" }}>Document</div>
                      </div>
                    </div>
                  )}
                  <Button
                    icon={<CloseOutlined />}
                    size="small"
                    shape="circle"
                    onClick={() => removeMedia(i)}
                    style={{
                      position: "absolute", top: 6, right: 6,
                      background: "rgba(0,0,0,0.55)", color: "#fff", border: "none",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px 16px", marginTop: 10, borderTop: "1px solid #f0f0f0",
        }}>
         <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
  <Space>
    <Button
      type="text"
      icon={<PictureOutlined style={{ color: "#378ADD", fontSize: 18 }} />}
      onClick={() => handleFileSelect("image")}
      title="Add photo"
    />

    <Button
      type="text"
      icon={<VideoCameraOutlined style={{ color: "#1D9E75", fontSize: 18 }} />}
      onClick={() => handleFileSelect("video")}
      title="Add video"
    />

    <Button
      type="text"
      icon={<FileTextOutlined style={{ color: "#D85A30", fontSize: 18 }} />}
      onClick={() => handleFileSelect("document")}
      title="Add document"
    />
  </Space>

  {/* File size limits text */}
  <div
    style={{
      fontSize: 11,
      color: "#888",
      marginLeft: 4,
      lineHeight: 1.4,
    }}
  >
    Doc: up to 5MB • Image: up to 5MB • Video: up to 100MB
  </div>
</div>

         <Button
    type="primary"
    shape="round"
    onClick={handlePost}
    loading={loading}
    disabled={!canPost}
    style={{ fontWeight: 600 }}
  >
    Post
  </Button>
        </div>
      </Modal>
    </>
  );
}