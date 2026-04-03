import React, { useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import Chat from "./pages/Chat/Chat";
import Users from "./pages/Users/Users";
import Vouchers from "./pages/Vouchers/Vouchers";
import Dashboard from "./pages/Dashboard/Dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const url = "http://localhost:4000";

  // Thêm useEffect để xử lý token khi ứng dụng vừa tải lên
  useEffect(() => {
    // 1. Quét thanh địa chỉ (URL) xem có biến "token" không
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");

    if (urlToken) {
      // 2. Lưu token vào localStorage của riêng cổng 5173
      localStorage.setItem("token", urlToken);

      // 3. Xóa chuỗi token khỏi thanh địa chỉ để làm sạch URL và bảo mật
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div>
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/add" element={<Add url={url} />} />
          <Route path="/list" element={<List url={url} />} />
          <Route path="/orders" element={<Orders url={url} />} />
          <Route path="/chat" element={<Chat url={url} />} />
          <Route path="/users" element={<Users url={url} />} />
          <Route path="/vouchers" element={<Vouchers url={url} />} />
          <Route path="/dashboard" element={<Dashboard url={url} />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
