import { Router } from "express";
import { requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createNewMessage,
  fetchMessagesByChatId,
} from "../controllers/message-controllers.js";

const router = Router();

router.post("/create/:chatId", requireSignIn, createNewMessage);
router.get("/:chatId", requireSignIn, fetchMessagesByChatId);

export default router;
