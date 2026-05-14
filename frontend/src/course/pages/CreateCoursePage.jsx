// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Form,
//   Input,
//   Switch,
//   Select,
//   InputNumber,
//   Button,
//   Upload,
//   Typography,
//   Tabs,
//   Card,
//   Space,
//   message,
//   Spin,
//   Divider,
//   Tag,
// } from "antd";
// import {
//   UploadOutlined,
//   SaveOutlined,
//   EyeOutlined,
//   ArrowLeftOutlined,
//   BookOutlined,
//   CheckCircleOutlined,
// } from "@ant-design/icons";
// import {
//   CreateCourse,
//   UpdateCourse,
//   GetCourseById,
//   PublishCourse,
//   UploadCourseThumbnail,
// } from "../api/courseApi.js";
// import SectionManager from "../components/SectionManager.jsx";
// import AssessmentManager from "../components/AssessmentManager.jsx";

// const { Title, Text } = Typography;
// const { Option } = Select;
// const { TextArea } = Input;

// const ACCESS_DURATIONS = [
//   { value: "LIFETIME", label: "Lifetime" },
//   { value: "ONE_MONTH", label: "1 Month" },
//   { value: "THREE_MONTHS", label: "3 Months" },
//   { value: "SIX_MONTHS", label: "6 Months" },
//   { value: "ONE_YEAR", label: "1 Year" },
// ];

// const CreateCoursePage = () => {
//   const { courseId } = useParams(); // undefined = create mode, id = edit mode
//   const navigate = useNavigate();
//   const [form] = Form.useForm();

//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(!!courseId);
//   const [saving, setSaving] = useState(false);
//   const [publishing, setPublishing] = useState(false);
//   const [thumbnailUrl, setThumbnailUrl] = useState(null);
//   const [thumbnailUploading, setThumbnailUploading] = useState(false);
//   const [isFree, setIsFree] = useState(true);
//   const [activeTab, setActiveTab] = useState("details");

//   const isEditMode = !!courseId;

//   useEffect(() => {
//     if (!isEditMode) return;
//     const load = async () => {
//       setLoading(true);
//       try {
//         const res = await GetCourseById(courseId);
//         const c = res.data;
//         setCourse(c);
//         setThumbnailUrl(c.thumbnailUrl);
//         setIsFree(c.isFree);
//         form.setFieldsValue({
//           title: c.title,
//           description: c.description,
//           slug: c.slug,
//           isFree: c.isFree,
//           price: c.price,
//           accessDuration: c.accessDuration,
//           hasCertificate: c.hasCertificate,
//           certificateValidityDays: c.certificateValidityDays,
//           hasPreview: c.hasPreview,
//         });
//       } catch {
//         message.error("Failed to load course");
//         navigate(-1);
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [courseId]);

//   const handleThumbnailUpload = async ({ file }) => {
//     setThumbnailUploading(true);
//     try {
//       const res = await UploadCourseThumbnail(file);
//       //   setThumbnailUrl(res.data.url);
//       setThumbnailUrl(res.data.fileUrl);
//       message.success("Thumbnail uploaded");
//     } catch {
//       message.error("Thumbnail upload failed");
//     } finally {
//       setThumbnailUploading(false);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       const values = await form.validateFields();
//       setSaving(true);

//       const payload = {
//         ...values,
//         thumbnailUrl,
//         price: values.isFree ? 0 : values.price || 0,
//         slug:
//           values.slug ||
//           values.title
//             ?.toLowerCase()
//             .replace(/\s+/g, "-")
//             .replace(/[^a-z0-9-]/g, ""),
//       };

