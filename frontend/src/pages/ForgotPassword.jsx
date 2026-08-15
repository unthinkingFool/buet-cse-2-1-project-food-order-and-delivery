import axios from "axios";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, ShieldCheck, Lock, Loader2, Check } from "lucide-react";
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAF8] px-6 py-12">
      <div className="w-full max-w-sm">
        <p
          onClick={() => {
            navigate("/signin");
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#FF5A36] transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          back
        </p>

        <h1 className="text-2xl font-bold text-[#1F2023]">Forgot password?</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          No worries — we'll help you get back into your account.
        </p>

        {/* Step progress */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    step > s.id
                      ? "bg-[#FF5A36] text-white"
                      : step === s.id
                      ? "bg-[#1F2023] text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </div>
                <span
                  className={`text-[11px] font-medium ${
                    step >= s.id ? "text-[#1F2023]" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 -mt-4 rounded transition-colors ${
                    step > s.id ? "bg-[#FF5A36]" : "bg-gray-100"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {step == 1 && (
          <div className="space-y-4">
            {/* email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  onChange={(e) => setemail(e.target.value)}
                  value={email}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                />
              </div>
            </div>
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF5A36] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94e2c] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send OTP
            </button>
          </div>
        )}

        {step == 2 && (
          <div className="space-y-4">
            {/* otp */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Enter OTP
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  onChange={(e) => setotp(e.target.value)}
                  value={otp}
                  placeholder="6-digit code"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm tracking-widest text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">Sent to {email || "your email"}</p>
            </div>
            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF5A36] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94e2c] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify OTP
            </button>
          </div>
        )}

        {step == 3 && (
          <div className="space-y-4">
            {/* password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Enter password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  onChange={(e) => setpassword(e.target.value)}
                  value={password}
                  placeholder="New password"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                />
              </div>
            </div>
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF5A36] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94e2c] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Reset password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;