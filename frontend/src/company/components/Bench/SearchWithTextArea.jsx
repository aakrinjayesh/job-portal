import React, { useRef, useState } from "react";
import { Input, Button, Space, message, Modal, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

const SearchWithTextArea = ({
  handleFiltersChange,
  apifunction,
  handleClearFilters,
  type,
}) => {
  const inputRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // 🔥 LOGIC — UNCHANGED
  const handleSearch = async () => {
    try {
      setLoading(true);

      const resp = await apifunction({ JD: searchValue });
      console.log("AI Response:", resp);

      if (resp?.success === "success") {
        let filter = resp.filter || {};

        const cleanedFilter = {};
        Object.entries(filter).forEach(([key, val]) => {
          if (key !== "experience" && val !== null) {
            cleanedFilter[key] = val;
          }
        });

        if (filter.experience) {
          const expClean = {};
          Object.entries(filter.experience).forEach(([key, val]) => {
            if (val !== null) expClean[key] = val;
          });
          if (Object.keys(expClean).length > 0) {
            cleanedFilter.experience = expClean;
          }
        }

        if (cleanedFilter.location && !Array.isArray(cleanedFilter.location)) {
          cleanedFilter.location = [cleanedFilter.location];
        }

        handleFiltersChange(cleanedFilter);
        setOpen(false); // ✅ close modal after success
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

      {/* ✅ AI SEARCH BUTTON (NEW DESIGN) */}
      <Button
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          height: 36,
          padding: "8px 16px",
          borderRadius: 20,
          background:
            "linear-gradient(140deg, rgba(250, 155, 0, 0.20) 0%, rgba(146, 62, 213, 0.20) 49%, rgba(0, 92, 184, 0.20) 100%), #fff",
          border: "2px solid #FA9B00",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "none",
        }}
        icon={<SearchOutlined style={{ fontSize: 14, color: "#222" }} />}
      >
        <Text style={{ color: "#222", fontSize: 12 }}>Search With AI</Text>
      </Button>

      {/* ✅ MODAL WITH EXISTING FUNCTIONALITY */}
      <Modal
        open={open}
        title={null}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnClose
        closable={false}
        bodyStyle={{
          padding: 0,
          background: "transparent",
        }}
      >
        {/* Gradient Border */}
        <div
          style={{
            padding: 2,
            borderRadius: 24,
            background: "linear-gradient(135deg, #ff8a00, #8f5cff, #4f46e5)",
          }}
        >
          {/* Inner Box */}
          <div
            style={{
              borderRadius: 22,
              padding: 16,
              background: "linear-gradient(135deg, #fff1e6, #ede9fe)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
            {/* Input Area */}
            <div
              style={{
                position: "relative",
              }}
            >
              {/* Search Icon */}
              <SearchOutlined
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  fontSize: 18,
                  color: "#555",
                  zIndex: 1,
                }}
              />

              <TextArea
                rows={2}
                ref={inputRef}
                placeholder="Enter your prompt"
                value={searchValue}
                // onChange={(e) => setSearchValue(e.target.value)}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "");
                  setSearchValue(cleaned);
                }}
                style={{
                  paddingLeft: 40,
                  paddingRight: 88,
                  paddingTop: 10,
                  paddingBottom: 10,
                  borderRadius: 16,
                  resize: "none",
                  fontSize: 13,
                  lineHeight: "18px",
                }}
              />

              {/* Search Button inside box */}
              <Button
                type="primary"
                loading={loading}
                disabled={loading}
                onClick={handleSearch}
                style={{
                  position: "absolute",
                  right: 10,
                  bottom: 10,
                  height: 30,
                  padding: "0 14px",
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                Search
              </Button>
            </div>

            {/* Clear Filters */}
            <div style={{ marginTop: 12 }}>
              <Button
                type="text"
                onClick={() => {
                  setSearchValue("");
                  handleClearFilters();
                }}
                style={{ padding: 0 }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SearchWithTextArea;
