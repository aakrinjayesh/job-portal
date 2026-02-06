// import React, { useEffect, useState } from "react";
// import { List, Input, Button, Popconfirm, Switch, message } from "antd";

// import {
//   GetAllTodoTemplates,
//   CreateTodoTemplate,
//   EditTodoTemplate,
//   DeleteTodoTemplate,
//   ToggleTodoTemplate,
// } from "../api/api"; // 👈 SAME API FILE

// const SettingsTodoManager = () => {
//   const [todos, setTodos] = useState([]);
//   const [newTitle, setNewTitle] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [editingTitle, setEditingTitle] = useState("");

//   const loadTodos = async () => {
//     const res = await GetAllTodoTemplates();
//     if (res.status === "success") {
//       setTodos(res.data);
//     }
//   };

//   useEffect(() => {
//     loadTodos();
//   }, []);

//   const createTodo = async () => {
//     if (!newTitle.trim()) return;
//     await CreateTodoTemplate({ title: newTitle });
//     message.success("Todo created");
//     setNewTitle("");
//     loadTodos();
//   };

//   const saveEdit = async (id) => {
//     await EditTodoTemplate({ id, title: editingTitle });
//     message.success("Todo updated");
//     setEditingId(null);
//     loadTodos();
//   };

//   const deleteTodo = async (id) => {
//     await DeleteTodoTemplate({ id });
//     message.success("Todo deleted");
//     loadTodos();
//   };

//   const toggleActive = async (id, isActive) => {
//     await ToggleTodoTemplate({ id, isActive });
//     loadTodos();
//   };

//   return (
//     <>
//       <h3>Todo Templates</h3>

//       <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
//         <Input
//           placeholder="New todo title"
//           value={newTitle}
//           onChange={(e) => setNewTitle(e.target.value)}
//         />
//         <Button type="primary" onClick={createTodo}>
//           Add
//         </Button>
//       </div>

//       <List
//         dataSource={todos}
//         renderItem={(item) => (
//           <List.Item
//             actions={[
//               <Switch
//                 checked={item.isActive}
//                 onChange={(val) => toggleActive(item.id, val)}
//               />,
//               editingId === item.id ? (
//                 <Button onClick={() => saveEdit(item.id)}>Save</Button>
//               ) : (
//                 <Button
//                   onClick={() => {
//                     setEditingId(item.id);
//                     setEditingTitle(item.title);
//                   }}
//                 >
//                   Edit
//                 </Button>
//               ),
//               <Popconfirm
//                 title="Delete todo?"
//                 onConfirm={() => deleteTodo(item.id)}
//               >
//                 <Button danger>Delete</Button>
//               </Popconfirm>,
//             ]}
//           >
//             {editingId === item.id ? (
//               <Input
//                 value={editingTitle}
//                 onChange={(e) => setEditingTitle(e.target.value)}
//               />
//             ) : (
//               item.title
//             )}
//           </List.Item>
//         )}
//       />
//     </>
//   );
// };

// export default SettingsTodoManager;

