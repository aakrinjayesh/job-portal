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
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  GetVendorCandidates,
  CreateVendorCandidate,
  UpdateVendorCandidate,
  DeleteVendorCandidate,
} from "../api/api";
import UpdateUserProfile from "../../candidate/pages/UpdateUserProfile";
import BenchCandidateDetails from "../components/Bench/BenchCandidateDetails";

const Bench = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const [isHotlistModalVisible, setIsHotlistModalVisible] = useState(false);
  const [hotlistFile, setHotlistFile] = useState(null);
  const [editRecord, setEditRecord] = useState(null);

  // 🔹 Fetch candidates from API
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await GetVendorCandidates();
      const list = Array.isArray(res?.data) ? res.data : res;
      setCandidates(list || []);
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
          setCandidates((prev) =>
            prev.map((cand) => (cand.id === editRecord.id ? res.data : cand))
          );
        } else {
          message.error(res?.message || "Failed to update candidate");
        }
      } else {
        const res = await CreateVendorCandidate(data);
        if (res?.status === "success") {
          message.success("Candidate added successfully!");
          setCandidates((prev) => [res.data, ...prev]);
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

  // 🔹 Table Columns
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
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
      title: "Rate Card Value",
      key: "rateValue",
      sorter: (a, b) =>
        parseFloat(a?.rateCardPerHour?.value || 0) -
        parseFloat(b?.rateCardPerHour?.value || 0),
      render: (_, record) =>
        record?.rateCardPerHour?.value ? record.rateCardPerHour.value : "-",
    },
    {
      title: "Currency",
      key: "currency",
      filters: [
        { text: "INR", value: "INR" },
        { text: "USD", value: "USD" },
        { text: "EUR", value: "EUR" },
      ],
      onFilter: (value, record) => record?.rateCardPerHour?.currency === value,
      render: (_, record) => record?.rateCardPerHour?.currency || "-",
    },
    {
      title: "Joining Period",
      dataIndex: "joiningPeriod",
      key: "joiningPeriod",
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

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Vendor Candidate List</h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: 16,
        }}
      >
        <Button type="primary" onClick={showModal}>
          Add Candidate
        </Button>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={candidates}
          rowKey={(record) => record.id || record.name}
          bordered
          pagination={{ pageSize: 10 }}
          style={{ cursor: "pointer" }}
          onRow={(record) => ({
            onClick: () => {
              console.log("selected candidate", record);
              setSelectedCandidate(record);
              setDetailsModalVisible(true);
            },
          })}
        />
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
    </div>
  );
};

export default Bench;