//       if (isEditMode) {
//         await UpdateCourse(courseId, payload);
//         message.success("Course updated");
//       } else {
//         const res = await CreateCourse(payload);
//         message.success("Course created");
//         navigate(`/company/courses/edit/${res.data.id}`, { replace: true });
//       }
//     } catch (err) {
//       if (err?.errorFields) return; // Ant Design validation
//       message.error(err.response?.data?.message || "Failed to save course");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handlePublish = async () => {
//     if (!courseId) return message.warning("Save the course first");
//     setPublishing(true);
//     try {
//       const res = await PublishCourse(courseId);
//       setCourse(res.data);
//       message.success(
//         res.data.status === "PUBLISHED"
//           ? "Course published!"
//           : "Course moved to draft",
//       );
//     } catch (err) {
//       message.error(err.response?.data?.message || "Failed to publish");
//     } finally {
//       setPublishing(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ textAlign: "center", padding: 80 }}>
//         <Spin size="large" />
//       </div>
//     );
//   }

//   const tabItems = [
//     {
//       key: "details",
//       label: (
//         <span>
//           <BookOutlined /> Course Details
//         </span>
//       ),
//       children: (
//         <Form
//           form={form}
//           layout="vertical"
//           initialValues={{ isFree: true, accessDuration: "LIFETIME" }}
//         >
//           <Card
//             title="Basic Info"
//             style={{ borderRadius: 12, marginBottom: 16 }}
//           >
//             <Form.Item
//               name="title"
//               label="Course Title"
//               rules={[{ required: true }]}
//             >
//               <Input placeholder="e.g. Salesforce Admin Fundamentals" />
//             </Form.Item>

//             <Form.Item
//               name="slug"
//               label="URL Slug"
//               extra="Auto-generated if left empty. Only lowercase letters, numbers and hyphens."
//             >
//               <Input placeholder="e.g. salesforce-admin-fundamentals" />
//             </Form.Item>

//             <Form.Item name="description" label="Description">
//               <TextArea rows={4} placeholder="What will students learn?" />
//             </Form.Item>

//             {/* Thumbnail */}
//             <Form.Item label="Thumbnail">
//               <Space direction="vertical">
//                 <Upload
//                   customRequest={handleThumbnailUpload}
//                   showUploadList={false}
//                   accept="image/*"
//                 >
//                   <Button
//                     icon={<UploadOutlined />}
//                     loading={thumbnailUploading}
//                   >
//                     Upload Thumbnail
//                   </Button>
//                 </Upload>
//                 {thumbnailUrl && (
//                   <img
//                     src={thumbnailUrl}
//                     alt="thumbnail"
//                     style={{
//                       width: 200,
//                       height: 112,
//                       objectFit: "cover",
//                       borderRadius: 8,
//                     }}
//                     onError={(e) => {
//                       e.target.style.display = "none";
//                     }}
//                   />
//                 )}
//               </Space>
//             </Form.Item>
//           </Card>

//           <Card
//             title="Pricing & Access"
//             style={{ borderRadius: 12, marginBottom: 16 }}
//           >
//             <Form.Item
//               name="isFree"
//               label="Free Course"
//               valuePropName="checked"
//             >
//               <Switch onChange={setIsFree} />
//             </Form.Item>

//             {!isFree && (
//               <Form.Item
//                 name="price"
//                 label="Price (in paise — e.g. 49900 = ₹499)"
//               >
//                 <InputNumber
//                   min={0}
//                   style={{ width: "100%" }}
//                   placeholder="49900"
//                 />
//               </Form.Item>
//             )}

//             <Form.Item name="accessDuration" label="Access Duration">
//               <Select>
//                 {ACCESS_DURATIONS.map((d) => (
//                   <Option key={d.value} value={d.value}>
//                     {d.label}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>

//             <Form.Item
//               name="hasPreview"
//               label="Allow Free Preview"
//               valuePropName="checked"
//             >
//               <Switch />
//             </Form.Item>
//           </Card>

//           <Card
//             title="Certificate Settings"
//             style={{ borderRadius: 12, marginBottom: 16 }}
//           >
//             <Form.Item
//               name="hasCertificate"
//               label="Issue Certificate on Completion"
//               valuePropName="checked"
//             >
//               <Switch />
//             </Form.Item>

