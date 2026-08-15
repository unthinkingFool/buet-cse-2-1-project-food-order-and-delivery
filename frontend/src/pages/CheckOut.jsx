import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  LocateFixed,
  Search,
  Wallet,
  Smartphone,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { serverUrl } from "../App";
import { addMyOrder, clearCart } from "../redux/userSlice";
import { setaddress, setLocation } from "../redux/mapSlice";

// ==========================================
// RECENTER MAP
// ==========================================

function ReCenterMap({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location?.lat !== null && location?.lon !== null) {
      map.setView([location.lat, location.lon], 16, { animate: true });
    }
  }, [location?.lat, location?.lon, map]);

  return null;
}

// ==========================================
// CHECKOUT PAGE
// ==========================================

function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems, totalAmount } = useSelector((state) => state.user);

  const { location, address } = useSelector((state) => state.map);

  const [payment_method, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [addressInput, setaddressInput] = useState("");
  const deliveryFee = totalAmount > 300 ? 0 : 35;
  const amountWithDeliveryFee = deliveryFee + totalAmount;

  // ==========================================
  // MARKER DRAG END
  // ==========================================

  const OnDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();

    console.log("New location:", lat, lng);

    dispatch(
      setLocation({
        lat,
        lon: lng,
      }),
    );

    getAddressByLatLng({
      lat,
      lon: lng,
    });
  };

  // ==========================================
  // CREATE ORDER
  // ==========================================

  const handleCheckout = async () => {
    try {
      if (!address) {
        alert("Please enter your delivery address");
        return;
      }

      if (cartItems.length === 0) {
        alert("Your cart is empty");
        return;
      }

      if (location?.lat === null || location?.lon === null) {
        alert("Delivery location is required");
        return;
      }

      setLoading(true);

      // ==========================================
      // SEND ONLY ITEM ID + QUANTITY
      // ==========================================

      const orderItems = cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }));

      // ==========================================
      // CREATE ORDER
      // ==========================================

      const result = await axios.post(
        `${serverUrl}/api/order/create`,
        {
          payment_method,

          delivery_address: address,

          latitude: location.lat,

          longitude: location.lon,

          cartItems: orderItems,
        },
        {
          withCredentials: true,
        },
      );

      // Order successfully created
      dispatch(addMyOrder(result.data))

      navigate("/order-placed", {
        replace: true,
        state: { orderPlaced: true },
      });
    } catch (error) {
      console.error("Error while creating order:", error);

      console.log("Backend response:", error.response?.data);

      alert(
        error.response?.data?.message ||
          "Something went wrong while creating the order",
      );
    } finally {
      setLoading(false);
    }
  };

  const getAddressByLatLng = async ({ lat, lon }) => {
    try {
      const apikey = import.meta.env.VITE_GEOAPIFY_API_KEY;

      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${apikey}`,
      );

      const newAddress = result?.data?.results?.[0]?.formatted;

      console.log("New Address:", newAddress);

      if (newAddress) {
        dispatch(setaddress(newAddress));
      }
    } catch (error) {
      console.log(
        "error while fetching new address from checkout page:",
        error,
      );
    }
  };
  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const newLocation = {
        lat: latitude,
        lon: longitude,
      };

      dispatch(setLocation(newLocation));

      getAddressByLatLng(newLocation);
    });
  };
  const getLatLngByAddress = async () => {
    try {
      const apikey = import.meta.env.VITE_GEOAPIFY_API_KEY;

      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          addressInput,
        )}&apiKey=${apikey}`,
      );

      const properties = result?.data?.features?.[0]?.properties;

      if (!properties) {
        alert("Address not found");
        return;
      }

      const newLocation = {
        lat: properties.lat,
        lon: properties.lon,
      };

      dispatch(setLocation(newLocation));

      // Keep Redux address synchronized
      dispatch(setaddress(properties.formatted || addressInput));

      // Update input immediately
      setaddressInput(properties.formatted || addressInput);
    } catch (error) {
      console.log(
        "error while fetching latitude and longitude from address in checkout page:",
        error,
      );
    }
  };
  useEffect(() => {
    setaddressInput(address);
  }, [address]);

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <div
          onClick={() => navigate("/cart")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#FF5A36] transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1F2023]">Checkout</h1>
          {/* Total */}
          <h2 className="text-sm font-semibold text-[#1F2023]">
            Total: <span className="text-[#FF5A36]">৳{totalAmount}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* left column — address, map, payment */}
          <div className="lg:col-span-2 space-y-5">
            {/* Delivery Address */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
              <label className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Delivery Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => {
                    setaddressInput(e.target.value);
                  }}
                  placeholder="Select delivery location"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={getLatLngByAddress}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-[#1F2023] transition hover:border-[#FF5A36] hover:text-[#FF5A36] cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search
                </button>

                <button
                  onClick={getCurrentLocation}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-[#1F2023] transition hover:border-[#FF5A36] hover:text-[#FF5A36] cursor-pointer"
                >
                  <LocateFixed className="h-3.5 w-3.5" />
                  Current Address
                </button>
              </div>

              {/* Latitude / Longitude */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    value={location?.lat ?? ""}
                    readOnly
                    className="w-full rounded-lg border border-gray-200 bg-[#FAFAF8] py-2 px-3 text-xs text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    value={location?.lon ?? ""}
                    readOnly
                    className="w-full rounded-lg border border-gray-200 bg-[#FAFAF8] py-2 px-3 text-xs text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* MAP */}
            {location?.lat !== null && location?.lon !== null && (
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <MapContainer
                  center={[location.lat, location.lon]}
                  zoom={15}
                  style={{
                    height: "400px",
                    width: "100%",
                  }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Recenter */}
                  <ReCenterMap location={location} />

                  {/* Draggable marker */}
                  <Marker
                    position={[location.lat, location.lon]}
                    draggable={true}
                    eventHandlers={{
                      dragend: OnDragEnd,
                    }}
                  />
                </MapContainer>
              </div>
            )}

            {/* Payment Method */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
              <label className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Payment Method
              </label>
              <div className="relative">
                {payment_method === "cod" ? (
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                ) : (
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                )}
                <select
                  value={payment_method}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                >
                  <option value="cod">Cash on Delivery</option>
                  <option value="online">
                    Online Payment : Bkash, RazorPay
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* right column — order summary */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 lg:sticky lg:top-24 space-y-4">
            <h1 className="text-base font-bold text-[#1F2023] flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[#FF5A36]" />
              Order Summary
            </h1>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-[#1F2023] block truncate">
                      {item.name} X {item.quantity}
                    </span>
                    <p className="text-xs text-gray-400 truncate">
                      From: {item.restaurant}
                    </p>
                  </div>
                  <span className="font-semibold text-[#1F2023] shrink-0">
                    ৳{item.quantity * item.price}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-gray-500">
                <span>Total Purchase</span>
                <span>৳{totalAmount}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>Delivery Fee</span>
                <span>৳{deliveryFee}</span>
              </div>
              <div className="flex items-center justify-between text-[#1F2023] font-bold text-base pt-1">
                <span>Total</span>
                <span>৳{amountWithDeliveryFee}</span>
              </div>
            </div>

            {/* Checkout */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF5A36] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94e2c] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Creating Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
