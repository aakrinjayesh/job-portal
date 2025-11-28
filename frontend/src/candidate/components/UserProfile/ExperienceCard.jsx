import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  DatePicker,
  Input,
  Space,
  List,
  Typography,
  Popconfirm,
  message,
  Row,
  Col,
  Select,
  Divider,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const ExperienceCard = ({
  title = "Experience",
  apidata,
  onExperienceChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [experiences, setExperiences] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    if (apidata && Array.isArray(apidata)) {
      setExperiences(apidata);
    }
  }, [apidata]);

  const openModal = (index = null) => {
    setEditingIndex(index);
    if (index !== null) {
      console.log("if edit");
      const exp = experiences[index];
      console.log("exp", exp);

      // Use setTimeout to ensure form is ready
      setTimeout(() => {
        form.setFieldsValue({
          dateRange: [dayjs(exp.startDate), dayjs(exp.endDate)],
          payrollCompanyName: exp.payrollCompanyName,
          role: exp.role,


          projects: exp.projects.map((p) => ({
            projectName: p.projectName,
            cloudUsed: p.cloudUsed,
            skillsUsed: p.skillsUsed,
            rolesAndResponsibilities: p.rolesAndResponsibilities,
            projectDescription: p.projectDescription,
          })),
        });
      }, 0);
    } else {
      console.log("else field - adding new");
      form.resetFields();
      // Initialize with one empty project
      form.setFieldsValue({
        projects: [
          {
            projectName: "",
            cloudUsed: undefined,
            skillsUsed: [],
            rolesAndResponsibilities: "",
            projectDescription: "",
          },
        ],
      });
    }
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("values", values);
      const { dateRange, payrollCompanyName, 
        role,
        
         projects } = values;

      const newExperience = {
        // startDate: dateRange[0].format("YYYY-MM"),
        // endDate: dateRange[1].format("YYYY-MM"),
         startDate: dateRange[0].format("MM-YYYY"),
  endDate: dateRange[1].format("MM-YYYY"),
        payrollCompanyName: payrollCompanyName || "",
        role: role || "",
        
        projects: (projects || []).map((p) => ({
          projectName: p.projectName || "",
          cloudUsed: p.cloudUsed || "",
          skillsUsed: p.skillsUsed || [],
          rolesAndResponsibilities: p.rolesAndResponsibilities || "",
          projectDescription: p.projectDescription || "",
        })),
      };

      let updated = [...experiences];
      if (editingIndex !== null) {
        updated[editingIndex] = newExperience;
        message.success("Experience updated!");
      } else {
        updated.push(newExperience);
        message.success("Experience added!");
      }

      setExperiences(updated);
      setIsModalOpen(false);
      setEditingIndex(null);
      form.resetFields();

      if (onExperienceChange) onExperienceChange(updated);
    } catch (err) {
      console.error("Validation error:", err);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
    form.resetFields();
  };

  const handleDelete = (index) => {
    const updated = experiences.filter((_, i) => i !== index);
    setExperiences(updated);
    message.success("Experience deleted!");
    if (onExperienceChange) onExperienceChange(updated);
  };

  return (
    <Card
      title={title}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Add {title}
        </Button>
      }
      style={{ height: 350, overflowY: "auto", scrollbarWidth: "none" }}
    >
      {experiences.length > 0 ? (
        <List
          dataSource={experiences}
          renderItem={(item, index) => (
            <>
              <List.Item
                style={{
                  borderLeft: "4px solid #1677ff",
                  paddingLeft: 16,
                  background: "#fafafa",
                  borderRadius: 8,
                  marginBottom: 16,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
                actions={[
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => openModal(index)}
                  />,
                  <Popconfirm
                    title="Are you sure to delete this experience?"
                    onConfirm={() => handleDelete(index)}
                  >
                    <Button type="link" danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <>
                      <div>
                        {item.startDate} - {item.endDate}
                      </div>
                      {/* <div>
                        <Text strong>Company:</Text>{" "}
                        {item.payrollCompanyName || "-"} &nbsp;|&nbsp;{" "}
                        <Text strong>Role:</Text> {item.role || "-"}
                      </div> */}
                      <div style={{ marginTop: 4 }}>
  <div>
    <Text strong>Company:</Text> {item.payrollCompanyName || "-"}
  </div>
  <div>
    <Text strong>Role:</Text> {item.role || "-"}
  </div>
</div>

                    </>
                  }
                  description={
                    <div>
                      {(item.projects || []).map((p, i) => (
                        <div key={i} style={{ marginTop: 8 }}>
                          {/* <div>
                            <Text strong>Project:</Text> {p.projectName || "-"}{" "}
                            {p.cloudUsed ? `| Cloud: ${p.cloudUsed}` : ""}
                          </div> */}

                          <div style={{ marginTop: 6 }}>
  <div>
    <Text strong>Project:</Text> {p.projectName || "-"}
  </div>
  {p.cloudUsed && (
    <div>
      <Text strong>Cloud:</Text>{" "}
      {Array.isArray(p.cloudUsed)
        ? p.cloudUsed.join(", ")
        : p.cloudUsed}
    </div>
  )}
</div>


                          <div>
                            <Text strong>Skills:</Text>{" "}
                            {(p.skillsUsed || []).join(", ") || "-"}
                          </div>

                          <div style={{ marginTop: 6 }}>
                            <Text strong>Roles & Responsibilities:</Text>
                            <div style={{ whiteSpace: "pre-wrap" }}>
                              {p.rolesAndResponsibilities || "-"}
                            </div>
                          </div>

                          <div style={{ marginTop: 6 }}>
                            <Text strong>Project Description:</Text>
                            <div style={{ whiteSpace: "pre-wrap" }}>
                              {p.projectDescription || "-"}
                            </div>
                          </div>

                          {i !== (item.projects || []).length - 1 && (
                            <Divider />
                          )}
                        </div>
                      ))}
                    </div>
                  }
                />
              </List.Item>
            </>
          )}
        />
      ) : (
        <Text type="secondary">No experience added yet.</Text>
      )}

      <Modal
        title={editingIndex !== null ? "Edit Experience" : "Add Experience"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleOk}
        okText={editingIndex !== null ? "Update" : "Add"}
        width={900}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="Date Range"
                rules={[
                  { required: true, message: "Please select date range" },
                ]}
              >
                <RangePicker
                  picker="month"
                  format="MMM YYYY"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                name="payrollCompanyName"
                label="Payroll Company"
                rules={[{ required: true, message: "Enter company" },
    //                 {
    //  pattern: /^[A-Za-z0-9 .,'/-]+$/,
    //   message: "Only letters, numbers, are allowed!",
    // },
                ]}
              >
                <Input placeholder="e.g. TCS" />
              </Form.Item>
            </Col>
            
    <Col span={7}>
  <Form.Item
  name="role"
  label="Role"
  rules={[{ required: true, message: "Enter role" },
                    {
      pattern: /^[A-Za-z0-9 ]+$/,
      message: "Only letters, numbers, are allowed!",
     },
  ]}
>
  <Select
    mode="tags"
    maxTagCount={1}
    placeholder="Select or type a role"
    showSearch
    allowClear
    onChange={(values) => {
      // Allow only one role
      if (Array.isArray(values) && values.length > 1) {
        values.splice(0, values.length - 1); // Keep latest only
      }
    }}
  >
    <Select.Option value="Salesforce Developer">Salesforce Developer</Select.Option>
    <Select.Option value="Salesforce Administrator">Salesforce Administrator</Select.Option>
    <Select.Option value="Salesforce Consultant">Salesforce Consultant</Select.Option>
    <Select.Option value="Salesforce Architect">Salesforce Architect</Select.Option>
    <Select.Option value="LWC Developer">LWC Developer</Select.Option>
    <Select.Option value="Apex Developer">Apex Developer</Select.Option>
    <Select.Option value="Integration Developer">Integration Developer</Select.Option>
  </Select>
</Form.Item>

</Col>




          </Row>

          <Divider />

          <Form.List name="projects">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, idx) => (
                  <div
                    key={key}
                    style={{
                      padding: 12,
                      border: "1px solid #f0f0f0",
                      borderRadius: 6,
                      marginBottom: 12,
                    }}
                  >
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "projectName"]}
                          label={`Project Name ${idx + 1}`}
                          rules={[
                            { 
                              required: true, 
                              message: "Enter project name" },
                               {
      pattern: /^[A-Za-z ]+$/,
      message: "Only letters, numbers, are allowed!",
     },
                          ]}
                        >
                          <Input placeholder="Project name" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "cloudUsed"]}
                          label="Cloud Used"
                        >
                          <Select
                            showSearch
                            placeholder="e.g. AWS"
                            mode="multiple"
                            allowClear
                            options={[
                              { value: "AWS" },
                              { value: "Azure" },
                              { value: "GCP" },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "skillsUsed"]}
                          label="Skills Used"
                          rules={[
                            {
                              required: true,
                              message: "Add at least one skill",
                            },
                          ]}
                        >
                          <Select
                            mode="tags"
                            placeholder="Add skills (type and press enter)"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "projectDescription"]}
                          label="Project Description"
                          rules={[
                            {
                              // required: true,
                              message: "Add project description",
                            },
                          ]}
                        >
                          <TextArea
                            rows={4}
                            maxLength={1000}
                            showCount
                            placeholder="Project description (max 1000 chars)"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "rolesAndResponsibilities"]}
                          label="Roles & Responsibilities"
                          rules={[
                            {
                              // required: true,
                              message: "Add roles & responsibilities",
                            },
                          ]}
                        >
                          <TextArea
                            rows={4}
                            maxLength={1000}
                            showCount
                            placeholder="Describe roles & responsibilities (max 1000 chars)"
                          />
                        </Form.Item>
                      </Col>
                      {/* <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "projectDescription"]}
                          label="Project Description"
                          rules={[
                            {
                              // required: true,
                              message: "Add project description",
                            },
                          ]}
                        >
                          <TextArea
                            rows={4}
                            maxLength={1000}
                            showCount
                            placeholder="Project description (max 1000 chars)"
                          />
                        </Form.Item>
                      </Col> */}
                    </Row>

                    <div style={{ textAlign: "right" }}>
                      {fields.length > 1 && (
                        <Button type="link" danger onClick={() => remove(name)}>
                          Remove project
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Form.Item>
                  {/* <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Project
                  </Button> */}

                  <Button
  type="dashed"
  onClick={() => {
    if (fields.length >= 10) {
      message.error("You can add up to 10 projects only!");
      return;
    }
    add();
  }}
  block
  icon={<PlusOutlined />}
>
  Add Project
</Button>

                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Card>
  );
};

export default ExperienceCard;
