import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Upload,
  Divider,
  Row,
  Col,
  message,
  Spin,
  Card,
  Typography,
  Tag,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  CloseOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  BuildOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  LinkOutlined,
} from "@ant-design/icons";

import {
  GetUserProfileDetails,
  UpdateCompanyProfile,
} from "../../company/api/api";
import { uploadProfilePicture } from "../../candidate/api/api";

const { Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ─── reusable tag input ───────────────────────────────────────────────────────
const TagInput = ({ value = [], onChange, placeholder }) => {
  const [inputVal, setInputVal] = useState("");

  const add = () => {
    const v = inputVal.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setInputVal("");
  };

  return (
    <div>
      {value.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 10,
          }}
        >
          {value.map((tag) => (
            <span
              key={tag}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "2px 10px",
                background: "#f0f5ff",
                border: "1px solid #adc6ff",
                borderRadius: 4,
                fontSize: 13,
                color: "#2f54eb",
              }}
            >
              {tag}
              <CloseOutlined
                style={{ fontSize: 10, cursor: "pointer", color: "#888" }}
                onClick={() => onChange(value.filter((t) => t !== tag))}
              />
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onPressEnter={(e) => {
            e.preventDefault();
            add();
          }}
          placeholder={placeholder || "Type and press Enter or click Add"}
          style={{ flex: 1 }}
        />
        <Button icon={<PlusOutlined />} onClick={add}>
          Add
        </Button>
      </div>
    </div>
  );
};

// ─── live preview card ────────────────────────────────────────────────────────
const CompanyPreview = ({ data }) => (
  <div style={{ position: "sticky", top: 0 }}>
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        color: "#9CA3AF",
        textAlign: "center",
        marginBottom: 8,
        textTransform: "uppercase",
      }}
    >
      Profile Preview
    </div>

    {/* Hero card */}
    <Card
      style={{ overflow: "hidden", borderRadius: 12, marginBottom: 8 }}
      styles={{ body: { padding: 0 } }}
    >
      {/* Cover */}
      <div
        style={{
          height: 90,
          background: data.coverImage
            ? `url(${data.coverImage}) center/cover no-repeat`
            : "linear-gradient(135deg, #e6f4ff 0%, #bae0ff 60%, #91caff 100%)",
        }}
      />

      {/* Logo + info row */}
      <div style={{ padding: "0 16px 14px", position: "relative" }}>
        {/* Logo */}
        <div
          style={{
            position: "absolute",
            top: -24,
            width: 48,
            height: 48,
            borderRadius: 8,
            border: "3px solid #fff",
            background: data.logoUrl
              ? `url(${data.logoUrl}) center/cover no-repeat`
              : "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {!data.logoUrl && (
            <BuildOutlined style={{ fontSize: 18, color: "#d9d9d9" }} />
          )}
        </div>

        {/* Visit website button — top right */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: 6,
            marginBottom: 4,
          }}
        >
          {data.website && (
            <Button
              size="small"
              icon={<LinkOutlined />}
              style={{ borderRadius: 999, fontSize: 11, height: 24 }}
            >
              Visit website
            </Button>
          )}
        </div>

        {/* Name + tagline + meta */}
        <div style={{ paddingTop: 6 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#111827",
              lineHeight: 1.3,
            }}
          >
            {data.companyName || (
              <span style={{ color: "#d9d9d9" }}>Company Name</span>
            )}
          </div>
          {data.tagline && (
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>
              {data.tagline}
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 8,
              alignItems: "center",
            }}
          >
            {data.industry && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                <BuildOutlined style={{ marginRight: 3 }} />
                {data.industry}
              </Text>
            )}
            {data.headquarters && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                <EnvironmentOutlined style={{ marginRight: 3 }} />
                {data.headquarters}
              </Text>
            )}
            {data.companySize && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                <TeamOutlined style={{ marginRight: 3 }} />
                {data.companySize} employees
              </Text>
            )}
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div style={{ borderTop: "1px solid #f0f0f0", padding: "0 16px" }}>
        <div style={{ display: "flex", gap: 16 }}>
          {["About", "People", "Jobs", "Bench"].map((t, i) => (
            <div
              key={t}
              style={{
                padding: "8px 0",
                fontSize: 12,
                fontWeight: i === 0 ? 600 : 400,
                color: i === 0 ? "#1677ff" : "#6B7280",
                borderBottom:
                  i === 0 ? "2px solid #1677ff" : "2px solid transparent",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    </Card>

    {/* About tab content */}
    {data.description && (
      <Card
        size="small"
        title={<span style={{ fontSize: 13 }}>Overview</span>}
        style={{ marginBottom: 8, borderRadius: 8 }}
        styles={{ body: { padding: "10px 14px" } }}
      >
        <Paragraph
          style={{
            margin: 0,
            fontSize: 12,
            color: "#374151",
            lineHeight: 1.65,
          }}
          ellipsis={{ rows: 4, expandable: false }}
        >
          {data.description}
        </Paragraph>
      </Card>
    )}

    {data.specialties?.length > 0 && (
      <Card
        size="small"
        title={<span style={{ fontSize: 13 }}>Specialties</span>}
        style={{ marginBottom: 8, borderRadius: 8 }}
        styles={{ body: { padding: "10px 14px" } }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {data.specialties.map((s) => (
            <Tag key={s} color="blue" style={{ fontSize: 11, margin: 0 }}>
              {s}
            </Tag>
          ))}
        </div>
      </Card>
    )}

    {data.locations?.length > 0 && (
      <Card
        size="small"
        title={<span style={{ fontSize: 13 }}>Locations</span>}
        style={{ borderRadius: 8 }}
        styles={{ body: { padding: "10px 14px" } }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {data.locations.map((l) => (
            <Tag
              key={l}
              icon={<EnvironmentOutlined />}
              style={{ fontSize: 11, margin: 0 }}
            >
              {l}
            </Tag>
          ))}
        </div>
      </Card>
    )}
  </div>
);

// ─── main component ───────────────────────────────────────────────────────────
/**
 * CompanyProfile
 *
 * Props (optional):
 *   onSaveSuccess?: () => void   — called after a successful save
 *   compact?: boolean            — when true, removes outer padding (e.g. inside a modal)
 */
const CompanyProfile = ({ onSaveSuccess, compact = false }) => {
  const [form] = Form.useForm();
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  const [logoUrl, setLogoUrl] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState(null);

  // cached personal fields needed to re-send with update
  const [cachedPersonal, setCachedPersonal] = useState({});

  const [specialties, setSpecialties] = useState([]);
  const [locations, setLocations] = useState([]);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // live form values for preview
  const [formValues, setFormValues] = useState({});

  const [messageApi, contextHolder] = message.useMessage();

  // derived preview data
  const previewData = {
    companyName: formValues.companyName || "",
    tagline: formValues.tagline || "",
    description: formValues.description || "",
    website: formValues.website || "",
    industry: formValues.industry || "",
    companySize: formValues.companySize || "",
    headquarters: formValues.headquarters || "",
    logoUrl,
    coverImage: coverImageUrl,
    specialties,
    locations,
  };

  // ── load profile data ──
  useEffect(() => {
    (async () => {
      try {
        const res = await GetUserProfileDetails();
        if (res?.status === "success" && res.data) {
          const {
            firstName,
            lastName,
            phoneNumber,
            companyName,
            profileUrl,
            address,
            companyProfile,
          } = res.data;

          // cache personal fields so we can include them in the update payload
          setCachedPersonal({
            name: `${firstName} ${lastName}`.trim(),
            phoneNumber,
            profileUrl,
          });

          if (companyProfile) {
            setLogoUrl(companyProfile.logoUrl || null);
            setCoverImageUrl(companyProfile.coverImage || null);
            setSpecialties(companyProfile.specialties || []);
            setLocations(companyProfile.locations || []);
          }

          const fields = {
            companyName,
            // address
            doorNumber: address?.doorNumber || "",
            street: address?.street || "",
            city: address?.city || "",
            state: address?.state || "",
            country: address?.country || "",
            pinCode: address?.pinCode || "",
            tagline: companyProfile?.tagline || "",
            description: companyProfile?.description || "",
            website: companyProfile?.website || "",
            industry: companyProfile?.industry || undefined,
            companySize: companyProfile?.companySize || undefined,
            foundedYear: companyProfile?.foundedYear || undefined,
            headquarters: companyProfile?.headquarters || "",
            linkedin: companyProfile?.socialLinks?.linkedin || "",
            twitter: companyProfile?.socialLinks?.twitter || "",
            instagram: companyProfile?.socialLinks?.instagram || "",
          };

          form.setFieldsValue(fields);
          setFormValues(fields);
        }
      } catch {
        messageApi.error("Failed to load company profile");
      } finally {
        setPageLoading(false);
      }
    })();
  }, []);

  // ── upload helper ──
  const handleUpload = async (file, type) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      messageApi.error("Only JPG / PNG allowed");
      return false;
    }
    if (file.size > 2 * 1024 * 1024) {
      messageApi.error("Max file size is 2 MB");
      return false;
    }

    const setU = type === "logo" ? setUploadingLogo : setUploadingCover;
    try {
      setU(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadProfilePicture(fd);
      if (res?.url) {
        if (type === "logo") setLogoUrl(res.url);
        if (type === "cover") setCoverImageUrl(res.url);
        setIsDirty(true);
        messageApi.success("Uploaded successfully");
      } else {
        messageApi.error("Upload failed");
      }
    } catch {
      messageApi.error("Upload error");
    } finally {
      setU(false);
    }
    return false;
  };

  // ── save ──
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (locations.length === 0) {
        messageApi.warning("Please add at least one office location");
        return;
      }

      setSaving(true);

      const payload = {
        // include cached personal fields so backend doesn't wipe them
        ...cachedPersonal,
        companyName: values.companyName,
        address: {
          doorNumber: values.doorNumber,
          street: values.street,
          city: values.city,
          state: values.state,
          country: values.country,
          pinCode: values.pinCode,
        },
        tagline: values.tagline,
        description: values.description,
        website: values.website,
        industry: values.industry,
        companySize: values.companySize,
        foundedYear: values.foundedYear,
        headquarters: values.headquarters,
        locations,
        specialties,
        logoUrl,
        coverImage: coverImageUrl,
        socialLinks: {
          linkedin: values.linkedin || null,
          twitter: values.twitter || null,
          instagram: values.instagram || null,
        },
      };

      const res = await UpdateCompanyProfile(payload);
      if (res?.status === "success") {
        setIsDirty(false);
        messageApi.success("Company profile updated successfully");
        onSaveSuccess?.();
      } else {
        messageApi.error("Update failed");
      }
    } catch (e) {
      if (e?.errorFields)
        messageApi.warning("Please fix the highlighted fields");
      else messageApi.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ── render ──
  if (pageLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: compact ? "30vh" : "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const wrapperStyle = compact
    ? { padding: "8px 0" }
    : {
        maxWidth: showPreview ? 1200 : 860,
        margin: "0 auto",
        padding: "32px 20px",
      };

  const formSection = (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={(_, all) => { setFormValues(all); setIsDirty(true); }}
    >
      {/* ════════ 1. BRAND ASSETS ════════ */}
      <Card title="Brand Assets" style={{ marginBottom: 20 }}>
        <Form.Item label="Cover Image" extra="Recommended size: 1128 × 191 px">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {coverImageUrl && (
              <img
                src={coverImageUrl}
                alt="cover"
                style={{
                  width: 220,
                  height: 62,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #d9d9d9",
                }}
              />
            )}
            <Upload
              beforeUpload={(f) => handleUpload(f, "cover")}
              showUploadList={false}
              accept="image/jpeg,image/png,image/jpg"
            >
              <Button icon={<UploadOutlined />} loading={uploadingCover}>
                {coverImageUrl ? "Change Cover" : "Upload Cover"}
              </Button>
            </Upload>
          </div>
        </Form.Item>

        <Form.Item
          label="Company Logo"
          extra="Square image · PNG preferred · min 200 × 200 px"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="logo"
                style={{
                  width: 64,
                  height: 64,
                  objectFit: "contain",
                  borderRadius: 6,
                  border: "1px solid #d9d9d9",
                }}
              />
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 6,
                  border: "1px dashed #d9d9d9",
                  background: "#fafafa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UploadOutlined style={{ fontSize: 20, color: "#bbb" }} />
              </div>
            )}
            <Upload
              beforeUpload={(f) => handleUpload(f, "logo")}
              showUploadList={false}
              accept="image/jpeg,image/png,image/jpg"
            >
              <Button icon={<UploadOutlined />} loading={uploadingLogo}>
                {logoUrl ? "Change Logo" : "Upload Logo"}
              </Button>
            </Upload>
          </div>
        </Form.Item>
      </Card>

      {/* ════════ 2. COMPANY ADDRESS ════════ */}
      <Card title="Company Address" style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Door / Flat No." name="doorNumber">
              <Input placeholder="12A" />
            </Form.Item>
          </Col>
          <Col span={18}>
            <Form.Item label="Street" name="street">
              <Input placeholder="Tech Park Road" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="City" name="city">
              <Input placeholder="Bangalore" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="State" name="state">
              <Input placeholder="Karnataka" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Pin Code" name="pinCode">
              <Input placeholder="560037" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Country" name="country">
              <Input placeholder="India" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ════════ 3. COMPANY OVERVIEW ════════ */}
      <Card title="Company Overview" style={{ marginBottom: 20 }}>
        <Form.Item
          label="Company Name"
          name="companyName"
          rules={[{ required: true, message: "Company name is required" }]}
        >
          <Input placeholder="ForceHead" />
        </Form.Item>

        <Form.Item label="Tagline" name="tagline">
          <Input placeholder="AI Hiring Platform" maxLength={120} showCount />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea
            placeholder="Describe your company, mission, and culture…"
            rows={4}
            maxLength={2000}
            showCount
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Website"
              name="website"
              rules={[
                { required: true, message: "Website is required" },
                {
                  type: "url",
                  message: "Please enter a valid URL (include https://)",
                },
              ]}
            >
              <Input placeholder="https://forcehead.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Headquarters"
              name="headquarters"
              rules={[{ required: true, message: "Headquarters is required" }]}
            >
              <Input placeholder="Bangalore" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Industry"
              name="industry"
              rules={[{ required: true, message: "Industry is required" }]}
            >
              <Select placeholder="Select industry" allowClear>
                {[
                  "Software",
                  "Technology",
                  "Healthcare",
                  "Finance",
                  "Education",
                  "Manufacturing",
                  "Retail",
                  "Media",
                  "Real Estate",
                  "Consulting",
                  "Logistics",
                  "Other",
                ].map((i) => (
                  <Option key={i} value={i}>
                    {i}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Company Size"
              name="companySize"
              rules={[{ required: true, message: "Company size is required" }]}
            >
              <Select placeholder="Select size" allowClear>
                {[
                  "1-10",
                  "11-50",
                  "51-200",
                  "201-500",
                  "501-1000",
                  "1001-5000",
                  "5001-10000",
                  "10000+",
                ].map((s) => (
                  <Option key={s} value={s}>
                    {s} employees
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Founded Year"
              name="foundedYear"
              rules={[{ required: true, message: "Founded year is required" }]}
            >
              <InputNumber
                placeholder="2024"
                min={1800}
                max={new Date().getFullYear()}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ════════ 4. LOCATIONS & SPECIALTIES ════════ */}
      <Card title="Locations & Specialties" style={{ marginBottom: 20 }}>
        <Form.Item
          label={
            <span>
              Office Locations <span style={{ color: "#ff4d4f" }}>*</span>
            </span>
          }
          extra="Add all countries / regions your company operates in"
        >
          <TagInput
            value={locations}
            onChange={(v) => { setLocations(v); setIsDirty(true); }}
            placeholder="e.g. India, USA"
          />
        </Form.Item>

        <Divider style={{ margin: "16px 0" }} />

        <Form.Item
          label="Specialties"
          extra="Key skills and focus areas of your company"
        >
          <TagInput
            value={specialties}
            onChange={(v) => { setSpecialties(v); setIsDirty(true); }}
            placeholder="e.g. Salesforce, AI Hiring"
          />
        </Form.Item>
      </Card>

      {/* ════════ 5. SOCIAL LINKS ════════ */}
      <Card title="Social Links" style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="LinkedIn" name="linkedin">
              <Input placeholder="https://linkedin.com/company/…" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Twitter / X" name="twitter">
              <Input placeholder="https://twitter.com/…" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Instagram" name="instagram">
              <Input placeholder="https://instagram.com/…" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ════════ SAVE ════════ */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingBottom: compact ? 8 : 32,
        }}
      >
        <Button
          type="primary"
          size="large"
          loading={saving}
          disabled={!isDirty}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>
    </Form>
  );

  return (
    <div style={wrapperStyle}>
      {contextHolder}

      {/* ── Preview toggle ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Button
          icon={showPreview ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </Button>
      </div>

      {showPreview ? (
        <div
          style={{
            display: "flex",
            gap: 24,
            height: compact ? "calc(70vh - 60px)" : "calc(100vh - 140px)",
            overflow: "hidden",
          }}
        >
          {/* Form — left, own scroll */}
          <div
            style={{
              flex: "1 1 0",
              minWidth: 0,
              overflowY: "auto",
              paddingRight: 6,
            }}
          >
            {formSection}
          </div>

          {/* Preview — right, own scroll */}
          <div
            style={{
              width: 300,
              flexShrink: 0,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            <CompanyPreview data={previewData} />
          </div>
        </div>
      ) : (
        formSection
      )}
    </div>
  );
};

export default CompanyProfile;
