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
  User,
  Phone,
  UtensilsCrossed,
  Loader2,
  ShoppingBag,
  Store,
  Bike,
  ArrowRight,
} from "lucide-react";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";

const ROLES = [
  { value: "customer", label: "Customer", icon: ShoppingBag },
  { value: "owner", label: "Owner", icon: Store },
  { value: "rider", label: "Rider", icon: Bike },
];

function SignUp() {
  const [showpassword, setshowpassword] = useState(false);
  const [role, setrole] = useState("customer");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [contact_no, setcontact_no] = useState("");

  // UI-only additions (do not affect the request itself)
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState("");

  const handleSignup = async () => {
    setloading(true);
    seterror("");
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          name,
          email,
          password,
          contact_no,
          role,
        },
        { withCredentials: true },
      );
      console.log(result);
      dispatch(setUserData(result.data));
      navigate("/");
    } catch (error) {
      console.log("error while signing up frontend : ", error);
      seterror(
        error?.response?.data?.message ||
          "Couldn't create your account. Please try again.",
      );
    } finally {
      setloading(false);
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.1 + i * 0.06, duration: 0.3, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="min-h-screen w-full flex bg-[#FAFAF8]"
    >
      {/* Branded panel — solid color-blocked, hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#1F2023] items-center justify-center p-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: -12 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute -bottom-24 -left-24 h-72 w-72 bg-[#FF5A36]"
        />
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="absolute top-0 right-0 h-40 w-40 bg-[#FF5A36]/20"
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 1, rotate: 45 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="absolute top-1/3 -right-10 h-24 w-24 border-4 border-[#FF5A36]/40"
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
            Get started
          </p>
          <h2 className="text-5xl font-black leading-[1.05] mb-5">
            Join the table,
            <br />
            in under a minute.
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            Whether you're ordering, cooking, or delivering — KhaiDai has a seat
            for you.
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
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="h-10 w-10 bg-[#FF5A36] flex items-center justify-center">
              <UtensilsCrossed className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-xl font-black text-[#1F2023]">KhaiDai</span>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36] mb-2">
            Sign up
          </p>
          <h1 className="text-3xl font-black text-[#1F2023]">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            Create your account to get the best food
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
            {/* name */}
            <motion.div
              custom={0}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <label
                htmlFor="name"
                className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2"
              >
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  onChange={(e) => setname(e.target.value)}
                  value={name}
                  placeholder="Your full name"
                  className="w-full border-2 border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-[#1F2023] outline-none transition focus:border-[#FF5A36]"
                />
              </div>
            </motion.div>

            {/* email */}
            <motion.div
              custom={1}
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

            {/* contact_no */}
            <motion.div
              custom={2}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <label
                htmlFor="mobile"
                className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2"
              >
                Contact No
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="mobile"
                  type="tel"
                  onChange={(e) => setcontact_no(e.target.value)}
                  value={contact_no}
                  placeholder="01XXXXXXXXX"
                  className="w-full border-2 border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-[#1F2023] outline-none transition focus:border-[#FF5A36]"
                />
              </div>
            </motion.div>

            {/* password */}
            <motion.div
              custom={3}
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

            {/* role */}
            <motion.div
              custom={4}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2">
                Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setrole(value)}
                    className={`flex flex-col items-center justify-center gap-1 border-2 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer ${
                      role === value
                        ? "border-[#FF5A36] bg-[#FF5A36]/10 text-[#FF5A36]"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                Selected role: {role}
              </p>
            </motion.div>
          </div>

          <motion.button
            custom={5}
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
            onClick={handleSignup}
            disabled={loading}
            style={{ boxShadow: "4px 4px 0px 0px #1F2023" }}
            className="mt-7 w-full flex items-center justify-center gap-2 bg-[#FF5A36] py-3.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Sign Up
          </motion.button>

          <p className="mt-6 text-center text-sm text-gray-500">
            already have an account?{" "}
            <span
              onClick={() => {
                navigate("/signin");
              }}
              className="font-bold text-[#1F2023] cursor-pointer hover:text-[#FF5A36] transition-colors"
            >
              sign in
            </span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default SignUp;
