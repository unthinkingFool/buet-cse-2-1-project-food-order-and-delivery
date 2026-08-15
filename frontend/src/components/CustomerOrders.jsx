import React from "react";
import { MapPin, Package, Store,Truck } from "lucide-react";

function CustomerOrders({ orders = [] }) {
  if (!orders.length) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" />

          <h2 className="text-lg font-semibold text-[#1F2023]">
            No orders yet
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Your completed and ongoing orders will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {orders.map((order) => (
        <div
          key={order.id}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          {/* ORDER HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div>
              <p className="text-xs text-gray-400">Order #{order.id}</p>

              <p className="mt-1 text-sm font-medium text-[#1F2023]">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-400">Total</p>

              <p className="text-base font-bold text-[#FF5A36]">
                ৳{order.total_amount}
              </p>
            </div>
          </div>

          {/* DELIVERY INFORMATION */}
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-[#FFF1EC] p-2">
                <MapPin className="h-4 w-4 text-[#FF5A36]" />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400">
                  Delivery Address
                </p>

                <p className="mt-1 text-sm text-[#1F2023]">
                  {order.delivery_address}
                </p>
              </div>
            </div>
          </div>

          {/* SHOP ORDERS */}
          <div className="space-y-4 p-5">
            {order.shopOrders?.map((shopOrder) => (
              <div
                key={shopOrder.id}
                className="rounded-xl border border-gray-100 bg-[#FAFAF8] p-4"
              >
                {/* RESTAURANT */}
                <div className="mb-4 flex items-center gap-3">
                  {shopOrder.restaurant_image ? (
                    <img
                      src={shopOrder.restaurant_image}
                      alt={shopOrder.restaurant_name}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                      <Store className="h-5 w-5 text-[#FF5A36]" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-[#1F2023]">
                      {shopOrder.restaurant_name}
                    </h3>

                    <p className="text-xs text-gray-400">
                      {shopOrder.restaurant_city}
                    </p>
                  </div>

                  <div className="ml-auto text-right">
                    <p className="text-xs text-gray-400">Subtotal</p>

                    <p className="text-sm font-bold text-[#1F2023]">
                      ৳{shopOrder.subtotal}
                    </p>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-400">Order Status</p>

                    <p className="mt-1 text-sm font-bold capitalize text-[#1F2023]">
                      {shopOrder.status?.replaceAll("_", " ") || "Pending"}
                    </p>
                  </div>

                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF5A36]" />
                </div>

                {/* ITEMS */}
                <div className="space-y-3">
                  {shopOrder.items?.map((item) => (
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
                <div className="mt-3">
                  <button
                    disabled={!shopOrder.assigned_rider_id}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed disabled:active:scale-100 ${
                      shopOrder.assigned_rider_id
                        ? "border-[#FF5A36] text-[#FF5A36] hover:bg-[#FF5A36] hover:text-white"
                        : "border-gray-200 text-gray-400 bg-gray-50"
                    }`}
                  >
                    <Truck className="h-3.5 w-3.5" />
                    Track Order
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAYMENT */}
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
            <span className="text-xs text-gray-400">Payment</span>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase text-gray-600">
              {order.payment_method === "cod"
                ? "Cash on Delivery"
                : "Online Payment"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CustomerOrders;
