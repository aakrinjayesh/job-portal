import React from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { CreateActivity } from "../../api/api";

const AddNoteModal = ({ open, onClose, candidateId, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      console.log("AddNoteModal candidateId:", candidateId);

      if (!candidateId) {
        message.error("Candidate not found");
        return;
      }

      const values = await form.validateFields();

      await CreateActivity({
        candidateId,
        category: "NOTE",
        note: {
          subject: values.subject,
          noteType: values.noteType,
          description: values.description,
          interactedAt: new Date().toISOString(),
        },
      });

      message.success("Note added successfully");
    //   form.resetFields();
    //   onSuccess();
    //   onClose();
    form.resetFields();
onClose();
onSuccess();

    } catch (error) {
      message.error("Failed to add note");
    }
  };

  return (
  
    <Modal
  title="Add Note"
  open={open}
  onOk={() => form.submit()}
  onCancel={() => {
    form.resetFields();
    onClose();
  }}
  destroyOnClose
>
  <Form
    layout="vertical"
    form={form}
    onFinish={handleSubmit}
  >

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
