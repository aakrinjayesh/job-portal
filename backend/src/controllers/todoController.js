import prisma from "../config/prisma.js";

export const getTodos = async (req, res) => {
  if (req.user.role !== "company") {
    return res.status(403).json({ message: "Access denied" });
  }

  const todos = await prisma.recruiterTodo.findMany({
    where: { recruiterId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 6
  });

  res.json({ status: "success", data: todos });
};

// export const getTodos = async (req, res) => {
//   if (req.user.role !== "company") {
//     return res.status(403).json({ message: "Access denied" });
//   }

//   const todos = await prisma.recruiterTodo.findMany({
//     where: {
//       recruiterId: req.user.id,
//       candidateId: { not: null }   // ✅ IMPORTANT
//     },
//     orderBy: { createdAt: "desc" },
//     take: 6,
//     include: {
//       candidate: {
//         select: {
//           id: true,
//           name: true,
//           email: true
//         }
//       }
//     }
//   });

//   res.json({ status: "success", data: todos });
// };


export const createTodo = async (req, res) => {
  if (req.user.role !== "company") {
    return res.status(403).json({ message: "Access denied" });
  }

  const todo = await prisma.recruiterTodo.create({
    data: {
      recruiterId: req.user.id,
      title: req.body.title
    }
  });

  res.status(201).json({ status: "success", data: todo });
};

// export const createTodo = async (req, res) => {
//   if (req.user.role !== "company") {
//     return res.status(403).json({ message: "Access denied" });
//   }

//   const { title, candidateId } = req.body;

//   if (!candidateId) {
//     return res.status(400).json({
//       message: "candidateId is required"
//     });
//   }

//   const todo = await prisma.recruiterTodo.create({
//     data: {
//       recruiterId: req.user.id,
//       candidateId,          // ✅ ADD THIS
//       title
//     }
//   });

//   res.status(201).json({ status: "success", data: todo });
// };


export const updateTodo = async (req, res) => {
  const { id } = req.params;

  const todo = await prisma.recruiterTodo.findUnique({ where: { id } });
  if (!todo) return res.status(404).json({ message: "Not found" });

  const updated = await prisma.recruiterTodo.update({
    where: { id },
    data: {
      title: req.body.title,
      completed: req.body.completed
    }
  });

  res.json({ status: "success", data: updated });
};

export const deleteTodo = async (req, res) => {
  const { id } = req.params;

  await prisma.recruiterTodo.delete({ where: { id } });
  res.json({ status: "success" });
};
