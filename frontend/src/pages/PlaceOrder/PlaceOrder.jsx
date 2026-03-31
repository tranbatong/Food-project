import { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } =
    useContext(StoreContext);

  const navigate = useNavigate();
  const location = useLocation();

  // Lấy thông tin giảm giá được truyền từ trang Cart sang (nếu có)
  const discountInfo = location.state?.discountInfo || {
    code: "",
    discountAmount: 0,
  };

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  // Tính toán lại tổng tiền cuối cùng
  const deliveryFee = getTotalCartAmount() === 0 ? 0 : 2;
  const finalTotal = Math.max(
    0,
    getTotalCartAmount() === 0
      ? 0
      : getTotalCartAmount() + deliveryFee - discountInfo.discountAmount,
  );

  const placeOrder = async (event) => {
    event.preventDefault();

    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item };
        itemInfo.quantity = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    let orderData = {
      address: data,
      items: orderItems,
      amount: finalTotal, // Gửi tổng tiền ĐÃ TRỪ GIẢM GIÁ lên server
      discountAmount: discountInfo.discountAmount, // Gửi số tiền giảm để server lưu vào database cho MyOrders đọc
    };

    try {
      let response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { token },
      });
      if (response.data.success) {
        const { session_url } = response.data;
        window.location.replace(session_url);
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("An error occurred during payment processing.");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
    } else if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token, navigate, getTotalCartAmount]);

  return (
    <div>
      <form onSubmit={placeOrder} className="place-order">
        <div className="place-order-left">
          <p className="title">Delivery Information</p>
          <div className="multi-fields">
            <input
              required
              type="text"
              name="firstName"
              placeholder="First Name"
              value={data.firstName}
              onChange={onChangeHandler}
            />
            <input
              required
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={data.lastName}
              onChange={onChangeHandler}
            />
          </div>
          <input
            required
            type="email"
            name="email"
            placeholder="Email address"
            value={data.email}
            onChange={onChangeHandler}
          />
          <input
            required
            type="text"
            name="street"
            placeholder="Street"
            value={data.street}
            onChange={onChangeHandler}
          />
          <div className="multi-fields">
            <input
              required
              type="text"
              name="city"
              placeholder="City"
              value={data.city}
              onChange={onChangeHandler}
            />
            <input
              required
              type="text"
              name="state"
              placeholder="State"
              value={data.state}
              onChange={onChangeHandler}
            />
          </div>
          <div className="multi-fields">
            <input
              required
              type="text"
              name="zipCode"
              placeholder="Zip code"
              value={data.zipCode}
              onChange={onChangeHandler}
            />
            <input
              required
              type="text"
              name="country"
              placeholder="Country"
              value={data.country}
              onChange={onChangeHandler}
            />
          </div>
          <input
            required
            type="text"
            name="phone"
            placeholder="Phone number"
            value={data.phone}
            onChange={onChangeHandler}
          />
        </div>
        <div className="place-order-right">
          <div className="cart-total">
            <h2>Cart Totals</h2>
            <div>
              <div className="cart-total-details">
                <p>Subtotal</p>
                <p>
                  <strong>$</strong>
                  {getTotalCartAmount()}
                </p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>
                  <strong>$</strong>
                  {deliveryFee}
                </p>
              </div>
              <hr />

              {/* Hiển thị phần giảm giá nếu có */}
              {discountInfo.discountAmount > 0 && (
                <>
                  <div className="cart-total-details">
                    <p>Discount ({discountInfo.code})</p>
                    <p style={{ color: "red" }}>
                      <strong>-$</strong>
                      {discountInfo.discountAmount.toFixed(2)}
                    </p>
                  </div>
                  <hr />
                </>
              )}

              <div className="cart-total-details">
                <b>Total</b>
                <b>
                  <strong>$</strong>
                  {finalTotal.toFixed(2)}
                </b>
              </div>
            </div>
            <button type="submit">PROCEED TO PAYMENT</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;
