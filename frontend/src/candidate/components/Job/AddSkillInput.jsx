import React, { useState } from "react";
import { Input, Tag, AutoComplete } from "antd";

const AddSkillInput = ({ label, values, onChange, suggestions = [] }) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  // Validation pattern
  const pattern = /^[A-Za-z][A-Za-z0-9./\-\s]*$/; // only letters + dot + space

  const validate = (val) => {
    if (!pattern.test(val)) {
      setError("Only letters,numbers,dot,space,hypen,slash are allowed");
      return false;
    }
    setError("");
    return true;
  };

  const addValue = () => {
    const newValue = inputValue.trim();
    if (!newValue) return;

    if (!validate(newValue)) return;

    if (!values.includes(newValue)) {
      onChange([...values, newValue]);
    }

    setInputValue("");
  };

  const options = suggestions.map((s) => ({ value: s }));

  return (
    <div>
      <p style={{ marginBottom: 6, fontWeight: 600 }}>{label}</p>

      <AutoComplete
        style={{ width: "100%" }}
        options={options}
        value={inputValue}
        onChange={(val) => {
          setInputValue(val);
          validate(val); // live validation
        }}
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
          status={error ? "error" : ""}     // ⭐ RED BORDER
        />
      </AutoComplete>

      {/* ⭐ AntD-style helper text */}
      {error && (
        <div
          style={{
            color: "red",
            fontSize: 12,
            marginTop: 3,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        {values.map((item, index) => (
          <Tag
            key={index}
            closable
            onClose={() => onChange(values.filter((v) => v !== item))}
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
