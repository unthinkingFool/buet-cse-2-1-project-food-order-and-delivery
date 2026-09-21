import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";

import useGetAdminDashboard from "../../hooks/admin/useGetAdminDashboard";
import useGetAllRestaurants from "../../hooks/admin/useGetAllRestaurants";
import useApproveRestaurant from "../../hooks/admin/useApproveRestaurant";

import { approveRestaurantInState } from "../../redux/adminSlice";

import useGetPendingRestaurants from "../../hooks/admin/useGetPendingRestaurants";
import useGetSuspendedRestaurants from "../../hooks/admin/useGetSuspendedRestaurants";

function AdminDashboard() {
  // ============================================================
  // FETCH DATA
  // ============================================================

  useGetAdminDashboard();
  useGetAllRestaurants();
  useGetPendingRestaurants();
  useGetSuspendedRestaurants();

  // ============================================================
  // REDUX
  // ============================================================

  const dispatch = useDispatch();

  const { dashboardData, restaurants, loading, error } = useSelector(
    (state) => state.admin,
  );

  // ============================================================
  // APPROVE RESTAURANT
  // ============================================================

  const { approveRestaurant } = useApproveRestaurant();

  const [approvingId, setApprovingId] = useState(null);

  // ============================================================
  // ANIMATION VARIANTS
  // ============================================================

  const sectionVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.08 * i, duration: 0.35, ease: "easeOut" },
    }),
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.05 * i, duration: 0.3, ease: "easeOut" },
    }),
  };

  // ============================================================
  // INITIAL LOADING
  // ============================================================

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] p-6">
        <div
          style={{ boxShadow: "4px 4px 0px 0px #1F2023" }}
          className="border-2 border-[#1F2023] bg-white p-6"
        >
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // NO DASHBOARD DATA
  // ============================================================

  if (!dashboardData) {
    return null;
  }

  // ============================================================
  // DASHBOARD DATA
  // ============================================================

  const { users, restaurants: restaurantStats, orders } = dashboardData;

  // ============================================================
  // APPROVE RESTAURANT
  // ============================================================

  const handleApprove = async (restaurantId) => {
    try {
      setApprovingId(restaurantId);

      const result = await approveRestaurant(restaurantId);

      // ----------------------------------------------------------
      // FAILED
      // ----------------------------------------------------------

      if (!result?.success) {
        return;
      }

      // ----------------------------------------------------------
      // UPDATE REDUX
      // ----------------------------------------------------------

      dispatch(approveRestaurantInState(result.restaurant));
    } catch (error) {
      console.error("APPROVE RESTAURANT ERROR:", error);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className=" p-6">
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <motion.div
        custom={0}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-[#1F2023]">Admin Dashboard</h1>

        <p className="text-gray-500 mt-1">Manage your KhaiDai platform</p>
      </motion.div>

      {/* ====================================================== */}
      {/* USER STATISTICS */}
      {/* ====================================================== */}

      <motion.section custom={1} variants={sectionVariants} initial="hidden" animate="visible" className="mb-8">
        <h2 className="text-xl font-black text-[#1F2023] mb-4">Users</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Customers" value={users.customers} index={0} />

          <StatCard title="Restaurant Owners" value={users.restaurantOwners} index={1} />

          <StatCard title="Riders" value={users.riders} index={2} />
        </div>
      </motion.section>

      {/* ====================================================== */}
      {/* RESTAURANT STATISTICS */}
      {/* ====================================================== */}

      <motion.section custom={2} variants={sectionVariants} initial="hidden" animate="visible" className="mb-8">
        <h2 className="text-xl font-black text-[#1F2023] mb-4">Restaurants</h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard title="Total" value={restaurantStats.total} index={0} />

          <StatCard title="Approved" value={restaurantStats.approved} index={1} />

          <StatCard title="Pending" value={restaurantStats.pending} index={2} />

          <StatCard title="Open" value={restaurantStats.open} index={3} />

          <StatCard title="Closed" value={restaurantStats.closed} index={4} />
        </div>
      </motion.section>

      {/* ====================================================== */}
      {/* ORDER STATISTICS */}
      {/* ====================================================== */}

      <motion.section custom={3} variants={sectionVariants} initial="hidden" animate="visible" className="mb-8">
        <h2 className="text-xl font-black text-[#1F2023] mb-4">Orders</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard title="Total" value={orders.total} index={0} />

          <StatCard title="Pending" value={orders.pending} index={1} />

          <StatCard title="Confirmed" value={orders.confirmed} index={2} />

          <StatCard title="Preparing" value={orders.preparing} index={3} />

          <StatCard title="Out for Delivery" value={orders.outForDelivery} index={4} />

          <StatCard title="Delivered" value={orders.delivered} index={5} />

          <StatCard title="Cancelled" value={orders.cancelled} index={6} />
        </div>
      </motion.section>

      {/* ====================================================== */}
      {/* RESTAURANT MANAGEMENT */}
      {/* ====================================================== */}

      
    </div>
  );
}

/* ========================================================= */
/* STAT CARD */
/* ========================================================= */

function StatCard({ title, value, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 2, y: 2, boxShadow: "1px 1px 0px 0px #1F2023" }}
      transition={{ delay: 0.04 * index, duration: 0.3, ease: "easeOut" }}
      style={{ boxShadow: "3px 3px 0px 0px #1F2023" }}
      className="border-2 border-[#1F2023] bg-white p-5"
    >
      <p className="text-sm text-gray-500">{title}</p>

      <p className="text-2xl font-black mt-2 text-[#1F2023]">{value}</p>
    </motion.div>
  );
}

export default AdminDashboard;