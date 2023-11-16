import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import "./index.css";
import App from "./App";
import AuthProvider from "./store/AuthContext";
import chatStore from "./store/ChatStore/ChatContext";

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  // </React.StrictMode>
  <ChakraProvider>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} useSystemColorMode={false} />
    <Provider store={chatStore}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </ChakraProvider>
);
