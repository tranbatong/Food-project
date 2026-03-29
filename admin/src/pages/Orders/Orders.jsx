import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Orders.css";
import toast from "react-hot-toast";
import { assets } from "../../assets/assets";

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(url + "/api/order/list");
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error("Error fetching orders: " + response.data.message);
      }
    } catch (error) {
      toast.error("Network error while fetching orders");
      console.error(error);
    }
  };

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    try {
      const response = await axios.post(url + "/api/order/updateStatus", {
        orderId,
        status: newStatus,
      });
      if (response.data.success) {
        toast.success("Order status updated successfully");
        fetchAllOrders(); // Refresh the orders list
      } else {
        toast.error("Error updating order status: " + response.data.message);
      }
    } catch (error) {
      toast.error("Network error while updating order status");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className="order add">
      <h3>Order Page</h3>
      <div className="order-list">
        {orders?.map((order, index) => (
          <div key={index} className="order-item">
            <img src={assets.parcel_icon} alt="Parcel" />

            <div>
              <p className="order-item-food">
                {order.items.map((item, itemIndex) => {
                  if (itemIndex === order.items.length - 1) {
                    return item.name + " x " + item.quantity;
                  } else {
                    return item.name + " x " + item.quantity + ", ";
                  }
                })}
              </p>

              <p className="order-item-name">
                {order.address.firstName + " " + order.address.lastName}
              </p>

              <div className="order-item-address">
                <p>{order.address.street + ","}</p>
                <p>
                  {order.address.city +
                    ", " +
                    order.address.state +
                    ", " +
                    order.address.country +
                    ", " +
                    order.address.zipCode}
                </p>
              </div>

              <p className="order-item-phone">{order.address.phone}</p>
            </div>

            <p>Items: {order.items.length}</p>
            <p>${order.amount}</p>

            {/* Thẻ select để Admin cập nhật trạng thái đơn hàng */}
            <select
              onChange={(event) => statusHandler(event, order._id)}
              value={order.status}
            >
              <option value="Food Processing">Food Processing</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
