import React from "react";

import { AlertCircle, CalendarDays } from "lucide-react";

import { useSelector } from "react-redux";
import { motion } from "framer-motion";

import useGetMyIssues from "../hooks/useGetMyIssues";
import ReportIssue from "../components/ReportIssue";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function Issue() {
  useGetMyIssues();
  const navigate=useNavigate();

  const myIssues = useSelector((state) => state.user.myIssues);

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 sm:px-6 py-8">
      <div className="w-full max-w-3xl mx-auto space-y-10">
        {/* Back */}
        <p
          onClick={() => {
            navigate("/");
          }}
          className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-gray-500 hover:text-[#FF5A36] transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </p>

        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-1.5">
            <div className="h-10 w-10 bg-[#1F2023] flex items-center justify-center">
              <AlertCircle size={18} className="text-[#FF5A36]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF5A36]">
                Support
              </p>
              <h1 className="text-2xl font-black text-[#1F2023] -mt-0.5">
                My Reported Issues
              </h1>
            </div>
          </div>

          <p className="text-sm text-gray-500">View the issues you have reported.</p>
        </motion.div>

        {/* report a new issue */}
        <ReportIssue />

        {/* issues list */}
        {myIssues.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-dashed border-gray-300 bg-white py-14 text-center"
          >
            <AlertCircle size={38} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-bold text-[#1F2023]">No issues reported</h3>
            <p className="text-sm text-gray-400 mt-1">
              You haven't reported any issues yet.
            </p>
          </motion.div>
        ) : (
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A36] mb-4">
              History
            </p>
            <div className="border-2 border-[#1F2023] bg-white divide-y-2 divide-gray-100">
              {myIssues.map((issue, index) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Issue #{issue.id}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                      <CalendarDays size={13} />
                      {formatDate(issue.created_at)}
                    </div>
                  </div>

                  <p className="text-sm text-[#1F2023] leading-6 whitespace-pre-wrap">
                    {issue.issue_description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Issue;