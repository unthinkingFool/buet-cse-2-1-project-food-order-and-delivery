import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { deleteCartItem, updateQuantity } from "../redux/userSlice";

function CartItemCard({ data }) {
  const dispatch = useDispatch();

  const handleIncrease = (id, currQuan) => {
    dispatch(
      updateQuantity({
        id,
        quantity: currQuan + 1,
      }),
    );
  };

  const handleDecrease = (id, currQuan) => {
    if (currQuan > 1) {
      dispatch(
        updateQuantity({
          id,
          quantity: currQuan - 1,
        }),
      );
    }
  };

  return (
    <motion.div
      whileHover={{ x: 2, y: 2, boxShadow: "1px 1px 0px 0px #1F2023" }}
      style={{ boxShadow: "3px 3px 0px 0px #1F2023" }}
      className="flex flex-col sm:flex-row sm:items-center gap-4 border-2 border-[#1F2023] bg-white p-4"
    >
      {/* left side */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="h-16 w-16 shrink-0 overflow-hidden bg-gray-100 border-2 border-gray-100">
          <img src={data.image} alt={data.name} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0">
          <h1 className="text-sm font-black text-[#1F2023] truncate">{data.name}</h1>

          <p className="text-xs text-gray-500 mt-0.5">
            Taka {data.price} X {data.quantity}
          </p>

          <p className="text-sm font-bold text-[#1F2023] mt-0.5">
            Taka {data.price * data.quantity}
          </p>

          <h3 className="text-[11px] text-gray-400 mt-0.5 truncate">{data.restaurant}</h3>
        </div>
      </div>

      {/* right side */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        {/* quantity stepper */}
        <div className="flex items-center gap-1 border-2 border-gray-200 px-2 py-1.5">
          <button
            onClick={() => handleDecrease(data.id, data.quantity)}
            aria-label="decrease quantity"
            className="h-6 w-6 flex items-center justify-center text-[#1F2023] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <h1 className="text-sm font-bold text-[#1F2023] w-6 text-center">
            {data.quantity}
          </h1>

          <button
            onClick={() => handleIncrease(data.id, data.quantity)}
            aria-label="increase quantity"
            className="h-6 w-6 flex items-center justify-center text-[#1F2023] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* delete */}
        <button
          onClick={() => dispatch(deleteCartItem(data.id))}
          className="flex items-center gap-1.5 border-2 border-red-200 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-red-600 transition hover:bg-red-50 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </motion.div>
  );
}

export default CartItemCard;