import React, { useEffect, useRef } from "react";
import Nav from "./Nav";
import CategoryCard from "./CategoryCard";
import { categories } from "../Categories.js";
import { useSelector } from "react-redux";
import useGetItemsByCity from "../hooks/useGetItemsByCity";
import FoodCard from "./FoodCard.jsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

function UserDashboard() {
  const { city, shopsInMyCity, itemsInMyCity } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Nav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* categories */}
        <div>
          <h1 className="text-xl font-bold text-[#1F2023] mb-4">Things You Will Enjoy</h1>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm">
              <ChevronLeft className="h-4 w-4" />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-1 flex-1 scrollbar-hide">
              {categories.map((cate, index) => (
                <CategoryCard name={cate.category} image={cate.image} key={index} />
              ))}
            </div>
            <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* shops */}
        <div>
          <h1 className="text-xl font-bold text-[#1F2023] mb-4">
            Browse The Best Restaurants in : {city}
          </h1>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm">
              <ChevronLeft className="h-4 w-4" />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-1 flex-1 scrollbar-hide">
              {shopsInMyCity?.map((shop, index) => (
                <CategoryCard name={shop.name} image={shop.image_link} key={index} />
              ))}
            </div>
            <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* food items */}
        <div>
          <h1 className="text-xl font-bold text-[#1F2023] mb-4">
            Food You Can Order in {city}
          </h1>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center sm:place-items-stretch">
            {itemsInMyCity.map((item, index) => (
              <FoodCard data={item} key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;