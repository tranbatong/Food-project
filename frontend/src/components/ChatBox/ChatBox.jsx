import React, { useState, useEffect, useContext, useRef } from "react";
import "./ChatBox.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { io } from "socket.io-client";

const ChatBox = () => {
  const { url, token } = useContext(StoreContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  // Hàm phụ trợ: Giải mã JWT token để lấy userId ở Frontend
  const getUserIdFromToken = () => {
    if (!token) return null;
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id;
    } catch (error) {
      return null;
    }
  };

  const userId = getUserIdFromToken();

  // Khởi tạo Socket và lấy lịch sử tin nhắn
  useEffect(() => {
    if (token && userId) {
      // Kết nối tới Backend
      socket.current = io(url);

      // Thông báo cho Server biết user này vừa online
      socket.current.emit("add-user", userId);

      // Lắng nghe tin nhắn mới từ Admin
      socket.current.on("receive-message", (data) => {
        setMessages((prev) => [...prev, data]);
      });

      // Gọi API lấy lịch sử chat
      fetchMessages();
    }

    // Dọn dẹp kết nối khi component bị hủy hoặc user đăng xuất
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [token, userId, url]);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${url}/api/chat/${userId}`, {
        headers: { token },
      });
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.log("Lỗi tải tin nhắn:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageData = { text: inputText };

    // 1. Hiển thị tạm thời lên UI cho mượt
    const tempMsg = {
      senderId: userId,
      text: inputText,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInputText("");

    try {
      // 2. Lưu vào Database
      const response = await axios.post(`${url}/api/chat/send`, messageData, {
        headers: { token },
      });

      // 3. Gửi qua Socket để Admin nhận được ngay lập tức
      if (response.data.success) {
        socket.current.emit("send-message", {
          senderId: userId,
          receiverId: "admin", // Gửi cho Admin
          text: inputText,
        });
      }
    } catch (error) {
      console.log("Lỗi gửi tin nhắn:", error);
    }
  };

  // Nếu chưa đăng nhập, không hiển thị khung chat
  if (!token) return null;

  return (
    <div className="chatbox-container">
      {isOpen ? (
        <div className="chatbox-window">
          <div className="chatbox-header">
            <h4>Hỗ trợ trực tuyến</h4>
            <button onClick={() => setIsOpen(false)}>X</button>
          </div>

          <div className="chatbox-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.senderId === userId ? "my-message" : "admin-message"}`}
              >
                <p>{msg.text}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="chatbox-input">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit">Gửi</button>
          </form>
        </div>
      ) : (
        <button className="chatbox-toggle-btn" onClick={() => setIsOpen(true)}>
          Chat với chúng tôi
        </button>
      )}
    </div>
  );
};

export default ChatBox;
