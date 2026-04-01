import prisma from "../config/prisma.js";
import { handleError } from "../utils/handleError.js";

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
    handleError(err, req, res);
    res
      .status(500)
      .json({ status: "error", message: err.message, metadata: err.message });
  }
};

export const createTodo = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const organizationId = req.user.organizationId;
    const { title } = req.body;

    const last = await prisma.taskTemplate.findFirst({
      where: { organizationId },
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
    handleError(err, req, res);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const editTodo = async (req, res) => {
  try {
    const { id, title } = req.body;
    const organizationId = req.user.organizationId;

    const [task] = await prisma.$transaction([
      prisma.taskTemplate.updateMany({
        where: { id, organizationId },
        data: { title },
      }),
      prisma.candidateTask.updateMany({
        where: { createdFromId: id, organizationId },
        data: { title },
      }),
    ]);

    res.json({ status: "success", data: task });
  } catch (err) {
    handleError(err, req, res);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.body;
    const organizationId = req.user.organizationId;

    await prisma.$transaction([
      prisma.candidateTask.deleteMany({
        where: { createdFromId: id, organizationId },
      }),
      prisma.taskTemplate.deleteMany({
        where: { id, organizationId },
      }),
    ]);

    res.json({ status: "success", message: "Task deleted" });
  } catch (err) {
    handleError(err, req, res);
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
    handleError(err, req, res);
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

    // 1️⃣ Fetch all active org-level templates
    const templates = await prisma.taskTemplate.findMany({
      where: { organizationId, isActive: true },
      orderBy: { order: "asc" },
    });

    // 2️⃣ Look up task list scoped to org (not per-recruiter)
    let list = await prisma.candidateTaskList.findUnique({
      where: {
        candidateId_jobId_organizationId: {
          candidateId,
          jobId,
          organizationId,
        },
      },
      include: { tasks: { orderBy: { order: "asc" } } },
    });

    if (!list) {
      // 3️⃣ First visit — create list seeded from all org templates
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
        include: { tasks: { orderBy: { order: "asc" } } },
      });
      console.log("New task list created");
    } else {
      // 4️⃣ List exists — sync any new templates not yet in the list
      const existingFromIds = new Set(
        list.tasks.map((t) => t.createdFromId).filter(Boolean),
      );
      const existingTitles = new Set(list.tasks.map((t) => t.title));
      const newTemplates = templates.filter(
        (t) => !existingFromIds.has(t.id) && !existingTitles.has(t.title),
      );

      if (newTemplates.length > 0) {
        await prisma.candidateTask.createMany({
          data: newTemplates.map((t) => ({
            taskListId: list.id,
            title: t.title,
            order: t.order,
            createdFromId: t.id,
            organizationId,
          })),
        });

        list = await prisma.candidateTaskList.findUnique({
          where: { id: list.id },
          include: { tasks: { orderBy: { order: "asc" } } },
        });
        console.log(
          `Synced ${newTemplates.length} new template(s) into existing list`,
        );
      }
    }

    return res.json({ status: "success", data: list.tasks });
  } catch (err) {
    console.error("getCandidateTasks error:", err);
    handleError(err, req, res);
    return res.status(500).json({ status: "error", message: err.message });
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
    handleError(err, req, res);
    res.status(500).json({ status: "error", message: err.message });
  }
};
