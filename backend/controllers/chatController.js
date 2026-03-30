import conversationModel from "../models/conversationModel.js";
import messageModel from "../models/messageModel.js";

const sendMessage = async (req, res) => {
  try {
    // userId và isAdmin được tự động thêm vào req.body từ authMiddleware
    const { text, customerId, userId, isAdmin } = req.body;

    // Xác định ID của phòng chat (luôn là ID của khách hàng)
    // - Nếu Admin gửi: lấy customerId từ frontend truyền lên.
    // - Nếu Khách gửi: lấy chính userId của họ từ token.
    const chatRoomId = isAdmin ? customerId : userId;

    // Xác định người gửi
    // - Nếu Admin gửi: gán cứng chuỗi "admin"
    // - Nếu Khách gửi: dùng userId từ token
    const currentSenderId = isAdmin ? "admin" : userId;

    if (!chatRoomId) {
      return res.json({
        success: false,
        message: "Thiếu thông tin phòng chat",
      });
    }

    let conversation = await conversationModel.findOne({ userId: chatRoomId });

    if (!conversation) {
      conversation = new conversationModel({
        userId: chatRoomId,
        lastMessage: text,
      });
      await conversation.save();
    } else {
      conversation.lastMessage = text;
      await conversation.save();
    }

    const newMessage = new messageModel({
      conversationId: conversation._id,
      senderId: currentSenderId,
      text,
    });
    await newMessage.save();

    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi khi gửi tin nhắn" });
  }
};

const getMessages = async (req, res) => {
  try {
    // Lấy ID phòng chat từ URL params (route là /:userId)
    const targetUserId = req.params.userId;
    const { userId, isAdmin } = req.body;

    // Bảo mật: Nếu không phải Admin, khách hàng chỉ được phép xem tin nhắn của chính họ
    if (!isAdmin && targetUserId !== userId) {
      return res.json({ success: false, message: "Không có quyền truy cập" });
    }

    const conversation = await conversationModel.findOne({
      userId: targetUserId,
    });

    if (!conversation) {
      return res.json({ success: true, data: [] });
    }

    const messages = await messageModel.find({
      conversationId: conversation._id,
    });
    res.json({ success: true, data: messages });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi khi lấy tin nhắn" });
  }
};

const getConversations = async (req, res) => {
  try {
    // Bảo mật: Chỉ có tài khoản Admin mới được xem danh sách tất cả phòng chat
    if (!req.body.isAdmin) {
      return res.json({
        success: false,
        message: "Truy cập bị từ chối. Cần quyền Admin.",
      });
    }

    const conversations = await conversationModel
      .find({})
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi khi lấy danh sách phòng chat" });
  }
};

export { sendMessage, getMessages, getConversations };
