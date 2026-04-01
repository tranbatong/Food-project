import express from "express";
import { addReview, getFoodReviews } from "../controllers/reviewController.js";
import authMiddleware from "../middleware/auth.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", authMiddleware, addReview);

reviewRouter.post("/list", getFoodReviews);

export default reviewRouter;
