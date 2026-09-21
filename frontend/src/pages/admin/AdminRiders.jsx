import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  Mail,
  Phone,
  Bike,
  Loader2,
  Download,
} from "lucide-react";

import useGetAllRiders from "../../hooks/admin/useGetAllRiders";

function AdminRiders() {
  // ============================================================
  // FETCH RIDERS
  // ============================================================

  useGetAllRiders();

  // ============================================================
  // REDUX
  // ============================================================

  const {
    riders,
    ridersLoading,
    error,
  } = useSelector((state) => state.admin);

  // ============================================================
  // LOCAL STATE
  // ============================================================

  const [searchTerm, setSearchTerm] = useState("");

  // ============================================================
  // FILTER RIDERS
  // ============================================================

  const filteredRiders = useMemo(() => {
    if (!searchTerm.trim()) {
      return riders;
    }

    const search = searchTerm
      .toLowerCase()
      .trim();

    return riders.filter((rider) => {
      return (
        rider.name
          ?.toLowerCase()
          .includes(search) ||
        rider.email
          ?.toLowerCase()
          .includes(search) ||
        rider.phone
          ?.toLowerCase()
          .includes(search) ||
        rider.contact_no
          ?.toLowerCase()
          .includes(search)
      );
    });
  }, [riders, searchTerm]);

  // ============================================================
  // EXPORT CSV
  // ============================================================

  const exportCSV = () => {
    if (!riders || riders.length === 0) {
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Role",
    ];

    const rows = riders.map((rider) => [
      rider.id ?? "",
      rider.name ?? "",
      rider.email ?? "",
      rider.phone ??
        rider.contact_no ??
        "",
      rider.role ?? "rider",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "riders.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (
    ridersLoading &&
    riders.length === 0
  ) {
    return (
      <div className="min-h-full bg-[#FAFAF8] p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2
              size={22}
              className="animate-spin"
            />

            <span className="text-sm font-semibold">
              Loading riders...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-full bg-[#FAFAF8] p-6">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.25,
        }}
        className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center border-2 border-[#1F2023] bg-[#FF5A36]">
            <Bike
              size={24}
              className="text-white"
            />
          </div>

          <div>
            <h1 className="text-3xl font-black text-[#1F2023]">
              Riders
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage registered riders.
            </p>
          </div>

        </div>

        <button
          onClick={exportCSV}
          disabled={riders.length === 0}
          className="flex items-center justify-center gap-2 border-2 border-[#1F2023] bg-white px-4 py-2.5 text-sm font-bold text-[#1F2023] transition-colors hover:bg-[#1F2023] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={17} />

          Export CSV
        </button>
      </motion.div>


      {/* ====================================================== */}
      {/* STATS */}
      {/* ====================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* TOTAL RIDERS */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.25,
            delay: 0.05,
          }}
          className="border-2 border-[#1F2023] bg-white p-5"
          style={{
            boxShadow:
              "3px 3px 0px 0px #1F2023",
          }}
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total Riders
              </p>

              <p className="mt-2 text-3xl font-black text-[#1F2023]">
                {riders.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center bg-[#FF5A36]">
              <Users
                size={21}
                className="text-white"
              />
            </div>

          </div>
        </motion.div>


        {/* SEARCH RESULT */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.25,
            delay: 0.1,
          }}
          className="border-2 border-[#1F2023] bg-white p-5"
          style={{
            boxShadow:
              "3px 3px 0px 0px #1F2023",
          }}
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Showing
              </p>

              <p className="mt-2 text-3xl font-black text-[#1F2023]">
                {filteredRiders.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center bg-[#1F2023]">
              <Bike
                size={21}
                className="text-white"
              />
            </div>

          </div>
        </motion.div>

      </div>


      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

      {error && (
        <div className="mb-6 border-2 border-red-500 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}


      {/* ====================================================== */}
      {/* SEARCH */}
      {/* ====================================================== */}

      <div className="mb-6">

        <div className="relative max-w-xl">

          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search riders by name, email or phone..."
            className="w-full border-2 border-[#1F2023] bg-white py-3 pl-11 pr-4 text-sm font-medium outline-none transition-shadow focus:shadow-[3px_3px_0px_0px_#1F2023]"
          />

        </div>

      </div>


      {/* ====================================================== */}
      {/* RIDERS TABLE */}
      {/* ====================================================== */}

      <div
        className="overflow-hidden border-2 border-[#1F2023] bg-white"
        style={{
          boxShadow:
            "4px 4px 0px 0px #1F2023",
        }}
      >

        {filteredRiders.length === 0 ? (

          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center bg-gray-100">
              <Bike
                size={26}
                className="text-gray-400"
              />
            </div>

            <h3 className="text-lg font-black text-[#1F2023]">
              No riders found
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              {searchTerm
                ? "Try changing your search."
                : "There are no registered riders yet."}
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead>
                <tr className="border-b-2 border-[#1F2023] bg-[#F5F5F2]">

                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1F2023]">
                    Rider
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1F2023]">
                    Email
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1F2023]">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1F2023]">
                    Role
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredRiders.map(
                  (rider, index) => (
                    <motion.tr
                      key={rider.id ?? index}
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      transition={{
                        duration: 0.2,
                        delay:
                          index * 0.02,
                      }}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                    >

                      {/* RIDER */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#1F2023] text-sm font-black text-white">
                            {rider.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "R"}
                          </div>

                          <div>
                            <p className="font-bold text-[#1F2023]">
                              {rider.name ||
                                "Unknown"}
                            </p>

                            <p className="text-xs text-gray-400">
                              ID:{" "}
                              {rider.id ??
                                "—"}
                            </p>
                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-gray-600">

                          <Mail
                            size={16}
                            className="text-gray-400"
                          />

                          <span>
                            {rider.email ||
                              "—"}
                          </span>

                        </div>

                      </td>


                      {/* PHONE */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-gray-600">

                          <Phone
                            size={16}
                            className="text-gray-400"
                          />

                          <span>
                            {rider.phone ||
                              rider.contact_no ||
                              "—"}
                          </span>

                        </div>

                      </td>


                      {/* ROLE */}

                      <td className="px-5 py-4">

                        <span className="inline-flex items-center gap-1.5 border border-[#1F2023] bg-gray-100 px-3 py-1 text-xs font-black uppercase text-[#1F2023]">
                          <Bike size={13} />

                          {rider.role ||
                            "rider"}
                        </span>

                      </td>

                    </motion.tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default AdminRiders;