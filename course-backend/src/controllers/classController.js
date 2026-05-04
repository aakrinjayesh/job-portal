import prisma from "../config/prisma.js";

// "Classes" map to CourseLecture in the new schema.

export const getClassesByCourse = async (req, res) => {
  const sections = await prisma.courseSection.findMany({
    where: { courseId: req.params.courseId },
    include: { lectures: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });
  res.json(sections);
};

export const getClassById = async (req, res) => {
  const lecture = await prisma.courseLecture.findUnique({
    where: { id: req.params.id },
  });
  if (!lecture) return res.status(404).json({ message: "Lecture not found" });
  res.json(lecture);
};

export const createClass = async (req, res) => {
  const { sectionId, title, type, contentUrl, durationSeconds, isPreview, order } =
    req.body;
  const lecture = await prisma.courseLecture.create({
    data: { sectionId, title, type, contentUrl, durationSeconds, isPreview, order },
  });
  res.status(201).json(lecture);
};

export const updateClass = async (req, res) => {
  const lecture = await prisma.courseLecture.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(lecture);
};

export const deleteClass = async (req, res) => {
  await prisma.courseLecture.delete({ where: { id: req.params.id } });
  res.json({ message: "Lecture deleted" });
};
