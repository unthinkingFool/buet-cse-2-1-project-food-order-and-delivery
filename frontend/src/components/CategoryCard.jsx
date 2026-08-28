import React from "react";
import { motion } from "framer-motion";

function CategoryCard({ name, image , onClick}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col items-center gap-2 shrink-0 w-20 cursor-pointer group"
      onClick={onClick}
    >
      {/* image */}
      <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-[#1F2023] bg-white transition-colors group-hover:border-[#FF5A36]">
        <img src={image} alt={name} className="h-full w-full object-cover" />
      </div>
      {/* label */}
      <div className="text-[11px] font-bold uppercase tracking-wide text-[#1F2023] text-center truncate w-full">
        {name}
      </div>
    </motion.div>
  );
}

export default CategoryCard;