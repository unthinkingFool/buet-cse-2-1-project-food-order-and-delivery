import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
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
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white shadow-sm p-8 text-center">
        {/* success icon */}
        <div className="mx-auto h-16 w-16 rounded-full bg-[#FF5A36]/10 flex items-center justify-center mb-5 animate-[scaleIn_0.3s_ease-out]">
          <CheckCircle2 className="h-9 w-9 text-[#FF5A36]" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-[#FF5A36] mb-1">
          Done
        </p>
        <h1 className="text-xl font-bold text-[#1F2023]">
          Your Order Has Been Placed!
        </h1>
        <p className="text-sm text-gray-500 mt-2">Thank You For Your Order</p>

        {/* My Orders */}
        <span
          onClick={() => navigate("/my-orders")}
          className="mt-6 inline-flex items-center justify-center gap-2 w-full rounded-lg bg-[#FF5A36] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94e2c] active:scale-[0.99] cursor-pointer"
        >
          <ClipboardList className="h-4 w-4" />
          My Orders
        </span>

        <div className="flex items-center justify-center gap-1.5 mt-6 text-sm font-medium text-gray-400">
          <UtensilsCrossed className="h-3.5 w-3.5" />
          Happy Foodie!!!
        </div>
      </div>
    </div>
  );
}

export default OrderPlaced;
