import { useState } from "react";
import {
  Collapse,
  Button,
  Input,
  Space,
  Typography,
  Popconfirm,
  message,
  Upload,
  Select,
  Switch,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  UploadOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import {
  CreateSection,
  UpdateSection,
  DeleteSection,
  CreateLecture,
  UpdateLecture,
  DeleteLecture,
  UploadLectureFile,
} from "../api/courseApi.js";

const { Text } = Typography;
const { Option } = Select;

// ── Single lecture row ─────────────────────────────────────
const LectureRow = ({ lecture, courseId, sectionId, onDeleted, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lecture.title);
  const [isPreview, setIsPreview] = useState(lecture.isPreview);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return message.warning("Title required");
    setSaving(true);
    try {
      const updated = await UpdateLecture(courseId, sectionId, lecture.id, {
        title,
        isPreview,
      });
      onUpdated?.(updated.data);
      setEditing(false);
      message.success("Lecture updated");
    } catch {
      message.error("Failed to update lecture");
    } finally {
      setSaving(false);
    }
  };

  //   const handleUpload = async ({ file }) => {
  //     setUploading(true);
  //     try {
  //       const res = await UploadLectureFile(file);
  //       await UpdateLecture(courseId, sectionId, lecture.id, {
  //         contentUrl: res.data.url,
  //       });
  //       message.success("File uploaded");
  //       onUpdated?.({ ...lecture, contentUrl: res.data.url });
  //     } catch {
  //       message.error("Upload failed");
  //     } finally {
  //       setUploading(false);
  //     }
  //   };
  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");

      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);

        resolve(Math.floor(video.duration));
      };

      video.src = URL.createObjectURL(file);
    });
  };
  // const handleUpload = async ({ file }) => {
  //   setUploading(true);

  //   try {
  //     const res = await UploadLectureFile(file);

  //     await UpdateLecture(courseId, sectionId, lecture.id, {
  //       contentUrl: res.data.fileUrl,
  //     });

  //     message.success("File uploaded");

  //     onUpdated?.({
  //       ...lecture,
  //       contentUrl: res.data.fileUrl,
  //     });
  //   } catch {
  //     message.error("Upload failed");
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const handleUpload = async ({ file }) => {
    setUploading(true);

    try {
      let durationSeconds = null;

      // Calculate video duration
      if (file.type.startsWith("video/")) {
        durationSeconds = await getVideoDuration(file);
      }

      // Upload file
      const res = await UploadLectureFile(file);

      // Save lecture
      await UpdateLecture(courseId, sectionId, lecture.id, {
        contentUrl: res.data.fileUrl,
        durationSeconds,
      });

      message.success("File uploaded");

      onUpdated?.({
        ...lecture,
        contentUrl: res.data.fileUrl,
        durationSeconds,
      });
    } catch (err) {
      console.error(err);

      message.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await DeleteLecture(courseId, sectionId, lecture.id);
      onDeleted?.(lecture.id);
      message.success("Lecture deleted");
    } catch {
      message.error("Failed to delete lecture");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        background: "#fafafa",
        borderRadius: 8,
        marginBottom: 6,
        border: "1px solid #f0f0f0",
      }}
    >
      <HolderOutlined style={{ color: "#bbb", cursor: "grab" }} />

      {lecture.type === "VIDEO" ? (
        // lecture.contentUrl?.includes(".pdf")
        <VideoCameraOutlined style={{ color: "#1677ff" }} />
      ) : (
        <FileTextOutlined style={{ color: "#52c41a" }} />
      )}

      {editing ? (
        <Space style={{ flex: 1 }}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
            style={{ width: 200 }}
          />
          <Switch
            size="small"
            checked={isPreview}
            onChange={setIsPreview}
            checkedChildren="Preview"
            unCheckedChildren="Locked"
          />
          <Button
            size="small"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
            type="primary"
          />
          <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={() => setEditing(false)}
          />
        </Space>
      ) : (
        <Text style={{ flex: 1 }}>
          {lecture.title}
          {lecture.isPreview && (
            <Text type="success" style={{ fontSize: 11, marginLeft: 8 }}>
              Free preview
            </Text>
          )}
          {lecture.contentUrl && (
            <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
              ✓ Uploaded
            </Text>
          )}
        </Text>
      )}

      <Space>
        <Upload
          customRequest={handleUpload}
          showUploadList={false}
          accept="video/*,.pdf"
        >
          <Button size="small" icon={<UploadOutlined />} loading={uploading} />
        </Upload>
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => setEditing(true)}
        />
        <Popconfirm
          title="Delete this lecture?"
          onConfirm={handleDelete}
          okText="Yes"
          cancelText="No"
        >
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    </div>
  );
};

