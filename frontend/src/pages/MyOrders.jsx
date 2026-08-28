import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import useGetMyOrders from "../hooks/useGetMyOrders";
import CustomerOrders from "../components/CustomerOrders";
import OwnerOrders from "../components/OwnerOrders";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function MyOrders() {
  useGetMyOrders();
  const navigate=useNavigate()

  const { userData, myOrders } = useSelector(
    (state) => state.user
  );

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

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36] mb-2">
            History
          </p>
          <h1 className="text-3xl font-black text-[#1F2023]">
            My Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage your orders.
          </p>
        </div>

        {userData?.role === "customer" && (
          <CustomerOrders orders={myOrders} />
        )}

        {userData?.role === "owner" && (
          <OwnerOrders orders={myOrders} />
        )}

      </div>
    </motion.div>
  );
}

export default MyOrders;