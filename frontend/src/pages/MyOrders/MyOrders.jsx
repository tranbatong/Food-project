import React, { useContext, useState, useEffect } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/assets";
import DeliveryTracker from "../../components/DeliveryTracker/DeliveryTracker";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);

  const [trackingOrderId, setTrackingOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        `${url}/api/order/userOrders`,
        {},
        { headers: { token } },
      );

      if (response.data.success) {
        setData(response.data.orders.reverse());
      } else {
        alert("Error fetching orders: " + response.data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const toggleTracking = (orderId) => {
    if (trackingOrderId === orderId) {
      setTrackingOrderId(null);
    } else {
      setTrackingOrderId(orderId);
    }
  };

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {data?.map((order, index) => {
          return (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <div className="my-orders-order">
                <img src={assets.parcel_icon} alt="Parcel Icon" />

                <p>
                  {order.items?.map((item, itemIndex) => {
                    if (itemIndex === order.items.length - 1) {
                      return item.name + " x " + item.quantity;
                    } else {
                      return item.name + " x " + item.quantity + ", ";
                    }
                  })}
                </p>

                <p>
                  <b>${order.amount.toFixed(2)}</b>
                  {order.discountAmount > 0 && (
                    <span
                      style={{
                        color: "red",
                        display: "block",
                        fontSize: "14px",
                        marginTop: "5px",
                      }}
                    >
                      (Discount: -${order.discountAmount.toFixed(2)})
                    </span>
                  )}
                </p>

                <p>Items: {order.items?.length || 0}</p>

                <p>
                  <b>Status: </b> {order.status}
                </p>

                <p>
                  <b>Date: </b> {new Date(order.date).toLocaleString("en-GB")}
                </p>

                {/* ĐIỀU CHỈNH: Chỉ hiện nút theo dõi nếu trạng thái khác Delivered */}
                {order.status !== "Delivered" && (
                  <button onClick={() => toggleTracking(order._id)}>
                    {trackingOrderId === order._id
                      ? "Close Map"
                      : "Track Order"}
                  </button>
                )}
              </div>

              {trackingOrderId === order._id && (
                <DeliveryTracker order={order} url={url} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
