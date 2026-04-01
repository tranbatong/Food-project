import React, { useEffect, useState } from "react";
import "./Users.css";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Card,
} from "antd";

const { Option } = Select;

const Users = ({ url }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [targetUserId, setTargetUserId] = useState(null);

  const [form] = Form.useForm();
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/user/list`, {
        headers: { token },
      });
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        message.error("Lỗi khi tải danh sách");
      }
    } catch (error) {
      message.error("Lỗi kết nối server");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [url, token]);

  const removeUser = async (userId) => {
    try {
      const response = await axios.post(
        `${url}/api/user/remove`,
        { id: userId },
        { headers: { token } },
      );
      if (response.data.success) {
        message.success(response.data.message);
        fetchUsers();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Lỗi khi xóa người dùng");
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setTargetUserId(null);
    form.resetFields();
    form.setFieldsValue({ role: "user" });
    setShowModal(true);
  };

  const openEditModal = (record) => {
    setIsEditMode(true);
    setTargetUserId(record._id);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      password: "",
      role: record.isAdmin ? "admin" : "user",
    });
    setShowModal(true);
  };

  const onSubmitHandler = async (values) => {
    const endpoint = isEditMode
      ? `${url}/api/user/edit`
      : `${url}/api/user/add`;

    const payload = {
      ...values,
      targetUserId: targetUserId,
    };

    try {
      const response = await axios.post(endpoint, payload, {
        headers: { token },
      });
      if (response.data.success) {
        message.success(response.data.message);
        setShowModal(false);
        form.resetFields();
        fetchUsers();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Lỗi khi lưu dữ liệu");
    }
  };

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phân quyền",
      dataIndex: "isAdmin",
      key: "role",
      render: (isAdmin) => (
        <Tag color={isAdmin ? "red" : "blue"}>
          {isAdmin ? "Admin" : "Khách hàng"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" ghost onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa người dùng"
            description="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => removeUser(record._id)}
            okText="Có"
            cancelText="Không"
            disabled={record.isAdmin}
          >
            <Button danger disabled={record.isAdmin}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="users-page">
      <Card
        title="QUẢN LÝ NGƯỜI DÙNG"
        extra={
          <Button type="primary" onClick={openAddModal}>
            Thêm Người Dùng
          </Button>
        }
        className="users-card"
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="full-width-table"
        />
      </Card>

      <Modal
        title={isEditMode ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={() => form.submit()}
        okText="Lưu lại"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={onSubmitHandler}>
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập địa chỉ email" />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              isEditMode ? "Mật khẩu mới (Bỏ trống nếu không đổi)" : "Mật khẩu"
            }
            rules={[
              { required: !isEditMode, message: "Vui lòng nhập mật khẩu" },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Phân quyền"
            rules={[{ required: true, message: "Vui lòng chọn phân quyền" }]}
          >
            <Select>
              <Option value="user">Khách hàng</Option>
              <Option value="admin">Quản trị viên (Admin)</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
