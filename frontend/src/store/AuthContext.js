import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { chatActions } from "./ChatStore/chat-slice";

export const AuthContext = createContext({
  user: {},
  login: (user) => {},
  signup: (user) => {},
  logout: () => {},
  editChatWallpaper: (wallpaper) => {},
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
  const dispatch = useDispatch();

  const loginHandler = (user) => {
    const { userId, name, email, about, token, profileImage, chatWallpaper } =
      user;

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
      about,
      token,
      profileImage,
      chatWallpaper,
      tokenExpirationDate: tokenExpirationDate.toISOString(),
    };

    setUser({ ...userData });
  };

  const signupHandler = (user) => {
    const { userId, name, email, about, token, profileImage, chatWallpaper } =
      user;

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
      about,
      token,
      profileImage,
      chatWallpaper,
      tokenExpirationDate: tokenExpirationDate.toISOString(),
    };

    setUser({ ...userData });
  };

  const logoutHandler = () => {
    localStorage.removeItem("userData");
    dispatch(chatActions.setSelectedChat({ chat: null }));
    setUser(null);
  };

  const editChatWallpaperHandler = (wallpaper) => {
    setUser({ ...user, chatWallpaper: wallpaper });
  };

  useEffect(() => {
    if (user !== null) {
      localStorage.setItem("userData", JSON.stringify(user));
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login: loginHandler,
        signup: signupHandler,
        logout: logoutHandler,
        editChatWallpaper: editChatWallpaperHandler,
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
