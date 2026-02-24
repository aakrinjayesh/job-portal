import React, { useEffect, useState } from "react";
import { Form, Input, Select, Row, Col } from "antd";
import { GetCountries } from "../../api/api";

const { Option } = Select;

const Address = ({ form, editable }) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  // ==============================
  // Load Countries
  // ==============================
  useEffect(() => {
    if (!editable) return;

    async function loadCountries() {
      try {
        const res = await GetCountries();
        setCountries(res.data || []);

        // 🔥 PRELOAD STATES FOR SAVED COUNTRY
        const savedCountryCode = form.getFieldValue("country");
        if (savedCountryCode) {
          const countryObj = res.data.find((c) => c.code === savedCountryCode);
          setStates(countryObj?.states || []);
        }
      } catch (err) {
        console.error("Countries fetch failed:", err);
      }
    }

    loadCountries();
  }, [editable]);

  // ==============================
  // Handle Country Change
  // ==============================
  const handleCountryChange = (value) => {
    form.setFieldsValue({ state: undefined });
    const countryObj = countries.find((c) => c.code === value);
    setStates(countryObj?.states || []);
  };

  return (
    <>
      <h3>Company Address</h3>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Building Number"
            name="doorNumber"
            rules={[
              // { required: editable },
              {
                pattern: /^[A-Za-z0-9]+([/-]?[A-Za-z0-9]+)*$/,
                message:
                  "Building number can contain letters, numbers, slash (/) or hyphen (-)",
              },
              { min: 1, message: "Building number is required" },
              {
                max: 10,
                message: "Building number cannot exceed 10 characters",
              },
            ]}
          >
            <Input disabled={!editable} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Street"
            name="street"
            rules={[
              // { required: editable },
              {
                pattern: /^[A-Z][A-Za-z0-9 ./-]*$/,
                message:
                  "Street name must start with a capital letter and contain only letters, numbers, spaces, . / -",
              },
              { min: 3, message: "Street name must be at least 3 characters" },
              { max: 50, message: "Street name cannot exceed 50 characters" },
            ]}
          >
            <Input disabled={!editable} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="City"
            name="city"
            rules={[
              // { required: editable },
              {
                pattern: /^[A-Z][A-Za-z.-]*(?:\s[A-Za-z.-]+)*$/,
                message:
                  "City name must start with a capital letter and contain only letters, spaces, dots, or hyphens",
              },
              { min: 2, message: "City name must be at least 2 characters" },
              { max: 40, message: "City name cannot exceed 40 characters" },
            ]}
          >
            <Input disabled={!editable} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Pin Code"
            name="pinCode"
            rules={[
              // { required: editable },
              { pattern: /^[0-9]{6}$/, message: "Invalid pin code" },
            ]}
          >
            <Input disabled={!editable} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Country"
            name="country"
            // rules={[{ required: editable }]}
          >
            <Select
              disabled={!editable}
              placeholder="Select Country"
              onChange={handleCountryChange}
            >
              {countries.map((c) => (
                <Option key={c.code} value={c.code}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="State"
            name="state"
            // rules={[{ required: editable }]}
          >
            <Select
              disabled={!editable || states.length === 0}
              placeholder="Select State"
            >
              {states.map((s) => (
                <Option key={s.code} value={s.code}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default Address;
