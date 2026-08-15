import React from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
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
  const { userData, city } = useSelector((state) => state.user);
  const { restaurantData } = useSelector((state) => state.owner);
  const [showinfo, setshowinfo] = useState(false);
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.user);

  // UI-only addition (does not affect the request itself)
  const [signingout, setsigningout] = useState(false);

  const handleSignout = async () => {
    setsigningout(true);
    try {
      const result = await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
    } catch (error) {
      console.log("error while signing out ", error);
    } finally {
      setsigningout(false);
    }
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center gap-4 px-4 sm:px-6 py-3 max-w-7xl mx-auto">
        {/* brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-[#FF5A36] flex items-center justify-center">
            <UtensilsCrossed className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-[#1F2023] hidden sm:block">
            KhaiDai
          </h1>
        </div>

        {/** search only for customer */}
        {userData.role == "customer" && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 shrink-0">
              <MapPin className="h-3.5 w-3.5 text-[#FF5A36]" />
              location: <div className="font-medium text-[#1F2023]">{city}</div>
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <p className="sr-only">Search</p>
              <input
                type="text"
                placeholder="search food here"
                className="w-full rounded-lg border border-gray-200 bg-[#FAFAF8] py-2 pl-9 pr-3 text-sm text-[#1F2023] outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/** add item for owner */}
          {userData.role == "owner" && (
            <>
              {restaurantData && (
                <button
                  onClick={() => {
                    navigate("/add-food");
                  }}
                  className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[#FF5A36] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94e2c] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  addItem
                </button>
              )}
            </>
          )}

          {/** cart item for customer */}
          {userData.role == "customer" && (
            <div className="relative flex items-center justify-center h-10 w-10 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={()=>{navigate("/cart")}}>
              <p className="sr-only">cart</p>
              <ShoppingCart className="h-5 w-5 text-[#1F2023]" />
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-[#FF5A36] text-white text-[10px] font-bold flex items-center justify-center">
                {cartItems.length}
              </span>
            </div>
          )}

          {/** My orders for customers */}
          {userData.role == "customer" && (
            <button className="hidden sm:block text-sm font-medium text-[#1F2023] px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={()=>{navigate("/my-orders")}}>
              My Orders
            </button>
          )}

          {/** pending orders for owner */}
          {userData.role === "owner" && (
            <div className="relative flex items-center justify-center h-10 w-10 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <span className="sr-only">pending order</span>
              <Bell className="h-5 w-5 text-[#1F2023]" />
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-[#FF5A36] text-white text-[10px] font-bold flex items-center justify-center">
                0
              </span>
            </div>
          )}

          {/** My orders for owner */}
          {userData.role == "owner" && (
            <button className="hidden sm:block text-sm font-medium text-[#1F2023] px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={()=>{navigate("/my-orders")}}>
              My Orders
            </button>
          )}

          {/* avatar */}
          <div
            onClick={() => setshowinfo((prev) => !prev)}
            className="relative h-9 w-9 rounded-full bg-[#1F2023] text-white flex items-center justify-center text-sm font-semibold cursor-pointer select-none"
          >
            {userData.name.slice(0, 1)}

            {showinfo && (
              <div className="absolute right-0 top-11 w-44 rounded-lg border border-gray-100 bg-white shadow-lg py-1.5 text-left normal-case">
                {/** pop up options */}
                <div className="px-3.5 py-2 text-sm font-medium text-[#1F2023] truncate border-b border-gray-100">
                  {userData.name}
                </div>
                {/** for small devices , my order will be in thrid pop up */}
                <div
                  onClick={handleSignout}
                  className="flex items-center gap-2 px-3.5 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#FF5A36] transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {signingout ? "Logging out..." : "Log out"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Nav;
