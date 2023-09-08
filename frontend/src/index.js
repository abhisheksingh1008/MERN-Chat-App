import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { ChakraProvider } from "@chakra-ui/react";
import "./index.css";
import App from "./App";
import AuthProvider from "./store/AuthContext";
import chatStore from "./store/ChatStore/ChatContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  // </React.StrictMode>
  <ChakraProvider>
    <Provider store={chatStore}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </ChakraProvider>
);
