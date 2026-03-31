import voucherModel from "../models/voucherModel.js";
import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";

// 1. Dành cho Admin: Thêm mã giảm giá mới
const addVoucher = async (req, res) => {
  try {
    const { code, discountPercent, maxDiscount, minAmount } = req.body;

    // Lưu mã ở định dạng in hoa để dễ quản lý
    const newVoucher = new voucherModel({
      code: code.toUpperCase(),
      discountPercent,
      maxDiscount,
      minAmount,
    });

    await newVoucher.save();
    res.json({ success: true, message: "Thêm mã giảm giá thành công" });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Lỗi khi thêm mã (Có thể mã đã tồn tại)",
    });
  }
};

// 2. Dành cho Admin: Lấy danh sách mã
const listVouchers = async (req, res) => {
  try {
    const vouchers = await voucherModel.find({});
    res.json({ success: true, data: vouchers });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi lấy danh sách mã" });
  }
};

// 3. Dành cho Admin: Xóa mã
const removeVoucher = async (req, res) => {
  try {
    await voucherModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Đã xóa mã giảm giá" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi xóa mã" });
  }
};

const applyVoucher = async (req, res) => {
  try {
    const { code } = req.body;

    // Tìm mã giảm giá trong database dựa vào code (viết hoa để khớp định dạng)
    const voucher = await voucherModel.findOne({
      code: code.toUpperCase(),
    });

    if (!voucher) {
      return res.json({
        success: false,
        message: "Mã giảm giá không tồn tại!",
      });
    }

    // Nếu tìm thấy mã, trả dữ liệu mã đó về cho Frontend xử lý tính toán
    // Trả về thuộc tính "data: voucher" để file Cart.jsx có thể đọc được
    res.json({
      success: true,
      message: "Áp dụng mã giảm giá thành công",
      data: voucher,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Lỗi hệ thống khi áp dụng mã giảm giá",
    });
  }
};

export { addVoucher, listVouchers, removeVoucher, applyVoucher };
