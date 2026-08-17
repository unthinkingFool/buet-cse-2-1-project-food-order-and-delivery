import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  CreditCard,
  MapPin,
  Mail,
  Package,
  Phone,
  Store,
} from "lucide-react";

import useGetCustomerReceivedOrders from "../hooks/useGetCustomerReceivedOrders";

function CustomerReceivedOrders() {
  const navigate = useNavigate();

  // Get received orders from Redux
  const receivedOrders = useSelector(
    (state) => state.user.receivedOrders
  );

  // Fetch received orders
  useGetCustomerReceivedOrders();

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
            Your Received Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Orders that have been successfully delivered to you
          </p>
        </div>

        {/* Orders */}
        {receivedOrders.length > 0 ? (
          <div className="space-y-5">

            {receivedOrders.map((order) => (
              <div
                key={order.shop_order_id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >

                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-gray-100">

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
                    Received
                  </div>

                </div>


                {/* Restaurant + Rider + Delivery */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">

                  {/* Restaurant */}
                  <div className="rounded-xl bg-gray-50 p-4">

                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#FF5A36]" />
                      Restaurant
                    </h3>

                    <div className="space-y-2 text-sm">

                      <p className="font-medium text-gray-800">
                        {order.restaurant_name}
                      </p>

                      <p className="text-gray-500">
                        {order.restaurant_address}
                      </p>

                      <p className="text-gray-500">
                        {order.restaurant_city}
                      </p>

                      {order.restaurant_contact && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Phone className="w-4 h-4" />
                          {order.restaurant_contact}
                        </div>
                      )}

                    </div>
                  </div>


                  {/* Rider */}
                  <div className="rounded-xl bg-gray-50 p-4">

                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Bike className="w-4 h-4 text-[#FF5A36]" />
                      Delivered By
                    </h3>

                    {order.rider_id ? (
                      <div className="space-y-2 text-sm">

                        <p className="font-medium text-gray-800">
                          {order.rider_name}
                        </p>

                        {order.rider_contact && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Phone className="w-4 h-4" />
                            {order.rider_contact}
                          </div>
                        )}

                        {order.rider_email && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Mail className="w-4 h-4" />
                            {order.rider_email}
                          </div>
                        )}

                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        Rider information unavailable
                      </p>
                    )}

                  </div>


                  {/* Delivery */}
                  <div className="rounded-xl bg-gray-50 p-4">

                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#FF5A36]" />
                      Delivery Address
                    </h3>

                    <div className="text-sm text-gray-600">

                      <p>
                        {order.delivery_address}
                      </p>

                      <p className="text-xs text-gray-400 mt-2">
                        {order.delivery_latitude},{" "}
                        {order.delivery_longitude}
                      </p>

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

                        <div className="flex items-center gap-3">

                          {item.item_image && (
                            <img
                              src={item.item_image}
                              alt={item.item_name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}

                          <div>

                            <p className="font-medium text-gray-800">
                              {item.item_name}
                            </p>

                            <p className="text-xs text-gray-500">
                              ৳{item.price} × {item.quantity}
                            </p>

                          </div>

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

                    Payment:

                    <span className="font-medium text-gray-700">
                      {order.payment_method}
                    </span>
                  </div>

                  <div className="text-right">

                    <p className="text-xs text-gray-400">
                      Order Total
                    </p>

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
              No received orders
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your successfully delivered orders will appear here.
            </p>

          </div>
        )}

      </div>
    </div>
  );
}

export default CustomerReceivedOrders;