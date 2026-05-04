import prisma from "../config/prisma.js";

export const getCommentsByPost = async (req, res) => {
  const comments = await prisma.postComment.findMany({
    where: { postId: req.params.postId, parentId: null },
    include: {
      user: { select: { id: true, name: true, profileUrl: true } },
      replies: {
        include: { user: { select: { id: true, name: true, profileUrl: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  res.json(comments);
};

export const createComment = async (req, res) => {
  const { content, postId, userId, parentId } = req.body;
  const comment = await prisma.postComment.create({
    data: { content, postId, userId, parentId },
  });
  await prisma.post.update({
    where: { id: postId },
    data: { commentsCount: { increment: 1 } },
  });
  res.status(201).json(comment);
};

export const updateComment = async (req, res) => {
  const { content } = req.body;
  const comment = await prisma.postComment.update({
    where: { id: req.params.id },
    data: { content },
  });
  res.json(comment);
};

export const deleteComment = async (req, res) => {
  const comment = await prisma.postComment.delete({
    where: { id: req.params.id },
  });
  await prisma.post.update({
    where: { id: comment.postId },
    data: { commentsCount: { decrement: 1 } },
  });
  res.json({ message: "Comment deleted" });
};
