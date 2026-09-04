import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import http from "http"
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/restaurant.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";
import riderRouter from "./routes/rider.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";
import adminRouter from "./routes/admin.routes.js";
import issueRouter from "./routes/issue.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";

const app = express();
const server=http.createServer(app)

const io=new Server(server,{
  cors:{
    origin: "http://localhost:5173",
    credentials: true,
    methods:['GET','HEAD','PUT','PATCH','POST','DELETE']
  },
})

app.set("io",io)

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
app.use("/api/rider",riderRouter);
app.use("/api/delivery",deliveryRouter);
app.use("/api/admin",adminRouter);
app.use("/api/issues",issueRouter);
app.use("/api/payment",paymentRouter);

socketHandler(io)

server.listen(port, () => {
  connectDB();
  console.log(`server started at port ${port}`);
});
