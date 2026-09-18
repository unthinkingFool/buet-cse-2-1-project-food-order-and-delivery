import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Download,
  Users,
  Search,
  Loader2,
  MapPin,
  ShoppingBag,
  UserCheck,
  UserX,
} from "lucide-react";

import useGetAllCustomers from "../../hooks/admin/useGetAllCustomers";

function AdminCustomers() {
  useGetAllCustomers();

  const { customers, customersLoading, error } = useSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = React.useState("");

  // ============================================================
  // FILTER CUSTOMERS
  // ============================================================

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();

    return (
      customer.name?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.contact_no?.toLowerCase().includes(search)
    );
  });

  // ============================================================
  // EXPORT CSV
  // ============================================================

  const exportCustomersCSV = () => {
    if (customers.length === 0) {
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email",
      "Contact",
      "Latitude",
      "Longitude",
      "Total Orders",
      "Status",
      "Created At",
    ];

    const rows = customers.map((customer) => [
      customer.id,
      customer.name,
      customer.email,
      customer.contact_no,
      customer.latitude,
      customer.longitude,
      customer.total_orders,
      customer.is_suspended ? "Suspended" : "Active",
      customer.created_at,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const stringValue = value === null || value === undefined ? "" : String(value);

            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "customers.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (customersLoading && customers.length === 0) {
    return (
      <div className="min-h-full bg-[#FAFAF8] p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 size={22} className="animate-spin" />

            <span className="text-sm font-bold">Loading customers...</span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="p-6">
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-black text-[#1F2023]">Customers</h1>
          <p className="text-gray-500 mt-1">Manage registered customers</p>
        </div>

        <motion.button
          whileHover={customers.length > 0 ? { x: 1, y: 1, boxShadow: "1px 1px 0px 0px #1F2023" } : {}}
          whileTap={customers.length > 0 ? { x: 2, y: 2, boxShadow: "0px 0px 0px 0px #1F2023" } : {}}
          onClick={exportCustomersCSV}
          disabled={customers.length === 0}
          style={{ boxShadow: customers.length > 0 ? "3px 3px 0px 0px #1F2023" : "none" }}
          className="flex items-center justify-center gap-2 border-2 border-[#1F2023] bg-[#FF5A36] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <Download size={16} />
          Export CSV
        </motion.button>
      </motion.div>

      {/* ====================================================== */}
      {/* STATS */}
      {/* ====================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
        className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <div
          style={{ boxShadow: "3px 3px 0px 0px #1F2023" }}
          className="border-2 border-[#1F2023] bg-white p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Total Customers
            </span>
            <Users size={19} className="text-[#FF5A36]" />
          </div>
          <p className="text-2xl font-black text-[#1F2023]">{customers.length}</p>
        </div>

        <div
          style={{ boxShadow: "3px 3px 0px 0px #1F2023" }}
          className="border-2 border-[#1F2023] bg-white p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Active</span>
            <UserCheck size={19} className="text-green-600" />
          </div>
          <p className="text-2xl font-black text-[#1F2023]">
            {customers.filter((customer) => !customer.is_suspended).length}
          </p>
        </div>

        <div
          style={{ boxShadow: "3px 3px 0px 0px #1F2023" }}
          className="border-2 border-[#1F2023] bg-white p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Suspended
            </span>
            <UserX size={19} className="text-red-600" />
          </div>
          <p className="text-2xl font-black text-[#1F2023]">
            {customers.filter((customer) => customer.is_suspended).length}
          </p>
        </div>
      </motion.div>

      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

      {error && (
        <div className="mb-5 border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* ====================================================== */}
      {/* SEARCH */}
      {/* ====================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
        className="mb-5 flex items-center border-2 border-[#1F2023] bg-white px-4 py-3"
      >
        <Search size={18} className="mr-3 text-gray-400" />

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search customers by name, email or contact..."
          className="w-full bg-transparent text-sm font-medium text-[#1F2023] outline-none placeholder:text-gray-400"
        />
      </motion.div>

      {/* ====================================================== */}
      {/* CUSTOMER TABLE */}
      {/* ====================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
        style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
        className="overflow-hidden border-2 border-[#1F2023] bg-white"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b-2 border-[#1F2023] bg-[#1F2023]">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-white">
                  Customer
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-white">
                  Contact
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-white">
                  Orders
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-white">
                  Location
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-white">
                  Status
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-white">
                  Joined
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <Users size={30} className="mb-3 text-gray-300" />
                      <p className="text-sm font-bold text-[#1F2023]">No customers found</p>
                      <p className="mt-1 text-xs text-gray-400">Try changing your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b-2 border-gray-100 last:border-b-0 hover:bg-[#FAFAF8]"
                  >
                    {/* CUSTOMER */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#1F2023] bg-[#FAFAF8] text-sm font-black text-[#1F2023]">
                          {customer.name?.charAt(0)?.toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#1F2023]">
                            {customer.name}
                          </p>
                          <p className="truncate text-xs text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}
                    <td className="px-5 py-4 text-sm font-medium text-gray-600">
                      {customer.contact_no || "—"}
                    </td>

                    {/* ORDERS */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#1F2023]">
                        <ShoppingBag size={16} className="text-gray-400" />
                        {customer.total_orders}
                      </div>
                    </td>

                    {/* LOCATION */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <MapPin size={16} className="text-gray-400" />
                        {customer.latitude && customer.longitude
                          ? `${Number(customer.latitude).toFixed(4)}, ${Number(
                              customer.longitude,
                            ).toFixed(4)}`
                          : "Not available"}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4">
                      {customer.is_suspended ? (
                        <span className="inline-flex border-2 border-red-600 bg-red-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-red-600">
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex border-2 border-green-600 bg-green-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-green-600">
                          Active
                        </span>
                      )}
                    </td>

                    {/* CREATED */}
                    <td className="px-5 py-4 text-sm font-medium text-gray-500">
                      {customer.created_at
                        ? new Date(customer.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ====================================================== */}
      {/* FOOTER */}
      {/* ====================================================== */}

      {filteredCustomers.length > 0 && (
        <div className="mt-4 text-xs font-medium text-gray-500">
          Showing <span className="font-bold text-[#1F2023]">{filteredCustomers.length}</span> of{" "}
          <span className="font-bold text-[#1F2023]">{customers.length}</span> customers
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;