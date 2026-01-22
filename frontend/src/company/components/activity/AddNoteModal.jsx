import React from "react";
import { Modal, Form, Input, Select, message ,DatePicker } from "antd";
import dayjs from "dayjs";
import { CreateActivity } from "../../api/api";
import { useState } from "react";

const AddNoteModal = ({ open, onClose, candidateId, onSuccess }) => {
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
        category: "NOTE",
        note: {
          subject: values.subject,
          noteType: values.noteType,
          description: values.description,
          // interactedAt: new Date().toISOString(),
          // interactedAt: values.time.toISOString(),
           startTime: values.time[0].toISOString(),
          endTime: values.time[1].toISOString(),

        },
      });

      if (resp.status === "success") {
        message.success("Note added successfully");

        // 🚀 OPTIMISTIC UPDATE
        onSuccess(resp.data);

        form.resetFields();
        onClose();
      }
    } catch {
      message.error("Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  return (
   
<Modal
  title="Add Note"
  open={open}
  onOk={() => form.submit()}
  confirmLoading={loading}
  onCancel={() => {
    form.resetFields();
    onClose();
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

  <div
  style={{
    marginBottom: 24,
    fontSize: 14,
    fontWeight: 400,
    color: "#101828",
  }}
>
  Add note as per your conversation with the candidate
</div>

  <Form
    layout="vertical"
    form={form}
    onFinish={handleSubmit}
    requiredMark={false}   // ✅ prevents duplicate red star
  >

    {/* ===== Subject ===== */}
    <Form.Item
      label={
        <span style={{ fontSize: 13, fontWeight: 590, color: "#2E2E2E" }}>
          <span style={{ color: "#B60554" }}>*</span> Subject
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
          name="subject"
          noStyle
          rules={[{ required: true, message: "Subject is required" },
              {
          pattern: /^[A-Za-z0-9 ]+$/,
          message: "Only letters, numbers, and spaces are allowed",
        },
          ]}
        >
          <Input
            placeholder="Spoke"
            bordered={false}
            style={{ fontSize: 13 }}
          />
        </Form.Item>
      </div>
    </Form.Item>

    {/* ===== Type ===== */}
    <Form.Item
      label={
        <span style={{ fontSize: 13, fontWeight: 590, color: "#2E2E2E" }}>
          <span style={{ color: "#B60554" }}>*</span> Type
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
          name="noteType"
          noStyle
          rules={[{ required: true, message: "Type is required" }]}
        >
          <Select
            bordered={false}
            placeholder="Select Type"
            options={[
              { value: "CALL", label: "Call" },
              { value: "EMAIL", label: "Email" },
              { value: "MESSAGE", label: "Message" },
            ]}
          />
        </Form.Item>
      </div>
    </Form.Item>

    {/* ===== Time ===== */}
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


    {/* ===== Description ===== */}
    <Form.Item
      label={
        <span style={{ fontSize: 13, fontWeight: 590, color: "#2E2E2E" }}>
          <span style={{ color: "#B60554" }}>*</span> Description
        </span>
      }
      required
    >
      <div
        style={{
          border: "1px solid #5C5C5C",
          borderRadius: 8,
          padding: 8,
        }}
      >
        <Form.Item name="description" noStyle
         rules={[
        { required: true, message: "Description is required" },
        {
          pattern: /^[A-Za-z0-9 ,./()\[\]{}]+$/,
          message:
            "Only letters, numbers, spaces, and , . / ( ) [ ] { } are allowed",
        },
      ]}>
          <Input.TextArea
            rows={3}
            placeholder="Note Description"
            bordered={false}
            style={{ fontSize: 13 }}
          />
        </Form.Item>
      </div>
    </Form.Item>

  </Form>
</Modal>


  );
};

export default AddNoteModal;
