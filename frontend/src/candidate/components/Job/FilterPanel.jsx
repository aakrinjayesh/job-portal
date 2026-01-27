import React, { useState, useEffect } from "react";
import {
  Typography,
  Slider,
  Divider,
  InputNumber,
  Button,
  Tooltip,
  Collapse,
} from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  UpOutlined,
  DownOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import FilterSection from "./FilterSection";
import AddSkillInput from "./AddSkillInput";
import SearchWithTextArea from "../../../company/components/Bench/SearchWithTextArea";
import { AiJobFilter, AiCandidateFilter } from "../../api/api";

const { Text } = Typography;

/* 🔹 Small reusable collapse section */
const Section = ({ title, open, toggle, children }) => (
  <div style={{ marginBottom: 12 }}>
    <div
      onClick={toggle}
      style={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {open ? <CaretDownOutlined /> : <CaretRightOutlined />}
      <Text strong style={{ marginLeft: 6 }}>
        {title}
      </Text>
    </div>

    {open && <div style={{ marginTop: 10 }}>{children}</div>}
  </div>
);

const CollapseLabel = ({ title, isOpen }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      fontSize: 14,
      fontWeight: 600,
    }}
  >
    <span>{title}</span>
    {isOpen ? <UpOutlined /> : <DownOutlined />}
  </div>
);

const FiltersPanel = ({
  onFiltersChange,
  showCandidateType,
  isFilterOpen,
  handleClearFilters,
  toggleFilter,
}) => {
  const [experience, setExperience] = useState(30);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState([]);
  const [skills, setSkills] = useState([]);
  const [clouds, setClouds] = useState([]);
  const [candidateType, setCandidateType] = useState([]);

  /* 🔽 collapse states */
  const [open, setOpen] = useState({
    experience: true,
    location: true,
    candidateType: true,
    jobType: false,
    employment: false,
    skills: false,
    clouds: false,
  });

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const locationOptions = [
    { label: "Bangalore", count: 4543 },
    { label: "Hyderabad", count: 2662 },
    { label: "Delhi / NCR", count: 2203 },
    { label: "Pune", count: 1918 },
    { label: "Mumbai", count: 1512 },
    { label: "Chennai", count: 1343 },
  ];

  const employeeTypeOptions = [
    { label: "Full Time" },
    { label: "Part Time" },
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

  /* 🔁 Emit filters */
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

  const collapseItems = [
    {
      key: "experience",
      label: <CollapseLabel title="Experience" isOpen={open.experience} />,
      children: (
        <>
          <Slider
            min={0}
            max={30}
            value={experience}
            tooltip={{
              formatter: (val) => (val === 30 ? "Any" : `${val} yrs`),
            }}
            onChange={setExperience}
          />
          <InputNumber
            min={0}
            max={30}
            value={experience}
            onChange={(v) => setExperience(v || 0)}
            style={{ width: "100%" }}
          />
        </>
      ),
    },

    {
      key: "location",
      label: <CollapseLabel title="Location" isOpen={open.location} />,
      children: (
        <FilterSection
          options={locationOptions}
          selected={selectedLocations}
          onChange={setSelectedLocations}
          showCount
        />
      ),
    },
    showCandidateType && {
      key: "candidateType",
      label: (
        <CollapseLabel title="Candidate Type" isOpen={open.candidateType} />
      ),
      children: (
        <>
          {["vendor", "individual"].map((type) => (
            <label
              key={type}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 6,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={candidateType.includes(type)}
                onChange={(e) => updateCandidateType(type, e.target.checked)}
                style={{ marginRight: 8 }}
              />
              {type === "vendor" ? "Vendor Candidate" : "Individual Candidate"}
            </label>
          ))}
        </>
      ),
    },
    {
      key: "jobType",
      label: <CollapseLabel title="Job Type" isOpen={open.jobType} />,

      children: (
        <FilterSection
          options={jobTypeOptions}
          selected={selectedJobTypes}
          onChange={setSelectedJobTypes}
        />
      ),
    },
    {
      key: "employment",
      label: <CollapseLabel title="Employee Type" isOpen={open.employment} />,
      children: (
        <FilterSection
          options={employeeTypeOptions}
          selected={selectedEmploymentTypes}
          onChange={setSelectedEmploymentTypes}
        />
      ),
    },
    {
      key: "skills",
      label: <CollapseLabel title="Skills" isOpen={open.skills} />,
      children: (
        <AddSkillInput
          values={skills}
          onChange={setSkills}
          suggestions={salesforceSkillSuggestions}
        />
      ),
    },
    {
      key: "clouds",
      label: <CollapseLabel title="Clouds" isOpen={open.clouds} />,
      children: (
        <AddSkillInput
          values={clouds}
          onChange={setClouds}
          suggestions={salesforceCloudSuggestions}
        />
      ),
    },
  ].filter(Boolean);

  return (
    <div
      style={{
        width: 250, // ✅ reduced width
        // height: "calc(100vh - 30px)", // ✅ smaller scroll area
        borderRight: "1px solid #eee",
        padding: 14,
        // overflowY: "auto",
        background: "#fff",
      }}
    >
      {/* SEARCH */}

      {/* <Tooltip title={isFilterOpen ? "Hide Filters" : "Show Filters"}>
  <Button
    type="link"
    onClick={toggleFilter}
    style={{
      padding: 0,
      fontWeight: 500,
      fontSize: 14,
    }}
  >
    {isFilterOpen ? "Close Filter Menu" : "Open Filter Menu"}
  </Button>
</Tooltip> */}

      <SearchWithTextArea
        handleFiltersChange={onFiltersChange}
        apifunction={showCandidateType ? AiCandidateFilter : AiJobFilter}
        handleClearFilters={handleClearFilters}
        type="candidate"
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
          marginTop: 12,
        }}
      >
        <Text strong>All Filters</Text>
        <Text
          type="link"
          onClick={handleClearFilters}
          style={{ cursor: "pointer", fontSize: 13 }}
        >
          Clear All
        </Text>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {/* EXPERIENCE */}
      <Collapse
        bordered={false}
        ghost
        items={collapseItems}
        activeKey={Object.keys(open).filter((k) => open[k])}
        expandIcon={() => null}
        onChange={(keys) => {
          const updated = {};
          Object.keys(open).forEach((k) => (updated[k] = keys.includes(k)));
          setOpen(updated);
        }}
      />
      <Divider />
    </div>
  );
};

export default FiltersPanel;
