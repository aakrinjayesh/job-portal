import prisma from "../config/prisma.js";

export const getAllCourses = async (_req, res) => {
  const courses = await prisma.newCourse.findMany({
    where: { isDeleted: false },
    include: {
      sections: { include: { lectures: true }, orderBy: { order: "asc" } },
    },
  });

  res.json(courses);
};

export const getCourseById = async (req, res) => {
  const course = await prisma.newCourse.findUnique({
    where: { id: req.params.id },
    include: {
      sections: { include: { lectures: true }, orderBy: { order: "asc" } },
      assessment: { include: { questions: true } },
    },
  });
  if (!course) return res.status(404).json({ message: "Course not found" });
  res.json(course);
};

export const createCourse = async (req, res) => {
  const {
    title,
    description,
    slug,
    thumbnailUrl,
    creatorId,
    creatorRole,
    isFree,
    price,
    accessDuration,
    hasCertificate,
    certificateValidityDays,
  } = req.body;
  const course = await prisma.newCourse.create({
    data: {
      title,
      description,
      slug,
      thumbnailUrl,
      creatorId,
      creatorRole,
      isFree,
      price,
      accessDuration,
      hasCertificate,
      certificateValidityDays,
    },
  });
  res.status(201).json(course);
};

export const updateCourse = async (req, res) => {
  const course = await prisma.newCourse.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(course);
};

export const deleteCourse = async (req, res) => {
  await prisma.newCourse.update({
    where: { id: req.params.id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  res.json({ message: "Course deleted" });
};
