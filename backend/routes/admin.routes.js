import express from "express";

import {
  adminLogin,
  adminLogout,
  getCurrentAdmin,
  getAdminDashboard,
  getAllRestaurants,
  getRestaurantById,
  approveRestaurant,
  rejectRestaurant,
  suspendUser,
  unsuspendUser,
  getAllCustomers,
  getCustomerById,
  getAllOwners,
  getOwnerById,
  getAllRiders,
  getRiderById,
  getSuspendedUsers,
  getAllIssues,
  getIssueById,
  getAllOrders,
  getOrderById,
  suspendRestaurant,
  unsuspendRestaurant,
  getAllPendingRestaurants,
  getAllSuspendedRestaurants,
} from "../controllers/admin.controllers.js";

import { adminAuth } from "../middlewares/adminAuth.js";

const adminRouter = express.Router();

// ============================================================
// ADMIN AUTH
// ============================================================

adminRouter.post("/login", adminLogin);

adminRouter.post("/logout", adminAuth, adminLogout);

adminRouter.get("/me", adminAuth, getCurrentAdmin);

// ============================================================
// ADMIN DASHBOARD
// ============================================================

adminRouter.get("/dashboard", adminAuth, getAdminDashboard);

// ============================================================
// RESTAURANTS
// ============================================================

adminRouter.get("/restaurants", adminAuth, getAllRestaurants);

adminRouter.get("/restaurants/pending", adminAuth, getAllPendingRestaurants);

adminRouter.get("/restaurants/suspended", adminAuth, getAllSuspendedRestaurants);

adminRouter.get("/restaurants/:id", adminAuth, getRestaurantById);

adminRouter.patch("/restaurants/:id/approve", adminAuth, approveRestaurant);

adminRouter.patch("/restaurants/:id/reject", adminAuth, rejectRestaurant);

// ============================================================
// RESTAURANT SUSPENSION
// ============================================================

adminRouter.patch("/restaurants/:id/suspend", adminAuth, suspendRestaurant);

adminRouter.patch("/restaurants/:id/unsuspend", adminAuth, unsuspendRestaurant);

// ============================================================
// USER SUSPENSION
// ============================================================

adminRouter.patch("/users/:id/suspend", adminAuth, suspendUser);

adminRouter.patch("/users/:id/unsuspend", adminAuth, unsuspendUser);

// ============================================================
// CUSTOMERS
// ============================================================

adminRouter.get("/customers", adminAuth, getAllCustomers);

adminRouter.get("/customers/:id", adminAuth, getCustomerById);

// ============================================================
// RESTAURANT OWNERS
// ============================================================

adminRouter.get("/owners", adminAuth, getAllOwners);

adminRouter.get("/owners/:id", adminAuth, getOwnerById);

// ============================================================
// RIDERS
// ============================================================

adminRouter.get("/riders", adminAuth, getAllRiders);

adminRouter.get("/riders/:id", adminAuth, getRiderById);

// ============================================================
// SUSPENDED USERS
// ============================================================

adminRouter.get("/suspended-users", adminAuth, getSuspendedUsers);

// ============================================================
// ISSUES
// ============================================================
adminRouter.get("/issues", adminAuth, getAllIssues);

adminRouter.get("/issues/:id", adminAuth, getIssueById);

// ============================================================
// ORDERS
// ============================================================

adminRouter.get("/orders", adminAuth, getAllOrders);

adminRouter.get("/orders/:id", adminAuth, getOrderById);

export default adminRouter;
