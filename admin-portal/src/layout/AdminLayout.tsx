import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import FloatingActionButton from "../ui/FloatingActionButton";
import LiveClock from "../ui/LiveClock";

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-bg text-white relative overflow-hidden font-sans">
      {/* Background Depth Layers (Global - Neutralized) */}
      <div className="mesh-blob blob-blue w-[700px] h-[700px] -top-64 -left-64 opacity-[0.03]" />
      <div className="mesh-blob blob-blue w-[800px] h-[800px] top-1/2 -right-64 opacity-10" />
      <div className="mesh-blob blob-white w-[500px] h-[500px] -bottom-32 left-1/4 opacity-[0.02]" />

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="h-20 glass-header flex items-center justify-between px-10 relative z-20">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] leading-none mb-1.5 opacity-80">Welcome Back</span>
              <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
                Welcome back, <span className="text-accent">{user?.name || 'Admin'}</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">

            <div className="hidden lg:flex items-center bg-black/20 rounded-2xl px-5 py-2.5 border border-white/5 shadow-inner">
              <LiveClock showDate={true} />
            </div>

            <button 
              onClick={logout}
              className="p-2.5 rounded-xl hover:bg-white/5 text-muted/60 hover:text-white transition-all border border-transparent hover:border-white/10 ml-2"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default AdminLayout;
