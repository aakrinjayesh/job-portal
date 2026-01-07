// import { useEffect, useState } from "react";
// import { Input, Checkbox, Button, List } from "antd";


// import {
//   CreateRecruiterTodo,
//   GetMyTodos,
//   UpdateRecruiterTodo,
//   DeleteRecruiterTodo,
// } from "../../api/api";


// const TodoList = () => {
//   const [todos, setTodos] = useState([]);
//   const [text, setText] = useState("");



// useEffect(() => {
//   GetMyTodos().then(res => {
//     if (Array.isArray(res.data)) {
//       setTodos(res.data);
//     } else {
//       setTodos([res.data]); // 👈 wrap single todo into array
//     }
//   });
// }, []);






// const addTodo = async (e) => {
//   if (e) e.preventDefault(); // ✅ STOP PAGE REDIRECT

//   if (!text.trim()) return;

//   const res = await CreateRecruiterTodo({ title: text });



//   setTodos((prev) => [res.data.data, ...prev]); // safer update
//   setText("");
// };




// return (
//   <div>
//     <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      

//       <Input
//   placeholder="Add todo"
//   value={text}
//   onChange={(e) => setText(e.target.value)}
//   onKeyDown={(e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();   // ✅ STOP FORM SUBMIT
//       addTodo(e);
//     }
//   }}
// />


//       <Button
//         type="primary"
//         htmlType="button"
//         onClick={addTodo}
//         disabled={!text.trim()}
//       >
//         Add
//       </Button>
//     </div>

//     <List
//       dataSource={todos}
//       renderItem={(todo) => (
//         <List.Item
//           actions={[
//             <Button
//               danger
//               htmlType="button"
//               onClick={() => {
//                 DeleteRecruiterTodo(todo.id);
//                 setTodos(todos.filter((t) => t.id !== todo.id));
//               }}
//             >
//               Delete
//             </Button>,
//           ]}
//         >
//           <Checkbox
//             checked={todo.completed}
//             onChange={() => {
//               UpdateRecruiterTodo(todo.id, {
//                 completed: !todo.completed,
//               });
//               setTodos(
//                 todos.map((t) =>
//                   t.id === todo.id
//                     ? { ...t, completed: !t.completed }
//                     : t
//                 )
//               );
//             }}
//           >
//             {todo.title}
//           </Checkbox>
//         </List.Item>
//       )}
//     />
//   </div>
// );

// };

// export default TodoList;



import { useEffect, useState } from "react";
import { Input, Checkbox, Button, List, Progress } from "antd";

import {
  CreateRecruiterTodo,
  GetMyTodos,
  UpdateRecruiterTodo,
  DeleteRecruiterTodo,
} from "../../api/api";

/* ✅ UI-ONLY DEFAULT TODOS */
const DEFAULT_TODOS = [
  { id: "d1", title: "HR Screening", completed: false, isDefault: true },
  { id: "d2", title: "Technical Round", completed: false, isDefault: true },
  { id: "d3", title: "Manager Round", completed: false, isDefault: true },
  { id: "d4", title: "Offer Discussion", completed: false, isDefault: true },
  { id: "d5", title: "Final Decision", completed: false, isDefault: true },
];

const TodoList = () => {
  const [todos, setTodos] = useState([]);          // backend todos
  const [defaultTodos, setDefaultTodos] = useState(DEFAULT_TODOS);
  const [text, setText] = useState("");

  /* 🔁 LOAD MANUAL TODOS */
  useEffect(() => {
    GetMyTodos().then((res) => {
      if (Array.isArray(res.data)) {
        setTodos(res.data);
      } else {
        setTodos([]);
      }
    });
  }, []);

  /* ➕ ADD MANUAL TODO (DB) */
  const addTodo = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    const res = await CreateRecruiterTodo({ title: text });
    setTodos((prev) => [res.data.data, ...prev]);
    setText("");
  };

  /* 🔢 MERGED TODOS (FOR UI + PROGRESS) */
//   const allTodos = [...defaultTodos, ...todos];
const allTodos = [...defaultTodos, ...todos].sort(
  (a, b) => Number(b.completed) - Number(a.completed)
);





  const totalTodos = allTodos.length;
  const completedTodos = allTodos.filter((t) => t?.completed).length;

  const percentage =
    totalTodos === 0
      ? 0
      : Math.round((completedTodos / totalTodos) * 100);

  return (
    <div>
      {/* ✅ PROGRESS CIRCLE */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <Progress
          type="circle"
          percent={percentage}
          size={90}
          strokeColor="#52c41a"
          format={() =>
            completedTodos === totalTodos && totalTodos > 0 ? "✓" : `${percentage}%`
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
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTodo(e);
            }
          }}
        />

        <Button
          type="primary"
          htmlType="button"
          onClick={addTodo}
          disabled={!text.trim()}
        >
          Add
        </Button>
      </div>

      {/* 📋 TODO LIST */}
      <List
        dataSource={allTodos}
        
        renderItem={(todo) => (
          <List.Item
            actions={
              todo.isDefault
                ? []
                : [
                    <Button
                      danger
                      htmlType="button"
                      onClick={() => {
                        DeleteRecruiterTodo(todo.id);
                        setTodos(todos.filter((t) => t.id !== todo.id));
                      }}
                    >
                      Delete
                    </Button>,
                  ]
            }
          >
            <Checkbox
              checked={todo.completed}
              onChange={() => {
                if (todo.isDefault) {
                  setDefaultTodos((prev) =>
                    prev.map((t) =>
                      t.id === todo.id
                        ? { ...t, completed: !t.completed }
                        : t
                    )
                  );
                } else {
                  UpdateRecruiterTodo(todo.id, {
                    completed: !todo.completed,
                  });

                  setTodos(
                    todos.map((t) =>
                      t.id === todo.id
                        ? { ...t, completed: !t.completed }
                        : t
                    )
                  );
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
