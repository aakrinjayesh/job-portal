import { useState } from "react";
import { Button, message, Tooltip } from "antd";
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { EnrollCourse } from "../api/courseApi.js";

const EnrollButton = ({ course, isEnrolled = false, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const basePath = user?.role === "company" ? "/company" : "/candidate";

  const handleEnroll = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.warning("Please login to enroll");
      navigate("/login");
      return;
    }

    if (isEnrolled) {
      // navigate(`/candidate/courses/player/${course.id}`);
      navigate(`${basePath}/courses/player/${course.id}`);
      return;
    }

    if (!course.isFree) {
      message.info("Payment coming soon. This is a paid course.");
      return;
    }

    setLoading(true);
    try {
      await EnrollCourse(course.id);
      message.success("Enrolled successfully!");
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message || "Enrollment failed";
      if (msg === "Already enrolled") {
        // navigate(`/candidate/courses/player/${course.id}`);
        navigate(`${basePath}/courses/player/${course.id}`);
      } else {
        message.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isEnrolled) {
    return (
      <Button
        type="primary"
        size="large"
        icon={<PlayCircleOutlined />}
        onClick={handleEnroll}
        style={{ width: "100%", height: 48, fontWeight: 600 }}
      >
        Go to Course
      </Button>
    );
  }

  if (!course.isFree) {
    return (
      <Tooltip title="Payment coming soon">
        <Button
          type="primary"
          size="large"
          icon={<LockOutlined />}
          disabled
          style={{ width: "100%", height: 48, fontWeight: 600 }}
        >
          Enroll — ₹{(course.price / 100).toFixed(0)}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button
      type="primary"
      size="large"
      icon={<CheckCircleOutlined />}
      loading={loading}
      onClick={handleEnroll}
      style={{
        width: "100%",
        height: 48,
        fontWeight: 600,
        background: "#52c41a",
        borderColor: "#52c41a",
      }}
    >
      Enroll for Free
    </Button>
  );
};

export default EnrollButton;
