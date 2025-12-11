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
        console.warn("Search TextArea reference missing.");
        messageApi.error("Unable to access search input.");
        return;
      }

      const value = textArea.value?.trim() || "";

      console.log("🔍 Search Query:", value);

      if (!value) {
        messageApi.warning("Please enter text to search.");
        return;
      }

      const payload = { JD: value };

      const resp = await apifunction(payload);

      if (resp?.success === "success") {
        if (resp?.filter) {
          handleFiltersChange(resp.filter);
        } else {
          messageApi.warning("AI did not return any filterable information.");
        }
      } else {
        messageApi.error(
          resp?.message ||
            "Failed to process AI search. Please try again later."
        );
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
