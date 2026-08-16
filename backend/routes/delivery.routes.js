import express from "express";

import {
  getAssignedRiderForShopOrder,
} from "../controllers/delivery.controllers.js";

const deliveryRouter = express.Router();

deliveryRouter.get(
  "/assigned-rider/:shop_order_id",
  getAssignedRiderForShopOrder
);

export default deliveryRouter;