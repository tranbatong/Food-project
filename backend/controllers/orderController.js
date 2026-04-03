import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5174";
  try {
    // Lưu đơn hàng vào Database (Bao gồm cả discountAmount và customerCoords)
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      discountAmount: req.body.discountAmount || 0,
      address: req.body.address,
      payment: false,
      customerCoords: req.body.customerCoords, // BỔ SUNG DÒNG NÀY ĐỂ LƯU TỌA ĐỘ KHÁCH HÀNG
    });
    await newOrder.save();

    // Xóa giỏ hàng của user sau khi đã tạo đơn
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // Tạo danh sách sản phẩm cho Stripe (Chuyển sang tiền USD)
    const line_items = req.body.items.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      };
    });

    // Thêm phí giao hàng vào Stripe
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    // Cấu hình phiên thanh toán
    let sessionConfig = {
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    };

    // Nếu có mã giảm giá, tạo một Coupon dùng 1 lần trên Stripe để trừ tiền
    if (req.body.discountAmount && req.body.discountAmount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(req.body.discountAmount * 100),
        currency: "usd",
        duration: "once",
      });
      // Gắn coupon vào phiên thanh toán
      sessionConfig.discounts = [{ coupon: coupon.id }];
    }

    // Khởi tạo phiên thanh toán Stripe
    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Xác thực đơn hàng sau khi thanh toán thành công hoặc thất bại
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Payment successful" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Lấy danh sách đơn hàng của một người dùng cụ thể
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Lấy danh sách tất cả đơn hàng (dành cho Admin)
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Cập nhật trạng thái đơn hàng (dành cho Admin)
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const listShipperOrders = async (req, res) => {
  try {
    // Chỉ lấy những đơn hàng đang ở trạng thái cần xử lý giao hàng
    const orders = await orderModel.find({
      status: { $in: ["Food Processing", "On the Way"] },
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.log("Lỗi lấy đơn hàng Shipper:", error);
    res.json({ success: false, message: "Lỗi hệ thống khi lấy đơn hàng" });
  }
};

// API 2: Shipper cập nhật trạng thái đơn hàng (ví dụ: xác nhận đã giao)
const updateShipperStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    await orderModel.findByIdAndUpdate(orderId, { status: status });

    res.json({ success: true, message: "Đã cập nhật trạng thái đơn hàng" });
  } catch (error) {
    console.log("Lỗi cập nhật trạng thái Shipper:", error);
    res.json({ success: false, message: "Lỗi khi cập nhật trạng thái" });
  }
};

export {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  listShipperOrders,
  updateShipperStatus,
};
