import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Eye, EyeOff, Mail, Lock, UtensilsCrossed, Loader2 } from "lucide-react";
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
        error?.response?.data?.message || "Couldn't sign you in. Check your details and try again.",
      );
    } finally {
      setloading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FAFAF8]">
      {/* Branded panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1F2023] items-center justify-center p-16">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#FF5A36_0%,transparent_45%),radial-gradient(circle_at_80%_70%,#FF5A36_0%,transparent_40%)]" />
        <div className="relative z-10 max-w-md text-white">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-[#FF5A36] flex items-center justify-center">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">KhaiDai</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Good food,
            <br />
            delivered fast.
          </h2>
          <p className="text-white/70 text-lg">
            Sign in to pick up right where you left off — your favorite spots are waiting.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="h-9 w-9 rounded-lg bg-[#FF5A36] flex items-center justify-center">
              <UtensilsCrossed className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1F2023]">KhaiDai</span>
          </div>

          <h1 className="text-2xl font-bold text-[#1F2023]">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1 mb-8">
            Sign in to your account to get the best food
          </p>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

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

            {/* password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showpassword ? "text" : "password"}
                  onChange={(e) => setpassword(e.target.value)}
                  value={password}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-16 text-sm text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                />
                <button
                  type="button"
                  onClick={() => {
                    setshowpassword((prev) => !prev);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#FF5A36] transition-colors cursor-pointer"
                >
                  {showpassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div
              onClick={() => navigate("/forgot-password")}
              className="text-right text-sm text-[#FF5A36] font-medium cursor-pointer hover:underline"
            >
              forgot password?
            </div>
          </div>

          <button
            onClick={handleSignin}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF5A36] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94e2c] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            want to create a new account?{" "}
            <span
              onClick={() => {
                navigate("/signup");
              }}
              className="font-semibold text-[#1F2023] cursor-pointer hover:text-[#FF5A36] transition-colors"
            >
              sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;