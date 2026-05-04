import prisma from "../config/prisma.js";

export const getAllPosts = async (req, res) => {
  const { userId } = req.query;
  const posts = await prisma.post.findMany({
    where: { isDeleted: false, ...(userId && { authorId: userId }) },
    include: {
      author: { select: { id: true, name: true, profileUrl: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(posts);
};

export const getPostById = async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: {
      author: { select: { id: true, name: true, profileUrl: true } },
      comments: {
        where: { parentId: null },
        include: {
          user: { select: { id: true, name: true, profileUrl: true } },
          replies: {
            include: { user: { select: { id: true, name: true, profileUrl: true } } },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
};

export const createPost = async (req, res) => {
  const { content, authorId, mediaUrls, visibility } = req.body;
  const post = await prisma.post.create({
    data: { content, authorId, mediaUrls, visibility },
  });
  res.status(201).json(post);
};

export const updatePost = async (req, res) => {
  const post = await prisma.post.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(post);
};

export const deletePost = async (req, res) => {
  await prisma.post.update({
    where: { id: req.params.id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  res.json({ message: "Post deleted" });
};
