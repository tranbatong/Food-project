import { createContext, useEffect, useState } from "react";
import { food_list } from "../assets/assets";
import { use } from "react";
import axios from "axios";
export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItem] = useState({});

  const url = "http://localhost:4000";
  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [food_list, setFoodList] = useState([]);

  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItem((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItem((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      await axios.post(
        `${url}/api/cart/add`,
        { itemId },
        { headers: { token } },
      );
    }
  };
  const removeFromCart = async (itemId) => {
    setCartItem((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } },
      );
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    const response = await axios.get(`${url}/api/food/list`);
    setFoodList(response.data.data);
  };

  const localCartData = async (token) => {
    const response = await axios.post(
      `${url}/api/cart/get`,
      {},
      { headers: { token } },
    );
    setCartItem(response.data.cartData);
  };
  // Hàm gửi tin nhắn cho Chatbot
  const sendChatMessage = async (message) => {
    try {
      const response = await axios.post(`${url}/api/chatbot/ask`, { message });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gọi chatbot:", error);
      return {
        success: false,
        answer: "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.",
      };
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
        await localCartData(localStorage.getItem("token"));
        const storedIsAdmin = localStorage.getItem("isAdmin") === "true";
        setIsAdmin(storedIsAdmin);
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItem,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    isAdmin,
    setIsAdmin,
    sendChatMessage,
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
