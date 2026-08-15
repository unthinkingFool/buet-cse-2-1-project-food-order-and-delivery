import express from "express";
import {
  createOrEditRestaurant,
  getItemsByCity,
  getMyItems,
  getMyRestaurant,
  getRestaurantByCity,
} from "../controllers/restaurant.controllers.js";
import { isAuth } from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
const shopRouter = express.Router();

shopRouter.post(
  "/create-edit-restaurant",
  isAuth,
  upload.single("image"),
  createOrEditRestaurant,
);
shopRouter.get("/get-my", isAuth, getMyRestaurant);
shopRouter.get("/my-items", isAuth, getMyItems);
shopRouter.get("/get-by-city/:city", isAuth, getRestaurantByCity);
shopRouter.get("/items-city/:city", getItemsByCity);

export default shopRouter;
