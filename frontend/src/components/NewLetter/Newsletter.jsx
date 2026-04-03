import React from "react";
import "./Newsletter.css";

const Newsletter = () => {
  return (
    <div className="newsletter" id="newsletter">
      <h2>Đăng Ký Nhận Khuyến Mãi</h2>
      <p>
        Nhận ngay mã giảm giá 20% cho đơn hàng đầu tiên <br />
        và cập nhật các món ngon mới nhất mỗi ngày!
      </p>
      <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          placeholder="Nhập địa chỉ email của bạn..."
          required
        />
        <button type="submit">Đăng ký ngay</button>
      </form>
    </div>
  );
};

export default Newsletter;
