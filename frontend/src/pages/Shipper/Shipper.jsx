import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
// Thêm useMap từ react-leaflet
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Import thư viện vẽ đường đi
import "leaflet-routing-machine";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// --- COMPONENT CON: VẼ ĐƯỜNG ĐI CHỈ DẪN ---
const Routing = ({ source, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (!source || !destination) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(source.lat, source.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      lineOptions: {
        styles: [{ color: "#007bff", weight: 5, opacity: 0.7 }], // Đường màu xanh dương
      },
      show: false, // Ẩn bảng hướng dẫn bằng chữ để bản đồ gọn gàng
      addWaypoints: false, // Không cho phép người dùng click tạo thêm điểm trung gian
      routeWhileDragging: false,
      fitSelectedRoutes: true, // Tự động zoom bản đồ cho vừa vặn với tuyến đường
      createMarker: () => null, // Ẩn marker mặc định của thư viện vẽ đường vì chúng ta đã có Marker riêng
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, source, destination]);

  return null;
};

// --- COMPONENT CHÍNH ---
const Shipper = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);

  const [currentLocation, setCurrentLocation] = useState(null);

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);

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

  const startDelivery = (orderId) => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt của bạn không hỗ trợ định vị GPS!");
      return;
    }

    socketRef.current = io(url);
    socketRef.current.emit("join_order_room", orderId);
    setActiveDelivery(orderId);

    toast.info("Bắt đầu giao hàng! Hệ thống đang lấy tọa độ GPS của bạn.");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;

        setCurrentLocation({ lat: currentLat, lng: currentLng });

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

  const finishDelivery = async () => {
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
        setCurrentLocation(null);
        fetchOrders();
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
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "12px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            {/* THÊM CHI TIẾT THÔNG TIN KHÁCH HÀNG VÀ ĐƠN HÀNG */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                borderBottom: "1px dashed #ccc",
                paddingBottom: "15px",
                marginBottom: "15px",
              }}
            >
              <div>
                <p style={{ margin: "5px 0" }}>
                  <b>Mã đơn:</b> #{order._id.slice(-6)}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <b>Khách hàng:</b> {order.address.firstName}{" "}
                  {order.address.lastName}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <b>Số điện thoại:</b>{" "}
                  <a
                    href={`tel:${order.address.phone}`}
                    style={{
                      color: "#1677ff",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    {order.address.phone}
                  </a>
                </p>
              </div>
              <div>
                <p style={{ margin: "5px 0" }}>
                  <b>Tổng thu:</b>{" "}
                  <span
                    style={{
                      color: "tomato",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    ${order.amount.toFixed(2)}
                  </span>
                </p>
                <p style={{ margin: "5px 0" }}>
                  <b>Địa chỉ:</b> {order.address.street}, {order.address.city}
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#f9f9f9",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <b>Chi tiết món ăn:</b>
              <ul style={{ margin: "5px 0 0 20px", padding: 0 }}>
                {order.items?.map((item, index) => (
                  <li key={index} style={{ margin: "3px 0" }}>
                    {item.name}{" "}
                    <span style={{ color: "gray" }}>x {item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* KẾT THÚC PHẦN THÊM MỚI */}

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

                {currentLocation && (
                  <div
                    style={{
                      marginBottom: "15px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "2px solid #ccc",
                    }}
                  >
                    <MapContainer
                      center={[currentLocation.lat, currentLocation.lng]}
                      zoom={14}
                      style={{ height: "350px", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />

                      <Marker
                        position={[currentLocation.lat, currentLocation.lng]}
                      >
                        <Popup>Vị trí của bạn</Popup>
                      </Marker>

                      {order.customerCoords && order.customerCoords.lat && (
                        <Marker
                          position={[
                            order.customerCoords.lat,
                            order.customerCoords.lng,
                          ]}
                        >
                          <Popup>Địa chỉ Khách hàng</Popup>
                        </Marker>
                      )}

                      {/* GỌI COMPONENT VẼ ĐƯỜNG ĐI */}
                      {order.customerCoords && order.customerCoords.lat && (
                        <Routing
                          source={currentLocation}
                          destination={{
                            lat: order.customerCoords.lat,
                            lng: order.customerCoords.lng,
                          }}
                        />
                      )}
                    </MapContainer>
                  </div>
                )}

                <button
                  onClick={finishDelivery}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "green",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    width: "100%",
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
                  padding: "12px 20px",
                  marginTop: "10px",
                  backgroundColor: activeDelivery ? "#ccc" : "tomato",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: activeDelivery ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  width: "100%",
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
