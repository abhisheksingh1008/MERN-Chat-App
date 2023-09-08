import { createContext, useContext, useState } from "react";

export const AuthContext = createContext({
  user: {},
  allChats: [],
  selectedChat: {},
  notifications: [],
  setAllChats: () => {},
  setSelectedChat: () => {},
  setNotifications: () => {},
  login: (user) => {},
  signup: (user) => {},
  logout: () => {},
});

let userData = null;

if (typeof window !== "undefined") {
  userData = JSON.parse(localStorage.getItem("userData"));

  if (userData) {
    const tokenExpirationDate = userData.tokenExpirationDate;
    const currentDate = new Date(Date.now()).toISOString();

    if (currentDate > tokenExpirationDate) {
      localStorage.removeItem("userData");
      userData = null;
    }
  }
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(userData);
  const [allChats, setAllChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const loginHandler = (user) => {
    const { userId, name, email, token, profileImage } = user;

    if (!userId || !email || !token || !profileImage) {
      return;
    }

    const tokenExpirationDate = new Date(
      new Date().getTime() + 15 * 24 * 60 * 60 * 1000
    );

    const userData = {
      isAuthenticated: true,
      userId,
      name,
      email,
      profileImage,
      token,
      tokenExpirationDate: tokenExpirationDate.toISOString(),
    };

    localStorage.setItem("userData", JSON.stringify(userData));

    setUser({ ...userData });
  };

  const signupHandler = (user) => {
    const { userId, name, email, token, profileImage } = user;

    if (!userId || !email || !token || !profileImage) {
      return;
    }

    const tokenExpirationDate = new Date(
      new Date().getTime() + 15 * 24 * 60 * 60 * 1000
    );

    const userData = {
      isAuthenticated: true,
      userId,
      name,
      email,
      token,
      profileImage,
      tokenExpirationDate: tokenExpirationDate.toISOString(),
    };

    localStorage.setItem("userData", JSON.stringify(userData));

    setUser({ ...userData });
  };

  const logoutHandler = () => {
    localStorage.removeItem("userData");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        allChats,
        selectedChat,
        notifications,
        setAllChats,
        setSelectedChat,
        setNotifications,
        login: loginHandler,
        signup: signupHandler,
        logout: logoutHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const authCtx = useContext(AuthContext);
  return authCtx;
};

export default AuthProvider;
