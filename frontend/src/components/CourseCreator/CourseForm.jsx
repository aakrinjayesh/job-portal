// src/components/CourseCreator/CourseForm.jsx
import React, { useState } from "react";
import { Form, Input, InputNumber, Button, Card, List, Typography, Divider, message, Space } from "antd";
import VideoUploadSection from "./VideoUploader";
import { createCourse } from "../../company/api/upload";

const { Text } = Typography;

export default function CourseForm() {
  const [uploaderVisible, setUploaderVisible] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState([]); // { id, url, fileName, size, duration, rawBackend }
  const [submitting, setSubmitting] = useState(false);

  const handleUploadSuccess = (uploadedMeta, originalFile) => {
    // Map backend returned object into our local representation (non-assuming)
    const item = {
      id: uploadedMeta?.id ?? `${Date.now()}-${originalFile.name}`,
      url: uploadedMeta?.url ?? uploadedMeta?.fileUrl ?? null,
      fileName: uploadedMeta?.fileName ?? originalFile.name,
      size: uploadedMeta?.size ?? originalFile.size,
      duration: uploadedMeta?.duration ?? null,
      rawBackend: uploadedMeta,
    };

    setUploadedVideos((prev) => [...prev, item]);
    message.success(`Uploaded: ${item.fileName}`);
  };

  const removeUploadedVideo = (id) => {
    setUploadedVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const onFinish = async (values) => {
    if (uploadedVideos.length === 0) {
      message.warning("Please upload at least one video for the course.");
      return;
    }

    const payload = {
      title: values.title,
      description: values.description ?? "",
      price: values.price ?? 0,
      videos: uploadedVideos.map((v) => ({
        id: v.id,
        url: v.url,
        fileName: v.fileName,
        size: v.size,
        duration: v.duration,
      })),
      // documents: [] // add later
    };

    try {
      setSubmitting(true);
      const res = await createCourse(payload);
      message.success("Course created successfully");
      console.log("createCourse response:", res?.data ?? res);
      // reset
      setUploadedVideos([]);
      // optionally reset form fields or navigate
    } catch (err) {
      console.error("Failed to create course:", err);
      message.error("Failed to create course. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Create Course" style={{ maxWidth: 960, margin: "0 auto" }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="Course Title"
          rules={[{ required: true, message: "Please enter course title" }]}
        >
          <Input placeholder="e.g., JavaScript Fundamentals" />
        </Form.Item>

        <Form.Item name="description" label="Course Description">
          <Input.TextArea rows={4} placeholder="Describe the course..." />
        </Form.Item>

        <Form.Item name="price" label="Price (₹)">
          <InputNumber min={0} style={{ width: 160 }} />
        </Form.Item>

        <Divider />

        <div style={{ marginBottom: 12 }}>
          <Button type="dashed" onClick={() => setUploaderVisible(true)}>
            + Upload Videos
          </Button>
          <Text type="secondary" style={{ marginLeft: 12 }}>
            Upload multiple videos. Add them first, then Submit course.
          </Text>
        </div>

        <List
          header={<div>Uploaded Videos</div>}
          bordered
          dataSource={uploadedVideos}
          locale={{ emptyText: "No uploaded videos yet" }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" danger onClick={() => removeUploadedVideo(item.id)}>
                  Remove
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={item.fileName}
                description={
                  <>
                    <div>Size: {item.size ? `${Math.round(item.size / 1024 / 1024)} MB` : "—"}</div>
                    <div>
                      URL:{" "}
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      ) : (
                        "—"
                      )}
                    </div>
                    <div>Duration: {item.duration ? `${item.duration} sec` : "—"}</div>
                  </>
                }
              />
            </List.Item>
          )}
          style={{ marginBottom: 16 }}
        />

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Create Course
            </Button>
            <Button onClick={() => console.log({ uploadedVideos })}>Debug: show uploadedVideos</Button>
          </Space>
        </Form.Item>
      </Form>

      <VideoUploadSection
        visible={uploaderVisible}
        onClose={() => setUploaderVisible(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </Card>
  );
}
