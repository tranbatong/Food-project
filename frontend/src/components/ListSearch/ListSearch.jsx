import React, { useContext, useEffect, useState } from "react";
import "./ListSearch.css";
import { StoreContext } from "../../context/StoreContext";
import { useSearchParams } from "react-router-dom";
import FoodItem from "../../components/FoodItem/FoodItem";

const ListSearch = () => {
  // Lấy toàn bộ danh sách món ăn từ Context
  const { food_list } = useContext(StoreContext);

  // Lấy từ khóa tìm kiếm từ URL
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  // State để lưu danh sách món ăn đã được lọc
  const [filteredFood, setFilteredFood] = useState([]);

  // Hàm lọc món ăn chạy mỗi khi từ khóa (query) hoặc danh sách món (food_list) thay đổi
  useEffect(() => {
    if (query) {
      const result = food_list.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredFood(result);
    } else {
      setFilteredFood([]); // Nếu không có từ khóa thì hiển thị mảng rỗng
    }
  }, [query, food_list]);

  return (
    <div className="list-search-container">
      <h2>Kết quả tìm kiếm cho: "{query}"</h2>

      {filteredFood.length === 0 ? (
        <p className="no-result">
          Không tìm thấy món ăn nào phù hợp với từ khóa của bạn.
        </p>
      ) : (
        <div className="food-display-list">
          {filteredFood.map((item, index) => {
            return (
              <FoodItem
                key={index}
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ListSearch;
