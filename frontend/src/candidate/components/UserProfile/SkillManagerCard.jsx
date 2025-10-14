// import React, { useState } from "react";
// import {
//   Card,
//   Button,
//   Modal,
//   List,
//   Select,
//   Space,
//   Empty,
//   Typography,
//   Popconfirm,
//   message,
// } from "antd";
// import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
// import ReusableSelect from "./ReusableSelect";

// const { Text } = Typography;

// const SkillManagerCard = ({
//   title = "Skills",
//   fetchFunction,
//   addFunction,
//   value = [],
//   onChange,
// }) => {
//   const [open, setOpen] = useState(false);
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [skills, setSkills] = useState(value || []);
//   const [selectedSkill, setSelectedSkill] = useState([]);
//   const [selectedExperience, setSelectedExperience] = useState(null);

//   const experienceOptions = [
//     "< 1 year",
//     "1 year",
//     "2 years",
//     "3 years",
//     "4 years",
//     "5 years",
//     "6 years",
//     "7 years",
//     "8 years",
//     "9 years",
//     "10 years",
//     "11 years",
//     "12 years",
//     "13 years",
//     "14 years",
//     "15 years",
//   ];

//   // Map experience string to numeric value (for saving)
//   const parseExperienceToNumber = (label) => {
//     if (label.startsWith("<")) return 0;
//     return parseInt(label);
//   };

//   const handleAdd = () => {
//     setEditingIndex(null);
//     setSelectedSkill([]);
//     setSelectedExperience(null);
//     setOpen(true);
//   };

//   const handleEdit = (index) => {
//     const item = skills[index];
//     setEditingIndex(index);
//     setSelectedSkill([item.name]);
//     setSelectedExperience(
//       item.experience < 1
//         ? "< 1 year"
//         : `${item.experience} year${item.experience > 1 ? "s" : ""}`
//     );
//     setOpen(true);
//   };

//   const handleDelete = (index) => {
//     const updated = skills.filter((_, i) => i !== index);
//     setSkills(updated);
//     onChange?.(updated);
//     message.success("Deleted successfully");
//   };

//   const handleSubmit = () => {
//     if (!selectedSkill.length || !selectedExperience) {
//       message.warning("Please select both skill and experience");
//       return;
//     }

//     const newEntry = {
//       name: selectedSkill[0],
//       experience: parseExperienceToNumber(selectedExperience),
//     };

//     let updated = [...skills];
//     if (editingIndex !== null) {
//       updated[editingIndex] = newEntry;
//     } else {
//       const exists = updated.find(
//         (item) => item.name.toLowerCase() === newEntry.name.toLowerCase()
//       );
//       if (exists) {
//         message.warning("Skill already added");
//         return;
//       }
//       updated.push(newEntry);
//     }

//     setSkills(updated);
//     onChange?.(updated);
//     setOpen(false);
//     message.success(
//       editingIndex !== null ? "Updated successfully" : "Added successfully"
//     );
//   };

//   return (
//     <>
//       <Card
//         title={<Text strong>{title}</Text>}
//         extra={
//           <Button
//             type="primary"
//             icon={<PlusOutlined />}
//             onClick={handleAdd}
//             size="small"
//           >
//             Add
//           </Button>
//         }
//         style={{ borderRadius: 12 }}
//       >
//         {skills.length === 0 ? (
//           <Empty
//             description={<Text type="secondary">No skills added yet</Text>}
//             image={Empty.PRESENTED_IMAGE_SIMPLE}
//           />
//         ) : (
//           <List
//             dataSource={skills}
//             renderItem={(item, index) => (
//               <List.Item
//                 actions={[
//                   <Button
//                     icon={<EditOutlined />}
//                     type="text"
//                     onClick={() => handleEdit(index)}
//                   />,
//                   <Popconfirm
//                     title="Are you sure you want to delete this?"
//                     onConfirm={() => handleDelete(index)}
//                     okText="Yes"
//                     cancelText="No"
//                   >
//                     <Button icon={<DeleteOutlined />} danger type="text" />
//                   </Popconfirm>,
//                 ]}
//               >
//                 <Space>
//                   <Text strong>{item.name}</Text>
//                   <Text type="secondary">
//                     —{" "}
//                     {item.experience < 1
//                       ? "< 1 year"
//                       : `${item.experience} year${
//                           item.experience > 1 ? "s" : ""
//                         }`}
//                   </Text>
//                 </Space>
//               </List.Item>
//             )}
//           />
//         )}
//       </Card>

