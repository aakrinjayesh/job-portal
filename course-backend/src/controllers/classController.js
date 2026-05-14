/**
 * classController.js
 *
 * Handles:
 *  - Enrollment (free courses auto-enroll, paid courses check payment)
 *  - Cart (add, remove, list)
 *  - Wishlist (add, remove, list)
 *  - Lecture progress tracking
 *  - Enrolled course listing with progress
 */

import prisma from "../config/prisma.js";

// ─────────────────────────────────────────────────────────
// ENROLLMENT
// ─────────────────────────────────────────────────────────

/**
 * POST /api/class/enroll/:courseId
 * Enroll the authenticated user in a course.
 * - Free courses: direct enroll
 * - Paid courses: blocked until payment is implemented
 */
export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const course = await prisma.newCourse.findFirst({
      where: { id: courseId, status: "PUBLISHED", isDeleted: false },
    });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found or not published" });
    }

    // Check already enrolled
    const existing = await prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Already enrolled" });
    }

    // Paid course gate
    if (!course.isFree) {
      return res.status(402).json({
        success: false,
        message: "This is a paid course. Payment integration coming soon.",
      });
    }

    // Calculate access expiry
    const accessExpiresAt = calculateExpiry(course.accessDuration);

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        courseId,
        userId,
        accessExpiresAt,
        isActive: true,
      },
      include: {
        course: {
          select: { id: true, title: true, slug: true, thumbnailUrl: true },
        },
      },
    });

    return res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    console.error("enrollCourse error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/class/my-courses
 * All enrolled courses for logged-in user with progress summary
 */
// export const getMyEnrollments = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const enrollments = await prisma.courseEnrollment.findMany({
//       where: { userId, isActive: true },
//       include: {
//         course: {
//           select: {
//             id: true,
//             title: true,
//             slug: true,
//             thumbnailUrl: true,
//             accessDuration: true,
//             hasCertificate: true,
//             creator: { select: { id: true, name: true } },
//             sections: {
//               select: {
//                 _count: { select: { lectures: true } },
//               },
//             },
//           },
//         },
//         progress: {
//           select: { isCompleted: true },
//         },
//         certificate: {
//           select: { id: true, certificateUrl: true, issuedAt: true },
//         },
//       },
//       orderBy: { enrolledAt: "desc" },
//     });

//     // Compute progress percentage for each enrollment
//     const data = enrollments.map((e) => {
//       const totalLectures = e.course.sections.reduce(
//         (sum, s) => sum + s._count.lectures,
//         0,
//       );
//       const completed = e.progress.filter((p) => p.isCompleted).length;
//       const progressPercent =
//         totalLectures > 0 ? Math.round((completed / totalLectures) * 100) : 0;

//       return {
//         enrollmentId: e.id,
//         enrolledAt: e.enrolledAt,
//         completedAt: e.completedAt,
//         accessExpiresAt: e.accessExpiresAt,
//         progressPercent,
//         completedLectures: completed,
//         totalLectures,
//         certificate: e.certificate,
//         course: {
//           ...e.course,
//           sections: undefined, // strip nested counts from output
//         },
//       };
//     });

//     return res.json({ success: true, data });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

export const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        userId,
        isActive: true,
      },

      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            accessDuration: true,
            hasCertificate: true,
            isFree: true,
            price: true,

            creator: {
              select: {
                id: true,
                name: true,
              },
            },

            sections: {
              select: {
                _count: {
                  select: {
                    lectures: true,
                  },
                },
              },
            },

            _count: {
              select: {
                enrollments: true,
                sections: true,
              },
            },
          },
        },

        progress: {
          select: {
            isCompleted: true,
          },
        },

        certificate: {
          select: {
            id: true,
            certificateUrl: true,
            issuedAt: true,
          },
        },
      },

      orderBy: {
        enrolledAt: "desc",
      },
    });

    // Compute progress percentage
    const data = enrollments.map((e) => {
      const totalLectures = e.course.sections.reduce(
        (sum, s) => sum + s._count.lectures,
        0,
      );

      const completedLectures = e.progress.filter((p) => p.isCompleted).length;

      const progressPercent =
        totalLectures > 0
          ? Math.round((completedLectures / totalLectures) * 100)
          : 0;

      return {
        enrollmentId: e.id,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
        accessExpiresAt: e.accessExpiresAt,

        progressPercent,
        completedLectures,
        totalLectures,

        certificate: e.certificate,

        course: e.course,
      };
    });

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("getMyEnrollments error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/class/enrollment/:courseId
 * Check if current user is enrolled + return enrollment detail
 */
export const getEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
      include: {
        progress: {
          select: { lectureId: true, isCompleted: true, watchedSeconds: true },
        },
        certificate: {
          select: { id: true, certificateUrl: true, issuedAt: true },
        },
      },
    });

    return res.json({
      success: true,
      isEnrolled: !!enrollment,
      data: enrollment || null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// LECTURE PROGRESS
// ─────────────────────────────────────────────────────────

/**
 * POST /api/class/progress
 * Mark a lecture as watched / update watchedSeconds
 * Body: { courseId, lectureId, watchedSeconds, isCompleted }
 */
export const updateLectureProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      courseId,
      lectureId,
      watchedSeconds = 0,
      isCompleted = false,
    } = req.body;

    if (!courseId || !lectureId) {
      return res
        .status(400)
        .json({ success: false, message: "courseId and lectureId required" });
    }

    // Verify enrollment
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    if (!enrollment) {
      return res
        .status(403)
        .json({ success: false, message: "Not enrolled in this course" });
    }

    const progress = await prisma.lectureProgress.upsert({
      where: {
        enrollmentId_lectureId: { enrollmentId: enrollment.id, lectureId },
      },
      create: {
        enrollmentId: enrollment.id,
        lectureId,
        watchedSeconds,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        watchedSeconds: { set: watchedSeconds },
        ...(isCompleted && { isCompleted: true, completedAt: new Date() }),
      },
    });

    // Check if entire course is now complete
    if (isCompleted) {
      await checkAndMarkCourseComplete(enrollment.id, courseId);
    }

    return res.json({ success: true, data: progress });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/class/progress/:courseId
 * Get all lecture progress for a course
 */
export const getCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: "Not enrolled" });
    }

    const [progress, totalLectures] = await Promise.all([
      prisma.lectureProgress.findMany({
        where: { enrollmentId: enrollment.id },
        select: {
          lectureId: true,
          isCompleted: true,
          watchedSeconds: true,
          completedAt: true,
        },
      }),
      prisma.courseLecture.count({
        where: { section: { courseId } },
      }),
    ]);

    const completed = progress.filter((p) => p.isCompleted).length;

    return res.json({
      success: true,
      data: {
        progress,
        completed,
        totalLectures,
        progressPercent:
          totalLectures > 0 ? Math.round((completed / totalLectures) * 100) : 0,
        completedAt: enrollment.completedAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────────────────

/**
 * GET /api/class/cart
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.courseCart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnailUrl: true,
                price: true,
                isFree: true,
                creator: { select: { id: true, name: true } },
                _count: { select: { enrollments: true } },
              },
            },
          },
          orderBy: { addedAt: "desc" },
        },
      },
    });

    return res.json({
      success: true,
      data: cart || { items: [] },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/class/cart/add
 * Body: { courseId }
 */
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId)
      return res
        .status(400)
        .json({ success: false, message: "courseId required" });

    const course = await prisma.newCourse.findFirst({
      where: { id: courseId, status: "PUBLISHED", isDeleted: false },
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    // Already enrolled? No point adding to cart
    const enrolled = await prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    if (enrolled) {
      return res
        .status(409)
        .json({ success: false, message: "Already enrolled in this course" });
    }

    // Get or create cart
    let cart = await prisma.courseCart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.courseCart.create({ data: { userId } });
    }

    // Add item (ignore if already in cart)
    const item = await prisma.courseCartItem.upsert({
      where: { cartId_courseId: { cartId: cart.id, courseId } },
      create: { cartId: cart.id, courseId },
      update: {},
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            price: true,
            isFree: true,
          },
        },
      },
    });

    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/class/cart/:courseId
 */
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const cart = await prisma.courseCart.findUnique({ where: { userId } });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    await prisma.courseCartItem.deleteMany({
      where: { cartId: cart.id, courseId },
    });

    return res.json({ success: true, message: "Removed from cart" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/class/cart/clear
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await prisma.courseCart.findUnique({ where: { userId } });
    if (!cart)
      return res.json({ success: true, message: "Cart already empty" });

    await prisma.courseCartItem.deleteMany({ where: { cartId: cart.id } });
    return res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// WISHLIST
// ─────────────────────────────────────────────────────────

/**
 * GET /api/class/wishlist
 */
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await prisma.courseWishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnailUrl: true,
                price: true,
                isFree: true,
                creator: { select: { id: true, name: true } },
                _count: { select: { enrollments: true } },
              },
            },
          },
          orderBy: { addedAt: "desc" },
        },
      },
    });

    return res.json({ success: true, data: wishlist || { items: [] } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/class/wishlist/add
 * Body: { courseId }
 */
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId)
      return res
        .status(400)
        .json({ success: false, message: "courseId required" });

    // Get or create wishlist
    let wishlist = await prisma.courseWishlist.findUnique({
      where: { userId },
    });
    if (!wishlist) {
      wishlist = await prisma.courseWishlist.create({ data: { userId } });
    }

    const item = await prisma.courseWishlistItem.upsert({
      where: { wishlistId_courseId: { wishlistId: wishlist.id, courseId } },
      create: { wishlistId: wishlist.id, courseId },
      update: {},
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            price: true,
            isFree: true,
          },
        },
      },
    });

    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/class/wishlist/:courseId
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const wishlist = await prisma.courseWishlist.findUnique({
      where: { userId },
    });
    if (!wishlist)
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });

    await prisma.courseWishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, courseId },
    });

    return res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────

function calculateExpiry(accessDuration) {
  if (accessDuration === "LIFETIME") return null;
  const map = {
    ONE_MONTH: 30,
    THREE_MONTHS: 90,
    SIX_MONTHS: 180,
    ONE_YEAR: 365,
  };
  const days = map[accessDuration];
  if (!days) return null;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function checkAndMarkCourseComplete(enrollmentId, courseId) {
  try {
    const totalLectures = await prisma.courseLecture.count({
      where: { section: { courseId } },
    });
    const completedLectures = await prisma.lectureProgress.count({
      where: { enrollmentId, isCompleted: true },
    });

    if (totalLectures > 0 && completedLectures >= totalLectures) {
      await prisma.courseEnrollment.update({
        where: { id: enrollmentId },
        data: { completedAt: new Date() },
      });
    }
  } catch (_) {
    // Non-critical — don't fail the main request
  }
}
