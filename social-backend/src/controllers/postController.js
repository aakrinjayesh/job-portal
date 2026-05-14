// import prisma from "../config/prisma.js";

// export const getAllPosts = async (req, res) => {
//   const { userId } = req.query;
//   const posts = await prisma.post.findMany({
//     where: { isDeleted: false, ...(userId && { authorId: userId }) },
//     include: {
//       author: { select: { id: true, name: true, profileUrl: true } },
//       _count: { select: { likes: true, comments: true } },
//     },
//     orderBy: { createdAt: "desc" },
//   });
//   res.json(posts);
// };

// export const getPostById = async (req, res) => {
//   const post = await prisma.post.findUnique({
//     where: { id: req.params.id },
//     include: {
//       author: { select: { id: true, name: true, profileUrl: true } },
//       comments: {
//         where: { parentId: null },
//         include: {
//           user: { select: { id: true, name: true, profileUrl: true } },
//           replies: {
//             include: { user: { select: { id: true, name: true, profileUrl: true } } },
//           },
//         },
//         orderBy: { createdAt: "asc" },
//       },
//     },
//   });
//   if (!post) return res.status(404).json({ message: "Post not found" });
//   res.json(post);
// };

// export const createPost = async (req, res) => {
//   const { content, authorId, mediaUrls, visibility } = req.body;
//   const post = await prisma.post.create({
//     data: { content, authorId, mediaUrls, visibility },
//   });
//   res.status(201).json(post);
// };

// export const updatePost = async (req, res) => {
//   const post = await prisma.post.update({
//     where: { id: req.params.id },
//     data: req.body,
//   });
//   res.json(post);
// };

// export const deletePost = async (req, res) => {
//   await prisma.post.update({
//     where: { id: req.params.id },
//     data: { isDeleted: true, deletedAt: new Date() },
//   });
//   res.json({ message: "Post deleted" });
// };


// post.controller.js
import prisma from "../config/prisma.js";
import { generateFeed } from "../services/feedService.js";
import { uploadToCloudinary } from "../utils/Storage.js";

export const createPost = async (req, res) => {
  try {
    const { content, mediaUrls: clientMediaUrls } = req.body;
    const user = req.user;

    // Use URLs sent from frontend (already uploaded to S3)
    const mediaUrls = Array.isArray(clientMediaUrls) ? clientMediaUrls : [];

    const post = await prisma.post.create({
      data: {
        content,
        mediaUrls,
        authorId: user.id,
        organizationId: user.role === "company" ? user.organizationId : null,
      },
      include: {
        author: { select: { id: true, name: true, profileUrl: true, role: true } },
        organization: {
          select: {
            id: true,
            name: true,
            companyProfile: { select: { logoUrl: true } },
          },
        },
      },
    });

    await generateFeed(user.id, post.id);

    res.json(post);
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const likePost = async (req, res) => {
  const { postId } = req.body;
  const user = req.user;

  try {
    const existing = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Already liked" });
    }

    await prisma.$transaction([
      prisma.postLike.create({
        data: {
          postId,
          userId: user.id,
          organizationId:
            user.role === "company" ? user.organizationId : null,
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);

    res.json({ message: "Liked" });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getPostLikes = async (req, res) => {
  const { postId } = req.params;

  try {
    const likes = await prisma.postLike.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileUrl: true, // optional
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(likes);
  } catch (err) {
    console.error("Fetch likes error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { postId, content, parentId } = req.body;
    const user = req.user;

    const comment = await prisma.postComment.create({
      data: {
        postId,
        userId: user.id,
        content,
        parentId,
        organizationId:
          user.role === "company" ? user.organizationId : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    res.json(comment);
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await prisma.postComment.findMany({
      where: { postId, parentId: null },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileUrl: true,
              },
            },
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(comments);
  } catch (err) {
    console.error("Fetch comments error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getShareSuggestions = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Get people the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingUserId: true },
    });

    const followingIds = following
      .map((f) => f.followingUserId)
      .filter(Boolean);

    if (followingIds.length === 0) {
      return res.json([]);
    }

    const users = await prisma.users.findMany({
      where: {
        id: { in: followingIds },
        role: "candidate",
      },
      select: {
        id: true,
        name: true,
        profileUrl: true,
        CandidateProfile: {
          select: {
            title: true,
            profilePicture: true,
          },
        },
      },
      take: 20,
    });

    res.json(users);
  } catch (err) {
    console.error("getShareSuggestions error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const sendPostToUser = async (req, res) => {
  try {
    const { postId, recipientId, message: msg } = req.body;
    const senderId = req.user.id;

    // For now store as a notification — extend with chat later
    await prisma.notification.create({
      data: {
        userId: recipientId,
        actorId: senderId,
        entityId: postId,
        type: "LIKE", // reuse existing enum; add SHARE when ready
      },
    });

    res.json({ message: "Post shared successfully" });
  } catch (err) {
    console.error("sendPostToUser error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: { id: postId, isDeleted: false },
      repostOf: {
      include: {
        author: {
          select: { id: true, name: true, profileUrl: true, role: true },
        },
        organization: {
          select: {
            id: true,
            name: true,
            companyProfile: { select: { logoUrl: true } },
          },
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    const isLikedByMe = !!(await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    }));

    res.json({ ...post, isLikedByMe });
  } catch (err) {
    console.error("getPostById error:", err);
    res.status(500).json({ message: err.message });
  }
};

const LIMITS = {
  image: 5 * 1024 * 1024,   // 5MB
  video: 100 * 1024 * 1024, // 100MB
  file:  5 * 1024 * 1024,   // 5MB (docs)
};

export const uploadPostMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // ── Validate sizes before uploading ──
    for (const file of req.files) {
      let type = "file";
      if (file.mimetype.startsWith("image/")) type = "image";
      else if (file.mimetype.startsWith("video/")) type = "video";

      const limit = LIMITS[type];
      if (file.size > limit) {
        const limitMB = limit / (1024 * 1024);
        return res.status(400).json({
          message: `"${file.originalname}" exceeds the ${limitMB}MB limit for ${type}s.`,
        });
      }
    }

    // ── Upload to S3 ──
    const uploadPromises = req.files.map((file) => {
      let folder = "social/file";
      if (file.mimetype.startsWith("image/")) folder = "social/image";
      else if (file.mimetype.startsWith("video/")) folder = "social/video";

      return uploadToCloudinary(file, folder);
    });

    const uploaded = await Promise.all(uploadPromises);
    const urls = uploaded.map((u) => u.url);

    return res.status(200).json({ urls });
  } catch (err) {
    console.error("uploadPostMedia error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const repostPost = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const user = req.user;

    const original = await prisma.post.findUnique({
      where: { id: postId, isDeleted: false },
    });

    if (!original) return res.status(404).json({ message: "Post not found" });

    const repost = await prisma.post.create({
    data: {
        content: content ?? "",  
        mediaUrls: [],
        authorId: user.id,
        organizationId: user.role === "company" ? user.organizationId : null,
        repostOfId: postId,
      },
      include: {
        author: { select: { id: true, name: true, profileUrl: true, role: true } },
        organization: {
          select: {
            id: true, name: true,
            companyProfile: { select: { logoUrl: true } },
          },
        },
        repostOf: {
          include: {
            author: { select: { id: true, name: true, profileUrl: true, role: true } },
            organization: {
              select: {
                id: true, name: true,
                companyProfile: { select: { logoUrl: true } },
              },
            },
          },
        },
      },
    });

    await generateFeed(user.id, repost.id);

    res.json(repost);
  } catch (err) {
    console.error("repostPost error:", err);
    res.status(500).json({ message: err.message });
  }
};