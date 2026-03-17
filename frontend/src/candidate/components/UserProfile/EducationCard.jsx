import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  List,
  Space,
  Typography,
  Popconfirm,
  message,
} from "antd";
import dayjs from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;

// ✅ mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
};

function EducationCard({ title = "Education", apidata, onEducationChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingIndex, setEditingIndex] = useState(null);
  const [educationList, setEducationList] = useState([]);
  const isMobile = useIsMobile(); // ✅

  useEffect(() => {
    if (apidata && Array.isArray(apidata)) {
      setEducationList(apidata);
    }
  }, [apidata]);

  const openModal = (record = null, index = null) => {
    setIsModalOpen(true);
    if (record) {
      setEditingIndex(index);
      form.setFieldsValue({
        name: record.name,
        yearRange: [
          dayjs(record.fromYear, "YYYY"),
          dayjs(record.toYear, "YYYY"),
        ],
        educationType: record.educationType,
      });
    } else {
      setEditingIndex(null);
      form.resetFields();
    }
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const newEntry = {
        name: values.name,
        fromYear: values.yearRange[0].format("YYYY"),
        toYear: values.yearRange[1].format("YYYY"),
        educationType: values.educationType,
      };

      let updatedList = [...educationList];
      if (editingIndex !== null) {
        updatedList[editingIndex] = newEntry;
        message.success("Education updated successfully!");
      } else {
        updatedList.push(newEntry);
        message.success("Education added successfully!");
      }

      setEducationList(updatedList);
      setIsModalOpen(false);
      form.resetFields();
      setEditingIndex(null);

      if (onEducationChange) {
        onEducationChange(updatedList);
      }
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
    form.resetFields();
  };

  const handleDelete = (index) => {
    const updatedList = educationList.filter((_, i) => i !== index);
    setEducationList(updatedList);
    message.success("Education deleted successfully!");
    if (onEducationChange) {
      onEducationChange(updatedList);
    }
  };

  return (
    <Card
      title={<Text style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600 }}>{title}</Text>}
      extra={
        <Button
          type="primary"
          size={isMobile ? "small" : "middle"}
          style={{ borderRadius: 8 }}
          onClick={() => openModal()}
        >
          {isMobile ? "+ Add" : "Add Education"}
        </Button>
      }
      style={{
        background: "#FFFFFF",
        borderRadius: 12,
        boxShadow: "0px 0px 24px rgba(0,0,0,0.06)",
      }}
      styles={{
        body: {
          padding: isMobile ? 12 : 24,
        },
      }}
    >
      {educationList.length > 0 ? (
        <Space direction="vertical" size={isMobile ? 10 : 16} style={{ width: "100%" }}>
          {educationList.map((item, index) => (
            <div
              key={index}
              style={{
                padding: isMobile ? "12px 14px" : "16px 20px",
                borderRadius: 10,
                border: "1px solid #F0F0F0",
                // ✅ stack vertically on mobile, row on desktop
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "center",
                gap: isMobile ? 8 : 0,
              }}
            >
              {/* LEFT CONTENT */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: isMobile ? 14 : 15,
                    fontWeight: 600,
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: isMobile ? "normal" : "nowrap",
                  }}
                >
                  {item.name}
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: isMobile ? 12 : 13 }}>
                    {item.fromYear} – {item.toYear} | {item.educationType}
                  </Text>
                </div>
              </div>

              {/* RIGHT ACTIONS — aligned right on both mobile and desktop */}
              <div style={{ display: "flex", gap: 4, alignSelf: isMobile ? "flex-end" : "center" }}>
                <Button
                  type="link"
                  size="small"
                  style={{ padding: "0 6px" }}
                  onClick={() => openModal(item, index)}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Are you sure you want to delete this education?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => handleDelete(index)}
                >
                  <Button type="link" danger size="small" style={{ padding: "0 6px" }}>
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            </div>
          ))}
        </Space>
      ) : (
        <Text type="secondary" style={{ fontSize: isMobile ? 13 : 14 }}>
          No education records added yet.
        </Text>
      )}

      {/* MODAL — full width on mobile */}
      <Modal
        title={editingIndex !== null ? "Edit Education" : "Add Education"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingIndex !== null ? "Save Changes" : "Add"}
        width={isMobile ? "95vw" : 520}
        centered={isMobile}
        style={isMobile ? { top: 0 } : {}}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Education Name"
            rules={[
              { required: true, message: "Please enter education name" },
              {
                pattern: /^[A-Za-z .]+$/,
                message: "Only letters and spaces are allowed!",
              },
            ]}
          >
            <Input placeholder="e.g. B.Tech Computer Science" />
          </Form.Item>

          <Form.Item
            name="yearRange"
            label="Year Range"
            rules={[{ required: true, message: "Please select year range" }]}
          >
            <RangePicker picker="year" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="educationType"
            label="Institute Name"
            rules={[
              { required: true, message: "Please enter institute name" },
              {
                pattern: /^[A-Za-z .,&\-\/']+$/,
                message: "Only letters and spaces are allowed!",
              },
            ]}
          >
            <Input placeholder="e.g. IIT Delhi, JNTU Hyderabad" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default EducationCard;