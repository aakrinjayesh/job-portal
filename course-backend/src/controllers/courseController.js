/**
 * courseController.js
 *
 * Handles:
 *  - Course CRUD (create, update, delete, publish)
 *  - Section CRUD
 *  - Lecture CRUD
 *  - S3 presigned upload URL generation
 *  - Public & instructor course listing
 */

// import {
//   generatePresignedUploadUrl,
//   deleteS3Object,
//   extractKeyFromUrl,
// } from "../utils/storage.js";
import prisma from "../config/prisma.js";
import { uploadToCloudinary } from "../utils/storage.js";

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

const getTimeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  return `${Math.floor(diff / 604800)} weeks ago`;
};
const courseSelect = {
  id: true,
  title: true,
  description: true,
  prerequisities: true,
  whatYouWillLearn: true,
  syllabus: true,
  courseLevel: true,
  slug: true,
  thumbnailUrl: true,
  isFree: true,
  price: true,
  accessDuration: true,
  hasCertificate: true,
  certificateValidityDays: true,
  hasPreview: true,
  status: true,
  creatorId: true,
  creatorRole: true,
  createdAt: true,
  updatedAt: true,
  creator: { select: { id: true, name: true, email: true, profileUrl: true } },
  _count: { select: { enrollments: true, sections: true } },
};

// ─────────────────────────────────────────────────────────
// S3 UPLOAD
// ─────────────────────────────────────────────────────────

/**
 * POST /api/courses/upload-url
 * Body: { folder: "thumbnails"|"lectures"|"certificates", mimeType: "video/mp4" }
 * Returns presigned PUT url + final fileUrl
 */
// export const getUploadUrl = async (req, res) => {
//   try {
//     const { folder, mimeType } = req.body;

//     const allowedFolders = ["thumbnails", "lectures", "certificates"];
//     if (!allowedFolders.includes(folder)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid folder" });
//     }
//     if (!mimeType) {
//       return res
//         .status(400)
//         .json({ success: false, message: "mimeType required" });
//     }

