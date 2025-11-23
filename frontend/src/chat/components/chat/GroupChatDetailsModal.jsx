// import { Dialog, Transition } from "@headlessui/react";
// import {
//   PencilIcon,
//   TrashIcon,
//   UserGroupIcon,
//   UserPlusIcon,
//   XMarkIcon,
// } from "@heroicons/react/20/solid";
// import React, { Fragment, useEffect, useState } from "react";
// import {
//   addParticipantToGroup,
//   deleteGroup,
//   getAvailableUsers,
//   getGroupInfo,
//   removeParticipantFromGroup,
//   updateGroupName,
// } from "../../api";
// import { useAuth } from "../../context/AuthContext";
// import { requestHandler } from "../../utils";
// import Button from "../Button";
// import Input from "../Input";
// import Select from "../Select";

// const GroupChatDetailsModal = ({ open, onClose, chatId, onGroupDelete }) => {
//   const { user } = useAuth();
//   const [addingParticipant, setAddingParticipant] = useState(false);
//   const [renamingGroup, setRenamingGroup] = useState(false);
//   const [participantToBeAdded, setParticipantToBeAdded] = useState("");
//   const [newGroupName, setNewGroupName] = useState("");
//   const [groupDetails, setGroupDetails] = useState(null);
//   const [users, setUsers] = useState([]);

//   const handleGroupNameUpdate = async () => {
//     if (!newGroupName) return alert("Group name is required");
//     requestHandler(
//       async () => await updateGroupName(chatId, newGroupName),
//       null,
//       (res) => {
//         const { data } = res;
//         setGroupDetails(data);
//         setNewGroupName(data.name);
//         setRenamingGroup(false);
//         alert("Group name updated to " + data.name);
//       },
//       alert
//     );
//   };

//   const getUsers = async () => {
//     requestHandler(
//       async () => await getAvailableUsers(),
//       null,
//       (res) => {
//         const { data } = res;
//         setUsers(data || []);
//       },
//       alert
//     );
//   };

//   const deleteGroupChat = async () => {
//     if (groupDetails?.admin !== user?._id) {
//       return alert("You are not the admin of the group");
//     }
//     requestHandler(
//       async () => await deleteGroup(chatId),
//       null,
//       () => {
//         onGroupDelete(chatId);
//         handleClose();
//       },
//       alert
//     );
//   };

//   const removeParticipant = async (participantId) => {
//     requestHandler(
//       async () => await removeParticipantFromGroup(chatId, participantId),
//       null,
//       () => {
//         const updatedGroupDetails = {
//           ...groupDetails,
//           participants:
//             (groupDetails?.participants &&
//               groupDetails?.participants?.filter(
//                 (p) => p._id !== participantId
//               )) ||
//             [],
//         };
//         setGroupDetails(updatedGroupDetails);
//         alert("Participant removed");
//       },
//       alert
//     );
//   };

//   const addParticipant = async () => {
//     if (!participantToBeAdded)
//       return alert("Please select a participant to add.");
//     requestHandler(
//       async () => await addParticipantToGroup(chatId, participantToBeAdded),
//       null,
//       (res) => {
//         const { data } = res;
//         const updatedGroupDetails = {
//           ...groupDetails,
//           participants: data?.participants || [],
//         };
//         setGroupDetails(updatedGroupDetails);
//         alert("Participant added");
//       },
//       alert
//     );
//   };

//   const fetchGroupInformation = async () => {
//     requestHandler(
//       async () => await getGroupInfo(chatId),
//       null,
//       (res) => {
//         const { data } = res;
//         setGroupDetails(data);
//         setNewGroupName(data?.name || "");
//       },
//       alert
//     );
//   };

//   const handleClose = () => {
//     onClose();
//   };

//   useEffect(() => {
//     if (!open) return;
//     fetchGroupInformation();
//     getUsers();
//   }, [open]);

//   return (
//     <Transition.Root show={open} as={Fragment}>
//       <Dialog as="div" className="relative z-40" onClose={handleClose}>
//         <Transition.Child
//           as={Fragment}
//           enter="transform transition ease-in-out duration-500 sm:duration-700"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="transform transition ease-in-out duration-500 sm:duration-700"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black/50" />
//         </Transition.Child>