import React, { useEffect, useState } from "react";
import {
  List,
  Input,
  Button,
  Popconfirm,
  Switch,
  message,
  Card,
  Typography,
  Space,
  Empty,
  Tooltip,
  Badge,
  Spin,
  ConfigProvider,
  Form
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  UnorderedListOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

import {
  GetAllTodoTemplates,
  CreateTodoTemplate,
  EditTodoTemplate,
  DeleteTodoTemplate,
  ToggleTodoTemplate,
} from "../api/api";

const { Title, Text } = Typography;

const gradientPrimary = "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)";
const gradientHover = "linear-gradient(135deg, #60a5fa 0%, #8b5cf6 100%)";

const cardStyle = {
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
};

const SettingsTodoManager = () => {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const loadTodos = async () => {
    setLoading(true);
    const res = await GetAllTodoTemplates();
    if (res.status === "success") setTodos(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const createTodo = async () => {
    if (!newTitle.trim()) {
      message.warning("Please enter a todo title");
      return;
    }
    setCreating(true);
    await CreateTodoTemplate({ title: newTitle });
    message.success({
      content: "Todo template created!",
      icon: <ThunderboltOutlined style={{ color: "#22c55e" }} />,
    });
    setNewTitle("");
    await loadTodos();
    setCreating(false);
  };

  const saveEdit = async (id) => {
    if (!editingTitle.trim()) return;
    setSavingId(id);
    await EditTodoTemplate({ id, title: editingTitle });
    message.success("Todo updated");
    setEditingId(null);
    setSavingId(null);
    loadTodos();
  };

  const deleteTodo = async (id) => {
    await DeleteTodoTemplate({ id });
    message.success("Todo deleted");
    loadTodos();
  };

  const toggleActive = async (id, isActive) => {
    await ToggleTodoTemplate({ id, isActive });
    loadTodos();
  };

  const activeCount = todos.filter((t) => t.isActive).length;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#3b82f6",
          borderRadius: 12,
        },
      }}
    >
      <div
        style={{
          minHeight: "100vh",
          background: "#f1f5f9",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 32, display: "flex", gap: 16 }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Todo Templates
              </Title>
              <Text type="secondary">Manage reusable task templates</Text>
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {[
              { label: "Total", value: todos.length, color: "#3b82f6" },
              { label: "Active", value: activeCount, color: "#22c55e" },
              {
                label: "Inactive",
                value: todos.length - activeCount,
                color: "#64748b",
              },
            ].map((stat) => (
              <Card key={stat.label} style={cardStyle}>
                <Text type="secondary">{stat.label}</Text>
                <Title level={3} style={{ margin: 0, color: stat.color }}>
                  {stat.value}
                </Title>
              </Card>
            ))}
          </div>

          {/* Create */}
      <Card style={{ ...cardStyle, marginBottom: 24 }}>
  <Form
    layout="inline"
    style={{ width: "100%" }}
    onFinish={async (values) => {
      setCreating(true);
      await CreateTodoTemplate({ title: values.title.trim() });
      message.success({
        content: "Todo template created!",
        icon: <ThunderboltOutlined style={{ color: "#22c55e" }} />,
      });
      setCreating(false);
      loadTodos();
    }}
  >
    <Form.Item
      name="title"
      style={{ flex: 1 }}
      rules={[
        {
          required: true,
          message: "Todo title is required",
        },
        {
          pattern: /^[A-Za-z ]+$/,
          message: "Only letters and spaces are allowed",
        },
        {
          validator: (_, value) =>
            value?.trim()
              ? Promise.resolve()
              : Promise.reject("Title cannot be empty"),
        },
      ]}
    >
      <Input
        placeholder="New todo template"
        size="large"
        onPressEnter={(e) => e.preventDefault()}
      />
    </Form.Item>

    <Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        loading={creating}
        icon={<PlusOutlined />}
        size="large"
        style={{
          backgroundColor: "#1677FF",
          border: "none",
          boxShadow: "0 6px 18px rgba(59,130,246,.35)",
        }}
      >
        Add
      </Button>
    </Form.Item>
  </Form>
</Card>


          {/* List */}
          <Card style={cardStyle}>
            <Spin spinning={loading}>
              {todos.length === 0 ? (
                <Empty description="No templates yet" />
              ) : (
                <List
                  dataSource={todos}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        marginBottom: 8,
                        opacity: item.isActive ? 1 : 0.6,
                        padding: "12px 16px",
                      }}
                      actions={[
                        <Switch
                          checked={item.isActive}
                          onChange={(v) => toggleActive(item.id, v)}
                        />,
                        editingId === item.id ? (
                          <Space>
                            <Button
                              type="primary"
                              icon={<CheckOutlined />}
                              loading={savingId === item.id}
                              onClick={() => saveEdit(item.id)}
                            />
                            <Button
                              icon={<CloseOutlined />}
                              onClick={() => setEditingId(null)}
                            />
                          </Space>
                        ) : (
                          <Button
                            icon={<EditOutlined />}
                            onClick={() => {
                              setEditingId(item.id);
                              setEditingTitle(item.title);
                            }}
                          />
                        ),
                        <Popconfirm
                          title="Delete?"
                          onConfirm={() => deleteTodo(item.id)}
                        >
                          <Button danger icon={<DeleteOutlined />} />
                        </Popconfirm>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge
                            status={item.isActive ? "success" : "default"}
                          />
                        }
                        title={
                          editingId === item.id ? (
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onPressEnter={() => saveEdit(item.id)}
                            />
                          ) : (
                            <Text>{item.title}</Text>
                          )
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Created{" "}
                            {new Date(item.createdAt).toLocaleDateString()}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Spin>
          </Card>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default SettingsTodoManager;
