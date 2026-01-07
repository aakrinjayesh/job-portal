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
    // <Modal
    //   title="Schedule"
    //   open={open}
    //   onOk={handleSubmit}
    //   confirmLoading={loading} // ✅ OK button loading
    //   onCancel={() => {
    //     if (!loading) onClose();
    //   }}
    //   destroyOnClose
    // >
    //   <Form layout="vertical" form={form}>
    //     <Form.Item
    //       name="title"
    //       label="Title"
    //       rules={[{ required: true, message: "Title is required" }]}
    //     >
    //       <Input />
    //     </Form.Item>

    //     <Form.Item
    //       name="scheduleType"
    //       label="Type"
    //       rules={[{ required: true, message: "Type is required" }]}
    //     >
    //       <Select
    //         options={[
    //           { value: "INTERVIEW", label: "Interview" },
    //           { value: "MEETING", label: "Meeting" },
    //           { value: "FOLLOW_UP", label: "Follow-up" },
    //         ]}
    //       />
    //     </Form.Item>

    //     <Form.Item
    //       name="time"
    //       label="Time"
    //       rules={[{ required: true, message: "Time is required" }]}
    //     >
    //       <DatePicker.RangePicker
    //         format="h:mm a"
    //         use12Hours
    //         showTime
    //         disabledDate={(current) =>
    //           current && current < dayjs().startOf("day")
    //         }
    //         style={{ width: "100%" }}
    //       />
    //     </Form.Item>

    //     <Form.Item name="notes" label="Notes">
    //       <Input.TextArea rows={3} />
    //     </Form.Item>
    //   </Form>
    // </Modal>

    <Modal
  title={
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 24, fontWeight: 510, color: "#101828" }}>
        Schedule Meet
      </div>
      <div style={{ fontSize: 14, fontWeight: 400, color: "#101828" }}>
        Add schedule note as per your conversation with the candidate
      </div>
    </div>
  }
  open={open}
  onOk={handleSubmit}
  confirmLoading={loading}
  onCancel={() => {
    if (!loading) onClose();
  }}

  
  destroyOnClose
  width={640}
  okText="Add"
  cancelText="Cancel"
  okButtonProps={{
    style: {
      borderRadius: 100,
      padding: "0 24px",
      fontWeight: 590,
    },
  }}
  cancelButtonProps={{
    style: {
      borderRadius: 100,
      padding: "0 24px",
      fontWeight: 590,
      borderColor: "#666666",
      color: "#666666",
    },
  }}
>
  <Form
    layout="vertical"
    form={form}
    requiredMark={false}
  >

    {/* ===== Title ===== */}
    <Form.Item
      label={
        <span style={{ fontSize: 13, fontWeight: 590 }}>
          <span style={{ color: "#B60554" }}>*</span> Title
        </span>
      }
      required
    >
      <div style={{ border: "1px solid #5C5C5C", borderRadius: 8, padding: "6px 8px" }}>
        <Form.Item
          name="title"
          noStyle
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input bordered={false} placeholder="Enter Title" />
        </Form.Item>
      </div>
    </Form.Item>

    {/* ===== Type ===== */}
    <Form.Item
      label={
        <span style={{ fontSize: 13, fontWeight: 590 }}>
          <span style={{ color: "#B60554" }}>*</span> Type
        </span>
      }
      required
    >
      <div style={{ border: "1px solid #5C5C5C", borderRadius: 8, padding: "6px 8px" }}>
        <Form.Item
          name="scheduleType"
          noStyle
          rules={[{ required: true, message: "Type is required" }]}
        >
          <Select
            bordered={false}
            placeholder="Select Type"
            options={[
              { value: "INTERVIEW", label: "Interview" },
              { value: "MEETING", label: "Meeting" },
              { value: "FOLLOW_UP", label: "Follow-up" },
            ]}
          />
        </Form.Item>
      </div>
    </Form.Item>

    {/* ===== Time (Start / End visual) ===== */}
    <Form.Item
      label={
        <span style={{ fontSize: 13, fontWeight: 590 }}>
          <span style={{ color: "#B60554" }}>*</span> Time
        </span>
      }
      required
    >
      <div
        style={{
          border: "1px solid #5C5C5C",
          borderRadius: 8,
          padding: "6px 8px",
        }}
      >
        <Form.Item
          name="time"
          noStyle
          rules={[{ required: true, message: "Time is required" }]}
        >
          <DatePicker.RangePicker
            bordered={false}
            showTime
            use12Hours
            format="h:mm a"
            style={{ width: "100%" }}
            disabledDate={(current) =>
              current && current < dayjs().startOf("day")
            }
          />
        </Form.Item>
      </div>
    </Form.Item>

    {/* ===== Notes / Description ===== */}
    <Form.Item
      label={
        <span style={{ fontSize: 13, fontWeight: 590 }}>
          Description
        </span>
      }
    >
      <div style={{ border: "1px solid #5C5C5C", borderRadius: 8, padding: 8 }}>
        <Form.Item name="notes" noStyle>
          <Input.TextArea
            rows={4}
            bordered={false}
            placeholder="Description"
          />
        </Form.Item>
      </div>
    </Form.Item>

  </Form>
</Modal>

  );
};

export default AddScheduleModal;
