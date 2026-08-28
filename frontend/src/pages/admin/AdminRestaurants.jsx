import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import useGetAllRestaurants from "../../hooks/admin/useGetAllRestaurants";
import useGetPendingRestaurants from "../../hooks/admin/useGetPendingRestaurants";
import useGetSuspendedRestaurants from "../../hooks/admin/useGetSuspendedRestaurants";
import { serverUrl } from "../../App";

function AdminRestaurants() {
  useGetAllRestaurants();
  useGetPendingRestaurants();
  useGetSuspendedRestaurants();
  const [approved, setapproved] = useState(true);
  const [suspended, setsuspended] = useState(false);
  const { pendingRestaurants, suspendedRestaurants, restaurants, loading, error } = useSelector(
    (state) => state.admin,
  );

  // ============================================================
  // ANIMATION VARIANTS
  // ============================================================

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.05 * i, duration: 0.3, ease: "easeOut" },
    }),
  };

  if (loading) {
    return <div className="p-6">Loading restaurants...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }
  const handleApprovedRestaurant = () => {
    setapproved(true);
    setsuspended(false);
  };
  const handlePendingRestaurant = () => {
    setapproved(false);
    setsuspended(false);
  };
  const handleSuspendRestaurant = () => {
    setapproved(false);
    setsuspended(true);
  };

  const handleApprove = async (id) => {
  try {
    const response = await axios.patch(
      `${serverUrl}/api/admin/restaurants/${id}/approve`,
      {},
      {
        withCredentials: true,
      }
    );

    if (response.data.success) {
      // update your local state / redux here
      console.log("Restaurant approved successfully");
    }
  } catch (error) {
    console.error(
      "APPROVE RESTAURANT ERROR:",
      error.response?.data || error.message
    );
  }
};

