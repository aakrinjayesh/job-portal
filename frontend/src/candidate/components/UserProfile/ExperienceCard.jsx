import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  DatePicker,
  Input,
  Space,
  List,
  Typography,
  Popconfirm,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

function ExperienceCard({ title = "Experience", apidata, onExperienceChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [experiences, setExperiences] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    if (apidata && Array.isArray(apidata)) {
      setExperiences(apidata);
    }
  }, [apidata]);

  // Open modal for new or edit mode
  const openModal = (index = null) => {
    setEditingIndex(index);
    if (index !== null) {
      const exp = experiences[index];
      form.setFieldsValue({
        dateRange: [dayjs(exp?.startDate), dayjs(exp?.endDate)],
        projects: exp?.projects,
      });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const { dateRange, projects } = values;
      const newExperience = {
        startDate: dateRange[0].format("YYYY-MM"),
        endDate: dateRange[1].format("YYYY-MM"),
        projects,
      };

      let updated = [...experiences];
      if (editingIndex !== null) {
        updated[editingIndex] = newExperience;
        message.success("Experience updated!");
      } else {
        updated.push(newExperience);
        message.success("Experience added!");
      }
      setExperiences(updated);
      setIsModalOpen(false);
      setEditingIndex(null);
      form.resetFields();

      if (onExperienceChange) {
        onExperienceChange(updated);
      }
    });
  };

  const handleDelete = (index) => {
    const updated = experiences.filter((_, i) => i !== index);
    setExperiences(updated);
    message.success("Experience deleted!");
    if (onExperienceChange) {
      onExperienceChange(updated);
    }
  };

  return (
    <Card
      title={title}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Add {title}
        </Button>
      }
      style={{
        height: 350,
        overflowY: "auto",
        scrollbarWidth: "none",
      }}
    >
      {experiences.length > 0 ? (
        <List
          dataSource={experiences}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => openModal(index)}
                />,
                <Popconfirm
                  title="Are you sure to delete this experience?"
                  onConfirm={() => handleDelete(index)}
                >
                  <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Text strong>
                    {item.startDate} - {item.endDate}
                  </Text>
                }
                description={
                  <ul>
                    {item.projects.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Text type="secondary">No experience added yet.</Text>
      )}

      {/* Modal for Add/Edit */}
      <Modal
        title={editingIndex !== null ? "Edit Experience" : "Add Experience"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOk}
        okText={editingIndex !== null ? "Update" : "Add"}
        // destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="dateRange"
            label="Date Range"
            rules={[{ required: true, message: "Please select date range" }]}
          >
            <RangePicker picker="month" format="MMM YYYY" />
          </Form.Item>

          {/* Dynamic Projects */}
          <Form.List
            name="projects"
            initialValue={[""]}
            rules={[
              {
                validator: async (_, projects) => {
                  if (!projects || projects.length < 1) {
                    return Promise.reject(
                      new Error("Add at least one project")
                    );
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    align="baseline"
                    style={{ display: "block" }}
                  >
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={[
                        { required: true, message: "Enter project details" },
                      ]}
                      // style={{ flex: 1 }}
                    >
                      <TextArea placeholder="Enter project details" rows={4} />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button type="link" danger onClick={() => remove(name)}>
                        Delete
                      </Button>
                    )}
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Project
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Card>
  );
}

export default ExperienceCard;
