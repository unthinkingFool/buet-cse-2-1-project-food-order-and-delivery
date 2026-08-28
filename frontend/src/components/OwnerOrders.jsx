import { MapPin, Package, Store, User, Phone, Mail, Bike } from "lucide-react";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { updateorderStatus as updateOrderStatusRedux } from "../redux/userSlice";

function OwnerOrders({ orders = [] }) {
  const dispatch = useDispatch();

  // ==========================================
  // AVAILABLE RIDERS
  // ==========================================
  const [availableRiders, setAvailableRiders] = useState([]);

  // ==========================================
  // ASSIGNED RIDERS
  //
  // Object structure:
  //
  // {
  //   shopOrderId: rider
  // }
  //
  // Example:
  //
  // {
  //   1: {
  //      id: 4,
  //      name: "rider-01",
  //      contact_no: "01XXXXXXXXX"
  //   }
  // }
  // ==========================================
  const [assignedRiders, setAssignedRiders] = useState({});

  // ==========================================
  // GET ASSIGNED RIDER
  // ==========================================
  const getAssignedRider = async (shopOrderId) => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/delivery/assigned-rider/${shopOrderId}`,
        {
          withCredentials: true,
        },
      );

      console.log(`ASSIGNED RIDER FOR SHOP ORDER ${shopOrderId}:`, result.data);

      setAssignedRiders((prev) => ({
        ...prev,
        [shopOrderId]: result.data.rider,
      }));
    } catch (error) {
      console.error(
        "GET ASSIGNED RIDER ERROR:",
        error.response?.data || error.message,
      );
    }
  };

  // ==========================================
  // LOAD ASSIGNED RIDERS
  //
  // Runs whenever orders change.
  // ==========================================
  useEffect(() => {
    const loadAssignedRiders = async () => {
      if (!Array.isArray(orders)) return;

      for (const order of orders) {
        if (!Array.isArray(order.shopOrders)) continue;

        for (const shopOrder of order.shopOrders) {
          if (shopOrder.assigned_rider_id) {
            await getAssignedRider(shopOrder.id);
          }
        }
      }
    };

    loadAssignedRiders();
  }, [orders]);

  // ==========================================
  // UPDATE ORDER STATUS
  // ==========================================
  const handleOrderStatusUpdate = async (shopOrderId, status) => {
    console.log("1. HANDLE CALLED:", shopOrderId, status);

    try {
      const result = await axios.patch(
        `${serverUrl}/api/order/shop-order/status`,
        {
          shop_order_id: shopOrderId,
          status,
        },
        {
          withCredentials: true,
        },
      );

      console.log("2. API RESPONSE:", result.data);

      // ==========================================
      // UPDATE REDUX ORDER STATUS
      // ==========================================
      dispatch(
        updateOrderStatusRedux({
          shopOrderId,
          status: result.data.shopOrder.status,
        }),
      );

      // ==========================================
      // AVAILABLE RIDERS
      // ==========================================
      setAvailableRiders(result.data.broadcastedRiders || []);

      console.log("3. AVAILABLE RIDERS:", result.data.broadcastedRiders || []);

      // ==========================================
      // IF A RIDER IS ALREADY ASSIGNED
      // GET ASSIGNED RIDER
      // ==========================================
      if (result.data.shopOrder.assigned_rider_id) {
        await getAssignedRider(shopOrderId);
      }
    } catch (error) {
      console.log(
        "STATUS UPDATE ERROR:",
        error.response?.data || error.message,
      );
    }
  };

  // ==========================================
  // ANIMATION VARIANTS
  // ==========================================
  const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.06 * i, duration: 0.3, ease: "easeOut" },
    }),
  };

  // ==========================================
  // EMPTY STATE
  // ==========================================
  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" />

          <h2 className="text-lg font-black text-[#1F2023]">
            No orders yet
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Orders placed at your restaurant will appear here.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ORDERS
  // ==========================================
  return (
    <div className="space-y-5">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          custom={index}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
          className="overflow-hidden border-2 border-[#1F2023] bg-white"
        >
          {/* ==========================================
              ORDER HEADER
          ========================================== */}

          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-gray-100 px-5 py-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Order #{order.id}</p>

              <p className="mt-1 text-sm font-bold text-[#1F2023]">
                {order.created_at
                  ? new Date(order.created_at).toLocaleString()
                  : "Date unavailable"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Order Total</p>

              <p className="text-base font-black text-[#FF5A36]">
                ৳{order.total_amount}
              </p>
            </div>
          </div>

          {/* ==========================================
              CUSTOMER INFORMATION
          ========================================== */}

          {order.customer && (
            <div className="border-b-2 border-gray-100 px-5 py-4">
              <div className="mb-3 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-[#FF5A36]" />

                <h3 className="text-xs font-black uppercase tracking-wide text-[#1F2023]">Customer</h3>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* NAME */}

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Name</p>

                  <p className="mt-0.5 text-sm font-bold text-[#1F2023]">
                    {order.customer.name || "N/A"}
                  </p>
                </div>

                {/* EMAIL */}

                <div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-gray-400" />

                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Email</p>
                  </div>

                  <p className="mt-0.5 truncate text-sm text-[#1F2023]">
                    {order.customer.email || "N/A"}
                  </p>
                </div>

                {/* CONTACT */}

                <div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-gray-400" />

                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Contact</p>
                  </div>

                  <p className="mt-0.5 text-sm text-[#1F2023]">
                    {order.customer.contact_no || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              DELIVERY ADDRESS
          ========================================== */}

          <div className="border-b-2 border-gray-100 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-[#FFF1EC] p-2">
                <MapPin className="h-4 w-4 text-[#FF5A36]" />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  Delivery Address
                </p>

                <p className="mt-1 text-sm text-[#1F2023]">
                  {order.delivery_address || "Address unavailable"}
                </p>

                {order.latitude && order.longitude && (
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {order.latitude}, {order.longitude}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ==========================================
              SHOP ORDERS
          ========================================== */}

          <div className="space-y-4 p-5">
            {Array.isArray(order.shopOrders) &&
              order.shopOrders.map((shopOrder) => {
                const assignedRider = assignedRiders[shopOrder.id];

                return (
                  <div
                    key={shopOrder.id}
                    className="border-2 border-gray-100 bg-[#FAFAF8] p-4"
                  >
                    {/* ==========================================
                        RESTAURANT
                    ========================================== */}

                    <div className="mb-4 flex items-center gap-3">
                      {shopOrder.restaurant?.image_link ? (
                        <img
                          src={shopOrder.restaurant.image_link}
                          alt={shopOrder.restaurant.name}
                          className="h-11 w-11 object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center bg-white">
                          <Store className="h-5 w-5 text-[#FF5A36]" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black text-[#1F2023]">
                          {shopOrder.restaurant?.name || "Restaurant"}
                        </h3>

                        <p className="text-xs text-gray-400">
                          {shopOrder.restaurant?.city || ""}
                        </p>
                      </div>

                      <div className="ml-auto text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Subtotal</p>

                        <p className="text-sm font-black text-[#1F2023]">
                          ৳{shopOrder.subtotal}
                        </p>
                      </div>
                    </div>

                    {/* ==========================================
                        ORDER STATUS
                    ========================================== */}

                    <div className="mb-4 border-2 border-gray-100 bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                            Order Status
                          </p>

                          <p className="mt-1 text-sm font-bold capitalize text-[#1F2023]">
                            {shopOrder.status?.replaceAll("_", " ") ||
                              "Pending"}
                          </p>
                        </div>

                        <select
                          value={shopOrder.status || "pending"}
                          onChange={(e) =>
                            handleOrderStatusUpdate(
                              shopOrder.id,
                              e.target.value,
                            )
                          }
                          className="border-2 border-gray-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide outline-none transition focus:border-[#FF5A36] cursor-pointer"
                        >
                          <option value="pending">Pending</option>

                          <option value="confirmed">Confirmed</option>

                          <option value="preparing">Preparing</option>

                          <option value="out_for_delivery">
                            Out for Delivery
                          </option>

                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* ==========================================
                        ASSIGNED RIDER
                    ========================================== */}

                    {shopOrder.assigned_rider_id ? (
                      <div className="mb-4 border-2 border-green-200 bg-green-50 p-3.5">
                        <div className="mb-2.5 flex items-center gap-1.5">
                          <Bike className="h-3.5 w-3.5 text-green-600" />

                          <p className="text-xs font-black uppercase tracking-wide text-[#1F2023]">
                            Assigned Rider
                          </p>
                        </div>

                        {assignedRider ? (
                          <div className="flex items-center gap-3 border-2 border-green-100 bg-white px-3.5 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1F2023] text-xs font-bold text-white">
                              {assignedRider.name?.slice(0, 1)?.toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[#1F2023]">
                                {assignedRider.name || "Unknown Rider"}
                              </p>

                              <div className="mt-0.5 flex items-center gap-1">
                                <Phone className="h-3 w-3 text-gray-400" />

                                <p className="text-[11px] text-gray-500">
                                  {assignedRider.contact_no ||
                                    "No contact number"}
                                </p>
                              </div>
                            </div>

                            <div className="ml-auto bg-green-100 px-2.5 py-1">
                              <span className="text-[10px] font-bold uppercase tracking-wide text-green-700">
                                Assigned
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-green-200 bg-white py-3.5 text-center text-[11px] font-bold uppercase tracking-wide text-gray-400">
                            Loading rider information...
                          </div>
                        )}
                      </div>
                    ) : (
                      /* ==========================================
                         AVAILABLE RIDERS
                      ========================================== */

                      shopOrder.status === "out_for_delivery" && (
                        <div className="mb-4 border-2 border-gray-100 bg-white p-3.5">
                          <div className="mb-2.5 flex items-center gap-1.5">
                            <Bike className="h-3.5 w-3.5 text-[#FF5A36]" />

                            <p className="text-xs font-black uppercase tracking-wide text-[#1F2023]">
                              Available Riders
                            </p>
                          </div>

                          {availableRiders.length > 0 ? (
                            <div className="space-y-2">
                              {availableRiders.map((rider, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 bg-[#FAFAF8] px-3 py-2.5"
                                >
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1F2023] text-[10px] font-bold text-white">
                                    {rider.rider_name
                                      ?.slice(0, 1)
                                      ?.toUpperCase()}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-bold text-[#1F2023]">
                                      {rider.rider_name || "Unknown Rider"}
                                    </p>

                                    <p className="text-[11px] text-gray-400">
                                      {rider.rider_contact_no || "No contact"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-200 py-3.5 text-center text-[11px] font-bold uppercase tracking-wide text-gray-400">
                              Waiting For Rider To Accept
                            </div>
                          )}
                        </div>
                      )
                    )}

                    {/* ==========================================
                        ITEMS
                    ========================================== */}

                    <div className="space-y-3">
                      {Array.isArray(shopOrder.items) &&
                        shopOrder.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              {item.image_link ? (
                                <img
                                  src={item.image_link}
                                  alt={item.name}
                                  className="h-12 w-12 shrink-0 object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 shrink-0 bg-gray-200" />
                              )}

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-[#1F2023]">
                                  {item.name}
                                </p>

                                <p className="text-xs text-gray-400">
                                  ৳{item.price} × {item.quantity}
                                </p>
                              </div>
                            </div>

                            <p className="shrink-0 text-sm font-bold text-[#1F2023]">
                              ৳{item.item_total}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* ==========================================
              FOOTER
          ========================================== */}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-gray-100 px-5 py-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Payment Method</p>

              <p className="mt-1 text-sm font-bold uppercase text-[#1F2023]">
                {order.payment_method === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Order ID</p>

              <p className="mt-1 text-sm font-bold text-[#1F2023]">
                #{order.id}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default OwnerOrders;