import { GoogleGenerativeAI } from "@google/generative-ai";
import foodModel from "../models/foodModel.js";

// Khởi tạo Gemini API với Key từ biến môi trường
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askChatbot = async (req, res) => {
  try {
    // Nhận câu hỏi từ phía người dùng
    const { message } = req.body;

    if (!message) {
      return res.json({ success: false, message: "Vui lòng nhập câu hỏi." });
    }

    // 1. Lấy toàn bộ thực đơn từ cơ sở dữ liệu
    const foods = await foodModel.find({});

    // 2. Trích xuất thông tin cần thiết để tối ưu hóa dữ liệu gửi cho AI
    const menuContext = foods
      .map(
        (food) =>
          `- Tên món: ${food.name}, Danh mục: ${food.category}, Giá: $${food.price}`,
      )
      .join("\n");

    // 3. Xây dựng Prompt (Câu lệnh) để thiết lập vai trò và cung cấp ngữ cảnh cho Gemini
    const prompt = `
    Bạn là nhân viên tư vấn nhiệt tình, lịch sự của nhà hàng Tomato.
    Dưới đây là danh sách thực đơn hiện tại của nhà hàng chúng tôi:
    
    ${menuContext}

    Câu hỏi của khách hàng: "${message}"

    Yêu cầu bắt buộc:
    1. Hãy tư vấn cho khách hàng dựa trên thực đơn cung cấp ở trên.
    2. Tuyệt đối CHỈ gợi ý các món CÓ TRONG THỰC ĐƠN. 
    3. Nếu khách hàng hỏi một món không có, hãy lịch sự thông báo nhà hàng không có món đó và gợi ý các món khác có trong thực đơn.
    4. Trả lời ngắn gọn, thân thiện và bằng tiếng Việt.
    `;

    // 4. Chọn model và gửi yêu cầu
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    const result = await model.generateContent(prompt);

    // Lấy câu trả lời dạng text
    const responseText = result.response.text();

    // 5. Trả kết quả về cho Frontend
    res.json({ success: true, answer: responseText });
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    res.json({
      success: false,
      message:
        "Xin lỗi, trợ lý tư vấn hiện đang bận hoặc gặp sự cố. Vui lòng thử lại sau.",
    });
  }
};

export { askChatbot };
