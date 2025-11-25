import React, { useState } from "react";
import { Input, Tag, AutoComplete } from "antd";

const AddSkillInput = ({ label, values, onChange, suggestions = [] }) => {
  const [inputValue, setInputValue] = useState("");

  const addValue = () => {
    if (!inputValue.trim()) return;

    const newValue = inputValue.trim();

    if (!values.includes(newValue)) {
      onChange([...values, newValue]);
    }
    setInputValue("");
  };

  const options = suggestions.map((s) => ({ value: s }));

  return (
    <div>
      <p style={{ marginBottom: 6, fontWeight: 600 }}>{label}</p>

      {/* AutoComplete for suggestions */}
      <AutoComplete
  style={{ width: "100%" }}
  options={options}
  value={inputValue}
  onChange={setInputValue}

  // ⭐ ADD THIS
  filterOption={(input, option) =>
    option.value.toLowerCase().includes(input.toLowerCase())
  }

  onSelect={(val) => {
    setInputValue(val);
    addValue();
  }}
>
  <Input
    placeholder={`Add ${label}`}
    onPressEnter={addValue}
  />
</AutoComplete>


      {/* Chips */}
      <div style={{ marginTop: 10 }}>
        {values.map((item, index) => (
          <Tag
            key={index}
            closable
            onClose={() =>
              onChange(values.filter((v) => v !== item))
            }
            style={{ marginBottom: 6 }}
          >
            {item}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default AddSkillInput;
