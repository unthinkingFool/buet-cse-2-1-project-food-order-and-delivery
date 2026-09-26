
import React from "react";
import Nav from "./Nav.jsx";

function SuspendedRestaurant() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Nav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div
          className="border-2 border-[#1F2023] bg-white px-6 py-12 text-center"
          style={{ boxShadow: "6px 6px 0px 0px #1F2023" }}
        >
          {/* Suspended restaurant illustration */}
          <div className="mx-auto mb-6 flex h-40 w-40 items-center justify-center border-2 border-[#1F2023] bg-[#FFF1EC]">
            <div className="text-7xl">🚫</div>
          </div>

          <h1 className="text-2xl font-black text-[#1F2023]">
            Restaurant Suspended
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
            Your restaurant has been suspended by the administrator. The
            restaurant dashboard is currently unavailable.
          </p>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Please contact the administrator for more information.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SuspendedRestaurant;

