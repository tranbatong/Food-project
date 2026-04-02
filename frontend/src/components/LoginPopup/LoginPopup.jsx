import React, { useState, useContext } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom"; // Bổ sung import useNavigate

const LoginPopup = ({ setShowLogin }) => {
  // Bổ sung lấy thêm setRole từ StoreContext
  const { url, setToken, setIsAdmin, setRole } = useContext(StoreContext);

  const navigate = useNavigate(); // Khởi tạo hàm điều hướng

  const [currState, setCurrState] = useState("Login");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    let newUrl = url;

    if (currState === "Login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }

    try {
      const response = await axios.post(newUrl, data);

      if (response.data.success) {
        const token = response.data.token;
        const userIsAdmin = response.data.isAdmin;
        const userRole = response.data.role; // Lấy role từ API trả về

        // Cập nhật vào Context
        setToken(token);
        setIsAdmin(userIsAdmin);
        setRole(userRole);

        // Lưu vào LocalStorage để không bị mất khi F5
        localStorage.setItem("token", token);
        localStorage.setItem("isAdmin", userIsAdmin);
        localStorage.setItem("role", userRole);

        setShowLogin(false);

        toast.success(
          currState === "Login" ? "Login Successful" : "Account Created",
        );

        // BỔ SUNG: Kiểm tra role, nếu là shipper thì đẩy thẳng vào trang giao hàng
        if (userRole === "shipper") {
          navigate("/shipper");
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt="close"
          />
        </div>
        <div className="login-popup-inputs">
          {currState === "Sign Up" && (
            <input
              name="name"
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              placeholder="Your name"
              required
            />
          )}
          <input
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder="Your email"
            required
          />
          <input
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder="Password"
            required
          />
        </div>
        <button type="submit">
          {currState === "Sign Up" ? "Create account" : "Login"}
        </button>
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy</p>
        </div>
        {currState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => setCurrState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => setCurrState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
