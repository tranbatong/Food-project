import React, { useEffect, useState } from "react";
import "./Users.css";
import axios from "axios";
import { toast } from "react-toastify";

const Users = ({ url }) => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  // State quản lý hiển thị Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // State lưu trữ dữ liệu form
  const [formData, setFormData] = useState({
    targetUserId: "",
    name: "",
    email: "",
    password: "",
    role: "user", // Mặc định là khách hàng
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${url}/api/user/list`, {
        headers: { token },
      });
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách");
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [url, token]);

  const removeUser = async (userId) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa người dùng này?",
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.post(
        `${url}/api/user/remove`,
        { id: userId },
        { headers: { token } },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa");
    }
  };

  // Hàm mở Modal để Thêm mới
  const openAddModal = () => {
    setFormData({
      targetUserId: "",
      name: "",
      email: "",
      password: "",
      role: "user",
    });
    setIsEditMode(false);
    setShowModal(true);
  };

  // Hàm mở Modal để Chỉnh sửa
  const openEditModal = (user) => {
    setFormData({
      targetUserId: user._id,
      name: user.name,
      email: user.email,
      password: "", // Bỏ trống, nếu Admin nhập thì mới đổi mật khẩu
      role: user.isAdmin ? "admin" : "user",
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  // Lắng nghe sự thay đổi của các ô input
  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  // Xử lý khi nhấn nút Lưu trong Modal
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const endpoint = isEditMode
      ? `${url}/api/user/edit`
      : `${url}/api/user/add`;

    try {
      const response = await axios.post(endpoint, formData, {
        headers: { token },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setShowModal(false);
        fetchUsers(); // Tải lại danh sách
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xử lý dữ liệu");
    }
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <h3>Quản lý người dùng</h3>
        <button onClick={openAddModal} className="add-btn">
          Thêm Người Dùng
        </button>
      </div>

      <div className="users-table">
        <div className="users-table-title">
          <b>Tên</b>
          <b>Email</b>
          <b>Phân quyền</b>
          <b>Hành động</b>
        </div>
        {users.map((user, index) => (
          <div key={index} className="users-table-item">
            <p>{user.name}</p>
            <p>{user.email}</p>
            <p>{user.isAdmin ? "Admin" : "Khách hàng"}</p>
            <div className="action-buttons">
              <button onClick={() => openEditModal(user)} className="edit-btn">
                Sửa
              </button>
              <button
                onClick={() => removeUser(user._id)}
                className="delete-btn"
                disabled={user.isAdmin}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cửa sổ bật lên (Modal) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              {isEditMode ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
            </h2>
            <form onSubmit={onSubmitHandler} className="modal-form">
              <div className="input-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  name="name"
                  onChange={onChangeHandler}
                  value={formData.name}
                  required
                />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  onChange={onChangeHandler}
                  value={formData.email}
                  required
                />
              </div>
              <div className="input-group">
                <label>
                  {isEditMode
                    ? "Mật khẩu mới (Bỏ trống nếu không đổi)"
                    : "Mật khẩu"}
                </label>
                <input
                  type="password"
                  name="password"
                  onChange={onChangeHandler}
                  value={formData.password}
                  required={!isEditMode}
                />
              </div>
              <div className="input-group">
                <label>Phân quyền</label>
                <select
                  name="role"
                  onChange={onChangeHandler}
                  value={formData.role}
                >
                  <option value="user">Khách hàng</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cancel-btn"
                >
                  Hủy
                </button>
                <button type="submit" className="save-btn">
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
