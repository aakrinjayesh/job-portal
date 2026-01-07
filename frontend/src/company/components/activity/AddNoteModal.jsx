import React from "react";
import { Modal, Form, Input, Select, message } from "antd";
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
          interactedAt: new Date().toISOString(),
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
    // <Modal
    //   title="Add Note"
    //   open={open}
    //   onOk={() => form.submit()}
    //   confirmLoading={loading}
    //   onCancel={() => {
    //     form.resetFields();
    //     onClose();
    //   }}
    //   destroyOnClose
    // >
    //   <Form layout="vertical" form={form} onFinish={handleSubmit}>
    //     <Form.Item
    //       name="subject"
    //       label="Subject"
    //       rules={[{ required: true, message: "Subject is required" }]}
    //     >
    //       <Input />
    //     </Form.Item>

    //     <Form.Item
    //       name="noteType"
    //       label="Type"
    //       rules={[{ required: true, message: "Type is required" }]}
    //     >
    //       <Select
    //         options={[
    //           { value: "CALL", label: "Call" },
    //           { value: "EMAIL", label: "Email" },
    //           { value: "MESSAGE", label: "Message" },
    //         ]}
    //       />
    //     </Form.Item>

    //     <Form.Item name="description" label="Description">
    //       <Input.TextArea rows={3} />
    //     </Form.Item>
    //   </Form>
    // </Modal>
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
          rules={[{ required: true, message: "Subject is required" }]}
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
        <Form.Item name="description" noStyle>
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
