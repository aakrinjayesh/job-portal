import React from "react";
import { Input } from "antd";

function InputBox({ placeholder, type = "text", ...rest }) {
  if (type === "password") {
    return <Input.Password placeholder={placeholder} {...rest} />;
  }
  return <Input placeholder={placeholder} {...rest} />;
}

export default InputBox;
