import express from "express";

import { isAuth } from "../middlewares/isAuth.js";

import {
  initiatePayment,
} from "../controllers/payment.controllers.js";

const paymentRouter = express.Router();

paymentRouter.post(
  "/initiate",
  isAuth,
  initiatePayment,
);

export default paymentRouter;