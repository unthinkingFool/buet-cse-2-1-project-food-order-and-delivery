import React, { useEffect, useState } from "react";

import Nav from "./Nav";
import CategoryCard from "./CategoryCard";
import { categories } from "../Categories.js";

import { useSelector } from "react-redux";
import { motion } from "framer-motion";

import FoodCard from "./FoodCard.jsx";

import { LayoutGrid, MapPin, Search, Store } from "lucide-react";

import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const navigate = useNavigate();

  const { city, shopsInMyCity, itemsInMyCity, searchItems, userData } =
    useSelector((state) => state.user);

  const [updatedItemsList, setUpdatedItemsList] = useState([]);

  /* ============================================================
INITIAL MENU
============================================================ */

  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity || []);
  }, [itemsInMyCity]);

  /* ============================================================
NORMALIZE SEARCH RESULTS

```
 Search API returns:
 item_id
 item_name
 item_image
 item_description
 item_rating
 
 FoodCard expects:
 id
 name
 image_link
 description
 rating
```

============================================================ */

  const normalizedSearchItems = (searchItems || []).map((item) => ({
    id: item.item_id,
    name: item.item_name,
    category: item.category,
    food_type: item.food_type,

    description: item.item_description,

    price: item.price,
    discount_price: item.discount_price,

    image_link: item.item_image,

    rating: item.item_rating,
    total_sold: item.total_sold || 0,
    isavailable: item.isavailable,

    restaurant_id: item.restaurant_id,
    restaurant_name: item.restaurant_name,
    restaurant_image: item.restaurant_image,
    restaurant_description: item.restaurant_description,
    restaurant_address: item.restaurant_address,
    restaurant_city: item.restaurant_city,
    restaurant_latitude: item.restaurant_latitude,
    restaurant_longitude: item.restaurant_longitude,
    restaurant_rating: item.restaurant_rating,
  }));

  /* ============================================================
FILTER BY CATEGORY
============================================================ */

  const updateFilterByCategory = (category) => {
    const filteredList = (itemsInMyCity || []).filter(
      (item) => item.category === category,
    );

    setUpdatedItemsList(filteredList);
  };

  /* ============================================================
SHOW ALL ITEMS
============================================================ */

  const showAllItems = () => {
    setUpdatedItemsList(itemsInMyCity || []);
  };

  /* ============================================================
ANIMATION
============================================================ */

  const sectionVariants = {
    hidden: {
      opacity: 0,
      y: 16,
    },

    visible: (i) => ({
      opacity: 1,
      y: 0,

      transition: {
        delay: 0.1 + i * 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  };
  useEffect(() => {
    console.log(userData);
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{
        duration: 0.35,
        ease: "easeInOut",
      }}
      className="min-h-screen bg-[#FAFAF8]"
    >
      {" "}
      <Nav />
      {/* ======================================================
      WELCOME STRIP
  ====================================================== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white"
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#1F2023]">
              What are you craving today?
            </h1>
          </div>
        </div>
      </motion.div>
      {/* ======================================================
      THREE-COLUMN DASHBOARD BODY
  ====================================================== */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)_240px] gap-6 items-start">
          {/* ==================================================
          COLUMN 1 — CATEGORIES RAIL
      ================================================== */}
          <motion.div
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="lg:sticky lg:top-24"
          >
            <div className="border-2 border-[#1F2023] bg-white">
              <div className="flex items-center gap-2 border-b-2 border-[#1F2023] px-4 py-3 bg-[#1F2023]">
                <LayoutGrid className="h-4 w-4 text-[#FF5A36]" />
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-white">
                  Categories
                </h2>
              </div>

              <button
                onClick={showAllItems}
                className="w-full text-left px-4 py-3 text-sm font-bold text-[#1F2023] border-b border-gray-100 hover:bg-[#FAFAF8] transition-colors cursor-pointer"
              >
                All Items
              </button>

              <div className="flex lg:flex-col gap-0 overflow-x-auto lg:overflow-visible">
                {categories.map((cate, index) => (
                  <button
                    key={index}
                    onClick={() => updateFilterByCategory(cate.category)}
                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-[#FAFAF8] transition-colors text-left shrink-0 lg:shrink cursor-pointer"
                  >
                    <img
                      src={cate.image}
                      alt={cate.category}
                      className="h-8 w-8 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                    <span className="text-sm font-medium text-[#1F2023] truncate">
                      {cate.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ==================================================
          COLUMN 2 — MAIN FEED (search results + menu)
      ================================================== */}
          <div className="space-y-10 min-w-0">
            {/* SEARCH RESULTS */}
            {normalizedSearchItems.length > 0 && (
              <motion.div
                custom={1}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex items-center gap-2 mb-5">
                  <Search className="h-4 w-4 text-[#FF5A36]" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36]">
                      Results
                    </p>
                    <h2 className="text-xl font-black text-[#1F2023] -mt-0.5">
                      Search Results
                    </h2>
                  </div>
                  <span className="ml-auto text-xs font-bold text-gray-400">
                    {normalizedSearchItems.length}{" "}
                    {normalizedSearchItems.length === 1 ? "item" : "items"}{" "}
                    found
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 justify-items-center">
                  {normalizedSearchItems.map((item) => (
                    <FoodCard data={item} key={`search-${item.id}`} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* FOOD ITEMS */}
            <motion.div
              custom={2}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36] mb-2">
                Explore The Best In City
              </p>
              <h1 className="text-2xl font-black text-[#1F2023] mb-5">
                Food You Can Order in {city}
              </h1>

              {updatedItemsList?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 justify-items-center">
                  {updatedItemsList.map((item) => (
                    <FoodCard data={item} key={`menu-${item.id}`} />
                  ))}
                </div>
              ) : (
                <div className="border-2 border-[#1F2023] bg-white p-8 text-center">
                  <h2 className="text-lg font-black text-[#1F2023]">
                    No food items available
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    There are currently no available food items in {city}.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* ==================================================
          COLUMN 3 — NEARBY RESTAURANTS RAIL
      ================================================== */}
          <motion.div
            custom={3}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="lg:sticky lg:top-24"
          >
            <div className="border-2 border-[#1F2023] bg-white">
              <div className="flex items-center gap-2 border-b-2 border-[#1F2023] px-4 py-3 bg-[#1F2023]">
                <Store className="h-4 w-4 text-[#FF5A36]" />
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-white">
                  Nearby in {city}
                </h2>
              </div>

              <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
                {shopsInMyCity?.length > 0 ? (
                  shopsInMyCity.map((shop) => (
                    <div
                      key={shop.id}
                      onClick={() => navigate(`/restaurant/${shop.id}`)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                    >
                      <img
                        src={shop.image_link}
                        alt={shop.name}
                        className="h-11 w-11 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                      <span className="text-sm font-bold text-[#1F2023] truncate">
                        {shop.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-xs text-gray-400">
                      No restaurants nearby yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default UserDashboard;
