import express from "express";
import {
    acceptShopOrder,
  getBroadcastedShopOrders,
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


export default riderRouter;