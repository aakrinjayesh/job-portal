import React from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { CreateActivity } from "../../api/api";
import { useState } from "react";

const AddNoteModal = ({ open, onClose, candidateId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // const handleSubmit = async () => {
  //   try {
  //     setLoading(true);

  //     if (!candidateId) {
  //       message.error("Candidate not found");
  //       return;
  //     }

  //     const values = await form.validateFields();

  //     const resp = await CreateActivity({
  //       candidateId,
  //       category: "NOTE",
  //       note: {
  //         subject: values.subject,
  //         noteType: values.noteType,
  //         description: values.description,
  //         interactedAt: new Date().toISOString(),
  //       },
  //     });

  //     if (resp.status === "success") {
  //       message.success("Note added successfully");
  //       form.resetFields();
  //       onClose();
  //       onSuccess();
  //     }
  //   } catch (error) {
  //     message.error("Failed to add note");
  //   } finally {
  //     setLoading(false); // ✅ always stop loading
  //   }
  // };

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
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          name="subject"
          label="Subject"
          rules={[{ required: true, message: "Subject is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="noteType"
          label="Type"
          rules={[{ required: true, message: "Type is required" }]}
        >
          <Select
            options={[
              { value: "CALL", label: "Call" },
              { value: "EMAIL", label: "Email" },
              { value: "MESSAGE", label: "Message" },
            ]}
          />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddNoteModal;
