import React from "react";
import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import { CreateActivity } from "../../api/api";

const AddScheduleModal = ({ open, onClose, candidateId, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      console.log("AddScheduleModal candidateId:", candidateId);

      if (!candidateId) {
        message.error("Candidate not found");
        return;
      }

      const values = await form.validateFields();

      await CreateActivity({
        candidateId,
        category: "SCHEDULE",
        schedule: {
          title: values.title,
          scheduleType: values.scheduleType,
          startTime: values.time[0].toISOString(),
          endTime: values.time[1].toISOString(),
          notes: values.notes,
        },
      });

      message.success("Schedule added");
      form.resetFields();
      onClose();
      onSuccess();
    } catch (error) {
      message.error("Failed to add schedule");
    }
  };

  return (
    <Modal
      title="Schedule"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="scheduleType"
          label="Type"
          rules={[{ required: true, message: "Type is required" }]}
        >
          <Select
            options={[
              { value: "INTERVIEW", label: "Interview" },
              { value: "MEETING", label: "Meeting" },
              { value: "FOLLOW_UP", label: "Follow-up" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="time"
          label="Time"
          rules={[{ required: true, message: "Time is required" }]}
        >
          <DatePicker.RangePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddScheduleModal;
