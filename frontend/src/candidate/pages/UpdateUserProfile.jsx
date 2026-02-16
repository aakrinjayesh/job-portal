import React, { useEffect, useState } from "react";
import {
  Button,
  Upload,
  Card,
  Typography,
  message,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Divider,
  Checkbox,
  Switch,
  Collapse,
  Avatar,
} from "antd";

import {
  UploadOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  UploadPdf,
  profiledata,
  GetUserProfile,
  GetSkills,
  PostSkills,
  GetCertifications,
  PostCertifications,
  GetLocations,
  PostLocations,
  GetClouds,
  GetRole,
  PostRole,
  PostClouds,
  uploadProfilePicture,
} from "../api/api";
import GenerateResume from "../components/UserProfile/GenerateResume";
import ReusableSelect from "../components/UserProfile/ReusableSelect";
import SkillManagerCard from "../components/UserProfile/SkillManagerCard";
import EducationCard from "../components/UserProfile/EducationCard";
import ExperienceCard from "../components/UserProfile/ExperienceCard";

const { Title } = Typography;
const { Option } = Select;

const UpdateUserProfile = ({
  handleFormDetails,
  Reciviedrole,
  setModalVisible,
  editRecord,
  setEditRecord,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();
  const [messageAPI, contextHolder] = message.useMessage();

  const [showContact, setShowContact] = useState(true);
  const [fileList, setFileList] = useState([]);

  console.log("Recivied Role", Reciviedrole);
  console.log("edit", editRecord);

  // State for skills with experience (stored as objects)
  const [primarySkills, setPrimarySkills] = useState([]);
  const [secondarySkills, setSecondarySkills] = useState([]);
  const [primaryClouds, setPrimaryClouds] = useState([]);
  const [secondaryClouds, setSecondaryClouds] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);

  const [isCandidate, setIsCandidate] = useState(false);

  const role = localStorage.getItem("role");
  const isEditMode = Boolean(editRecord && editRecord.id);

  useEffect(() => {
    if (editRecord && Reciviedrole) {
      setIsCandidate(!!editRecord.userId);
      console.log("edit true");
      // Reset previous values
      form.resetFields();

      // Extract primary & secondary skills
      const skillsJson = editRecord?.skillsJson || [];
      const prims = skillsJson
        .filter((s) => s?.level === "primary")
        .map((s) => ({ name: s?.name, experience: s?.experience ?? 0 }));
      const secs = skillsJson
        .filter((s) => s?.level === "secondary")
        .map((s) => ({ name: s?.name, experience: s?.experience ?? 0 }));

      // Extract clouds safely
      const primClouds = (editRecord?.primaryClouds || []).map((c) =>
        typeof c === "string" ? { name: c, experience: 0 } : c,
      );
      const secClouds = (editRecord?.secondaryClouds || []).map((c) =>
        typeof c === "string" ? { name: c, experience: 0 } : c,
      );

      // Update local states (for SkillManagerCard, etc.)
      setPrimarySkills(prims);
      setSecondarySkills(secs);
      setPrimaryClouds(primClouds);
      setSecondaryClouds(secClouds);
      setEducationList(editRecord?.education || []);
      setExperienceList(editRecord?.workExperience || []);

      // Update form fields
      form.setFieldsValue({
        name: editRecord?.name || "",
        phoneNumber: editRecord?.phoneNumber || "",
        email: editRecord?.email || "",
        portfolioLink: editRecord?.portfolioLink || "",
        profilePicture: editRecord?.profilePicture || null,
        title: editRecord?.title || "",
        summary: editRecord?.summary || "",

        currentCTC: editRecord?.currentCTC || "",
        expectedCTC: editRecord?.expectedCTC || "",
        rateCardPerHour: editRecord?.rateCardPerHour || {
          value: "",
          currency: "INR",
        },
        joiningPeriod: editRecord?.joiningPeriod || "",
        totalExperience: editRecord?.totalExperience || "",
        relevantSalesforceExperience:
          editRecord?.relevantSalesforceExperience || "",
        linkedInUrl: editRecord?.linkedInUrl || "",
        trailheadUrl: editRecord?.trailheadUrl || "",
        preferredLocation: editRecord?.preferredLocation || [],
        currentLocation: editRecord?.currentLocation || null,
        preferredJobType: editRecord?.preferredJobType || [],
        certifications: editRecord?.certifications || [],
        education: editRecord?.education || [],
        workExperience: editRecord?.workExperience || [],
        primarySkills: prims,
        secondarySkills: secs,
        primaryClouds: primClouds,
        secondaryClouds: secClouds,
        isContactDetails: editRecord?.isContactDetails || true,
      });

      // ✅ FIX: PROPERLY RENDER EXISTING IMAGE
      if (editRecord?.profilePicture) {
        setFileList([
          {
            uid: "-1",
            name: "profile-picture.jpg",
            status: "done",
            url: editRecord.profilePicture,
            thumbUrl: editRecord.profilePicture, // ✅ CRITICAL for rendering
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      console.log("edit false");
    }
    return () => {
      form.resetFields();
      setPrimarySkills([]);
      setSecondarySkills([]);
      setPrimaryClouds([]);
      setSecondaryClouds([]);
      setEducationList([]);
      setExperienceList([]);
      setFileList([]);
      setShowContact(true);
    };
  }, [editRecord]);

  const getInitialData = async () => {
    try {
      const res = await GetUserProfile();
      if (res?.status === "success" && res?.user) {
        const user = res?.user;

        setIsCandidate(!!user.userId);

        // Extract skills from skillsJson
        const skillsJson = user?.skillsJson || [];
        const prims = skillsJson
          .filter((s) => s?.level === "primary")
          .map((s) => ({ name: s?.name, experience: s?.experience ?? 0 }));
        const secs = skillsJson
          .filter((s) => s?.level === "secondary")
          .map((s) => ({ name: s?.name, experience: s?.experience ?? 0 }));

        setPrimarySkills(prims);
        setSecondarySkills(secs);

        // Convert clouds to object format if they're strings
        const primClouds = (user.primaryClouds || []).map((cloud) =>
          typeof cloud === "string" ? { name: cloud, experience: 0 } : cloud,
        );
        const secClouds = (user.secondaryClouds || []).map((cloud) =>
          typeof cloud === "string" ? { name: cloud, experience: 0 } : cloud,
        );

        setPrimaryClouds(primClouds);
        setSecondaryClouds(secClouds);
        setEducationList(user?.education || []);
        setExperienceList(user?.workExperience || []);

        // ✅ FIX: PROPERLY RENDER EXISTING IMAGE ON INITIAL LOAD
        if (user?.profilePicture) {
          setFileList([
            {
              uid: "-1",
              name: "profile-picture.jpg",
              status: "done",
              url: user.profilePicture,
              thumbUrl: user.profilePicture, // ✅ CRITICAL
            },
          ]);
        }

        // Populate form - INCLUDING skills and clouds
        form.setFieldsValue({
          name: user?.name || "",
          phoneNumber: user?.phoneNumber || "",
          email: user?.email || "",
          portfolioLink: user?.portfolioLink || "",
          profilePicture: user?.profilePicture || null,
          preferredLocation: user?.preferredLocation || [],
          currentLocation: user?.currentLocation,
          preferredJobType: user?.preferredJobType || [],
          currentCTC: user?.currentCTC,
          expectedCTC: user?.expectedCTC,
          joiningPeriod: user?.joiningPeriod,
          totalExperience: user?.totalExperience,
          relevantSalesforceExperience: user?.relevantSalesforceExperience,
          certifications: user?.certifications || [],
          workExperience: user?.workExperience || [],
          rateCardPerHour: user?.rateCardPerHour || {
            value: "",
            currency: "INR",
          },
          title: user?.title || "",
          summary: user?.summary || "",

          linkedInUrl: user?.linkedInUrl || "",
          trailheadUrl: user?.trailheadUrl || "",
          education: user?.education || [],
          // Add skills and clouds to form
          primarySkills: prims,
          secondarySkills: secs,
          primaryClouds: primClouds,
          secondaryClouds: secClouds,
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      messageAPI.error("Failed to load profile data");
    }
  };

  useEffect(() => {
    getInitialData();
  }, []);

  const handleUpload = async ({ file }) => {
    setLoading(true);

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("role", Reciviedrole || role);

    try {
      const response = await UploadPdf(uploadFormData);
      const extracted = response?.extracted || {};
      console.log("ectracted", extracted);

      // Handle skills extraction
      if (extracted.skillsJson && Array.isArray(extracted.skillsJson)) {
        const prims = extracted.skillsJson
          .filter((s) => s?.level === "primary")
          .map((s) => ({ name: s?.name, experience: s?.experience ?? 0 }));
        const secs = extracted.skillsJson
          .filter((s) => s?.level === "secondary")
          .map((s) => ({ name: s?.name, experience: s?.experience ?? 0 }));

        setPrimarySkills(prims);
        setSecondarySkills(secs);
        form.setFieldsValue({
          primarySkills: prims,
          secondarySkills: secs,
        });
      }

      // Handle clouds - convert to object format
      if (extracted.primaryClouds) {
        const primClouds = (
          Array.isArray(extracted.primaryClouds)
            ? extracted?.primaryClouds
            : [extracted?.primaryClouds]
        ).map((cloud) =>
          typeof cloud === "string" ? { name: cloud, experience: 0 } : cloud,
        );
        setPrimaryClouds(primClouds);
        form.setFieldsValue({ primaryClouds: primClouds });
      }

      if (extracted.secondaryClouds) {
        const secClouds = (
          Array.isArray(extracted.secondaryClouds)
            ? extracted.secondaryClouds
            : [extracted.secondaryClouds]
        ).map((cloud) =>
          typeof cloud === "string" ? { name: cloud, experience: 0 } : cloud,
        );
        setSecondaryClouds(secClouds);
        form.setFieldsValue({ secondaryClouds: secClouds });
      }

      // Handle education
      if (extracted?.education && Array.isArray(extracted?.education)) {
        setEducationList(extracted?.education);
        form.setFieldsValue({ education: extracted?.education });
      }

      if (
        extracted?.workExperience &&
        Array.isArray(extracted?.workExperience)
      ) {
        setExperienceList(extracted?.workExperience);
        form.setFieldValue({ workExperience: extracted?.workExperience });
      }

      // Populate other fields
      form.setFieldsValue({
        name: extracted?.name || form.getFieldValue("name"),
        phoneNumber:
          extracted?.phoneNumber || form.getFieldValue("phoneNumber"),
        email: extracted?.email || form.getFieldValue("email"),
        portfolioLink:
          extracted?.portfolioLink || form.getFieldValue("portfolioLink"),
        title: extracted?.title || form.getFieldValue("title"),
        summary: extracted?.summary || form.getFieldValue("summary"),
        currentCTC: extracted?.currentCTC || form.getFieldValue("currentCTC"),
        expectedCTC:
          extracted?.expectedCTC || form.getFieldValue("expectedCTC"),
        rateCardPerHour:
          extracted?.rateCardPerHour || form.getFieldValue("rateCardPerHour"),
        joiningPeriod:
          extracted?.joiningPeriod || form.getFieldValue("joiningPeriod"),
        totalExperience:
          extracted?.totalExperience || form.getFieldValue("totalExperience"),
        relevantSalesforceExperience:
          extracted?.relevantSalesforceExperience ||
          form.getFieldValue("relevantSalesforceExperience"),
        linkedInUrl:
          extracted?.linkedInUrl || form.getFieldValue("linkedInUrl"),
        trailheadUrl:
          extracted?.trailheadUrl || form.getFieldValue("trailheadUrl"),
        preferredLocation:
          extracted?.preferredLocation ||
          form.getFieldValue("preferredLocation"),
        currentLocation:
          extracted?.currentLocation || form.getFieldValue("currentLocation"),
        preferredJobType:
          extracted?.preferredJobType || form.getFieldValue("preferredJobType"),
        certifications:
          extracted?.certifications || form.getFieldValue("certifications"),
        workExperience:
          extracted?.workExperience || form.getFieldValue("workExperience"),
      });

      messageAPI.success("Resume details extracted successfully!");
    } catch (error) {
      console.error(error);
      messageAPI.error("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update handlers - NOW syncing with form like education
  const handlePrimarySkillsChange = (updatedSkills) => {
    setPrimarySkills(updatedSkills);
    form.setFieldsValue({ primarySkills: updatedSkills });
  };

  const handleSecondarySkillsChange = (updatedSkills) => {
    setSecondarySkills(updatedSkills);
    form.setFieldsValue({ secondarySkills: updatedSkills });
  };

  const handlePrimaryCloudsChange = (updatedClouds) => {
    setPrimaryClouds(updatedClouds);
    form.setFieldsValue({ primaryClouds: updatedClouds });
  };

  const handleSecondaryCloudsChange = (updatedClouds) => {
    setSecondaryClouds(updatedClouds);
    form.setFieldsValue({ secondaryClouds: updatedClouds });
  };

  const handleEducationChange = (updatedEducationList) => {
    console.log("education changes", updatedEducationList);
    setEducationList(updatedEducationList);
    form.setFieldsValue({ education: updatedEducationList });
  };

  const handleExperienceChange = (updatedExperience) => {
    console.log("experience", updatedExperience);
    setExperienceList(updatedExperience);
    form.setFieldsValue({ workExperience: updatedExperience });
  };

  const onFinish = async (values) => {
    try {
      setSubmitLoading(true);

      // -------------------------------
      // 1️⃣ HANDLE PROFILE PICTURE UPLOAD
      // -------------------------------

      let profilePicUrl = editRecord?.profilePicture || null;

      const fileList = values?.profilePicture || [];

      // ✅ CASE 1: USER DELETED IMAGE
      if (Array.isArray(fileList) && fileList.length === 0) {
        profilePicUrl = null;
      }

      // ✅ CASE 2: USER UPLOADED NEW IMAGE
      else if (fileList.length > 0) {
        const fileItem = fileList[0];

        if (fileItem.originFileObj instanceof File) {
          const fd = new FormData();
          fd.append("file", fileItem.originFileObj);

          const uploadRes = await uploadProfilePicture(fd);

          profilePicUrl =
            uploadRes?.url ||
            uploadRes?.data?.url ||
            uploadRes?.data?.location ||
            null;

          if (!profilePicUrl) {
            messageAPI.error("Failed to upload profile picture");
            return;
          }
        }
      }

      // -------------------------------
      // 2️⃣ BUILD SKILLS JSON
      // -------------------------------
      const skillsJson = [
        ...primarySkills.map((s) => ({
          name: s.name,
          experience: Number(s.experience ?? 0),
          level: "primary",
        })),
        ...secondarySkills.map((s) => ({
          name: s.name,
          experience: Number(s.experience ?? 0),
          level: "secondary",
        })),
      ];

      // -------------------------------
      // 3️⃣ FINAL PAYLOAD
      // -------------------------------
      const payload = {
        name: values?.name,
        phoneNumber: values?.phoneNumber,
        email: values?.email,
        portfolioLink: values?.portfolioLink,
        profilePicture: profilePicUrl, // <---- SAVED
        title: values?.title || null,
        summary: values?.summary ?? form.getFieldValue("summary") ?? "",
        currentCTC: String(values?.currentCTC) || null,
        expectedCTC: String(values?.expectedCTC) || null,
        joiningPeriod: values?.joiningPeriod || null,
        totalExperience: String(values?.totalExperience) || null,
        relevantSalesforceExperience:
          String(values?.relevantSalesforceExperience) || null,
        linkedInUrl: values?.linkedInUrl || null,
        trailheadUrl: values?.trailheadUrl || null,
        preferredLocation: values?.preferredLocation || [],
        currentLocation: values?.currentLocation || null,
        preferredJobType: values?.preferredJobType || [],
        skillsJson,
        primaryClouds,
        secondaryClouds,
        certifications: values?.certifications || [],
        workExperience: experienceList,
        education: educationList,
        rateCardPerHour: values.rateCardPerHour || {},
        isContactDetails: showContact,
      };

      // ⭐⭐⭐ ADD THIS ⭐⭐⭐
      if (editRecord && editRecord.id) {
        payload.id = editRecord.id;
      }

      // -------------------------------
      // 4️⃣ FOR VENDOR POPUP MODE
      // -------------------------------
      if (Reciviedrole) {
        handleFormDetails(payload);
        setModalVisible(false);
        form.resetFields();
        setPrimarySkills([]);
        setSecondarySkills([]);
        setPrimaryClouds([]);
        setSecondaryClouds([]);
        setEducationList([]);
        setExperienceList([]);
        return;
      }

      // -------------------------------
      // 5️⃣ SAVE TO BACKEND
      // -------------------------------
      const response = await profiledata(payload);

      if (response?.status === "success") {
        messageAPI.success(
          isEditMode
            ? "Profile updated successfully!"
            : "Profile created successfully!",
        );
      } else {
        messageAPI.error(
          isEditMode
            ? "Failed to update profile. Please try again."
            : "Failed to create profile. Please try again.",
        );
      }
    } catch (error) {
      console.error("Profile update error:", error);
      messageAPI.error("Failed to update profile. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    messageAPI.error("Please check enter all required Fields");
  };

  const renderSection = ({ key, title, children }) => (
    <Collapse
      defaultActiveKey={[key]}
      bordered={false}
      style={{ marginBottom: 24 }}
    >
      <Collapse.Panel
        key={key}
        header={<span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>}
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #f0f0f0",
        }}
      >
        {children}
      </Collapse.Panel>
    </Collapse>
  );

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#f5f6fa",
      }}
    >
      {contextHolder}
      <div
      // style={{
      //   flex: 1,
      //   overflowY: "auto",
      //   overflowX: "hidden",
      //   minHeight: 0,
      //   padding: "16px",
      // }}
      >
        <Card
          extra={
            Reciviedrole &&
            setModalVisible && (
              <span
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
                style={{
                  fontSize: 18,
                  cursor: "pointer",
                  color: "#555",
                }}
              >
                ✕
              </span>
            )
          }
        >
          <Title level={2} style={{ margin: "4px 0 8px" }}>
            Resume Extractor
          </Title>

          <Upload
            customRequest={handleUpload}
            showUploadList={false}
            accept=".pdf"
            maxCount={1}
          >
            <Button
              type="primary"
              icon={<UploadOutlined />}
              size="large"
              loading={loading}
            >
              Extract Details from Resume
            </Button>
          </Upload>

          <Card title="Candidate Information Form" style={{ marginTop: 20 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <div>
                <Collapse
                  defaultActiveKey={["personal-info"]}
                  bordered={false}
                  style={{ marginBottom: 24 }}
                >
                  <Collapse.Panel
                    key="personal-info"
                    header={
                      <span style={{ fontWeight: 600, fontSize: 16 }}>
                        Personal Information
                      </span>
                    }
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    <Row gutter={16} align="middle">
                      {/* ✅ FIXED PROFILE PICTURE - AVATAR STYLE */}
                      <Col span={24} sm={12} md={10}>
                        <Form.Item
                          label="Upload Profile Picture (JPG, PNG, JPEG - max 200KB)"
                          name="profilePicture"
                        >
                          <Upload
                            listType="picture-circle"
                            fileList={fileList}
                            maxCount={1}
                            accept=".jpg,.jpeg,.png"
                            showUploadList={{
                              showPreviewIcon: false,
                              showRemoveIcon: true,
                            }}
                            beforeUpload={(file) => {
                              const allowed = [
                                "image/jpeg",
                                "image/png",
                                "image/jpg",
                              ];
                              if (!allowed.includes(file.type)) {
                                message.error(
                                  "Only JPG, JPEG, PNG images are allowed!",
                                );
                                return Upload.LIST_IGNORE;
                              }
                              const maxSize = 200 * 1024; // 200 KB

                              if (file.size > maxSize) {
                                message.error(
                                  "Image must be smaller than 200KB!",
                                );
                                return Upload.LIST_IGNORE;
                              }

                              return false; // Prevent auto upload
                            }}
                            onChange={(info) => {
                              setFileList(info.fileList);
                              form.setFieldsValue({
                                profilePicture: info.fileList,
                              });
                            }}
                            onPreview={(file) => {
                              window.open(file.url || file.thumbUrl, "_blank");
                            }}
                          >
                            {fileList.length === 0 && (
                              <div>
                                <UserOutlined style={{ fontSize: 24 }} />
                                <div style={{ marginTop: 8 }}>Upload</div>
                              </div>
                            )}
                          </Upload>
                        </Form.Item>
                      </Col>

                      {Reciviedrole && (
                        <Col
                          xs={24}
                          sm={12}
                          md={14}
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            paddingTop: 32,
                          }}
                        ></Col>
                      )}

                      {/* Name, Phone, Email */}
                      <Col xs={24} sm={12} md={12}>
                        <Form.Item
                          label="Full Name"
                          name="name"
                          rules={[
                            {
                              required: true,
                              message: "Please enter full name",
                            },
                            {
                              pattern: /^[A-Za-z ]+$/,
                              message: "Only letters and spaces are allowed",
                            },
                          ]}
                        >
                          <Input placeholder="Enter full name" />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12} md={12}>
                        <Form.Item
                          label="Phone Number"
                          name="phoneNumber"
                          rules={[
                            {
                              validator: (_, value) => {
                                if (!value) return Promise.resolve();

                                if (!/^\d+$/.test(value)) {
                                  return Promise.reject(
                                    new Error("Only numbers are allowed"),
                                  );
                                }

                                if (
                                  value.length === 10 ||
                                  value.length === 12
                                ) {
                                  return Promise.resolve();
                                }

                                return Promise.reject(
                                  new Error(
                                    "Indian phone number must be 10 or 12 digits",
                                  ),
                                );
                              },
                            },
                          ]}
                        >
                          <Input
                            addonBefore={
                              <Select defaultValue="+91">
                                <Select.Option value="+91">
                                  🇮🇳 +91
                                </Select.Option>
                              </Select>
                            }
                            placeholder="Enter 10 or 12 digit Indian phone number"
                            maxLength={12}
                            onKeyPress={(e) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12} md={12}>
                        <Form.Item
                          label="Email"
                          name="email"
                          rules={[
                            { required: true, message: "Please enter email" },
                            { type: "email", message: "Enter valid email" },
                            {
                              validator: (_, value) => {
                                if (!value)
                                  return Promise.reject("Email is required");
                                if (!Reciviedrole) {
                                  const allowedDomains = [
                                    "gmail.com",
                                    "yahoo.com",
                                    "outlook.com",
                                    "hotmail.com",
                                    "protonmail.com",
                                    "icloud.com",
                                    "aol.com",
                                    "zoho.com",
                                    "yandex.com",
                                  ];

                                  const emailDomain = value
                                    .toLowerCase()
                                    .split("@")[1];
                                  if (allowedDomains.includes(emailDomain)) {
                                    return Promise.resolve();
                                  }

                                  return Promise.reject(
                                    "Please provide a personal ID.",
                                  );
                                }

                                const allowedDomains = [
                                  "gmail.com",
                                  "yahoo.com",
                                  "outlook.com",
                                  "hotmail.com",
                                  "protonmail.com",
                                  "icloud.com",
                                  "aol.com",
                                  "zoho.com",
                                  "yandex.com",
                                ];

                                const emailDomain = value
                                  .toLowerCase()
                                  .split("@")[1];
                                if (!allowedDomains.includes(emailDomain)) {
                                  return Promise.resolve();
                                }

                                return Promise.reject(
                                  "Please provide a work email ID.",
                                );
                              },
                            },
                          ]}
                        >
                          <Input placeholder="e.g., user@aakrin.com" />
                        </Form.Item>
                      </Col>

                      {/* Title / Role */}
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Title / Role (candidate is looking for)"
                          name="title"
                          rules={[
                            {
                              required: true,
                              message: "Please enter the candidate's role!",
                            },
                            {
                              pattern: /^[A-Za-z ]+$/,
                              message: "Only letters spaces are allowed!",
                            },
                          ]}
                        >
                          <ReusableSelect
                            placeholder="Select Role"
                            fetchFunction={GetRole}
                            addFunction={PostRole}
                            single={true}
                          />
                        </Form.Item>
                      </Col>

                      {/* Preferred & Current Location */}
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Preferred Job Location (Select up to 3)"
                          name="preferredLocation"
                          rules={[
                            {
                              required: true,
                              message: "Please select preferred job location!",
                            },
                            {
                              validator: (_, value) => {
                                if (!value) return Promise.resolve();

                                if (value.length > 3) {
                                  return Promise.reject(
                                    new Error(
                                      "You can select up to 3 locations only",
                                    ),
                                  );
                                }

                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <ReusableSelect
                            placeholder="Select locations"
                            fetchFunction={GetLocations}
                            addFunction={PostLocations}
                            single={false}
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Current Job Location"
                          name="currentLocation"
                        >
                          <ReusableSelect
                            single={true}
                            placeholder="Select Current Job Location"
                            fetchFunction={GetLocations}
                            addFunction={PostLocations}
                          />
                        </Form.Item>
                      </Col>

                      {/* Current/Expected CTC or Rate Card */}
                      {!Reciviedrole ? (
                        <>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Current Annual CTC"
                              name="currentCTC"
                              rules={[
                                {
                                  required: true,
                                  message: "Please enter current CTC!",
                                },
                                {
                                  validator: (_, value) => {
                                    if (!value) return Promise.resolve();

                                    if (!/^[0-9]+$/.test(value)) {
                                      return Promise.reject(
                                        new Error("Only numbers are allowed"),
                                      );
                                    }

                                    if (value.length > 10) {
                                      return Promise.reject(
                                        new Error("Maximum 10 digits allowed"),
                                      );
                                    }

                                    return Promise.resolve();
                                  },
                                },
                              ]}
                            >
                              <Input
                                placeholder="e.g., 800000"
                                maxLength={11}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Expected CTC"
                              name="expectedCTC"
                              rules={[
                                {
                                  required: true,
                                  message: "Please enter expected CTC!",
                                },
                                {
                                  validator: (_, value) => {
                                    if (!value) return Promise.resolve();

                                    if (!/^[0-9]+$/.test(value)) {
                                      return Promise.reject(
                                        new Error("Only numbers are allowed"),
                                      );
                                    }

                                    if (value.length > 10) {
                                      return Promise.reject(
                                        new Error("Maximum 10 digits allowed"),
                                      );
                                    }

                                    return Promise.resolve();
                                  },
                                },
                              ]}
                            >
                              <Input
                                placeholder="e.g., 1200000"
                                maxLength={11}
                              />
                            </Form.Item>
                          </Col>
                        </>
                      ) : (
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label="Rate Card Per Month"
                            name="rateCardPerHour"
                            rules={[
                              {
                                required: true,
                                message: "Enter rate card per hour",
                              },
                            ]}
                          >
                            <Input.Group compact>
                              <Form.Item
                                name={["rateCardPerHour", "value"]}
                                noStyle
                                rules={[
                                  {
                                    required: true,
                                    message: "Enter rate value",
                                  },
                                  {
                                    validator: (_, value) => {
                                      if (!value) return Promise.resolve();

                                      if (!/^\d+$/.test(value)) {
                                        return Promise.reject(
                                          new Error("Only numbers are allowed"),
                                        );
                                      }

                                      if (value.length > 10) {
                                        return Promise.reject(
                                          new Error(
                                            "Maximum 10 digits allowed",
                                          ),
                                        );
                                      }

                                      return Promise.resolve();
                                    },
                                  },
                                ]}
                              >
                                <Input
                                  style={{ width: "70%" }}
                                  placeholder="Enter rate per Month"
                                  maxLength={11}
                                />
                              </Form.Item>

                              <Form.Item
                                name={["rateCardPerHour", "currency"]}
                                noStyle
                                initialValue="INR"
                                rules={[
                                  {
                                    required: true,
                                    message: "Select currency",
                                  },
                                ]}
                              >
                                <Select style={{ width: "30%" }}>
                                  <Select.Option value="INR">INR</Select.Option>
                                  <Select.Option value="EURO">
                                    EURO
                                  </Select.Option>
                                  <Select.Option value="USD">USD</Select.Option>
                                </Select>
                              </Form.Item>
                            </Input.Group>
                          </Form.Item>
                        </Col>
                      )}

                      {/* Joining Period */}
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Joining Period"
                          name="joiningPeriod"
                          rules={[
                            {
                              message: "Please select joining period!",
                            },
                          ]}
                        >
                          <Select placeholder="Select joining period">
                            <Option value="Immediately">Immediately</Option>
                            <Option value="15 days">15 days</Option>
                            <Option value="1 month">1 month</Option>
                            <Option value="2 months">2 months</Option>
                            <Option value="3 months">3 months</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      {/* Total Experience */}
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Total Experience"
                          name="totalExperience"
                          validateTrigger={["onChange", "onBlur"]}
                          rules={[
                            {
                              required: true,
                              message: "Please enter total experience!",
                            },
                            {
                              validator: (_, value) => {
                                if (!value) return Promise.resolve();

                                if (/[^0-9.]/.test(value)) {
                                  return Promise.reject(
                                    new Error("Only numbers are allowed"),
                                  );
                                }

                                if ((value.match(/\./g) || []).length > 1) {
                                  return Promise.reject(
                                    new Error(
                                      "Only one decimal point is allowed",
                                    ),
                                  );
                                }

                                if (!/^\d+(\.\d{0,2})?$/.test(value)) {
                                  return Promise.reject(
                                    new Error(
                                      "Maximum 2 digits allowed after decimal",
                                    ),
                                  );
                                }

                                const [intPart] = value.split(".");
                                if (intPart.length > 2) {
                                  return Promise.reject(
                                    new Error(
                                      "Maximum 2 digits allowed before decimal",
                                    ),
                                  );
                                }

                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <Input placeholder="e.g., 45 or 45.4 years" />
                        </Form.Item>
                      </Col>

                      {/* Relevant Salesforce Experience */}
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Relevant Experience in Salesforce"
                          name="relevantSalesforceExperience"
                          validateTrigger={["onChange", "onBlur"]}
                          rules={[
                            {
                              required: true,
                              message: "Please enter total experience!",
                            },
                            {
                              validator: (_, value) => {
                                if (!value) return Promise.resolve();

                                if (/[^0-9.]/.test(value)) {
                                  return Promise.reject(
                                    new Error("Only numbers are allowed"),
                                  );
                                }

                                if ((value.match(/\./g) || []).length > 1) {
                                  return Promise.reject(
                                    new Error(
                                      "Only one decimal point is allowed",
                                    ),
                                  );
                                }

                                if (!/^\d+(\.\d{0,2})?$/.test(value)) {
                                  return Promise.reject(
                                    new Error(
                                      "Maximum 2 digits allowed after decimal",
                                    ),
                                  );
                                }

                                const [intPart] = value.split(".");
                                if (intPart.length > 2) {
                                  return Promise.reject(
                                    new Error(
                                      "Maximum 2 digits allowed before decimal",
                                    ),
                                  );
                                }

                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <Input placeholder="e.g., 45 or 45.4 years" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Col span={24}>
                      <Form.Item
                        label="Professional Summary"
                        preserve={true}
                        name="summary"
                        rules={[
                          {
                            required: true,
                            message: "Professional summary is required",
                          },

                          {
                            pattern: /^[A-Za-z0-9 ,.\-(){}&\/'"\n\r]+$/,
                            message:
                              "Only letters, numbers, spaces and , . - ( ) { } & / ' \" are allowed",
                          },
                        ]}
                      >
                        <Input.TextArea
                          rows={4}
                          showCount
                          maxLength={600}
                          placeholder="Salesforce-focused professional summary (minimum 100 characters)"
                        />
                      </Form.Item>
                    </Col>

                    {/* Portfolio, LinkedIn, Trailhead */}
                    <Row gutter={16}>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          label="Portfolio Link"
                          name="portfolioLink"
                          rules={[
                            {
                              pattern:
                                /^https:\/\/([a-zA-Z0-9-]+)\.(dev|me|io|site|portfolio|com)(\/(portfolio|projects|work|about)\/?)?$/,
                              message: "Enter a valid portfolio link ",
                            },
                          ]}
                        >
                          <Input placeholder="https://yourportfolio.com (optional)" />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={8}>
                        {!isCandidate ? (
                          <Form.Item
                            label="LinkedIn URL"
                            name="linkedInUrl"
                            rules={[
                              {
                                required: true,
                                message: "LinkedIn URL is required",
                              },
                              {
                                pattern:
                                  /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9._-]+\/?$/i,
                                message:
                                  "Please enter a valid LinkedIn profile URL",
                              },
                            ]}
                          >
                            <Input placeholder="https://www.linkedin.com/in/yourprofile" />
                          </Form.Item>
                        ) : (
                          <Form.Item
                            label="LinkedIn URL"
                            name="linkedInUrl"
                            rules={[
                              {
                                pattern:
                                  /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9._-]+\/?$/i,
                                message:
                                  "Please enter a valid LinkedIn profile URL",
                              },
                            ]}
                          >
                            <Input placeholder="https://www.linkedin.com/in/yourprofile" />
                          </Form.Item>
                        )}
                      </Col>

                      <Col xs={24} sm={8}>
                        {!isCandidate ? (
                          <Form.Item
                            label="Trailhead URL"
                            name="trailheadUrl"
                            rules={[
                              {
                                required: true,
                                message: "Trailhead URL is required",
                              },
                              {
                                pattern:
                                  /^https:\/\/(www\.)?salesforce\.com\/trailblazer\/[A-Za-z0-9._-]+\/?$/,
                                message: "Please enter a valid Trailhead URL",
                              },
                            ]}
                          >
                            <Input placeholder="https://www.salesforce.com/trailblazer/yourprofile" />
                          </Form.Item>
                        ) : (
                          <Form.Item
                            label="Trailhead URL"
                            name="trailheadUrl"
                            rules={[
                              {
                                pattern:
                                  /^https:\/\/(www\.)?salesforce\.com\/trailblazer\/[A-Za-z0-9._-]+\/?$/,
                                message: "Please enter a valid Trailhead URL",
                              },
                            ]}
                          >
                            <Input placeholder="https://www.salesforce.com/trailblazer/yourprofile" />
                          </Form.Item>
                        )}
                      </Col>
                    </Row>
                  </Collapse.Panel>
                </Collapse>
              </div>

              <Divider />

              <div>
                {renderSection({
                  key: "skills",
                  title: "Skills",
                  children: (
                    <Collapse
                      style={{ border: "none" }}
                      defaultActiveKey={["primary", "secondary"]}
                      bordered={false}
                    >
                      <Form.Item shouldUpdate noStyle>
                        {() => {
                          const error =
                            form.getFieldError("primarySkills").length > 0;

                          return (
                            <Form.Item
                              name="primarySkills"
                              validateStatus={error ? "error" : ""}
                              help={
                                error
                                  ? "Please add at least one primary skill"
                                  : ""
                              }
                              rules={[
                                {
                                  validator: (_, value) => {
                                    if (!value || value.length === 0) {
                                      return Promise.reject(
                                        new Error(
                                          "Please add at least one primary skill",
                                        ),
                                      );
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                            >
                              <SkillManagerCard
                                title="Primary Skills"
                                required
                                skills={primarySkills}
                                onSkillsChange={handlePrimarySkillsChange}
                                fetchFunction={GetSkills}
                                addFunction={PostSkills}
                                hasError={error}
                              />
                            </Form.Item>
                          );
                        }}
                      </Form.Item>

                      <Form.Item
                        name="secondarySkills"
                        style={{ marginTop: 24 }}
                      >
                        <SkillManagerCard
                          title="Secondary Skills"
                          skills={secondarySkills}
                          onSkillsChange={handleSecondarySkillsChange}
                          fetchFunction={GetSkills}
                          addFunction={PostSkills}
                        />
                      </Form.Item>
                    </Collapse>
                  ),
                })}
              </div>

              <Divider />

              {renderSection({
                key: "clouds",
                title: "Clouds",
                children: (
                  <Collapse
                    defaultActiveKey={["primary-clouds", "secondary-clouds"]}
                    bordered={false}
                  >
                    <Form.Item
                      name="primaryClouds"
                      rules={[
                        { required: true },
                        {
                          validator: (_, value) => {
                            if (!value || value.length === 0) {
                              return Promise.reject(
                                "Please add at least one primary cloud!",
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <SkillManagerCard
                        title="Primary Clouds"
                        required
                        skills={primaryClouds}
                        onSkillsChange={handlePrimaryCloudsChange}
                        fetchFunction={GetClouds}
                        addFunction={PostClouds}
                      />
                    </Form.Item>

                    <Form.Item name="secondaryClouds">
                      <SkillManagerCard
                        title="Secondary Clouds"
                        skills={secondaryClouds}
                        onSkillsChange={handleSecondaryCloudsChange}
                        fetchFunction={GetClouds}
                        addFunction={PostClouds}
                      />
                    </Form.Item>
                  </Collapse>
                ),
              })}

              <Divider />

              <div>
                {renderSection({
                  key: "education",
                  title: "Education",
                  children: (
                    <Form.Item
                      label="Education Details"
                      name="education"
                      rules={[
                        {
                          required: true,
                          message: "Please enter Education Details!",
                        },
                      ]}
                    >
                      <EducationCard
                        apidata={educationList}
                        onEducationChange={handleEducationChange}
                      />
                    </Form.Item>
                  ),
                })}
              </div>
              <Divider />

              <div>
                {renderSection({
                  key: "certifications",
                  title: "Certifications",
                  children: (
                    <Form.Item
                      label="Certifications"
                      name="certifications"
                      rules={[
                        {
                          required: true,
                          message: "Please enter certifications!",
                        },
                      ]}
                    >
                      <ReusableSelect
                        placeholder="Select or add certifications"
                        fetchFunction={GetCertifications}
                        addFunction={PostCertifications}
                        single={false}
                        style={{ width: "100%" }}
                        dropdownStyle={{ zIndex: 1050 }}
                        popupClassName="cert-popup"
                        tagRender={({ label, closable, onClose }) => (
                          <div
                            style={{
                              background: "#E2EEFF",
                              border: "0.5px solid #1677FF",
                              borderRadius: 100,
                              padding: "6px 12px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: 14,
                              fontWeight: 500,
                              color: "#111",
                              cursor: "default",
                              margin: "4px",
                              maxWidth: "100%",
                              boxSizing: "border-box",
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <span style={{ whiteSpace: "nowrap" }}>
                              {label}
                            </span>

                            {closable && (
                              <span
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onClose();
                                }}
                                style={{
                                  cursor: "pointer",
                                  fontSize: 12,
                                  color: "#666",
                                  lineHeight: 1,
                                }}
                              >
                                ×
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </Form.Item>
                  ),
                })}
              </div>
              <Divider />

              <div>
                {renderSection({
                  key: "work-experience",
                  title: "Work Experience",
                  children: (
                    <Form.Item
                      label="Work Experience"
                      name="workExperience"
                      rules={[
                        {
                          required: true,
                          message: "Please enter work experience!",
                        },
                      ]}
                    >
                      <ExperienceCard
                        apidata={experienceList}
                        onExperienceChange={handleExperienceChange}
                      />
                    </Form.Item>
                  ),
                })}
              </div>

              <Form.Item style={{ marginTop: 24 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                  }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    style={{ width: "150px" }}
                    loading={submitLoading}
                  >
                    {isEditMode ? "Update" : "Submit"}
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </Card>
      </div>
    </div>
  );
};

export default UpdateUserProfile;
