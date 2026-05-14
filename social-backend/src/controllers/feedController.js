// feed.controller.js
// export const getFeed = async (req, res) => {
//   const userId = req.user.id;

//   const feed = await prisma.feed.findMany({
//     where: { userId },
//     include: {
//       post: {
//         include: {
//           author: true,
//           likes: true,
//           comments: true,
//         },
//       },
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   res.json(feed);
// };

// feed.controller.js
import prisma from "../config/prisma.js";

export const getFeed = async (req, res) => {
  try {
    const userId = req.user.id;

    const posts = await prisma.post.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileUrl: true,
            role: true,
          },
        },
        
        organization: {
          select: {
            id: true,
            name: true,
            companyProfile: {
              select: {
                id: true,
                logoUrl: true,
                tagline: true,
              },
            },
          },
        },

        repostOf: {
  include: {
    author: {
      select: { id: true, name: true, profileUrl: true, role: true },
    },
    organization: {
      select: {
        id: true,
        name: true,
        companyProfile: {
          select: { id: true, logoUrl: true, tagline: true },
        },
      },
    },
  },
},
        likes: {
          where: { userId },
          select: { userId: true },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const feed = posts.map((post) => ({
      post: {
        ...post,
        isLikedByMe: post.likes.length > 0,
        likes: undefined,
      },
    }));

    res.json(feed);
  } catch (err) {
    console.error("Feed error:", err);
    res.status(500).json({ message: err.message });
  }
};