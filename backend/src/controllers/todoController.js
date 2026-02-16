import prisma from "../config/prisma.js";

export const getAllTodo = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const tasks = await prisma.taskTemplate.findMany({
      where: {
        organizationId,
      },
      orderBy: { order: "asc" },
    });

    res.json({ status: "success", data: tasks });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const createTodo = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const organizationId = req.user.organizationId;
    const { title } = req.body;

    const last = await prisma.taskTemplate.findFirst({
      where: {
        recruiterId,
        organizationId,
      },
      orderBy: { order: "desc" },
    });

    const task = await prisma.taskTemplate.create({
      data: {
        recruiterId,
        organizationId,
        title,
        order: (last?.order || 0) + 1,
        isDefault: false,
      },
    });

    res.json({ status: "success", data: task });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const editTodo = async (req, res) => {
  try {
    const { id, title } = req.body;
    const organizationId = req.user.organizationId;

    const task = await prisma.taskTemplate.updateMany({
      where: {
        id,
        organizationId,
      },
      data: { title },
    });

    res.json({ status: "success", data: task });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.body;
    const organizationId = req.user.organizationId;

    await prisma.taskTemplate.deleteMany({
      where: {
        id,
        organizationId,
      },
    });

    res.json({ status: "success", message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

function isBoolean(value) {
  return typeof value === "boolean";
}

export const toggleActiveTodo = async (req, res) => {
  try {
    const { id, isActive } = req.body;
    const organizationId = req.user.organizationId;

    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ status: "error", message: "isActive must be boolean" });
    }

    const task = await prisma.taskTemplate.updateMany({
      where: {
        id,
        organizationId,
      },
      data: { isActive },
    });

    res.json({ status: "success", data: task });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// export const getCandidateTasks = async (req, res) => {
//   try {
//     const recruiterId = req.user.id;
//     const { candidateId, jobId } = req.query;

//     let list = await prisma.candidateTaskList.findUnique({
//       where: {
//         recruiterId_candidateId_jobId: { recruiterId, candidateId, jobId },
//       },
//       include: { tasks: { orderBy: { order: "asc" } } },
//     });

//     // If not exist → create from templates
//     if (!list) {
//       const templates = await prisma.taskTemplate.findMany({
//         where: { recruiterId, isActive: true },
//         orderBy: { order: "asc" },
//       });

//       list = await prisma.candidateTaskList.create({
//         data: {
//           recruiterId,
//           candidateId,
//           jobId,
//           tasks: {
//             create: templates.map((t) => ({
//               title: t.title,
//               order: t.order,
//               createdFromId: t.id,
//             })),
//           },
//         },
//         include: { tasks: true },
//       });
//     }

//     res.json({ status: "success", data: list.tasks });
//   } catch (err) {
//     res.status(500).json({ status: "error", message: err.message });
//   }
// };

export const getCandidateTasks = async (req, res) => {
  console.log("get Candidate called");

  try {
    const recruiterId = req.user.id;
    const organizationId = req.user.organizationId;
    const { candidateId, jobId } = req.body;

    if (!candidateId || !jobId) {
      return res.status(400).json({
        status: "error",
        message: "candidateId and jobId are required",
      });
    }

    // 🔍 1️⃣ First check if task list already exists
    let list = await prisma.candidateTaskList.findUnique({
      where: {
        recruiterId_candidateId_jobId_organizationId: {
          recruiterId,
          candidateId,
          jobId,
          organizationId,
        },
      },
      include: {
        tasks: { orderBy: { order: "asc" } },
      },
    });

    // ✅ 2️⃣ If exists → return directly
    if (list) {
      console.log("Task list already exists");
      return res.json({
        status: "success",
        data: list.tasks,
      });
    }

    // 🆕 3️⃣ If not exists → fetch templates
    const templates = await prisma.taskTemplate.findMany({
      where: {
        recruiterId,
        organizationId,
        isActive: true,
      },
      orderBy: { order: "asc" },
    });

    // 🆕 4️⃣ Create new candidate task list
    list = await prisma.candidateTaskList.create({
      data: {
        recruiterId,
        candidateId,
        jobId,
        organizationId,
        tasks: {
          create: templates.map((t) => ({
            title: t.title,
            order: t.order,
            createdFromId: t.id,
            organizationId,
          })),
        },
      },
      include: {
        tasks: { orderBy: { order: "asc" } },
      },
    });

    console.log("New task list created");

    return res.json({
      status: "success",
      data: list.tasks,
    });
  } catch (err) {
    console.error("getCandidateTasks error:", err);

    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

export const checkUpdate = async (req, res) => {
  try {
    const { taskId, completed } = req.body;
    const organizationId = req.user.organizationId;

    const task = await prisma.candidateTask.updateMany({
      where: {
        id: taskId,
        organizationId,
      },
      data: { completed },
    });

    res.json({ status: "success", data: task });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
