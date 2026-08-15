import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
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
        error?.response?.data?.message || "Couldn't create your account. Please try again.",
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
            Join the table,
            <br />
            in under a minute.
          </h2>
          <p className="text-white/70 text-lg">
            Whether you're ordering, cooking, or delivering — KhaiDai has a seat for you.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="h-9 w-9 rounded-lg bg-[#FF5A36] flex items-center justify-center">
              <UtensilsCrossed className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1F2023]">KhaiDai</span>
          </div>

          <h1 className="text-2xl font-bold text-[#1F2023]">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Create your account to get the best food
          </p>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  onChange={(e) => setname(e.target.value)}
                  value={name}
                  placeholder="Your full name"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1F2023] shadow-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20"
                />
              </div>
            </div>

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

            {/* contact_no */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-[#1F2023] mb-1.5">
                Contact No
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="mobile"
                  type="tel"
                  onChange={(e) => setcontact_no(e.target.value)}
                  value={contact_no}
                  placeholder="01XXXXXXXXX"
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

            {/* role */}
            <div>
              <label className="block text-sm font-medium text-[#1F2023] mb-1.5">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setrole(value)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-lg border py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                      role === value
                        ? "border-[#FF5A36] bg-[#FF5A36]/10 text-[#FF5A36]"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-gray-400">Selected role: {role}</p>
            </div>
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF5A36] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94e2c] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign Up
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            already have an account?{" "}
            <span
              onClick={() => {
                navigate("/signin");
              }}
              className="font-semibold text-[#1F2023] cursor-pointer hover:text-[#FF5A36] transition-colors"
            >
              sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;