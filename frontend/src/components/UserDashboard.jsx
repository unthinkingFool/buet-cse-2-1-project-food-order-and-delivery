import React, { useEffect, useState } from "react";

import Nav from "./Nav";
import CategoryCard from "./CategoryCard";
import { categories } from "../Categories.js";

import { useSelector } from "react-redux";
import { motion } from "framer-motion";

import FoodCard from "./FoodCard.jsx";

import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";

import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const navigate = useNavigate();

  const { city, shopsInMyCity, itemsInMyCity, searchItems, userData } = useSelector(
    (state) => state.user,
  );

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
  useEffect(()=>{
    console.log(userData)
  })

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* ======================================================
        SEARCH RESULTS
    ====================================================== */}

        {normalizedSearchItems.length > 0 && (
          <motion.div
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36] mb-2">
                  Results
                </p>

                <h1 className="text-2xl font-black text-[#1F2023]">
                  Search Results
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  {normalizedSearchItems.length}{" "}
                  {normalizedSearchItems.length === 1 ? "item" : "items"} found
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center sm:place-items-stretch">
              {normalizedSearchItems.map((item) => (
                <FoodCard data={item} key={`search-${item.id}`} />
              ))}
            </div>
          </motion.div>
        )}

       

        {/* ======================================================
        CATEGORIES
    ====================================================== */}

        <motion.div
          custom={1}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36] mb-2">
                Explore
              </p>

              <h1 className="text-2xl font-black text-[#1F2023]">
                Things You Will Enjoy
              </h1>
            </div>

            <button
              onClick={showAllItems}
              className="text-xs font-bold uppercase tracking-wide text-[#FF5A36] hover:underline cursor-pointer"
            >
              All Items
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#1F2023] bg-white text-[#1F2023]">
              <ChevronLeft className="h-4 w-4" />
            </div>

            <div className="flex gap-4 overflow-x-auto pb-1 flex-1 scrollbar-hide">
              {categories.map((cate, index) => (
                <CategoryCard
                  key={index}
                  onClick={() => updateFilterByCategory(cate.category)}
                  name={cate.category}
                  image={cate.image}
                />
              ))}
            </div>

            <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#1F2023] bg-white text-[#1F2023]">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </motion.div>

        {/* ======================================================
        RESTAURANTS
    ====================================================== */}

        <motion.div
          custom={2}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36] mb-2">
            Nearby
          </p>

          <h1 className="text-2xl font-black text-[#1F2023] mb-5">
            Browse The Best Restaurants in {city}
          </h1>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#1F2023] bg-white text-[#1F2023]">
              <ChevronLeft className="h-4 w-4" />
            </div>

            <div className="flex gap-4 overflow-x-auto pb-1 flex-1 scrollbar-hide">
              {shopsInMyCity?.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => navigate(`/restaurant/${shop.id}`)}
                  className="cursor-pointer"
                >
                  <CategoryCard name={shop.name} image={shop.image_link} />
                </div>
              ))}
            </div>

            <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#1F2023] bg-white text-[#1F2023]">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </motion.div>

        {/* ======================================================
        FOOD ITEMS
    ====================================================== */}

        <motion.div
          custom={3}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36] mb-2">
            Menu
          </p>

          <h1 className="text-2xl font-black text-[#1F2023] mb-5">
            Food You Can Order in {city}
          </h1>

          {updatedItemsList?.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center sm:place-items-stretch">
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
    </motion.div>
  );
}

export default UserDashboard;
