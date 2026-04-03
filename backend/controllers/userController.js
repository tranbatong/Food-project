import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";

// CẬP NHẬT: Thêm tham số 'role' vào hàm tạo token
const createToken = (id, isAdmin, role) => {
  return jwt.sign({ id, isAdmin, role }, process.env.JWT_SECRET);
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // CẬP NHẬT: Truyền thêm user.role vào để lưu trong token
    const token = createToken(user._id, user.isAdmin, user.role);

    res.json({
      success: true,
      token,
      isAdmin: user.isAdmin,
      role: user.role, // Trả thêm role về Frontend để Frontend tự động chuyển hướng
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exits = await userModel.findOne({ email });
    if (exits) {
      return res.json({ success: false, message: "User already exists" });
    }
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a password with at least 8 characters",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
      // Mặc định đăng ký mới là role "user"
      role: "user",
    });
    const user = await newUser.save();

    const token = createToken(user._id, false, "user");

    res.json({
      success: true,
      token,
      isAdmin: false,
      role: "user",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Lấy danh sách tất cả người dùng (Chỉ Admin)
const getAllUsers = async (req, res) => {
  try {
    if (!req.body.isAdmin) {
      return res.json({
        success: false,
        message: "Truy cập bị từ chối. Cần quyền Admin.",
      });
    }

    const users = await userModel.find({}).select("-password");
    res.json({ success: true, data: users });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi khi lấy danh sách người dùng" });
  }
};

// Xóa một người dùng
const removeUser = async (req, res) => {
  try {
    if (!req.body.isAdmin) {
      return res.json({
        success: false,
        message: "Truy cập bị từ chối. Cần quyền Admin.",
      });
    }

    const { id } = req.body;
    await userModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Đã xóa người dùng thành công" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi khi xóa người dùng" });
  }
};

// Thêm người dùng (Admin)
const addUser = async (req, res) => {
  try {
    if (!req.body.isAdmin) {
      return res.json({ success: false, message: "Truy cập bị từ chối." });
    }

    // Đổi chữ 'role' thành 'targetRole' để không bị middleware ghi đè
    const { name, email, password, targetRole } = req.body;

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Email đã tồn tại" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Sử dụng targetRole để lưu dữ liệu
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      role: targetRole || "user",
      isAdmin: targetRole === "admin" ? true : false,
    });

    await newUser.save();
    res.json({ success: true, message: "Thêm người dùng thành công" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi khi thêm người dùng" });
  }
};

// Cập nhật thông tin người dùng (Admin)
const editUser = async (req, res) => {
  try {
    if (!req.body.isAdmin) {
      return res.json({ success: false, message: "Truy cập bị từ chối." });
    }

    // Đổi chữ 'role' thành 'targetRole'
    const { targetUserId, name, email, password, targetRole } = req.body;

    const user = await userModel.findById(targetUserId);
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    // Cập nhật dựa trên targetRole
    if (targetRole) {
      user.role = targetRole;
      user.isAdmin = targetRole === "admin" ? true : false;
    }

    if (password && password.length > 0) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ success: true, message: "Cập nhật thông tin thành công" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi khi cập nhật người dùng" });
  }
};

export { loginUser, registerUser, getAllUsers, removeUser, addUser, editUser };
