import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { setRestaurantData } from "../redux/ownerSlice";
import {
  ArrowLeft,
  Store,
  AlignLeft,
  MapPin,
  Building2,
  Phone,
  ImagePlus,
  Loader2,
} from "lucide-react";

function CreateEditRestaurant() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { restaurantData } = useSelector((state) => state.owner);
  const { city, address } = useSelector((state) => state.user);
  const { location } = useSelector((state) => state.map);
  const [name, setname] = useState(restaurantData?.name || "");
  const [City, setcity] = useState(restaurantData?.city || city);
  const [Address, setaddress] = useState(restaurantData?.address || address);
  const [contact_no, setcontact_no] = useState(restaurantData?.contact_no || "");
  const [description, setdescription] = useState(restaurantData?.description || "");

  const [frontendimage, setfrontendimage] = useState(restaurantData?.image || null);
  const [backendimage, setbackendimage] = useState(null);

  // UI-only addition (does not affect the request itself)
  const [loading, setloading] = useState(false);

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
    formData.append("city", City);
    formData.append("address", Address);
    formData.append("contact_no", contact_no);

    // Restaurant coordinates
    if (location?.lat != null && location?.lon != null) {
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lon);
    }

    if (backendimage) {
      formData.append("image", backendimage);
    }

    const result = await axios.post(
      `${serverUrl}/api/restaurant/create-edit-restaurant`,
      formData,
      {
        withCredentials: true,
      },
    );

    dispatch(setRestaurantData(result.data.restaurant));

    console.log(result.data);

    navigate("/");
  } catch (error) {
    console.log(
      `error while formatting restaurant from frontend : ${error}`,
    );
  } finally {
    setloading(false);
  }
};

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
              <Store className="h-4.5 w-4.5 text-[#FF5A36]" />
            </div>
            <h1 className="text-xl font-bold text-[#1F2023]">
              {restaurantData ? "Edit Your Restaurant Data" : "Create Your Restaurant"}
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Name Of Your Restaurant:
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                Description Of Your Restaurant:
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

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Address Of Your Restaurant:
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="address"
                  type="text"
                  onChange={(e) => setaddress(e.target.value)}
                  value={address}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                City:
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="city"
                  type="text"
                  onChange={(e) => setcity(e.target.value)}
                  value={city}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                />
              </div>
            </div>

            {/* Contact */}
            <div>
              <label htmlFor="contact_no" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Contact No. Of Your Restaurant:
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="contact_no"
                  type="text"
                  onChange={(e) => setcontact_no(e.target.value)}
                  value={contact_no}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                />
              </div>
            </div>

            {/* Image */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Image
              </label>
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-[#FAFAF8] py-6 cursor-pointer hover:border-[#FF5A36] transition-colors"
              >
                {frontendimage ? (
                  <img src={frontendimage} alt="" className="h-24 w-24 rounded-lg object-cover" />
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
              {restaurantData ? "Update Restaurant" : "Create Restaurant"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEditRestaurant;