import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Tag,
  Select,
  Typography,
  Card,
  Space,
  message,
  Badge,
} from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import "./Orders.css";

const { Text } = Typography;

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(url + "/api/order/list");
      if (response.data.success) {
        setOrders(response.data.data.reverse());
      } else {
        message.error("Error fetching orders");
      }
    } catch (error) {
      message.error("Network error");
    }
    setLoading(false);
  };

  const statusHandler = async (value, orderId) => {
    try {
      const response = await axios.post(url + "/api/order/updateStatus", {
        orderId,
        status: value,
      });
      if (response.data.success) {
        message.success("Trạng thái đã cập nhật");
        await fetchAllOrders();
      }
    } catch (error) {
      message.error("Lỗi cập nhật trạng thái");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const columns = [
    {
      title: "Đơn hàng",
      key: "order_info",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: "#1677ff" }}>
            #{record._id.slice(-6).toUpperCase()}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {new Date(record.date).toLocaleString("en-GB")}
          </Text>
        </Space>
      ),
    },
    {
      title: "Chi tiết món ăn",
      dataIndex: "items",
      key: "items",
      width: 300,
      render: (items) => (
        <div className="order-items-column">
          {items.map((item, index) => (
            <Tag key={index} color="blue" style={{ marginBottom: "4px" }}>
              {item.name} x {item.quantity}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => (
        <div className="customer-info">
          <div>
            <UserOutlined />{" "}
            <b>
              {record.address.firstName} {record.address.lastName}
            </b>
          </div>
          <div style={{ fontSize: "12px" }}>
            <PhoneOutlined /> {record.address.phone}
          </div>
          <div style={{ fontSize: "11px", color: "#888" }}>
            <EnvironmentOutlined />{" "}
            {`${record.address.street}, ${record.address.city}`}
          </div>
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: (amount) => (
        <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
          ${amount.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          defaultValue={status}
          style={{ width: 160 }}
          onChange={(value) => statusHandler(value, record._id)}
          options={[
            {
              value: "Food Processing",
              label: <Badge status="processing" text="Processing" />,
            },
            {
              value: "Out for delivery",
              label: <Badge status="warning" text="Out for delivery" />,
            },
            {
              value: "Delivered",
              label: <Badge status="success" text="Delivered" />,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="orders-page">
      <Card
        title={
          <span>
            <ShoppingCartOutlined /> QUẢN LÝ ĐƠN HÀNG
          </span>
        }
        className="order-card"
      >
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 7 }}
        />
      </Card>
    </div>
  );
};

export default Orders;
