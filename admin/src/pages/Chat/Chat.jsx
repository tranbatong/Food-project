import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const Chat = ({ url }) => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const token = localStorage.getItem("token");
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  // Thêm Ref này để Socket luôn biết chính xác Admin đang mở phòng chat nào
  const activeChatRef = useRef(activeChat);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Tách hàm fetchConversations ra ngoài để tái sử dụng
  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${url}/api/chat/conversations`, {
        headers: { token },
      });
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách tin nhắn");
    }
  };

  // 1. Lấy danh sách các phòng chat lần đầu
  useEffect(() => {
    if (token) fetchConversations();
  }, [url, token]);

  // 2. Kết nối Socket.IO
  useEffect(() => {
    if (token) {
      socket.current = io(url);

      socket.current.emit("add-user", "admin");

      socket.current.on("receive-message", (data) => {
        // Fix: Chỉ hiển thị tin nhắn lên khung nếu đúng là của khách đang được chọn
        if (data.senderId === activeChatRef.current) {
          setMessages((prev) => [...prev, data]);
        }

        // Cập nhật lại cột trái để đẩy phòng vừa nhắn lên đầu và hiển thị lastMessage
        fetchConversations();
      });
    }

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [url, token]);

  // 3. Lấy chi tiết tin nhắn khi bấm vào một khách hàng
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat) return;
      try {
        const response = await axios.get(`${url}/api/chat/${activeChat}`, {
          headers: { token },
        });
        if (response.data.success) {
          setMessages(response.data.data);
        }
      } catch (error) {
        toast.error("Lỗi khi tải nội dung chat");
      }
    };
    fetchMessages();
  }, [activeChat, url, token]);

  // Tự động cuộn xuống cuối
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Hàm gửi tin nhắn
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const messageData = {
      text: inputText,
      customerId: activeChat,
    };

    const tempMsg = {
      senderId: "admin",
      text: inputText,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInputText("");

    try {
      const response = await axios.post(`${url}/api/chat/send`, messageData, {
        headers: { token },
      });

      if (response.data.success) {
        socket.current.emit("send-message", {
          senderId: "admin",
          receiverId: activeChat, // Gửi đích danh cho khách hàng này
          text: inputText,
        });

        // Cập nhật lại cột trái sau khi Admin vừa gửi tin nhắn
        fetchConversations();
      }
    } catch (error) {
      toast.error("Lỗi gửi tin nhắn");
    }
  };

  return (
    <div className="admin-chat-container">
      <div className="chat-sidebar">
        <h3>Hộp thư đến</h3>
        <div className="conversation-list">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              className={`conversation-item ${activeChat === conv.userId ? "active" : ""}`}
              onClick={() => setActiveChat(conv.userId)}
            >
              <div className="conv-info">
                <p className="conv-name">
                  Khách: {conv.userId.substring(0, 6)}...
                </p>
                <p className="conv-last-msg">{conv.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {activeChat ? (
          <>
            <div className="chat-main-header">
              <h4>Đang chat với: {activeChat.substring(0, 6)}...</h4>
            </div>

            <div className="chat-main-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`admin-msg-bubble ${msg.senderId === "admin" ? "sent" : "received"}`}
                >
                  <p>{msg.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="chat-main-input">
              <input
                type="text"
                placeholder="Nhập tin nhắn phản hồi..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit">Gửi</button>
            </form>
          </>
        ) : (
          <div className="chat-empty-state">
            <p>Chọn một khách hàng ở cột bên trái để bắt đầu chat</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
