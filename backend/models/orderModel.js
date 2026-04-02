import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Object, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Food Processing" },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, required: true },
  discountAmount: { type: Number, default: 0 },

  shipperLocation: {
    lat: { type: Number, default: 10.796 }, // Vĩ độ mặc định (ví dụ tọa độ cửa hàng)
    lng: { type: Number, default: 106.716 }, // Kinh độ mặc định
  },
  customerCoords: {
    lat: { type: Number },
    lng: { type: Number },
  },
});

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