//       <Modal
//         title={editingIndex !== null ? "Edit Skill" : "Add Skill"}
//         open={open}
//         onCancel={() => setOpen(false)}
//         onOk={handleSubmit}
//         okText={editingIndex !== null ? "Update" : "Add"}
//         destroyOnClose
//       >
//         <Space direction="vertical" style={{ width: "100%" }}>
//           <ReusableSelect
//             placeholder="Select skill"
//             value={selectedSkill}
//             onChange={setSelectedSkill}
//             fetchFunction={fetchFunction}
//             addFunction={addFunction}
//           />
//           <Select
//             placeholder="Select experience"
//             value={selectedExperience}
//             onChange={setSelectedExperience}
//             options={experienceOptions.map((label) => ({
//               label,
//               value: label,
//             }))}
//             style={{ width: "100%" }}
//           />
//         </Space>
//       </Modal>
//     </>
//   );
// };

// export default SkillManagerCard;

// import React, { useState } from "react";
// import {
//   Card,
//   Button,
//   Modal,
//   List,
//   Select,
//   Space,
//   Empty,
//   Typography,
//   Popconfirm,
//   message,
// } from "antd";
// import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
// import ReusableSelect from "./ReusableSelect";

// const { Text } = Typography;

// const SkillManagerCard = ({
//   title = "Skills",
//   fetchFunction,
//   addFunction,
//   value = [],
//   onChange,
// }) => {
//   const [open, setOpen] = useState(false);
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [selectedSkill, setSelectedSkill] = useState([]);
//   const [selectedExperience, setSelectedExperience] = useState(null);

//   const skills = value || [];

//   const experienceOptions = [
//     "< 1 year",
//     "1 year",
//     "2 years",
//     "3 years",
//     "4 years",
//     "5 years",
//     "6 years",
//     "7 years",
//     "8 years",
//     "9 years",
//     "10 years",
//     "11 years",
//     "12 years",
//     "13 years",
//     "14 years",
//     "15 years",
//   ];

//   const parseExperienceToNumber = (label) => {
//     if (label.startsWith("<")) return 0;
//     return parseInt(label);
//   };

//   const handleAdd = () => {
//     setEditingIndex(null);
//     setSelectedSkill([]);
//     setSelectedExperience(null);
//     setOpen(true);
//   };

//   const handleEdit = (index) => {
//     const item = skills[index];
//     setEditingIndex(index);
//     setSelectedSkill([item.name]);
//     setSelectedExperience(
//       item.experience < 1
//         ? "< 1 year"
//         : `${item.experience} year${item.experience > 1 ? "s" : ""}`
//     );
//     setOpen(true);
//   };

//   const handleDelete = (index) => {
//     const updated = skills.filter((_, i) => i !== index);
//     onChange?.(updated);
//     message.success("Deleted successfully");
//   };

//   const handleSubmit = () => {
//     if (!selectedSkill.length || !selectedExperience) {
//       message.warning("Please select both skill and experience");
//       return;
//     }

//     const newEntry = {
//       name: selectedSkill[0],
//       experience: parseExperienceToNumber(selectedExperience),
//     };

//     let updated = [...skills];
//     if (editingIndex !== null) {
//       updated[editingIndex] = newEntry;
//     } else {
//       const exists = updated.find(
//         (item) => item.name.toLowerCase() === newEntry.name.toLowerCase()
//       );
//       if (exists) {
//         message.warning("Skill already added");
//         return;
//       }
//       updated.push(newEntry);
//     }

//     onChange?.(updated);
//     setOpen(false);
//     message.success(
//       editingIndex !== null ? "Updated successfully" : "Added successfully"
//     );
//   };

