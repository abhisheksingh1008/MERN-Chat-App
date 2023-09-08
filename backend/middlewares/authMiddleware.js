import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import HttpError from "../models/http-error.js";

const requireSignIn = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return next(new HttpError("Token not found.", 401));
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decodedToken.userId);

      if (!user) {
        return next(
          new HttpError("Authentication failed! User not found.", 401)
        );
      }

      req.user = user;

      next();
    } catch (error) {
      console.log(error);
      if (
        error.name === "TokenExpiredError" &&
        error.message === "jwt expired"
      ) {
        return next(new HttpError("Token Expired.", 401));
      }
      return next(new HttpError("Invalid token. Authentication failed!", 401));
    }
  } else {
    return next(new HttpError("Token not found.", 401));
  }
};

export { requireSignIn };
