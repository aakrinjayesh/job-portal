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
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
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
  PostClouds,
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

  const [showContact, setShowContact] = useState(false);

  console.log("Recivied Role", Reciviedrole);
  console.log("edit", editRecord);

  // State for skills with experience (stored as objects)
  const [primarySkills, setPrimarySkills] = useState([]);
  const [secondarySkills, setSecondarySkills] = useState([]);
  const [primaryClouds, setPrimaryClouds] = useState([]);
  const [secondaryClouds, setSecondaryClouds] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);

  const role = localStorage.getItem("role");

  useEffect(() => {
    if (editRecord && Reciviedrole) {
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
        typeof c === "string" ? { name: c, experience: 0 } : c
      );
      const secClouds = (editRecord?.secondaryClouds || []).map((c) =>
        typeof c === "string" ? { name: c, experience: 0 } : c
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
      });
    } else {
      console.log("edit false");
    }
    return () => {
      form.resetFields();
      // if (setEditRecord) {
      //   setEditRecord(null);
      // }
    };
  }, [editRecord]);

  const getInitialData = async () => {
    try {
      const res = await GetUserProfile();
      if (res?.success === "true" && res?.user) {
        const user = res?.user;

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
          typeof cloud === "string" ? { name: cloud, experience: 0 } : cloud
        );
        const secClouds = (user.secondaryClouds || []).map((cloud) =>
          typeof cloud === "string" ? { name: cloud, experience: 0 } : cloud
        );

        setPrimaryClouds(primClouds);
        setSecondaryClouds(secClouds);
        setEducationList(user?.education || []);
        setExperienceList(user?.workExperience || []);

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
          typeof cloud === "string" ? { name: cloud, experience: 0 } : cloud
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
          typeof cloud === "string" ? { name: cloud, experience: 0 } : cloud
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

      // Compose skillsJson from state (not form values)
      const skillsJson = [
        ...primarySkills.map((s) => ({
          name: s?.name,
          experience: Number(s?.experience ?? 0),
          level: "primary",
        })),
        ...secondarySkills.map((s) => ({
          name: s.name,
          experience: Number(s?.experience ?? 0),
          level: "secondary",
        })),
      ];

      const payload = {
        name: values?.name,
        phoneNumber: values?.phoneNumber,
        email: values?.email,
        portfolioLink: values?.portfolioLink,
        profilePicture: values?.profilePicture || null,
        title: values?.title || null,
        currentCTC: values?.currentCTC || null,
        expectedCTC: values?.expectedCTC || null,
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
        primaryClouds: primaryClouds,
        secondaryClouds: secondaryClouds,
        certifications: values?.certifications || [],
        // workExperience: values?.workExperience || [],
        workExperience: experienceList,
        education: educationList,
        rateCardPerHour: values.rateCardPerHour || {},
      };
      if (Reciviedrole) {
        handleFormDetails(payload);
        setModalVisible(false);
        form.resetFields(); // ✅ clears all fields
        setPrimarySkills([]);
        setSecondarySkills([]);
        setPrimaryClouds([]);
        setSecondaryClouds([]);
        setEducationList([]);
        setExperienceList([]);
        return;
      }
      console.log("Submitting payload of user form:", payload);
      const response = await profiledata(payload);
      if (response?.status === "success") {
        messageAPI.success("Profile updated successfully!");
      } else {
        messageAPI.error("Failed to update profile. Please try again.");
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

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      {contextHolder}
      <Title level={2}>Resume Extractor</Title>
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
          <Row gutter={16}>
            {/* Profile Picture */}
            <Col span={24}>
              <Form.Item label="Upload Profile Picture" name="profilePicture">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={(info) => {
                    form.setFieldsValue({ profilePicture: info.file });
                  }}
                >
                  <div>
                    <UserOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>

            {/* Name, Phone, Email */}
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: "Please enter full name" }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item>
                <Checkbox
                  checked={showContact}
                  onChange={(e) => setShowContact(e.target.checked)}
                >
                  Show Contact Details
                </Checkbox>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={12}>
              {/* Conditional Phone Number Input */}
              {/* {showPhone && (
    <Form.Item
      label="Phone Number"
      name="phoneNumber"
      rules={[
        {
          required: true,
          message: "Please enter phone number",
        },
        {
          pattern: /^\+\d{1,3}\s\d{7,14}$/,
          message: "Format: +91 9876543210",
        },
      ]}
    >
      <Input placeholder="+91 9876543210" />
    </Form.Item>
  )} */}

              {showContact && (
                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    label="Phone Number"
                    name="phoneNumber"
                    rules={[
                      { required: true, message: "Please enter phone number" },
                      {
                        pattern: /^\+\d{1,3}\s\d{7,14}$/,
                        message: "Format: +91 9876543210",
                      },
                    ]}
                  >
                    <Input placeholder="+91 9876543210" />
                  </Form.Item>
                </Col>
              )}
            </Col>

            <Col xs={24} sm={12} md={12}>
              {/* Email field is shown ONLY when showEmail = true */}
              {/* {showEmail && (
    <Form.Item
      label="Email"
      name="email"
      rules={[
        {
          required: true,
          message: "Please enter email",
        },
        {
          type: "email",
          message: "Please enter a valid email address",
        },
        {
          validator: (_, value) => {
            if (!value) {
              return Promise.reject("Email is required");
            }
            const domain = "@aakrin.com";
            if (value.toLowerCase().endsWith(domain)) {
              return Promise.resolve();
            }
            return Promise.reject(
              `Only company emails ending with ${domain} are allowed`
            );
          },
        },
      ]}
    >
      <Input placeholder="e.g., hari.babu@aakrin.com" />
    </Form.Item>
  )} */}
              {showContact && (
                <Col xs={24} sm={12} md={12}>
                  {/* <Form.Item
      label="Email"
      name="email"
      rules={[
        { required: true, message: "Please enter email" },
        { type: "email", message: "Enter valid email" },
        {
          validator: (_, value) => {
            if (!value) return Promise.reject("Email is required");
            const domain = "@aakrin.com";
            return value.toLowerCase().endsWith(domain)
              ? Promise.resolve()
              : Promise.reject(
                  `Only company emails ending with ${domain} are allowed`
                );
          },
        },
      ]}
    >
      <Input placeholder="e.g., hari.babu@aakrin.com" />
    </Form.Item> */}
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

                          const allowedDomains = [
                            "aakrin.com",
                            "yahoo.com",
                            "outlook.com",
                            "hotmail.com",
                            "protonmail.com",
                            "icloud.com",
                            "aol.com",
                            "zoho.com",
                            "yandex.com",
                            "tcs.com",
                            "accenture.com",
                          ];

                          const emailDomain = value.toLowerCase().split("@")[1];

                          if (allowedDomains.includes(emailDomain)) {
                            return Promise.resolve();
                          }

                          return Promise.reject(
                            `Email domain not allowed. Allowed: ${allowedDomains.join(
                              ", "
                            )}`
                          );
                        },
                      },
                    ]}
                  >
                    <Input placeholder="e.g., user@aakrin.com" />
                  </Form.Item>
                </Col>
              )}
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
                ]}
              >
                <Input placeholder="e.g., Salesforce Developer" />
              </Form.Item>
            </Col>

            {/* Preferred & Current Location */}
            <Col xs={24} sm={12}>
              <Form.Item
                label="Preferred Location (Select up to 3)"
                name="preferredLocation"
                rules={[
                  {
                    required: true,
                    message: "Please select preferred location!",
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
              <Form.Item label="Current Job Location" name="currentLocation">
                <ReusableSelect
                  single={true}
                  placeholder="Select Current Job Location"
                  fetchFunction={GetLocations}
                  addFunction={PostLocations}
                />
              </Form.Item>
            </Col>

            {/* Preferred Job Type */}
            {/* <Col xs={24} sm={12}>
              <Form.Item
                label="Preferred Job Type (Max 2)"
                name="preferredJobType"
                rules={[{ required: true, message: "Please select job type!" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select job types"
                  maxTagCount={2}
                  style={{ width: "100%" }}
                >
                  <Option value="FullTime">Full Time</Option>
                  <Option value="Contract">Contract</Option>
                  <Option value="Freelance">Freelance</Option>
                </Select>
              </Form.Item>
            </Col> */}

            {/* Current/Expected CTC or Rate Card */}
            {!Reciviedrole ? (
              <>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Current CTC"
                    name="currentCTC"
                    rules={[
                      { required: true, message: "Please enter current CTC!" },
                    ]}
                  >
                    <Input placeholder="e.g., ₹8 LPA" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Expected CTC"
                    name="expectedCTC"
                    rules={[
                      { required: true, message: "Please enter expected CTC!" },
                    ]}
                  >
                    <Input placeholder="e.g., ₹12 LPA" />
                  </Form.Item>
                </Col>
              </>
            ) : (
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Rate Card Per Month"
                  name="rateCardPerHour"
                  rules={[
                    { required: true, message: "Enter rate card per hour" },
                  ]}
                >
                  <Input.Group compact>
                    <Form.Item
                      name={["rateCardPerHour", "value"]}
                      noStyle
                      rules={[{ required: true, message: "Enter rate value" }]}
                    >
                      <InputNumber
                        style={{ width: "70%" }}
                        placeholder="Enter rate per Month"
                      />
                    </Form.Item>

                    <Form.Item
                      name={["rateCardPerHour", "currency"]}
                      noStyle
                      initialValue="INR"
                      rules={[{ required: true, message: "Select currency" }]}
                    >
                      <Select style={{ width: "30%" }}>
                        <Select.Option value="INR">INR</Select.Option>
                        <Select.Option value="EURO">EURO</Select.Option>
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
                  { required: true, message: "Please select joining period!" },
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
                rules={[
                  { required: true, message: "Please enter total experience!" },
                ]}
              >
                <Input type="number" placeholder="e.g., 6 years" />
              </Form.Item>
            </Col>

            {/* Relevant Salesforce Experience */}
            <Col xs={24} sm={12}>
              <Form.Item
                label="Relevant Experience in Salesforce"
                name="relevantSalesforceExperience"
                rules={[
                  {
                    required: true,
                    message: "Please enter Salesforce experience!",
                  },
                ]}
              >
                <Input type="number" placeholder="e.g., 4 years" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Skills */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="primarySkills" noStyle>
                <SkillManagerCard
                  title="Primary Skills"
                  skills={primarySkills}
                  onSkillsChange={handlePrimarySkillsChange}
                  fetchFunction={GetSkills}
                  addFunction={PostSkills}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="secondarySkills" noStyle>
                <SkillManagerCard
                  title="Secondary Skills"
                  skills={secondarySkills}
                  onSkillsChange={handleSecondarySkillsChange}
                  fetchFunction={GetSkills}
                  addFunction={PostSkills}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Clouds */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="primaryClouds" noStyle>
                <SkillManagerCard
                  title="Primary Clouds"
                  skills={primaryClouds}
                  onSkillsChange={handlePrimaryCloudsChange}
                  fetchFunction={GetClouds}
                  addFunction={PostClouds}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="secondaryClouds" noStyle>
                <SkillManagerCard
                  title="Secondary Clouds"
                  skills={secondaryClouds}
                  onSkillsChange={handleSecondaryCloudsChange}
                  fetchFunction={GetClouds}
                  addFunction={PostClouds}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Education */}
          <Row>
            <Col span={24}>
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
            </Col>
          </Row>

          {/* Certifications */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Certifications"
                name="certifications"
                rules={[
                  { required: true, message: "Please enter certifications!" },
                ]}
              >
                <ReusableSelect
                  placeholder="Select or add certifications"
                  fetchFunction={GetCertifications}
                  addFunction={PostCertifications}
                  single={false}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Work Experience */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Work Experience"
                name="workExperience"
                rules={[
                  { required: true, message: "Please enter work experience!" },
                ]}
              >
                <ExperienceCard
                  apidata={experienceList}
                  onExperienceChange={handleExperienceChange}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Portfolio, LinkedIn, Trailhead */}
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="Portfolio Link" name="portfolioLink">
                <Input placeholder="https://yourportfolio.com (optional)" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="LinkedIn URL"
                name="linkedInUrl"
                rules={[
                  { required: true, message: "Please enter LinkedIn URL!" },
                  {
                    pattern:
                      /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/,
                    message:
                      "Please enter a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/yourprofile)",
                  },
                ]}
              >
                <Input placeholder="https://www.linkedin.com/in/yourprofile" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Trailhead URL"
                name="trailheadUrl"
                rules={[
                  { required: true, message: "Please enter Trailhead URL!" },
                  {
                    pattern:
                      /^https:\/\/(www\.)?trailblazer\.me\/id\/[A-Za-z0-9_-]+\/?$/,
                    message:
                      "Please enter a valid Trailhead URL (e.g. https://trailblazer.me/id/yourprofile)",
                  },
                ]}
              >
                <Input placeholder="https://trailblazer.me/id/yourprofile" />
              </Form.Item>
            </Col>
          </Row>

          {/* Submit + Generate Resume */}
          <Form.Item style={{ marginTop: 24 }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{ flex: 1 }}
                loading={submitLoading}
              >
                Submit
              </Button>
              <GenerateResume form={form} />
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateUserProfile;