//             <Form.Item
//               noStyle
//               shouldUpdate={(prev, curr) =>
//                 prev.hasCertificate !== curr.hasCertificate
//               }
//             >
//               {({ getFieldValue }) =>
//                 getFieldValue("hasCertificate") ? (
//                   <Form.Item
//                     name="certificateValidityDays"
//                     label="Certificate Valid For (days) — leave empty for lifetime"
//                   >
//                     <InputNumber
//                       min={1}
//                       style={{ width: "100%" }}
//                       placeholder="e.g. 365 for 1 year"
//                     />
//                   </Form.Item>
//                 ) : null
//               }
//             </Form.Item>
//           </Card>
//         </Form>
//       ),
//     },
//     {
//       key: "curriculum",
//       label: "Curriculum",
//       disabled: !isEditMode,
//       children: isEditMode ? (
//         <Card style={{ borderRadius: 12 }}>
//           <SectionManager
//             courseId={courseId}
//             initialSections={course?.sections || []}
//           />
//         </Card>
//       ) : null,
//     },
//     {
//       key: "assessment",
//       label: (
//         <span>
//           <CheckCircleOutlined /> Assessment
//         </span>
//       ),
//       disabled: !isEditMode,
//       children: isEditMode ? (
//         <Card style={{ borderRadius: 12 }}>
//           <AssessmentManager courseId={courseId} />
//         </Card>
//       ) : null,
//     },
//   ];

//   return (
//     <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
//       {/* Header */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 24,
//         }}
//       >
//         <Space>
//           <Button
//             icon={<ArrowLeftOutlined />}
//             type="text"
//             onClick={() => navigate("/company/courses")}
//           />
//           <div>
//             <Title level={4} style={{ margin: 0 }}>
//               {isEditMode ? "Edit Course" : "Create Course"}
//             </Title>
//             {course && (
//               <Tag
//                 color={course.status === "PUBLISHED" ? "success" : "warning"}
//               >
//                 {course.status}
//               </Tag>
//             )}
//           </div>
//         </Space>

//         <Space>
//           <Button icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
//             Save
//           </Button>
//           {isEditMode && (
//             <Button
//               type="primary"
//               icon={<EyeOutlined />}
//               loading={publishing}
//               onClick={handlePublish}
//               style={
//                 course?.status === "PUBLISHED"
//                   ? { background: "#ff4d4f", borderColor: "#ff4d4f" }
//                   : {}
//               }
//             >
//               {course?.status === "PUBLISHED" ? "Unpublish" : "Publish"}
//             </Button>
//           )}
//         </Space>
//       </div>

//       <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
//     </div>
//   );
// };

// export default CreateCoursePage;

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Form,
  Input,
  Switch,
  Select,
  InputNumber,
  Button,
  Upload,
  Typography,
  Tabs,
  Card,
  Space,
  message,
  Spin,
  Divider,
  Tag,
} from "antd";
import {
  UploadOutlined,
  SaveOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  CreateCourse,
  UpdateCourse,
  GetCourseById,
  PublishCourse,
  UploadCourseThumbnail,
  CheckCourseSlug,
} from "../api/courseApi.js";
import SectionManager from "../components/SectionManager.jsx";
import AssessmentManager from "../components/AssessmentManager.jsx";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ACCESS_DURATIONS = [
  { value: "LIFETIME", label: "Lifetime" },
  { value: "ONE_MONTH", label: "1 Month" },
  { value: "THREE_MONTHS", label: "3 Months" },
  { value: "SIX_MONTHS", label: "6 Months" },
  { value: "ONE_YEAR", label: "1 Year" },
];

