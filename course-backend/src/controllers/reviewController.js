/**
 * reviewController.js
 *
 * Handles:
 *  - Assessment CRUD (create, update, delete questions)
 *  - Assessment attempts (submit answers, auto-score, pass/fail)
 *  - Certificate issuance (on 100% score)
 *  - Instructor analytics (attempt stats per course)
 */

import prisma from "../config/prisma.js";
// import { generatePresignedUploadUrl } from "../utils/storage.js";
import { uploadToCloudinary } from "../utils/storage.js";

// ─────────────────────────────────────────────────────────
// ASSESSMENT CRUD  (instructor only)
// ─────────────────────────────────────────────────────────

/**
 * POST /api/review/assessment/:courseId
 * Create or replace assessment for a course
 * Body: { title, questions: [{ question, type, options, correctAnswer, order }] }
 */
export const createOrUpdateAssessment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, questions = [] } = req.body;

    if (!title)
      return res
        .status(400)
        .json({ success: false, message: "title required" });
    if (!questions.length) {
      return res
        .status(400)
        .json({ success: false, message: "At least one question required" });
    }

    const course = await prisma.newCourse.findFirst({
      where: { id: courseId, isDeleted: false },
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    if (course.creatorId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Upsert assessment
    const assessment = await prisma.courseAssessment.upsert({
      where: { courseId },
      create: { courseId, title },
      update: { title },
    });

    // Replace all questions
    await prisma.assessmentQuestion.deleteMany({
      where: { assessmentId: assessment.id },
    });

    const createdQuestions = await prisma.assessmentQuestion.createMany({
      data: questions.map((q, i) => ({
        assessmentId: assessment.id,
        question: q.question,
        type: q.type || "SINGLE_CHOICE",
        options: q.options || [],
        correctAnswer: Array.isArray(q.correctAnswer)
          ? q.correctAnswer
          : [q.correctAnswer],
        order: q.order ?? i + 1,
      })),
    });

    const full = await prisma.courseAssessment.findUnique({
      where: { id: assessment.id },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    return res.status(201).json({ success: true, data: full });
  } catch (err) {
    console.error("createOrUpdateAssessment error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/review/assessment/:courseId
 * Get assessment for a course
 * - Instructors/admins see correctAnswer
 * - Students do NOT see correctAnswer
 */
export const getAssessment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const isInstructor =
      req.user.role === "admin" ||
      (await prisma.newCourse.findFirst({
        where: { id: courseId, creatorId: req.user.id },
      }));

    const assessment = await prisma.courseAssessment.findUnique({
      where: { courseId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            question: true,
            type: true,
            options: true,
            order: true,
            // Only expose correctAnswer to instructor/admin
            ...(isInstructor ? { correctAnswer: true } : {}),
          },
        },
        _count: { select: { attempts: true } },
      },
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "No assessment found for this course",
      });
    }

    return res.json({ success: true, data: assessment });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/review/assessment/:courseId
 */
export const deleteAssessment = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await prisma.newCourse.findFirst({
      where: { id: courseId, isDeleted: false },
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    if (course.creatorId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await prisma.courseAssessment.deleteMany({ where: { courseId } });
    return res.json({ success: true, message: "Assessment deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// ASSESSMENT ATTEMPTS  (candidates)
// ─────────────────────────────────────────────────────────

/**
 * POST /api/review/attempt/:courseId
 * Submit assessment answers and auto-score
 * Body: { answers: { [questionId]: string | string[] } }
 */
export const submitAssessment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const { answers } = req.body; // { questionId: userAnswer }

    if (!answers || typeof answers !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "answers object required" });
    }

    // Must be enrolled
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    if (!enrollment) {
      return res
        .status(403)
        .json({ success: false, message: "Not enrolled in this course" });
    }

    const assessment = await prisma.courseAssessment.findUnique({
      where: { courseId },
      include: { questions: true },
    });
    if (!assessment) {
      return res
        .status(404)
        .json({ success: false, message: "No assessment for this course" });
    }

    // Score
    let correctCount = 0;
    for (const q of assessment.questions) {
      const userAns = answers[q.id];
      if (!userAns) continue;

      const userSet = Array.isArray(userAns)
        ? userAns.map((a) => a.trim().toLowerCase()).sort()
        : [String(userAns).trim().toLowerCase()];

      const correctSet = q.correctAnswer
        .map((a) => a.trim().toLowerCase())
        .sort();
      const isCorrect = JSON.stringify(userSet) === JSON.stringify(correctSet);
      if (isCorrect) correctCount++;
    }

    const score =
      assessment.questions.length > 0
        ? Math.round((correctCount / assessment.questions.length) * 100)
        : 0;

    const isPassed = score === 100; // Schema: isPassed only when score === 100

    // Attempt number
    const attemptNumber = await prisma.assessmentAttempt.count({
      where: { enrollmentId: enrollment.id, assessmentId: assessment.id },
    });

    const attempt = await prisma.assessmentAttempt.create({
      data: {
        enrollmentId: enrollment.id,
        assessmentId: assessment.id,
        score,
        isPassed,
        attemptNumber: attemptNumber + 1,
      },
    });

    // Issue certificate if passed and course has certificate
    let certificate = null;
    if (isPassed) {
      certificate = await issueCertificate(enrollment, courseId, userId);
    }

    return res.json({
      success: true,
      data: {
        attempt,
        score,
        isPassed,
        correctCount,
        totalQuestions: assessment.questions.length,
        certificate,
      },
    });
  } catch (err) {
    console.error("submitAssessment error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/review/attempts/:courseId
 * All attempts by current user for a course
 */
export const getMyAttempts = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: "Not enrolled" });
    }

    const attempts = await prisma.assessmentAttempt.findMany({
      where: { enrollmentId: enrollment.id },
      orderBy: { attemptedAt: "desc" },
    });

    return res.json({ success: true, data: attempts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/review/attempts/instructor/:courseId
 * All attempts for a course — instructor/admin analytics
 */
export const getAttemptsByInstructor = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await prisma.newCourse.findFirst({
      where: { id: courseId, isDeleted: false },
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    if (course.creatorId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const assessment = await prisma.courseAssessment.findUnique({
      where: { courseId },
    });
    if (!assessment) {
      return res
        .status(404)
        .json({ success: false, message: "No assessment found" });
    }

    const attempts = await prisma.assessmentAttempt.findMany({
      where: { assessmentId: assessment.id },
      include: {
        enrollment: {
          include: {
            user: {
              select: { id: true, name: true, email: true, profileUrl: true },
            },
          },
        },
      },
      orderBy: { attemptedAt: "desc" },
    });

    // Aggregate stats
    const stats = {
      total: attempts.length,
      passed: attempts.filter((a) => a.isPassed).length,
      avgScore:
        attempts.length > 0
          ? Math.round(
              attempts.reduce((s, a) => s + (a.score || 0), 0) /
                attempts.length,
            )
          : 0,
    };

    return res.json({ success: true, data: { attempts, stats } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// CERTIFICATES
// ─────────────────────────────────────────────────────────

/**
 * GET /api/review/certificate/:courseId
 * Get certificate for current user if issued
 */
export const getMyCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: "Not enrolled" });
    }

    const certificate = await prisma.courseCertificate.findUnique({
      where: { enrollmentId: enrollment.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            creator: { select: { id: true, name: true } },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message:
          "No certificate yet. Pass the assessment with 100% to earn it.",
      });
    }

    return res.json({ success: true, data: certificate });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/review/certificates/my
 * All certificates for current user
 */
export const getAllMyCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    const certificates = await prisma.courseCertificate.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            creator: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    return res.json({ success: true, data: certificates });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/review/certificate/upload-url
 * Instructor uploads the certificate PDF to S3
 * Body: { mimeType: "application/pdf" }
 */
// export const getCertificateUploadUrl = async (req, res) => {
//   try {
//     const { mimeType = "application/pdf" } = req.body;
//     const result = await generatePresignedUploadUrl("certificates", mimeType);
//     return res.json({ success: true, data: result });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

export const getCertificateUploadUrl = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "PDF file is required" });
    }

    const result = await uploadToCloudinary(req.file, "certificates");
    // result = { success, url, key }
    return res.json({
      success: true,
      data: { fileUrl: result.url, key: result.key },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
/**
 * PATCH /api/review/certificate/:courseId/url
 * Manually attach an S3 URL to a certificate record (after PDF generation)
 * Body: { userId, certificateUrl }
 */
export const updateCertificateUrl = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId, certificateUrl } = req.body;

    if (!userId || !certificateUrl) {
      return res.status(400).json({
        success: false,
        message: "userId and certificateUrl required",
      });
    }

    const course = await prisma.newCourse.findFirst({
      where: { id: courseId },
    });
    if (course.creatorId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });

    const cert = await prisma.courseCertificate.update({
      where: { enrollmentId: enrollment.id },
      data: { certificateUrl },
    });

    return res.json({ success: true, data: cert });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────

async function issueCertificate(enrollment, courseId, userId) {
  try {
    const course = await prisma.newCourse.findUnique({
      where: { id: courseId },
    });
    if (!course.hasCertificate) return null;

    // Check if already issued
    const existing = await prisma.courseCertificate.findUnique({
      where: { enrollmentId: enrollment.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            creator: { select: { id: true, name: true } },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (existing) return existing;

    const expiresAt = course.certificateValidityDays
      ? new Date(Date.now() + course.certificateValidityDays * 86400 * 1000)
      : null;

    const cert = await prisma.courseCertificate.create({
      data: {
        enrollmentId: enrollment.id,
        userId,
        courseId,
        expiresAt,
        // certificateUrl will be set later once PDF is generated
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              creator: { select: { id: true, name: true } },
            },
          },
          user: { select: { id: true, name: true, email: true } },
        },
      },
    });

    return cert;
  } catch (_) {
    return null;
  }
}
