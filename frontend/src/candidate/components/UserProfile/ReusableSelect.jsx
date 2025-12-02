import React, { useRef, useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Divider, Input, Select, Space, message ,Typography} from "antd";

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
  const [messageAPI, contextHolder] = message.useMessage();
  const inputRef = useRef(null);
  const { Text } = Typography;
const [error, setError] = useState(""); 

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
        messageAPI.error("Failed to load items");
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // const onNameChange = (event) => {
  //   setName(event.target.value);
  // };

  const onNameChange = (event) => {
  const val = event.target.value;

  // Allow only valid characters
  const regex = /^[A-Za-z][A-Za-z0-9 .,\/-]*$/;

 if (val === "" || regex.test(val)) {
      setName(val);
      // clear error as soon as input becomes valid
      if (error) setError("");
    } else {
      // do not update name if invalid char typed, but show inline error
      setError(
        "Special Characters Are Not Allowed!"
      );
    }
};


  const addItem = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      messageAPI.warning("Please enter a value");
      return;
    }

    // Allow A-Z, a-z, 0-9, space, dot, comma, hyphen, ampersand
    // const isValid = /^[A-Za-z0-9 .,&-]+$/.test(name.trim());

    // if (!isValid) {
    //   message.error(
    //     "Only letters, numbers, spaces, '.', ',', '-' and '&' are allowed!"
    //   );
    //   return;
    // }
      // ⭐ ADD THIS BLOCK HERE (VALIDATION)
  //     const trimmed = name.trim();

  // const isValid = /^[A-Za-z][A-Za-z0-9 .,\-\/]*$/.test(trimmed);

  // if (!isValid) {
  //   messageAPI.error(
  //     "Invalid format. Must start with a letter and can contain letters, numbers, space, '.', ',', '/', '-'"
  //   );
  //   return;
  // }

    if (!addFunction) {
      messageAPI.error("Add function not provided");
      return;
    }

    setAddLoading(true);
    try {
      const response = await addFunction({ name: name.trim() });
      const newItem = {
        id: response.id || Date.now(),
        name: name.trim(),
        isVerified: false,
      };

      setItems([...items, newItem]);
      setName("");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);

      if (response.status === "success") {
        messageAPI.success("Item added successfully");
      }
    } catch (error) {
      messageAPI.error("Failed to add item");
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
    <>
      {contextHolder}
      <Select
        mode={single === false && "multiple"}
        style={style}
        placement={"bottomRight"}
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

             {error ? (
              <div style={{ padding: "4px 12px 12px", width: "100%" }}>
                <Text type="danger">{error}</Text>
              </div>
            ) : null}
          </>
        )}
        options={items.map((item) => ({
          label: item.name,
          value: item.name,
        }))}
      />
    </>
  );
};

export default ReusableSelect;
