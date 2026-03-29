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
        setData(response.data.orders);
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

              <p>${order.amount}.00</p>

              <p>Items: {order.items?.length || 0}</p>

              <p>
                <b>Status: </b> {order.status}
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
