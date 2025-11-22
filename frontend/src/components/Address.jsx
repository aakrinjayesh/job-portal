import React, { useEffect, useState } from "react";
import { Form, Input, Select, Row, Col } from "antd";
import { GetCountries, GetUserAddress } from "../company/api/api";

const { Option } = Select;

const Address = ({ form, editable }) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  // ==============================
  // Fetch Address on mount
  // ==============================
  useEffect(() => {
    async function loadAddress() {
      try {
        const res = await GetUserAddress();
        if (res?.data?.status === "success" && res.data.address) {
          const addr = res.data.address;
          // Set saved values in form (text inputs initially)
          form.setFieldsValue({
            doorNumber: addr.doorNumber,
            street: addr.street,
            city: addr.city,
            pinCode: addr.pinCode,
            country: addr.country,
            state: addr.state,
          });
        }
      } catch (err) {
        console.error("Address fetch failed:", err);
      }
    }
    loadAddress();
  }, [form]);

  // ==============================
  // Fetch Countries during edit mode
  // ==============================
  useEffect(() => {
    if (!editable) return;

    async function loadCountries() {
      try {
        const res = await GetCountries();
        console.log(res)
        setCountries(res.data || []);
        // Note: Do NOT populate states from saved country here
        // States will populate only when user selects a country
      } catch (err) {
        console.error("Countries fetch failed:", err);
      }
    }

    loadCountries();
  }, [editable]);

  // ==============================
  // Handle Country Selection
  // ==============================
  const handleCountryChange = (value) => {
    form.setFieldsValue({ state: undefined }); // reset state when country changes
    const countryObj = countries.find(c => c.code === value);
    setStates(countryObj?.states || []);
  };

  return (
    <>
      <h3>Company Address</h3>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Building Number" name="doorNumber" rules={[{ required: editable }]}>
            <Input disabled={!editable} placeholder="Building Number" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Street" name="street" rules={[{ required: editable }]}>
            <Input disabled={!editable} placeholder="Street Name" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
  <Col span={12}>
    <Form.Item label="City" name="city" rules={[{ required: editable }]}>
      <Input disabled={!editable} placeholder="City Name" />
    </Form.Item>
  </Col>

  <Col span={12}>
    <Form.Item
      label="Zip Code"
      name="pinCode"
      rules={[
        { required: editable },
        { pattern: /^[0-9]{6}$/, message: "Invalid pin code" },
      ]}
    >
      <Input disabled={!editable} placeholder="Zip Code" />
    </Form.Item>
  </Col>
</Row>


      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Country" name="country" rules={[{ required: editable }]}>
            {editable ? (
              <Select placeholder="Select Country" onChange={handleCountryChange}>
                {countries.map(c => (
                  <Option key={c.code} value={c.code}>{c.name}</Option>
                ))}
              </Select>
            ) : (
              <Input disabled />
            )}
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="State" name="state" rules={[{ required: editable }]}>
            {editable ? (
              <Select placeholder="Select State" disabled={states.length === 0}>
                {states.map(s => (
                  <Option key={s.code} value={s.code}>{s.name}</Option>
                ))}
              </Select>
            ) : (
              <Input disabled />
            )}
          </Form.Item>
        </Col>
      </Row>

      
    </>
  );
};

export default Address;
