import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Col, Row, Statistic, message, Spin } from "antd";
// Import các component từ recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = ({ url }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    dailyRevenue: [], // Thêm mảng chứa dữ liệu biểu đồ
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${url}/api/order/dashboard`);
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        message.error("Không thể lấy dữ liệu thống kê");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      message.error("Lỗi kết nối đến máy chủ");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [url]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "100px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "calc(100vh - 100px)",
        backgroundColor: "#f4f7fe",
      }}
    >
      <h2
        style={{ color: "#2b3674", marginBottom: "24px", fontWeight: "bold" }}
      >
        TỔNG QUAN HỆ THỐNG
      </h2>

      {/* Hàng 1: 3 Thẻ thống kê */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            }}
          >
            <Statistic
              title="Tổng Doanh Thu"
              value={stats.totalRevenue}
              precision={2}
              valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
              prefix="$"
            />
            <p style={{ marginTop: "10px", color: "gray", fontSize: "12px" }}>
              Dựa trên các đơn hàng đã giao thành công
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            }}
          >
            <Statistic
              title="Tổng Đơn Hàng"
              value={stats.totalOrders}
              valueStyle={{ color: "#1677ff", fontWeight: "bold" }}
            />
            <p style={{ marginTop: "10px", color: "gray", fontSize: "12px" }}>
              Tất cả các đơn hàng trên hệ thống
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            }}
          >
            <Statistic
              title="Khách Hàng Đăng Ký"
              value={stats.totalUsers}
              valueStyle={{ color: "#cf1322", fontWeight: "bold" }}
            />
            <p style={{ marginTop: "10px", color: "gray", fontSize: "12px" }}>
              Số lượng tài khoản người dùng
            </p>
          </Card>
        </Col>
      </Row>

      {/* Hàng 2: Biểu đồ doanh thu */}
      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col span={24}>
          <Card
            bordered={false}
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            }}
            title={
              <span style={{ color: "#2b3674", fontWeight: "bold" }}>
                Biểu Đồ Doanh Thu Theo Ngày
              </span>
            }
          >
            {stats.dailyRevenue && stats.dailyRevenue.length > 0 ? (
              <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={stats.dailyRevenue}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e0e0e0"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#8f9bba" }}
                      axisLine={{ stroke: "#e0e0e0" }}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fill: "#8f9bba" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value) => [`$${value}`, "Doanh thu"]}
                      labelStyle={{ color: "#2b3674", fontWeight: "bold" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4318FF" // Màu đường kẻ (Tím/Xanh lam hiện đại)
                      strokeWidth={4}
                      activeDot={{
                        r: 8,
                        fill: "#4318FF",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      dot={{ r: 4, fill: "#4318FF", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "gray",
                  padding: "50px 0",
                }}
              >
                Chưa có dữ liệu doanh thu (Cần có đơn hàng ở trạng thái
                Delivered)
              </p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
