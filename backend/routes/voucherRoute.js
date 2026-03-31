import express from "express";
import {
  addVoucher,
  listVouchers,
  removeVoucher,
  applyVoucher,
} from "../controllers/voucherController.js";
import authMiddleware from "../middleware/auth.js";

const voucherRouter = express.Router();

// Route cho Admin (Có thể thêm authMiddleware nếu muốn bảo mật kỹ hơn)
voucherRouter.post("/add", authMiddleware, addVoucher);
voucherRouter.get("/list", authMiddleware, listVouchers);
voucherRouter.post("/remove", authMiddleware, removeVoucher);

// Route cho User
voucherRouter.post("/apply", authMiddleware, applyVoucher);

export default voucherRouter;