//         <div className="fixed inset-0 overflow-hidden">
//           <div className="absolute inset-0 overflow-hidden">
//             <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
//               <Transition.Child
//                 as={Fragment}
//                 enter="transform transition ease-in-out duration-500 sm:duration-700"
//                 enterFrom="translate-x-full"
//                 enterTo="translate-x-0"
//                 leave="transform transition ease-in-out duration-500 sm:duration-700"
//                 leaveFrom="translate-x-0"
//                 leaveTo="translate-x-full"
//               >
//                 <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
//                   <div className="flex h-full flex-col overflow-y-scroll bg-secondary py-6 shadow-xl">
//                     <div className="px-4 sm:px-6">
//                       <div className="flex items-start justify-between">
//                         <div className="ml-3 flex h-7 items-center">
//                           <button
//                             type="button"
//                             className="rounded-md text-zinc-400 hover:text-zinc-500 focus:outline-none"
//                             onClick={handleClose}
//                           >
//                             <XMarkIcon className="h-6 w-6" aria-hidden="true" />
//                           </button>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="relative mt-6 flex-1 px-4 sm:px-6">
//                       <div className="flex flex-col items-start">
//                         <div className="flex pl-16 justify-center items-center relative w-full h-max gap-3">
//                           {groupDetails?.participants.slice(0, 3).map((p) => (
//                             <img
//                               className="w-24 h-24 -ml-16 rounded-full outline outline-4 outline-secondary"
//                               key={p._id}
//                               src={p.avatar.url}
//                               alt="avatar"
//                             />
//                           ))}
//                           {groupDetails?.participants?.length > 3 && (
//                             <p>+{groupDetails.participants.length - 3}</p>
//                           )}
//                         </div>

//                         <div className="w-full flex flex-col justify-center items-center text-center">
//                           {renamingGroup ? (
//                             <div className="w-full flex justify-center items-center mt-5 gap-2">
//                               <Input
//                                 placeholder="Enter new group name..."
//                                 value={newGroupName}
//                                 onChange={(e) =>
//                                   setNewGroupName(e.target.value)
//                                 }
//                               />
//                               <Button
//                                 severity="primary"
//                                 onClick={handleGroupNameUpdate}
//                               >
//                                 Save
//                               </Button>
//                               <Button
//                                 severity="secondary"
//                                 onClick={() => setRenamingGroup(false)}
//                               >
//                                 Cancel
//                               </Button>
//                             </div>
//                           ) : (
//                             <div className="w-full inline-flex justify-center items-center text-center mt-5">
//                               <h1 className="text-2xl font-semibold truncate-1">
//                                 {groupDetails?.name}
//                               </h1>
//                               {groupDetails?.admin === user?._id && (
//                                 <button onClick={() => setRenamingGroup(true)}>
//                                   <PencilIcon className="w-5 h-5 ml-4" />
//                                 </button>
//                               )}
//                             </div>
//                           )}

//                           <p className="mt-2 text-zinc-400 text-sm">
//                             Group · {groupDetails?.participants.length}{" "}
//                             participants
//                           </p>
//                         </div>

//                         <hr className="border-[0.1px] border-zinc-600 my-5 w-full" />

//                         <div className="w-full">
//                           <p className="inline-flex items-center">
//                             <UserGroupIcon className="h-6 w-6 mr-2" />{" "}
//                             {groupDetails?.participants.length} Participants
//                           </p>

//                           <div className="w-full">
//                             {groupDetails?.participants?.map((part) => (
//                               <React.Fragment key={part._id}>
//                                 <div className="flex justify-between items-center w-full py-4">
//                                   <div className="flex gap-3 items-start w-full">
//                                     <img
//                                       className="h-12 w-12 rounded-full"
//                                       src={part.avatar.url}
//                                       alt={part.username}
//                                     />
//                                     <div>
//                                       <p className="text-white font-semibold text-sm inline-flex items-center">
//                                         {part.username}
//                                         {part._id === groupDetails.admin && (
//                                           <span className="ml-2 text-[10px] px-4 bg-success/10 border border-success rounded-full text-success">
//                                             admin
//                                           </span>
//                                         )}
//                                       </p>
//                                       <small className="text-zinc-400">
//                                         {part.email}
//                                       </small>
//                                     </div>
//                                   </div>

//                                   {groupDetails.admin === user?._id && (
//                                     <Button
//                                       size="small"
//                                       severity="danger"
//                                       onClick={() => {
//                                         const ok = confirm(
//                                           "Are you sure you want to remove " +
//                                             part.username +
//                                             "?"
//                                         );
//                                         if (ok) removeParticipant(part._id);
//                                       }}
//                                     >
//                                       Remove
//                                     </Button>
//                                   )}
//                                 </div>
//                                 <hr className="border-[0.1px] border-zinc-600 my-1 w-full" />
//                               </React.Fragment>
//                             ))}

