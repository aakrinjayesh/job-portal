import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Table,
  Space,
  message,
  Spin,
  Upload,
  Popconfirm,
  Typography,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  GetVendorCandidates,
  CreateVendorCandidate,
  UpdateVendorCandidate,
  DeleteVendorCandidate,
  UpdateVendorCandidateStatus,
  AiCandidateFilter,
  //  UpdateCandidateStatus
} from "../api/api";
import UpdateUserProfile from "../../candidate/pages/UpdateUserProfile";
import BenchCandidateDetails from "../components/Bench/BenchCandidateDetails";
import { useCallback } from "react";

import { Input } from "antd";
import { SendVerificationOtp, VerifyCandidateOtp } from "../api/api";
import SearchWithTextArea from "../components/Bench/SearchWithTextArea";

const Bench = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [candidates, setCandidates] = useState([]);
  const [allcandidates, setAllCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const [isHotlistModalVisible, setIsHotlistModalVisible] = useState(false);
  const [hotlistFile, setHotlistFile] = useState(null);
  const [editRecord, setEditRecord] = useState(null);

  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [verifyCandidate, setVerifyCandidate] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);

  // add near other useState() calls
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [unverifiedCount, setUnverifiedCount] = useState(0);

  const [activeTab, setActiveTab] = useState("active");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [timer, setTimer] = useState(0);
  const [isCounting, setIsCounting] = useState(false);

  const { Title } = Typography;

  useEffect(() => {
    let interval = null;

    if (isCounting && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0 && isCounting) {
      setIsCounting(false);
      setOtpExpired(true); // mark OTP expired
    }

    return () => clearInterval(interval);
  }, [isCounting, timer]);

  // 🔹 Fetch candidates from API
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await GetVendorCandidates();
      const list = Array.isArray(res?.data) && res.data;
      setAllCandidates(list || []);
      setCandidates(list || []);
      // --- NEW: update verified / unverified counts ---
      if (Array.isArray(list)) {
        const verified = list.filter((c) => !!c.isVerified).length;
        const unverified = list.length - verified;
        setVerifiedCount(verified);
        setUnverifiedCount(unverified);
      } else {
        setVerifiedCount(0);
        setUnverifiedCount(0);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      message.error("Failed to fetch vendor candidates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // 🔹 Open Add Candidate Modal
  const showModal = () => {
    form.resetFields();
    setEditRecord(null);

    setIsModalVisible(true);
  };

  // 🔹 Close Modal
  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
    setEditRecord(null);
  };

  // 🔹 Edit Candidate
  const handleEdit = (record) => {
    setEditRecord(record);
    setIsModalVisible(true);
  };

  // 🔹 Delete Candidate
  const handleDelete = async (record) => {
    setDetailsModalVisible(false);
    try {
      setLoading(true);
      const res = await DeleteVendorCandidate({ id: record.id });
      if (res?.status === "success") {
        fetchCandidates();
        message.success("Candidate deleted successfully!");
      } else {
        message.error(res?.message || "Failed to delete candidate");
      }
    } catch (error) {
      console.error("Error deleting candidate:", error);
      message.error("Failed to delete candidate.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Add/Edit Candidate
  const handleFormDetails = async (data) => {
    console.log("details received from userProfile component", data);
    try {
      setLoading(true);

      if (editRecord && editRecord.id) {
        const res = await UpdateVendorCandidate({ ...data, id: editRecord.id });
        if (res?.status === "success") {
          message.success("Candidate updated successfully!");
          setAllCandidates((prev) =>
            prev.map((cand) => (cand.id === editRecord.id ? res.data : cand))
          );
          setCandidates((prev) =>
            prev.map((cand) => (cand.id === editRecord.id ? res.data : cand))
          );

          // ✅ Recalculate counts after editing
          fetchCandidates();
        } else {
          message.error(res?.message || "Failed to update candidate");
        }
      } else {
        const res = await CreateVendorCandidate(data);
        if (res?.status === "success") {
          message.success("Candidate added successfully!");

          await fetchCandidates();
          if (res?.data) {
            if (res.data.isVerified) {
              setVerifiedCount((v) => v + 1);
            } else {
              setUnverifiedCount((u) => u + 1);
            }
          }
        } else {
          message.error(res?.message || "Failed to add candidate");
        }
      }

      setIsModalVisible(false);
      setEditRecord(null);
    } catch (error) {
      console.error("Error saving candidate:", error);
      message.error("Failed to save candidate details.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Open Verify Modal
  const openVerifyModal = (record) => {
    setVerifyCandidate(record);
    setOtp("");
    setVerifyModalVisible(true);
  };

  // 🔹 Send OTP to candidate's email
  const handleSendOtp = async () => {
    if (!verifyCandidate?.email) {
      message.error("Candidate email not available");
      return;
    }
    try {
      setOtpSending(true);
      const res = await SendVerificationOtp({
        userProfileId: verifyCandidate.id,
      });

      if (res?.status === "success") {
        message.success(`OTP sent to ${verifyCandidate.email}`);

        setOtp("");
        setOtpExpired(false);
        setTimer(60);
        setIsCounting(true);
      } else {
        message.error(res?.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  // 🔹 Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      message.warning("Please enter the OTP");
      return;
    }

    try {
      setOtpVerifying(true);
      const res = await VerifyCandidateOtp({
        userProfileId: verifyCandidate.id,
        otp,
      });

      if (res?.status === "success") {
        message.success("Candidate verified successfully!");
        setAllCandidates((prev) =>
          prev.map((c) =>
            c.id === verifyCandidate.id ? { ...c, isVerified: true } : c
          )
        );
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === verifyCandidate.id ? { ...c, isVerified: true } : c
          )
        );
        // Update counters immediately:
        setVerifiedCount((v) => v + 1);
        setUnverifiedCount((u) => (u > 0 ? u - 1 : 0));
        setVerifyModalVisible(false);
      } else {
        message.error(res?.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      message.error("Verification failed");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleCheckboxChange = (id, checked) => {
    if (checked) {
      setSelectedRowKeys((prev) => [...prev, id]);
    } else {
      setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
    }
  };

  const updateStatus = async (status) => {
    try {
      // backend update
      const payload = {
        candidateIds: selectedRowKeys,
        status: status,
      };
      const resp = await UpdateVendorCandidateStatus(payload);
      if (resp.status !== "success") {
        return message.error("Failed to update status. Try again.");
      }
      // frontend update
      const updated = candidates.map((c) =>
        selectedRowKeys.includes(c.id)
          ? { ...c, status: status === "active" } // convert to boolean
          : c
      );
      setAllCandidates(updated);
      setCandidates(updated);
      setSelectedRowKeys([]);

      message.success(
        status === "active" ? "Moved to Active!" : "Moved to Inactive!"
      );
      fetchCandidates();
    } catch (error) {
      console.error(error);
      message.error("Failed to update status. Try again.");
    }
  };

  // 🔹 Table Columns
  const columns = [
    {
      title: "",
      dataIndex: "select",
      key: "select",
      width: 50,
      render: (_, record) => (
        <input
          type="checkbox"
          checked={selectedRowKeys.includes(record.id)}
          onChange={(e) => handleCheckboxChange(record.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()} // stop row click
        />
      ),
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => (
        <span style={{ color: "#1677ff", fontWeight: 600 }}>{text}</span>
      ),
    },
    {
      title: "Role",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title?.localeCompare(b.title),
    },
    {
      title: "Cloud",
      key: "cloud",
      render: (_, record) =>
        Array.isArray(record.primaryClouds) && record.primaryClouds.length > 0
          ? record.primaryClouds
              .slice(0, 5)
              .map((c) => c.name)
              .join(", ")
          : "-",
    },
    {
      title: "Skills",
      key: "skills",
      render: (_, record) =>
        record.skillsJson
          ?.filter((s) => s.level === "primary")
          .slice(0, 5)
          .map((s) => s.name)
          .join(", ") || "-",
    },
    {
      title: "Preferred Locations",
      key: "preferredLocation",
      render: (_, record) =>
        Array.isArray(record.preferredLocation)
          ? record.preferredLocation.join(", ")
          : "-",
    },

    {
      title: "Rate Card",
      key: "rateCard",
      filters: [
        { text: "INR", value: "INR" },
        { text: "USD", value: "USD" },
        { text: "EUR", value: "EUR" },
      ],
      onFilter: (value, record) => record?.rateCardPerHour?.currency === value,
      sorter: (a, b) =>
        parseFloat(a?.rateCardPerHour?.value || 0) -
        parseFloat(b?.rateCardPerHour?.value || 0),
      render: (_, record) => {
        const rate = record?.rateCardPerHour?.value || "-";
        const currency = record?.rateCardPerHour?.currency || "";
        if (rate === "-" && !currency) return "-";
        return (
          <span style={{ fontWeight: 600 }}>
            {currency} {rate}
          </span>
        );
      },
    },

    {
      title: "Joining Period",
      dataIndex: "joiningPeriod",
      key: "joiningPeriod",
    },
    {
      title: "Verified",
      key: "verified",
      render: (_, record) => {
        const isVerified = record?.isVerified; // boolean from DB
        return isVerified ? (
          <span style={{ color: "#52c41a", fontWeight: 600 }}>Verified</span>
        ) : (
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              openVerifyModal(record); // we'll implement this function
            }}
          >
            Verify
          </Button>
        );
      },
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          >
            Edit
          </Button>

          <Popconfirm
            title="Are you sure you want to delete this candidate?"
            okText="Yes"
            cancelText="No"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(record);
            }}
            onCancel={(e) => e?.stopPropagation()}
          >
            <Button type="link" onClick={(e) => e.stopPropagation()} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 🔹 Hotlist submit handler
  const handleHotlistSubmit = () => {
    if (!hotlistFile) {
      message.warning("⚠️ Please upload a Hotlist file before submitting.");
      return;
    }
    message.success("✅ Hotlist submitted successfully!");
    setIsHotlistModalVisible(false);
    setHotlistFile(null);
  };

  const filterCandidates = (filters, allcandidates) => {
    console.log("filters in filtercandidate:", filters);
    if (!filters || Object.keys(filters).length === 0) {
      return allcandidates;
    } else {
      console.log("flase");
    }

    return allcandidates.filter((cand) => {
      const {
        name,
        title,
        skills,
        clouds,
        preferredLocation,
        currentLocation,
        joiningPeriod,
        rate,
      } = filters || {};

      console.log("name", name);

      // --- NAME (substring, case-insensitive) ---
      if (name && name.trim()) {
        if (!cand.name?.toLowerCase().includes(name.toLowerCase().trim())) {
          return false;
        }
      }

      // --- TITLE / ROLE (substring) ---
      if (title && title.trim()) {
        if (!cand.title?.toLowerCase().includes(title.toLowerCase().trim())) {
          return false;
        }
      }

      // --- SKILLS (skillsJson: [{ name, level, ... }]) ---
      if (Array.isArray(skills) && skills.length > 0) {
        const candSkills =
          cand.skillsJson?.map((s) => s.name.toLowerCase()) || [];

        const hasAllSkills = skills.every((skill) =>
          candSkills.includes(skill.toLowerCase())
        );

        if (!hasAllSkills) return false;
      }

      // --- PRIMARY CLOUDS (primaryClouds: [{ name }]) ---
      if (Array.isArray(clouds) && clouds.length > 0) {
        const candClouds =
          cand.primaryClouds?.map((c) => c.name.toLowerCase()) || [];

        const matchesSomeCloud = clouds.some((cloud) =>
          candClouds.includes(cloud.toLowerCase())
        );

        if (!matchesSomeCloud) return false;
      }

      // --- PREFERRED LOCATION (preferredLocation: string[]) ---
      if (Array.isArray(preferredLocation) && preferredLocation.length > 0) {
        const candPrefLocs =
          cand.preferredLocation?.map((loc) => loc.toLowerCase()) || [];

        const matchesPrefLoc = preferredLocation.some((loc) =>
          candPrefLocs.includes(loc.toLowerCase())
        );

        if (!matchesPrefLoc) return false;
      }

      // --- CURRENT LOCATION (string) ---
      if (Array.isArray(currentLocation) && currentLocation.length > 0) {
        const candCurrLoc = (cand.currentLocation || "").toLowerCase();

        const matchesCurrLoc = currentLocation.some((loc) =>
          candCurrLoc.includes(loc.toLowerCase())
        );

        if (!matchesCurrLoc) return false;
      }

      // --- JOINING PERIOD (string matches any) ---
      if (Array.isArray(joiningPeriod) && joiningPeriod.length > 0) {
        const candJoin = (cand.joiningPeriod || "").toLowerCase();

        const matchesJoin = joiningPeriod.some((jp) =>
          candJoin.includes(jp.toLowerCase())
        );

        if (!matchesJoin) return false;
      }

      // --- RATE CARD PER HOUR (value, currency) ---
      if (rate && (rate.min != null || rate.max != null || rate.currency)) {
        const candRate = parseFloat(cand?.rateCardPerHour?.value || 0);
        const candCurrency =
          cand?.rateCardPerHour?.currency?.toUpperCase() || "";

        if (rate.currency && candCurrency !== rate.currency.toUpperCase()) {
          return false;
        }

        if (rate.min != null && candRate < rate.min) return false;
        if (rate.max != null && candRate > rate.max) return false;
      }

      return true;
    });
  };

  const handleFiltersChange = (filters) => {
    console.log("Received filters:", filters);
    const filtered = filterCandidates(filters, allcandidates);
    console.log("filter list", filtered);
    setCandidates(filtered);
  };

  const handleClearFilters = () => {
    console.log("cleared called");
    setCandidates(allcandidates);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* <h2 style={{ marginBottom: 16 }}>Vendor Candidate List</h2> */}
      <Title level={4} style={{ color: "rgba(0,0,0,0.75)", marginBottom: 16 }}>
        Vendor Candidate List
      </Title>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          background: "#f8f9fa",
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid #e5e5e5",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Button type="primary" onClick={showModal}>
            Add Candidate
          </Button>
          <Button onClick={fetchCandidates}>Refresh</Button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          {/* <div style={{ fontWeight: 600 }}>
          Verified: <span style={{ color: "#52c41a" }}>{verifiedCount}</span>
         </div> */}
          <div
            style={{
              fontWeight: 500,
              color: "#000",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Verified:
            <span
              style={{
                background: "#52c41a",
                color: "white",
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              {verifiedCount}
            </span>
          </div>

          {/* <div style={{ fontWeight: 600 }}>
         Not Verified: <span style={{ color: "#ff4d4f" }}>{unverifiedCount}</span>
         </div> */}
          <div
            style={{
              fontWeight: 500,
              color: "#000",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Not Verified:
            <span
              style={{
                background: "#ff4d4f",
                color: "white",
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              {unverifiedCount}
            </span>
          </div>

          {/* Total Candidates */}
          <div
            style={{
              fontWeight: 500,
              color: "#000",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Total:
            <span
              style={{
                background: "#1677ff",
                color: "white",
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              {candidates.length}
            </span>
          </div>

          {/* Active / Inactive Buttons */}
          <Button
            type={activeTab === "active" ? "primary" : "default"}
            onClick={() => setActiveTab("active")}
          >
            Active
          </Button>

          <Button
            type={activeTab === "inactive" ? "primary" : "default"}
            onClick={() => setActiveTab("inactive")}
          >
            Inactive
          </Button>

          <Button
            type={activeTab === "all" ? "primary" : "default"}
            onClick={() => setActiveTab("all")}
          >
            All
          </Button>
        </div>
      </div>

      <SearchWithTextArea
        handleFiltersChange={handleFiltersChange}
        apifunction={AiCandidateFilter}
        handleClearFilters={handleClearFilters}
      />

      <Spin spinning={loading}>
        {/* 🔍 SEARCH INPUT */}

        <Table
          columns={columns}
          dataSource={
            activeTab === "all"
              ? candidates
              : activeTab === "active"
              ? candidates.filter((c) => c.status !== "inactive")
              : candidates.filter((c) => c.status === "inactive")
          }
          rowKey={(record) => record.id || record.name}
          bordered
          pagination={false}
          scroll={{ x: 1000 }}
          style={{ cursor: "pointer" }}
          onRow={(record) => ({
            onClick: () => {
              console.log("selected candidate", record);
              setSelectedCandidate(record);
              setDetailsModalVisible(true);
            },
          })}
        />

        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <Button
            type="primary"
            disabled={selectedRowKeys.length === 0}
            onClick={() => updateStatus("active")}
          >
            Activate Selected
          </Button>

          <Button
            danger
            disabled={selectedRowKeys.length === 0}
            onClick={() => updateStatus("inactive")}
          >
            Deactivate Selected
          </Button>
        </div>
      </Spin>

      {/* ✅ Add/Edit Candidate Modal */}
      <Modal
        title={editRecord ? "Edit Candidate" : "Add Candidate"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={900}
      >
        <UpdateUserProfile
          handleFormDetails={handleFormDetails}
          Reciviedrole={"candidate"}
          setModalVisible={setIsModalVisible}
          editRecord={editRecord}
          setEditRecord={setEditRecord}
        />
      </Modal>

      {/* ✅ Candidate Details Modal */}
      <Modal
        title="Candidate Details"
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedCandidate(null);
        }}
        width={900}
        footer={null}
        centered
        Style={{ maxHeight: "600px", overflowY: "auto", padding: "20px" }}
      >
        <BenchCandidateDetails selectedCandidate={selectedCandidate} />
      </Modal>

      {/* ✅ Hotlist Modal */}
      <Modal
        title="Add Hotlist"
        open={isHotlistModalVisible}
        onCancel={() => setIsHotlistModalVisible(false)}
        footer={null}
        centered
        width={500}
      >
        <div style={{ marginBottom: 16 }}>
          <ul style={{ paddingLeft: "20px", lineHeight: "1.6" }}>
            <li>
              Provide clear candidate names that match the filenames of resumes.
            </li>
            <li>
              Include each candidate’s location and primary skills/job title.
            </li>
          </ul>
        </div>

        <Form layout="vertical">
          <Form.Item label="Hotlist File (.xlsx only)">
            <Upload
              beforeUpload={(file) => {
                setHotlistFile(file);
                return false;
              }}
              accept=".xlsx"
              maxCount={1}
              showUploadList={{ showRemoveIcon: true }}
            >
              <Button icon={<UploadOutlined />}>Add Hotlist File</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Resume Folder">
            <Upload
              multiple
              directory
              showUploadList={{ showRemoveIcon: true }}
            >
              <Button icon={<UploadOutlined />}>Add Resume Folder</Button>
            </Upload>
          </Form.Item>

          <Form.Item style={{ textAlign: "center" }}>
            <Button type="primary" onClick={handleHotlistSubmit}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* ✅ Enhanced Verification Modal */}

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                background: "#1677ff",
                color: "white",
                borderRadius: "50%",
                width: 30,
                height: 30,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
              }}
            >
              🔐
            </span>
            <span style={{ fontSize: 18, fontWeight: 600 }}>
              Verify Candidate
            </span>
          </div>
        }
        open={verifyModalVisible}
        onCancel={() => setVerifyModalVisible(false)}
        footer={null}
        centered
        bodyStyle={{ padding: "24px 32px" }}
      >
        <div
          style={{
            background: "#f8f9fa",
            padding: "16px 20px",
            borderRadius: 10,
            marginBottom: 20,
            border: "1px solid #e5e5e5",
          }}
        >
          <p style={{ marginBottom: 0, fontSize: 15 }}>
            <b>Email:</b>{" "}
            <span style={{ color: "#1677ff", fontWeight: 500 }}>
              {verifyCandidate?.email || "-"}
            </span>
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <Button
            type="primary"
            icon={<i className="ri-mail-send-line" />}
            onClick={handleSendOtp}
            loading={otpSending}
            disabled={otpSending || isCounting}
            style={{
              width: "100%",
              height: 40,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            {otpSending
              ? "Sending..."
              : isCounting
              ? `Resend OTP in ${timer}s`
              : "Send OTP"}
          </Button>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <Input
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 6,
                fontSize: 15,
                textAlign: "center",
                letterSpacing: 3,
              }}
            />

            <Button
              type="primary"
              onClick={handleVerifyOtp}
              loading={otpVerifying}
              disabled={!otp || otpVerifying || otpExpired} // ⬅ IMPORTANT
              style={{
                width: 100,
                height: 40,
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              {otpExpired
                ? "Expired"
                : otpVerifying
                ? "Verifying..."
                : "Verify"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Bench;
