// src/controllers/course.controller.js
import path from "path";
import prisma from "../config/prisma.js";

/**
 * Save uploaded video file metadata (no DB write).
 * Multer middleware should place file on disk and provide req.file.
 *
 * Response (example)
 * {
 *   success: true,
 *   data: {
 *     id: "1600000000-myfile.mp4",
 *     url: "/videos/myfile.mp4",
 *     fileName: "myfile.mp4",
 *     size: 12312321,
 *     duration: null
 *   }
 * }
 */
const uploadCourseVideo = async (req, res) => {
  try {
    console.log("Inside uploadVideo controller");

    if (!req.file) {
      return res.status(400).json({ status: "failed", message: "No file uploaded" });
    }

    // multer ALWAYS gives the correct saved file name in req.file.filename
    const fileName = req.file.filename;  
    const fileUrl = `/videos/${fileName}`;  // express.static maps this correctly

    // ❌ REMOVE extra Date.now() — this creates WRONG filenames
    // const id = `${Date.now()}-${fileName}`;  <-- THIS BROKE URL

    // ✔ CORRECT: Use actual stored file name as ID
    const id = fileName;

    const payload = {
      id,
      url: fileUrl,
      fileName,
      size: req.file.size ?? null,
      duration: null, // duration still disabled
    };

    console.log("Uploaded video meta:", payload);

    return res.status(200).json({ success: true, data: payload });
  } catch (err) {
    console.error("Error in uploadVideo:", err);
    return res.status(500).json({ status: "failed", message: "Video upload failed" });
  }
};


/**
 * Create a Course and create its videos in nested write.
 * Expects req.user to exist (middleware) to get logged-in user id.
 *
 * Expected body:
 * {
 *   title: "Course title",
 *   description: "...",
 *   price: 0,
 *   videos: [
 *     { id: "client-id-or-filename", url: "/videos/x.mp4", fileName: "x.mp4", size: 123, duration: null },
 *     ...
 *   ],
 *   // optional other fields
 * }
 */
const createCourse = async (req, res) => {
  try {
    console.log("Inside createCourse");
    const userFromToken = req.user;
    if (!userFromToken?.id) {
      return res.status(401).json({ status: "failed", message: "Unauthorized" });
    }

    const { title, description = "", price = 0, videos = [], ...other } = req.body;

    if (!title) {
      return res.status(400).json({ status: "failed", message: "Title is required" });
    }

    if (!Array.isArray(videos) || videos.length === 0) {
      return res.status(400).json({ status: "failed", message: "At least one video is required" });
    }

    // Prepare video rows for createMany
    // Accept undefined/null for optional fields; Prisma createMany expects values for each column
    const videosData = videos.map((v) => ({
      // If your Prisma Video model has an 'id' you can supply it here; if not, Prisma will auto-generate.
      // We're not relying on client-provided id for the DB primary key here.
      url: v.url ?? null,
      fileName: v.fileName ?? null,
      size: typeof v.size === "number" ? v.size : (v.size ? Number(v.size) : null),
      duration: v.duration ?? null,
    }));

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: typeof price === "number" ? price : Number(price ?? 0),
        userId: userFromToken.id, // assumes Course model has userId (creator) field
        videos: {
          createMany: {
            data: videosData,
          },
        },
        ...other,
      },
      include: {
        videos: true,
      },
    });

    console.log("Course created:", course.id);
    return res.status(201).json({ status: "success", course });
  } catch (err) {
    console.error("Error in createCourse:", err);
    return res.status(500).json({ status: "failed", message: "Could not create course" });
  }
};

/**
 * updateOrUpsertCourse
 * If course exists => update fields.
 * If 'videos' array provided in body => replace existing videos (deleteMany + createMany) in a transaction.
 *
 * Expected:
 * PUT /courses/:id
 * body: { title, description, price, videos: [...] }
 */
const updateOrUpsertCourse = async (req, res) => {
  try {
    console.log("Inside updateOrUpsertCourse");

    const userFromToken = req.user;
    if (!userFromToken?.id) {
      return res.status(401).json({ status: "failed", message: "Unauthorized" });
    }

   const courseId = req.params.courseId;
    if (!courseId) {
      return res.status(400).json({ status: "failed", message: "Course id is required" });
    }

    const { title, description, price, videos, ...other } = req.body;

    // Verify course exists and belongs to user (optional but recommended)
    const existing = await prisma.course.findUnique({ where: { id: courseId } });
    if (!existing) {
      return res.status(404).json({ status: "failed", message: "Course not found" });
    }

    // Optionally check ownership
    if (existing.userId !== userFromToken.id) {
      // If admins are allowed to update, adapt this check.
      return res.status(403).json({ status: "failed", message: "Forbidden: not course owner" });
    }

    // If videos array is provided, replace existing videos in a transaction.
    if (Array.isArray(videos)) {
      // prepare videos data
      const videosData = videos.map((v) => ({
        url: v.url ?? null,
        fileName: v.fileName ?? null,
        size: typeof v.size === "number" ? v.size : (v.size ? Number(v.size) : null),
        duration: v.duration ?? null,
        courseId: courseId,
      }));

      // Run transaction: update course metadata + delete old videos + create new ones
      const result = await prisma.$transaction([
        prisma.course.update({
          where: { id: courseId },
          data: {
            title: title ?? existing.title,
            description: description ?? existing.description,
            price: typeof price === "number" ? price : (price ? Number(price) : existing.price),
            ...other,
          },
        }),
        prisma.video.deleteMany({ where: { courseId } }),
        prisma.video.createMany({ data: videosData }),
      ]);

      // result is an array (updateResult, deleteResult, createManyResult)
      return res.status(200).json({ status: "success", message: "Course updated (videos replaced)" });
    }

    // If no videos array, update only course metadata
    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: title ?? existing.title,
        description: description ?? existing.description,
        price: typeof price === "number" ? price : (price ? Number(price) : existing.price),
        ...other,
      },
      include: { videos: true },
    });

    return res.status(200).json({ status: "success", updated });
  } catch (err) {
    console.error("Error in updateOrUpsertCourse:", err);
    return res.status(500).json({ status: "failed", message: "Could not update course" });
  }
};

/**
 * getCourseById - convenience
 */
const getCourseById = async (req, res) => {
  try {
    const courseId = req.params?.id;
    if (!courseId) {
      return res.status(400).json({ status: "failed", message: "Course id required" });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { videos: true },
    });

    if (!course) {
      return res.status(404).json({ status: "failed", message: "Course not found" });
    }

    return res.status(200).json({ status: "success", course });
  } catch (err) {
    console.error("Error in getCourseById:", err);
    return res.status(500).json({ status: "failed", message: "Could not fetch course" });
  }
};

/**
 * listCourses - convenience
 */
const listCourses = async (req, res) => {
  try {
    // You can add pagination, filters here later
    const courses = await prisma.course.findMany({
      include: { videos: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return res.status(200).json({ status: "success", data: courses });
  } catch (err) {
    console.error("Error in listCourses:", err);
    return res.status(500).json({ status: "failed", message: "Could not list courses" });
  }
};
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    await prisma.video.deleteMany({ where: { courseId } });
    await prisma.course.delete({ where: { id: courseId } });

    return res.status(200).json({ status: "success", message: "Course deleted" });
  } catch (err) {
    console.error("deleteCourse error:", err);
    return res.status(500).json({ status: "failed", message: "Could not delete course" });
  }
};


export {
  uploadCourseVideo,
  createCourse,
  updateOrUpsertCourse as updateCourse,
  getCourseById,
  listCourses as listAllCourses,
  deleteCourse,
};
