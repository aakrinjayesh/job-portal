import prisma from "../config/prisma.js";

export const getAllTodo = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const tasks = await prisma.taskTemplate.findMany({
      where: { recruiterId },
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
    const { title } = req.body;

    const last = await prisma.taskTemplate.findFirst({
      where: { recruiterId },
      orderBy: { order: "desc" },
    });

    const task = await prisma.taskTemplate.create({
      data: {
        recruiterId,
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

    const task = await prisma.taskTemplate.update({
      where: { id },
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

    await prisma.taskTemplate.delete({ where: { id } });

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

    const check = isBoolean(isActive);

    if (!check) {
      res
        .status(200)
        .json({ status: "error", message: "isActive should be Boolean Only" });
    }

    const task = await prisma.taskTemplate.update({
      where: { id },
      data: { isActive },
    });

    res.json({ status: "success", data: task });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getCandidateTasks = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { candidateId, jobId } = req.query;

    let list = await prisma.candidateTaskList.findUnique({
      where: {
        recruiterId_candidateId_jobId: { recruiterId, candidateId, jobId },
      },
      include: { tasks: { orderBy: { order: "asc" } } },
    });

    // If not exist → create from templates
    if (!list) {
      const templates = await prisma.taskTemplate.findMany({
        where: { recruiterId, isActive: true },
        orderBy: { order: "asc" },
      });

      list = await prisma.candidateTaskList.create({
        data: {
          recruiterId,
          candidateId,
          jobId,
          tasks: {
            create: templates.map((t) => ({
              title: t.title,
              order: t.order,
              createdFromId: t.id,
            })),
          },
        },
        include: { tasks: true },
      });
    }

    res.json({ status: "success", data: list.tasks });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const checkUpdate = async (req, res) => {
  try {
    const { taskId, completed } = req.body;

    const task = await prisma.candidateTask.update({
      where: { id: taskId },
      data: { completed },
    });

    res.json({ status: "success", data: task });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