//                             {groupDetails?.admin === user?._id && (
//                               <div className="w-full my-5 flex flex-col justify-center items-center gap-4">
//                                 {!addingParticipant ? (
//                                   <Button
//                                     onClick={() => setAddingParticipant(true)}
//                                     fullWidth
//                                     severity="primary"
//                                   >
//                                     <UserPlusIcon className="w-5 h-5 mr-1" />{" "}
//                                     Add participant
//                                   </Button>
//                                 ) : (
//                                   <div className="w-full flex gap-2 items-center">
//                                     <Select
//                                       placeholder="Select a user to add..."
//                                       value={participantToBeAdded}
//                                       options={users.map((u) => ({
//                                         label: u.username,
//                                         value: u._id,
//                                       }))}
//                                       onChange={({ value }) =>
//                                         setParticipantToBeAdded(value)
//                                       }
//                                     />
//                                     <Button onClick={addParticipant}>
//                                       + Add
//                                     </Button>
//                                     <Button
//                                       severity="secondary"
//                                       onClick={() => {
//                                         setAddingParticipant(false);
//                                         setParticipantToBeAdded("");
//                                       }}
//                                     >
//                                       Cancel
//                                     </Button>
//                                   </div>
//                                 )}

//                                 <Button
//                                   fullWidth
//                                   severity="danger"
//                                   onClick={() => {
//                                     const ok = confirm(
//                                       "Are you sure you want to delete this group?"
//                                     );
//                                     if (ok) deleteGroupChat();
//                                   }}
//                                 >
//                                   <TrashIcon className="w-5 h-5 mr-1" /> Delete
//                                   group
//                                 </Button>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </Dialog.Panel>
//               </Transition.Child>
//             </div>
//           </div>
//         </div>
//       </Dialog>
//     </Transition.Root>
//   );
// };

// export default GroupChatDetailsModal;

import {
  Drawer,
  Avatar,
  Button,
  Input,
  Select,
  Space,
  Tag,
  List,
  Modal,
  Divider,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  TeamOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  addParticipantToGroup,
  deleteGroup,
  getAvailableUsers,
  getGroupInfo,
  removeParticipantFromGroup,
  updateGroupName,
} from "../../api";
import { useAuth } from "../../context/AuthContext";
import { requestHandler } from "../../utils";

