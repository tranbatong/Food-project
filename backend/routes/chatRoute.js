import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  sendMessage,
  getMessages,
  getConversations,
} from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.post("/send", authMiddleware, sendMessage);
chatRouter.get("/conversations", authMiddleware, getConversations);
chatRouter.get("/:userId", authMiddleware, getMessages);

export default chatRouter;
