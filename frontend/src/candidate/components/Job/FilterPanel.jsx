import React, { useState, useEffect } from "react";
import { Card, Typography, Collapse, Slider, Divider, InputNumber } from "antd";
import FilterSection from "./FilterSection";
import AddSkillInput from "./AddSkillInput";
import SearchWithTextArea from "../../../company/components/Bench/SearchWithTextArea";
import { AiJobFilter } from "../../api/api";
import { AiCandidateFilter } from "../../api/api";

const { Text } = Typography;
const { Panel } = Collapse;

const FiltersPanel = ({
  onFiltersChange,
  showCandidateType,
  handleClearFilters,
}) => {
  const [experience, setExperience] = useState(30);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState([]);
  const [skills, setSkills] = useState([]);
  const [clouds, setClouds] = useState([]);
  const [candidateType, setCandidateType] = useState([]);

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

  const salesforceSkillSuggestions = [
    "Apex",
    "Approvals",
    "Advanced Approvals",
    "API",
    "AP",
    "Azure DevOps",
    "Bitbucket",
    "Bugzilla",
    "Change Sets",
    "CI/CD",
    "CI/CD (Copado)",
    "Community Setup",
    "Copado",
    "Custom Obj",
    "Custom Objects",
    "Data Loader",
    "DataRaptors",
    "Dashboards",
    "Dell Boomi",
    "DocuSign Integration",
    "Einstein",
    "Fileds",
    "FlexCards",
    "Flows",
    "Force.com IDE",
    "Formula Fields",
    "Gearset",
    "Git",
    "HTML",
    "Integration Procedures",
    "Integration",
    "iOS Mobile Testing",
    "JIRA",
    "JS",
    "LWC",
    "Mantis",
    "Mobile Testing (iOS)",
    "Monday",
    "OmniScripts",
    "Order Management",
    "PB",
    "Plecto",
    "Postman",
    "Process Automation",
    "Process Builder",
    "Regression Testing",
    "Reports",
    "Salesforce Inspector",
    "SAML",
    "SFDX",
    "SF Inspector",
    "Slack Integration",
    "SOQL",
    "SOSL",
    "Scripting",
    "Schema Builder",
    "SQL",
    "Streaming API",
    "Talend",
    "Tibco",
    "TestLink",
    "Triggers",
    "UAT",
    "User & Security Management",
    "Validation Rules",
    "VS Code",
    "VF",
    "VR",
    "WF",
    "Workflows",
    "Workbench",
  ];
  const salesforceCloudSuggestions = [
    "Salesforce Sales Cloud",
    "Salesforce Marketing Cloud",
    "Salesforce Service Cloud",
    "Salesforce Commerce Cloud",
    "Salesforce Experience Cloud",
    "Salesforce Analytics Cloud",
    "Salesforce Integration Cloud",
    "Salesforce App Cloud",
    "Salesforce IoT Cloud",
    "Salesforce Manufacturing Cloud",
    "Salesforce Financial Services",
    "Salesforce Health Cloud",
    "Salesforce Education Cloud",
    "Salesforce Nonprofit Cloud",
    "Salesforce Media Cloud",
  ];

  const updateCandidateType = (type, checked) => {
    if (checked) {
      setCandidateType((prev) => [...prev, type]);
    } else {
      setCandidateType((prev) => prev.filter((t) => t !== type));
    }
  };

  // Handle Changes
  useEffect(() => {
    onFiltersChange?.({
      experience: experience === 30 ? null : experience,
      location: selectedLocations,
      jobType: selectedJobTypes,
      employmentType: selectedEmploymentTypes,
      skills,
      clouds,
      candidateType,
    });
  }, [
    experience,
    selectedLocations,
    selectedJobTypes,
    selectedEmploymentTypes,
    skills,
    clouds,
    candidateType,
  ]);

  return (
    <Collapse defaultActiveKey={["filters"]}>
      <SearchWithTextArea
        handleFiltersChange={onFiltersChange}
        apifunction={showCandidateType ? AiCandidateFilter : AiJobFilter}
        handleClearFilters={handleClearFilters}
        type={"candidate"}
      />
      {/* LEFT SIDE COLLAPSE HEADER */}
      <Panel header={<Text strong>Filters</Text>} key="filters">
        <Card style={{ borderRadius: 8 }}>
          {/* EXPERIENCE */}
          <Text strong>Experience</Text>
          <Slider
            min={0}
            max={30}
            value={experience}
            tooltip={{
              formatter: (val) => (val === 30 ? "Any" : `${val} Yrs`),
            }}
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
          {showCandidateType && (
            <>
              <Divider />

              <Text strong>Candidate Type</Text>

              <div style={{ marginTop: 8 }}>
                {/* Vendor Candidate */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 6,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={candidateType.includes("vendor")}
                    onChange={(e) =>
                      updateCandidateType("vendor", e.target.checked)
                    }
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: "#1677ff",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{ marginLeft: 8 }}>Vendor Candidate</span>
                </label>

                {/* Individual Candidate */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={candidateType.includes("individual")}
                    onChange={(e) =>
                      updateCandidateType("individual", e.target.checked)
                    }
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: "#1677ff",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{ marginLeft: 8 }}>Individual Candidate</span>
                </label>
              </div>
            </>
          )}

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
