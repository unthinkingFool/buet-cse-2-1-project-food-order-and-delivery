import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Star } from "lucide-react";
import { motion } from "framer-motion";

import { useSelector } from "react-redux";

import Nav from "./Nav";
import FoodCard from "./FoodCard";
import useGetRestaurantItems from "../hooks/useGetRestaurantItems";

function RestaurantCard() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const { restaurant, items, loading } =
    useGetRestaurantItems(restaurantId);

  const { shopsInMyCity } = useSelector(
    (state) => state.user,
  );

  // Fallback to restaurant already available in Redux
  const shopFromRedux = shopsInMyCity?.find(
    (shop) => String(shop.id) === String(restaurantId),
  );

  const restaurantData =
    restaurant || shopFromRedux;

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
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="min-h-screen bg-[#FAFAF8]"
    >
      <Nav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-gray-500 hover:text-[#FF5A36] transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Loading */}
        {loading && !restaurantData && (
          <div
            style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
            className="border-2 border-[#1F2023] bg-white p-10 text-center"
          >
            <p className="text-sm text-gray-500">
              Loading restaurant...
            </p>
          </div>
        )}

        {/* Restaurant */}
        {restaurantData && (
          <div className="space-y-8">

            {/* Restaurant Hero */}
            <motion.div
              custom={0}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
              className="overflow-hidden border-2 border-[#1F2023] bg-white"
            >

              <div className="relative h-52 sm:h-64 bg-gray-100">
                <img
                  src={restaurantData.image_link}
                  alt={restaurantData.name}
                  className="h-full w-full object-cover"
                />

                {/* Rating */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 border-2 border-[#1F2023] bg-white/95 backdrop-blur px-3 py-1.5 text-sm font-black">
                  <Star className="h-4 w-4 fill-[#FF5A36] text-[#FF5A36]" />

                  {restaurantData.rating == null
                    ? "0"
                    : restaurantData.rating}
                </div>
              </div>

              <div className="p-5 sm:p-6">

                <h1 className="text-2xl font-black text-[#1F2023]">
                  {restaurantData.name}
                </h1>

                {restaurantData.description && (
                  <p className="mt-1.5 text-sm text-gray-500 max-w-2xl">
                    {restaurantData.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-gray-500">

                  {restaurantData.address && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[#FF5A36]" />
                      {restaurantData.address}
                    </span>
                  )}

                  {restaurantData.contact_no && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-[#FF5A36]" />
                      {restaurantData.contact_no}
                    </span>
                  )}

                </div>
              </div>
            </motion.div>

            {/* Food */}
            <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-[#1F2023]">
                    Menu
                  </h2>

                  <p className="text-sm text-gray-500 mt-0.5">
                    Choose what you want to order
                  </p>
                </div>

                <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  {items.length} items
                </span>
              </div>

              {items.length === 0 ? (
                <div className="border-2 border-dashed border-[#1F2023] bg-white py-12 text-center">
                  <p className="text-sm text-gray-500">
                    This restaurant has no food items yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center sm:place-items-stretch">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <FoodCard
                        data={{
                          ...item,
                          restaurant_name:
                            restaurantData.name,
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

          </div>
        )}
      </div>
    </motion.div>
  );
}

export default RestaurantCard;