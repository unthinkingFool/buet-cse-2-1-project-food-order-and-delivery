import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

import Nav from "./Nav.jsx";
import useMyItems from "../hooks/useMyItems.jsx";

import axios from "axios";
import { serverUrl } from "../App";
import {
  deleteItem,
  setRestaurantStatus,
  updateItemAvailability,
} from "../redux/ownerSlice";
import {
  Store,
  Pencil,
  Trash2,
  Plus,
  Phone,
  MapPin,
  Loader2,
} from "lucide-react";

function OwnerDashboard() {
  const { restaurantData, items } = useSelector((state) => state.owner);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useMyItems();

  // UI-only addition (does not affect the request/logic itself)
  const [deletingId, setdeletingId] = useState(null);

  const handleDeleteItem = async (itemId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?",
    );

    if (!confirmDelete) {
      return;
    }

    setdeletingId(itemId);
    try {
      const result = await axios.delete(
        `${serverUrl}/api/item/delete-item/${itemId}`,
        {
          withCredentials: true,
        },
      );

      console.log(result.data);

      // Remove item from Redux
      dispatch(deleteItem(itemId));
    } catch (error) {
      console.log("error while deleting item : ", error);
    } finally {
      setdeletingId(null);
    }
  };
  const handleToggleItemAvailability = async (itemId) => {
    try {
      const result = await axios.patch(
        `${serverUrl}/api/item/toggle-availability/${itemId}`,
        {},
        {
          withCredentials: true,
        },
      );

      console.log(result.data);

      // Update the item in Redux
      dispatch(
        updateItemAvailability({
          itemId,
          isavailable: result.data.item.isavailable,
        }),
      );
    } catch (error) {
      console.log("error while changing item availability:", error);
    }
  };

  const handleToggleRestaurantStatus = async () => {
    try {
      const result = await axios.patch(
        `${serverUrl}/api/restaurant/toggle-status`,
        {},
        {
          withCredentials: true,
        },
      );

      console.log(result.data);

      dispatch(setRestaurantStatus(result.data.restaurant.status));
    } catch (error) {
      console.log("error while changing restaurant status:", error);
    }
  };

  // ==========================================
  // ANIMATION VARIANTS
  // ==========================================
  const sectionVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.1 + i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.05 * i, duration: 0.3, ease: "easeOut" },
    }),
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Nav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* no restaurant yet — onboarding state */}
        {!restaurantData && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
            className="flex flex-col items-center justify-center text-center border-2 border-dashed border-[#1F2023] bg-white py-20 px-6"
          >
            <div className="h-14 w-14 bg-[#FFF1EC] border-2 border-[#1F2023] flex items-center justify-center mb-4">
              <Store className="h-7 w-7 text-[#FF5A36]" />
            </div>
            <h1 className="text-xl font-black text-[#1F2023]">
              Add Your Restaurant
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Join our platform to serve delicious food
            </p>
            <motion.button
              whileHover={{ x: 1, y: 1, boxShadow: "1px 1px 0px 0px #1F2023" }}
              whileTap={{ x: 2, y: 2, boxShadow: "0px 0px 0px 0px #1F2023" }}
              onClick={() => {
                navigate("/create-edit-restaurant");
              }}
              style={{ boxShadow: "3px 3px 0px 0px #1F2023" }}
              className="mt-6 flex items-center gap-2 bg-[#FF5A36] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition cursor-pointer"
            >
              Get Started
            </motion.button>
          </motion.div>
        )}

        {/* restaurant dashboard */}
        {restaurantData && (
          <div className="space-y-8">
            <motion.div
              custom={0}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <h1 className="text-2xl font-black text-[#1F2023]">
                Welcome to {restaurantData.restaurant.name}
              </h1>
              <motion.button
                whileHover={{ x: 1, y: 1, boxShadow: "1px 1px 0px 0px #1F2023" }}
                whileTap={{ x: 2, y: 2, boxShadow: "0px 0px 0px 0px #1F2023" }}
                onClick={handleToggleRestaurantStatus}
                style={{ boxShadow: "3px 3px 0px 0px #1F2023" }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-white transition cursor-pointer ${
                  restaurantData.restaurant.status === "open"
                    ? "bg-[#FF5A36]"
                    : "bg-gray-500"
                }`}
              >
                {restaurantData.restaurant.status === "open" ? (
                  <>
                    <Store className="h-4 w-4" />
                    Open
                  </>
                ) : (
                  <>
                    <Store className="h-4 w-4" />
                    Closed
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* restaurant profile card */}
            <motion.div
              custom={1}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
              className="border-2 border-[#1F2023] bg-white overflow-hidden"
            >
              <div className="relative h-40 sm:h-48 w-full bg-gray-100">
                <img
                  src={restaurantData.restaurant.image_link}
                  alt="My Restaurant"
                  className="h-full w-full object-cover"
                />
                <motion.button
                  whileHover={{ x: 1, y: 1, boxShadow: "1px 1px 0px 0px #1F2023" }}
                  whileTap={{ x: 2, y: 2, boxShadow: "0px 0px 0px 0px #1F2023" }}
                  onClick={() => {
                    navigate("/create-edit-restaurant");
                  }}
                  style={{ boxShadow: "3px 3px 0px 0px #1F2023" }}
                  className="absolute top-3 right-3 flex items-center gap-1.5 border-2 border-[#1F2023] bg-white/95 backdrop-blur px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#1F2023] transition cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Restaurant
                </motion.button>
              </div>

              <div className="p-5">
                <h1 className="text-lg font-black text-[#1F2023]">
                  {restaurantData.restaurant.name}
                </h1>
                <h2 className="text-sm text-gray-500 mt-1">
                  {restaurantData.restaurant.description}
                </h2>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#FF5A36]" />
                    {restaurantData.restaurant.contact_no}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#FF5A36]" />
                    {restaurantData.restaurant.address}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* FOOD ITEMS */}
            <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-[#1F2023]">
                  My Food Items
                </h2>
                <motion.button
                  whileHover={{ x: 1, y: 1, boxShadow: "1px 1px 0px 0px #1F2023" }}
                  whileTap={{ x: 2, y: 2, boxShadow: "0px 0px 0px 0px #1F2023" }}
                  onClick={() => {
                    navigate("/add-food");
                  }}
                  style={{ boxShadow: "3px 3px 0px 0px #1F2023" }}
                  className="flex items-center gap-1.5 bg-[#FF5A36] px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-white transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add Food
                </motion.button>
              </div>

              {items.length === 0 ? (
                <div className="border-2 border-dashed border-[#1F2023] bg-white py-12 text-center">
                  <p className="text-sm text-gray-500">
                    You haven't added any food items yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ x: 2, y: 2, boxShadow: "1px 1px 0px 0px #1F2023" }}
                      style={{ boxShadow: "3px 3px 0px 0px #1F2023" }}
                      className="border-2 border-[#1F2023] bg-white overflow-hidden transition-shadow"
                    >
                      <div className="h-32 w-full bg-gray-100">
                        <img
                          src={item.image_link}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="p-3.5">
                        <h3 className="text-sm font-black text-[#1F2023] truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wide bg-[#FAFAF8] border-2 border-gray-200 px-2 py-0.5 text-[#1F2023]">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wide bg-[#FAFAF8] border-2 border-gray-200 px-2 py-0.5 text-[#1F2023]">
                            {item.food_type}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2 mt-2">
                          <p className="text-sm font-black text-[#1F2023]">
                            ৳{item.price}
                          </p>
                          {item.discount_price && (
                            <p className="text-xs text-gray-400 line-through">
                              ৳{item.discount_price}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => navigate(`/edit-item/${item.id}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 border-2 border-gray-200 py-2 text-xs font-bold uppercase tracking-wide text-[#1F2023] transition hover:border-[#FF5A36] hover:text-[#FF5A36] cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleToggleItemAvailability(item.id)
                            }
                            className={`flex-1 border-2 py-2 text-xs font-bold uppercase tracking-wide transition cursor-pointer ${
                              item.isavailable
                                ? "border-green-200 text-green-600 hover:bg-green-50"
                                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {item.isavailable ? "Available" : "Unavailable"}
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={deletingId === item.id}
                            className="flex-1 flex items-center justify-center gap-1.5 border-2 border-red-200 py-2 text-xs font-bold uppercase tracking-wide text-red-600 transition hover:bg-red-50 disabled:opacity-60 cursor-pointer"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerDashboard;