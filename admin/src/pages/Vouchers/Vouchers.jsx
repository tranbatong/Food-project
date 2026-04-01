import React, { useEffect, useState } from "react";
import "./Vouchers.css";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Tag,
  Popconfirm,
  message,
  Card,
} from "antd";

const Vouchers = ({ url }) => {
  const token = localStorage.getItem("token");
  const localIsAdmin = localStorage.getItem("isAdmin");

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/voucher/list`, {
        headers: { token },
      });
      if (response.data.success) {
        setList(response.data.data);
      } else {
        message.error("Lỗi lấy danh sách mã");
      }
    } catch (error) {
      message.error("Lỗi kết nối hoặc không có quyền truy cập");
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkAdminAccess = () => {
      if (!token) {
        message.error("Vui lòng đăng nhập!");
        setLoading(false);
        return;
      }

      if (localIsAdmin === "true") {
        setIsAdmin(true);
        fetchList();
      } else {
        message.error("Bạn không có quyền quản trị viên!");
        setIsAdmin(false);
        setLoading(false);
      }
    };

    checkAdminAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, localIsAdmin]);

  const onSubmitHandler = async (values) => {
    try {
      const response = await axios.post(`${url}/api/voucher/add`, values, {
        headers: { token },
      });
      if (response.data.success) {
        message.success(response.data.message);
        form.resetFields();
        setIsModalOpen(false);
        fetchList();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Lỗi khi thêm mã");
    }
  };

  const removeVoucher = async (voucherId) => {
    try {
      const response = await axios.post(
        `${url}/api/voucher/remove`,
        { id: voucherId },
        { headers: { token } },
      );
      if (response.data.success) {
        message.success(response.data.message);
        fetchList();
      } else {
        message.error("Lỗi khi xóa mã");
      }
    } catch (error) {
      message.error("Lỗi khi xóa mã");
    }
  };

  if (loading && !isAdmin) {
    return <div className="vouchers-page">Đang kiểm tra quyền truy cập...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="vouchers-page">
        <h3 style={{ color: "red" }}>
          Truy cập bị từ chối: Yêu cầu quyền Quản trị viên.
        </h3>
      </div>
    );
  }

  const columns = [
    {
      title: "Mã giảm giá",
      dataIndex: "code",
      key: "code",
      render: (code) => <Tag color="green">{code.toUpperCase()}</Tag>,
    },
    {
      title: "Giảm (%)",
      dataIndex: "discountPercent",
      key: "discountPercent",
      render: (percent) => <b>{percent}%</b>,
      sorter: (a, b) => a.discountPercent - b.discountPercent,
    },
    {
      title: "Giảm tối đa",
      dataIndex: "maxDiscount",
      key: "maxDiscount",
      render: (max) => `$${max.toLocaleString()}`,
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "minAmount",
      key: "minAmount",
      render: (min) => `$${min.toLocaleString()}`,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Xóa mã giảm giá"
          description={`Bạn có chắc muốn xóa mã ${record.code}?`}
          onConfirm={() => removeVoucher(record._id)}
          okText="Có"
          cancelText="Không"
        >
          <Button danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="vouchers-page">
      <Card
        title="QUẢN LÝ MÃ GIẢM GIÁ"
        extra={
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Thêm Mã Mới
          </Button>
        }
        className="vouchers-card"
      >
        <Table
          columns={columns}
          dataSource={list}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          className="full-width-table"
        />
      </Card>

      <Modal
        title="Thêm mã giảm giá mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Thêm Mã"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={onSubmitHandler}>
          <Form.Item
            name="code"
            label="Mã Voucher (VD: GIAM30K)"
            rules={[{ required: true, message: "Vui lòng nhập mã voucher" }]}
          >
            <Input
              placeholder="Nhập mã..."
              style={{ textTransform: "uppercase" }}
            />
          </Form.Item>

          <Space style={{ display: "flex", marginBottom: 8 }} align="baseline">
            <Form.Item
              name="discountPercent"
              label="% Giảm giá"
              rules={[{ required: true, message: "Nhập % giảm" }]}
            >
              <InputNumber
                min={1}
                max={100}
                placeholder="VD: 10"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="maxDiscount"
              label="Giảm tối đa ($)"
              rules={[{ required: true, message: "Nhập mức giảm tối đa" }]}
            >
              <InputNumber
                min={0}
                placeholder="VD: 30"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="minAmount"
              label="Đơn tối thiểu ($)"
              rules={[{ required: true, message: "Nhập đơn tối thiểu" }]}
            >
              <InputNumber
                min={0}
                placeholder="VD: 100"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default Vouchers;
