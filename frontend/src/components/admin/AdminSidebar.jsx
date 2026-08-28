import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  Users,
  Bike,
  ShoppingBag,
  AlertCircle,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    name: "Admin Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    name: "Restaurants",
    path: "/admin/restaurants",
    icon: Store,
  },
  {
    name: "Customers",
    path: "/admin/customers",
    icon: Users,
  },
  {
    name: "Riders",
    path: "/admin/riders",
    icon: Bike,
  },
  {
    name: "Orders",
    path: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    name: "Issues",
    path: "/admin/issues",
    icon: AlertCircle,
  },
];

function AdminSidebar() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-64 min-h-screen bg-white border-r-2 border-[#1F2023] flex flex-col"
    >
      {/* ================================================= */}
      {/* LOGO */}
      {/* ================================================= */}

      <div className="h-20 px-6 flex items-center border-b-2 border-[#1F2023]">
        <div>
          <h1 className="text-2xl font-black text-[#FF5A36]">
            KhaiDai
          </h1>

          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mt-0.5">
            Admin Panel
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* MENU */}
      {/* ================================================= */}

      <nav className="flex-1 p-4">
        <p className="px-3 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
          Menu
        </p>

        <div className="space-y-1.5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.25, ease: "easeOut" }}
              >
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 border-2 text-sm font-bold uppercase tracking-wide transition ${
                      isActive
                        ? "bg-[#FF5A36] border-[#1F2023] text-white"
                        : "border-transparent text-gray-600 hover:border-[#1F2023] hover:bg-gray-50"
                    }`
                  }
                >
                  <Icon size={19} />

                  <span>{item.name}</span>
                </NavLink>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* ================================================= */}
      {/* ADMIN INFO */}
      {/* ================================================= */}

      <div className="p-4 border-t-2 border-[#1F2023]">
        <div className="border-2 border-gray-200 bg-[#FAFAF8] p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
            Logged in as
          </p>

          <p className="text-sm font-bold text-[#1F2023] mt-1 truncate">
            Administrator
          </p>
        </div>
      </div>
    </motion.aside>
  );
}

export default AdminSidebar;