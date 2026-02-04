import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart2,
  Lightbulb,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useZenStore } from "../store/useStore";
import { motion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar, logout, user } = useZenStore();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: BarChart2, label: "Analytics", path: "/analytics" },
    { icon: Lightbulb, label: "Insights", path: "/recommendations" },
    { icon: Zap, label: "Live Usage", path: "/live-usage" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
      transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "relative h-screen bg-[#0b0b0f] border-r border-slate-800/60 z-50 flex shrink-0 flex-col overflow-visible",
      )}
      aria-expanded={isSidebarOpen}
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              className="text-lg font-semibold text-white"
            >
              ZenTrack
            </motion.span>
          )}
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        className="absolute right-0 top-24 z-50 h-8 w-8 translate-x-1/4 rounded-full border border-slate-600/70 bg-slate-700/80 text-slate-100 shadow-sm backdrop-blur flex items-center justify-center hover:bg-slate-600/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      >
        <motion.div
          animate={{ rotate: isSidebarOpen ? 0 : 180 }}
          transition={{ duration: 0.25 }}
        >
          {isSidebarOpen ? (
            <ChevronLeft size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </motion.div>
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-4 px-3 py-3 rounded-xl transition-colors group",
                isActive
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white",
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />

            {isSidebarOpen && <span className="font-medium">{item.label}</span>}

            {!isSidebarOpen && (
              <div
                role="tooltip"
                className="absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap"
                aria-hidden={!isSidebarOpen}
              >
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-800/50">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-xl mb-2",
            isSidebarOpen ? "bg-slate-800/40" : "justify-center",
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold">
            {user?.name?.[0] || "U"}
          </div>

          {isSidebarOpen && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          aria-label="Sign out"
          className={cn(
            "flex items-center gap-4 w-full px-3 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400",
            !isSidebarOpen && "justify-center",
          )}
        >
          <LogOut className="w-5 h-5" />
          {isSidebarOpen && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
