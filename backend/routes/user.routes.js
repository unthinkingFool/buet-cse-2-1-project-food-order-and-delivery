import express from "express";

import {
  getCurrentUser,
  getMyDeliveryCompletionNotifications,
  markDeliveryNotificationRead,
  getMyReceivedOrders,
  updateUserLocation,
} from "../controllers/user.controllers.js";

import { isAuth } from "../middlewares/isAuth.js";

const userRouter = express.Router();

userRouter.get(
  "/current",
  isAuth,
  getCurrentUser
);

userRouter.put(
  "/location",
  isAuth,
  updateUserLocation
);
userRouter.get(
  "/received-orders",
  isAuth,
  getMyReceivedOrders
)
userRouter.get(
  "/delivery-notifications",
  isAuth,
  getMyDeliveryCompletionNotifications,
);
userRouter.patch(
  "/delivery-notifications/read",
  isAuth,
  markDeliveryNotificationRead,
);

export default userRouter;
