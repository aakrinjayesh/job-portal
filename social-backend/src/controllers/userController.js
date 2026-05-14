// GET /api/users/suggested  (people the current user does NOT follow)
export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingUserId: true },
    });

    const followingIds = following
      .map((f) => f.followingUserId)
      .filter(Boolean);

    const where = {
      id: { notIn: [...followingIds, userId] },
      role: "candidate",
    };

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true,
          name: true,
          profileUrl: true,
          followersCount: true,
          followingCount: true,
          CandidateProfile: {
            select: {
              title: true,
              currentLocation: true,
              totalExperience: true,
              profilePicture: true,
              primaryClouds: true,
              certifications: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { followersCount: "desc" },
      }),
      prisma.users.count({ where }),
    ]);

    res.json({
      users: users.map((u) => ({ ...u, isFollowedByMe: false })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("getSuggestedUsers error:", err);
    res.status(500).json({ message: err.message });
  }
};
 
// GET /api/users/:userId
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        profileUrl: true,
        followersCount: true,
        followingCount: true,
        role: true,
        CandidateProfile: {
          select: {
            title: true,
            summary: true,
            profilePicture: true,
            currentLocation: true,
            totalExperience: true,
            primaryClouds: true,
            secondaryClouds: true,
            certifications: true,
            skillsJson: true,
            workExperience: true,
            education: true,
            linkedInUrl: true,
            trailheadUrl: true,
            trailheadPoints: true,
            trailheadBadgesCount: true,
            trailheadTrailsCount: true,
            preferredJobType: true,
            currentLocation: true,
            portfolioLink: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const followRecord = await prisma.follow.findUnique({
      where: {
        followerId_followingUserId: {
          followerId: currentUserId,
          followingUserId: userId,
        },
      },
    });

    res.json({ ...user, isFollowedByMe: !!followRecord });
  } catch (err) {
    console.error("getUserProfile error:", err);
    res.status(500).json({ message: err.message });
  }
};
 
export const getSuggestedCompanies = async (req, res) => {
  try {
    const userId = req.user.id;

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingCompanyId: true },
    });

    const followingIds = following
      .map((f) => f.followingCompanyId)
      .filter(Boolean);

    const companies = await prisma.companyProfile.findMany({
      where: {
        id: { notIn: followingIds },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        coverImage: true,
        tagline: true,
        companySize: true,
        headquarters: true,
        partnerTier: true,
        partnerType: true,
        clouds: true,
        followersCount: true,
      },
      take: 10,
      orderBy: { followersCount: "desc" },
    });

    res.json(companies.map((c) => ({ ...c, isFollowedByMe: false })));
  } catch (err) {
    console.error("getSuggestedCompanies error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const followCompany = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { companyId } = req.body;

    await prisma.$transaction([
      prisma.follow.create({
        data: { followerId, followingCompanyId: companyId },
      }),
      prisma.companyProfile.update({
        where: { id: companyId },
        data: { followersCount: { increment: 1 } },
      }),
    ]);

    res.json({ message: "Followed" });
  } catch (err) {
    console.error("followCompany error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const unfollowCompany = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { companyId } = req.body;

    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: { followerId, followingCompanyId: companyId },
      }),
      prisma.companyProfile.update({
        where: { id: companyId },
        data: { followersCount: { decrement: 1 } },
      }),
    ]);

    res.json({ message: "Unfollowed" });
  } catch (err) {
    console.error("unfollowCompany error:", err);
    res.status(500).json({ message: err.message });
  }
};