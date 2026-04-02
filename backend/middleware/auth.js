import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.json({ success: false, message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!req.body) {
      req.body = {};
    }

    // Gắn ID người dùng
    req.body.userId = decoded.id;

    // Giữ lại isAdmin để các API cũ của bạn không bị lỗi
    req.body.isAdmin = decoded.isAdmin;

    // BỔ SUNG: Gắn thêm trường role (vai trò) vào request
    // Nếu token được tạo bằng code mới, nó sẽ có decoded.role
    // Nếu là token cũ đang lưu trên máy người dùng, ta tự suy luận ngược lại
    if (decoded.role) {
      req.body.role = decoded.role;
    } else {
      req.body.role = decoded.isAdmin ? "admin" : "user";
    }

    next();
  } catch (error) {
    return res.json({ success: false, message: "Invalid token" });
  }
};

export default authMiddleware;
