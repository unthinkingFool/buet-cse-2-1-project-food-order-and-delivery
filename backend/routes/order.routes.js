import express from "express";

import { isAuth } from "../middlewares/isAuth.js";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  
} from "../controllers/order.controllers.js";

const orderRouter = express.Router();

orderRouter.post("/create", isAuth, createOrder);
orderRouter.get("/orders", isAuth, getOrders);
orderRouter.patch(
  "/shop-order/status",
  isAuth,
  updateOrderStatus
);

export default orderRouter;
