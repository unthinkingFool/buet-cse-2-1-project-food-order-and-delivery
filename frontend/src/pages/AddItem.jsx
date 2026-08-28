import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { serverUrl } from "../App";
import { setRestaurantData, addItem } from "../redux/ownerSlice";
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
} from "lucide-react";

function AddItem() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { restaurantData } = useSelector((state) => state.owner);

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

  const handleImage = (e) => {
    const file = e.target.files[0];
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
      const result = await axios.post(`${serverUrl}/api/item/add-item`, formData, {
        withCredentials: true,
      });
      // Add newly created item to Redux
      dispatch(addItem(result.data.item));
      console.log(result.data);
      navigate("/");
    } catch (error) {
      console.log(`error while formatting item data from frontend : ${error}`);
    } finally {
      setloading(false);
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.1 + i * 0.06, duration: 0.3, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="min-h-screen bg-[#FAFAF8] px-4 sm:px-6 py-10"
    >
      <div className="max-w-lg mx-auto">
        {/* Back */}
        <p
          onClick={() => {
            navigate("/");
          }}
          className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-gray-500 hover:text-[#FF5A36] transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
          className="border-2 border-[#1F2023] bg-white p-6 sm:p-8"
        >
          {/* Title */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="h-11 w-11 bg-[#FF5A36] flex items-center justify-center">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36]">
                Menu
              </p>
              <h1 className="text-2xl font-black text-[#1F2023]">Add Food</h1>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2">
                Name Of Your Item:
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  onChange={(e) => setname(e.target.value)}
                  value={name}
                  className="w-full border-2 border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-[#1F2023] outline-none transition focus:border-[#FF5A36]"
                />
              </div>
            </motion.div>

            {/* Description */}
            <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
              <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2">
                Description Of Your Item:
              </label>
              <div className="relative">
                <AlignLeft className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="description"
                  type="text"
                  onChange={(e) => setdescription(e.target.value)}
                  value={description}
                  className="w-full border-2 border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-[#1F2023] outline-none transition focus:border-[#FF5A36]"
                />
              </div>
            </motion.div>

            {/* category */}
            <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
              <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2">
                Category Of Your Item:
              </label>
              <div className="relative">
                <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  id="category"
                  onChange={(e) => setcategory(e.target.value)}
                  value={category}
                  className="w-full appearance-none border-2 border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-[#1F2023] outline-none transition focus:border-[#FF5A36]"
                >
                  <option value="">select</option>
                  {categories.map((cate, index) => (
                    <option value={cate} key={index}>
                      {cate}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            {/* food type */}
            <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
              <label htmlFor="food_type" className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2">
                Type Of Your Item:
              </label>
              <div className="relative">
                <Leaf className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  id="food_type"
                  onChange={(e) => setfood_type(e.target.value)}
                  value={food_type}
                  className="w-full appearance-none border-2 border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-[#1F2023] outline-none transition focus:border-[#FF5A36]"
                >
                  <option value="">select</option>
                  {types.map((type, index) => (
                    <option value={type} key={index}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            {/* price + discount side by side */}
            <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2">
                  Price:
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="price"
                    type="number"
                    onChange={(e) => setprice(e.target.value)}
                    value={price}
                    className="w-full border-2 border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-[#1F2023] outline-none transition focus:border-[#FF5A36]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="discount_price" className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2">
                  Discount:
                </label>
                <div className="relative">
                  <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="discount_price"
                    type="number"
                    onChange={(e) => setdiscount_price(e.target.value)}
                    value={discount_price}
                    className="w-full border-2 border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-[#1F2023] outline-none transition focus:border-[#FF5A36]"
                  />
                </div>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
              <label htmlFor="image" className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2">
                Food Image :
              </label>
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 bg-[#FAFAF8] py-6 cursor-pointer hover:border-[#FF5A36] transition-colors"
              >
                {frontendimage ? (
                  <img src={frontendimage} alt="" className="h-24 w-24 object-cover" />
                ) : (
                  <>
                    <ImagePlus className="h-6 w-6 text-gray-400" />
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Click to upload</span>
                  </>
                )}
              </label>
              <input id="image" type="file" onChange={handleImage} className="hidden" />
            </motion.div>

            <motion.button
              custom={6}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              whileHover={!loading ? { x: 2, y: 2, boxShadow: "2px 2px 0px 0px #1F2023" } : {}}
              whileTap={!loading ? { x: 4, y: 4, boxShadow: "0px 0px 0px 0px #1F2023" } : {}}
              type="submit"
              disabled={loading}
              style={{ boxShadow: "4px 4px 0px 0px #1F2023" }}
              className="w-full flex items-center justify-center gap-2 bg-[#FF5A36] py-3.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Item
            </motion.button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default AddItem;