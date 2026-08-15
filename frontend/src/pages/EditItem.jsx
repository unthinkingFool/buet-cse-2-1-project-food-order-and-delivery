import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { serverUrl } from "../App";
import { updateItem } from "../redux/ownerSlice";
import {
  ArrowLeft,
  UtensilsCrossed,
  Tag,
  AlignLeft,
  Layers,
  Leaf,
  DollarSign,
  Percent,
  ImagePlus,
  Loader2,
  SearchX,
} from "lucide-react";

function EditItem() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { itemId } = useParams();

  const { items } = useSelector((state) => state.owner);

  const item = items.find((item) => item.id === Number(itemId));

  const [name, setname] = useState("");
  const [category, setcategory] = useState("");
  const [food_type, setfood_type] = useState("");
  const [description, setdescription] = useState("");
  const [price, setprice] = useState("");
  const [discount_price, setdiscount_price] = useState("");

  const [frontendimage, setfrontendimage] = useState(null);
  const [backendimage, setbackendimage] = useState(null);

  // UI-only addition (does not affect the request itself)
  const [loading, setloading] = useState(false);

  const categories = ["burger", "pizza", "drink", "fries"];
  const types = ["veg", "non-veg"];

  // Load existing item data
  useEffect(() => {
    if (item) {
      setname(item.name || "");
      setcategory(item.category || "");
      setfood_type(item.food_type || "");
      setdescription(item.description || "");
      setprice(item.price || "");
      setdiscount_price(item.discount_price || "");

      if (item.image_link) {
        setfrontendimage(item.image_link);
      }
    }
  }, [item]);

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setbackendimage(file);
    setfrontendimage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setloading(true);

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("food_type", food_type);
      formData.append("price", price);

      formData.append("discount_price", discount_price === "" ? "" : discount_price);

      if (backendimage) {
        formData.append("image", backendimage);
      }

      const result = await axios.post(
        `${serverUrl}/api/item/edit-item/${itemId}`,
        formData,
        {
          withCredentials: true,
        },
      );

      dispatch(updateItem(result.data.item));

      console.log(result.data);

      navigate("/");
    } catch (error) {
      console.log("error while editing item from frontend : ", error);
    } finally {
      setloading(false);
    }
  };

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <SearchX className="h-7 w-7 text-gray-400" />
          </div>
          <h1 className="text-lg font-bold text-[#1F2023]">Item not found</h1>
          <button
            onClick={() => navigate("/")}
            className="mt-5 flex items-center gap-1.5 rounded-lg bg-[#FF5A36] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94e2c] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 sm:px-6 py-8">
      <div className="max-w-lg mx-auto">
        {/* Back */}
        <div
          onClick={() => {
            navigate("/");
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#FF5A36] transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 sm:p-8">
          {/* Title */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-lg bg-[#FF5A36]/10 flex items-center justify-center">
              <UtensilsCrossed className="h-4.5 w-4.5 text-[#FF5A36]" />
            </div>
            <h1 className="text-xl font-bold text-[#1F2023]">Edit Food</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Name Of Your Item:
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  onChange={(e) => setname(e.target.value)}
                  value={name}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Description Of Your Item:
              </label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="description"
                  type="text"
                  onChange={(e) => setdescription(e.target.value)}
                  value={description}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Category Of Your Item:
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  id="category"
                  onChange={(e) => setcategory(e.target.value)}
                  value={category}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                >
                  <option value="">select</option>
                  {categories.map((cate, index) => (
                    <option value={cate} key={index}>
                      {cate}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Food type */}
            <div>
              <label htmlFor="food_type" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Type Of Your Item:
              </label>
              <div className="relative">
                <Leaf className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  id="food_type"
                  onChange={(e) => setfood_type(e.target.value)}
                  value={food_type}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                >
                  <option value="">select</option>
                  {types.map((type, index) => (
                    <option value={type} key={index}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price + Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                  Price:
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="price"
                    type="number"
                    onChange={(e) => setprice(e.target.value)}
                    value={price}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="discount_price" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                  Discount:
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="discount_price"
                    type="number"
                    onChange={(e) => setdiscount_price(e.target.value)}
                    value={discount_price}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                  />
                </div>
              </div>
            </div>

            {/* Image */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Food Image:
              </label>
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-[#FAFAF8] py-6 cursor-pointer hover:border-[#FF5A36] transition-colors"
              >
                {frontendimage ? (
                  <img src={frontendimage} alt="Food" className="h-24 w-24 rounded-lg object-cover" />
                ) : (
                  <>
                    <ImagePlus className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-400">Click to upload</span>
                  </>
                )}
              </label>
              <input id="image" type="file" onChange={handleImage} className="hidden" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF5A36] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94e2c] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Item
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditItem;