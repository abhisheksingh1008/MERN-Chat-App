import mongoose from "mongoose";

const chatSchema = mongoose.Schema(
  {
    chatName: {
      type: String,
      required: true,
      trim: true,
    },
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: false,
    },
    isGroupChat: {
      type: Boolean,
      required: true,
      default: false,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
