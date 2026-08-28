import React, { useEffect, useState } from "react";

import Nav from "./Nav";

import { useSelector } from "react-redux";

import axios from "axios";

import { serverUrl } from "../App";

import { motion, AnimatePresence } from "framer-motion";

import useGetRiderOrders from "../hooks/useGetRiderOrders";

import RiderTracking from "./RiderTracking";

import {
  MapPin,
  Store,
  Package,
  Wallet,
  Bike,
  User,
  Phone,
  Navigation,
  KeyRound,
  Loader2,
  Inbox,
  CheckCircle2,
} from "lucide-react";

function RiderDashboard() {
  // ============================================================
  // GET RIDER ORDERS
  // ============================================================

  useGetRiderOrders();

  const { assignedOrders = [], deliveredOrders = [] } = useSelector(
    (state) => state.rider,
  );

  const { userData, city } = useSelector((state) => state.user);

  // ============================================================
  // LOCAL STATE
  // ============================================================

  const [shopOrders, setShopOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  // Which shop order currently has the OTP box open
  const [otpOrderId, setOtpOrderId] = useState(null);

  // OTP input
  const [otp, setOtp] = useState("");

  // Sending OTP
  const [otpLoading, setOtpLoading] = useState(false);

  // Verifying OTP
  const [verifyingOTP, setVerifyingOTP] = useState(false);

  // Accepting delivery
  const [acceptingId, setAcceptingId] = useState(null);

  // ============================================================
  // DEBUG
  // ============================================================

  console.log("Assigned Orders:", assignedOrders);

  console.log("Delivered Orders:", deliveredOrders);

  console.log("Available Shop Orders:", shopOrders);

  // ============================================================
  // FETCH BROADCASTED SHOP ORDERS
  // ============================================================

  useEffect(() => {
    const getBroadcastedShopOrders = async () => {
      try {
        setLoading(true);

        const result = await axios.get(
          `${serverUrl}/api/rider/broadcasted-shop-orders`,
          {
            withCredentials: true,
          },
        );

        console.log("BROADCASTED SHOP ORDERS:", result.data?.shopOrders);

        setShopOrders(result.data?.shopOrders || []);
      } catch (error) {
        console.error(
          "ERROR FETCHING BROADCASTED SHOP ORDERS:",
          error.response?.data || error.message,
        );

        setShopOrders([]);
      } finally {
        setLoading(false);
      }
    };

    getBroadcastedShopOrders();
  }, []);

  // ============================================================
  // SEND DELIVERY OTP
  // ============================================================

  const handleShowOTP = async (shopOrderId) => {
    if (!shopOrderId) return;

    setOtpLoading(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/rider/send-delivery-otp`,
        {
          shop_order_id: shopOrderId,
        },
        {
          withCredentials: true,
        },
      );

      console.log("DELIVERY OTP SENT:", result.data);

      // Open OTP box only for this particular order
      setOtpOrderId(shopOrderId);

      // Clear previous OTP
      setOtp("");

      alert("OTP has been sent to the customer's email.");
    } catch (error) {
      console.error(
        "SEND DELIVERY OTP ERROR:",
        error.response?.data || error.message,
      );

      alert(error.response?.data?.message || "Failed to send delivery OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ============================================================
  // VERIFY DELIVERY OTP
  // ============================================================

  const handleVerifyOTP = async (shopOrderId) => {
    if (!shopOrderId) return;

    if (!otp) {
      alert("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      alert("OTP must be 6 digits.");
      return;
    }

    setVerifyingOTP(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/rider/verify-delivery-otp`,
        {
          shop_order_id: shopOrderId,
          otp,
        },
        {
          withCredentials: true,
        },
      );

      console.log("DELIVERY COMPLETED:", result.data);

      alert("Delivery completed successfully!");

      // Close OTP box
      setOtpOrderId(null);

      // Clear OTP
      setOtp("");

      // Refresh page so Redux gets the latest assigned/delivered orders
      window.location.reload();
    } catch (error) {
      console.error(
        "VERIFY DELIVERY OTP ERROR:",
        error.response?.data || error.message,
      );

      alert(error.response?.data?.message || "Failed to verify delivery OTP.");
    } finally {
      setVerifyingOTP(false);
    }
  };

  // ============================================================
  // ACCEPT SHOP ORDER
  // ============================================================

  const handleAccept = async (shopOrderId) => {
    if (!shopOrderId) return;

    setAcceptingId(shopOrderId);

    try {
      console.log("ACCEPTING SHOP ORDER:", shopOrderId);

      const result = await axios.put(
        `${serverUrl}/api/rider/accept-shop-order`,
        {
          shop_order_id: shopOrderId,
        },
        {
          withCredentials: true,
        },
      );

      console.log("SHOP ORDER ACCEPTED:", result.data);

      // Remove accepted delivery from available offers immediately
      setShopOrders((previousOrders) =>
        previousOrders.filter((order) => order.shop_order_id !== shopOrderId),
      );

      alert("Delivery accepted successfully.");

      /*
       * useGetRiderOrders() will fetch the assigned order.
       * If your hook automatically fetches on mount only,
       * the page reload below guarantees the dashboard gets
       * the newest assigned order.
       */
      window.location.reload();
    } catch (error) {
      console.error(
        "ACCEPT SHOP ORDER ERROR:",
        error.response?.data || error.message,
      );

      if (error.response?.status === 409) {
        alert(
          error.response?.data?.message ||
            "Sorry, another rider has already accepted this delivery.",
        );

        // Remove the unavailable offer from UI
        setShopOrders((previousOrders) =>
          previousOrders.filter((order) => order.shop_order_id !== shopOrderId),
        );
      } else {
        alert(
          error.response?.data?.message || "Failed to accept this delivery.",
        );
      }
    } finally {
      setAcceptingId(null);
    }
  };

  // ============================================================
  // CLOSE OTP BOX
  // ============================================================

  const handleCancelOTP = () => {
    setOtpOrderId(null);
    setOtp("");
  };

  // ============================================================
  // ANIMATION VARIANTS
  // ============================================================

  const sectionVariants = {
    hidden: {
      opacity: 0,
      y: 16,
    },

    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 + i * 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 14,
    },

    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.06 * i,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Nav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <motion.div
          custom={0}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          style={{
            boxShadow: "6px 6px 0px 0px #1F2023",
          }}
          className="border-2 border-[#1F2023] bg-white p-5"
        >
          <h1 className="text-xl font-black text-[#1F2023]">
            Welcome {userData?.name}
          </h1>

          <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#FF5A36]" />
            City : {city || "Unknown"}
          </p>

          {userData?.location?.coordinates && (
            <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
              <Navigation className="h-3 w-3" />
              Latitude : {userData.location.coordinates[1]} , Longitude :{" "}
              {userData.location.coordinates[0]}
            </p>
          )}
        </motion.div>

        {/* ======================================================
            AVAILABLE DELIVERIES
        ====================================================== */}

        <motion.div
          custom={1}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-lg font-black text-[#1F2023] mb-4">
            Available Deliveries
          </h2>

          {/* LOADING */}

          {loading && (
            <div className="border-2 border-dashed border-[#1F2023] bg-white py-12 text-center">
              <Loader2 className="h-6 w-6 text-[#FF5A36] animate-spin mx-auto mb-2" />

              <p className="text-sm text-gray-500">
                Loading available deliveries...
              </p>
            </div>
          )}

          {/* EMPTY */}

          {!loading && shopOrders.length === 0 && (
            <div className="border-2 border-dashed border-[#1F2023] bg-white py-12 text-center">
              <Inbox className="h-8 w-8 text-gray-300 mx-auto mb-2" />

              <p className="text-sm text-gray-500">
                No delivery offers available.
              </p>
            </div>
          )}

          {/* AVAILABLE ORDERS */}

          {!loading && shopOrders.length > 0 && (
            <div className="space-y-4">
              <AnimatePresence>
                {shopOrders.map((order, index) => (
                  <motion.div
                    key={order.shop_order_id}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                    layout
                    style={{
                      boxShadow: "6px 6px 0px 0px #1F2023",
                    }}
                    className="border-2 border-[#1F2023] bg-white p-5"
                  >
                    {/* RESTAURANT */}

                    <div className="flex items-center gap-2 mb-3">
                      <Store className="h-4 w-4 text-[#FF5A36]" />

                      <h3 className="text-sm font-black text-[#1F2023]">
                        {order.restaurant?.name || "Restaurant"}
                      </h3>
                    </div>

                    {/* ORDER INFORMATION */}

                    <div className="space-y-1.5">
                      <p className="flex items-start gap-1.5 text-xs text-gray-500">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />

                        <span>
                          <span className="font-semibold">
                            Restaurant Address:
                          </span>{" "}
                          {order.restaurant?.address || "Not available"}
                        </span>
                      </p>

                      <p className="flex items-start gap-1.5 text-xs text-gray-500">
                        <Navigation className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />

                        <span>
                          <span className="font-semibold">
                            Delivery Address:
                          </span>{" "}
                          {order.delivery?.address || "Not available"}
                        </span>
                      </p>

                      <p className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Wallet className="h-3.5 w-3.5 text-gray-400" />

                        <span>
                          <span className="font-semibold">Payment:</span>{" "}
                          {order.payment?.method || "N/A"}
                        </span>
                      </p>
                    </div>

                    {/* AMOUNT */}

                    <p className="text-sm font-black text-[#FF5A36] mt-3">
                      Shop Order Amount: ৳
                      {order.payment?.shop_order_amount ?? 0}
                    </p>

                    {/* ITEMS */}

                    <div className="mt-3 border-2 border-gray-100 bg-[#FAFAF8] p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Package className="h-3.5 w-3.5 text-[#FF5A36]" />

                        <h4 className="text-xs font-black uppercase tracking-wide text-[#1F2023]">
                          Items
                        </h4>
                      </div>

                      {order.items?.length > 0 ? (
                        order.items.map((item) => (
                          <div
                            key={item.id}
                            className="text-xs text-gray-500 py-0.5"
                          >
                            {item.name} × {item.quantity}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400">
                          No items available.
                        </p>
                      )}
                    </div>

                    {/* ACCEPT BUTTON */}

                    <motion.button
                      whileHover={
                        acceptingId === order.shop_order_id
                          ? {}
                          : {
                              x: 1,
                              y: 1,
                              boxShadow: "1px 1px 0px 0px #1F2023",
                            }
                      }
                      whileTap={
                        acceptingId === order.shop_order_id
                          ? {}
                          : {
                              x: 2,
                              y: 2,
                              boxShadow: "0px 0px 0px 0px #1F2023",
                            }
                      }
                      onClick={() => handleAccept(order.shop_order_id)}
                      disabled={acceptingId === order.shop_order_id}
                      style={{
                        boxShadow:
                          acceptingId === order.shop_order_id
                            ? "none"
                            : "3px 3px 0px 0px #1F2023",
                      }}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-[#FF5A36] py-2.5 text-xs font-bold uppercase tracking-wide text-white transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {acceptingId === order.shop_order_id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <Bike className="h-4 w-4" />
                          Accept Delivery
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* ======================================================
            CURRENT ASSIGNED ORDERS
        ====================================================== */}

        <motion.div
          custom={2}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          {assignedOrders.length > 0 && (
            <h1 className="text-lg font-black text-[#1F2023] mb-4">
              Current Orders
            </h1>
          )}

          {assignedOrders.length > 0 ? (
            <div className="space-y-5">
              {assignedOrders.map((order, index) => (
                <motion.div
                  key={order.shop_order_id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  style={{
                    boxShadow: "6px 6px 0px 0px #1F2023",
                  }}
                  className="border-2 border-[#1F2023] bg-white p-5 space-y-4"
                >
                  {/* ORDER DETAILS */}

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Store className="h-4 w-4 text-[#FF5A36]" />

                      <h2 className="text-sm font-black text-[#1F2023]">
                        Shop: {order.restaurant_name}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-500">
                      <p>Order ID: {order.order_id}</p>

                      <p className="capitalize">
                        Status: {order.status?.replaceAll("_", " ") || "N/A"}
                      </p>

                      <p className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-gray-400" />
                        Customer: {order.customer_name || "N/A"}
                      </p>

                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-gray-400" />

                        {order.customer_contact || "N/A"}
                      </p>

                      <p className="sm:col-span-2 flex items-start gap-1.5">
                        <MapPin className="h-3 w-3 text-gray-400 shrink-0 mt-0.5" />

                        <span>
                          <span className="font-semibold">
                            Delivery Address:
                          </span>{" "}
                          {order.delivery_address || "Not available"}
                        </span>
                      </p>

                      <p className="sm:col-span-2 text-gray-400">
                        Delivery Location: {order.delivery_latitude},{" "}
                        {order.delivery_longitude}
                      </p>

                      <p className="sm:col-span-2 text-gray-400">
                        Restaurant Location: {order.restaurant_latitude},{" "}
                        {order.restaurant_longitude}
                      </p>
                    </div>

                    <p className="text-base font-black text-[#FF5A36] mt-3">
                      Total: ৳{order.total_amount ?? 0}
                    </p>
                  </div>

                  {/* ==================================================
                      RIDER TRACKING
                  ================================================== */}

                  <div>
                    <RiderTracking data={order} />
                  </div>

                  {/* ==================================================
                      DELIVERY OTP
                  ================================================== */}

                  <div>
                    {/* MARK AS DELIVERED */}

                    {otpOrderId !== order.shop_order_id && (
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
                        onClick={() => handleShowOTP(order.shop_order_id)}
                        disabled={otpLoading}
                        style={{
                          boxShadow: "3px 3px 0px 0px #1F2023",
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-[#FF5A36] py-2.5 text-xs font-bold uppercase tracking-wide text-white transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {otpLoading && otpOrderId === order.shop_order_id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          <>
                            <Bike className="h-4 w-4" />
                            Mark As Delivered
                          </>
                        )}
                      </motion.button>
                    )}

                    {/* OTP BOX */}

                    <AnimatePresence>
                      {otpOrderId === order.shop_order_id && (
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
                            duration: 0.2,
                            ease: "easeOut",
                          }}
                          className="border-2 border-gray-100 bg-[#FAFAF8] p-4"
                        >
                          <label className="block text-sm font-bold text-[#1F2023] mb-1.5">
                            Enter OTP From {order.customer_name}:
                          </label>

                          <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={otp}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");

                                setOtp(value);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleVerifyOTP(order.shop_order_id);
                                }
                              }}
                              placeholder="Enter 6-digit OTP"
                              disabled={verifyingOTP}
                              className="w-full border-2 border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm tracking-[0.35em] text-[#1F2023] outline-none transition focus:border-[#FF5A36] disabled:bg-gray-100"
                            />
                          </div>

                          {/* BUTTONS */}

                          <div className="flex gap-2 mt-3">
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
                              onClick={() =>
                                handleVerifyOTP(order.shop_order_id)
                              }
                              disabled={verifyingOTP}
                              style={{
                                boxShadow: "3px 3px 0px 0px #1F2023",
                              }}
                              className="flex-1 flex items-center justify-center gap-2 bg-[#FF5A36] py-2.5 text-xs font-bold uppercase tracking-wide text-white transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {verifyingOTP ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  Submit
                                </>
                              )}
                            </motion.button>

                            <button
                              type="button"
                              onClick={handleCancelOTP}
                              disabled={verifyingOTP}
                              className="px-4 border-2 border-[#1F2023] bg-white text-xs font-bold uppercase text-[#1F2023] hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>

                          <p className="text-[11px] text-gray-400 mt-3 text-center">
                            Ask the customer for the 6-digit delivery OTP.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#1F2023] bg-white py-12 text-center">
              <Bike className="h-8 w-8 text-gray-300 mx-auto mb-2" />

              <h1 className="text-sm text-gray-500">
                No available assigned order
              </h1>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default RiderDashboard;
