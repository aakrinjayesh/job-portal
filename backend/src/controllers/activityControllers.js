import prisma from "../config/prisma.js";
import { canCreate, canView, canDelete, canEdit } from "../utils/permission.js";

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
    // const application = await prisma.jobApplication.findFirst({
    //   where: {
    //     jobId,
    //     candidateProfileId,
    //     organizationId,
    //   },
    // });
    // const application = await prisma.jobApplication.findFirst({
    //   where: {
    //     jobId,
    //     organizationId,
    //     user: {
    //       CandidateProfile: {
    //         id: candidateProfileId,
    //       },
    //     },
    //   },
    // });
    const application = await prisma.jobApplication.findFirst({
      where: {
        jobId,
        organizationId,
        OR: [
          { candidateProfileId },
          {
            user: {
              CandidateProfile: {
                id: candidateProfileId,
              },
            },
          },
        ],
      },
    });

    console.log("application", application);

    // if (!application) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "Candidate has not applied to this job",
    //   });
    // }

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

export const getMyActivity = async (req, res) => {
  try {
    const { organizationId } = req.user;

    // ===============================
    // 1️⃣ Fetch Activities
    // ===============================
    const activities = await prisma.activity.findMany({
      where: { organizationId },
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
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
        recruiter: {
          select: { id: true, name: true, email: true },
        },
        schedule: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // ===============================
    // 2️⃣ Fetch Completed Tasks
    // ===============================
    const completedTasks = await prisma.candidateTask.findMany({
      where: {
        organizationId,
        completed: true,
      },
      include: {
        taskList: {
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
              select: {
                id: true,
                name: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const jobMap = {};

    // ===============================
    // 3️⃣ PROCESS ACTIVITIES
    // ===============================
    for (const activity of activities) {
      if (!activity.job || !activity.candidate) continue;

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
          completedTasksCount: 0,
          lastCompletedTaskAt: null,
        };
      }

      const candidateEntry = jobMap[jobKey].candidates[candidateKey];

      // count activities
      candidateEntry.totalActivities += 1;

      // update last activity
      if (activity.createdAt > candidateEntry.lastActivityAt) {
        candidateEntry.lastActivityAt = activity.createdAt;
      }

      // unique recruiters
      if (activity.recruiter) {
        candidateEntry.recruiters[activity.recruiter.id] = activity.recruiter;
      }

      // find nearest upcoming schedule
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

    // ===============================
    // 4️⃣ PROCESS COMPLETED TASKS
    // ===============================
    for (const task of completedTasks) {
      if (!task.taskList?.job || !task.taskList?.candidate) continue;

      const job = task.taskList.job;
      const candidate = task.taskList.candidate;

      const jobKey = job.id;
      const candidateKey = candidate.id;

      // create job if not exists
      if (!jobMap[jobKey]) {
        jobMap[jobKey] = {
          job,
          candidates: {},
        };
      }

      // create candidate if not exists
      if (!jobMap[jobKey].candidates[candidateKey]) {
        jobMap[jobKey].candidates[candidateKey] = {
          candidate,
          recruiters: {},
          totalActivities: 0,
          lastActivityAt: task.updatedAt,
          nextSchedule: null,
          completedTasksCount: 0,
          lastCompletedTaskAt: null,
        };
      }

      const candidateEntry = jobMap[jobKey].candidates[candidateKey];

      candidateEntry.completedTasksCount += 1;

      const taskCompletionDate = task.updatedAt;

      if (
        !candidateEntry.lastCompletedTaskAt ||
        taskCompletionDate > candidateEntry.lastCompletedTaskAt
      ) {
        candidateEntry.lastCompletedTaskAt = taskCompletionDate;
      }

      // update overall last activity
      if (taskCompletionDate > candidateEntry.lastActivityAt) {
        candidateEntry.lastActivityAt = taskCompletionDate;
      }
    }

    // ===============================
    // 5️⃣ FINAL RESPONSE FORMAT
    // ===============================
    const response = Object.values(jobMap).map((job) => ({
      ...job,
      candidates: Object.values(job.candidates).map((c) => ({
        ...c,
        recruiters: Object.values(c.recruiters),
      })),
    }));

    return res.status(200).json({
      status: "success",
      data: response,
    });
  } catch (error) {
    console.error("My Activity Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

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
//     const { id: recruiterId, permission, organizationId } = req.user;
//     const { activityId } = req.params;
//     const { note, schedule } = req.body;

//     if (!canEdit(permission)) {
//       return res.status(403).json({ status: "error", message: "Forbidden" });
//     }

//     const activity = await prisma.activity.findFirst({
//       where: { id: activityId, recruiterId, organizationId },
//       include: { note: true, schedule: true },
//     });

//     if (!activity) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Activity not found" });
//     }

//     if (activity.category === "NOTE") {
//       await prisma.activityNote.update({
//         where: { activityId },
//         data: {
//           subject: note.subject,
//           noteType: note.noteType,
//           description: note.description,
//           interactedAt: new Date(note.interactedAt),
//         },
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
//           notes: schedule.notes,
//         },
//       });
//     }

//     return res.status(200).json({ status: "success" });
//   } catch (error) {
//     console.error("Update Activity Error:", error);
//     return res
//       .status(500)
//       .json({ status: "error", message: "Internal server error" });
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
