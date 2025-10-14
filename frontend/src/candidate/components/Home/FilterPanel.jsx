import React, { useState, useEffect } from "react";
import { Card, Typography, Collapse, Slider, Divider } from "antd";
import FilterSection from "./FilterSection";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const FiltersPanel = ({ onFiltersChange }) => {
  // Sample dynamic data
  const salaryOptions = [
    { label: "0-3 Lakhs", count: 1443 },
    { label: "3-6 Lakhs", count: 6255 },
    { label: "6-10 Lakhs", count: 8221 },
    { label: "10-15 Lakhs", count: 5403 },
    { label: "15-20 Lakhs", count: 2401 },
    { label: "20-30 Lakhs", count: 982 },
  ];

  const locationOptions = [
    { label: "Bengaluru", count: 4543 },
    { label: "Hyderabad", count: 2662 },
    { label: "Delhi / NCR", count: 2203 },
    { label: "Pune", count: 1918 },
    { label: "Mumbai", count: 1512 },
    { label: "Chennai", count: 1343 },
  ];

  // State management
  const [experience, setExperience] = useState(30);
  const [selectedSalaries, setSelectedSalaries] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Handle experience slider
  const handleExperienceChange = (value) => {
    setExperience(value);
  };

  // Combined filters update
  useEffect(() => {
    const filters = {
      experience: experience === 30 ? "Any" : `${experience} Yrs`,
      salary: selectedSalaries,
      location: selectedLocations,
    };
    console.log("Filters Updated →", filters);
    if (onFiltersChange) onFiltersChange(filters);
  }, [experience, selectedSalaries, selectedLocations]);

  return (
    <Card style={{ borderRadius: 8 }}>
      <Title level={4}>All Filters</Title>

      <Collapse
        defaultActiveKey={["1", "2", "3"]}
        expandIconPosition="end"
        ghost
      >
        {/* Experience Section */}
        <Panel header={<Text strong>Experience</Text>} key="1">
          <Slider
            min={0}
            max={30}
            defaultValue={30}
            tooltip={{
              formatter: (val) => (val === 30 ? "Any" : `${val} Yrs`),
            }}
            onChange={handleExperienceChange}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text>0 Yrs</Text>
            <Text>Any</Text>
          </div>
        </Panel>

        <Divider style={{ margin: "8px 0" }} />

        {/* Salary Section */}
        <Panel header={<Text strong>Salary</Text>} key="2">
          <FilterSection
            title="Salary"
            options={salaryOptions}
            selected={selectedSalaries}
            onChange={setSelectedSalaries}
          />
        </Panel>

        <Divider style={{ margin: "8px 0" }} />

        {/* Location Section */}
        <Panel header={<Text strong>Location</Text>} key="3">
          <FilterSection
            title="Location"
            options={locationOptions}
            selected={selectedLocations}
            onChange={setSelectedLocations}
          />
        </Panel>
      </Collapse>
    </Card>
  );
};

export default FiltersPanel;
