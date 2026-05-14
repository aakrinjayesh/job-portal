import courseAxios from "./axiosInstance.js";

// ─────────────────────────────────────────────────────────
// FILE UPLOADS
// ─────────────────────────────────────────────────────────

export async function UploadCourseThumbnail(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await courseAxios.post(
      "/courses/upload/thumbnail",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error in UploadCourseThumbnail:", error);
    throw error;
  }
}

// export async function UploadLectureFile(file) {
//   try {
//     const formData = new FormData();
//     formData.append("file", file);
//     const response = await courseAxios.post(
//       "/courses/upload/lecture",
//       formData,
//       {
//         headers: { "Content-Type": "multipart/form-data" },
//       },
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error in UploadLectureFile:", error);
//     throw error;
//   }
// }
export async function UploadLectureFile(file, onProgress) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await courseAxios.post(
      "/courses/upload/lecture",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(percent);
          }
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error in UploadLectureFile:", error);
    throw error;
  }
}

export async function UploadCertificateFile(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await courseAxios.post(
      "/courses/upload/certificate",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error in UploadCertificateFile:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// COURSES
// ─────────────────────────────────────────────────────────

// Public — all published courses
export async function GetAllCourses(page = 1, limit = 12, search = "", isFree) {
  try {
    const params = { page, limit };
    if (search) params.search = search;
    if (isFree !== undefined) params.isFree = isFree;
    const response = await courseAxios.get("/courses", { params });
    return response.data;
  } catch (error) {
    console.error("Error in GetAllCourses:", error);
    throw error;
  }
}

// Public — single course by id
export async function GetCourseById(id) {
  try {
    const response = await courseAxios.get(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error in GetCourseById:", error);
    throw error;
  }
}

// Public — single course by slug
export async function GetCourseBySlug(slug) {
  try {
    const response = await courseAxios.get(`/courses/slug/${slug}`);
    return response.data;
    // export async function GetCourseBySlug(slug) {
    //   try {
    //     const response = await courseAxios.get(
    //       `/courses/slug/${encodeURIComponent(slug.toLowerCase())}`,
    //     );
    //     return response.data;
  } catch (error) {
    console.error("Error in GetCourseBySlug:", error);
    throw error;
  }
}

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
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Instructor — my courses
export async function GetMyCourses() {
  try {
    const response = await courseAxios.get("/courses/my");
    return response.data;
  } catch (error) {
    console.error("Error in GetMyCourses:", error);
    throw error;
  }
}

// Instructor — create course (JSON, thumbnailUrl already uploaded)
export async function CreateCourse(payload) {
  try {
    const response = await courseAxios.post("/courses", payload);
    return response.data;
  } catch (error) {
    console.error("Error in CreateCourse:", error);
    throw error;
  }
}

// Instructor — update course
export async function UpdateCourse(id, payload) {
  try {
    const response = await courseAxios.put(`/courses/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error in UpdateCourse:", error);
    throw error;
  }
}

// Instructor — publish / unpublish toggle
export async function PublishCourse(id) {
  try {
    const response = await courseAxios.patch(`/courses/${id}/publish`);
    return response.data;
  } catch (error) {
    console.error("Error in PublishCourse:", error);
    throw error;
  }
}

// Instructor — soft delete
export async function DeleteCourse(id) {
  try {
    const response = await courseAxios.delete(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error in DeleteCourse:", error);
    throw error;
  }
}

// Admin — all courses
export async function AdminGetAllCourses(
  page = 1,
  limit = 20,
  status = "",
  search = "",
) {
  try {
    const response = await courseAxios.get("/courses/admin/all", {
      params: { page, limit, status, search },
    });
    return response.data;
  } catch (error) {
    console.error("Error in AdminGetAllCourses:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// SECTIONS
// ─────────────────────────────────────────────────────────

export async function CreateSection(courseId, payload) {
  try {
    const response = await courseAxios.post(
      `/courses/${courseId}/sections`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error in CreateSection:", error);
    throw error;
  }
}

export async function UpdateSection(courseId, sectionId, payload) {
  try {
    const response = await courseAxios.put(
      `/courses/${courseId}/sections/${sectionId}`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error in UpdateSection:", error);
    throw error;
  }
}

export async function DeleteSection(courseId, sectionId) {
  try {
    const response = await courseAxios.delete(
      `/courses/${courseId}/sections/${sectionId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error in DeleteSection:", error);
    throw error;
  }
}

export async function ReorderSections(courseId, sections) {
  try {
    const response = await courseAxios.patch(
      `/courses/${courseId}/sections/reorder`,
      { sections },
    );
    return response.data;
  } catch (error) {
    console.error("Error in ReorderSections:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// LECTURES
// ─────────────────────────────────────────────────────────

export async function CreateLecture(courseId, sectionId, payload) {
  try {
    const response = await courseAxios.post(
      `/courses/${courseId}/sections/${sectionId}/lectures`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error in CreateLecture:", error);
    throw error;
  }
}

export async function UpdateLecture(courseId, sectionId, lectureId, payload) {
  try {
    const response = await courseAxios.put(
      `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error in UpdateLecture:", error);
    throw error;
  }
}

export async function DeleteLecture(courseId, sectionId, lectureId) {
  try {
    const response = await courseAxios.delete(
      `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error in DeleteLecture:", error);
    throw error;
  }
}

export async function ReorderLectures(courseId, sectionId, lectures) {
  try {
    const response = await courseAxios.patch(
      `/courses/${courseId}/sections/${sectionId}/lectures/reorder`,
      { lectures },
    );
    return response.data;
  } catch (error) {
    console.error("Error in ReorderLectures:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// ENROLLMENT
// ─────────────────────────────────────────────────────────

export async function EnrollCourse(courseId) {
  try {
    const response = await courseAxios.post(`/class/enroll/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error in EnrollCourse:", error);
    throw error;
  }
}

export async function GetMyEnrollments() {
  try {
    const response = await courseAxios.get("/class/my-courses");
    return response.data;
  } catch (error) {
    console.error("Error in GetMyEnrollments:", error);
    throw error;
  }
}

export async function GetEnrollmentStatus(courseId) {
  try {
    const response = await courseAxios.get(`/class/enrollment/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error in GetEnrollmentStatus:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// PROGRESS
// ─────────────────────────────────────────────────────────

export async function UpdateLectureProgress(payload) {
  try {
    const response = await courseAxios.post("/class/progress", payload);
    return response.data;
  } catch (error) {
    console.error("Error in UpdateLectureProgress:", error);
    throw error;
  }
}

export async function GetCourseProgress(courseId) {
  try {
    const response = await courseAxios.get(`/class/progress/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error in GetCourseProgress:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────────────────

export async function GetCart() {
  try {
    const response = await courseAxios.get("/class/cart");
    return response.data;
  } catch (error) {
    console.error("Error in GetCart:", error);
    throw error;
  }
}

export async function AddToCart(courseId) {
  try {
    const response = await courseAxios.post("/class/cart/add", { courseId });
    return response.data;
  } catch (error) {
    console.error("Error in AddToCart:", error);
    throw error;
  }
}

export async function RemoveFromCart(courseId) {
  try {
    const response = await courseAxios.delete(`/class/cart/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error in RemoveFromCart:", error);
    throw error;
  }
}

export async function ClearCart() {
  try {
    const response = await courseAxios.delete("/class/cart/clear");
    return response.data;
  } catch (error) {
    console.error("Error in ClearCart:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// WISHLIST
// ─────────────────────────────────────────────────────────

export async function GetWishlist() {
  try {
    const response = await courseAxios.get("/class/wishlist");
    return response.data;
  } catch (error) {
    console.error("Error in GetWishlist:", error);
    throw error;
  }
}

export async function AddToWishlist(courseId) {
  try {
    const response = await courseAxios.post("/class/wishlist/add", {
      courseId,
    });
    return response.data;
  } catch (error) {
    console.error("Error in AddToWishlist:", error);
    throw error;
  }
}

export async function RemoveFromWishlist(courseId) {
  try {
    const response = await courseAxios.delete(`/class/wishlist/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error in RemoveFromWishlist:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// ASSESSMENT
// ─────────────────────────────────────────────────────────

export async function CreateOrUpdateAssessment(courseId, payload) {
  try {
    const response = await courseAxios.post(
      `/review/assessment/${courseId}`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error in CreateOrUpdateAssessment:", error);
    throw error;
  }
}

export async function GetAssessment(courseId) {
  try {
    const response = await courseAxios.get(`/review/assessment/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error in GetAssessment:", error);
    throw error;
  }
}

export async function DeleteAssessment(courseId) {
  try {
    const response = await courseAxios.delete(`/review/assessment/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error in DeleteAssessment:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// ATTEMPTS
// ─────────────────────────────────────────────────────────

export async function SubmitAssessment(courseId, answers) {
  try {
    const response = await courseAxios.post(`/review/attempt/${courseId}`, {
      answers,
    });
    return response.data;
  } catch (error) {
    console.error("Error in SubmitAssessment:", error);
    throw error;
  }
}

export async function GetMyAttempts(courseId) {
  try {
    const response = await courseAxios.get(`/review/attempts/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error in GetMyAttempts:", error);
    throw error;
  }
}

export async function GetAttemptsByInstructor(courseId) {
  try {
    const response = await courseAxios.get(
      `/review/attempts/instructor/${courseId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error in GetAttemptsByInstructor:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// CERTIFICATES
// ─────────────────────────────────────────────────────────

export async function GetMyCertificate(courseId) {
  try {
    const response = await courseAxios.get(`/review/certificate/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error in GetMyCertificate:", error);
    throw error;
  }
}

export async function GetAllMyCertificates() {
  try {
    const response = await courseAxios.get("/review/certificates/my");
    return response.data;
  } catch (error) {
    console.error("Error in GetAllMyCertificates:", error);
    throw error;
  }
}

export async function UpdateCertificateUrl(courseId, payload) {
  try {
    const response = await courseAxios.patch(
      `/review/certificate/${courseId}/url`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error in UpdateCertificateUrl:", error);
    throw error;
  }
}

export async function CheckCourseSlug(slug) {
  try {
    const response = await courseAxios.get(`/courses/check-slug/${slug}`);

    return response.data;
  } catch (error) {
    console.error("Error in CheckCourseSlug:", error);
    throw error;
  }
}
