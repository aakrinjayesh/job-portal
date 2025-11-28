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

function EducationCard({ title = "Education", apidata, onEducationChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingIndex, setEditingIndex] = useState(null);
  const [educationList, setEducationList] = useState([]);

  // Sync with apidata when it changes
  useEffect(() => {
    if (apidata && Array.isArray(apidata)) {
      setEducationList(apidata);
    }
  }, [apidata]);

  // Open Modal (Add or Edit)
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

  // Handle Save (Add/Edit)
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

      // Call the parent callback with updated list
      if (onEducationChange) {
        onEducationChange(updatedList);
      }
    });
  };

  // Handle Cancel
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
    form.resetFields();
  };

  const handleDelete = (index) => {
    const updatedList = educationList.filter((_, i) => i !== index);
    setEducationList(updatedList);
    message.success("Education deleted successfully!");

    // Call the parent callback with updated list
    if (onEducationChange) {
      onEducationChange(updatedList);
    }
  };

  return (
    <Card
      title={title}
      extra={
        <Space>
          <Button type="primary" onClick={() => openModal()}>
            Add {title}
          </Button>
        </Space>
      }
      style={{
        height: 300,
        overflowY: "auto",
        scrollbarWidth: "none",
      }}
    >
      {educationList.length > 0 ? (
        <List
          dataSource={educationList}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => openModal(item, index)}>
                  Edit
                </Button>,
                <Popconfirm
                  title="Are you sure you want to delete this education?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => handleDelete(index)}
                >
                  <Button type="link" danger>
                    Delete
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={<Text strong>{item.name}</Text>}
                description={`${item.fromYear} - ${item.toYear} | ${item.educationType}`}
              />
            </List.Item>
          )}
        />
      ) : (
        <Text type="secondary">No education records added yet.</Text>
      )}

      {/* Modal for Add/Edit */}
      <Modal
        title={editingIndex !== null ? "Edit Education" : "Add Education"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingIndex !== null ? "Save Changes" : "Add"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Education Name"
            rules={[
              { required: true, message: "Please enter education name" },
              {
                pattern: /^[A-Za-z ]+$/,
                message: "Only letters spaces are allowed!",
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
            label="Education Type"
            rules={[
              { required: true, message: "Please enter education type" },
              {
                pattern: /^[A-Za-z .,&-]+$/,
                message: "Only letters and spaces are allowed!",
              },
            ]}
          >
            <Input placeholder="e.g. Undergraduate, High School" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default EducationCard;
