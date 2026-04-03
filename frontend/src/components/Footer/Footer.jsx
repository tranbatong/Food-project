import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logo} alt="logo" />
          <p>
            Đánh thức mọi giác quan của bạn bằng những kiệt tác ẩm thực được
            chăm chút từ nguyên liệu đến cách trình bày.
          </p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="facebook" />
            <img src={assets.twitter_icon} alt="twitter" />
            <img src={assets.linkedin_icon} alt="linkedin" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>CÔNG TY</h2>
          <ul>
            <li>Trang chủ</li>
            <li>Về chúng tôi</li>
            <li>Giao hàng</li>
            <li>Chính sách bảo mật</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>LIÊN HỆ</h2>
          <ul>
            <li>+84 0394 278 081</li>
            <li>tongxayda00@gmail.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Bản quyền © 2026 thuộc về batong.com. Bảo lưu mọi quyền.{" "}
      </p>
    </div>
  );
};

export default Footer;
