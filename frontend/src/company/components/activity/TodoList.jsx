// import { useEffect, useState } from "react";
// import { Input, Checkbox, Button, List, Progress } from "antd";

// import {
//   CreateRecruiterTodo,
//   GetMyTodos,
//   UpdateRecruiterTodo,
//   DeleteRecruiterTodo,
// } from "../../api/api";

// /* ✅ UI-ONLY DEFAULT TODOS */
// const DEFAULT_TODOS = [
//   { id: "d1", title: "HR Screening", completed: false, isDefault: true },
//   { id: "d2", title: "Technical Round", completed: false, isDefault: true },
//   { id: "d3", title: "Manager Round", completed: false, isDefault: true },
//   { id: "d4", title: "Offer Discussion", completed: false, isDefault: true },
//   { id: "d5", title: "Final Decision", completed: false, isDefault: true },
// ];

// const TodoList = () => {
//   const [todos, setTodos] = useState([]);          // backend todos
//   const [defaultTodos, setDefaultTodos] = useState(DEFAULT_TODOS);
//   const [text, setText] = useState("");

//   /* 🔁 LOAD MANUAL TODOS */
//   useEffect(() => {
//     GetMyTodos().then((res) => {
//       if (Array.isArray(res.data)) {
//         setTodos(res.data);
//       } else {
//         setTodos([]);
//       }
//     });
//   }, []);

//   /* ➕ ADD MANUAL TODO (DB) */
//   const addTodo = async (e) => {
//     if (e) e.preventDefault();
//     if (!text.trim()) return;

//     const res = await CreateRecruiterTodo({ title: text });
//     setTodos((prev) => [res.data.data, ...prev]);
//     setText("");
//   };

//   /* 🔢 MERGED TODOS (FOR UI + PROGRESS) */
// //   const allTodos = [...defaultTodos, ...todos];
// const allTodos = [...defaultTodos, ...todos].sort(
//   (a, b) => Number(b.completed) - Number(a.completed)
// );
// const totalTodos = allTodos.length;
//   const completedTodos = allTodos.filter((t) => t?.completed).length;

//   const percentage =
//     totalTodos === 0
//       ? 0
//       : Math.round((completedTodos / totalTodos) * 100);

//   return (
//     <div>
//       {/* ✅ PROGRESS CIRCLE */}
//       <div style={{ textAlign: "center", marginBottom: 12 }}>
//         <Progress
//           type="circle"
//           percent={percentage}
//           size={90}
//           strokeColor="#52c41a"
//           format={() =>
//             completedTodos === totalTodos && totalTodos > 0 ? "✓" : `${percentage}%`
//           }
//         />
//         <div style={{ marginTop: 8, fontWeight: 500 }}>
//           {completedTodos} / {totalTodos} done
//         </div>
//       </div>

//       {/* ➕ ADD TODO */}
//       <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
       

//         <Input
//   placeholder="Add todo"
//   value={text}
//   onChange={(e) => {
//     const value = e.target.value;

//     // allow only letters, numbers, spaces
//     if (/^[A-Za-z0-9 ]*$/.test(value)) {
//       setText(value);
//     }
//   }}
//   onKeyDown={(e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       addTodo(e);
//     }
//   }}
// />


//         <Button
//           type="primary"
//           htmlType="button"
//           onClick={addTodo}
//           disabled={!text.trim()}
//         >
//           Add
//         </Button>
//       </div>

//       {/* 📋 TODO LIST */}
//       <List
//         dataSource={allTodos}
        
//         renderItem={(todo) => (
//           <List.Item
//             actions={
//               todo.isDefault
//                 ? []
//                 : [
//                     <Button
//                       danger
//                       htmlType="button"
//                       onClick={() => {
//                         DeleteRecruiterTodo(todo.id);
//                         setTodos(todos.filter((t) => t.id !== todo.id));
//                       }}
//                     >
//                       Delete
//                     </Button>,
//                   ]
//             }
//           >
//             <Checkbox
//               checked={todo.completed}
//               onChange={() => {
//                 if (todo.isDefault) {
//                   setDefaultTodos((prev) =>
//                     prev.map((t) =>
//                       t.id === todo.id
//                         ? { ...t, completed: !t.completed }
//                         : t
//                     )
//                   );
//                 } else {
//                   UpdateRecruiterTodo(todo.id, {
//                     completed: !todo.completed,
//                   });