const GroupChatDetailsModal = ({ open, onClose, chatId, onGroupDelete }) => {
  const { user } = useAuth();
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [renamingGroup, setRenamingGroup] = useState(false);
  const [participantToBeAdded, setParticipantToBeAdded] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [groupDetails, setGroupDetails] = useState(null);
  const [users, setUsers] = useState([]);

  const handleGroupNameUpdate = async () => {
    if (!newGroupName) return alert("Group name is required");
    requestHandler(
      async () => await updateGroupName(chatId, newGroupName),
      null,
      (res) => {
        const { data } = res;
        setGroupDetails(data);
        setNewGroupName(data.name);
        setRenamingGroup(false);
        alert("Group name updated to " + data.name);
      },
      alert
    );
  };

  const getUsers = async () => {
    requestHandler(
      async () => await getAvailableUsers(),
      null,
      (res) => {
        const { data } = res;
        setUsers(data || []);
      },
      alert
    );
  };

  const deleteGroupChat = async () => {
    if (groupDetails?.admin !== user?._id) {
      return alert("You are not the admin of the group");
    }

    Modal.confirm({
      title: "Are you sure you want to delete this group?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        await requestHandler(
          async () => await deleteGroup(chatId),
          null,
          () => {
            onGroupDelete(chatId);
            handleClose();
          },
          alert
        );
      },
    });
  };

  const removeParticipant = async (participantId) => {
    Modal.confirm({
      title: `Are you sure you want to remove this participant?`,
      okText: "Remove",
      okType: "danger",
      onOk: async () => {
        await requestHandler(
          async () => await removeParticipantFromGroup(chatId, participantId),
          null,
          () => {
            const updatedGroupDetails = {
              ...groupDetails,
              participants:
                groupDetails?.participants?.filter(
                  (p) => p._id !== participantId
                ) || [],
            };
            setGroupDetails(updatedGroupDetails);
            alert("Participant removed");
          },
          alert
        );
      },
    });
  };

  const addParticipant = async () => {
    if (!participantToBeAdded)
      return alert("Please select a participant to add.");
    requestHandler(
      async () => await addParticipantToGroup(chatId, participantToBeAdded),
      null,
      (res) => {
        const { data } = res;
        const updatedGroupDetails = {
          ...groupDetails,
          participants: data?.participants || [],
        };
        setGroupDetails(updatedGroupDetails);
        setParticipantToBeAdded("");
        setAddingParticipant(false);
        alert("Participant added");
      },
      alert
    );
  };

  const fetchGroupInformation = async () => {
    requestHandler(
      async () => await getGroupInfo(chatId),
      null,
      (res) => {
        const { data } = res;
        setGroupDetails(data);
        setNewGroupName(data?.name || "");
      },
      alert
    );
  };

  const handleClose = () => {
    setRenamingGroup(false);
    setAddingParticipant(false);
    setParticipantToBeAdded("");
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    fetchGroupInformation();
    getUsers();
  }, [open]);

  const isAdmin = groupDetails?.admin === user?._id;

  return (
    <Drawer
      title={null}
      placement="right"
      onClose={handleClose}
      open={open}
      width={600}
      closeIcon={<CloseOutlined />}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        {/* Group Avatar */}
        <div style={{ textAlign: "center" }}>
          <Avatar.Group maxCount={3} size={80}>
            {groupDetails?.participants.slice(0, 3).map((p) => (
              <Avatar key={p._id} src={p.avatar.url} size={80} />
            ))}
          </Avatar.Group>
          {groupDetails?.participants?.length > 3 && (
            <div style={{ marginTop: 8 }}>
              +{groupDetails.participants.length - 3} more
            </div>
          )}
        </div>

        {/* Group Name */}
        <div style={{ textAlign: "center" }}>
          {renamingGroup ? (
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Enter new group name..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                size="large"
              />
              <Button type="primary" onClick={handleGroupNameUpdate}>
                Save
              </Button>
              <Button onClick={() => setRenamingGroup(false)}>Cancel</Button>
            </Space.Compact>
          ) : (
            <Space>
              <h2 style={{ margin: 0 }}>{groupDetails?.name}</h2>
              {isAdmin && (
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => setRenamingGroup(true)}
                />
              )}
            </Space>
          )}
          <div style={{ color: "#8c8c8c", marginTop: 4 }}>
            Group · {groupDetails?.participants.length} participants
          </div>
        </div>

        <Divider />

        {/* Participants List */}
        <div>
          <div
            style={{ marginBottom: 16, display: "flex", alignItems: "center" }}
          >
            <TeamOutlined style={{ marginRight: 8, fontSize: 18 }} />
            <span style={{ fontSize: 16, fontWeight: 500 }}>
              {groupDetails?.participants.length} Participants
            </span>
          </div>

          <List
            dataSource={groupDetails?.participants || []}
            renderItem={(participant) => (
              <List.Item
                actions={
                  isAdmin
                    ? [
                        <Button
                          danger
                          size="small"
                          onClick={() => removeParticipant(participant._id)}
                        >
                          Remove
                        </Button>,
                      ]
                    : []
                }
              >
                <List.Item.Meta
                  avatar={<Avatar src={participant.avatar.url} size={48} />}
                  title={
                    <Space>
                      {participant.username}
                      {participant._id === groupDetails.admin && (
                        <Tag color="success">admin</Tag>
                      )}
                    </Space>
                  }
                  description={participant.email}
                />
              </List.Item>
            )}
          />

          {isAdmin && (
            <Space
              direction="vertical"
              style={{ width: "100%", marginTop: 16 }}
            >
              {!addingParticipant ? (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  block
                  onClick={() => setAddingParticipant(true)}
                >
                  Add participant
                </Button>
              ) : (
                <Space.Compact style={{ width: "100%" }}>
                  <Select
                    placeholder="Select a user to add..."
                    value={participantToBeAdded}
                    onChange={setParticipantToBeAdded}
                    style={{ flex: 1 }}
                    options={users.map((u) => ({
                      label: u.username,
                      value: u._id,
                    }))}
                  />
                  <Button type="primary" onClick={addParticipant}>
                    Add
                  </Button>
                  <Button
                    onClick={() => {
                      setAddingParticipant(false);
                      setParticipantToBeAdded("");
                    }}
                  >
                    Cancel
                  </Button>
                </Space.Compact>
              )}

              <Button
                danger
                icon={<DeleteOutlined />}
                block
                onClick={deleteGroupChat}
              >
                Delete group
              </Button>
            </Space>
          )}
        </div>
      </Space>
    </Drawer>
  );
};

export default GroupChatDetailsModal;
