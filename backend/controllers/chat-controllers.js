import { v2 as cloudinary } from "cloudinary";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";
import HttpError from "../models/http-error.js";
import Message from "../models/messageModel.js";

const fetchUserChats = async (req, res, next) => {
  try {
    let allChats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    allChats = await User.populate(allChats, {
      path: "latestMessage.sender",
      select: "_id name email profileImage",
    });

    res.status(200).json({
      success: true,
      message: "Chats fetched.",
      chats: allChats,
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong, failed to fetch chats."));
  }
};

const singleChat = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return next(new HttpError("Invalid user.", 400));
    }

    let chat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (chat.length > 0) {
      chat = await User.populate(chat, {
        path: "latestMessage.sender",
        select: "_id name email profileImage",
      });

      res.status(200).json({
        success: true,
        message: "Chat found.",
        chat: chat[0],
      });
    } else {
      let newSingleChat = new Chat({
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      });

      await newSingleChat.save();

      newSingleChat = await User.populate(newSingleChat, {
        path: "users",
        select: "_id name email about profileImage",
      });

      res.status(201).json({
        success: true,
        message: "Chat created.",
        chat: newSingleChat,
      });
    }
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Something went wrong, failed to create/load chat.", 500)
    );
  }
};

const createNewGroup = async (req, res, next) => {
  try {
    const { chatName, users } = req.body;

    if (!chatName || chatName.trim().length === 0) {
      return next(new HttpError("Chat name is required.", 400));
    }

    if ((!users, users?.length === 0)) {
      return next(
        new HttpError("Users are required to create group chat.", 400)
      );
    }

    const newGroupChat = new Chat({
      chatName,
      isGroupChat: true,
      users: [req.user, ...users],
      groupAdmin: req.user,
    });

    await newGroupChat.save();

    const fullGroupChat = await Chat.findById(newGroupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json({
      success: true,
      message: "New Group Chat created.",
      chat: fullGroupChat,
    });
  } catch (error) {
    console.log(error);
    return next(
      new HttpError(
        "Something went wrong, failed to create new group chat.",
        500
      )
    );
  }
};

const renameGroup = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;

    const group = await Chat.findOne({ isGroupChat: true, _id: chatId });

    if (!group) {
      return next(new HttpError("Group not found.", 400));
    }

    if (group.groupAdmin.toString() !== req.user._id.toString()) {
      return next(new HttpError("Only admin can rename this group.", 400));
    }

    const { newName } = req.body;

    group.chatName = newName;

    await group.save();

    const fullGroupChat = await Chat.findById(group._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json({
      success: true,
      message: "Group renamed.",
      chat: fullGroupChat,
    });
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Something went wrong, failed to rename group.", 500)
    );
  }
};

const addUserToGroup = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;

    let group = await Chat.findOne({ isGroupChat: true, _id: chatId });

    if (!group) {
      return next(new HttpError("Group not found.", 400));
    }

    if (group.groupAdmin.toString() !== req.user._id.toString()) {
      return next(
        new HttpError("Only group admin can add users to group.", 400)
      );
    }

    const { userId } = req.body;

    if (group.users.find((u) => u._id.toString() === userId.toString())) {
      return next(new HttpError("User is already in the group.", 400));
    }

    group.users.push(userId);
    await group.save();
    group = await User.populate(group, {
      path: "users groupAdmin",
      select: "-password -isAdmin",
    });

    res.status(200).json({
      success: true,
      message: "User added to group.",
      chat: group,
    });
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Something went wrong, failed to add user.", 500)
    );
  }
};

const removeUserFromGroup = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;

    let group = await Chat.findOne({ isGroupChat: true, _id: chatId });

    if (!group) {
      return next(new HttpError("Group not found.", 400));
    }

    if (group.groupAdmin.toString() !== req.user._id.toString()) {
      return next(
        new HttpError("Only group admins can remove users from group.", 400)
      );
    }

    const { userId } = req.body;

    if (!group.users.find((u) => u._id.toString() === userId.toString())) {
      return next(new HttpError("User is not in the group.", 400));
    }

    if (group.users.length === 1) {
      await Chat.deleteOne({ _id: group._id });
      await Message.deleteMany({ chat: group._id });
      res.status(200).json({
        success: true,
        message: "User removed from group and group chat deleted.",
      });
    }

    group.users.pull(userId);
    if (group.groupAdmin.toString() === userId.toString()) {
      group.groupAdmin = group.users[0]?._id;
    }
    await group.save();

    group = await User.populate(group, {
      path: "users groupAdmin",
      select: "-password -isAdmin",
    });

    res.status(200).json({
      success: true,
      message: "User removed from group.",
      chat: group,
    });
  } catch (error) {
    console.log(error);
    return next(
      new HttpError(
        "Something went wrong, failed to remove user from group.",
        500
      )
    );
  }
};

const leaveGroup = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const { userId } = req.body;

    console.log(chatId, userId);

    if (req.user._id.toString() !== userId.toString()) {
      return next(new HttpError("Invalid request.", 400));
    }

    let group = await Chat.findOne({ isGroupChat: true, _id: chatId });

    if (!group) {
      return next(new HttpError("Group not found.", 400));
    }

    if (!group.users.find((u) => u._id.toString() === userId.toString())) {
      return next(new HttpError("User is not in the group.", 400));
    }

    if (group.users.length === 1) {
      await Chat.deleteOne({ _id: group._id });
      await Message.deleteMany({ chat: group._id });
      res.status(200).json({
        success: true,
        message: "You left the group and group was deleted.",
      });
    }

    group.users.pull(userId);
    if (group.groupAdmin.toString() === userId.toString()) {
      group.groupAdmin = group.users[0]?._id;
    }
    await group.save();

    group = await User.populate(group, {
      path: "users groupAdmin",
      select: "-password -isAdmin",
    });

    res.status(200).json({
      success: true,
      message: "You have left the gorup.",
      chat: group,
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong, failed to leave group."));
  }
};

const deleteGroup = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    let group = await Chat.findOne({ isGroupChat: true, _id: chatId });
    if (!group) {
      return next(new HttpError("Group not found.", 400));
    }

    if (group.groupAdmin.toString() !== req.user._id.toString()) {
      return next(new HttpError("Only group admin can delete the group.", 400));
    }

    const messages = await Message.find({ chat: group._id });
    if (messages) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].isFile) {
          await cloudinary.uploader
            .destroy(messages[i].fileInfo?.public_id, (err, res) => {})
            .then((res) => {})
            .catch((err) => {
              console.log(err);
              throw new Error("Something went wrong, failed to delete chat.");
            });
        }
        await Message.deleteOne({ _id: messages[i]._id });
      }
    }

    await Chat.deleteOne({ _id: group._id });

    res.status(200).json({
      success: true,
      message: "Group deleted.",
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong, failed to delete group."));
  }
};

export {
  singleChat,
  createNewGroup,
  renameGroup,
  addUserToGroup,
  removeUserFromGroup,
  leaveGroup,
  deleteGroup,
  fetchUserChats,
};
