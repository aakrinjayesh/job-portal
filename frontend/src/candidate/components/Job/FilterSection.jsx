import React, { useState } from "react";
import { Checkbox, Space, Typography, Modal, Button } from "antd";

const { Text, Link } = Typography;

const FilterSection = ({ title, options = [], selected = [], onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState(selected);

  const handleModalOpen = () => {
    setTempSelected(selected);
    setIsModalOpen(true);
  };

  const handleApply = () => {
    onChange(tempSelected);
    setIsModalOpen(false);
  };

  const handleModalCancel = () => setIsModalOpen(false);

  return (
    <>
      <Checkbox.Group
        style={{ width: "100%" }}
        value={selected}
        onChange={(vals) => onChange(vals)}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {options.slice(0, 4).map((opt) => (
            <Checkbox key={opt.label} value={opt.label}>
              <Text>
                {opt.label}{" "}
                {/* <Text type="secondary" style={{ marginLeft: 4 }}>
                  ({opt.count})
                </Text> */}
              </Text>
            </Checkbox>
          ))}
        </Space>
      </Checkbox.Group>

      {/* View More link */}
      {options.length > 4 && (
        <Link
          style={{ display: "inline-block", marginTop: 8, color: "#1677ff" }}
          onClick={handleModalOpen}
        >
          View More
        </Link>
      )}

      {/* Modal for all options */}
     <Modal
  title="All Options"
  open={isModalOpen}
  onCancel={handleModalCancel}
  footer={null}
  bodyStyle={{ maxHeight: "400px", overflowY: "auto", paddingBottom: 60 }}
>
  <Checkbox.Group
    style={{ width: "100%" }}
    value={tempSelected}
    onChange={(vals) => setTempSelected(vals)}
  >
    <Space direction="vertical" style={{ width: "100%" }}>
      {options.map((opt) => (
        <Checkbox key={opt.label} value={opt.label}>
          <Text>
            {opt.label}{" "}
            <Text type="secondary" style={{ marginLeft: 4 }}>
              ({opt.count})
            </Text>
          </Text>
        </Checkbox>
      ))}
    </Space>
  </Checkbox.Group>

  {/* Fixed Footer */}
  <div
    style={{
      position: "sticky",
      bottom: 0,
      background: "#fff",
      padding: "12px 16px",
      borderTop: "1px solid #f0f0f0",
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      marginTop: 20,
    }}
  >
    <Button onClick={handleModalCancel}>Cancel</Button>
    <Button type="primary" onClick={handleApply}>
      Apply
    </Button>
  </div>
</Modal>
    </>
  );
};

export default FilterSection;
