import React, { useState } from "react";

import { Star, Flame, Minus, Plus, ShoppingCart, Leaf } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import { motion } from "framer-motion";

import { addToCart } from "../redux/userSlice";

import useGetItemTotalSold from "../hooks/useGetItemTotalSold";

function FoodCard({ data }) {
  const [quantity, setquantity] = useState(0);

  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.user);

  // Get actual total sold from ORDER_ITEM
  const { totalSold, loading: totalSoldLoading } = useGetItemTotalSold(data.id);

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    setquantity(newQuantity);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      setquantity(newQuantity);
    } else {
      setquantity(quantity);
    }
  };

  const isVeg = data.food_type == "veg";

  const isAvailable = data.isavailable !== false;

  return (
    <motion.div
      whileHover={{
        x: 2,
        y: 2,
        boxShadow: "1px 1px 0px 0px #1F2023",
      }}
      style={{
        boxShadow: "3px 3px 0px 0px #1F2023",
      }}
      className="w-full max-w-[260px] border-2 border-[#1F2023] bg-white overflow-hidden transition-shadow"
    >
      {/* image + veg/non-veg badge */}
      <div className="relative h-36 w-full bg-gray-100">
        <div
          className={`absolute top-2 left-2 z-10 flex items-center gap-1 px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-white border-2 ${
            isVeg
              ? "border-green-500 text-green-600"
              : "border-red-500 text-red-600"
          }`}
        >
          <Leaf className="h-3 w-3" />

          {isVeg ? "veg" : "non-veg"}
        </div>

        <img
          src={data.image_link}
          alt={data.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* details */}
      <div className="p-3.5">
        <h1 className="text-sm font-black text-[#1F2023] truncate">
          {data.name}
        </h1>

        <h2 className="text-xs text-gray-500 mt-0.5 line-clamp-2 min-h-[2rem]">
          {data.description}
        </h2>

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {/* Rating */}
          <span className="flex items-center gap-1 font-bold text-[#1F2023]">
            <Star className="h-3.5 w-3.5 fill-[#FF5A36] text-[#FF5A36]" />

            {data.rating == null ? 0 : data.rating}
          </span>

          {/* Total Sold */}
          <span className="flex items-center gap-1">
            <Flame className="h-3.5 w-3.5" />
            {totalSoldLoading ? "..." : totalSold} sold
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          <h1 className="text-base font-black text-[#1F2023]">৳{data.price}</h1>

          {data.discount_price && (
            <h2 className="text-xs text-gray-400 line-through">
              ৳{data.discount_price}
            </h2>
          )}
        </div>

        <h2 className="text-[11px] text-gray-400 mt-0.5 truncate">
          {data.restaurant_name}
        </h2>

        {/* quantity stepper */}
        <div className="flex items-center justify-between mt-3 border-2 border-gray-200 px-2 py-1.5">
          <button
            onClick={handleDecrease}
            disabled={!isAvailable}
            aria-label="add less"
            className="h-6 w-6 flex items-center justify-center text-[#1F2023] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <h1 className="text-sm font-bold text-[#1F2023] w-6 text-center">
            {quantity}
          </h1>

          <button
            onClick={handleIncrease}
            disabled={!isAvailable}
            aria-label="add more"
            className="h-6 w-6 flex items-center justify-center text-[#1F2023] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* add to cart */}
        <div className="mt-2">
          <motion.button
            whileHover={
              isAvailable
                ? {
                    x: 1,
                    y: 1,
                    boxShadow: "1px 1px 0px 0px #1F2023",
                  }
                : {}
            }
            whileTap={
              isAvailable
                ? {
                    x: 2,
                    y: 2,
                    boxShadow: "0px 0px 0px 0px #1F2023",
                  }
                : {}
            }
            disabled={!isAvailable}
            onClick={() => {
              if (quantity > 0) {
                dispatch(
                  addToCart({
                    id: data.id,
                    name: data.name,
                    price: data.price,
                    image: data.image_link,
                    restaurant: data.restaurant_name,
                    restaurant_id: data.restaurant_id,
                    quantity,
                    food_type: data.food_type,
                  }),
                );
              }
            }}
            style={{
              boxShadow: isAvailable ? "3px 3px 0px 0px #1F2023" : "none",
            }}
            className={`${
              !isAvailable
                ? "bg-gray-300 cursor-not-allowed"
                : cartItems.some((i) => i.id == data.id)
                  ? "bg-[#1F2023]"
                  : "bg-[#FF5A36]"
            } w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold uppercase tracking-wide text-white transition`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />

            {!isAvailable ? "Unavailable" : "Add to cart"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default FoodCard;
