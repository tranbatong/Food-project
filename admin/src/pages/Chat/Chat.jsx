import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Layout,
  List,
  Avatar,
  Input,
  Button,
  Typography,
  Badge,
  Empty,
  Spin,
  Space,
} from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

const Chat = ({ url }) => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const activeChatRef = useRef(activeChat);

  // Đồng bộ activeChat vào ref để socket có thể truy cập giá trị mới nhất
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Hàm tải danh sách các cuộc hội thoại
  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${url}/api/chat/conversations`, {
        headers: { token },
      });
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách khách hàng:", error);
    }
  };

  // Lần đầu render, tải danh sách khách hàng
  useEffect(() => {
    if (token) fetchConversations();
  }, [url, token]);

  // Thiết lập kết nối Socket.IO
  useEffect(() => {
    if (token) {
      socket.current = io(url);

      // Đăng ký admin với socket server
      socket.current.emit("add-user", "admin");

      // Lắng nghe tin nhắn mới
      socket.current.on("receive-message", (data) => {
        // Chỉ thêm tin nhắn vào màn hình nếu đang mở đúng khung chat của người gửi
        if (data.senderId === activeChatRef.current) {
          setMessages((prev) => [...prev, data]);
        }
        // Luôn cập nhật lại danh sách để đưa người vừa nhắn lên đầu
        fetchConversations();
      });
    }

    // Cleanup khi unmount
    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [url, token]);

  // Tải chi tiết tin nhắn khi chọn một khách hàng
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat) return;
      setLoading(true);
      try {
        const response = await axios.get(`${url}/api/chat/${activeChat}`, {
          headers: { token },
        });
        if (response.data.success) {
          setMessages(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi tải nội dung tin nhắn:", error);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [activeChat, url, token]);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hàm xử lý gửi tin nhắn
  const sendMessage = async (e) => {
    // 1. Chặn hành vi mặc định (reload trang) khi nhấn Enter hoặc Click
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!inputText.trim() || !activeChat) return;

    // Lưu trữ tạm nội dung để tránh mất dữ liệu khi state bị xóa
    const currentInput = inputText.trim();

    // Hiển thị tin nhắn tạm thời lên giao diện Admin ngay lập tức
    const tempMsg = {
      senderId: "admin",
      text: currentInput,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInputText(""); // Xóa trắng ô input

    try {
      // 2. Lưu tin nhắn vào database
      const response = await axios.post(
        `${url}/api/chat/send`,
        { text: currentInput, customerId: activeChat },
        { headers: { token } },
      );

      if (response.data.success) {
        console.log("✅ Đã lưu DB thành công, chuẩn bị phát Socket...");

        // 3. Gửi qua socket cho khách hàng realtime
        socket.current.emit("send-message", {
          senderId: "admin",
          receiverId: activeChat,
          text: currentInput,
        });

        // 4. Cập nhật lại danh sách khách hàng bên trái
        fetchConversations();
      } else {
        console.error("❌ Lỗi từ server:", response.data.message);
      }
    } catch (error) {
      console.error("❌ Lỗi gửi tin nhắn:", error);
    }
  };

  return (
    <Layout className="chat-layout">
      {/* Cột danh sách khách hàng bên trái */}
      <Sider width={320} theme="light" className="chat-sider">
        <div className="sider-header">
          <Text strong style={{ fontSize: 18 }}>
            Hộp thư đến
          </Text>
          <Badge count={conversations.length} showZero color="#1677ff" />
        </div>

        {/* Khung chứa danh sách có thể cuộn độc lập */}
        <div className="conversation-container">
          <List
            itemLayout="horizontal"
            dataSource={conversations}
            renderItem={(item) => (
              <List.Item
                className={`conv-item ${activeChat === item.userId ? "active-item" : ""}`}
                onClick={() => setActiveChat(item.userId)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot status={item.isOnline ? "success" : "default"}>
                      <Avatar icon={<UserOutlined />} src={item.avatar} />
                    </Badge>
                  }
                  title={
                    <Text strong>Khách hàng {item.userId.substring(0, 6)}</Text>
                  }
                  description={
                    <Text
                      ellipsis
                      type="secondary"
                      style={{ maxWidth: "200px" }}
                    >
                      {item.lastMessage || "Chưa có tin nhắn"}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </Sider>

      {/* Cột nội dung chat bên phải */}
      <Content className="chat-content">
        {activeChat ? (
          <div className="inner-chat-layout">
            {/* Header thông tin người đang chat */}
            <Header className="chat-header">
              <Space>
                <Avatar
                  style={{ backgroundColor: "#87d068" }}
                  icon={<UserOutlined />}
                />
                <Text strong>Đang chat với: {activeChat}</Text>
              </Space>
            </Header>

            {/* Khung chứa nội dung tin nhắn có thể cuộn độc lập */}
            <div className="message-list-container">
              {loading ? (
                <div className="center-spin">
                  <Spin size="large" />
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`msg-wrapper ${msg.senderId === "admin" ? "msg-sent" : "msg-received"}`}
                  >
                    <div className="msg-bubble">
                      {msg.text}
                      <div className="msg-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {/* Điểm neo để tự động cuộn xuống cuối */}
              <div ref={messagesEndRef} />
            </div>

            {/* Khu vực nhập liệu luôn nằm cố định dưới cùng */}
            <div className="chat-input-area">
              <Input
                placeholder="Nhập tin nhắn..."
                size="large"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onPressEnter={sendMessage}
                suffix={
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<SendOutlined />}
                    onClick={sendMessage}
                  />
                }
              />
            </div>
          </div>
        ) : (
          /* Trạng thái trống khi chưa chọn khách hàng */
          <div className="empty-chat">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chọn một cuộc hội thoại bên trái để bắt đầu"
            />
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default Chat;
