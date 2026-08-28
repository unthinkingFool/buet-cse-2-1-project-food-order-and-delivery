import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, ArrowRight } from "lucide-react";
import { useSelector } from "react-redux";
import CartItemCard from "../components/CartItemCard";

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, totalAmount } = useSelector((state) => state.user);

  const fieldVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.08 + i * 0.05, duration: 0.3, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="min-h-screen bg-[#FAFAF8] px-4 sm:px-6 py-10"
    >
      <div className="max-w-4xl mx-auto">
        {/* header */}
        <div>
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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36] mb-2">
            Order summary
          </p>
          <h1 className="text-3xl font-black text-[#1F2023] mb-8">Your Cart</h1>
        </div>

        {/* empty state */}
        {cartItems?.length == 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 bg-white py-20 px-6"
          >
            <div className="h-16 w-16 bg-[#FF5A36]/10 flex items-center justify-center mb-5">
              <ShoppingCart className="h-7 w-7 text-[#FF5A36]" />
            </div>
            <p className="text-sm font-bold uppercase tracking-wide text-gray-500">
              Your Cart Is Empty
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* cart items list */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems?.map((item, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <CartItemCard data={item} />
                </motion.div>
              ))}
            </div>

            {/* order summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
              className="border-2 border-[#1F2023] bg-white p-5 lg:sticky lg:top-24"
            >
              <h1 className="text-sm font-bold uppercase tracking-wide text-[#1F2023] flex items-center justify-between">
                Total Amount <span className="text-[#FF5A36] text-base">Taka {totalAmount}</span>
              </h1>

              <div className="mt-4">
                <motion.button
                  whileHover={{ x: 2, y: 2, boxShadow: "2px 2px 0px 0px #1F2023" }}
                  whileTap={{ x: 4, y: 4, boxShadow: "0px 0px 0px 0px #1F2023" }}
                  onClick={() => {
                    navigate("/checkout");
                  }}
                  style={{ boxShadow: "4px 4px 0px 0px #1F2023" }}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF5A36] py-3.5 text-sm font-bold uppercase tracking-wide text-white cursor-pointer"
                >
                  CheckOut
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default CartPage;