import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  loginUser,
  registerUser,
  getAllUsers,
  removeUser,
  addUser,
  editUser,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);
userRouter.get("/list", authMiddleware, getAllUsers);
userRouter.post("/remove", authMiddleware, removeUser);
userRouter.post("/add", authMiddleware, addUser);
userRouter.post("/edit", authMiddleware, editUser);

export default userRouter;
