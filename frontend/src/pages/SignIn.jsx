import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  UtensilsCrossed,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";

function SignIn() {
  const [showpassword, setshowpassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");

  // UI-only additions (do not affect the request itself)
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState("");

  const handleSignin = async () => {
    setloading(true);
    seterror("");
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        {
          email,
          password,
        },
        { withCredentials: true },
      );
      console.log(result);
      dispatch(setUserData(result.data));
      navigate("/");
    } catch (error) {
      console.log("error while signing in frontend : ", error);
      seterror(
        error?.response?.data?.message ||
          "Couldn't sign you in. Check your details and try again.",
      );
    } finally {
      setloading(false);
    }
  };

  // Staggered entrance for the form fields
  const fieldVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.15 + i * 0.08, duration: 0.35, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="min-h-screen w-full flex bg-[#FAFAF8]"
    >
      {/* Branded panel — solid color-blocked, hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#1F2023] items-center justify-center p-16">
        {/* Bold geometric color blocks, animated in */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: 12 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute -top-24 -right-24 h-72 w-72 bg-[#FF5A36]"
        />
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="absolute bottom-0 left-0 h-40 w-40 bg-[#FF5A36]/20"
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 1, rotate: 45 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="absolute top-1/2 -left-10 h-24 w-24 border-4 border-[#FF5A36]/40"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 max-w-md text-white"
        >
          <div className="flex items-center gap-2.5 mb-10">
            <div className="h-11 w-11 bg-[#FF5A36] flex items-center justify-center">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight">KhaiDai</span>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36] mb-4">
            Welcome back
          </p>
          <h2 className="text-5xl font-black leading-[1.05] mb-5">
            Good food,
            <br />
            delivered fast.
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            Sign in to pick up right where you left off — your favorite spots
            are waiting.
          </p>
        </motion.div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <div className="h-10 w-10 bg-[#FF5A36] flex items-center justify-center">
              <UtensilsCrossed className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-xl font-black text-[#1F2023]">KhaiDai</span>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36] mb-2">
            Sign in
          </p>
          <h1 className="text-3xl font-black text-[#1F2023]">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-2 mb-8">
            Sign in to your account to get the best food
          </p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {/* email */}
            <motion.div
              custom={0}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  onChange={(e) => setemail(e.target.value)}
                  value={email}
                  placeholder="you@example.com"
                  className="w-full border-2 border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-[#1F2023] outline-none transition focus:border-[#FF5A36]"
                />
              </div>
            </motion.div>

            {/* password */}
            <motion.div
              custom={1}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showpassword ? "text" : "password"}
                  onChange={(e) => setpassword(e.target.value)}
                  value={password}
                  placeholder="••••••••"
                  className="w-full border-2 border-gray-200 bg-white py-3 pl-10 pr-16 text-sm font-medium text-[#1F2023] outline-none transition focus:border-[#FF5A36]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setshowpassword((prev) => !prev);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#FF5A36] transition-colors cursor-pointer"
                >
                  {showpassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div
              custom={2}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              onClick={() => navigate("/forgot-password")}
              className="text-right text-xs font-bold uppercase tracking-wide text-[#FF5A36] cursor-pointer hover:underline"
            >
              forgot password?
            </motion.div>
          </div>

          <motion.button
            custom={3}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
            whileHover={
              !loading
                ? { x: 2, y: 2, boxShadow: "2px 2px 0px 0px #1F2023" }
                : {}
            }
            whileTap={
              !loading
                ? { x: 4, y: 4, boxShadow: "0px 0px 0px 0px #1F2023" }
                : {}
            }
            onClick={handleSignin}
            disabled={loading}
            style={{ boxShadow: "4px 4px 0px 0px #1F2023" }}
            className="mt-7 w-full flex items-center justify-center gap-2 bg-[#FF5A36] py-3.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Sign in
          </motion.button>

          <p className="mt-6 text-center text-sm text-gray-500">
            want to create a new account?{" "}
            <span
              onClick={() => {
                navigate("/signup");
              }}
              className="font-bold text-[#1F2023] cursor-pointer hover:text-[#FF5A36] transition-colors"
            >
              sign up
            </span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default SignIn;
