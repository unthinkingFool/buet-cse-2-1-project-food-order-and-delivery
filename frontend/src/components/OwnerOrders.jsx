import { MapPin, Package, Store, User, Phone, Mail } from "lucide-react";
import React from "react";
import axios from "axios";

import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { updateorderStatus as updateOrderStatusRedux } from "../redux/userSlice";
function OwnerOrders({ orders = [] }) {
  // ==========================================
  // EMPTY STATE
  // ==========================================
  const dispatch = useDispatch();
  const handleOrderStatusUpdate = async (shopOrderId, status) => {
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

      dispatch(
        updateOrderStatusRedux({
          shopOrderId,
          status: result.data.shopOrder.status,
        }),
      );

      console.log("STATUS UPDATED:", result.data);
    } catch (error) {
      console.log(
        "STATUS UPDATE ERROR:",
        error.response?.data || error.message,
      );
    }
  };

  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" />

          <h2 className="text-lg font-semibold text-[#1F2023]">
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
      {orders.map((order) => (
        <div
          key={order.id}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          {/* ==========================================
              ORDER HEADER
          ========================================== */}

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
            <div>
              <p className="text-xs text-gray-400">Order #{order.id}</p>

              <p className="mt-1 text-sm font-medium text-[#1F2023]">
                {order.created_at
                  ? new Date(order.created_at).toLocaleString()
                  : "Date unavailable"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-400">Order Total</p>

              <p className="text-base font-bold text-[#FF5A36]">
                ৳{order.total_amount}
              </p>
            </div>
          </div>

          {/* ==========================================
              CUSTOMER INFORMATION
          ========================================== */}

          {order.customer && (
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-[#FF5A36]" />

                <h3 className="text-sm font-bold text-[#1F2023]">Customer</h3>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Name */}
                <div>
                  <p className="text-xs text-gray-400">Name</p>

                  <p className="mt-1 text-sm font-medium text-[#1F2023]">
                    {order.customer.name || "N/A"}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />

                    <p className="text-xs text-gray-400">Email</p>
                  </div>

                  <p className="mt-1 truncate text-sm text-[#1F2023]">
                    {order.customer.email || "N/A"}
                  </p>
                </div>

                {/* Contact */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />

                    <p className="text-xs text-gray-400">Contact</p>
                  </div>

                  <p className="mt-1 text-sm text-[#1F2023]">
                    {order.customer.contact_no || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              DELIVERY ADDRESS
          ========================================== */}

          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#FFF1EC] p-2">
                <MapPin className="h-4 w-4 text-[#FF5A36]" />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400">
                  Delivery Address
                </p>

                <p className="mt-1 text-sm text-[#1F2023]">
                  {order.delivery_address || "Address unavailable"}
                </p>

                {order.latitude && order.longitude && (
                  <p className="mt-1 text-xs text-gray-400">
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
              order.shopOrders.map((shopOrder) => (
                <div
                  key={shopOrder.id}
                  className="rounded-xl border border-gray-100 bg-[#FAFAF8] p-4"
                >
                  {/* RESTAURANT */}

                  <div className="mb-4 flex items-center gap-3">
                    {shopOrder.restaurant?.image_link ? (
                      <img
                        src={shopOrder.restaurant.image_link}
                        alt={shopOrder.restaurant.name}
                        className="h-11 w-11 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                        <Store className="h-5 w-5 text-[#FF5A36]" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-[#1F2023]">
                        {shopOrder.restaurant?.name || "Restaurant"}
                      </h3>

                      <p className="text-xs text-gray-400">
                        {shopOrder.restaurant?.city || ""}
                      </p>
                    </div>

                    <div className="ml-auto text-right">
                      <p className="text-xs text-gray-400">Subtotal</p>

                      <p className="text-sm font-bold text-[#1F2023]">
                        ৳{shopOrder.subtotal}
                      </p>
                    </div>
                  </div>

                  {/* ORDER STATUS */}

                  <div className="mb-4 rounded-xl border border-gray-100 bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-400">Order Status</p>

                        <p className="mt-1 text-sm font-bold capitalize text-[#1F2023]">
                          {shopOrder.status?.replaceAll("_", " ") || "Pending"}
                        </p>
                      </div>

                      <select
                        value={shopOrder.status || "pending"}
                        onChange={(e) =>
                          handleOrderStatusUpdate(shopOrder.id, e.target.value)
                        }
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#FF5A36]"
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
                                className="h-12 w-12 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-200" />
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#1F2023]">
                                {item.name}
                              </p>

                              <p className="text-xs text-gray-400">
                                ৳{item.price} × {item.quantity}
                              </p>
                            </div>
                          </div>

                          <p className="shrink-0 text-sm font-semibold text-[#1F2023]">
                            ৳{item.item_total}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>

          {/* ==========================================
              FOOTER
          ========================================== */}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
            <div>
              <p className="text-xs text-gray-400">Payment Method</p>

              <p className="mt-1 text-sm font-semibold uppercase text-[#1F2023]">
                {order.payment_method === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-400">Order ID</p>

              <p className="mt-1 text-sm font-semibold text-[#1F2023]">
                #{order.id}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OwnerOrders;
