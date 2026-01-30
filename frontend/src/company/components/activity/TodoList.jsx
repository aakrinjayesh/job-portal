import { useEffect, useState } from "react";
import { Checkbox, List, Progress, Spin, message } from "antd";
import { getCandidateTasks, checkUpdate } from "../../api/api";

const TodoList = ({ candidateId, jobId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("TodoList props:", { candidateId, jobId });
  }, [candidateId, jobId]);

  useEffect(() => {
    let active = true;

    const loadTasks = async () => {
      setLoading(true);
      try {
        const res = await getCandidateTasks({ candidateId, jobId });

        // ✅ res = { status, data }
        // setTasks(Array.isArray(res?.data) ? res.data : []);
        setTasks(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        message.error("Failed to load todos");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    if (candidateId && jobId) {
      loadTasks();
    }
    // else {
    //   setTasks([]);
    //   setLoading(false);
    // }

    return () => {
      active = false;
    };
  }, [candidateId, jobId]);

  /* 📊 PROGRESS */
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const percentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  /* ☑️ CHECKBOX UPDATE */
  const onToggle = async (taskId, checked) => {
    const previousTasks = tasks; // 🔁 save state

    // optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: checked } : t))
    );

    try {
      await checkUpdate({ taskId, completed: checked });
    } catch (err) {
      message.error("Failed to update task");
      setTasks(previousTasks); // ⬅️ rollback if API fails
    }
  };

  return (
    <div>
      {/* 🔵 PROGRESS */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <Progress
          type="circle"
          percent={percentage}
          size={90}
          format={() =>
            totalTasks > 0 && completedTasks === totalTasks
              ? "✓"
              : `${percentage}%`
          }
        />
        <div style={{ marginTop: 8, fontWeight: 500 }}>
          {completedTasks} / {totalTasks} done
        </div>
      </div>

      {/* 🔄 CONTENT */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 150,
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <List
          rowKey="id"
          dataSource={tasks}
          locale={{ emptyText: "No todos" }}
          renderItem={(task) => (
            <List.Item>
              <Checkbox
                checked={task.completed}
                onChange={(e) => onToggle(task.id, e.target.checked)}
              >
                {task.title}
              </Checkbox>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default TodoList;
