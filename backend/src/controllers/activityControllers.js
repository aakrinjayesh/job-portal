import prisma from "../config/prisma.js";
import { canCreate, canView, canDelete, canEdit } from "../utils/permission.js";

/**
 * CREATE ACTIVITY (NOTE or SCHEDULE)
 */
// export const createActivity = async (req, res) => {
//   try {
//     const { id: recruiterId, organizationId, permission } = req.user;

//     // Permission check
//     if (!canCreate(permission)) {
//       return res.status(403).json({
//         status: "error",
//         message: "You are not allowed to create activities"
//       });
//     }

//     const { candidateId, category, note, schedule } = req.body;

//     if (!candidateId || !category) {
//       return res.status(400).json({
//         status: "error",
//         message: "candidateId and category are required"
//       });
//     }

//     // Validate candidate
//     const candidate = await prisma.users.findUnique({ where: { id: candidateId } });

//     if (!candidate || candidate.role !== "candidate") {
//       return res.status(404).json({
//         status: "error",
//         message: "Invalid candidate"
//       });
//     }

//     // 3️⃣ Category-specific validation
//     if (category === "NOTE" && !note) {
//       return res.status(400).json({
//         status: "error",
//         message: "Note data is required"
//       });
//     }

//     if (category === "SCHEDULE" && !schedule) {
//       return res.status(400).json({
//         status: "error",
//         message: "Schedule data is required"
//       });
//     }
//     const result = await prisma.$transaction(async (tx) => {
//       const activity = await tx.activity.create({
//         data: {
//           recruiterId,
//           candidateId,
//           organizationId,
//           category
//         }
//       });

//       if (category === "NOTE") {
//         await tx.activityNote.create({
//           data: {
//             activityId: activity.id,
//             subject: note.subject,
//             noteType: note.noteType,
//             description: note.description,
//             interactedAt: new Date(note.interactedAt)
//           }
//         });
//       }

//       if (category === "SCHEDULE") {
//         await tx.activitySchedule.create({
//           data: {
//             activityId: activity.id,
//             title: schedule.title,
//             scheduleType: schedule.scheduleType,
//             startTime: new Date(schedule.startTime),
//             endTime: new Date(schedule.endTime),
//             notes: schedule.notes
//           }
//         });
//       }

//       return tx.activity.findUnique({
//         where: { id: activity.id },
//         // include: { note: true, schedule: true }
//         include: {
//           note: true,
//           schedule: true,
//           recruiter: {
//             select: { id: true, name: true, email: true }
//           },
//           candidate: {
//             select: { id: true, name: true, email: true }
//           }
//         }
//       });
//     });

//     return res.status(201).json({ status: "success", data: result });

//   } catch (error) {
//     console.error("Create Activity Error:", error);
//     return res.status(500).json({ status: "error", message: "Internal server error" });
//   }
// };

