import React, { useState, useContext, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "./Chatbot.css";
import { StoreContext } from "../../context/StoreContext";

const Chatbot = () => {
  const { sendChatMessage } = useContext(StoreContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Chào bạn! Tôi là trợ lý ảo của **Tomato Restaurant**. Rất vui được hỗ trợ bạn tìm kiếm món ngon hôm nay! 🍅",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMessage);

      if (response && response.success) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: response.answer },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text:
              response?.message ||
              "Xin lỗi, tôi gặp chút sự cố kết nối. Bạn thử lại nhé! 😅",
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Hệ thống đang bận, vui lòng quay lại sau giây lát.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Nút bong bóng chat */}
      {!isOpen && (
        <button className="chatbot-toggle-btn" onClick={() => setIsOpen(true)}>
          <span>💬</span> Chat với AI
        </button>
      )}

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="header-info">
              <div className="online-dot"></div>
              <h4>Trợ lý Tomato AI</h4>
            </div>
            <button className="close-chat-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.sender}`}>
                <div className={`message-bubble ${msg.sender}`}>
                  {msg.sender === "bot" ? (
                    <div className="markdown-body">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            {/* Hiệu ứng đang trả lời */}
            {isLoading && (
              <div className="message-row bot">
                <div className="message-bubble bot typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chatbot-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về món ăn, giá cả..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              Gửi
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