//     const result = await generatePresignedUploadUrl(folder, mimeType);
//     return res.json({ success: true, data: result });
//   } catch (err) {
//     console.error("getUploadUrl error:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };
export const getUploadUrl = async (req, res) => {
  try {
    // Read folder from URL path e.g. /upload/thumbnail → "thumbnails"
    const pathPart = req.path.split("/").pop(); // "thumbnail", "lecture", "certificate"
    const folderMap = {
      thumbnail: "thumbnails",
      lecture: "lectures",
      certificate: "certificates",
    };
    const folder = `courses/${folderMap[pathPart]}`;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "File is required" });
    }

    const result = await uploadToCloudinary(req.file, folder);
    return res.json({
      success: true,
      data: { fileUrl: result.url, key: result.key },
    });
  } catch (err) {
    console.error("getUploadUrl error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// COURSE CRUD
// ─────────────────────────────────────────────────────────

/**
 * POST /api/courses
 * Create a new course (DRAFT by default)
 */
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      prerequisities,
      whatYouWillLearn,
      syllabus,
      courseLevel,
      slug,
      thumbnailUrl,
      isFree = true,
      price = 0,
      accessDuration = "LIFETIME",
      hasCertificate = false,
      certificateValidityDays,
      hasPreview = false,
    } = req.body;

    if (!title || !slug) {
      return res
        .status(400)
        .json({ success: false, message: "title and slug are required" });
    }

    // Slug uniqueness check
    const existing = await prisma.newCourse.findUnique({ where: { slug } });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Slug already taken" });
    }

    const course = await prisma.newCourse.create({
      data: {
        title,
        description,
        prerequisities,
        whatYouWillLearn,
        syllabus,
        courseLevel,
        slug,
        thumbnailUrl,
        isFree,
        price: isFree ? 0 : price,
        accessDuration,
        hasCertificate,
        certificateValidityDays: hasCertificate
          ? certificateValidityDays
          : null,
        hasPreview,
        creatorId: req.user.id,
        creatorRole: req.user.role,
        status: "DRAFT",
      },
      select: courseSelect,
    });

    return res.status(201).json({ success: true, data: course });
  } catch (err) {
    console.error("createCourse error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/courses
 * Public listing — only PUBLISHED courses
 * Query: ?page=1&limit=12&search=&isFree=true
 */
export const getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, isFree } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      status: "PUBLISHED",
      isDeleted: false,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(isFree !== undefined && { isFree: isFree === "true" }),
    };

    const [courses, total] = await Promise.all([
      prisma.newCourse.findMany({
        where,
        select: courseSelect,
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.newCourse.count({ where }),
    ]);

    return res.json({
      success: true,
      data: courses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("getAllCourses error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/courses/my
 * Instructor's own courses (all statuses)
 */
export const getMyCourses = async (req, res) => {
  try {
    const courses = await prisma.newCourse.findMany({
      where: { creatorId: req.user.id, isDeleted: false },
      select: courseSelect,
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: courses });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/courses/:id
 * Single course with sections + lectures
 */
export const getCourseById = async (req, res) => {
  try {
    const course = await prisma.newCourse.findFirst({
      where: { id: req.params.id, isDeleted: false },
      include: {
        creator: { select: { id: true, name: true, profileUrl: true } },
        sections: {
          orderBy: { order: "asc" },
          include: {
            lectures: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                type: true,
                durationSeconds: true,
                isPreview: true,
                order: true,
                // contentUrl only included if preview OR authenticated + enrolled (handled on frontend)
                contentUrl: true,
              },
            },
          },
        },
        assessment: {
          select: {
            id: true,
            title: true,
            _count: { select: { questions: true } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    return res.json({ success: true, data: course });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/courses/slug/:slug
 */
// export const getCourseBySlug = async (req, res) => {
//   try {
//     const course = await prisma.newCourse.findFirst({
//       // where: { slug: req.params.slug, isDeleted: false },
//       // where: {
//       //   slug: { equals: req.params.slug, mode: "insensitive" },
//       //   isDeleted: false,
//       // },
//       where: {
//         slug: {
//           equals: req.params.slug.trim(),
//           mode: "insensitive",
//         },
//         isDeleted: false,
//       },
//       include: {
//         creator: { select: { id: true, name: true, profileUrl: true } },
//         sections: {
//           orderBy: { order: "asc" },
//           include: {
//             lectures: { orderBy: { order: "asc" } },
//           },
//         },
//         assessment: {
//           select: {
//             id: true,
//             title: true,
//             _count: { select: { questions: true } },
//           },
//         },
//         _count: { select: { enrollments: true } },
//       },
//     });

//     if (!course) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Course not found" });
//     }

//     return res.json({ success: true, data: course });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

export const getCourseBySlug = async (req, res) => {
  try {
    const slug = req.params.slug.trim().toLowerCase();

    const course = await prisma.newCourse.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: "insensitive",
        },
        isDeleted: false,
        status: "PUBLISHED",
      },

      include: {
        creator: {
          select: {
            id: true,
            name: true,
            profileUrl: true,
          },
        },

        sections: {
          orderBy: { order: "asc" },
          include: {
            lectures: {
              orderBy: { order: "asc" },
            },
          },
        },

        assessment: {
          select: {
            id: true,
            title: true,
            _count: {
              select: { questions: true },
            },
          },
        },

        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.json({
      success: true,
      data: course,
    });
  } catch (err) {
    console.error("getCourseBySlug error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const checkCourseSlug = async (req, res) => {
  try {
    const slug = req.params.slug.trim().toLowerCase();

    const course = await prisma.newCourse.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: "insensitive",
        },
        isDeleted: false,
      },
      select: {
        id: true,
      },
    });

    return res.json({
      success: true,
      exists: !!course,
      courseId: course?.id || null,
    });
  } catch (err) {
    console.error("checkCourseSlug error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * PUT /api/courses/:id
 * Update course metadata
 */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.newCourse.findFirst({
      where: { id, isDeleted: false },
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    // Only creator or admin can update
    if (course.creatorId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const {
      title,
      description,
      prerequisities,
      whatYouWillLearn,
      syllabus,
      courseLevel,
      thumbnailUrl,
      isFree,
      price,
      accessDuration,
      hasCertificate,
      certificateValidityDays,
      hasPreview,
    } = req.body;

    // If thumbnail changed, delete old one from S3
    // if (
    //   thumbnailUrl &&
    //   thumbnailUrl !== course.thumbnailUrl &&
    //   course.thumbnailUrl
    // ) {
    //   const oldKey = extractKeyFromUrl(course.thumbnailUrl);
    //   if (oldKey) await deleteS3Object(oldKey).catch(() => {});
    // }

    const updated = await prisma.newCourse.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(prerequisities !== undefined && { prerequisities }),
        ...(whatYouWillLearn !== undefined && { whatYouWillLearn }),
        ...(syllabus !== undefined && { syllabus }),
        ...(courseLevel !== undefined && { courseLevel }),
        ...(thumbnailUrl && { thumbnailUrl }),
        ...(isFree !== undefined && { isFree }),
        ...(price !== undefined && { price: isFree ? 0 : price }),
        ...(accessDuration && { accessDuration }),
        ...(hasCertificate !== undefined && { hasCertificate }),
        ...(certificateValidityDays !== undefined && {
          certificateValidityDays,
        }),
        ...(hasPreview !== undefined && { hasPreview }),
      },
      select: courseSelect,
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/courses/:id/publish
 * Toggle DRAFT <-> PUBLISHED
 */
export const publishCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.newCourse.findFirst({
      where: { id, isDeleted: false },
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

    // Validate: must have at least one section and one lecture
    const sectionCount = await prisma.courseSection.count({
      where: { courseId: id },
    });
    if (sectionCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Add at least one section and lecture before publishing",
      });
    }

    const newStatus = course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const updated = await prisma.newCourse.update({
      where: { id },
      data: { status: newStatus },
      select: courseSelect,
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/courses/:id
 * Soft delete
 */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.newCourse.findFirst({
      where: { id, isDeleted: false },
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

    await prisma.newCourse.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), status: "DELETED" },
    });

    return res.json({ success: true, message: "Course deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// SECTION CRUD
// ─────────────────────────────────────────────────────────

/**
 * POST /api/courses/:courseId/sections
 */
export const createSection = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title } = req.body;

    if (!title)
      return res
        .status(400)
        .json({ success: false, message: "Title required" });

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

    // Auto order
    const count = await prisma.courseSection.count({ where: { courseId } });

    const section = await prisma.courseSection.create({
      data: { courseId, title, order: count + 1 },
      include: { lectures: { orderBy: { order: "asc" } } },
    });

    return res.status(201).json({ success: true, data: section });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/courses/:courseId/sections/:sectionId
 */
export const updateSection = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;
    const { title, order } = req.body;

    const section = await prisma.courseSection.findFirst({
      where: { id: sectionId, courseId },
    });
    if (!section)
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });

    const updated = await prisma.courseSection.update({
      where: { id: sectionId },
      data: {
        ...(title && { title }),
        ...(order !== undefined && { order }),
      },
      include: { lectures: { orderBy: { order: "asc" } } },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/courses/:courseId/sections/:sectionId
 */
export const deleteSection = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;

    const section = await prisma.courseSection.findFirst({
      where: { id: sectionId, courseId },
      include: { lectures: true },
    });
    if (!section)
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });

    // Delete lecture S3 files
    // for (const lec of section.lectures) {
    //   if (lec.contentUrl) {
    //     const key = extractKeyFromUrl(lec.contentUrl);
    //     if (key) await deleteS3Object(key).catch(() => {});
    //   }
    // }

    await prisma.courseSection.delete({ where: { id: sectionId } });

    return res.json({ success: true, message: "Section deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/courses/:courseId/sections/reorder
 * Body: { sections: [{ id, order }] }
 */
export const reorderSections = async (req, res) => {
  try {
    const { sections } = req.body;
    if (!Array.isArray(sections)) {
      return res
        .status(400)
        .json({ success: false, message: "sections array required" });
    }

    await Promise.all(
      sections.map(({ id, order }) =>
        prisma.courseSection.update({ where: { id }, data: { order } }),
      ),
    );

    return res.json({ success: true, message: "Sections reordered" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// LECTURE CRUD
// ─────────────────────────────────────────────────────────

/**
 * POST /api/courses/:courseId/sections/:sectionId/lectures
 * Body: { title, type, contentUrl, durationSeconds, isPreview }
 */
export const createLecture = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const {
      title,
      type = "VIDEO",
      contentUrl,
      durationSeconds,
      isPreview = false,
    } = req.body;

    if (!title)
      return res
        .status(400)
        .json({ success: false, message: "Title required" });

    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId },
    });
    if (!section)
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });

    const count = await prisma.courseLecture.count({ where: { sectionId } });

    const lecture = await prisma.courseLecture.create({
      data: {
        sectionId,
        title,
        type,
        contentUrl: contentUrl || null,
        durationSeconds: durationSeconds || null,
        isPreview,
        order: count + 1,
      },
    });

    return res.status(201).json({ success: true, data: lecture });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/courses/:courseId/sections/:sectionId/lectures/:lectureId
 */
export const updateLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { title, type, contentUrl, durationSeconds, isPreview, order } =
      req.body;

    const lecture = await prisma.courseLecture.findUnique({
      where: { id: lectureId },
    });
    if (!lecture)
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });

    // If content URL changed, remove old S3 file
    // if (contentUrl && contentUrl !== lecture.contentUrl && lecture.contentUrl) {
    //   const oldKey = extractKeyFromUrl(lecture.contentUrl);
    //   if (oldKey) await deleteS3Object(oldKey).catch(() => {});
    // }

    const updated = await prisma.courseLecture.update({
      where: { id: lectureId },
      data: {
        ...(title && { title }),
        ...(type && { type }),
        ...(contentUrl !== undefined && { contentUrl }),
        ...(durationSeconds !== undefined && { durationSeconds }),
        ...(isPreview !== undefined && { isPreview }),
        ...(order !== undefined && { order }),
      },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/courses/:courseId/sections/:sectionId/lectures/:lectureId
 */
export const deleteLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await prisma.courseLecture.findUnique({
      where: { id: lectureId },
    });
    if (!lecture)
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });

    // if (lecture.contentUrl) {
    //   const key = extractKeyFromUrl(lecture.contentUrl);
    //   if (key) await deleteS3Object(key).catch(() => {});
    // }

    await prisma.courseLecture.delete({ where: { id: lectureId } });

    return res.json({ success: true, message: "Lecture deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/courses/:courseId/sections/:sectionId/lectures/reorder
 * Body: { lectures: [{ id, order }] }
 */
export const reorderLectures = async (req, res) => {
  try {
    const { lectures } = req.body;
    if (!Array.isArray(lectures)) {
      return res
        .status(400)
        .json({ success: false, message: "lectures array required" });
    }

    await Promise.all(
      lectures.map(({ id, order }) =>
        prisma.courseLecture.update({ where: { id }, data: { order } }),
      ),
    );

    return res.json({ success: true, message: "Lectures reordered" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────

/**
 * GET /api/courses/admin/all
 * All courses (any status) — admin only
 */
export const adminGetAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      isDeleted: false,
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { creator: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [courses, total] = await Promise.all([
      prisma.newCourse.findMany({
        where,
        select: courseSelect,
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.newCourse.count({ where }),
    ]);

    return res.json({
      success: true,
      data: courses,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;

    // 1. Get course
    const course = await prisma.newCourse.findFirst({
      where: {
        id: courseId,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        creatorId: true,
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // 🔐 Authorization
    if (course.creatorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // 2. Get enrollments WITH progress
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        progress: true, // LectureProgress
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    const totalEnrolled = enrollments.length;

    // 3. Calculate progress %
    const processed = enrollments.map((e) => {
      const totalLectures = e.progress.length;

      const completedLectures = e.progress.filter((p) => p.isCompleted).length;

      const percent =
        totalLectures === 0
          ? 0
          : Math.round((completedLectures / totalLectures) * 100);

      return {
        ...e,
        percent,
      };
    });

    // 4. Stats
    const completed = processed.filter((e) => e.completedAt !== null).length;

    const inProgress = processed.filter(
      (e) => e.percent > 0 && e.percent < 100,
    ).length;

    const certificates = completed;

    const avgCompletion =
      totalEnrolled === 0
        ? 0
        : Math.round(
            processed.reduce((acc, e) => acc + e.percent, 0) / totalEnrolled,
          );

    // 5. Recent enrollments
    const recent = processed.slice(0, 5).map((e) => ({
      name: e.user.name,
      progress: e.percent,
      status:
        e.percent === 100
          ? "completed"
          : e.percent > 0
            ? "in-progress"
            : "started",
      timeAgo: getTimeAgo(e.enrolledAt),
    }));

    return res.json({
      success: true,
      data: {
        title: course.title,
        totalEnrolled,
        completed,
        inProgress,
        certificates,
        avgCompletion,
        recent,
      },
    });
  } catch (err) {
    console.error("getCourseAnalytics error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
