import React, { useEffect, useState } from "react";
import "./List.css";
import axios from "axios";
import {
  Table,
  Button,
  Space,
  Image,
  Tag,
  Popconfirm,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Select,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [image, setImage] = useState(false);
  const [form] = Form.useForm();

  // 1. Fetch dữ liệu
  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        message.error("Không thể lấy danh sách món ăn");
      }
    } catch (error) {
      message.error("Lỗi kết nối server");
    }
    setLoading(false);
  };

  // 2. Xóa món ăn
  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, {
        id: foodId,
      });
      if (response.data.success) {
        message.success(response.data.message);
        await fetchList();
      } else {
        message.error("Lỗi khi xóa");
      }
    } catch (error) {
      message.error("Lỗi hệ thống");
    }
  };

  // 3. Thêm món ăn mới (Submit Form)
  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description || "No description");
    formData.append("price", Number(values.price));
    formData.append("category", values.category);
    formData.append("image", image);

    try {
      const response = await axios.post(`${url}/api/food/add`, formData);
      if (response.data.success) {
        message.success(response.data.message);
        // Reset form và đóng modal
        form.resetFields();
        setImage(false);
        setIsModalOpen(false);
        await fetchList();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Lỗi khi thêm món ăn");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Cấu hình các cột của bảng
  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (text, record) => (
        <Image
          width={60}
          height={60}
          className="food-img-table"
          src={`${url}/images/${record.image}`}
          fallback="https://placehold.co/60x60?text=No+Image"
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => <b style={{ color: "#f5222d" }}>${price}</b>,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Xóa món ăn"
          description="Bạn có chắc chắn muốn xóa món này không?"
          onConfirm={() => removeFood(record._id)}
          okText="Có"
          cancelText="Không"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>All Foods List</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          size="large"
        >
          Add New Food
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={list}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 6 }}
      />

      {/* Modal chứa Form Add Item */}
      <Modal
        title="Add New Food Item"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
        okText="Add Item"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Upload Image" required>
            <Upload
              beforeUpload={(file) => {
                setImage(file);
                return false; // Ngăn không cho tự động upload
              }}
              maxCount={1}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Type here..." />
          </Form.Item>

          <Form.Item name="description" label="Product Description">
            <Input.TextArea rows={3} placeholder="Write content here..." />
          </Form.Item>

          <div style={{ display: "flex", gap: "20px" }}>
            <Form.Item
              name="category"
              label="Category"
              style={{ flex: 1 }}
              rules={[{ required: true }]}
            >
              <Select placeholder="Select category">
                <Option value="Salad">Salad</Option>
                <Option value="Rolls">Rolls</Option>
                <Option value="Deserts">Deserts</Option>
                <Option value="Sandwich">Sandwich</Option>
                <Option value="Cake">Cake</Option>
                <Option value="Pure Veg">Pure Veg</Option>
                <Option value="Pasta">Pasta</Option>
                <Option value="Noodles">Noodles</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="price"
              label="Product Price"
              style={{ flex: 1 }}
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} prefix="$" min={0} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default List;
