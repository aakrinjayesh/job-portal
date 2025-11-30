import prisma from "../config/prisma.js";

/**
 * Create a new course (metadata only)
 * Expects req.user to exist (middleware)
 * Body: { title, description?, price?, courseType? }
 */
 const createLearningCourse = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ status: "failed", message: "Unauthorized" });
    }

    const { title, description = "", price = 0, cloudType= "", currency } = req.body;

    if (!title) {
      return res.status(400).json({ status: "failed", message: "Title is required" });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: typeof price === "number" ? price : Number(price),
        currency,
        courseType:cloudType,
        userId: user.id,
      },
    });

    return res.status(201).json({ status: "success", course });
  } catch (err) {
    console.error("Error in createLearningCourse:", err);
    return res.status(500).json({ status: "failed", message: "Could not create course" });
  }
};

/**
 * Upsert or update a course
 * If courseId exists => update fields
 * If not => create new course
 */
 const upsertLearningCourse = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ status: "failed", message: "Unauthorized" });
    }

    const { courseId } = req.params;
    const { title, description = "", price = 0, courseType = "" } = req.body;

    if (!title) {
      return res.status(400).json({ status: "failed", message: "Title is required" });
    }

    if (courseId) {
      // Update existing course
      const existing = await prisma.course.findUnique({ where: { id: courseId } });
      if (!existing) {
        return res.status(404).json({ status: "failed", message: "Course not found" });
      }

      if (existing.userId !== user.id) {
        return res.status(403).json({ status: "failed", message: "Forbidden: not course owner" });
      }

      const updated = await prisma.course.update({
        where: { id: courseId },
        data: {
          title,
          description,
          price: typeof price === "number" ? price : Number(price),
          courseType,
        },
      });

      return res.status(200).json({ status: "success", course: updated });
    } else {
      // Create new course
      const course = await prisma.course.create({
        data: {
          title,
          description,
          price: typeof price === "number" ? price : Number(price),
          courseType,
          userId: user.id,
        },
      });

      return res.status(201).json({ status: "success", course });
    }
  } catch (err) {
    console.error("Error in upsertLearningCourse:", err);
    return res.status(500).json({ status: "failed", message: "Could not upsert course" });
  }
};

/**
 * Delete a course along with its classes
 */
 const deleteLearningCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;

    if (!user?.id) {
      return res.status(401).json({ status: "failed", message: "Unauthorized" });
    }

    const existing = await prisma.course.findUnique({ where: { id: courseId } });
    if (!existing) {
      return res.status(404).json({ status: "failed", message: "Course not found" });
    }

    if (existing.userId !== user.id) {
      return res.status(403).json({ status: "failed", message: "Forbidden: not course owner" });
    }

    // Delete associated classes first
    await prisma.class.deleteMany({ where: { courseId } });
    await prisma.course.delete({ where: { id: courseId } });

    return res.status(200).json({ status: "success", message: "Course deleted" });
  } catch (err) {
    console.error("Error in deleteLearningCourse:", err);
    return res.status(500).json({ status: "failed", message: "Could not delete course" });
  }
};

/**
 * Get all courses for the logged-in user
 */
 const getAllLearningCourses = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ status: "failed", message: "Unauthorized" });
    }

    const courses = await prisma.course.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ status: "success", data: courses });
  } catch (err) {
    console.error("Error in getAllLearningCourses:", err);
    return res.status(500).json({ status: "failed", message: "Could not fetch courses" });
  }
};

/**
 * Get a single course by ID
 */
 const getLearningCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ status: "failed", message: "Course ID is required" });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { class: true },
    });

    if (!course) {
      return res.status(404).json({ status: "failed", message: "Course not found" });
    }

    return res.status(200).json({ status: "success", course });
  } catch (err) {
    console.error("Error in getLearningCourseById:", err);
    return res.status(500).json({ status: "failed", message: "Could not fetch course" });
  }
};

/**
 * Add one or multiple classes to a course
 * Body: { courseId, classes: [{ title, description?, type, fileUrl, size?, duration?, metaData? }] }
 */
 const createClass = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ status: "failed", message: "Unauthorized" });
    }

    const { courseId, classes } = req.body;

    if (!courseId) {
      return res.status(400).json({ status: "failed", message: "courseId is required" });
    }

    if (!Array.isArray(classes) || classes.length === 0) {
      return res.status(400).json({ status: "failed", message: "Classes array is required" });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ status: "failed", message: "Course not found" });
    }

    if (course.userId !== user.id) {
      return res.status(403).json({ status: "failed", message: "Forbidden: not course owner" });
    }

    const classData = classes.map((cls) => ({
      title: cls.title,
      description: cls.description || "",
      type: cls.type,
      url: cls.fileUrl ||cls.file,
      size: cls.size || null,
      duration: cls.duration || null,
      metaData: cls.metaData || null,
      courseId,
    }));

    const createdClasses = await prisma.class.createMany({
      data: classData,
      skipDuplicates: true,
    });

    return res.status(201).json({ status: "success", created: createdClasses.count });
  } catch (err) {
    console.error("Error in createClass:", err);
    return res.status(500).json({ status: "failed", message: "Could not create classes" });
  }
};
export {
  createLearningCourse,
  upsertLearningCourse,
  deleteLearningCourse,
  getAllLearningCourses,
  getLearningCourseById,
  createClass,
};