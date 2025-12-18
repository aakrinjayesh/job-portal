import React, { useRef, useState } from "react";
import { Input, Button, Space, message } from "antd";

const { TextArea } = Input;

const SearchWithTextArea = ({
  handleFiltersChange,
  apifunction,
  handleClearFilters,
  type,
}) => {
  const inputRef = useRef(null);
  // const [searchValue, setSearchValue] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);

      const textArea = inputRef?.current?.resizableTextArea?.textArea;
      if (!textArea) {
        messageApi.error("Unable to access search input.");
        return;
      }

      const value = textArea.value?.trim() || "";
      if (!value) {
        messageApi.warning("Please enter text to search.");
        return;
      }

      const resp = await apifunction({ JD: value });
      console.log("AI Response:", resp);

      // SUCCESS CHECK
      if (resp?.success === "success") {
        let filter = resp.filter || {};

        // CLEAN: Remove top-level nulls
        const cleanedFilter = {};
        Object.entries(filter).forEach(([key, val]) => {
          if (key !== "experience" && val !== null) {
            cleanedFilter[key] = val;
          }
        });

        // CLEAN NESTED EXPERIENCE
        if (filter.experience) {
          const exp = filter.experience;
          const expClean = {};

          Object.entries(exp).forEach(([key, val]) => {
            if (val !== null) expClean[key] = val;
          });

          if (Object.keys(expClean).length > 0) {
            cleanedFilter.experience = expClean;
          }
        }

        // ---------- FIX LOCATION (STRING → ARRAY) ----------
        if (cleanedFilter.location && !Array.isArray(cleanedFilter.location)) {
          cleanedFilter.location = [cleanedFilter.location];
        }

        console.log("Cleaned Filter:", cleanedFilter);
        handleFiltersChange(cleanedFilter);
      } else {
        messageApi.error(resp?.message || "Failed to process AI search.");
      }
    } catch (error) {
      console.error("AI Search Error:", error);
      messageApi.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Space.Compact
        style={{
          marginBottom: 18,
          width: type === "job" ? 215 : 350,
        }}
      >
        <TextArea
          rows={2}
          autoSize={{ minRows: 2, maxRows: 5 }}
          ref={inputRef}
          placeholder="AI Search"
          style={{ width: "80%" }}
        />

        <Button
          type="primary"
          loading={loading}
          disabled={loading}
          onClick={handleSearch}
          style={{ height: "auto" }}
        >
          Search
        </Button>
      </Space.Compact>
      <Button
        style={{ marginLeft: 10, marginBottom: type === "job" && 10 }}
        onClick={handleClearFilters}
      >
        Clear Filter
      </Button>
    </>
  );
};

export default SearchWithTextArea;
