import React, { useState, useEffect } from "react";
import { Button, Modal, InputNumber, List, Card, Input, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ReusableSelect from "./ReusableSelect";

const SkillManagerCard = ({
  title,
  skills = [],
  onSkillsChange,
  fetchFunction,
  addFunction,
  hasError = false,
  required = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  // const [currentSkill, setCurrentSkill] = useState("");
  const [currentSkill, setCurrentSkill] = useState([]); // NOT ""

  const [experience, setExperience] = useState();
  const [editingIndex, setEditingIndex] = useState(null);

  const openModal = () => {
    // setCurrentSkill("");
    setCurrentSkill([]); // FIXED
    setExperience(0);
    setEditingIndex(null);
    setModalVisible(true);
  };

  useEffect(() => {
    console.log("Skills updated:", skills);
  }, [skills]);

  const openEditModal = (item, index) => {
    // setCurrentSkill(item.name);
    setCurrentSkill([item.name]); // FIXED
    setExperience(item.experience);
    setEditingIndex(index);
    setModalVisible(true);
  };

  const saveSkill = () => {
    if (currentSkill.length === 0) {
      message.error("Please select at least one skill!");
      return;
    }

    // ✅ Validation: allow text, numbers, dot, comma, hyphen
    const validSkillRegex = /^[A-Za-z0-9 ., -]+$/;

    for (let skillName of currentSkill) {
      if (!validSkillRegex.test(skillName)) {
        message.error(
          "Skill name can contain only letters, numbers, spaces, dot (.), comma (,), and hyphen (-)"
        );
        return;
      }
    }

    let updatedSkills = [...skills];

    if (editingIndex !== null) {
      // Editing ONE skill
      updatedSkills[editingIndex] = {
        name: currentSkill[0],
        experience,
      };
    } else {
      // Adding MULTIPLE skills
      currentSkill.forEach((skillName) => {
        const exists = updatedSkills.some(
          (item) => item.name.toLowerCase() === skillName.toLowerCase()
        );

        if (!exists) {
          updatedSkills.push({
            name: skillName,
            experience,
          });
        }
      });
    }

    onSkillsChange?.(updatedSkills);

    setModalVisible(false);
    setCurrentSkill([]);
    setExperience(0);
    setEditingIndex(null);
    message.success("Saved successfully!");
  };

  const deleteSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    if (onSkillsChange) {
      onSkillsChange(updatedSkills);
    }
  };

  //   return (
  //     <Card
  //       title={title}
  //       extra={<Button onClick={openModal}>Add {title}</Button>}
  //       style={{ height: 300, overflowY: "auto", scrollbarWidth: "none" }}
  //     >
  //       <Modal
  //         title={
  //           editingIndex !== null
  //             ? `Edit ${title.slice(0, -1)} and Experience`
  //             : `Add ${title.slice(0, -1)} and Experience`
  //         }
  //         open={modalVisible}
  //         onOk={saveSkill}
  //         onCancel={() => {
  //           setModalVisible(false);
  //           setEditingIndex(null);
  //         }}
  //       >
  //         <div style={{ marginBottom: 16 }}>
  //           <label style={{ display: "block", marginBottom: 8 }}>
  //    Select {title}:
  //           </label>
  //           <ReusableSelect
  //             single={false}
  //             placeholder="Select or add skill"
  //             fetchFunction={fetchFunction}
  //             addFunction={addFunction}
  //             value={currentSkill}
  //             onChange={(value) => {
  //               setCurrentSkill(value);
  //               console.log("vales of skills", value);
  //             }}
  //           />
  //         </div>
  //         <div>
  //           <label style={{ display: "block", marginBottom: 8 }}>
  //             Experience:
  //           </label>

  // <InputNumber
  //   value={experience}
  //   min={1}
  //                    // ⛔ blocks large numbers
  //   step={1}
  //   precision={2}               // ✅ only 2 digits after dot
  //   stringMode                  // IMPORTANT: prevents float issues
  //   addonAfter="yrs"
  //   style={{ width: "100%" }}
  //   parser={(value) => value.replace(/[^\d.]/g, "")}
  //   formatter={(value) => value}
  //   onChange={(value) => {
  //     if (value === null) {
  //       setExperience(null);
  //       return;
  //     }

  //     // ✅ Regex: max 2 digits before dot, max 2 after dot
  //     const regex = /^\d{1,2}(\.\d{0,2})?$/;

  //     if (regex.test(value.toString())) {
  //       setExperience(value);
  //     }
  //   }}
  // />

  //         </div>
  //       </Modal>

  //       <List
  //         bordered
  //         dataSource={skills}
  //         renderItem={(item, index) => (
  //           <List.Item
  //             actions={[
  //               <Button
  //                 type="text"
  //                 icon={<EditOutlined />}
  //                 onClick={() => openEditModal(item, index)}
  //               />,
  //               <Button
  //                 type="text"
  //                 danger
  //                 icon={<DeleteOutlined />}
  //                 onClick={() => deleteSkill(index)}
  //               />,
  //             ]}
  //           >
  //             {`${item.name} - ${item.experience} yrs`}
  //           </List.Item>
  //         )}
  //         style={{ marginTop: 16 }}
  //       />
  //     </Card>

  //   );

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        padding: 20,
        boxSizing: "border-box",

        background: "white",
        boxShadow: "0px 0px 70px rgba(0, 0, 0, 0.06)",
        borderRadius: 10,
        // outline:
        //   title === "Primary Skills"
        //     ? "1px solid #E2EEFF"
        //     : "1px solid #F7F7F7",
        outline: hasError
          ? "1px solid #ff4d4f"
          : title === "Primary Skills"
          ? "1px solid #E2EEFF"
          : "1px solid #F7F7F7",

        outlineOffset: "-1px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* ================= HEADER ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* <div
          style={{
            fontSize: 16,
            color: "#212121",
            fontWeight: 400,
          }}
        >
          {title}
        </div> */}
        <div
          style={{
            fontSize: 16,
            color: "#212121",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {required && (
            <span style={{ color: "#ff4d4f", fontSize: 16 }}>*</span>
          )}
          {title}
        </div>
      </div>
      {/* ================= SKILLS ================= */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,

          alignItems: "center",
          width: "100%",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {skills.map((item, index) => (
          <div
            key={index}
            style={{
              minHeight: 20,
              padding: "4px 8px",
              background: title === "Primary Skills" ? "#E2EEFF" : "#E7F0FE",

              borderRadius: 20,
              outline: "0 px solid #1677FF",
              outlineOffset: "-0.5px",
              border: "0.5px solid #1677FF",
              display: "flex",
              alignItems: "center",
              gap: 6,
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 595,
                color: "#111",
                whiteSpace: "nowrap",
              }}
            >
              {item.name} - {item.experience} yrs
            </div>
            {/* CLOSE (×) */}
            <div
              onClick={() => deleteSkill(index)}
              style={{
                width: 16,
                height: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "#666",
                lineHeight: 1,
              }}
            >
              ×
            </div>
          </div>
        ))}
      </div>

      {/* ================= ADD BUTTON ================= */}
      <div>
        <div
          onClick={openModal}
          style={{
            height: 10,
            padding: "10px 24px",
            borderRadius: 100,
            outline: "1px solid #666",
            outlineOffset: "-1px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#666",
            fontSize: 14,
            fontWeight: 590,
          }}
        >
          + Add
        </div>
      </div>

      {/* ================= MODAL (UNCHANGED) ================= */}
      {/* <Modal
      title={
        editingIndex !== null
          ? `Edit ${title.slice(0, -1)} and Experience`
          : `Add ${title.slice(0, -1)} and Experience`
      }
      open={modalVisible}
      onOk={saveSkill}
      onCancel={() => {
        setModalVisible(false);
        setEditingIndex(null);
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Select {title}:
        </label>

        <ReusableSelect
          single={false}
          placeholder="Select or add skill"
          fetchFunction={fetchFunction}
          addFunction={addFunction}
          value={currentSkill}
          onChange={(value) => setCurrentSkill(value)}
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: 8 }}>
          Experience:
        </label>

        <InputNumber
          value={experience}
          min={1}
          step={1}
          precision={2}
          stringMode
          addonAfter="yrs"
          style={{ width: "100%" }}
          parser={(value) => value.replace(/[^\d.]/g, "")}
          formatter={(value) => value}
          onChange={(value) => {
            if (value === null) {
              setExperience(null);
              return;
            }
            const regex = /^\d{1,2}(\.\d{0,2})?$/;
            if (regex.test(value.toString())) {
              setExperience(value);
            }
          }}
        />
      </div>
    </Modal> */}

      <Modal
        open={modalVisible}
        footer={null} // ❌ remove default footer
        closable={false} // ❌ remove default X
        centered // ✅ center modal
        width={640}
        onCancel={() => {
          setModalVisible(false);
          setEditingIndex(null);
        }}
        styles={{
          content: {
            borderRadius: 16,
            padding: 24,
          },
        }}
      >
        {/* ================= HEADER ================= */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 590,
              color: "#101828",
            }}
          >
            {editingIndex !== null
              ? `Edit ${title.slice(0, -1)} & Experience`
              : `Add ${title.slice(0, -1)} & Experience`}
          </div>

          {/* X BUTTON */}
          <div
            onClick={() => {
              setModalVisible(false);
              setEditingIndex(null);
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "#F9F9F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 18,
              color: "#111",
            }}
          >
            ×
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {/* PRIMARY CLOUD / SKILL */}
          <div style={{ flex: 1 }}>
            {/* <label
              style={{
                fontSize: 13,
                fontWeight: 590,
                marginBottom: 6,
                display: "block",
              }}
            >
              <span style={{ color: "#B60554" }}>*</span> {title.slice(0, -1)}
            </label> */}
            <label
              style={{
                fontSize: 13,
                fontWeight: 590,
                marginBottom: 6,
                display: "block",
              }}
            >
              {title === "Primary Skills" || title === "Primary Clouds" ? (
                <span style={{ color: "#B60554" }}>* </span>
              ) : null}
              {title.slice(0, -1)}
            </label>

            <ReusableSelect
              single={false}
              placeholder="Select or add skill"
              fetchFunction={fetchFunction}
              addFunction={addFunction}
              value={currentSkill}
              onChange={(value) => setCurrentSkill(value)}
              style={{ width: "100%" }}
              tagRender={() => null}
            />

            {Array.isArray(currentSkill) && currentSkill.length > 0 && (
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  flexWrap: "wrap",
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                {currentSkill.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      background: "#F3E8FF", // 💜 matches Figma
                      border: "1px solid #C084FC",
                      fontSize: 13,
                      fontWeight: 500,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {item}

                    <span
                      onClick={() => {
                        const updated = currentSkill.filter(
                          (_, i) => i !== index
                        );
                        setCurrentSkill(updated);
                      }}
                      style={{
                        cursor: "pointer",
                        fontSize: 12,
                        color: "#6B21A8",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EXPERIENCE */}
          <div style={{ flex: 1 }}>
            {/* <label
              style={{
                fontSize: 13,
                fontWeight: 590,
                marginBottom: 6,
                display: "block",
              }}
            >
              <span style={{ color: "#B60554" }}>*</span> Experience
            </label> */}
            <label
              style={{
                fontSize: 13,
                fontWeight: 590,
                marginBottom: 6,
                display: "block",
              }}
            >
              {(title === "Primary Skills" || title === "Primary Clouds") && (
                <span style={{ color: "#B60554" }}>* </span>
              )}
              Experience
            </label>

            {/* <InputNumber
              value={experience}
              min={0}
              step={1}
              addonAfter="yrs"
              style={{ width: "100%" }}
              parser={(value) => value.replace(/[^\d.]/g, "")}
              formatter={(value) => value}
              onChange={(value) => {
                if (value === null) {
                  setExperience(null);
                  return;
                }
                const regex = /^\d{1,2}(\.\d{0,2})?$/;
                if (regex.test(value.toString())) {
                  setExperience(value);
                }
              }}
            /> */}

            <Input
              value={experience}
              suffix="yrs"
              style={{ width: "100%" }}
              onChange={(e) => {
                const value = e.target.value;

                // allow only digits and dot
                if (!/^[0-9.]*$/.test(value)) {
                  message.error("Only numbers and decimal point are allowed");
                  return;
                }

                // only one dot
                if ((value.match(/\./g) || []).length > 1) {
                  message.error("Only one decimal point is allowed");
                  return;
                }

                // max 2 digits before & after decimal
                const regex = /^\d{0,2}(\.\d{0,2})?$/;
                if (!regex.test(value)) {
                  message.error(
                    "Maximum 2 digits allowed before and after decimal (e.g. 12 or 12.34)"
                  );
                  return;
                }

                setExperience(value);
              }}
            />
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 16,
          }}
        >
          {/* CANCEL */}
          <div
            onClick={() => {
              setModalVisible(false);
              setEditingIndex(null);
            }}
            style={{
              height: 40,
              padding: "0 24px",
              borderRadius: 100,
              border: "1px solid #666",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 590,
              color: "#666",
            }}
          >
            Cancel
          </div>

          {/* SAVE */}
          <div
            onClick={saveSkill}
            style={{
              height: 40,
              padding: "0 24px",
              borderRadius: 100,
              background: "#1677FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 590,
              color: "#fff",
            }}
          >
            Save
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SkillManagerCard;
