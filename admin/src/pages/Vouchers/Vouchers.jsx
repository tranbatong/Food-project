import React, { useEffect, useState } from "react";
import "./Vouchers.css";
import axios from "axios";
import { toast } from "react-toastify";

const Vouchers = ({ url }) => {
  const token = localStorage.getItem("token");
  const localIsAdmin = localStorage.getItem("isAdmin"); // Lấy giá trị từ Local Storage

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [data, setData] = useState({
    code: "",
    discountPercent: "",
    maxDiscount: "",
    minAmount: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/voucher/list`, {
        headers: { token },
      });
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Lỗi lấy danh sách mã");
      }
    } catch (error) {
      toast.error("Lỗi kết nối hoặc không có quyền truy cập");
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${url}/api/voucher/add`, data, {
        headers: { token },
      });
      if (response.data.success) {
        setData({
          code: "",
          discountPercent: "",
          maxDiscount: "",
          minAmount: "",
        });
        await fetchList();
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi thêm mã");
    }
  };

  const removeVoucher = async (voucherId) => {
    try {
      const response = await axios.post(
        `${url}/api/voucher/remove`,
        { id: voucherId },
        {
          headers: { token },
        },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error("Lỗi khi xóa mã");
      }
    } catch (error) {
      toast.error("Lỗi khi xóa mã");
    }
  };

  useEffect(() => {
    const checkAdminAccess = () => {
      if (!token) {
        toast.error("Vui lòng đăng nhập!");
        setLoading(false);
        return;
      }

      // Kiểm tra trực tiếp biến localIsAdmin
      if (localIsAdmin === "true") {
        setIsAdmin(true);
        fetchList();
      } else {
        toast.error("Bạn không có quyền quản trị viên!");
        setIsAdmin(false);
      }

      setLoading(false);
    };

    checkAdminAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, localIsAdmin]);

  if (loading) {
    return (
      <div className="vouchers-container">Đang kiểm tra quyền truy cập...</div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="vouchers-container">
        <h3 style={{ color: "red" }}>
          Truy cập bị từ chối: Yêu cầu quyền Quản trị viên.
        </h3>
      </div>
    );
  }

  return (
    <div className="vouchers-container">
      <div className="add-voucher">
        <form className="flex-col" onSubmit={onSubmitHandler}>
          <h3>Thêm mã giảm giá mới</h3>
          <div className="add-voucher-input-group">
            <div className="add-voucher-code flex-col">
              <p>Mã Voucher (VD: GIAM30K)</p>
              <input
                onChange={onChangeHandler}
                value={data.code}
                type="text"
                name="code"
                placeholder="Nhập mã..."
                required
              />
            </div>
            <div className="add-voucher-percent flex-col">
              <p>% Giảm giá</p>
              <input
                onChange={onChangeHandler}
                value={data.discountPercent}
                type="number"
                name="discountPercent"
                placeholder="VD: 10"
                required
              />
            </div>
          </div>
          <div className="add-voucher-input-group">
            <div className="add-voucher-max flex-col">
              <p>Giảm tối đa ($)</p>
              <input
                onChange={onChangeHandler}
                value={data.maxDiscount}
                type="number"
                name="maxDiscount"
                placeholder="VD: 30"
                required
              />
            </div>
            <div className="add-voucher-min flex-col">
              <p>Đơn tối thiểu ($)</p>
              <input
                onChange={onChangeHandler}
                value={data.minAmount}
                type="number"
                name="minAmount"
                placeholder="VD: 100"
                required
              />
            </div>
          </div>
          <button type="submit" className="add-btn">
            THÊM MÃ
          </button>
        </form>
      </div>

      <hr />

      <div className="list-vouchers flex-col">
        <h3>Danh sách mã giảm giá</h3>
        <div className="voucher-table">
          <div className="voucher-table-header">
            <b>Mã</b>
            <b>Giảm (%)</b>
            <b>Giảm tối đa</b>
            <b>Đơn tối thiểu</b>
            <b>Hành động</b>
          </div>
          {list.map((item, index) => {
            return (
              <div key={index} className="voucher-table-item">
                <p>{item.code}</p>
                <p>{item.discountPercent}%</p>
                <p>${item.maxDiscount.toLocaleString()}</p>
                <p>${item.minAmount.toLocaleString()}</p>
                <p onClick={() => removeVoucher(item._id)} className="cursor">
                  Xóa
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Vouchers;