//                   setTodos(
//                     todos.map((t) =>
//                       t.id === todo.id
//                         ? { ...t, completed: !t.completed }
//                         : t
//                     )
//                   );
//                 }
//               }}
//             >
//               {todo.title}
//             </Checkbox>
//           </List.Item>
//         )}
//       />
//     </div>
//   );
// };

// export default TodoList;



import { useEffect, useState } from "react";
import { Input, Checkbox, Button, List, Progress, message } from "antd";

import {
  CreateRecruiterTodo,
  GetMyTodos,
  UpdateRecruiterTodo,
  DeleteRecruiterTodo,
} from "../../api/api";

const TodoList = () => {
  const [todos, setTodos] = useState([]); // ✅ BACKEND SOURCE OF TRUTH
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔁 LOAD TODOS (DEFAULT + MANUAL FROM BACKEND) */
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setLoading(true);
        const res = await GetMyTodos();

        if (Array.isArray(res?.data?.data)) {
          setTodos(res.data.data);
        } else {
          setTodos([]);
        }
      } catch (err) {
        console.error("Load todos error:", err);
        message.error("Failed to load todos");
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  /* ➕ ADD TODO (MANUAL) */
  const addTodo = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await CreateRecruiterTodo({ title: text.trim() });

      if (res?.data?.data) {
        // ✅ add to bottom (keeps backend order)
        setTodos((prev) => [...prev, res.data.data]);
        setText("");
      }
    } catch (err) {
      console.error("Add todo error:", err);
      message.error("Todo already exists");
    }
  };

  /* 📊 PROGRESS */
  const totalTodos = todos.length;
  const completedTodos = todos.filter((t) => t.completed).length;
  const percentage =
    totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100);

  return (
    <div>
      {/* 🔵 PROGRESS */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <Progress
          type="circle"
          percent={percentage}
          size={90}
          strokeColor="#52c41a"
          format={() =>
            totalTodos > 0 && completedTodos === totalTodos
              ? "✓"
              : `${percentage}%`
          }
        />
        <div style={{ marginTop: 8, fontWeight: 500 }}>
          {completedTodos} / {totalTodos} done
        </div>
      </div>

      {/* ➕ ADD TODO */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Input
          placeholder="Add todo"
          value={text}
          onChange={(e) => {
            const value = e.target.value;
            if (/^[A-Za-z0-9 ]*$/.test(value)) {
              setText(value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTodo(e);
          }}
        />

        <Button
          type="primary"
          onClick={addTodo}
          disabled={!text.trim()}
          loading={loading}
        >
          Add
        </Button>
      </div>

      {/* 📋 TODO LIST */}
      <List
        loading={loading}
        dataSource={todos}
        locale={{ emptyText: "No todos" }}
        renderItem={(todo) => (
          <List.Item
            actions={
              todo.isDefault
                ? []
                : [
                    <Button
                      danger
                      size="small"
                      onClick={async () => {
                        try {
                          await DeleteRecruiterTodo(todo.id);
                          setTodos((prev) =>
                            prev.filter((t) => t.id !== todo.id)
                          );
                        } catch (err) {
                          message.error("Failed to delete todo");
                        }
                      }}
                    >
                      Delete
                    </Button>,
                  ]
            }
          >
            <Checkbox
              checked={todo.completed}
              onChange={async () => {
                try {
                  await UpdateRecruiterTodo(todo.id, {
                    completed: !todo.completed,
                  });

                  // ✅ optimistic UI update
                  setTodos((prev) =>
                    prev.map((t) =>
                      t.id === todo.id
                        ? { ...t, completed: !t.completed }
                        : t
                    )
                  );
                } catch (err) {
                  message.error("Failed to update todo");
                }
              }}
            >
              {todo.title}
            </Checkbox>
          </List.Item>
        )}
      />
    </div>
  );
};

export default TodoList;

