import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  message,
  DatePicker,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import { CreateActivity } from "../../api/api";
import { useState } from "react";

const AddNoteModal = ({ open, onClose, candidateId, onSuccess, jobId }) => {
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
        candidateProfileId: candidateId,
        jobId: jobId || null,
        category: "NOTE",
        note: {
          subject: values.subject,
          noteType: values.noteType,
          description: values.description,
          interactedAt: new Date().toISOString(),
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
        requiredMark={false} // ✅ prevents duplicate red star
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
              rules={[
                { required: true, message: "Subject is required" },
                {
                  pattern: /^[A-Za-z0-9 ]+$/,
                  message: "Only letters, numbers, and spaces are allowed",
                },
                {
                  max: 30,
                  message: "Subject cannot exceed 30 characters",
                },
              ]}
            >
              <Input
                placeholder="Spoke"
                bordered={false}
                style={{ fontSize: 13 }}
                maxLength={30}
                showCount
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
              rules={[
                { required: true, message: "Time is required" },
                {
                  validator: (_, value) => {
                    if (!value || value.length !== 2) return Promise.resolve();

                    const [start, end] = value;
                    const now = dayjs();
                    const sixMonthsLater = dayjs().add(6, "month").endOf("day");

                    if (start.isBefore(now)) {
                      return Promise.reject(
                        new Error("Start time cannot be in the past")
                      );
                    }

                    if (end.isBefore(start)) {
                      return Promise.reject(
                        new Error("End time must be after start time")
                      );
                    }

                    if (end.isAfter(sixMonthsLater)) {
                      return Promise.reject(
                        new Error("Time must be within 6 months")
                      );
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              {/* <DatePicker.RangePicker
                bordered={false}
                showTime
                use12Hours
                format="DD MMM YYYY, h:mm a"
                style={{ width: "100%" }}
                disabledDate={(current) => {
                  if (!current) return false;

                  const today = dayjs().startOf("day");
                  const sixMonthsLater = dayjs().add(6, "month").endOf("day");

                  return (
                    current.isBefore(today) || current.isAfter(sixMonthsLater)
                  );
                }}
                disabledTime={(current) => {
                  if (!current) return {};

                  // ⛔ block past time for today
                  if (current.isSame(dayjs(), "day")) {
                    return {
                      disabledHours: () =>
                        Array.from({ length: dayjs().hour() }, (_, i) => i),
                      disabledMinutes: (hour) =>
                        hour === dayjs().hour()
                          ? Array.from(
                              { length: dayjs().minute() },
                              (_, i) => i
                            )
                          : [],
                    };
                  }

                  return {};
                }}
              /> */}

              <TimePicker.RangePicker
                bordered={false}
                use12Hours
                format="h:mm a"
                style={{ width: "100%" }}
                minuteStep={1}
                disabledTime={(date, type) => {
                  const now = dayjs();

                  // ⛔ block past time for today (only for start time)
                  if (type === "start") {
                    return {
                      disabledHours: () =>
                        Array.from({ length: now.hour() }, (_, i) => i),
                      disabledMinutes: (hour) =>
                        hour === now.hour()
                          ? Array.from({ length: now.minute() }, (_, i) => i)
                          : [],
                    };
                  }

                  return {};
                }}
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
            <Form.Item
              name="description"
              noStyle
              rules={[
                { required: true, message: "Description is required" },
                {
                  pattern: /^[A-Za-z0-9 ,./()\[\]{}\n]+$/,
                  message:
                    "Only letters, numbers, spaces, and , . / ( ) [ ] { } are allowed",
                },

                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    const wordCount = value
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean).length;

                    if (wordCount > 1000) {
                      return Promise.reject(
                        new Error("Maximum 1000 words allowed")
                      );
                    }

                    return Promise.resolve();
                  },
                },
                {
                  max: 1000,
                  message: "Description cannot exceed 1000 characters",
                },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Note Description"
                bordered={false}
                style={{ fontSize: 13 }}
                maxLength={1000} // ⬅ character limit
                showCount
              />
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddNoteModal;
