import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/restaurant.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";

const app = express();

const port = process.env.BACKEND_PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/restaurant",shopRouter)
app.use("/api/item",itemRouter)
app.use("/api/order", orderRouter);

app.listen(port, () => {
  connectDB();
  console.log(`server started at port ${port}`);
});
