// follow.controller.js
import prisma from "../config/prisma.js";

export const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const targetUserId = req.params.userId;

    if (followerId === targetUserId) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    // check already followed
    const existing = await prisma.follow.findFirst({
      where: {
        followerId,
        followingUserId: targetUserId,
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Already following",
      });
    }

    // create follow
    await prisma.follow.create({
      data: {
        followerId,
        followingUserId: targetUserId,
      },
    });

    // increment counts
    await prisma.users.update({
      where: { id: followerId },
      data: {
        followingCount: {
          increment: 1,
        },
      },
    });

    await prisma.users.update({
      where: { id: targetUserId },
      data: {
        followersCount: {
          increment: 1,
        },
      },
    });

    res.json({
      message: "Followed successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

export const unfollowUser = async (req, res) => {
  const { targetUserId } = req.body;
  const userId = req.user.id;

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: userId,
        followingId: targetUserId,
      },
    },
  });

  res.json({ message: "Unfollowed" });
};