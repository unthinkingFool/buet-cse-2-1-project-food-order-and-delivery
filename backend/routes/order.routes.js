import express from "express";

import { isAuth } from "../middlewares/isAuth.js";
import {
  createOrder,
  getOrders,
  getShopOrderById,
  updateOrderStatus,
} from "../controllers/order.controllers.js";

const orderRouter = express.Router();

orderRouter.post("/create", isAuth, createOrder);
orderRouter.get("/orders", isAuth, getOrders);
orderRouter.patch("/shop-order/status", isAuth, updateOrderStatus);
orderRouter.get("/shop-order/:shop_order_id", isAuth, getShopOrderById);

export default orderRouter;
