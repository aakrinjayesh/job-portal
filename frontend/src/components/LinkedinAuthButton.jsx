import React from "react";
import { Button } from "antd";
import { LinkedinOutlined } from "@ant-design/icons";

function LinkedInAuthButton() {
  const linkedinRedirectUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${"861d00ja6sphsr"}&redirect_uri=${"https://www.linkedin.com/developers/tools/oauth/redirect"}&scope=r_liteprofile,r_emailaddress`;

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
