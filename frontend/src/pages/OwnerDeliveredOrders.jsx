import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Package,
  CreditCard,
  CheckCircle2,
  Bike,
} from "lucide-react";

import useGetOwnerCompletedOrders from "../hooks/useGetOwnerCompletedOrders";

function OwnerDeliveredOrders() {
  const navigate = useNavigate();

  const [completedOrdersOwner, setcompletedOrdersOwner] = useState([]);

  useGetOwnerCompletedOrders(setcompletedOrdersOwner);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Your Completed Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Orders successfully delivered to your customers
          </p>
        </div>

        {/* Orders */}
        {completedOrdersOwner.length > 0 ? (
          <div className="space-y-5">
            {completedOrdersOwner.map((order) => (
              <div
                key={order.shop_order_id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-5 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      Order #{order.order_id}
                    </p>

                    <h2 className="text-lg font-semibold text-gray-900 mt-1">
                      {order.restaurant_name}
                    </h2>
                  </div>

                  <div className="inline-flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-2 rounded-full w-fit">
                    <CheckCircle2 className="w-4 h-4" />
                    Delivered
                  </div>
                </div>

                {/* Customer + Rider + Delivery */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
                  {/* Customer */}
                  <div className="rounded-xl bg-gray-50 p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Customer
                    </h3>

                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-gray-800">
                        {order.customer_name}
                      </p>

                      <div className="flex items-center gap-2 text-gray-500">
                        <Phone className="w-4 h-4" />
                        {order.customer_contact}
                      </div>

                      <div className="flex items-center gap-2 text-gray-500">
                        <Mail className="w-4 h-4" />
                        {order.customer_email}
                      </div>
                    </div>
                  </div>

                  {/* Rider */}
                  <div className="rounded-xl bg-gray-50 p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Delivered By
                    </h3>

                    {order.rider_id ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Bike className="w-4 h-4 text-[#FF5A36]" />

                          <p className="font-medium text-gray-800">
                            {order.rider_name}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-gray-500">
                          <Phone className="w-4 h-4" />
                          {order.rider_contact}
                        </div>

                        <div className="flex items-center gap-2 text-gray-500">
                          <Mail className="w-4 h-4" />
                          {order.rider_email}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        Rider information unavailable
                      </p>
                    )}
                  </div>

                  {/* Delivery */}
                  <div className="rounded-xl bg-gray-50 p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Delivery
                    </h3>

                    <div className="flex gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#FF5A36]" />

                      <div>
                        <p>{order.delivery_address}</p>

                        <p className="text-xs text-gray-400 mt-1">
                          {order.delivery_latitude}, {order.delivery_longitude}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-gray-500" />

                    <h3 className="font-semibold text-gray-900">
                      Ordered Items
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div
                        key={item.order_item_id}
                        className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.item_name}
                          </p>

                          <p className="text-xs text-gray-500">
                            ৳{item.price} × {item.quantity}
                          </p>
                        </div>

                        <p className="font-semibold text-gray-900">
                          ৳{item.item_total}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CreditCard className="w-4 h-4" />
                    Payment:{" "}
                    <span className="font-medium text-gray-700">
                      {order.payment_method}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-400">Order Total</p>

                    <p className="text-xl font-bold text-[#FF5A36]">
                      ৳{order.subtotal}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-300" />

            <h2 className="mt-4 text-lg font-semibold text-gray-800">
              No completed orders
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your delivered orders will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerDeliveredOrders;
