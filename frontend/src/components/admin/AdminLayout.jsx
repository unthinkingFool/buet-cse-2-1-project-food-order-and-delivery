import React from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";

function AdminLayout() {
  return (
    <div className="h-screen bg-[#FAFAF8] flex overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 h-screen shrink-0">
        <AdminSidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>

    </div>
  );
}

export default AdminLayout;

