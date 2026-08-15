import React from "react";

function CategoryCard({ name, image }) {
  return (
    <div className="flex flex-col items-center gap-2 shrink-0 w-20 cursor-pointer group">
      {/* image */}
      <div className="h-16 w-16 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-white transition-transform group-hover:scale-105 group-hover:border-[#FF5A36]/50">
        <img src={image} alt={name} className="h-full w-full object-cover" />
      </div>
      {/* label */}
      <div className="text-xs font-medium text-[#1F2023] text-center truncate w-full">
        {name}
      </div>
    </div>
  );
}

export default CategoryCard;