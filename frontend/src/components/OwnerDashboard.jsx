import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import Nav from "./Nav.jsx";
import useMyItems from "../hooks/useMyItems.jsx";

import axios from "axios";
import { serverUrl } from "../App";
import { deleteItem } from "../redux/ownerSlice";
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
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");

    if (!confirmDelete) {
      return;
    }

    setdeletingId(itemId);
    try {
      const result = await axios.delete(`${serverUrl}/api/item/delete-item/${itemId}`, {
        withCredentials: true,
      });

      console.log(result.data);

      // Remove item from Redux
      dispatch(deleteItem(itemId));
    } catch (error) {
      console.log("error while deleting item : ", error);
    } finally {
      setdeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Nav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* no restaurant yet — onboarding state */}
        {!restaurantData && (
          <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 px-6">
            <div className="h-14 w-14 rounded-2xl bg-[#FF5A36]/10 flex items-center justify-center mb-4">
              <Store className="h-7 w-7 text-[#FF5A36]" />
            </div>
            <h1 className="text-xl font-bold text-[#1F2023]">Add Your Restaurant</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Join our platform to serve delicious food
            </p>
            <button
              onClick={() => {
                navigate("/create-edit-restaurant");
              }}
              className="mt-6 flex items-center gap-2 rounded-lg bg-[#FF5A36] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94e2c] active:scale-[0.99] cursor-pointer"
            >
              Get Started
            </button>
          </div>
        )}

        {/* restaurant dashboard */}
        {restaurantData && (
          <div className="space-y-8">
            <h1 className="text-2xl font-bold text-[#1F2023]">
              Welcome to {restaurantData.restaurant.name}
            </h1>

            {/* restaurant profile card */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="relative h-40 sm:h-48 w-full bg-gray-100">
                <img
                  src={restaurantData.restaurant.image_link}
                  alt="My Restaurant"
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => {
                    navigate("/create-edit-restaurant");
                  }}
                  className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-white/95 backdrop-blur px-3 py-1.5 text-xs font-semibold text-[#1F2023] shadow-sm transition hover:bg-white cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Restaurant
                </button>
              </div>

              <div className="p-5">
                <h1 className="text-lg font-bold text-[#1F2023]">
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
            </div>

            {/* FOOD ITEMS */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1F2023]">My Food Items</h2>
                <button
                  onClick={() => {
                    navigate("/add-food");
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-[#FF5A36] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94e2c] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add Food
                </button>
              </div>

              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
                  <p className="text-sm text-gray-500">
                    You haven't added any food items yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden"
                    >
                      <div className="h-32 w-full bg-gray-100">
                        <img
                          src={item.image_link}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="p-3.5">
                        <h3 className="text-sm font-bold text-[#1F2023] truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-[10px] font-medium rounded-md bg-[#FAFAF8] border border-gray-200 px-2 py-0.5 text-[#1F2023]">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-medium rounded-md bg-[#FAFAF8] border border-gray-200 px-2 py-0.5 text-[#1F2023]">
                            {item.food_type}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2 mt-2">
                          <p className="text-sm font-bold text-[#1F2023]">৳{item.price}</p>
                          {item.discount_price && (
                            <p className="text-xs text-gray-400 line-through">
                              ৳{item.discount_price}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => navigate(`/edit-item/${item.id}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-[#1F2023] transition hover:border-[#FF5A36] hover:text-[#FF5A36] cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={deletingId === item.id}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 cursor-pointer"
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerDashboard;