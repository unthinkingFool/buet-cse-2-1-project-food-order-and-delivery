import express from "express";

import {
  getAssignedRiderForShopOrder,
} from "../controllers/delivery.controllers.js";
import { isAuth } from "../middlewares/isAuth.js";

const deliveryRouter = express.Router();

deliveryRouter.get(
  "/assigned-rider/:shop_order_id",
  isAuth,
  getAssignedRiderForShopOrder
);

export default deliveryRouter;
