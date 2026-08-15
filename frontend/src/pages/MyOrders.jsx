import React from "react";
import { useSelector } from "react-redux";
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
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-8 sm:px-6">
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

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1F2023]">
            My Orders
          </h1>

          <p className="mt-1 text-sm text-gray-400">
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
    </div>
  );
}

export default MyOrders;