const handleSuspend = async (id) => {
  try {
    const response = await axios.patch(
      `${serverUrl}/api/admin/restaurants/${id}/suspend`,
      {},
      {
        withCredentials: true,
      }
    );

    if (response.data.success) {
      // update your local state / redux here
      console.log("Restaurant suspended successfully");
    }
  } catch (error) {
    console.error(
      "SUSPEND RESTAURANT ERROR:",
      error.response?.data || error.message
    );
  }
};


  return (
    <div className="p-6">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-[#1F2023]">Restaurants</h1>

        <p className="text-gray-500 mt-1">Manage all restaurants on KhaiDai</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
        className="flex items-center gap-3 mb-6"
      >
        <motion.button
          whileHover={{ x: 1, y: 1, boxShadow: "1px 1px 0px 0px #1F2023" }}
          whileTap={{ x: 2, y: 2, boxShadow: "0px 0px 0px 0px #1F2023" }}
          onClick={handleApprovedRestaurant}
          style={{ boxShadow: approved && !suspended ? "3px 3px 0px 0px #1F2023" : "none" }}
          className={`px-4 py-2 border-2 border-[#1F2023] text-xs font-bold uppercase tracking-wide transition cursor-pointer ${
            approved && !suspended ? "bg-[#FF5A36] text-white" : "bg-white text-[#1F2023]"
          }`}
        >
          Approved
        </motion.button>
        <motion.button
          whileHover={{ x: 1, y: 1, boxShadow: "1px 1px 0px 0px #1F2023" }}
          whileTap={{ x: 2, y: 2, boxShadow: "0px 0px 0px 0px #1F2023" }}
          onClick={handlePendingRestaurant}
          style={{ boxShadow: !approved && !suspended ? "3px 3px 0px 0px #1F2023" : "none" }}
          className={`px-4 py-2 border-2 border-[#1F2023] text-xs font-bold uppercase tracking-wide transition cursor-pointer ${
            !approved && !suspended ? "bg-[#FF5A36] text-white" : "bg-white text-[#1F2023]"
          }`}
        >
          Pending
        </motion.button>
        <motion.button
          whileHover={{ x: 1, y: 1, boxShadow: "1px 1px 0px 0px #1F2023" }}
          whileTap={{ x: 2, y: 2, boxShadow: "0px 0px 0px 0px #1F2023" }}
          onClick={handleSuspendRestaurant}
          style={{ boxShadow: suspended ? "3px 3px 0px 0px #1F2023" : "none" }}
          className={`px-4 py-2 border-2 border-[#1F2023] text-xs font-bold uppercase tracking-wide transition cursor-pointer ${
            suspended ? "bg-[#FF5A36] text-white" : "bg-white text-[#1F2023]"
          }`}
        >
          Suspended
        </motion.button>
      </motion.div>

      {/* Approved RESTAURANTS */}
      {approved && !suspended && (
        <div
          style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
          className="border-2 border-[#1F2023] bg-white overflow-hidden"
        >
          {restaurants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No restaurants found.
            </div>
          ) : (
            <div className="divide-y-2 divide-gray-100">
              {restaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
                >
                  {/* ========================================= */}
                  {/* INFO */}
                  {/* ========================================= */}

                  <div className="flex gap-4">
                    {restaurant.image_link ? (
                      <img
                        src={restaurant.image_link}
                        alt={restaurant.name}
                        className="w-20 h-20 object-cover border-2 border-[#1F2023]"
                      />
                    ) : (
                      <div className="w-20 h-20 border-2 border-[#1F2023] bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}

                    <div>
                      <h2 className="text-lg font-black text-[#1F2023]">
                        {restaurant.name}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        {restaurant.city}
                      </p>

                      <p className="text-sm text-gray-500">
                        {restaurant.address}
                      </p>

                      <div className="mt-2">
                        <p className="text-sm">
                          Owner:{" "}
                          <span className="font-bold">
                            {restaurant.owner_name}
                          </span>
                        </p>

                        <p className="text-sm text-gray-500">
                          {restaurant.owner_email}
                        </p>

                        {restaurant.owner_contact && (
                          <p className="text-sm text-gray-500">
                            {restaurant.owner_contact}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ========================================= */}
                  {/* STATUS */}
                  {/* ========================================= */}

                  <div className="flex flex-wrap items-center gap-3">
                    <motion.button
                      whileHover={{
                        x: 1,
                        y: 1,
                        boxShadow: "1px 1px 0px 0px #1F2023",
                      }}
                      whileTap={{
                        x: 2,
                        y: 2,
                        boxShadow: "0px 0px 0px 0px #1F2023",
                      }}
                      //onClick={handleSuspendRestaurant}
                      style={{
                        boxShadow: suspended
                          ? "3px 3px 0px 0px #1F2023"
                          : "none",
                      }}
                      className={`px-4 py-2 border-2 border-[#1F2023] text-xs font-bold uppercase tracking-wide transition cursor-pointer bg-[#FF5A36] text-white`
                        }
                      onClick={()=>{handleSuspend(restaurant.id)}}
                    >
                      Suspended
                    </motion.button>
                    {restaurant.is_approved && (
                      <span className="px-3 py-1 border-2 border-green-600 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wide">
                        Approved
                      </span>
                    )}

                    <span
                      className={`px-3 py-1 border-2 text-xs font-bold uppercase tracking-wide ${
                        restaurant.status === "open"
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-300 bg-gray-100 text-gray-600"
                      }`}
                    >
                      {restaurant.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/** pending approval restaurants */}
      {!approved && !suspended && (
        <div
          style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
          className="border-2 border-[#1F2023] bg-white overflow-hidden"
        >
          {pendingRestaurants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No Pending restaurants found.
            </div>
          ) : (
            <div className="divide-y-2 divide-gray-100">
              {pendingRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
                >
                  {/* ========================================= */}
                  {/* INFO */}
                  {/* ========================================= */}

                  <div className="flex gap-4">
                    {restaurant.image_link ? (
                      <img
                        src={restaurant.image_link}
                        alt={restaurant.name}
                        className="w-20 h-20 object-cover border-2 border-[#1F2023]"
                      />
                    ) : (
                      <div className="w-20 h-20 border-2 border-[#1F2023] bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}

                    <div>
                      <h2 className="text-lg font-black text-[#1F2023]">
                        {restaurant.name}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        {restaurant.city}
                      </p>

                      <p className="text-sm text-gray-500">
                        {restaurant.address}
                      </p>

                      <div className="mt-2">
                        <p className="text-sm">
                          Owner:{" "}
                          <span className="font-bold">
                            {restaurant.owner_name}
                          </span>
                        </p>

                        <p className="text-sm text-gray-500">
                          {restaurant.owner_email}
                        </p>

                        {restaurant.owner_contact && (
                          <p className="text-sm text-gray-500">
                            {restaurant.owner_contact}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ========================================= */}
                  {/* STATUS */}
                  {/* ========================================= */}

                  <div className="flex flex-wrap items-center gap-3">
                   
                      <span 
                      onClick={() => handleApprove(restaurant.id)}
                      className="cursor-pointer px-3 py-1 border-2 border-green-600 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wide">
                        Approve
                      </span>
                    

                    <span
                      className={`px-3 py-1 border-2 text-xs font-bold uppercase tracking-wide ${
                        restaurant.status === "open"
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-300 bg-gray-100 text-gray-600"
                      }`}
                    >
                      {restaurant.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
      {/** suspended restaurants */}
      {suspended && !approved && (
        <div
          style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
          className="border-2 border-[#1F2023] bg-white overflow-hidden"
        >
          {suspendedRestaurants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No suspended restaurants found.
            </div>
          ) : (
            <div className="divide-y-2 divide-gray-100">
              {suspendedRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
                >
                  {/* ========================================= */}
                  {/* INFO */}
                  {/* ========================================= */}

                  <div className="flex gap-4">
                    {restaurant.image_link ? (
                      <img
                        src={restaurant.image_link}
                        alt={restaurant.name}
                        className="w-20 h-20 object-cover border-2 border-[#1F2023]"
                      />
                    ) : (
                      <div className="w-20 h-20 border-2 border-[#1F2023] bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}

                    <div>
                      <h2 className="text-lg font-black text-[#1F2023]">
                        {restaurant.name}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        {restaurant.city}
                      </p>

                      <p className="text-sm text-gray-500">
                        {restaurant.address}
                      </p>

                      <div className="mt-2">
                        <p className="text-sm">
                          Owner:{" "}
                          <span className="font-bold">
                            {restaurant.owner_name}
                          </span>
                        </p>

                        <p className="text-sm text-gray-500">
                          {restaurant.owner_email}
                        </p>

                        {restaurant.owner_contact && (
                          <p className="text-sm text-gray-500">
                            {restaurant.owner_contact}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ========================================= */}
                  {/* STATUS */}
                  {/* ========================================= */}

                  <div className="flex flex-wrap items-center gap-3">
                    {restaurant.is_approved && (
                      <span className="px-3 py-1 border-2 border-green-600 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wide">
                        Approved
                      </span>
                    )}

                    <span
                      className={`px-3 py-1 border-2 text-xs font-bold uppercase tracking-wide ${
                        restaurant.status === "open"
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-300 bg-gray-100 text-gray-600"
                      }`}
                    >
                      {restaurant.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminRestaurants;