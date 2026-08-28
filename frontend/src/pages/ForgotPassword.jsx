import axios from "axios";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, ShieldCheck, Lock, Loader2, Check, UtensilsCrossed } from "lucide-react";
import { serverUrl } from "../App";

const STEPS = [
  { id: 1, label: "Email" },
  { id: 2, label: "Verify" },
  { id: 3, label: "Reset" },
];

function ForgotPassword() {
  const [step, setstep] = useState(1);
  const [email, setemail] = useState("");
  const [otp, setotp] = useState("");
  const [password, setpassword] = useState("");
  const navigate = useNavigate();

  // UI-only additions (do not affect the request itself)
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState("");

  const handleSendOTP = async () => {
    setloading(true);
    seterror("");
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        {
          email,
        },
        { withCredentials: true },
      );
      console.log("successfully send otp");
      setstep(2);
    } catch (error) {
      console.log("error while sending otp frontend : ", error);
      seterror(error?.response?.data?.message || "Couldn't send the OTP. Please try again.");
    } finally {
      setloading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setloading(true);
    seterror("");
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        {
          email,
          otp,
        },
        { withCredentials: true },
      );
      console.log("successfully verified otp");
      setstep(3);
    } catch (error) {
      console.log("error while verifying otp frontend : ", error);
      seterror(error?.response?.data?.message || "That code didn't match. Please try again.");
    } finally {
      setloading(false);
    }
  };

  const handleResetPassword = async () => {
    setloading(true);
    seterror("");
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        {
          email,
          password,
        },
        { withCredentials: true },
      );
      console.log("successfully reset password");
      navigate("/signin");
    } catch (error) {
      console.log("error while resetting password frontend : ", error);
      seterror(error?.response?.data?.message || "Couldn't reset your password. Please try again.");
    } finally {
      setloading(false);
    }
  };

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
      className="min-h-screen w-full flex items-center justify-center bg-[#FAFAF8] px-6 py-12"
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="h-10 w-10 bg-[#FF5A36] flex items-center justify-center">
            <UtensilsCrossed className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-xl font-black text-[#1F2023]">KhaiDai</span>
        </div>

        <p
          onClick={() => {
            navigate("/signin");
          }}
          className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-gray-500 hover:text-[#FF5A36] transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          back
        </p>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36] mb-2">
          Account recovery
        </p>
        <h1 className="text-3xl font-black text-[#1F2023]">Forgot password?</h1>
        <p className="text-sm text-gray-500 mt-2 mb-8">
          No worries — we'll help you get back into your account.
        </p>

        {/* Step progress */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`h-9 w-9 border-2 border-[#1F2023] flex items-center justify-center text-xs font-bold transition-colors ${
                    step > s.id
                      ? "bg-[#FF5A36] text-white"
                      : step === s.id
                      ? "bg-[#1F2023] text-white"
                      : "bg-white text-gray-400"
                  }`}
                >
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wide ${
                    step >= s.id ? "text-[#1F2023]" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 -mt-4 transition-colors ${
                    step > s.id ? "bg-[#FF5A36]" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

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

        {step == 1 && (
          <div className="space-y-4">
            {/* email */}
            <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2">
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
            <motion.button
              custom={1}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              whileHover={!loading ? { x: 2, y: 2, boxShadow: "2px 2px 0px 0px #1F2023" } : {}}
              whileTap={!loading ? { x: 4, y: 4, boxShadow: "0px 0px 0px 0px #1F2023" } : {}}
              onClick={handleSendOTP}
              disabled={loading}
              style={{ boxShadow: "4px 4px 0px 0px #1F2023" }}
              className="w-full flex items-center justify-center gap-2 bg-[#FF5A36] py-3.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send OTP
            </motion.button>
          </div>
        )}

        {step == 2 && (
          <div className="space-y-4">
            {/* otp */}
            <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
              <label htmlFor="otp" className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2">
                Enter OTP
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  onChange={(e) => setotp(e.target.value)}
                  value={otp}
                  placeholder="6-digit code"
                  className="w-full border-2 border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-medium tracking-widest text-[#1F2023] outline-none transition focus:border-[#FF5A36]"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">Sent to {email || "your email"}</p>
            </motion.div>
            <motion.button
              custom={1}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              whileHover={!loading ? { x: 2, y: 2, boxShadow: "2px 2px 0px 0px #1F2023" } : {}}
              whileTap={!loading ? { x: 4, y: 4, boxShadow: "0px 0px 0px 0px #1F2023" } : {}}
              onClick={handleVerifyOTP}
              disabled={loading}
              style={{ boxShadow: "4px 4px 0px 0px #1F2023" }}
              className="w-full flex items-center justify-center gap-2 bg-[#FF5A36] py-3.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify OTP
            </motion.button>
          </div>
        )}

        {step == 3 && (
          <div className="space-y-4">
            {/* password */}
            <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2">
                Enter password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  onChange={(e) => setpassword(e.target.value)}
                  value={password}
                  placeholder="New password"
                  className="w-full border-2 border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-[#1F2023] outline-none transition focus:border-[#FF5A36]"
                />
              </div>
            </motion.div>
            <motion.button
              custom={1}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              whileHover={!loading ? { x: 2, y: 2, boxShadow: "2px 2px 0px 0px #1F2023" } : {}}
              whileTap={!loading ? { x: 4, y: 4, boxShadow: "0px 0px 0px 0px #1F2023" } : {}}
              onClick={handleResetPassword}
              disabled={loading}
              style={{ boxShadow: "4px 4px 0px 0px #1F2023" }}
              className="w-full flex items-center justify-center gap-2 bg-[#FF5A36] py-3.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Reset password
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ForgotPassword;