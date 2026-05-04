import prisma from "../config/prisma.js";

// Review model was removed in the development branch.
// These endpoints now handle CourseEnrollment (enroll, get progress, unenroll).

export const getReviewsByCourse = async (req, res) => {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { courseId: req.params.courseId },
    include: {
      user: { select: { id: true, name: true, profileUrl: true } },
      certificate: true,
    },
  });
  res.json(enrollments);
};

export const createReview = async (req, res) => {
  const { courseId, userId } = req.body;
  const enrollment = await prisma.courseEnrollment.create({
    data: { courseId, userId },
  });
  res.status(201).json(enrollment);
};

export const updateReview = async (req, res) => {
  const enrollment = await prisma.courseEnrollment.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(enrollment);
};

export const deleteReview = async (req, res) => {
  await prisma.courseEnrollment.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  res.json({ message: "Enrollment deactivated" });
};
