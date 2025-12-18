import prisma from "../config/prisma.js";

/**
 * CREATE ACTIVITY (NOTE or SCHEDULE)
 */
export const createActivity = async (req, res) => {
  try {
        console.log("🔥 createActivity API HIT"); // 👈 ADD HERE
    const recruiterId = req.user.id;
    const recruiterRole = req.user.role;

    if (recruiterRole !== "company") {
      return res.status(403).json({
        status: "error",
        message: "Only recruiters can create activities"
      });
    }

    const { candidateId, category, note, schedule } = req.body;

    // 1️⃣ Validate input
    if (!candidateId || !category) {
      return res.status(400).json({
        status: "error",
        message: "candidateId and category are required"
      });
    }

    // 2️⃣ Validate candidate
    const candidate = await prisma.users.findUnique({
      where: { id: candidateId }
    });

    if (!candidate || candidate.role !== "candidate") {
      return res.status(404).json({
        status: "error",
        message: "Invalid candidate"
      });
    }

    // 3️⃣ Category-specific validation
    if (category === "NOTE" && !note) {
      return res.status(400).json({
        status: "error",
        message: "Note data is required"
      });
    }

    if (category === "SCHEDULE" && !schedule) {
      return res.status(400).json({
        status: "error",
        message: "Schedule data is required"
      });
    }

    // 4️⃣ Prevent overlapping schedules
    if (category === "SCHEDULE") {
      const overlap = await prisma.activitySchedule.findFirst({
        where: {
          activity: {
            recruiterId,
            candidateId
          },
          OR: [
            {
              startTime: { lte: schedule.endTime },
              endTime: { gte: schedule.startTime }
            }
          ]
        }
      });

    //   if (overlap) {
    //     return res.status(409).json({
    //       status: "error",
    //       message: "Schedule overlaps with existing activity"
    //     });
    //   }
    }

    // 5️⃣ Transaction
    const result = await prisma.$transaction(async (tx) => {
      const activity = await tx.activity.create({
        data: {
          recruiterId,
          candidateId,
          category
        }
      });

      if (category === "NOTE") {
        await tx.activityNote.create({
          data: {
            activityId: activity.id,
            subject: note.subject,
            noteType: note.noteType,
            description: note.description,
            interactedAt: new Date(note.interactedAt)
          }
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
            notes: schedule.notes
          }
        });
      }

      // 6️⃣ Return full activity for UI
      return tx.activity.findUnique({
        where: { id: activity.id },
        include: {
          note: true,
          schedule: true,
          recruiter: {
            select: { id: true, name: true, email: true }
          },
          candidate: {
            select: { id: true, name: true, email: true }
          }
        }
      });
    });

    return res.status(201).json({
      status: "success",
      data: result
    });

  } catch (error) {
    console.error("Create Activity Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};

//MY ACTIVITY
export const getMyActivity = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    if (req.user.role !== "company") {
      return res.status(403).json({
        status: "error",
        message: "Access denied"
      });
    }

    // Fetch all activities for this recruiter
    const activities = await prisma.activity.findMany({
      where: { recruiterId },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        schedule: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Group by candidate
    const candidateMap = {};

    for (const activity of activities) {
      const candidateId = activity.candidate.id;

      if (!candidateMap[candidateId]) {
        candidateMap[candidateId] = {
          candidate: activity.candidate,
          totalActivities: 0,
          lastActivityAt: activity.createdAt,
          nextSchedule: null
        };
      }

      candidateMap[candidateId].totalActivities += 1;

      // Last activity
      if (activity.createdAt > candidateMap[candidateId].lastActivityAt) {
        candidateMap[candidateId].lastActivityAt = activity.createdAt;
      }

      // Next upcoming schedule
      if (
        activity.schedule &&
        new Date(activity.schedule.startTime) > new Date()
      ) {
        const existing = candidateMap[candidateId].nextSchedule;

        if (
          !existing ||
          new Date(activity.schedule.startTime) <
            new Date(existing.startTime)
        ) {
          candidateMap[candidateId].nextSchedule = activity.schedule;
        }
      }
    }

    return res.status(200).json({
      status: "success",
      data: Object.values(candidateMap)
    });

  } catch (error) {
    console.error("My Activity Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};


//CANDIDATE ACTIVITY TIMELINE
export const getCandidateActivities = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { candidateId } = req.params;

    if (req.user.role !== "company") {
      return res.status(403).json({
        status: "error",
        message: "Access denied"
      });
    }

    // Validate candidate
    const candidate = await prisma.users.findUnique({
      where: { id: candidateId }
    });

    if (!candidate || candidate.role !== "candidate") {
      return res.status(404).json({
        status: "error",
        message: "Candidate not found"
      });
    }

    const activities = await prisma.activity.findMany({
      where: {
        recruiterId,
        candidateId
      },
      include: {
        note: true,
        schedule: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.status(200).json({
      status: "success",
      data: activities
    });

  } catch (error) {
    console.error("Candidate Activity Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};


//UPDATE ACTIVITY
export const updateActivity = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { activityId } = req.params;
    const { note, schedule } = req.body;

    if (req.user.role !== "company") {
      return res.status(403).json({
        status: "error",
        message: "Access denied"
      });
    }

    // 1️⃣ Fetch activity
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        note: true,
        schedule: true
      }
    });

    if (!activity) {
      return res.status(404).json({
        status: "error",
        message: "Activity not found"
      });
    }

    // 2️⃣ Ownership check
    if (activity.recruiterId !== recruiterId) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to update this activity"
      });
    }

    // 3️⃣ Update NOTE
    if (activity.category === "NOTE") {
      if (!note) {
        return res.status(400).json({
          status: "error",
          message: "Note data is required"
        });
      }

      await prisma.activityNote.update({
        where: { activityId },
        data: {
          subject: note.subject,
          noteType: note.noteType,
          description: note.description,
          interactedAt: new Date(note.interactedAt)
        }
      });
    }

    // 4️⃣ Update SCHEDULE
    if (activity.category === "SCHEDULE") {
      if (!schedule) {
        return res.status(400).json({
          status: "error",
          message: "Schedule data is required"
        });
      }

      // Prevent overlapping schedules
      const overlap = await prisma.activitySchedule.findFirst({
        where: {
          activityId: { not: activityId },
          activity: {
            recruiterId,
            candidateId: activity.candidateId
          },
          startTime: { lte: schedule.endTime },
          endTime: { gte: schedule.startTime }
        }
      });

      if (overlap) {
        return res.status(409).json({
          status: "error",
          message: "Schedule overlaps with existing activity"
        });
      }

      await prisma.activitySchedule.update({
        where: { activityId },
        data: {
          title: schedule.title,
          scheduleType: schedule.scheduleType,
          startTime: new Date(schedule.startTime),
          endTime: new Date(schedule.endTime),
          notes: schedule.notes
        }
      });
    }

    // 5️⃣ Return updated activity
    const updatedActivity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        note: true,
        schedule: true,
        candidate: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return res.status(200).json({
      status: "success",
      data: updatedActivity
    });

  } catch (error) {
    console.error("Update Activity Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};

//DELETE ACTIVITY

export const deleteActivity = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { activityId } = req.params;

    if (req.user.role !== "company") {
      return res.status(403).json({
        status: "error",
        message: "Access denied"
      });
    }

    // 1️⃣ Fetch activity
    const activity = await prisma.activity.findUnique({
      where: { id: activityId }
    });

    if (!activity) {
      return res.status(404).json({
        status: "error",
        message: "Activity not found"
      });
    }

    // 2️⃣ Ownership check
    if (activity.recruiterId !== recruiterId) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to delete this activity"
      });
    }

    // 3️⃣ Hard delete
    await prisma.activity.delete({
      where: { id: activityId }
    });

    return res.status(200).json({
      status: "success",
      message: "Activity deleted successfully"
    });

  } catch (error) {
    console.error("Delete Activity Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};