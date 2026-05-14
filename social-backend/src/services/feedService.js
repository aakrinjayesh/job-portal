// feed.service.js
import prisma from "../config/prisma.js";

export const generateFeed = async (userId, postId) => {
  const followers = await prisma.follow.findMany({
    where: { followingUserId: userId },
    select: { followerId: true },
  });

  const feedData = followers.map(f => ({
    userId: f.followerId,
    postId,
  }));

  await prisma.feed.createMany({
    data: feedData,
    skipDuplicates: true,
  });
};