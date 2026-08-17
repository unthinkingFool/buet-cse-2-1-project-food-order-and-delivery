import express from "express";
import {
    acceptShopOrder,
  getBroadcastedShopOrders,
  getDeliveredOrders,
  getMyAssignedOrders,
} from "../controllers/rider.controllers.js";
import {isAuth} from "../middlewares/isAuth.js"

const riderRouter = express.Router();

riderRouter.get(
  "/broadcasted-shop-orders",isAuth,
  getBroadcastedShopOrders
);
riderRouter.put(
  "/accept-shop-order",isAuth,
  acceptShopOrder
);

// Orders currently assigned to the rider
riderRouter.get("/assigned-orders", isAuth, getMyAssignedOrders);

// Orders already delivered by the rider
riderRouter.get("/delivered-orders", isAuth, getDeliveredOrders);


export default riderRouter;