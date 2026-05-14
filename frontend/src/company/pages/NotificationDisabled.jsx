import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const NotificationDisabled = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Result
        status="success"
        title="Job notification disabled"
        subTitle="You will no longer receive emails for this job."
        extra={[
          <Button type="primary" onClick={() => navigate("/company/settings")}>
            Go To Settings
          </Button>,
        ]}
      />
    </div>
  );
};
export default NotificationDisabled;
