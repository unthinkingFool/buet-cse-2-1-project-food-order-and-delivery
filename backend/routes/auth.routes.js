import express  from "express"
import { signin, signout, signup } from "../controllers/auth.controllers.js"
import { forgotPassword, resetPassword, verifyOTP } from "../controllers/forget.controllers.js"

const authRouter=express.Router()

authRouter.post("/signup",signup)
authRouter.post("/signin",signin)
authRouter.get("/signout",signout)


authRouter.post("/send-otp",forgotPassword)
authRouter.post("/verify-otp",verifyOTP)
authRouter.post("/reset-password",resetPassword)

export default authRouter;