import React, { useState, useEffect, useRef } from "react";
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
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
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

import { Input } from "antd";
import { SendVerificationOtp, VerifyCandidateOtp } from "../api/api";
import SearchWithTextArea from "../components/Bench/SearchWithTextArea";
import { useNavigate, useLocation } from "react-router-dom";

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
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimers, setOtpTimers] = useState({});
  const [activeOtpCandidateId, setActiveOtpCandidateId] = useState(null);
  const [otpError, setOtpError] = useState("");

  // add near other useState() calls
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [unverifiedCount, setUnverifiedCount] = useState(0);

  const [activeTab, setActiveTab] = useState("all");
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [timer, setTimer] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const controllerRef = useRef(null);
  const location = useLocation();

  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  const [deleteOpenId, setDeleteOpenId] = useState(null);

  const navigate = useNavigate();

  const { Title } = Typography;

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        console.log("🔥 Aborting Bench API due to tab switch");
        controllerRef.current.abort();
      }
    };
  }, [location.pathname]);

  useEffect(() => {
    if (activeTab === "all") {
      setCandidates(allcandidates);
    }
  }, [activeTab, allcandidates]);

  // useEffect(() => {
  //   if (!activeOtpCandidateId) return;

  //   const current = otpTimers[activeOtpCandidateId];
  //   if (!current?.isCounting) return;

  //   const interval = setInterval(() => {
  //     setOtpTimers((prev) => {
  //       const currentTimer = prev[activeOtpCandidateId];
  //       if (!currentTimer) return prev;

  //       const nextTimer = currentTimer.timer - 1;

  //       return {
  //         ...prev,
  //         [activeOtpCandidateId]: {
  //           timer: Math.max(nextTimer, 0),
  //           isCounting: nextTimer > 0, // ✅ STOP when reaches 0
  //         },
  //       };
  //     });
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [activeOtpCandidateId, otpTimers[activeOtpCandidateId]?.isCounting]);

  useEffect(() => {
    if (!activeOtpCandidateId) return;

    const current = otpTimers[activeOtpCandidateId];
    if (!current?.isCounting) return;

    const interval = setInterval(() => {
      setOtpTimers((prev) => {
        const currentTimer = prev[activeOtpCandidateId];
        if (!currentTimer) return prev;

        const nextTimer = currentTimer.timer - 1;

        if (nextTimer <= 0) {
          setOtpExpired(true);
          setOtpError("OTP expired. Please resend OTP");
          setOtp("");
          return {
            ...prev,
            [activeOtpCandidateId]: {
              timer: 0,
              isCounting: false,
            },
          };
        }

        return {
          ...prev,
          [activeOtpCandidateId]: {
            timer: nextTimer,
            isCounting: true,
          },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOtpCandidateId, otpTimers[activeOtpCandidateId]?.isCounting]);

  useEffect(() => {
    if (isModalVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalVisible]);

  useEffect(() => {
    if (otp.length === 6) {
      setIsCounting(false);
    }
  }, [otp]);

  // 🔹 Fetch candidates from API
  const fetchCandidates = async () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    // 🔵 create new controller
    controllerRef.current = new AbortController();
    try {
      setLoading(true);
      const res = await GetVendorCandidates(controllerRef.current.signal);
      if (res.status === "success") {
        const list = Array.isArray(res?.data) && res.data;
        setAllCandidates(list || []);
        setCandidates(list || []);

        setActiveTab("all");

        if (Array.isArray(list)) {
          const verified = list.filter((c) => !!c.isVerified).length;
          const unverified = list.length - verified;

          const active = list.filter((c) => c.status !== "inactive").length;
          const inactive = list.filter((c) => c.status === "inactive").length;

          setVerifiedCount(verified);
          setUnverifiedCount(unverified);
          setActiveCount(active);
          setInactiveCount(inactive);
        } else {
          setVerifiedCount(0);
          setUnverifiedCount(0);
          setActiveCount(0);
          setInactiveCount(0);
        }

        setLoading(false);
      }
    } catch (error) {
      if (error.code === "ERR_CANCELED") {
        console.log("Bench API aborted");
        return;
      }
      console.error("Error fetching candidates:", error);
      message.error("Failed to fetch vendor candidates.");
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
    setActiveOtpCandidateId(record.id);
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
        setOtpError(""); // ✅ clear error

        setOtpExpired(false);

        setOtpTimers((prev) => ({
          ...prev,
          [verifyCandidate.id]: {
            timer: 60,
            isCounting: true,
          },
        }));

        setOtpSent(true);
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
      }
      //  else {
      //   message.error(res?.message || "Invalid OTP");
      // }
      else {
        // 👇 backend error message shown in UI
        setOtpError(res?.message || "Invalid OTP");
      }
    } catch (err) {
      // catch (err) {
      //   console.error(err);
      //   message.error("Verification failed");
      // }
      const backendMsg = err?.response?.data?.message || "Invalid OTP";

      setOtpError(backendMsg); // 🔥 THIS FIXES UI
    } finally {
      setOtpVerifying(false);
    }
  };

  // 🔹 Handle single OTP digit change (UI only)
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    setOtpError("");

    const otpArray = otp.split("");
    otpArray[index] = value;

    const newOtp = otpArray.join("").slice(0, 6);
    setOtp(newOtp);
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
      const payload = {
        candidateIds: selectedRowKeys,
        status,
      };

      const resp = await UpdateVendorCandidateStatus(payload);

      if (resp?.status !== "success") {
        messageApi.error("Failed to update status. Try again.");
        return;
      }

      // 🔹 Optimistic UI update
      const updated = candidates.map((c) =>
        selectedRowKeys.includes(c.id)
          ? //  { ...c, status: status === "active" }
            { ...c, status }
          : c
      );
      setAllCandidates(updated);
      setCandidates(updated);
      setSelectedRowKeys([]);

      // ✅ SUCCESS MESSAGE
      messageApi.success({
        content:
          status === "active"
            ? "Moved to Active successfully!"
            : "Moved to Inactive successfully!",
        duration: 2,
      });

      // 🔹 Refresh list AFTER message
      setTimeout(() => {
        fetchCandidates();
      }, 300);
    } catch (error) {
      console.error(error);
      messageApi.error("Failed to update status. Try again.");
    }
  };

  // 🔹 Table Columns (UPDATED)
  const columns = [
    {
      title: "",
      dataIndex: "select",
      key: "select",
      width: 60,
      fixed: "left",
      render: (_, record) => (
        <input
          type="checkbox"
          checked={selectedRowKeys.includes(record.id)}
          onChange={(e) => handleCheckboxChange(record.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
      fixed: "left",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 0",
          }}
        >
          <div
            style={{
              color: "#666666",
              fontSize: 14,
              fontWeight: 400,
              textTransform: "capitalize",
              lineHeight: "20px",
            }}
          >
            {text}
          </div>
        </div>
      ),
    },

    {
      title: "Role",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title?.localeCompare(b.title),
      render: (text) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 0",
          }}
        >
          <div
            style={{
              color: "#666666",
              fontSize: 14,
              fontWeight: 400,
              textTransform: "capitalize",
              lineHeight: "20px",
              whiteSpace: "nowrap",
            }}
          >
            {text || "-"}
          </div>
        </div>
      ),
    },

    {
      title: "Cloud",
      key: "cloud",
      // width: 260,
      width: 380,
      render: (_, record) => {
        const clouds = Array.isArray(record.primaryClouds)
          ? record.primaryClouds.map((c) => c.name)
          : [];

        if (clouds.length === 0) return "-";

        const visibleClouds = clouds.slice(0, 3);
        const remainingCount = clouds.length - visibleClouds.length;

        return (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            {visibleClouds.map((cloud, index) => (
              //
              <div
                style={{
                  padding: "6px 12px",
                  background: "#E7F0FE",
                  borderRadius: 100,
                  outline: "0.5px solid #1677FF",
                  outlineOffset: "-0.5px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    color: "#111111",
                    fontSize: 12,
                    fontWeight: 510,
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cloud}
                </div>
              </div>
            ))}

            {remainingCount > 0 && (
              <div
                style={{
                  color: "#0055F3",
                  fontSize: 14,
                  fontWeight: 510,
                  // textDecoration: "underline",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                +{remainingCount} more
              </div>
            )}
          </div>
        );
      },
    },

    {
      title: "Skills",
      key: "skills",
      // width: 260,
      width: 380,
      render: (_, record) => {
        const skills =
          record.skillsJson
            ?.filter((s) => s.level === "primary")
            .map((s) => s.name) || [];

        if (skills.length === 0) return "-";

        const visibleSkills = skills.slice(0, 3);
        const remainingCount = skills.length - visibleSkills.length;

        return (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            {visibleSkills.map((skill, index) => (
              <div
                style={{
                  padding: "6px 12px",
                  background: "#FBEBFF",
                  borderRadius: 100,
                  outline: "0.5px solid #640080",
                  outlineOffset: "-0.5px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    color: "#111111",
                    fontSize: 12,
                    fontWeight: 510,
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                  }}
                >
                  {skill}
                </div>
              </div>
            ))}

            {remainingCount > 0 && (
              <div
                style={{
                  color: "#0055F3",
                  fontSize: 14,
                  fontWeight: 510,
                  // textDecoration: "underline",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                +{remainingCount} more
              </div>
            )}
          </div>
        );
      },
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
        const isVerified = record?.isVerified;
        return isVerified ? (
          <span style={{ color: "#52c41a", fontWeight: 600 }}>Verified</span>
        ) : (
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              openVerifyModal(record);
            }}
          >
            Verify
          </Button>
        );
      },
    },

    // --------------------------------------------------
    // FIXED RIGHT: ACTIONS COLUMN
    // --------------------------------------------------
    {
      title: "Actions",
      key: "actions",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          >
            {/* Edit */}
            <EditOutlined />
          </Button>

          <Popconfirm
            open={deleteOpenId === record.id}
            placement="left"
            icon={null}
            title={null}
            okButtonProps={{ style: { display: "none" } }}
            cancelButtonProps={{ style: { display: "none" } }}
            onOpenChange={(open) => {
              if (!open) setDeleteOpenId(null);
            }}
            description={
              <div
                style={{
                  padding: 24,
                  background: "white",
                  borderRadius: 16,
                  border: "1px solid #F3F4F6",
                  boxShadow: "0px 1px 2px -1px rgba(0,0,0,0.10)",
                  width: 420,
                  display: "flex",
                  flexDirection: "column",
                  gap: 64,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* HEADER */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 510,
                        color: "#101828",
                      }}
                    >
                      Delete Candidate
                    </div>
                    <div style={{ fontSize: 14, color: "#101828" }}>
                      Are you sure you want to delete this candidate?
                    </div>
                  </div>

                  {/* ✕ CLOSE ICON */}
                  <div
                    onClick={() => setDeleteOpenId(null)}
                    style={{
                      width: 40,
                      height: 40,
                      background: "#F9F9F9",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 16,
                  }}
                >
                  {/* CANCEL */}
                  <Button
                    onClick={() => setDeleteOpenId(null)}
                    style={{
                      height: 40,
                      padding: "10px 24px",
                      borderRadius: 100,
                      border: "1px solid #666666",
                      background: "transparent",
                      color: "#666666",
                      fontSize: 14,
                      fontWeight: 590,
                    }}
                  >
                    Cancel
                  </Button>

                  {/* DELETE */}
                  <Button
                    onClick={() => {
                      handleDelete(record); // ✅ SAME FUNCTION
                      setDeleteOpenId(null); // close popup
                    }}
                    style={{
                      height: 40,
                      padding: "10px 24px",
                      borderRadius: 100,
                      background: "#1677FF",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: 14,
                      fontWeight: 590,
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            }
          >
            <Button
              type="link"
              danger
              onClick={(e) => {
                e.stopPropagation();
                setDeleteOpenId(record.id); // 👈 OPEN POPUP
              }}
            >
              <DeleteOutlined />
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

  const StatBlock = ({ label, value, color }) => (
    <div style={{ width: 104, textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: 590, color }}>{value}</div>
      <div style={{ fontSize: 14, color }}>{label}</div>
    </div>
  );

  const Divider = () => (
    <div style={{ width: 1, height: 40, background: "#F4F6F9" }} />
  );

  const otpButtonText = otpExpired || otpError ? "Resend OTP" : "Send OTP";

  return (
    <div style={{ padding: 0 }}>
      {contextHolder}

      {/* ===== FIGMA TOP BAR 2 ===== */}
      <div
        style={{
          width: "100%",
          // padding: 8,
          background: "#fff",
          borderRadius: 6,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          // marginBottom: 16,
        }}
      >
        {/* COUNTERS */}
        <div
          style={{
            display: "flex",
            width: 280,
            alignItems: "center",
            gap: 8,
            padding: 10,
          }}
        >
          {/* <StatBlock label="Total" value={candidates.length} color="#3F41D1" /> */}
          <StatBlock label="Total" value={allcandidates.length} />

          <Divider />
          <StatBlock label="Verified" value={verifiedCount} color="#008000" />
          <Divider />
          <StatBlock
            label="Not Verified"
            value={unverifiedCount}
            color="#FF0000"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: "flex", gap: 16, padding: 10 }}>
          <Button
            style={{
              borderRadius: 100,
              background: "#D1E4FF",
              border: "none",
              fontWeight: 590,
            }}
            onClick={showModal}
          >
            + Add Candidate
          </Button>
        </div>
      </div>

      {/* ===== FIGMA TOP BAR 1 (UI ONLY, LOGIC SAFE) ===== */}
      <div
        style={{
          width: "100%",
          padding: 8,
          background: "#fff",
          borderRadius: 6,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        {/* LEFT TABS (CONNECTED TO activeTab) */}
        <div style={{ display: "flex", gap: 16, width: 600 }}>
          {[
            // { key: "all", label: `All (${candidates.length})` },
            // { key: "active", label: "Active" },
            // { key: "inactive", label: "Inactive" },
            { key: "all", label: `All (${allcandidates.length})` },
            { key: "active", label: `Active (${activeCount})` },
            { key: "inactive", label: `Inactive (${inactiveCount})` },
          ].map((item) => {
            const isActive = activeTab === item.key;
            return (
              <div
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  height: 36,
                  padding: "6px 16px",
                  borderRadius: 8,
                  border: `1px solid ${isActive ? "#3F41D1" : "#A3A3A3"}`,
                  background: isActive ? "#EBEBFA" : "#fff",
                  color: isActive ? "#3F41D1" : "#666",
                  fontWeight: isActive ? 590 : 400,
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>
        <div style={{ width: 150 }}>
          <SearchWithTextArea
            handleFiltersChange={handleFiltersChange}
            apifunction={AiCandidateFilter}
            handleClearFilters={handleClearFilters}
          />
        </div>
      </div>

      <Spin spinning={loading}>
        {/* 🔍 SEARCH INPUT */}

        {/* <Table
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
          // scroll={{ x: 1000 }}
          scroll={{ x: "max-content" }}
          style={{ cursor: "pointer" }}
          // onRow={(record) => ({
          //   onClick: () => {
          //     console.log("selected candidate", record);
          //     setSelectedCandidate(record);
          //     setDetailsModalVisible(true);
          //   },
          // })}
          onRow={(record) => ({
            onClick: () => {
              navigate("/company/bench/candidates", {
                state: { candidate: record, from: "mybench" },
              });
            },
          })}
        /> */}

        {/* <div
          style={{
            // height: "calc(100vh - 420px)", // 👈 fixed height
            height: "calc(100vh - 300px)",
            overflowY: "auto", // 👈 enables scroll
          }}
        > */}
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
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
          style={{ cursor: "pointer" }}
          /* 🔹 ROW UI ONLY */
          rowClassName={(_, index) =>
            index % 2 === 0 ? "bench-row-light" : "bench-row-dark"
          }
          /* 🔹 HEADER + ROW HEIGHT */
          // components={{
          //   header: {
          //     cell: (props) => (
          //       <th
          //         {...props}
          //         // style={{
          //         //   background: "#F0F2F4",
          //         //   color: "#666666",
          //         //   fontWeight: 400,
          //         //   height: 54,
          //         //   borderBottom: "1px solid #E0E0E0",
          //         // }}

          //         style={{
          //           height: 56, // ✅ FIXED HEIGHT
          //           maxHeight: 56, // ✅ IMPORTANT
          //           overflow: "hidden", // ✅ IMPORTANT
          //           whiteSpace: "nowrap", // ✅ NO WRAP
          //           textOverflow: "ellipsis", // ✅ ...
          //           borderBottom: "1px solid #E0E0E0",
          //           color: "#666666",
          //           fontSize: 14,
          //           verticalAlign: "middle", // ✅ CENTER CONTENT
          //         }}
          //       />
          //     ),
          //   },
          //   body: {
          //     cell: (props) => (
          //       <td
          //         {...props}
          //         style={{
          //           height: 54,
          //           borderBottom: "1px solid #E0E0E0",
          //           color: "#666666",
          //           fontSize: 14,
          //         }}
          //       />
          //     ),
          //   },
          // }}
          /* 🔹 ROW HOVER (SUBTLE – NO BLUE) */
          onRow={(record) => ({
            onClick: () => {
              navigate("/company/bench/candidates", {
                state: { candidate: record, from: "mybench" },
              });
            },
            style: {
              cursor: "pointer",
            },
          })}
        />
        {/* </div> */}

        {/* <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
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
        </div> */}

        {/* ===== BOTTOM CTAs (FIGMA EXACT) ===== */}
        <div
          style={{
            width: "100%",
            padding: "22px 24px",
            background: "#FBFBFB",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            <Button
              disabled={selectedRowKeys.length === 0}
              onClick={() => updateStatus("inactive")}
              style={{
                height: 35,
                borderRadius: 100,
                padding: "10px 24px",
                background: "transparent",
                border: "1px solid #666666",
                color: "#666666",
                fontSize: 14,
                fontWeight: 590,
                textTransform: "capitalize",
              }}
            >
              Deactivate Selected
            </Button>

            <Button
              disabled={selectedRowKeys.length === 0}
              onClick={() => updateStatus("active")}
              style={{
                height: 40,
                borderRadius: 100,
                padding: "10px 24px",
                background: "#1677FF",
                border: "none",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 590,
                textTransform: "capitalize",
              }}
            >
              Activate Selected
            </Button>
          </div>
        </div>
      </Spin>

      {/* ✅ Add/Edit Candidate Modal */}
      {/* <Modal
        title={editRecord ? "Edit Candidate" : "Add Candidate"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={900}
      > */}
      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        closable={false}
        mask={false}
        maskClosable={true}
        /* 🔑 KEY PART */
        width={`calc(100vw - 280px)`} // sidebar width
        style={{
          top: 0,
          left: 260, // 👈 START AFTER SIDEBAR
          margin: 0,
          padding: 0,
        }}
        bodyStyle={{
          height: "100vh",
          overflowY: "auto",
          padding: 24,
          borderRadius: "16px 0 0 16px", // rounded left only
        }}
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
        open={verifyModalVisible}
        footer={null}
        centered
        closable={false}
        width={571}
        bodyStyle={{
          padding: 24,
          borderRadius: 16,
          border: "1px solid #F3F4F6",
          boxShadow: "0px 1px 2px -1px rgba(0,0,0,0.10)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div>
            <div style={{ fontSize: 24, fontWeight: 510, color: "#101828" }}>
              Verify Candidate
            </div>
            <div style={{ fontSize: 14, color: "#101828" }}>
              Process to verify the candidate with OTP verification.
            </div>
          </div>

          {/* CLOSE */}
          <div
            onClick={() => setVerifyModalVisible(false)}
            style={{
              width: 40,
              height: 40,
              background: "#F9F9F9",
              borderRadius: 8,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            ✕
          </div>
        </div>

        {/* EMAIL + SEND OTP */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 8,
              border: "1px solid #F1F1F1",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 510 }}>
              Email :
              <span style={{ color: "#0B0BD6", marginLeft: 6 }}>
                {verifyCandidate?.email}
              </span>
            </div>
          </div>

          {/* <Button
            onClick={handleSendOtp}
            loading={otpSending}
            // disabled={otpSending || isCounting}
            disabled={otpSending || otpTimers[verifyCandidate?.id]?.isCounting}
            style={{
              height: 40,
              borderRadius: 100,
              background: "#D1E4FF",
              border: "none",
              fontWeight: 590,
            }}
          >
            Send OTP
          </Button> */}
          <Button
            onClick={handleSendOtp}
            loading={otpSending}
            disabled={otpSending || otpTimers[verifyCandidate?.id]?.isCounting}
            style={{
              height: 40,
              borderRadius: 100,
              background: "#D1E4FF",
              border: "none",
              fontWeight: 590,
            }}
          >
            {otpButtonText}
          </Button>
        </div>

        {/* OTP LABEL */}
        <div style={{ fontSize: 16, fontWeight: 510, marginBottom: 16 }}>
          Enter 6 digit OTP
        </div>

        {/* OTP INPUT */}
        {/* <Input
    value={otp}
    onChange={(e) => setOtp(e.target.value)}
    maxLength={6}
    style={{
      height: 46,
      borderRadius: 6,
      border: "1px solid #666666",
      fontSize: 16,
      textAlign: "center",
      letterSpacing: 8,
      marginBottom: 16,
    }}
  /> */}

        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {[...Array(6)].map((_, index) => {
            const digit = otp[index] || "";
            const isActive = otp.length === index;

            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: 46,
                  display: "flex",
                }}
              >
                <input
                  type="text"
                  value={digit}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digit && index > 0) {
                      const otpArray = otp.split("");
                      otpArray[index - 1] = "";
                      setOtp(otpArray.join(""));
                    }
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    textAlign: "center",
                    fontSize: 16,
                    borderRadius: 6,
                    outline: "none",
                    // border: `1px solid ${
                    //   digit ? "#666666" : isActive ? "#3F41D1" : "#E0E0E0"
                    // }`,
                    border: `1px solid ${
                      otpError
                        ? "#FF4D4F"
                        : digit
                        ? "#666666"
                        : isActive
                        ? "#3F41D1"
                        : "#E0E0E0"
                    }`,

                    color: digit ? "#212121" : "#E0E0E0",
                  }}
                />
              </div>
            );
          })}
        </div>
        {otpError && (
          <div
            style={{
              color: "#FF4D4F",
              fontSize: 14,
              marginBottom: 16,
              textAlign: "left",
            }}
          >
            {otpError}
          </div>
        )}

        {/* TIMER + COUNT */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div style={{ color: "#06C270", fontSize: 14 }}>
            {/* {isCounting ? `00:${timer.toString().padStart(2, "0")}` : ""} */}
            {otpTimers[verifyCandidate?.id]?.isCounting &&
            otpTimers[verifyCandidate?.id]?.timer > 0
              ? `00:${otpTimers[verifyCandidate.id].timer
                  .toString()
                  .padStart(2, "0")}`
              : ""}
          </div>
          <div style={{ color: "#666", fontSize: 14 }}>{otp.length}/6</div>
        </div>

        {/* FOOTER BUTTONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 16,
          }}
        >
          <Button
            onClick={() => setVerifyModalVisible(false)}
            style={{
              height: 40,
              borderRadius: 100,
              border: "1px solid #666",
              fontWeight: 590,
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleVerifyOtp}
            loading={otpVerifying}
            disabled={!otp || otpExpired}
            style={{
              height: 40,
              borderRadius: 100,
              fontWeight: 590,
            }}
          >
            Verify
          </Button>
        </div>
      </Modal>
    </div>
  );
};
export default Bench;
