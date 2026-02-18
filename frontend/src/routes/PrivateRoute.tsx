import { Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useZenStore } from "../store/useStore";
import React from "react";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useZenStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    // 🔒 Page fixed, no browser scroll
    <div className="h-screen w-screen overflow-hidden flex bg-[#0b0b0f]">
      {/* Sidebar always visible */}
      <Sidebar />

      {/* Content area scrolls, not the page (shifts beside the fixed sidebar) */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
};

export default PrivateRoute;
