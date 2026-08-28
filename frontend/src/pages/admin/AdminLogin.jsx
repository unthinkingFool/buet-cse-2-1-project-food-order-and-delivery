import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Lock } from "lucide-react";

import { serverUrl } from "../../App";
import { setAdminData } from "../../redux/adminSlice";

function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const result = await axios.post(
        `${serverUrl}/api/admin/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        },
      );

      dispatch(setAdminData(result.data.admin));

      navigate("/admin");
    } catch (error) {
      console.error("ADMIN LOGIN ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Something went wrong while logging in",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-center mb-8"
        >

          <div
            style={{ boxShadow: "4px 4px 0px 0px #1F2023" }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-2 border-[#1F2023] bg-[#FF5A36] text-white"
          >
            <ShieldCheck size={32} />
          </div>

          <h1 className="text-2xl font-black text-[#1F2023]">
            Admin Panel
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your food delivery platform
          </p>

        </motion.div>


        {/* ================================================== */}
        {/* LOGIN CARD */}
        {/* ================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
          className="border-2 border-[#1F2023] bg-white p-6"
        >

          <form onSubmit={handleLogin} className="space-y-5">

            {/* EMAIL */}

            <div>

              <label className="mb-2 block text-sm font-bold text-[#1F2023]">
                Email
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full border-2 border-gray-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#FF5A36]"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-bold text-[#1F2023]">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border-2 border-gray-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#FF5A36]"
                />

              </div>

            </div>


            {/* ERROR */}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="border-2 border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}


            {/* BUTTON */}

            <motion.button
              whileHover={loading ? {} : { x: 1, y: 1, boxShadow: "1px 1px 0px 0px #1F2023" }}
              whileTap={loading ? {} : { x: 2, y: 2, boxShadow: "0px 0px 0px 0px #1F2023" }}
              type="submit"
              disabled={loading}
              style={{ boxShadow: loading ? "none" : "3px 3px 0px 0px #1F2023" }}
              className="w-full border-2 border-[#1F2023] bg-[#FF5A36] py-3 text-sm font-bold uppercase tracking-wide text-white transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign in as Admin"}
            </motion.button>

          </form>

        </motion.div>

      </div>

    </div>
  );
}

export default AdminLogin;