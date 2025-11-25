import React, { useState, useEffect } from "react";
import { Card, Typography, Collapse, Slider, Divider, InputNumber } from "antd";
import FilterSection from "./FilterSection";
import AddSkillInput from "./AddSkillInput";

const { Text } = Typography;
const { Panel } = Collapse;

const FiltersPanel = ({ onFiltersChange }) => {
  const [experience, setExperience] = useState(30);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState([]);
  const [skills, setSkills] = useState([]);
  const [clouds, setClouds] = useState([]);

  const locationOptions = [
    { label: "Bangalore", count: 4543 },
    { label: "Hyderabad", count: 2662 },
    { label: "Delhi / NCR", count: 2203 },
    { label: "Pune", count: 1918 },
    { label: "Mumbai", count: 1512 },
    { label: "Chennai", count: 1343 },
  ];

  const employeeTypeOptions = [
    { label: "FullTime" },
    { label: "PartTime" },
    { label: "Contract" },
    { label: "Internship" },
    { label: "Freelance" },
  ];

  const jobTypeOptions = [
    { label: "On-site" },
    { label: "Remote" },
    { label: "Hybrid" },
  ];

  const salesforceSkillSuggestions = ["Apex", "Aura", "LWC", "SOQL"];
  const salesforceCloudSuggestions = ["Sales Cloud", "Service Cloud", "Marketing Cloud"];

  // Handle Changes
  useEffect(() => {
    onFiltersChange?.({
      experience: experience === 30 ? null : experience,
      location: selectedLocations,
      jobType: selectedJobTypes,
      employmentType: selectedEmploymentTypes,
      skills,
      clouds,
    });
  }, [
    experience,
    selectedLocations,
    selectedJobTypes,
    selectedEmploymentTypes,
    skills,
    clouds,
  ]);

  return (
    <Collapse defaultActiveKey={["filters"]} ghost>
      {/* LEFT SIDE COLLAPSE HEADER */}
      <Panel header={<Text strong>Filters</Text>} key="filters">
        <Card style={{ borderRadius: 8 }}>

          {/* EXPERIENCE */}
          <Text strong>Experience</Text>
          <Slider
            min={0}
            max={30}
            value={experience}
            tooltip={{ formatter: (val) => (val === 30 ? "Any" : `${val} Yrs`) }}
            onChange={setExperience}
          />
          <InputNumber
            min={0}
            max={30}
            value={experience}
            onChange={(value) => setExperience(value || 0)}
            style={{ width: "100%" }}
          />

          <Divider />

          {/* LOCATION */}
          <Text strong>Location</Text>
          <FilterSection
            options={locationOptions}
            selected={selectedLocations}
            onChange={setSelectedLocations}
          />

          <Divider />

          {/* JOB TYPE */}
          <Text strong>Job Type</Text>
          <FilterSection
            options={jobTypeOptions}
            selected={selectedJobTypes}
            onChange={setSelectedJobTypes}
          />

          <Divider />

          {/* EMPLOYMENT TYPE */}
          <Text strong>Employment Type</Text>
          <FilterSection
            options={employeeTypeOptions}
            selected={selectedEmploymentTypes}
            onChange={setSelectedEmploymentTypes}
          />

          <Divider />

          {/* SKILLS */}
          {/* <Text strong>Skills</Text> */}
          <AddSkillInput
            label="Skills"
            values={skills}
            onChange={setSkills}
            suggestions={salesforceSkillSuggestions}
          />

          <Divider />

          {/* CLOUDS */}
          <Text strong>Clouds</Text>
          <AddSkillInput
            label="Clouds"
            values={clouds}
            onChange={setClouds}
            suggestions={salesforceCloudSuggestions}
          />

        </Card>
      </Panel>
    </Collapse>
  );
};

export default FiltersPanel;