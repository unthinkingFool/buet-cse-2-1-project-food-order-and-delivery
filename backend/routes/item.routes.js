import express from "express";

import { isAuth } from "../middlewares/isAuth.js";

import {
  addItem,
  editItem,
  deleteItem,
  toggleItemAvailability,
} from "../controllers/item.controllers.js";

import { upload } from "../middlewares/multer.js";

const itemRouter = express.Router();

itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);

itemRouter.post("/edit-item/:itemId", isAuth, upload.single("image"), editItem);

itemRouter.delete("/delete-item/:itemId", isAuth, deleteItem);

itemRouter.patch(
  "/toggle-availability/:item_id",
  isAuth,
  toggleItemAvailability,
);

export default itemRouter;
