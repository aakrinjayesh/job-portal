import React from "react";
import { Button } from "antd";
import { LinkedinOutlined } from "@ant-design/icons";

function LinkedInAuthButton() {
  const linkedinRedirectUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
    import.meta.env.VITE_LinkedIN_CLIENTID
  }&redirect_uri=${
    import.meta.env.VITE_REDIRECT_URI
  }&scope=r_liteprofile,r_emailaddress`;

  return (
    <Button
      icon={<LinkedinOutlined />}
      size="large"
      style={{ flex: 1 }}
      onClick={() => (window.location.href = linkedinRedirectUrl)}
    >
      LinkedIn
    </Button>
  );
}

export default LinkedInAuthButton;
