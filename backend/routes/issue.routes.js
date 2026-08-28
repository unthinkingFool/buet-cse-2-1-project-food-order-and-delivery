import express from "express";

import {
  createIssue,
  getMyIssues,
} from "../controllers/issue.controllers.js";

import { isAuth } from "../middlewares/isAuth.js";

const issueRouter = express.Router();


// ============================================================
// CREATE ISSUE
// ============================================================

issueRouter.post(
  "/",
  isAuth,
  createIssue,
);


// ============================================================
// GET MY ISSUES
// ============================================================

issueRouter.get(
  "/my",
  isAuth,
  getMyIssues,
);


export default issueRouter;