import React, { useState } from "react";
import { Select } from "antd";

const AddSkillInput = ({ label, values, onChange, suggestions,
  placeholder = "Select options",  }) => {
  const [error, setError] = useState("");

  // Validation pattern
  const pattern = /^[A-Za-z][A-Za-z0-9./\-\s]*$/;

  const validateValues = (list) => {
    for (let item of list) {
      if (!pattern.test(item)) {
        setError(
          "Only letters, numbers, dot, space, hyphen and slash are allowed"
        );
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleChange = (selectedValues) => {
    if (!validateValues(selectedValues)) return;
    onChange(selectedValues);
  };

  return (
    <div>
      <p style={{ marginBottom: 6, fontWeight: 600 }}>{label}</p>

      <Select
        mode="multiple"
        allowClear
        maxTagCount={0}                 // hide tags
        maxTagPlaceholder={null}        // ⭐ hide "+ N" count
        showSearch
        style={{ width: "100%" }}
        placeholder={placeholder}
        value={values}
        onChange={handleChange}
        options={suggestions.map((s) => ({
          label: s,
          value: s,
        }))}
        filterOption={(input, option) =>
          option.label.toLowerCase().includes(input.toLowerCase())
        }
        status={error ? "error" : ""}
      />
      {values.length > 0 && (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10,
    }}
  >
    {values.map((item) => (
      <div
        key={item}
        style={{
          padding: "4px 10px",
          background: "#f5f5f5",
          borderRadius: 16,
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span>{item}</span>
        <span
          style={{
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onClick={() =>
            onChange(values.filter((v) => v !== item))
          }
        >
          ×
        </span>
      </div>
    ))}
  </div>
)}


      {error && (
        <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default AddSkillInput;
