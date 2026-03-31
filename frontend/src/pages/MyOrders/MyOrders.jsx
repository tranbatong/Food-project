import React, { useContext, useState, useEffect } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/assets";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        `${url}/api/order/userOrders`,
        {},
        { headers: { token } },
      );

      if (response.data.success) {
        // Tùy chọn: Đảo ngược mảng để đơn hàng mới nhất hiển thị lên trên cùng
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

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {data?.map((order, index) => {
          return (
            <div key={index} className="my-orders-order">
              {/* Đưa ảnh ra ngoài, đứng ở cột đầu tiên của đơn hàng */}
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

              {/* Hiển thị tổng tiền và số tiền đã giảm */}
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

              {/* THÊM HIỂN THỊ NGÀY ĐẶT HÀNG Ở ĐÂY */}
              <p>
                <b>Date: </b> {new Date(order.date).toLocaleString("en-GB")}
              </p>

              <button onClick={fetchOrders}>Track Order</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