//   return (
//     <>
//       <Card
//         title={<Text strong>{title}</Text>}
//         extra={
//           <Button
//             type="primary"
//             icon={<PlusOutlined />}
//             onClick={handleAdd}
//             size="small"
//           >
//             Add
//           </Button>
//         }
//         style={{ borderRadius: 12 }}
//       >
//         {skills.length === 0 ? (
//           <Empty
//             description={<Text type="secondary">No skills added yet</Text>}
//             image={Empty.PRESENTED_IMAGE_SIMPLE}
//           />
//         ) : (
//           <List
//             dataSource={skills}
//             renderItem={(item, index) => (
//               <List.Item
//                 actions={[
//                   <Button
//                     icon={<EditOutlined />}
//                     type="text"
//                     onClick={() => handleEdit(index)}
//                   />,
//                   <Popconfirm
//                     title="Are you sure you want to delete this?"
//                     onConfirm={() => handleDelete(index)}
//                     okText="Yes"
//                     cancelText="No"
//                   >
//                     <Button icon={<DeleteOutlined />} danger type="text" />
//                   </Popconfirm>,
//                 ]}
//               >
//                 <Space>
//                   <Text strong>{item.name}</Text>
//                   <Text type="secondary">
//                     —{" "}
//                     {item.experience < 1
//                       ? "< 1 year"
//                       : `${item.experience} year${
//                           item.experience > 1 ? "s" : ""
//                         }`}
//                   </Text>
//                 </Space>
//               </List.Item>
//             )}
//           />
//         )}
//       </Card>

//       <Modal
//         title={editingIndex !== null ? "Edit Skill" : "Add Skill"}
//         open={open}
//         onCancel={() => setOpen(false)}
//         onOk={handleSubmit}
//         okText={editingIndex !== null ? "Update" : "Add"}
//         destroyOnClose
//       >
//         <Space direction="vertical" style={{ width: "100%" }}>
//           <ReusableSelect
//             placeholder="Select skill"
//             value={selectedSkill}
//             onChange={setSelectedSkill}
//             fetchFunction={fetchFunction}
//             addFunction={addFunction}
//           />
//           <Select
//             placeholder="Select experience"
//             value={selectedExperience}
//             onChange={setSelectedExperience}
//             options={experienceOptions.map((label) => ({
//               label,
//               value: label,
//             }))}
//             style={{ width: "100%" }}
//           />
//         </Space>
//       </Modal>
//     </>
//   );
// };

// export default SkillManagerCard;

import React, { useState, useEffect } from "react";
import { Button, Modal, Input, List, Card } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ReusableSelect from "./ReusableSelect";

const SkillManagerCard = ({
  title,
  skills = [],
  onSkillsChange,
  fetchFunction,
  addFunction,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSkill, setCurrentSkill] = useState("");
  const [experience, setExperience] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);

  const openModal = () => {
    setCurrentSkill("");
    setExperience(0);
    setEditingIndex(null);
    setModalVisible(true);
  };

  useEffect(() => {
    console.log("Skills updated:", skills);
  }, [skills]);

  const openEditModal = (item, index) => {
    setCurrentSkill(item.name);
    setExperience(item.experience);
    setEditingIndex(index);
    setModalVisible(true);
  };

  const saveSkill = () => {
    if (!currentSkill) {
      return; // Don't save if no skill selected
    }

    let updatedSkills;
    if (editingIndex !== null) {
      // Update existing skill
      updatedSkills = [...skills];
      updatedSkills[editingIndex] = { name: currentSkill, experience };
    } else {
      // Add new skill
      updatedSkills = [...skills, { name: currentSkill, experience }];
    }

    // Call parent's onChange handler
    if (onSkillsChange) {
      onSkillsChange(updatedSkills);
    }

    setModalVisible(false);
    setCurrentSkill("");
    setExperience(0);
    setEditingIndex(null);
  };

  const deleteSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    if (onSkillsChange) {
      onSkillsChange(updatedSkills);
    }
  };

  return (
    <Card
      title={title}
      extra={<Button onClick={openModal}>Add {title}</Button>}
      style={{ height: 300, overflowY: "auto", scrollbarWidth: "none" }}
    >
      <Modal
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
            Select Skill:
          </label>
          <ReusableSelect
            single={true}
            placeholder="Select or add skill"
            fetchFunction={fetchFunction}
            addFunction={addFunction}
            value={currentSkill}
            onChange={(value) => {
              setCurrentSkill(value);
              console.log("vales of skills", value);
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 8 }}>
            Experience:
          </label>
          <Input
            type="number"
            value={experience}
            onChange={(e) => setExperience(parseFloat(e.target.value) || 0)}
            addonAfter="yrs"
          />
        </div>
      </Modal>

      <List
        bordered
        dataSource={skills}
        renderItem={(item, index) => (
          <List.Item
            actions={[
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => openEditModal(item, index)}
              />,
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => deleteSkill(index)}
              />,
            ]}
          >
            {`${item.name} - ${item.experience} yrs`}
          </List.Item>
        )}
        style={{ marginTop: 16 }}
      />
    </Card>
  );
};

export default SkillManagerCard;
