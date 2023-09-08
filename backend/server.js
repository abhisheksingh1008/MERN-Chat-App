import path from "path";
import express from "express";
// import cors from "cors";
import { config } from "dotenv";
import { Server } from "socket.io";

import connectToDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";

config();
connectToDB();
const app = express();

// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

const __dirname = path.resolve();
console.log("Current directory is :- ", __dirname);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});

const io = new Server(server, {
  pingTimeout: 120000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  // console.log("Socket connection initialized : " + socket.id);

  socket.on("setup", (user) => {
    socket.join(user.userId);
    console.log(`${user.name} connected`);
  });

  socket.on("join chat", (chatId) => {
    socket.join(chatId);
    console.log("User joined chat" + chatId);
  });

  socket.on("send new message", (newMessage) => {
    const chat = newMessage.chat;

    // console.log("new message recieved!!!", newMessage, chat);

    if (!chat?.users) {
      console.log("No users in this chat");
      return;
    }

    chat.users.forEach((u) => {
      if (u._id.toString() !== newMessage.sender._id.toString()) {
        socket.to(u?._id).emit("new message recieved", newMessage);
      }
    });
  });

  socket.on("new chat", (user, newChat) => {
    if (!newChat?.users) {
      console.log("No users in this chat");
      return;
    }

    newChat.users.forEach((u) => {
      if (u._id.toString() !== user.userId.toString()) {
        socket.to(u?._id).emit("new chat", newChat);
      }
    });
  });

  socket.on("push group changes", (user, updatedGroupChat) => {
    if (!updatedGroupChat?.users) {
      console.log("No users in this chat");
      return;
    }

    updatedGroupChat.users.forEach((u) => {
      if (u._id.toString() !== user.userId.toString()) {
        socket.to(u?._id).emit("new group chat changes", updatedGroupChat);
      }
    });
  });

  socket.on("typing", (room, user) => {
    socket.in(room).emit("typing", room, user);
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing", room);
  });

  socket.off("setup", (user) => {
    socket.leave(user.userId);
    console.log("User disconnected.");
  });
});