// ── Single section panel ───────────────────────────────────
const SectionPanel = ({ section, courseId, onDeleted, onUpdated }) => {
  const [lectures, setLectures] = useState(section.lectures || []);
  const [addingLecture, setAddingLecture] = useState(false);
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [newLectureType, setNewLectureType] = useState("VIDEO");
  const [creating, setCreating] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [sectionTitle, setSectionTitle] = useState(section.title);
  const [savingTitle, setSavingTitle] = useState(false);

  const handleAddLecture = async () => {
    if (!newLectureTitle.trim()) return message.warning("Enter lecture title");
    setCreating(true);
    try {
      const res = await CreateLecture(courseId, section.id, {
        title: newLectureTitle,
        type: newLectureType,
      });
      setLectures((prev) => [...prev, res.data]);
      setNewLectureTitle("");
      setAddingLecture(false);
      message.success("Lecture added");
    } catch {
      message.error("Failed to add lecture");
    } finally {
      setCreating(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!sectionTitle.trim()) return;
    setSavingTitle(true);
    try {
      await UpdateSection(courseId, section.id, { title: sectionTitle });
      onUpdated?.({ ...section, title: sectionTitle });
      setEditingTitle(false);
      message.success("Section updated");
    } catch {
      message.error("Failed to update section");
    } finally {
      setSavingTitle(false);
    }
  };

  const handleDeleteSection = async () => {
    try {
      await DeleteSection(courseId, section.id);
      onDeleted?.(section.id);
      message.success("Section deleted");
    } catch {
      message.error("Failed to delete section");
    }
  };

  return (
    <div
      style={{
        border: "1px solid #e8e8e8",
        borderRadius: 10,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          background: "#f0f5ff",
          borderBottom: "1px solid #e8e8e8",
        }}
      >
        <HolderOutlined style={{ color: "#bbb", cursor: "grab" }} />

        {editingTitle ? (
          <Space style={{ flex: 1 }}>
            <Input
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              size="small"
              style={{ width: 220 }}
            />
            <Button
              size="small"
              icon={<SaveOutlined />}
              loading={savingTitle}
              onClick={handleSaveTitle}
              type="primary"
            />
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setEditingTitle(false)}
            />
          </Space>
        ) : (
          <Text strong style={{ flex: 1 }}>
            {sectionTitle}
          </Text>
        )}

        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => setEditingTitle(true)}
          />
          <Popconfirm
            title="Delete this section and all its lectures?"
            onConfirm={handleDeleteSection}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </div>

      {/* Lectures list */}
      <div style={{ padding: "10px 14px" }}>
        {lectures.map((lec) => (
          <LectureRow
            key={lec.id}
            lecture={lec}
            courseId={courseId}
            sectionId={section.id}
            onDeleted={(id) =>
              setLectures((prev) => prev.filter((l) => l.id !== id))
            }
            onUpdated={(updated) =>
              setLectures((prev) =>
                prev.map((l) => (l.id === updated.id ? updated : l)),
              )
            }
          />
        ))}

        {/* Add lecture form */}
        {addingLecture ? (
          <Space style={{ marginTop: 8 }}>
            <Select
              value={newLectureType}
              onChange={setNewLectureType}
              size="small"
              style={{ width: 100 }}
            >
              <Option value="VIDEO">Video</Option>
              <Option value="TEXT">Text</Option>
            </Select>
            <Input
              placeholder="Lecture title"
              value={newLectureTitle}
              onChange={(e) => setNewLectureTitle(e.target.value)}
              size="small"
              style={{ width: 200 }}
              onPressEnter={handleAddLecture}
            />
            <Button
              size="small"
              type="primary"
              loading={creating}
              onClick={handleAddLecture}
            >
              Add
            </Button>
            <Button size="small" onClick={() => setAddingLecture(false)}>
              Cancel
            </Button>
          </Space>
        ) : (
          <Button
            type="dashed"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setAddingLecture(true)}
            style={{ marginTop: 8 }}
          >
            Add Lecture
          </Button>
        )}
      </div>
    </div>
  );
};

// ── Main SectionManager ────────────────────────────────────
const SectionManager = ({ courseId, initialSections = [] }) => {
  const [sections, setSections] = useState(initialSections);
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return message.warning("Enter section title");
    setCreating(true);
    try {
      const res = await CreateSection(courseId, { title: newSectionTitle });
      setSections((prev) => [...prev, { ...res.data, lectures: [] }]);
      setNewSectionTitle("");
      setAddingSection(false);
      message.success("Section added");
    } catch {
      message.error("Failed to add section");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      {sections.map((section) => (
        <SectionPanel
          key={section.id}
          section={section}
          courseId={courseId}
          onDeleted={(id) =>
            setSections((prev) => prev.filter((s) => s.id !== id))
          }
          onUpdated={(updated) =>
            setSections((prev) =>
              prev.map((s) => (s.id === updated.id ? updated : s)),
            )
          }
        />
      ))}

      {addingSection ? (
        <Space style={{ marginTop: 8 }}>
          <Input
            placeholder="Section title"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            style={{ width: 280 }}
            onPressEnter={handleAddSection}
          />
          <Button type="primary" loading={creating} onClick={handleAddSection}>
            Add Section
          </Button>
          <Button onClick={() => setAddingSection(false)}>Cancel</Button>
        </Space>
      ) : (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setAddingSection(true)}
          style={{ width: "100%", marginTop: 8 }}
        >
          Add Section
        </Button>
      )}
    </div>
  );
};

export default SectionManager;
