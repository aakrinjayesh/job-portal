import prisma from "../config/prisma.js";
/**
 * Get all classes for a given courseId
 * @param {string} courseId - ID of the course
 * @returns {Array} - List of class objects
 */
export const getCourseWithClasses = async (req, res) => {
  console.log(req.query)
  try {
    const { courseId } = req.query; // use query param

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    } 

    // Fetch all classes related to this courseId
    const classes = await prisma.class.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' }, // newest first
    });
    console.log(classes)
    res.status(200).json(classes); // send array of classes
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
export const createClass = async (req, res) => {
  try {
    const { courseId, title, description, type, fileUrl, fileName, size } = req.body;

    if (!courseId || !title || !fileUrl) {
      return res.status(400).json({
        status: "failed",
        message: "courseId, title, and fileUrl are required",
      });
    }

    const created = await prisma.class.create({
      data: {
        courseId,
        title,
        description,
        type,
        url: fileUrl,
        fileName,
        size,
      },
    });

    return res.status(201).json({ status: "success", data: created });

  } catch (error) {
    console.error("Error creating class:", error);
    return res.status(500).json({
      status: "failed",
      message: "Server error while creating class",
    });
  }
};
export const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { courseId, title, description, type, fileUrl, fileName, size } = req.body;

    if (!classId) {
      return res.status(400).json({ status: "failed", message: "classId is required" });
    }

    const updated = await prisma.class.update({
      where: { id: classId },
      data: {
        courseId,
        title,
        description,
        type,
        url: fileUrl,        // IMPORTANT — prisma field is url
        fileName,
        size,
      },
    });

    return res.status(200).json({ status: "success", data: updated });

  } catch (error) {
    console.error("Error updating class:", error);
    return res.status(500).json({
      status: "failed",
      message: "Server error while updating class",
    });
  }
};
import fs from "fs";
import path from "path";
export const deleteClass = async (req, res) => {
  console.log("in delete class",req.params)
  try {
    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({ status: "failed", message: "classId required" });
    }

    // 1️⃣ Find the class first (to get url)
    const classItem = await prisma.class.findUnique({
      where: { id: classId },
    });

    console.log("Class item found:", classItem);

    if (!classItem) {
      return res.status(404).json({ status: "failed", message: "Class not found" });
    }

    // 2️⃣ If file exists in DB, delete from folder
   if (classItem.url) {
  const fileName = classItem.url.split("/").pop();
  const filePath = path.resolve("src/uploads/videos", fileName);

  console.log("DELETE FILE PATH:", filePath);
  console.log("FILE EXISTS?", fs.existsSync(filePath));

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log("File deleted:", filePath);
  } else {
    console.log("File not found:", filePath);
  }
}


    // 3️⃣ Delete DB record
    await prisma.class.delete({
      where: { id: classId },
    });

    return res.status(200).json({ status: "success", message: "Class deleted successfully" });

  } catch (error) {
    console.error("Error deleting class:", error);
    return res.status(500).json({
      status: "failed",
      message: "Server error while deleting class",
    });
  }
};

export const deleteMulterFile = async (req, res) => {
  console.log("in delete path", req);
  const { filePath } = req.body;

  const realPath = path.resolve("src", filePath);
console.log("Delete path",filePath)
  if (fs.existsSync(realPath)) fs.unlinkSync(realPath);

  return res.status(200).json({ status: "success", message: "Temp file removed" });
};



