import React from "react";
import { Layout, Menu } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
  ShoppingOutlined,
  MessageOutlined,
  UserOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import "./Sidebar.css";

const { Sider } = Layout;

const Sidebar = () => {
  const location = useLocation();

  // Danh sách các menu item
  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: <NavLink to="/dashboard">Dashboard</NavLink>,
    },
    {
      key: "/list",
      icon: <UnorderedListOutlined />,
      label: <NavLink to="/list">List Items</NavLink>,
    },
    {
      key: "/orders",
      icon: <ShoppingOutlined />,
      label: <NavLink to="/orders">Orders</NavLink>,
    },
    {
      key: "/chat",
      icon: <MessageOutlined />,
      label: <NavLink to="/chat">Messages</NavLink>,
    },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: <NavLink to="/users">Users</NavLink>,
    },
    {
      key: "/vouchers",
      icon: <TagsOutlined />,
      label: <NavLink to="/vouchers">Vouchers</NavLink>,
    },
  ];

  return (
    <Sider width={240} theme="light" className="custom-sidebar" breakpoint="lg">
      <div className="sidebar-logo">
        <h2 className="brand-text">ADMIN PANEL</h2>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        className="main-menu"
      />
    </Sider>
  );
};

export default Sidebar;
