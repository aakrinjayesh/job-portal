import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Slider,
  Divider,
  Select,
  Input,
  InputNumber,
  Button,
  Tooltip,
  Collapse,
  Form,
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
import { AiJobFilter, AiCandidateFilter, GetLocations } from "../../api/api";

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
  savedFilters,
  skipFirstEmit,
  hideJobTypeFilters,
  // showCurrentLocation, // 🆕
  showPreferredLocation, // 🆕
  preferredLocationOptions,
  showExpectedCTC, // 🆕
  showJoiningPeriod,
  showRateCard,
  showFitScore,
  hideLocation,
  skillOptions,
  cloudOptions,
  useFilterSectionForSkillsAndClouds,
}) => {
  const [experience, setExperience] = useState(savedFilters?.experience || 0);
  const [selectedLocations, setSelectedLocations] = useState(
    savedFilters?.location || [],
  );
  const [selectedJobTypes, setSelectedJobTypes] = useState(
    savedFilters?.jobType || [],
  );
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState(
    savedFilters?.employmentType || [],
  );
  const [skills, setSkills] = useState(savedFilters?.skills || []);
  const [clouds, setClouds] = useState(savedFilters?.clouds || []);
  const [experienceError, setExperienceError] = useState("");
  const [candidateType, setCandidateType] = useState(
    savedFilters?.candidateType || [],
  );
  // const [currentLocation, setCurrentLocation] = useState(
  //   savedFilters?.currentLocation || "",
  // );
  // const [preferredLocation, setPreferredLocation] = useState(
  //   savedFilters?.preferredLocation || "",
  // );
  const [preferredLocation, setPreferredLocation] = useState(
    savedFilters?.preferredLocation || [],
  );
  const [expectedCTC, setExpectedCTC] = useState(
    savedFilters?.expectedCTC || "",
  );
  const [joiningPeriod, setJoiningPeriod] = useState(
    savedFilters?.joiningPeriod || "",
  );
  const [fitScore, setFitScore] = useState(savedFilters?.fitScore || null);
  const [locationOptions, setLocationOptions] = useState([]);
  const isFirstRender = useRef(true);
  const [rateCard, setRateCard] = useState(savedFilters?.rateCard || "");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await GetLocations();

        const formatted = res.data?.map((loc) => {
          const fullName = loc.name || loc.location;
          const cityOnly = fullName?.split(",")[0]?.trim();
          return {
            label: cityOnly,
            value: fullName,
          };
        });

        const famousCities = [
          "Bengaluru",
          "Hyderabad",
          "Pune",
          "Chennai",
          "Mumbai",
          "Delhi",
          "Kolkata",
          "Gurugram",
          "Noida",
          "Ahmedabad",
          "San Francisco",
          "New York",
          "Seattle",
          "Austin",
          "Chicago",
          "Boston",
          "Los Angeles",
          "Dallas",
          "Atlanta",
          "Denver",
        ];

        const sorted = [...(formatted || [])].sort((a, b) => {
          const aIndex = famousCities.indexOf(a.label);
          const bIndex = famousCities.indexOf(b.label);

          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.label.localeCompare(b.label);
        });

        setLocationOptions(sorted);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };

    fetchLocations();
  }, []);

  /* 🔽 collapse states */
  // const [open, setOpen] = useState({
  //   experience: false,
  //   location: false,
  //   candidateType: false,
  //   jobType: false,
  //   employment: false,
  //   skills: false,
  //   clouds: false,
  // });
  const [open, setOpen] = useState({
    experience: true,
    location: true,
    candidateType: true,
    jobType: true,
    employment: true,
    skills: true,
    clouds: true,
    currentLocation: true, // 🆕
    preferredLocation: true, // 🆕
    expectedCTC: true, // 🆕
    joiningPeriod: true,
    fitScore: true,
    rateCard: true,
  });

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

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

  const resetFilters = () => {
    setExperience(0);
    setSelectedLocations([]);
    setSelectedJobTypes([]);
    setSelectedEmploymentTypes([]);
    setSkills([]);
    setClouds([]);
    setCandidateType([]);
    setExperienceError("");
    // setCurrentLocation("");
    // setPreferredLocation("");
    setPreferredLocation([]);
    setExpectedCTC("");
    setJoiningPeriod("");
    setFitScore(null);
    setRateCard("");

    // 🔁 notify parent immediately
    onFiltersChange?.({
      experience: null,
      location: [],
      jobType: [],
      employmentType: [],
      skills: [],
      clouds: [],
      candidateType: [],
      // preferredLocation: "",
      preferredLocation: [],
      expectedCTC: "",
      joiningPeriod: "",
      fitScore: null,
      rateCard: "",
    });
  };

  /* 🔁 Emit filters */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (skipFirstEmit) return; // ✅ skip first emit — FindJob already called fetchJobs with savedFilters on mount
    }
    onFiltersChange?.({
      experience:
        // experience === 0 || experience === 30 || experience === ""
        //   ? null
        //   : experience,
        !experience || experience === 0 || Number(experience) === 30
          ? null
          : Number(experience),
      location: selectedLocations,
      jobType: selectedJobTypes,
      employmentType: selectedEmploymentTypes,
      skills,
      clouds,
      candidateType,
      // currentLocation, // 🆕
      preferredLocation, // 🆕
      expectedCTC, // 🆕
      joiningPeriod,
      fitScore,
      rateCard,
    });
  }, [
    experience,
    selectedLocations,
    selectedJobTypes,
    selectedEmploymentTypes,
    skills,
    clouds,
    candidateType,
    // currentLocation,
    preferredLocation,
    expectedCTC,
    joiningPeriod,
    fitScore,
    rateCard,
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
            styles={{
              track: { backgroundColor: "#0c8cf5" }, // 🖤 dark filled part
              rail: { backgroundColor: "#d9d9d9" }, // light background
              handle: {
                borderColor: "#1f1f1f",
                backgroundColor: "#1f1f1f",
              },
            }}
            onChange={setExperience}
          />
          <Form.Item
            validateStatus={experienceError ? "error" : ""}
            help={experienceError}
          >
            <Input
              value={experience}
              placeholder="e.g. 5"
              inputMode="numeric"
              maxLength={5}
              style={{ width: "100%" }}
              // onChange={(e) => {
              //   const value = e.target.value;

              //   // ❌ non-numeric
              //   if (!/^\d*$/.test(value)) {
              //     setExperienceError("Only numbers are allowed");
              //     return;
              //   }

              //   // ❌ more than 2 digits
              //   if (value.length > 2) {
              //     setExperienceError("Maximum 2 digits allowed");
              //     return;
              //   }

              //   // ✅ valid
              //   setExperienceError("");
              //   setExperience(value === "" ? "" : Number(value));
              // }}
              onChange={(e) => {
                const value = e.target.value;

                // ❌ only numbers and one dot allowed
                if (!/^[0-9.]*$/.test(value)) {
                  setExperienceError("Only numbers are allowed");
                  return;
                }

                // ❌ more than one dot
                if ((value.match(/\./g) || []).length > 1) {
                  setExperienceError("Only one decimal point is allowed");
                  return;
                }

                // ❌ max 2 digits before decimal, max 2 after
                if (!/^\d{0,2}(\.\d{0,2})?$/.test(value)) {
                  setExperienceError(
                    "Max 2 digits before and 2 after decimal (e.g. 5.55)",
                  );
                  return;
                }

                // ✅ valid
                setExperienceError("");
                setExperience(value === "" ? "" : value);
              }}
            />
          </Form.Item>
        </>
      ),
    },
    showFitScore && {
      key: "fitScore",
      label: <CollapseLabel title="Fit Score" isOpen={open.fitScore} />,
      children: (
        <Input
          type="number"
          placeholder="e.g. 75"
          value={fitScore ?? ""}
          min={0}
          max={100}
          suffix="%"
          onChange={(e) => {
            const val = e.target.value;
            setFitScore(val === "" ? null : Number(val));
          }}
          allowClear
          onClear={() => setFitScore(null)}
        />
      ),
    },
    !hideLocation && {
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
    showPreferredLocation && {
      key: "preferredLocation",
      label: (
        <CollapseLabel
          title="Preferred Location"
          isOpen={open.preferredLocation}
        />
      ),
      // children: (
      //   <Input
      //     placeholder="e.g. Bangalore"
      //     value={preferredLocation}
      //     onChange={(e) => setPreferredLocation(e.target.value)}
      //     allowClear
      //   />
      // ),
      children: (
        <FilterSection
          options={preferredLocationOptions || []}
          selected={preferredLocation}
          onChange={setPreferredLocation}
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
    !hideJobTypeFilters && {
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
    !hideJobTypeFilters && {
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
    // {
    //   key: "skills",
    //   label: <CollapseLabel title="Skills" isOpen={open.skills} />,
    //   children: (
    //     <AddSkillInput
    //       placeholder="Select Skills"
    //       values={skills}
    //       onChange={setSkills}
    //       suggestions={salesforceSkillSuggestions}
    //     />
    //   ),
    // },
    // {
    //   key: "clouds",
    //   label: <CollapseLabel title="Clouds" isOpen={open.clouds} />,
    //   children: (
    //     <AddSkillInput
    //       placeholder="Select Clouds"
    //       values={clouds}
    //       onChange={setClouds}
    //       suggestions={salesforceCloudSuggestions}
    //     />
    //   ),
    // },
    {
      key: "skills",
      label: <CollapseLabel title="Skills" isOpen={open.skills} />,
      children: useFilterSectionForSkillsAndClouds ? (
        <FilterSection
          options={skillOptions || []}
          selected={skills}
          onChange={setSkills}
          showCount
        />
      ) : (
        <AddSkillInput
          placeholder="Select Skills"
          values={skills}
          onChange={setSkills}
          suggestions={salesforceSkillSuggestions}
        />
      ),
    },
    {
      key: "clouds",
      label: <CollapseLabel title="Clouds" isOpen={open.clouds} />,
      children: useFilterSectionForSkillsAndClouds ? (
        <FilterSection
          options={cloudOptions || []}
          selected={clouds}
          onChange={setClouds}
          showCount
        />
      ) : (
        <AddSkillInput
          placeholder="Select Clouds"
          values={clouds}
          onChange={setClouds}
          suggestions={salesforceCloudSuggestions}
        />
      ),
    },
    // showCurrentLocation && {
    //   key: "currentLocation",
    //   label: (
    //     <CollapseLabel title="Current Location" isOpen={open.currentLocation} />
    //   ),
    //   children: (
    //     <Input
    //       placeholder="e.g. Hyderabad"
    //       value={currentLocation}
    //       onChange={(e) => setCurrentLocation(e.target.value)}
    //       allowClear
    //     />
    //   ),
    // },

    showExpectedCTC && {
      key: "expectedCTC",
      label: <CollapseLabel title="Expected CTC" isOpen={open.expectedCTC} />,
      children: (
        <Input
          placeholder="e.g. 10 LPA"
          value={expectedCTC}
          onChange={(e) => setExpectedCTC(e.target.value)}
          allowClear
        />
      ),
    },

    showJoiningPeriod && {
      key: "joiningPeriod",
      label: (
        <CollapseLabel title="Joining Period" isOpen={open.joiningPeriod} />
      ),
      children: (
        <Select
          placeholder="Select joining period"
          value={joiningPeriod || undefined}
          allowClear
          style={{ width: "100%" }}
          onChange={(val) => setJoiningPeriod(val || "")}
          onClear={() => setJoiningPeriod("")}
          options={[
            { label: "Immediately", value: "Immediately" },
            { label: "15 days", value: "15 days" },
            { label: "1 month", value: "1 month" },
            { label: "2 months", value: "2 months" },
            { label: "3 months", value: "3 months" },
          ]}
        />
      ),
    },
    showRateCard && {
      key: "rateCard",
      label: <CollapseLabel title="Rate Card / Month" isOpen={open.rateCard} />,
      children: (
        <Input
          placeholder="e.g. 50000"
          value={rateCard}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, "");
            setRateCard(val);
          }}
          allowClear
          onClear={() => setRateCard("")}
          suffix="INR"
        />
      ),
    },
  ].filter(Boolean);

  return (
  <div
    className="filters-panel-mobile"
    style={{
      width: 250,
      borderRight: "1px solid #eee",
      padding: 14,
      background: "#fff",
    }}
  >
    <style>{`
      @media (max-width: 768px) {
        .filters-panel-mobile {
          width: 100% !important;
          border-right: none !important;
          padding: 0 !important;
          background: transparent !important;
        }

        /* Search bar */
        .filters-panel-mobile .ant-input-affix-wrapper,
        .filters-panel-mobile textarea {
          border-radius: 12px !important;
          border: 1.5px solid #e5e7eb !important;
          background: #f9fafb !important;
          font-size: 14px !important;
        }

        /* All Filters header */
        .filters-panel-mobile .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px 8px;
          background: #fff;
          border-radius: 12px 12px 0 0;
        }

        /* Collapse panel */
        .filters-panel-mobile .ant-collapse {
          background: transparent !important;
          border: none !important;
        }

        .filters-panel-mobile .ant-collapse-item {
          background: #fff !important;
          border-radius: 12px !important;
          border: 1.5px solid #f0f0f0 !important;
          margin-bottom: 10px !important;
          overflow: hidden !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05) !important;
        }

        .filters-panel-mobile .ant-collapse-header {
          padding: 14px 16px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          color: #111827 !important;
          background: #fff !important;
        }

        .filters-panel-mobile .ant-collapse-content-box {
          padding: 12px 16px 16px !important;
          background: #fafafa !important;
        }

        /* Checkboxes in FilterSection */
        .filters-panel-mobile .ant-checkbox-wrapper {
          font-size: 13px !important;
          padding: 4px 0 !important;
        }

        /* Inputs inside filters */
        .filters-panel-mobile .ant-input {
          border-radius: 8px !important;
          border: 1.5px solid #e5e7eb !important;
          background: #fff !important;
          font-size: 13px !important;
        }

        /* Select inside filters */
        .filters-panel-mobile .ant-select-selector {
          border-radius: 8px !important;
          border: 1.5px solid #e5e7eb !important;
          background: #fff !important;
        }

        /* Slider track */
        .filters-panel-mobile .ant-slider-track {
          background: #1677ff !important;
        }

        /* Divider */
        .filters-panel-mobile .ant-divider {
          margin: 8px 0 !important;
        }

        /* Clear All button */
        .filters-panel-mobile .clear-all-text {
          color: #ef4444 !important;
          font-weight: 500 !important;
          font-size: 13px !important;
        }

        /* Tag chips */
        .filters-panel-mobile .ant-tag {
          border-radius: 20px !important;
          font-size: 12px !important;
        }
      }
    `}</style>
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
  className="filters-header"
  style={{
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 12,
  }}
>
  <Text strong>All Filters</Text>
  <Text
    className="clear-all-text"
    type="link"
    onClick={() => {
      resetFilters();
      handleClearFilters?.();
    }}
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
