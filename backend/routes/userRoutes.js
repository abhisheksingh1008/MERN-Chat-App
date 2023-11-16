import { Router } from "express";
import { requireSignIn } from "../middlewares/authMiddleware.js";
import {
  login,
  register,
  updateUser,
  searchUsers,
  addChatWallpaper,
} from "../controllers/user-controllers.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/find", requireSignIn, searchUsers);
router.post("/:userId/chat-wallpaper", requireSignIn, addChatWallpaper);
router.post("/:userId/update", requireSignIn, updateUser);

export default router;
