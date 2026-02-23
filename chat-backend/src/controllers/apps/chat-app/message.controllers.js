import mongoose from "mongoose";
import { ChatEventEnum } from "../../../constants.js";
import { Chat } from "../../../models/apps/chat-app/chat.models.js";
import { ChatMessage } from "../../../models/apps/chat-app/message.models.js";
import { emitSocketEvent } from "../../../socket/index.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
  getLocalPath,
  getStaticFilePath,
  removeLocalFile,
} from "../../../utils/helpers.js";
import { uploadToS3, deleteFromS3 } from "../../../utils/Storage.js";

/**
 * @description Utility function which returns the pipeline stages to structure the chat message schema with common lookups
 * @returns {mongoose.PipelineStage[]}
 */
const chatMessageCommonAggregation = () => {
  return [
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "sender",
        as: "sender",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        sender: { $first: "$sender" },
      },
    },
  ];
};

const getAllMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const selectedChat = await Chat.findById(chatId);

  if (!selectedChat) {
    throw new ApiError(404, "Chat does not exist");
  }

  // Only send messages if the logged in user is a part of the chat he is requesting messages of
  if (!selectedChat.participants?.includes(req.user?._id)) {
    throw new ApiError(400, "User is not a part of this chat");
  }

  const messages = await ChatMessage.aggregate([
    {
      $match: {
        chat: new mongoose.Types.ObjectId(chatId),
      },
    },
    ...chatMessageCommonAggregation(),
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, messages || [], "Messages fetched successfully"),
    );
});

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;

  if (!content && !req.files?.attachments?.length) {
    throw new ApiError(400, "Message content or attachment is required");
  }

  const selectedChat = await Chat.findById(chatId);

  if (!selectedChat) {
    throw new ApiError(404, "Chat does not exist");
  }

  let messageFiles = [];

  // ==============================
  // 📤 Upload Attachments to S3
  // ==============================
  if (req.files?.attachments?.length > 0) {
    try {
      const uploadPromises = req.files.attachments.map(async (file) => {
        const uploadedFile = await uploadToS3(file);

        return {
          url: uploadedFile.url,
          key: uploadedFile.key, // store S3 key for deletion
          original_name: file.originalname,
          mimeType: file.mimetype,
        };
      });

      messageFiles = await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Attachment Upload Failed:", error);
      throw new ApiError(500, "Failed to upload attachments");
    }
  }

  // ==============================
  // 💬 Create Message
  // ==============================
  const message = await ChatMessage.create({
    sender: req.user._id,
    content: content || "",
    chat: chatId,
    attachments: messageFiles,
  });

  // ==============================
  // 🔄 Update Last Message
  // ==============================
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { $set: { lastMessage: message._id } },
    { new: true },
  );

  // ==============================
  // 📦 Aggregate Message
  // ==============================
  const messages = await ChatMessage.aggregate([
    { $match: { _id: message._id } },
    ...chatMessageCommonAggregation(),
  ]);

  const receivedMessage = messages[0];

  if (!receivedMessage) {
    throw new ApiError(500, "Internal server error");
  }

  // ==============================
  // 🔔 Emit Socket Event
  // ==============================
  chat.participants.forEach((participantObjectId) => {
    if (participantObjectId.toString() === req.user._id.toString()) return;

    emitSocketEvent(
      req,
      participantObjectId.toString(),
      ChatEventEnum.MESSAGE_RECEIVED_EVENT,
      receivedMessage,
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(201, receivedMessage, "Message saved successfully"));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { chatId, messageId } = req.params;

  // ==============================
  // 🔎 Validate Chat
  // ==============================
  const chat = await Chat.findOne({
    _id: chatId,
    participants: req.user._id,
  });

  if (!chat) {
    throw new ApiError(404, "Chat does not exist");
  }

  // ==============================
  // 🔎 Find Message
  // ==============================
  const message = await ChatMessage.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message does not exist");
  }

  // ==============================
  // 🚫 Only Sender Can Delete
  // ==============================
  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorised to delete this message");
  }

  // ==============================
  // 🗑️ Delete S3 Attachments
  // ==============================
  if (message.attachments?.length > 0) {
    const deletePromises = message.attachments
      .filter((file) => file.key)
      .map(async (file) => {
        try {
          await deleteFromS3(file.key);
        } catch (error) {
          console.error("Failed to delete S3 file:", file.key);
        }
      });

    await Promise.all(deletePromises);
  }

  // ==============================
  // 🗑️ Delete Message from DB
  // ==============================
  await ChatMessage.deleteOne({ _id: messageId });

  // ==============================
  // 🔄 Update Last Message if Needed
  // ==============================
  if (chat.lastMessage?.toString() === messageId.toString()) {
    const lastMessage = await ChatMessage.findOne(
      { chat: chatId },
      {},
      { sort: { createdAt: -1 } },
    );

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: lastMessage ? lastMessage._id : null,
    });
  }

  // ==============================
  // 🔔 Emit Delete Event
  // ==============================
  chat.participants.forEach((participantObjectId) => {
    if (participantObjectId.toString() === req.user._id.toString()) return;

    emitSocketEvent(
      req,
      participantObjectId.toString(),
      ChatEventEnum.MESSAGE_DELETE_EVENT,
      { messageId },
    );
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Message deleted successfully"));
});

export { getAllMessages, sendMessage, deleteMessage };
