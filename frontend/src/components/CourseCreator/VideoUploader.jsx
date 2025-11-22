// src/components/CourseCreator/VideoUploadSection.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Modal, Button, List, Typography, Space, Progress, message, Tooltip } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { uploadVideo } from "../../company/api/upload";

const { Text } = Typography;

/**
 * Props:
 * - visible: boolean
 * - onClose: () => void
 * - onUploadSuccess: (uploadedFileMeta, fileObject) => void
 * - maxFiles: number (optional)
 *
 * Behavior:
 * - Files are selected via dropzone (no auto-upload)
 * - Files previewed in list with remove button
 * - User clicks "Start Upload" to upload all selected files (sequential)
 * - Progress shown per-file; on success parent is notified
 */
export default function VideoUploadSection({
  visible,
  onClose,
  onUploadSuccess,
  maxFiles = 10,
}) {
  const [files, setFiles] = useState([]); // { file, preview, progress, status }
  const [isUploading, setIsUploading] = useState(false);

  // Dropzone configuration
  const onDrop = useCallback(
    (acceptedFiles) => {
      // Append new files (avoid duplicates by name+size)
      setFiles((prev) => {
        const next = [...prev];
        for (const f of acceptedFiles) {
          const exists = next.some((p) => p.file.name === f.name && p.file.size === f.size);
          if (!exists) {
            next.push({
              file: f,
              preview: URL.createObjectURL(f),
              progress: 0,
              status: "pending", // pending | uploading | done | error
            });
          }
        }
        // trim to maxFiles
        return next.slice(0, maxFiles);
      });
    },
    [maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [] },
    multiple: true,
    maxFiles,
  });

  // cleanup previews on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeFile = (index) => {
    setFiles((prev) => {
      const copy = [...prev];
      const removed = copy.splice(index, 1)[0];
      if (removed && removed.preview) URL.revokeObjectURL(removed.preview);
      return copy;
    });
  };

  const startUpload = async () => {
    if (files.length === 0) {
      message.warning("Please add at least one video to upload.");
      return;
    }

    setIsUploading(true);

    // sequential upload (predictable progress). For parallel, use Promise.all.
    for (let i = 0; i < files.length; i++) {
      const entry = files[i];
      // skip already uploaded items
      if (entry.status === "done") continue;

      // set status uploading
      setFiles((prev) => {
        const copy = [...prev];
        copy[i] = { ...copy[i], status: "uploading", progress: 0 };
        return copy;
      });

      const fd = new FormData();
      // traditional field name "file"
      fd.append("file", entry.file, entry.file.name);

      // you can append extra metadata here if desired
      // fd.append("originalName", entry.file.name);

      try {
        const response = await uploadVideo(fd, (progressEvent) => {
          const loaded = progressEvent.loaded;
          const total = progressEvent.total || entry.file.size;
          const percent = total ? Math.round((loaded / total) * 100) : 0;

          setFiles((prev) => {
            const copy = [...prev];
            if (copy[i]) {
              copy[i] = { ...copy[i], progress: percent };
            }
            return copy;
          });
        });

        // treat success
        const uploadedData = response?.data ?? response;
        setFiles((prev) => {
          const copy = [...prev];
          copy[i] = { ...copy[i], status: "done", progress: 100, uploadedData };
          return copy;
        });

        // notify parent
        if (onUploadSuccess && typeof onUploadSuccess === "function") {
          onUploadSuccess(uploadedData, entry.file);
        }
      } catch (err) {
        console.error("Upload failed:", err);
        setFiles((prev) => {
          const copy = [...prev];
          copy[i] = { ...copy[i], status: "error" };
          return copy;
        });
        message.error(`Upload failed for ${entry.file.name}`);
        // continue to next file
      }
    }

    setIsUploading(false);
  };

  return (
    <Modal
      title="Upload Videos"
      open={visible}
      onCancel={() => {
        if (isUploading) {
          message.warning("Upload in progress. Please wait until completed or cancel uploads.");
          return;
        }
        onClose();
      }}
      footer={
        <Space>
          <Button onClick={onClose} disabled={isUploading}>
            Close
          </Button>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={startUpload}
            loading={isUploading}
            disabled={isUploading || files.length === 0}
          >
            Start Upload
          </Button>
        </Space>
      }
      width={820}
      destroyOnClose
    >
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #d9d9d9",
          borderRadius: 6,
          padding: 18,
          textAlign: "center",
          cursor: "pointer",
          marginBottom: 12,
          background: isDragActive ? "#fafafa" : "transparent",
        }}
      >
        <input {...getInputProps()} />
        <Text strong>
          {isDragActive ? "Drop the files here ..." : "Drag & drop videos here, or click to select"}
        </Text>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">MP4, MKV, MOV allowed. Max files: {maxFiles}</Text>
        </div>
      </div>

      <List
        bordered
        dataSource={files}
        locale={{ emptyText: "No files selected" }}
        renderItem={(item, idx) => (
          <List.Item
            actions={[
              <Tooltip title="Remove">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => removeFile(idx)}
                  disabled={isUploading}
                />
              </Tooltip>,
            ]}
          >
            <List.Item.Meta
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div>
                    <Text strong>{item.file.name}</Text>
                    <div style={{ fontSize: 12, color: "#888" }}>
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  {item.preview && (
                    <div style={{ marginLeft: "auto" }}>
                      <video
                        src={item.preview}
                        width={120}
                        height={70}
                        controls
                        style={{ borderRadius: 4 }}
                      />
                    </div>
                  )}
                </div>
              }
              description={
                <div style={{ width: "100%" }}>
                  <div style={{ marginTop: 8, marginBottom: 6 }}>
                    <Progress percent={item.progress} size="small" status={item.status === "error" ? "exception" : undefined} />
                  </div>
                  <div style={{ fontSize: 12 }}>
                    <Text type={item.status === "error" ? "danger" : undefined}>
                      {item.status === "pending" && "Pending upload"}
                      {item.status === "uploading" && "Uploading..."}
                      {item.status === "done" && "Uploaded"}
                      {item.status === "error" && "Upload failed"}
                    </Text>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Modal>
  );
}
