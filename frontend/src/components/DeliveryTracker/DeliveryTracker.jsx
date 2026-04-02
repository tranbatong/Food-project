import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { io } from "socket.io-client";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DeliveryTracker = ({ order, url }) => {
  const [shipperLocation, setShipperLocation] = useState({
    lat: order.shipperLocation?.lat || 10.796,
    lng: order.shipperLocation?.lng || 106.716,
  });

  const customerLocation = {
    lat: order.customerCoords?.lat || 10.8231,
    lng: order.customerCoords?.lng || 106.6297,
  };

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(url);
    socketRef.current.emit("join_order_room", order._id);

    // Lắng nghe tọa độ mới từ Server gửi về (từ trang của Shipper thực tế)
    socketRef.current.on("delivery_progress", (data) => {
      console.log("Khách hàng nhận được tọa độ mới:", data);
      setShipperLocation({ lat: data.lat, lng: data.lng });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [order._id, url]);

  return (
    <div
      style={{
        marginTop: "20px",
        border: "2px solid #tomato",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffe6e6",
          padding: "10px",
        }}
      >
        <h4 style={{ margin: 0, color: "tomato", textAlign: "center" }}>
          Bản đồ theo dõi tiến trình giao hàng
        </h4>
      </div>
      <MapContainer
        center={[shipperLocation.lat, shipperLocation.lng]}
        zoom={14}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Marker position={[shipperLocation.lat, shipperLocation.lng]}>
          <Popup>Vị trí của Shipper</Popup>
        </Marker>

        <Marker position={[customerLocation.lat, customerLocation.lng]}>
          <Popup>Địa chỉ của bạn</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default DeliveryTracker;
