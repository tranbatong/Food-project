import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const Shipper = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);

  // Lấy danh sách đơn hàng chờ giao
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/shipper/list`, {
        headers: { token },
      });
      if (response.data.success) {
        setOrders(response.data.data.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Bắt đầu giao hàng
  const startDelivery = (orderId) => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt của bạn không hỗ trợ định vị GPS!");
      return;
    }

    // Kết nối Socket và tham gia phòng
    socketRef.current = io(url);
    socketRef.current.emit("join_order_room", orderId);
    setActiveDelivery(orderId);

    toast.info("Bắt đầu giao hàng! Hệ thống đang lấy tọa độ GPS của bạn.");

    // Theo dõi GPS liên tục
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;

        console.log("Tọa độ hiện tại:", currentLat, currentLng);

        // Phát tọa độ lên Server
        socketRef.current.emit("update_location", {
          orderId: orderId,
          lat: currentLat,
          lng: currentLng,
        });
      },
      (error) => {
        console.error("Lỗi GPS:", error.message);
        toast.error("Vui lòng cho phép trình duyệt truy cập vị trí!");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      },
    );
  };

  // Hoàn thành giao hàng
  const finishDelivery = async () => {
    // Tắt theo dõi GPS và ngắt kết nối Socket
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    try {
      const response = await axios.post(
        `${url}/api/order/shipper/status`,
        { orderId: activeDelivery, status: "Delivered" },
        { headers: { token } },
      );

      if (response.data.success) {
        toast.success("Đã giao hàng thành công!");
        setActiveDelivery(null);
        fetchOrders(); // Tải lại danh sách để ẩn đơn vừa giao
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật giao hàng:", error);
      toast.error("Có lỗi xảy ra khi xác nhận giao hàng.");
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        minHeight: "60vh",
      }}
    >
      <h2>Trang dành cho Shipper</h2>
      <p style={{ color: "gray", marginBottom: "20px" }}>
        Lưu ý: Bạn phải cho phép trình duyệt truy cập Vị Trí (Location) để cập
        nhật bản đồ cho khách.
      </p>

      {orders.length === 0 ? (
        <p>Hiện không có đơn hàng nào cần giao.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
            }}
          >
            <p>
              <b>Mã đơn:</b> {order._id}
            </p>
            <p>
              <b>Tiền thu:</b> ${order.amount}
            </p>
            <p>
              <b>Địa chỉ khách:</b> {order.address.street}, {order.address.city}
            </p>

            {activeDelivery === order._id ? (
              <div
                style={{
                  backgroundColor: "#e6ffe6",
                  padding: "15px",
                  marginTop: "15px",
                  borderRadius: "5px",
                }}
              >
                <p
                  style={{
                    color: "green",
                    fontWeight: "bold",
                    margin: "0 0 10px 0",
                  }}
                >
                  Đang giao đơn hàng này...
                </p>
                <button
                  onClick={finishDelivery}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "green",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Xác nhận đã giao xong
                </button>
              </div>
            ) : (
              <button
                onClick={() => startDelivery(order._id)}
                disabled={activeDelivery !== null}
                style={{
                  padding: "10px 20px",
                  marginTop: "10px",
                  backgroundColor: activeDelivery ? "#ccc" : "tomato",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: activeDelivery ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                Nhận và Bắt đầu giao
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Shipper;
