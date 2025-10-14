import React, { useRef, useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Divider, Input, Select, Space, message } from "antd";

const ReusableSelect = ({
  value,
  onChange,
  placeholder = "Select items",
  fetchFunction,
  addFunction,
  disabled = false,
  style = { width: "100%" },
  className = "",
  single = true,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  // Fetch items on component mount
  useEffect(() => {
    const fetchItems = async () => {
      if (!fetchFunction) return;

      setLoading(true);
      try {
        const response = await fetchFunction();
        if (response.status === "success" && response.data) {
          setItems(response.data);
        }
      } catch (error) {
        message.error("Failed to load items");
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [fetchFunction]);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const addItem = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      message.warning("Please enter a value");
      return;
    }

    if (!addFunction) {
      message.error("Add function not provided");
      return;
    }

    setAddLoading(true);
    try {
      const response = await addFunction({ name: name.trim() });

      if (response.status === "success") {
        const newItem = {
          id: response.id,
          name: name.trim(),
          isVerified: false,
        };

        setItems([...items, newItem]);
        setName("");
        message.success("Item added successfully");

        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    } catch (error) {
      message.error("Failed to add item");
      console.error("Error adding item:", error);
    } finally {
      setAddLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addItem(e);
    }
  };

  const onSelectChange = (value) => {
    onChange(value);
  };

  return (
    <Select
      mode={single === false && "multiple"}
      style={style}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={onSelectChange}
      disabled={disabled}
      loading={loading}
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      popupRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: "8px 0" }} />
          <Space style={{ padding: "0 8px 4px", width: "100%" }}>
            <Input
              placeholder="Add new item"
              ref={inputRef}
              value={name}
              onChange={onNameChange}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyPress={handleKeyPress}
              disabled={addLoading}
              style={{ flex: 1 }}
            />
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={addItem}
              loading={addLoading}
            >
              Add
            </Button>
          </Space>
        </>
      )}
      options={items.map((item) => ({
        label: item.name,
        value: item.name,
      }))}
    />
  );
};

export default ReusableSelect;
