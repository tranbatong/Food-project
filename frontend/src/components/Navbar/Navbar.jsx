import React, { useContext, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("Home");

  // State mới cho tính năng tìm kiếm
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { getTotalCartAmount, token, setToken, isAdmin, setIsAdmin } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    setToken("");
    setIsAdmin(false);
    navigate("/");
  };

  // Hàm xử lý khi người dùng nhấn Enter
  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      // Chuyển hướng sang trang listsearch và truyền từ khóa qua URL
      navigate(`/listsearch?query=${searchQuery.trim()}`);
      setShowSearch(false); // Ẩn thanh tìm kiếm sau khi enter (tùy chọn)
      setSearchQuery(""); // Xóa trắng ô input (tùy chọn)
    }
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="logo" className="logo" />
      </Link>
      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("Home")}
          className={menu === "Home" ? "active" : ""}
        >
          Home
        </Link>
        <a
          href="#explore-menu"
          onClick={() => setMenu("Menu")}
          className={menu === "Menu" ? "active" : ""}
        >
          Menu
        </a>
        {/* Đã sửa phần này thành Newsletter */}
        <a
          href="#newsletter"
          onClick={() => setMenu("Newsletter")}
          className={menu === "Newsletter" ? "active" : ""}
        >
          Newsletter
        </a>
        <a
          href="#footer"
          onClick={() => setMenu("Contact")}
          className={menu === "Contact" ? "active" : ""}
        >
          Contact us
        </a>
      </ul>
      <div className="navbar-right">
        {/* Khu vực tìm kiếm mới */}
        <div className="navbar-search-container">
          {showSearch && (
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="navbar-search-input"
              autoFocus // Tự động trỏ nháy chuột vào khi mở lên
            />
          )}
          <img
            src={assets.search_icon}
            alt="search"
            onClick={() => setShowSearch(!showSearch)}
            className="search-icon-btn"
          />
        </div>

        <div className="navbar-search-icon">
          <Link to="/Cart">
            <img src={assets.basket_icon} alt="basket" />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>

        {!token ? (
          <button onClick={() => setShowLogin(true)}>Sign in</button>
        ) : (
          <div className="navbar-profile">
            <img src={assets.profile_icon} alt="profile" />
            <ul className="nav-profile-dropdown">
              {isAdmin && (
                <>
                  <li
                    onClick={() =>
                      window.open(
                        `http://localhost:5173?token=${token}`,
                        "_blank",
                      )
                    }
                  >
                    <img src={assets.profile_icon} alt="admin" />
                    <p>Admin Panel</p>
                  </li>
                  <hr />
                </>
              )}

              <li onClick={() => navigate("/myorders")}>
                <img src={assets.bag_icon} alt="orders" />
                <p>Orders</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="logout" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
