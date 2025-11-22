import React from "react";
import { Modal, Form, Input, DatePicker, TimePicker, Button } from "antd";

const EventModal = ({ open, onClose, onSubmit, selectedDate }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    const start = values.date.set({
      hour: values.time[0].hour(),
      minute: values.time[0].minute(),
    });

    const end = values.date.set({
      hour: values.time[1].hour(),
      minute: values.time[1].minute(),
    });

    onSubmit({
      title: values.title,
      start: start.toISOString(),
      end: end.toISOString(),
    });

    form.resetFields();
  };

  return (
    <Modal
      title="Create Event"
      open={open}
      footer={null}
      onCancel={onClose}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Event Title"
          name="title"
          rules={[{ required: true, message: "Please enter title" }]}
        >
          <Input placeholder="Meeting / Task / Reminder" />
        </Form.Item>

        <Form.Item
          label="Date"
          name="date"
          initialValue={selectedDate}
          rules={[{ required: true }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item
          label="Start & End Time"
          name="time"
          rules={[{ required: true }]}
        >
          <TimePicker.RangePicker className="w-full" format="HH:mm" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Create Event
        </Button>
      </Form>
    </Modal>
  );
};

export default EventModal;
