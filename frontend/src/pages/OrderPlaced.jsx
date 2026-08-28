import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { clearCart } from "../redux/userSlice";
import { CheckCircle2, ClipboardList, UtensilsCrossed } from "lucide-react";

function OrderPlaced() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (location.state?.orderPlaced) {
      dispatch(clearCart());

      // Remove the navigation state so refresh doesn't repeat it
      window.history.replaceState({}, document.title);
    }
  }, [location.state, dispatch]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-6 py-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
        className="w-full max-w-sm border-2 border-[#1F2023] bg-white p-8 text-center"
      >
        {/* success icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="mx-auto h-16 w-16 bg-[#FF5A36]/10 flex items-center justify-center mb-5"
        >
          <CheckCircle2 className="h-9 w-9 text-[#FF5A36]" />
        </motion.div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36] mb-2">
          Done
        </p>
        <h1 className="text-2xl font-black text-[#1F2023]">
          Your Order Has Been Placed!
        </h1>
        <p className="text-sm text-gray-500 mt-2">Thank You For Your Order</p>

        {/* My Orders */}
        <motion.span
          whileHover={{ x: 2, y: 2, boxShadow: "2px 2px 0px 0px #1F2023" }}
          whileTap={{ x: 4, y: 4, boxShadow: "0px 0px 0px 0px #1F2023" }}
          onClick={() => navigate("/my-orders")}
          style={{ boxShadow: "4px 4px 0px 0px #1F2023" }}
          className="mt-7 inline-flex items-center justify-center gap-2 w-full bg-[#FF5A36] py-3.5 text-sm font-bold uppercase tracking-wide text-white cursor-pointer"
        >
          <ClipboardList className="h-4 w-4" />
          My Orders
        </motion.span>

        <div className="flex items-center justify-center gap-1.5 mt-7 text-xs font-bold uppercase tracking-wide text-gray-400">
          <UtensilsCrossed className="h-3.5 w-3.5" />
          Happy Foodie!!!
        </div>
      </motion.div>
    </motion.div>
  );
}

export default OrderPlaced;