const CreateCoursePage = () => {
  const { courseId } = useParams(); // undefined = create mode, id = edit mode
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(!!courseId);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  const isEditMode = !!courseId;

  // Determine base path (candidate vs company) from current URL
  const isCandidate = location.pathname.startsWith("/candidate");
  const basePath = isCandidate ? "/candidate" : "/company";
  const coursesPath = `${basePath}/courses`;

  useEffect(() => {
    if (!isEditMode) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await GetCourseById(courseId);
        const c = res.data;
        setCourse(c);
        setThumbnailUrl(c.thumbnailUrl);
        setIsFree(c.isFree);
        form.setFieldsValue({
          title: c.title,
          description: c.description,
          // requirements: c.requirements,
          prerequisities: c.prerequisities,
          whatYouWillLearn: c.whatYouWillLearn,
          // topics: c.topics,
          syllabus: c.syllabus,
          courseLevel: c.courseLevel,
          slug: c.slug,
          isFree: c.isFree,
          price: c.price,
          accessDuration: c.accessDuration,
          hasCertificate: c.hasCertificate,
          certificateValidityDays: c.certificateValidityDays,
          hasPreview: c.hasPreview,
        });
      } catch {
        message.error("Failed to load course");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const handleThumbnailUpload = async ({ file }) => {
    setThumbnailUploading(true);
    try {
      const res = await UploadCourseThumbnail(file);
      setThumbnailUrl(res.data.fileUrl);
      message.success("Thumbnail uploaded");
    } catch {
      message.error("Thumbnail upload failed");
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        ...values,
        thumbnailUrl,
        price: values.isFree ? 0 : values.price || 0,
        slug:
          values.slug ||
          values.title
            ?.toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
      };

      if (isEditMode) {
        await UpdateCourse(courseId, payload);
        message.success("Course updated");
      } else {
        const res = await CreateCourse(payload);
        message.success("Course created");
        // Navigate to edit page under the same base path (candidate or company)
        navigate(`${basePath}/courses/edit/${res.data.id}`, { replace: true });
      }
    } catch (err) {
      if (err?.errorFields) return; // Ant Design validation
      message.error(err.response?.data?.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!courseId) return message.warning("Save the course first");
    setPublishing(true);
    try {
      const res = await PublishCourse(courseId);
      setCourse(res.data);
      message.success(
        res.data.status === "PUBLISHED"
          ? "Course published!"
          : "Course moved to draft",
      );
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const tabItems = [
    {
      key: "details",
      label: (
        <span>
          <BookOutlined /> Course Details
        </span>
      ),
      children: (
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isFree: true, accessDuration: "LIFETIME" }}
        >
          <Card
            title="Basic Info"
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            <Form.Item
              name="title"
              label="Course Title"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. Salesforce Admin Fundamentals" />
            </Form.Item>

            {/* <Form.Item
              name="slug"
              label="URL Slug"
              extra="Auto-generated if left empty. Only lowercase letters, numbers and hyphens."
            >
              <Input placeholder="e.g. salesforce-admin-fundamentals" />
            </Form.Item> */}
            <Form.Item
              name="slug"
              label="URL Slug"
              extra="Only lowercase letters, numbers and hyphens."
              validateTrigger="onChange"
              rules={[
                {
                  pattern: /^[a-z0-9-]+$/,
                  message: "Special characters are not allowed",
                },

                {
                  validator: async (_, value) => {
                    if (!value) return Promise.resolve();

                    const res = await CheckCourseSlug(value);

                    // while editing ignore same course slug
                    if (res.exists && res.courseId !== courseId) {
                      return Promise.reject(
                        new Error(
                          "Slug already exists. Please change the slug name.",
                        ),
                      );
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="e.g. salesforce-admin-fundamentals" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea rows={4} placeholder="What will students learn?" />
            </Form.Item>

            <Form.Item name="whatYouWillLearn" label="What You'll Learn">
              <TextArea
                rows={4}
                placeholder={`Example:
• Build AI agents
• Learn MCP
• Build production apps`}
              />
            </Form.Item>

            {/* <Form.Item name="requirements" label="Requirements"> */}
            <Form.Item name="prerequisities" label="Prerequisites">
              <TextArea
                rows={4}
                placeholder={`Example:
• Basic JavaScript knowledge
• Laptop with internet`}
              />
            </Form.Item>

            <Form.Item
              // name="topics"
              // label="Topics Covered"
              name="syllabus"
              label="Syllabus"
              extra="Press enter after each topic"
            >
              {/* <Select
                mode="tags"
                placeholder="Add topics"
                style={{ width: "100%" }}
                tokenSeparators={[","]}
              /> */}
              <TextArea
                rows={5}
                placeholder={`Example:
• Introduction
• Azure Storage
• Azure Networking`}
              />
            </Form.Item>

            <Form.Item name="courseLevel" label="Course Level">
              <Select>
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Advanced">Advanced</Option>
              </Select>
            </Form.Item>

            {/* Thumbnail */}
            <Form.Item label="Thumbnail">
              <Space direction="vertical">
                <Upload
                  customRequest={handleThumbnailUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button
                    icon={<UploadOutlined />}
                    loading={thumbnailUploading}
                  >
                    Upload Thumbnail
                  </Button>
                </Upload>
                {thumbnailUrl && (
                  <img
                    src={thumbnailUrl}
                    alt="thumbnail"
                    style={{
                      width: 200,
                      height: 112,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
              </Space>
            </Form.Item>
          </Card>

          <Card
            title="Pricing & Access"
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            <Form.Item
              name="isFree"
              label="Free Course"
              valuePropName="checked"
            >
              <Switch onChange={setIsFree} />
            </Form.Item>

            {!isFree && (
              <Form.Item
                name="price"
                label="Price (in paise — e.g. 49900 = ₹499)"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="49900"
                />
              </Form.Item>
            )}

            <Form.Item name="accessDuration" label="Access Duration">
              <Select>
                {ACCESS_DURATIONS.map((d) => (
                  <Option key={d.value} value={d.value}>
                    {d.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="hasPreview"
              label="Allow Free Preview"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Card>

          <Card
            title="Certificate Settings"
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            <Form.Item
              name="hasCertificate"
              label="Issue Certificate on Completion"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prev, curr) =>
                prev.hasCertificate !== curr.hasCertificate
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("hasCertificate") ? (
                  <Form.Item
                    name="certificateValidityDays"
                    label="Certificate Valid For (days) — leave empty for lifetime"
                  >
                    <InputNumber
                      min={1}
                      style={{ width: "100%" }}
                      placeholder="e.g. 365 for 1 year"
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </Card>
        </Form>
      ),
    },
    {
      key: "curriculum",
      label: "Curriculum",
      disabled: !isEditMode,
      children: isEditMode ? (
        <Card style={{ borderRadius: 12 }}>
          <SectionManager
            courseId={courseId}
            initialSections={course?.sections || []}
          />
        </Card>
      ) : null,
    },
    {
      key: "assessment",
      label: (
        <span>
          <CheckCircleOutlined /> Assessment
        </span>
      ),
      disabled: !isEditMode,
      children: isEditMode ? (
        <Card style={{ borderRadius: 12 }}>
          <AssessmentManager courseId={courseId} />
        </Card>
      ) : null,
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Space>
          {/* ✅ Uses navigate(-1) so it works from both /candidate and /company */}
          <Button
            icon={<ArrowLeftOutlined />}
            type="text"
            onClick={() => navigate(-1)}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {isEditMode ? "Edit Course" : "Create Course"}
            </Title>
            {course && (
              <Tag
                color={course.status === "PUBLISHED" ? "success" : "warning"}
              >
                {course.status}
              </Tag>
            )}
          </div>
        </Space>

        <Space>
          <Button icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            Save
          </Button>
          {isEditMode && (
            <Button
              type="primary"
              icon={<EyeOutlined />}
              loading={publishing}
              onClick={handlePublish}
              style={
                course?.status === "PUBLISHED"
                  ? { background: "#ff4d4f", borderColor: "#ff4d4f" }
                  : {}
              }
            >
              {course?.status === "PUBLISHED" ? "Unpublish" : "Publish"}
            </Button>
          )}
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default CreateCoursePage;
