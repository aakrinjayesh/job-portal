import React, { useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  message,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { UpdateCandidateDomains, GetUserProfile } from "../api/api";

const { Title, Text } = Typography;
const res = await GetUserProfile();
console.log("API response:", res?.data?.user); // 👈 check what hiddenDomains actually looks like

function Settings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);
  useEffect(() => {
    const loadDomains = async () => {
      const res = await GetUserProfile();

      // ✅ correct path is res.user NOT res.data.user
      const domains = res?.user?.hiddenDomains || [];

      console.log("domains found:", domains); // verify

      if (domains.length > 0) {
        // form.setFieldsValue({
        //   domains: domains.map((d) => `user@${d}`),
        // });
        form.setFieldsValue({
          domains: domains,
        });
        setHasValue(true);
      } else {
        form.setFieldsValue({ domains: [""] });
      }
    };

    loadDomains();
  }, [form]);

  const onFinish = async (values) => {
    try {
      setLoading(true); // start loader

      const emails = values.domains || [];

      // const domains = emails.map((email) => {
      //   const parts = email.split("@");
      //   return parts[1]?.toLowerCase().trim();
      // });
      const domains = emails.map((d) => d.toLowerCase().trim());

      const payload = {
        hiddenDomains: domains,
      };

      await UpdateCandidateDomains(payload);

      message.success("Company emails saved successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to save");
    } finally {
      setLoading(false); // stop loader
    }
  };

  return (
    <Card style={{ maxWidth: 700, borderRadius: 12 }}>
      {/* Title + Eye Tooltip */}
      <Space align="center" style={{ marginBottom: 10 }}>
        <Title level={4} style={{ margin: 0 }}>
          Hide Profile From Company
        </Title>

        <Tooltip
          placement="right"
          title="If you enter a company domain name that matches a recruiter’s company domain name, your profile will not be visible to that company."
        >
          <InfoCircleOutlined
            style={{
              fontSize: 18,
              color: "#888",
              cursor: "pointer",
            }}
          />
        </Tooltip>
      </Space>

      {/* Helper text */}
      <Text type="secondary" style={{ fontSize: 12 }}></Text>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ domains: [""] }}
        onFinish={onFinish}
        onValuesChange={() => {
          const values = form.getFieldValue("domains") || [];
          setHasValue(values.some((v) => v));
        }}
        style={{ marginTop: 20 }}
      >
        <Form.List name="domains">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    label={name === 0 ? "Current Company Domain Name" : ""}
                  >
                    <Form.Item
                      {...restField}
                      name={name}
                      noStyle
                      rules={[
                        {
                          required: true,
                          message: "Enter company domain name",
                        },
                        { type: "email", message: "Enter valid domain name" },
                      ]}
                    >
                      <Input placeholder="example: company.com" />
                    </Form.Item>
                  </Form.Item>

                  <DeleteOutlined
                    onClick={async () => {
                      remove(name);

                      const values = form.getFieldsValue();
                      const emails = values.domains || [];

                      const domains = emails
                        .map((email) => email?.split("@")[1])
                        .filter(Boolean)
                        .map((d) => d.toLowerCase().trim());

                      await UpdateCandidateDomains({
                        hiddenDomains: domains,
                      });

                      message.success("Domain removed successfully");
                    }}
                    style={{ color: "red", fontSize: 16, cursor: "pointer" }}
                  />
                </Space>
              ))}

              {fields.length < 10 && (
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Company Email
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!hasValue}
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default Settings;
