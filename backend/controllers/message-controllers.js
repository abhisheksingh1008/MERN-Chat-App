import Message from "../models/messageModel.js";
import HttpError from "../models/http-error.js";
import Chat from "../models/chatModel.js";

const PAGE_SIZE = 50;

const fetchMessagesByChatId = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    let { page } = req.query;

    if (!page) {
      page = 1;
    }

    const count = await Message.countDocuments({ chat: chatId });

    let messages = await Message.find({ chat: chatId })
      .populate("sender", "_id name profileImage")
      .skip(page * PAGE_SIZE - PAGE_SIZE)
      .limit(page * PAGE_SIZE)
      .sort({ createdAt: -1 });

    if (!messages) {
      return next(new HttpError("Messages not found.", 400));
    }

    messages.reverse();

    res.status(200).json({
      success: true,
      message: "Messages fetched successfully.",
      count,
      messages,
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong, failed to login."));
  }
};

const createNewMessage = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const { message } = req.body;

    if (!message) {
      return next(
        new HttpError("Sender and message content are required.", 400)
      );
    }

    let chat = await Chat.findById(chatId);

    if (!chat) {
      return next(
        new HttpError("Invalid chat, unable to send message to this chat.", 400)
      );
    }

    let newMessage = new Message({
      sender: req.user._id,
      chat: chatId,
      ...message,
    });

    await newMessage.save();
    chat.latestMessage = newMessage;
    await chat.save();

    newMessage = await Message.populate(newMessage, {
      path: "sender",
      select: "_id name profileImage",
    });

    newMessage = await Message.populate(newMessage, {
      path: "chat",
      select: "chatName isGroupChat latestMessage",
      populate: {
        path: "users groupAdmin",
        select: "-password",
      },
    });

    res.status(201).json({
      success: true,
      message: "New Message created.",
      createdMessage: newMessage,
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something wenty wrong, failed to login."));
  }
};

export { createNewMessage, fetchMessagesByChatId };
