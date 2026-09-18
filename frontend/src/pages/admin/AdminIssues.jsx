import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

import { AlertCircle, User, CalendarDays, Mail } from "lucide-react";
import useGetAllIssuesAdmin from "../../hooks/admin/useGetAllIssuesAdmin";

function AdminIssues() {
  useGetAllIssuesAdmin();

  const issueReports = useSelector((state) => state.admin.issueReports);

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.05 * i, duration: 0.3, ease: "easeOut" },
    }),
  };

  return (
    <div className="p-6">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-[#1F2023]">Issue Reports</h1>

        <p className="text-gray-500 mt-1">
          Issues reported by customers, riders and owners.
        </p>
      </motion.div>

      {/* ISSUE COUNT */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
        className="mb-6"
      >
        <span className="text-sm text-gray-500">
          Total Reports:{" "}
          <span className="font-bold text-[#1F2023]">{issueReports.length}</span>
        </span>
      </motion.div>

      {/* EMPTY STATE */}
      {issueReports.length === 0 && (
        <div
          style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
          className="border-2 border-[#1F2023] bg-white py-16 text-center"
        >
          <div className="h-12 w-12 bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={22} className="text-gray-400" />
          </div>

          <h3 className="text-sm font-bold text-[#1F2023]">No issue reports</h3>

          <p className="text-sm text-gray-400 mt-1">
            There are currently no reported issues.
          </p>
        </div>
      )}

      {/* ISSUE LIST */}
      {issueReports.length > 0 && (
        <div
          style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
          className="border-2 border-[#1F2023] bg-white overflow-hidden"
        >
          <div className="divide-y-2 divide-gray-100">
            {issueReports.map((issue, index) => (
              <motion.div
                key={issue.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="p-5"
              >
                {/* TOP SECTION */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* USER */}
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 border-2 border-[#1F2023] bg-[#FAFAF8] flex items-center justify-center shrink-0">
                      <User size={18} className="text-[#1F2023]" />
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-[#1F2023]">{issue.user_name}</h3>

                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                        <Mail size={13} />
                        {issue.user_email}
                      </div>

                      <span className="inline-flex mt-2 px-2.5 py-1 border-2 border-gray-200 text-xs font-bold uppercase tracking-wide text-gray-600 capitalize">
                        {issue.user_role}
                      </span>
                    </div>
                  </div>

                  {/* DATE */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <CalendarDays size={14} />
                    {formatDate(issue.created_at)}
                  </div>
                </div>

                {/* ISSUE DESCRIPTION */}
                <div className="mt-5 pt-4 border-t-2 border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                    Issue Description
                  </p>

                  <p className="text-sm text-gray-700 leading-6 whitespace-pre-wrap">
                    {issue.issue_description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminIssues;