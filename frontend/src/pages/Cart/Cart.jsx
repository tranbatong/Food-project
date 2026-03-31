import React, { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Cart = () => {
  const {
    cartItems,
    food_list,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
  } = useContext(StoreContext);

  const navigate = useNavigate();

  // State quản lý mã giảm giá
  const [promoCode, setPromoCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState({
    code: "",
    discountAmount: 0,
  });

  // Hàm xử lý áp dụng mã
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    const subtotal = getTotalCartAmount();
    if (subtotal === 0) {
      toast.error("Giỏ hàng đang trống");
      return;
    }

    // Kiểm tra token từ StoreContext
    if (!token) {
      toast.error("Vui lòng đăng nhập để sử dụng mã giảm giá");
      return;
    }

    try {
      // Gọi API kiểm tra mã và gửi kèm token trong headers
      const response = await axios.post(
        `${url}/api/voucher/apply`,
        { code: promoCode },
        { headers: { token } },
      );

      if (response.data.success) {
        const voucher = response.data.data;

        // 1. Kiểm tra đơn tối thiểu
        if (subtotal < voucher.minAmount) {
          toast.error(
            `Đơn hàng tối thiểu để áp dụng mã này là $${voucher.minAmount}`,
          );
          return;
        }

        // 2. Tính số tiền được giảm theo phần trăm
        let calculatedDiscount = (subtotal * voucher.discountPercent) / 100;

        // 3. Giới hạn số tiền giảm tối đa
        if (calculatedDiscount > voucher.maxDiscount) {
          calculatedDiscount = voucher.maxDiscount;
        }

        // 4. Lưu lại thông tin giảm giá
        setDiscountInfo({
          code: voucher.code,
          discountAmount: calculatedDiscount,
        });

        toast.success("Áp dụng mã giảm giá thành công!");
      } else {
        toast.error(response.data.message || "Mã giảm giá không hợp lệ");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Phiên đăng nhập hết hạn hoặc chưa xác thực.");
      } else {
        toast.error("Lỗi kết nối hoặc mã không tồn tại");
      }
    }
  };

  // Tính toán tổng tiền cuối cùng (không để số âm)
  const finalTotal = Math.max(
    0,
    getTotalCartAmount() === 0
      ? 0
      : getTotalCartAmount() + 2 - discountInfo.discountAmount,
  );

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={index}>
                <div className="cart-items-title cart-items-item">
                  <img src={`${url}/images/${item.image}`} alt="" />
                  <p>{item.name}</p>
                  <p>
                    <strong>$</strong>
                    {item.price}
                  </p>
                  <p>{cartItems[item._id]}</p>
                  <p>
                    <strong>$</strong>
                    {item.price * cartItems[item._id]}
                  </p>
                  <p onClick={() => removeFromCart(item._id)} className="cross">
                    x
                  </p>
                </div>
                <hr />
              </div>
            );
          }
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>
                <strong>$</strong>
                {getTotalCartAmount()}
              </p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>
                <strong>$</strong>
                {getTotalCartAmount() === 0 ? 0 : 2}
              </p>
            </div>
            <hr />

            {/* Hiển thị dòng Giảm giá nếu có áp dụng mã */}
            {discountInfo.discountAmount > 0 && (
              <>
                <div className="cart-total-details">
                  <p>Discount ({discountInfo.code})</p>
                  <p style={{ color: "red" }}>
                    <strong>-$</strong>
                    {discountInfo.discountAmount.toFixed(2)}
                  </p>
                </div>
                <hr />
              </>
            )}

            <div className="cart-total-details">
              <b>Total</b>
              <b>
                <strong>$</strong>
                {finalTotal.toFixed(2)}
              </b>
            </div>
          </div>
          <button
            // Truyền dữ liệu giảm giá sang trang Order để tiếp tục xử lý thanh toán
            onClick={() => navigate("/order", { state: { discountInfo } })}
          >
            PROCEED TO CHECK OUT
          </button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>
            <div className="cart-promocode-input">
              <input
                type="text"
                placeholder="promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button onClick={applyPromoCode}>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
