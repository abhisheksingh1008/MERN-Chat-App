import { createSlice } from "@reduxjs/toolkit";

const initialChatState = {
  selectedChat: null,
  allChats: [],
  notifications: [],
  newChat: null,
};

const chatSlice = createSlice({
  name: "chatSlice",
  initialState: initialChatState,
  reducers: {
    setSelectedChat(state, action) {
      state.selectedChat = action.payload.chat;
    },
    setAllChats(state, action) {
      state.allChats = action.payload.chats;
    },
    addNewChat(state, action) {
      state.allChats = [action.payload.chat, ...state.allChats];
    },
    updateGroupChat(state, action) {
      const updatedGroupChat = action.payload.updatedGroupChat;

      state.allChats = state.allChats.filter(
        (chat) => chat._id !== updatedGroupChat._id
      );

      state.allChats = [updatedGroupChat, ...state.allChats];
    },
    setNotifications(state, action) {
      const newMessage = action.payload.newMessage;
      if (!state.notifications.includes(newMessage)) {
        state.notifications = [newMessage, ...state.notifications];
      }
    },
    removeNotifications(state, action) {
      const chat = action.payload.chat;
      state.notifications = state.notifications.filter(
        (n) => n.chat._id !== chat._id
      );
    },
    setNewChat(state, action) {
      state.newChat = action.payload.chat;
    },
    onNewMessage(state, action) {
      const chat = action.payload.chat;
      state.allChats = state.allChats.filter((c) => c._id !== chat._id);
      state.allChats = [chat, ...state.allChats];
    },
  },
});

export const chatActions = chatSlice.actions;
export default chatSlice;
