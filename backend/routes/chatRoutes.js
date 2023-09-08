import { Router } from "express";
import { requireSignIn } from "../middlewares/authMiddleware.js";
import {
  singleChat,
  createNewGroup,
  renameGroup,
  addUserToGroup,
  removeUserFromGroup,
  leaveGroup,
  deleteGroup,
  fetchUserChats,
} from "../controllers/chat-controllers.js";

const router = Router();

router.post("/chat", requireSignIn, singleChat);
router.post("/group", requireSignIn, createNewGroup);
router.patch("/group/leave/:chatId", requireSignIn, leaveGroup);
router.patch("/group/rename/:chatId", requireSignIn, renameGroup);
router.patch("/group/add-member/:chatId", requireSignIn, addUserToGroup);
router.patch(
  "/group/remove-member/:chatId",
  requireSignIn,
  removeUserFromGroup
);
router.delete("/group/:chatId", requireSignIn, deleteGroup);
router.get("/:userId", requireSignIn, fetchUserChats);

export default router;
