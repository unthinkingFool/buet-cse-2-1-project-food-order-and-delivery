import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";
import CartItemCard from "../components/CartItemCard";

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, totalAmount } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 sm:px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* header */}
        <div>
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
          <h1 className="text-2xl font-bold text-[#1F2023] mb-6">Your Cart</h1>
        </div>

        {/* empty state */}
        {cartItems?.length == 0 ? (
          <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 px-6">
            <div className="h-14 w-14 rounded-2xl bg-[#FF5A36]/10 flex items-center justify-center mb-4">
              <ShoppingCart className="h-7 w-7 text-[#FF5A36]" />
            </div>
            <p className="text-sm text-gray-500">Your Cart Is Empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* cart items list */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems?.map((item, index) => (
                <CartItemCard data={item} key={index} />
              ))}
            </div>

            {/* order summary */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 lg:sticky lg:top-24">
              <h1 className="text-base font-bold text-[#1F2023] flex items-center justify-between">
                Total Amount : <span className="text-[#FF5A36]">Taka {totalAmount}</span>
              </h1>

              <div className="mt-4">
                <button
                  onClick={() => {
                    navigate("/checkout");
                  }}
                  className="w-full rounded-lg bg-[#FF5A36] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94e2c] active:scale-[0.99] cursor-pointer"
                >
                  CheckOut
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;