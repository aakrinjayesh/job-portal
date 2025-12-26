import React, { useState } from "react";
import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import { CreateActivity } from "../../api/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
const AddScheduleModal = ({ open, onClose, candidateId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!candidateId) {
        message.error("Candidate not found");
        return;
      }

      const values = await form.validateFields();

      const resp = await CreateActivity({
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

      if (resp.status === "success") {
        message.success("Schedule added");

        // 🚀 OPTIMISTIC UPDATE
        onSuccess(resp.data);

        form.resetFields();
        onClose();
      }
    } catch {
      message.error("Failed to add schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Schedule"
      open={open}
      onOk={handleSubmit}
      confirmLoading={loading} // ✅ OK button loading
      onCancel={() => {
        if (!loading) onClose();
      }}
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
          <DatePicker.RangePicker
            format="h:mm a"
            use12Hours
            showTime
            disabledDate={(current) =>
              current && current < dayjs().startOf("day")
            }
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddScheduleModal;
