import React, { useContext, useState, useEffect } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

const FoodItem = ({
  id,
  name,
  price,
  description,
  image,
  rating = 0,
  numReviews = 0,
}) => {
  const { cartItems, addToCart, removeFromCart, url, token } =
    useContext(StoreContext);

  const [showModal, setShowModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // State nhận diện xem là đang sửa hay thêm mới
  const [isEditing, setIsEditing] = useState(false);

  const [localRating, setLocalRating] = useState(rating);
  const [localNumReviews, setLocalNumReviews] = useState(numReviews);

  useEffect(() => {
    setLocalRating(rating);
    setLocalNumReviews(numReviews);
  }, [rating, numReviews]);

  // Hàm lấy ID người dùng từ Token
  const getUserIdFromToken = () => {
    if (!token) return null;
    try {
      const payloadBase64 = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      return decodedPayload.id;
    } catch (error) {
      return null;
    }
  };

  const openReviewModal = async () => {
    setShowModal(true);
    fetchReviews();
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.post(`${url}/api/review/list`, {
        foodId: id,
      });
      if (response.data.success) {
        const fetchedReviews = response.data.data;
        setReviews(fetchedReviews);

        if (fetchedReviews.length > 0) {
          const total = fetchedReviews.reduce(
            (sum, rev) => sum + rev.rating,
            0,
          );
          setLocalRating(total / fetchedReviews.length);
          setLocalNumReviews(fetchedReviews.length);
        } else {
          setLocalRating(0);
          setLocalNumReviews(0);
        }

        // Tự động điền form nếu người dùng đã từng đánh giá
        const currentUserId = getUserIdFromToken();
        const myReview = fetchedReviews.find(
          (rev) => rev.userId === currentUserId,
        );

        if (myReview) {
          setUserRating(myReview.rating);
          setComment(myReview.comment);
          setIsEditing(true);
        } else {
          setUserRating(5);
          setComment("");
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách đánh giá:", error);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Vui lòng đăng nhập để đánh giá!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${url}/api/review/add`,
        {
          foodId: id,
          rating: userRating,
          comment: comment,
        },
        { headers: { token } },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchReviews(); // Tải lại để cập nhật danh sách và trạng thái form
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi gửi đánh giá.");
    }
    setLoading(false);
  };

  const renderStars = (currentRating) => {
    return (
      <div className="dynamic-stars">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <span
              key={index}
              className={
                starValue <= Math.round(currentRating)
                  ? "star-filled"
                  : "star-empty"
              }
            >
              ★
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={`${url}/images/${image}`}
          alt=""
        />
        {!cartItems[id] ? (
          <img
            className="add"
            onClick={() => addToCart(id)}
            src={assets.add_icon_white}
            alt=""
          />
        ) : (
          <div className="food-item-counter">
            <img
              onClick={() => removeFromCart(id)}
              src={assets.remove_icon_red}
              alt=""
            />
            <p>{cartItems[id]}</p>
            <img
              onClick={() => addToCart(id)}
              src={assets.add_icon_green}
              alt=""
            />
          </div>
        )}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <div className="rating-clickable" onClick={openReviewModal}>
            {renderStars(localRating)}
            <span className="review-count">({localNumReviews})</span>
          </div>
        </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-price">${price}</p>
      </div>

      {/* Modal Đánh Giá */}
      {showModal && (
        <div className="review-modal-overlay">
          <div className="review-modal-content">
            <div className="review-modal-header">
              <h3>Đánh giá: {name}</h3>
              <span className="close-btn" onClick={() => setShowModal(false)}>
                X
              </span>
            </div>

            <div className="review-list">
              {reviews.length === 0 ? (
                <p className="no-reviews">Chưa có đánh giá nào cho món này.</p>
              ) : (
                reviews.map((rev, index) => (
                  <div key={index} className="review-card">
                    <div className="review-user-header">
                      <b>{rev.userName}</b>
                      {renderStars(rev.rating)}
                    </div>
                    <p className="review-comment">{rev.comment}</p>
                    <p className="review-date">
                      {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={submitReview} className="review-form">
              <h4>
                {isEditing
                  ? "Cập nhật đánh giá của bạn"
                  : "Viết đánh giá của bạn"}
              </h4>
              <div className="star-selector">
                <label>Chọn số sao: </label>
                <select
                  value={userRating}
                  onChange={(e) => setUserRating(Number(e.target.value))}
                >
                  <option value="5">5 Sao (Tuyệt vời)</option>
                  <option value="4">4 Sao (Khá tốt)</option>
                  <option value="3">3 Sao (Bình thường)</option>
                  <option value="2">2 Sao (Tệ)</option>
                  <option value="1">1 Sao (Rất tệ)</option>
                </select>
              </div>
              <textarea
                placeholder="Nhận xét của bạn về món ăn này..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
              <button type="submit" disabled={loading}>
                {loading
                  ? "Đang xử lý..."
                  : isEditing
                    ? "Cập Nhật Đánh Giá"
                    : "Gửi Đánh Giá"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodItem;
