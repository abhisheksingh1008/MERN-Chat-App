import { configureStore } from "@reduxjs/toolkit";

import chatSlice from "./chat-slice";

const chatStore = configureStore({
  reducer: {
    chat: chatSlice.reducer,
  },
});

export default chatStore;
