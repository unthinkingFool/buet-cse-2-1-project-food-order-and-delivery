import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { AlertCircle, Send, Loader2 } from "lucide-react";

import { serverUrl } from "../App";
import { addMyIssue } from "../redux/userSlice";

function ReportIssue() {
  const dispatch = useDispatch();

  const [issueDescription, setIssueDescription] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!issueDescription.trim()) {
      alert("Please describe your issue");
      return;
    }

    try {
      setLoading(true);

      const result = await axios.post(
        `${serverUrl}/api/issue/report`,
        {
          issue_description: issueDescription.trim(),
        },
        {
          withCredentials: true,
        },
      );

      if (result.data.success) {
        // Add the newly created issue to Redux
        dispatch(addMyIssue(result.data.issue));

        // Clear textarea
        setIssueDescription("");

        alert("Issue reported successfully");
      }
    } catch (error) {
      console.log("Post issue error:", error.response?.data || error.message);

      alert(error.response?.data?.message || "Failed to report issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="h-10 w-10 bg-[#FF5A36] flex items-center justify-center">
            <AlertCircle size={18} className="text-white" />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF5A36]">
              Support
            </p>
            <h2 className="text-xl font-black text-[#1F2023] -mt-0.5">Report an Issue</h2>
          </div>
        </div>

        <p className="text-sm text-gray-500">Tell us about any problem you are experiencing.</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onSubmit={handleSubmit}
        className="border-2 border-[#1F2023] bg-white p-6"
      >
        <label className="block text-xs font-bold uppercase tracking-wide text-[#1F2023] mb-2">
          Issue Description
        </label>

        <textarea
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          maxLength={1000}
          rows={6}
          placeholder="Describe your issue..."
          className="w-full border-2 border-gray-200 p-4 text-sm font-medium text-[#1F2023] resize-none outline-none transition focus:border-[#FF5A36]"
        />

        <div className="flex justify-end mt-2">
          <span className="text-xs font-bold text-gray-400">
            {issueDescription.length}/1000
          </span>
        </div>

        <motion.button
          type="submit"
          whileHover={
            !loading && issueDescription.trim()
              ? { x: 2, y: 2, boxShadow: "2px 2px 0px 0px #1F2023" }
              : {}
          }
          whileTap={
            !loading && issueDescription.trim()
              ? { x: 4, y: 4, boxShadow: "0px 0px 0px 0px #1F2023" }
              : {}
          }
          disabled={loading || !issueDescription.trim()}
          style={{ boxShadow: "4px 4px 0px 0px #1F2023" }}
          className="mt-5 w-full bg-[#FF5A36] text-white py-3.5 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {loading ? "Submitting..." : "Report Issue"}
        </motion.button>
      </motion.form>
    </div>
  );
}

export default ReportIssue;