import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  listShipperOrders,
  updateShipperStatus,
  getDashboardStats,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userOrders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/updateStatus", updateStatus);
//
orderRouter.get("/shipper/list", authMiddleware, listShipperOrders);
orderRouter.post("/shipper/status", authMiddleware, updateShipperStatus);
orderRouter.get("/dashboard", getDashboardStats);

export default orderRouter;
