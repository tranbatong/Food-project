import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";

const createToken = (id, isAdmin) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET);
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

    const token = createToken(user._id, user.isAdmin);

    res.json({
      success: true,
      token,
      isAdmin: user.isAdmin,
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
    });
    const user = await newUser.save();

    const token = createToken(user._id, false);

    res.json({
      success: true,
      token,
      isAdmin: false,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Lấy danh sách tất cả người dùng (Chỉ Admin)
const getAllUsers = async (req, res) => {
  try {
    // Bảo mật: Kiểm tra xem người gọi API có phải là Admin không
    if (!req.body.isAdmin) {
      return res.json({
        success: false,
        message: "Truy cập bị từ chối. Cần quyền Admin.",
      });
    }

    // Lấy toàn bộ dữ liệu user, trừ trường password ra để bảo mật thông tin
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
// thêm
const addUser = async (req, res) => {
  try {
    if (!req.body.isAdmin) {
      return res.json({ success: false, message: "Truy cập bị từ chối." });
    }

    // Frontend sẽ gửi lên name, email, password và role (để phân biệt quyền)
    const { name, email, password, role } = req.body;

    // Kiểm tra email tồn tại
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Email đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      isAdmin: role === "admin" ? true : false,
    });

    await newUser.save();
    res.json({ success: true, message: "Thêm người dùng thành công" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi khi thêm người dùng" });
  }
};

// API: Cập nhật thông tin người dùng (Admin)
const editUser = async (req, res) => {
  try {
    if (!req.body.isAdmin) {
      return res.json({ success: false, message: "Truy cập bị từ chối." });
    }

    const { targetUserId, name, email, password, role } = req.body;

    const user = await userModel.findById(targetUserId);
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.isAdmin = role === "admin" ? true : false;

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