export const createActivity = async (req, res) => {
  try {
    const { id: recruiterId, organizationId, permission } = req.user;

    if (!canCreate(permission)) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }

    const { jobId, candidateProfileId, category, note, schedule } = req.body;
    console.log("body", req.body);

    if (!jobId || !candidateProfileId || !category) {
      return res.status(400).json({
        status: "error",
        message: "jobId, candidateProfileId and category are required",
      });
    }

    // ✅ Validate Job
    const job = await prisma.job.findFirst({
      where: { id: jobId, organizationId, isDeleted: false },
    });

    if (!job) {
      return res.status(404).json({ status: "error", message: "Invalid job" });
    }

    // ✅ Validate Candidate Application
    const application = await prisma.jobApplication.findFirst({
      where: {
        jobId,
        candidateProfileId,
        organizationId,
      },
    });

    if (!application) {
      return res.status(400).json({
        status: "error",
        message: "Candidate has not applied to this job",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const activity = await tx.activity.create({
        data: {
          recruiterId,
          candidateId: candidateProfileId,
          jobId,
          organizationId,
          category,
        },
      });

      if (category === "NOTE") {
        await tx.activityNote.create({
          data: {
            activityId: activity.id,
            subject: note.subject,
            noteType: note.noteType,
            description: note.description,
            interactedAt: new Date(note.interactedAt),
            startTime: note.startTime ? new Date(note.startTime) : null,
            endTime: note.endTime ? new Date(note.endTime) : null,
          },
        });
      }

      if (category === "SCHEDULE") {
        await tx.activitySchedule.create({
          data: {
            activityId: activity.id,
            title: schedule.title,
            scheduleType: schedule.scheduleType,
            startTime: new Date(schedule.startTime),
            endTime: new Date(schedule.endTime),
            notes: schedule.notes,
          },
        });
      }

      return tx.activity.findUnique({
        where: { id: activity.id },
        include: { note: true, schedule: true },
      });
    });

    return res.status(201).json({ status: "success", data: result });
  } catch (error) {
    console.error("Create Activity Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

// export const getMyActivity = async (req, res) => {
//   try {
//     const { organizationId } = req.user;

//     // if (!canView(permission)) {
//     //   return res.status(403).json({
//     //     status: "error",
//     //     message: "You are not allowed to view activities"
//     //   });
//     // }

//     const activities = await prisma.activity.findMany({
//       where: { organizationId },
//       include: {
//         candidate: { select: { id: true, name: true, email: true } },
//         recruiter: { select: { id: true, name: true, email: true } },
//         schedule: true
//       },
//       orderBy: { createdAt: "desc" }
//     });

//     const candidateMap = {};

//     for (const activity of activities) {
//       const candidateId = activity.candidate.id;

//       if (!candidateMap[candidateId]) {
//         candidateMap[candidateId] = {
//           candidate: activity.candidate,
//           totalActivities: 0,
//           lastActivityAt: activity.createdAt,
//           nextSchedule: null
//         };
//       }

//       candidateMap[candidateId].totalActivities += 1;

//       // Last activity
//       if (activity.createdAt > candidateMap[candidateId].lastActivityAt) {
//         candidateMap[candidateId].lastActivityAt = activity.createdAt;
//       }

//       // Next upcoming schedule
//       if (
//         activity.schedule &&
//         new Date(activity.schedule.startTime) > new Date()
//       ) {
//         const existing = candidateMap[candidateId].nextSchedule;

//         if (
//           !existing ||
//           new Date(activity.schedule.startTime) <
//             new Date(existing.startTime)
//         ) {
//           candidateMap[candidateId].nextSchedule = activity.schedule;
//         }
//       }
//     }

//     return res.status(200).json({ status: "success", data: Object.values(candidateMap) });

//   } catch (error) {
//     console.error("My Activity Error:", error);
//     return res.status(500).json({ status: "error", message: "Internal server error" });
//   }
// };

//CANDIDATE ACTIVITY TIMELINE

export const getMyActivity = async (req, res) => {
  try {
    const { organizationId } = req.user;
    // const { jobId } = req.body;

    const activities = await prisma.activity.findMany({
      where: {
        organizationId,
        // ...(jobId && { jobId })
      },
      include: {
        job: {
          select: {
            id: true,
            role: true,
            companyName: true,
            status: true,
            location: true,
          },
        },
        candidate: {
          select: { id: true, name: true, email: true, profilePicture: true },
        },
        recruiter: {
          select: { id: true, name: true, email: true },
        },
        schedule: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const jobMap = {};

    for (const activity of activities) {
      const jobKey = activity.job.id;
      const candidateKey = activity.candidate.id;

      if (!jobMap[jobKey]) {
        jobMap[jobKey] = {
          job: activity.job,
          candidates: {},
        };
      }

      if (!jobMap[jobKey].candidates[candidateKey]) {
        jobMap[jobKey].candidates[candidateKey] = {
          candidate: activity.candidate,
          recruiters: {},
          totalActivities: 0,
          lastActivityAt: activity.createdAt,
          nextSchedule: null,
        };
      }

      const candidateEntry = jobMap[jobKey].candidates[candidateKey];
      candidateEntry.totalActivities += 1;

      if (activity.createdAt > candidateEntry.lastActivityAt) {
        candidateEntry.lastActivityAt = activity.createdAt;
      }

      // recruiters (B = only recruiters who worked)
      candidateEntry.recruiters[activity.recruiter.id] = activity.recruiter;

      // next schedule
      if (
        activity.schedule &&
        new Date(activity.schedule.startTime) > new Date()
      ) {
        if (
          !candidateEntry.nextSchedule ||
          new Date(activity.schedule.startTime) <
            new Date(candidateEntry.nextSchedule.startTime)
        ) {
          candidateEntry.nextSchedule = activity.schedule;
        }
      }
    }

    const response = Object.values(jobMap).map((job) => ({
      ...job,
      candidates: Object.values(job.candidates).map((c) => ({
        ...c,
        recruiters: Object.values(c.recruiters),
      })),
    }));

    return res.status(200).json({ status: "success", data: response });
  } catch (error) {
    console.error("My Activity Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

// export const getCandidateActivities = async (req, res) => {
//   try {
//     const { organizationId, permission } = req.user;
//     const { candidateId } = req.params;

//     if (!canView(permission)) {
//       return res.status(403).json({
//         status: "error",
//         message: "You are not allowed to view activities"
//       });
//     }

//     // Validate candidate
//     const candidate = await prisma.users.findUnique({
//       where: { id: candidateId }
//     });

//     if (!candidate || candidate.role !== "candidate") {
//       return res.status(404).json({
//         status: "error",
//         message: "Candidate not found"
//       });
//     }

//     const activities = await prisma.activity.findMany({
//       where: {
//         organizationId,
//         candidateId
//       },
//       include: {
//         note: true,
//         schedule: true
//       },
//       orderBy: {
//         createdAt: "desc"
//       }
//     });

//     return res.status(200).json({
//       status: "success",
//       data: activities
//     });

//   } catch (error) {
//     console.error("Candidate Activity Error:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Internal server error"
//     });
//   }
// };

//UPDATE ACTIVITY

export const getCandidateActivities = async (req, res) => {
  try {
    const { organizationId, permission } = req.user;
    const { jobId, candidateProfileId } = req.body;

    if (!canView(permission)) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }

    const activities = await prisma.activity.findMany({
      where: {
        organizationId,
        jobId,
        candidateId: candidateProfileId,
      },
      include: {
        note: true,
        schedule: true,
        recruiter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ status: "success", data: activities });
  } catch (error) {
    console.error("Candidate Activity Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

// export const updateActivity = async (req, res) => {
//   try {
//     const { permission, organizationId } = req.user;
//     const { activityId } = req.params;

//     if (!canEdit(permission)) {
//       return res.status(403).json({
//         status: "error",
//         message: "You are not allowed to edit activities"
//       });
//     }

//     const activity = await prisma.activity.findUnique({
//       where: { id: activityId },
//       include: { note: true, schedule: true }
//     });

//     if (!activity || activity.organizationId !== organizationId) {
//       return res.status(404).json({
//         status: "error",
//         message: "Activity not found"
//       });
//     }

//     const { note, schedule } = req.body;

//     if (activity.category === "NOTE") {
//       await prisma.activityNote.update({
//         where: { activityId },
//         data: {
//           subject: note.subject,
//           noteType: note.noteType,
//           description: note.description,
//           interactedAt: new Date(note.interactedAt)
//         }
//       });
//     }

//     if (activity.category === "SCHEDULE") {
//       await prisma.activitySchedule.update({
//         where: { activityId },
//         data: {
//           title: schedule.title,
//           scheduleType: schedule.scheduleType,
//           startTime: new Date(schedule.startTime),
//           endTime: new Date(schedule.endTime),
//           notes: schedule.notes
//         }
//       });
//     }

//     const updated = await prisma.activity.findUnique({
//       where: { id: activityId },
//       include: { note: true, schedule: true }
//     });

//     return res.status(200).json({ status: "success", data: updated });

//   } catch (error) {
//     console.error("Update Activity Error:", error);
//     return res.status(500).json({ status: "error", message: "Internal server error" });
//   }
// };

export const updateActivity = async (req, res) => {
  try {
    const { id: recruiterId, permission, organizationId } = req.user;
    const { activityId } = req.params;
    const { note, schedule } = req.body;

    if (!canEdit(permission)) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }

    const activity = await prisma.activity.findFirst({
      where: { id: activityId, recruiterId, organizationId },
      include: { note: true, schedule: true },
    });

    if (!activity) {
      return res
        .status(404)
        .json({ status: "error", message: "Activity not found" });
    }

    if (activity.category === "NOTE") {
      await prisma.activityNote.update({
        where: { activityId },
        data: {
          subject: note.subject,
          noteType: note.noteType,
          description: note.description,
          interactedAt: new Date(note.interactedAt),
        },
      });
    }

    if (activity.category === "SCHEDULE") {
      await prisma.activitySchedule.update({
        where: { activityId },
        data: {
          title: schedule.title,
          scheduleType: schedule.scheduleType,
          startTime: new Date(schedule.startTime),
          endTime: new Date(schedule.endTime),
          notes: schedule.notes,
        },
      });
    }

    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("Update Activity Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

//DELETE ACTIVITY

// export const deleteActivity = async (req, res) => {
//   try {
//     const { permission, organizationId } = req.user;
//     const { activityId } = req.params;

//     if (!canDelete(permission)) {
//       return res.status(403).json({
//         status: "error",
//         message: "You are not allowed to delete activities"
//       });
//     }

//     const activity = await prisma.activity.findUnique({
//       where: { id: activityId }
//     });

//     if (!activity || activity.organizationId !== organizationId) {
//       return res.status(404).json({
//         status: "error",
//         message: "Activity not found"
//       });
//     }

//     await prisma.activity.delete({ where: { id: activityId } });

//     return res.status(200).json({
//       status: "success",
//       message: "Activity deleted successfully"
//     });

//   } catch (error) {
//     console.error("Delete Activity Error:", error);
//     return res.status(500).json({ status: "error", message: "Internal server error" });
//   }
// };

export const deleteActivity = async (req, res) => {
  try {
    const { id: recruiterId, permission, organizationId } = req.user;
    const { activityId } = req.params;

    if (!canDelete(permission)) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }

    const activity = await prisma.activity.findFirst({
      where: { id: activityId, recruiterId, organizationId },
    });

    if (!activity) {
      return res
        .status(404)
        .json({ status: "error", message: "Activity not found" });
    }

    await prisma.activity.delete({ where: { id: activityId } });

    return res.status(200).json({
      status: "success",
      message: "Activity deleted successfully",
    });
  } catch (error) {
    console.error("Delete Activity Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};
