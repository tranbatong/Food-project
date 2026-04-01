import reviewModel from "../models/reviewModel.js";
import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";

// Hàm 1: Người dùng gửi đánh giá mới
const addReview = async (req, res) => {
  try {
    const { userId, foodId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.json({
        success: false,
        message: "Điểm đánh giá không hợp lệ (phải từ 1 đến 5)",
      });
    }

    // Kiểm tra xem khách hàng đã từng đặt món này chưa
    const hasOrdered = await orderModel.findOne({
      userId: userId,
      "items._id": foodId,
      payment: true,
    });

    if (!hasOrdered) {
      return res.json({
        success: false,
        message:
          "Bạn phải đặt mua và thanh toán thành công món này mới được phép đánh giá.",
      });
    }

    // KIỂM TRA ĐỂ CẬP NHẬT HOẶC THÊM MỚI
    let existingReview = await reviewModel.findOne({ userId, foodId });

    if (existingReview) {
      // Nếu đã từng đánh giá -> Cập nhật nội dung mới
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
    } else {
      // Nếu chưa từng đánh giá -> Tạo mới
      const review = new reviewModel({
        userId,
        foodId,
        rating,
        comment,
      });
      await review.save();
    }

    // Tính toán lại số sao trung bình của món ăn sau khi cập nhật
    const allReviews = await reviewModel.find({ foodId });
    const numReviews = allReviews.length;
    const totalRating = allReviews.reduce((acc, item) => acc + item.rating, 0);
    const avgRating = totalRating / numReviews;

    // Cập nhật thông số rating và numReviews vào bảng foodModel
    await foodModel.findByIdAndUpdate(foodId, {
      rating: avgRating,
      numReviews: numReviews,
    });

    res.json({
      success: true,
      message: existingReview
        ? "Cập nhật đánh giá thành công!"
        : "Cảm ơn bạn đã gửi đánh giá!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Lỗi hệ thống khi gửi/cập nhật đánh giá",
    });
  }
};

// Hàm 2: Lấy danh sách đánh giá của một món ăn cụ thể
const getFoodReviews = async (req, res) => {
  try {
    const { foodId } = req.body;

    const reviews = await reviewModel.find({ foodId }).sort({ createdAt: -1 });

    const reviewsWithUserData = await Promise.all(
      reviews.map(async (review) => {
        const user = await userModel.findById(review.userId);
        return {
          ...review._doc,
          userName: user ? user.name : "Người dùng ẩn danh",
        };
      }),
    );

    res.json({ success: true, data: reviewsWithUserData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi khi tải danh sách đánh giá" });
  }
};

export { addReview, getFoodReviews };
