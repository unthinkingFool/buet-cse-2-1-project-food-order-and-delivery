import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Package,
  CreditCard,
  CheckCircle2,
  Bike,
  User,
} from "lucide-react";

import useGetOwnerCompletedOrders from "../hooks/useGetOwnerCompletedOrders";

function OwnerDeliveredOrders() {
  const navigate = useNavigate();

  const [completedOrdersOwner, setcompletedOrdersOwner] = useState([]);

  useGetOwnerCompletedOrders(setcompletedOrdersOwner);

  const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.06 * i, duration: 0.3, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="min-h-screen bg-[#FAFAF8] px-4 py-10 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
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

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36] mb-2">
            Delivered
          </p>
          <h1 className="text-3xl font-black text-[#1F2023]">Your Completed Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Orders successfully delivered to your customers
          </p>
        </div>

        {/* Orders */}
        {completedOrdersOwner.length > 0 ? (
          <div className="space-y-5">
            {completedOrdersOwner.map((order, index) => (
              <motion.div
                key={order.shop_order_id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
                className="overflow-hidden border-2 border-[#1F2023] bg-white"
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-b-2 border-gray-100">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Order #{order.order_id}</p>
                    <h2 className="text-sm font-black text-[#1F2023] mt-0.5">
                      {order.restaurant_name}
                    </h2>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-green-600 bg-green-50 px-2.5 py-1 w-fit">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Delivered
                  </div>
                </div>

                {/* Customer + Rider + Delivery */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                  {/* Customer */}
                  <div className="bg-[#FAFAF8] border-2 border-gray-100 p-3">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-[#FF5A36]" />
                      Customer
                    </h3>

                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-[#1F2023]">{order.customer_name}</p>

                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Phone className="h-3 w-3" />
                        {order.customer_contact}
                      </div>

                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Mail className="h-3 w-3" />
                        {order.customer_email}
                      </div>
                    </div>
                  </div>

                  {/* Rider */}
                  <div className="bg-[#FAFAF8] border-2 border-gray-100 p-3">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2 flex items-center gap-1.5">
                      <Bike className="h-3.5 w-3.5 text-[#FF5A36]" />
                      Delivered By
                    </h3>

                    {order.rider_id ? (
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-[#1F2023]">{order.rider_name}</p>

                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Phone className="h-3 w-3" />
                          {order.rider_contact}
                        </div>

                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Mail className="h-3 w-3" />
                          {order.rider_email}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Rider information unavailable</p>
                    )}
                  </div>

                  {/* Delivery */}
                  <div className="bg-[#FAFAF8] border-2 border-gray-100 p-3">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#FF5A36]" />
                      Delivery
                    </h3>

                    <div className="text-xs text-gray-500">
                      <p>{order.delivery_address}</p>
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        {order.delivery_latitude}, {order.delivery_longitude}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Package className="h-3.5 w-3.5 text-[#FF5A36]" />
                    <h3 className="text-xs font-bold uppercase tracking-wide text-[#1F2023]">Ordered Items</h3>
                  </div>

                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div
                        key={item.order_item_id}
                        className="flex items-center justify-between bg-[#FAFAF8] border-2 border-gray-100 px-3 py-2"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#1F2023]">
                            {item.item_name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            ৳{item.price} × {item.quantity}
                          </p>
                        </div>

                        <p className="text-xs font-bold text-[#1F2023]">
                          ৳{item.item_total}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-[#FAFAF8] border-t-2 border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
                    <CreditCard className="h-3.5 w-3.5" />
                    Payment:{" "}
                    <span className="text-[#1F2023]">{order.payment_method}</span>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Order Total</p>
                    <p className="text-base font-black text-[#FF5A36]">৳{order.subtotal}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 bg-white py-16 text-center">
            <Package className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#1F2023]">No completed orders</h2>
            <p className="mt-1 text-xs text-gray-400">
              Your delivered orders will appear here.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default OwnerDeliveredOrders;