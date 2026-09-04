import React, { useEffect, useState } from "react";

import axios from "axios";

import { useDispatch, useSelector } from "react-redux";

import { motion, AnimatePresence } from "framer-motion";

import { serverUrl } from "../App";

import { setSearchItems, setUserData } from "../redux/userSlice";

import { useNavigate } from "react-router-dom";

import {
  UtensilsCrossed,
  MapPin,
  Search,
  ShoppingCart,
  Plus,
  Bell,
  LogOut,
} from "lucide-react";

function Nav() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userData, city, cartItems, myOrders } = useSelector((state) => state.user);

  const { restaurantData } = useSelector((state) => state.owner);

  const [showinfo, setshowinfo] = useState(false);
  const [query, setquery] = useState("");
  const [signingout, setsigningout] = useState(false);

  // ============================================================
  // SIGN OUT
  // ============================================================

  const handleSignout = async () => {
    setsigningout(true);

    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });

      dispatch(setUserData(null));
    } catch (error) {
      console.log("error while signing out ", error);
    } finally {
      setsigningout(false);
    }
  };

  // ============================================================
  // SEARCH ITEMS
  // ============================================================

  const handleSearchItems = async () => {
    const searchQuery = query.trim();

    // If search box is empty, clear search results
    if (!searchQuery || !city) {
      dispatch(setSearchItems([]));
      return;
    }

    try {
      const result = await axios.get(`${serverUrl}/api/item/search-items`, {
        params: {
          query: searchQuery,
          city: city,
        },
        withCredentials: true,
      });

      // Backend response:
      //
      // {
      //   success: true,
      //   message: "...",
      //   count: 1,
      //   items: [...]
      // }
      //
      // We only store the items array in Redux.

      dispatch(setSearchItems(result.data.items || []));

      console.log("Search results:", result.data.items);
    } catch (error) {
      console.log("error while fetching the search result", error);

      // Clear old results if search fails
      dispatch(setSearchItems([]));
    }
  };

  // ============================================================
  // SEARCH EFFECT
  // ============================================================

  useEffect(() => {
    if (userData?.role !== "customer") {
      return;
    }

    if (query.trim()) {
      handleSearchItems();
    } else {
      dispatch(setSearchItems([]));
    }
  }, [query, city]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="sticky top-0 z-40 w-full bg-white border-b-2 border-[#1F2023]">
      <div className="flex items-center gap-4 px-4 sm:px-6 py-3 max-w-7xl mx-auto">
        {/* =====================================================
            BRAND
        ====================================================== */}

        <div className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 bg-[#FF5A36] flex items-center justify-center">
            <UtensilsCrossed className="h-4.5 w-4.5 text-white" />
          </div>

          <h1 className="text-lg font-black text-[#1F2023] hidden sm:block">
            KhaiDai
          </h1>
        </div>

        {/* =====================================================
            SEARCH - CUSTOMER ONLY
        ====================================================== */}

        {userData?.role === "customer" && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* LOCATION */}

            <div className="hidden md:flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-500 shrink-0">
              <MapPin className="h-3.5 w-3.5 text-[#FF5A36]" />
              location:
              <div className="text-[#1F2023]">{city}</div>
            </div>

            {/* SEARCH INPUT */}

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

              <p className="sr-only">Search</p>

              <input
                type="text"
                placeholder="search food here"
                className="w-full border-2 border-gray-200 bg-[#FAFAF8] py-2 pl-10 pr-3 text-sm font-medium text-[#1F2023] outline-none transition focus:border-[#FF5A36]"
                onChange={(e) => {
                  setquery(e.target.value);
                }}
                value={query}
              />
            </div>
          </div>
        )}

        {/* =====================================================
            RIGHT SIDE ACTIONS
        ====================================================== */}

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* ===================================================
              ADD FOOD - OWNER
          ==================================================== */}

          {userData?.role === "owner" && (
            <>
              {restaurantData && (
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
                  onClick={() => {
                    navigate("/add-food");
                  }}
                  style={{
                    boxShadow: "3px 3px 0px 0px #1F2023",
                  }}
                  className="hidden sm:flex items-center gap-1.5 bg-[#FF5A36] px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-white cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add Food
                </motion.button>
              )}
            </>
          )}

          {/* ===================================================
              CART - CUSTOMER
          ==================================================== */}

          {userData?.role === "customer" && (
            <div
              className="relative flex items-center justify-center h-10 w-10 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => {
                navigate("/cart");
              }}
            >
              <p className="sr-only">cart</p>

              <ShoppingCart className="h-5 w-5 text-[#1F2023]" />

              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-[#FF5A36] text-white text-[10px] font-bold flex items-center justify-center">
                {cartItems?.length || 0}
              </span>
            </div>
          )}

          {/* ===================================================
              MY ORDERS - CUSTOMER
          ==================================================== */}

          {userData?.role === "customer" && (
            <button
              className="hidden sm:block text-xs font-bold uppercase tracking-wide text-[#1F2023] px-3 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => {
                navigate("/my-orders");
              }}
            >
              My Orders
            </button>
          )}

          {/* ===================================================
              PENDING ORDERS - OWNER
          ==================================================== */}

          {userData?.role === "owner" && (
            <div className="relative flex items-center justify-center h-10 w-10 hover:bg-gray-100 transition-colors cursor-pointer">
              <span className="sr-only">pending order</span>

              <Bell className="h-5 w-5 text-[#1F2023]" />

              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-[#FF5A36] text-white text-[10px] font-bold flex items-center justify-center">
                {myOrders.length}
              </span>
            </div>
          )}

          {/* ===================================================
              MY ORDERS - OWNER
          ==================================================== */}

          {userData?.role === "owner" && (
            <button
              className="hidden sm:block text-xs font-bold uppercase tracking-wide text-[#1F2023] px-3 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => {
                navigate("/my-orders");
              }}
            >
              My Orders
            </button>
          )}

          {/* ===================================================
              COMPLETED ORDERS - RIDER
          ==================================================== */}

          {userData?.role === "rider" && (
            <button
              className="hidden sm:block text-xs font-bold uppercase tracking-wide text-[#1F2023] px-3 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => {
                navigate("/delivered-orders");
              }}
            >
              Completed Orders
            </button>
          )}

          {/* ===================================================
              COMPLETED ORDERS - OWNER
          ==================================================== */}

          {userData?.role === "owner" && (
            <button
              className="hidden sm:block text-xs font-bold uppercase tracking-wide text-[#1F2023] px-3 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => {
                navigate("/owner-delivered-orders");
              }}
            >
              Completed Orders
            </button>
          )}

          {/* ===================================================
              RECEIVED ORDERS - CUSTOMER
          ==================================================== */}

          {userData?.role === "customer" && (
            <button
              className="hidden sm:block text-xs font-bold uppercase tracking-wide text-[#1F2023] px-3 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => {
                navigate("/user-received-orders");
              }}
            >
              Received Orders
            </button>
          )}

          {/* ===================================================
              USER AVATAR
          ==================================================== */}

          <div
            onClick={() => setshowinfo((prev) => !prev)}
            className="relative h-9 w-9 rounded-full bg-[#1F2023] text-white flex items-center justify-center text-sm font-bold cursor-pointer select-none"
          >
            {userData?.name?.slice(0, 1)}

            <AnimatePresence>
              {showinfo && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                  }}
                  transition={{
                    duration: 0.18,
                    ease: "easeOut",
                  }}
                  style={{
                    boxShadow: "4px 4px 0px 0px #1F2023",
                  }}
                  className="absolute right-0 top-11 w-48 border-2 border-[#1F2023] bg-white py-1.5 text-left normal-case"
                >
                  {/* USER NAME */}

                  <div className="px-3.5 py-2 text-sm font-bold text-[#1F2023] truncate border-b-2 border-gray-100">
                    {userData?.name}
                  </div>

                  {/* LOG OUT */}

                  <div
                    onClick={handleSignout}
                    className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#FF5A36] transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />

                    {signingout ? "Logging out..." : "Log out"}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Nav;
