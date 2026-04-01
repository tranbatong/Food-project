import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import chatRouter from "./routes/chatRoute.js";
import voucherRouter from "./routes/voucherRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import http from "http";
import { Server } from "socket.io";

// app config
const app = express();
const port = 4000;

// cấu hình Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
  },
});

// middleware
app.use(express.json());
app.use(cors());

// connectDB
connectDB();

// api endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/chat", chatRouter);
app.use("/api/voucher", voucherRouter);
app.use("/api/review", reviewRouter);

// TRẠM BƯU ĐIỆN: Tạo một cuốn sổ (Map) để ghi nhớ ai đang online
const onlineUsers = new Map();

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Một người dùng kết nối mạng:", socket.id);

  // 1. Khi một người mở khung chat (Frontend gửi sự kiện add-user)
  socket.on("add-user", (userId) => {
    // Lưu ID của user (hoặc chữ "admin") ghép cặp với mã kết nối socket hiện tại
    onlineUsers.set(userId, socket.id);
    console.log(
      `Người dùng [${userId}] đang online với mã socket: ${socket.id}`,
    );
  });

  // 2. Khi ai đó bấm gửi tin nhắn
  socket.on("send-message", (data) => {
    console.log("\n--- CÓ TIN NHẮN MỚI ---");
    console.log("Dữ liệu nhận được:", data);

    // Lấy mã kết nối của người nhận từ cuốn sổ
    const receiverSocketId = onlineUsers.get(data.receiverId);

    if (receiverSocketId) {
      console.log(
        `-> Đã tìm thấy người nhận! Đang chuyển phát đến socket: ${receiverSocketId}`,
      );
      io.to(receiverSocketId).emit("receive-message", data);
    } else {
      console.log("-> THẤT BẠI: Người nhận không online hoặc sai ID.");
      console.log(
        "Danh sách đang online hiện tại:",
        Array.from(onlineUsers.keys()),
      );
    }
  });

  // 3. Khi người dùng tắt tab hoặc mất mạng
  socket.on("disconnect", () => {
    console.log("Một mã socket đã ngắt kết nối:", socket.id);
    // Quét cuốn sổ và gạch tên người vừa thoát ra
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`Đã xóa [${userId}] khỏi danh sách online.`);
        break;
      }
    }
  });
});

// Test Route
app.get("/", (req, res) => {
  res.send("API Working");
});

server.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});
