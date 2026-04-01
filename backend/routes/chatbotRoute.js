import express from "express";
import { askChatbot } from "../controllers/chatbotController.js";

const chatbotRouter = express.Router();

// Định nghĩa API nhận câu hỏi từ giao diện người dùng
// Đường dẫn thực tế sẽ là: POST /api/chatbot/ask
chatbotRouter.post("/ask", askChatbot);

export default chatbotRouter;
