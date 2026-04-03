import React from "react";
import "./Header.css";
const Header = () => {
  return (
    <div className="header">
      <div className="header-contents">
        <h2>Lựa chọn món ăn yêu thích của bạn</h2>
        <p>
          Đánh thức mọi giác quan của bạn bằng những kiệt tác ẩm thực được chăm
          chút từ nguyên liệu đến cách trình bày.
        </p>
        <button> Xem danh sách</button>
      </div>
    </div>
  );
};

export default Header;
