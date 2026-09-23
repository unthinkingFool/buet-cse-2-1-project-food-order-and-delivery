import express from "express";
import {
  postIssue,
  getMyIssue,
  getAllIssueAdmin,
} from "../controllers/issues.controllers.js";

import {isAuth} from "../middlewares/isAuth.js";
import { adminAuth } from "../middlewares/adminAuth.js";

const issueRouter = express.Router();


// Customer / Rider / Owner
issueRouter.post("/report", isAuth, postIssue);


// Customer / Rider / Owner
issueRouter.get("/my-issues", isAuth, getMyIssue);


// Admin
issueRouter.get("/all", adminAuth, getAllIssueAdmin);


export default issueRouter;