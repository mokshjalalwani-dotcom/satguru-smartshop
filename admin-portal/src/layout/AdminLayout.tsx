import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";
import FloatingActionButton from "../ui/FloatingActionButton";

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-bg text-white relative overflow-hidden font-sans">
      {/* Background Depth Layers (Global) */}
      <div className="mesh-blob blob-accent w-[600px] h-[600px] -top-64 -left-64 opacity-[0.07] animate-neon-pulse" />
      <div className="mesh-blob blob-blue w-[800px] h-[800px] top-1/2 -right-64 opacity-10" />
      <div className="mesh-blob blob-white w-[500px] h-[500px] -bottom-32 left-1/4 opacity-[0.03]" />

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="h-20 glass-header flex items-center justify-between px-10 relative z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mr-2">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-lg text-[10px] font-bold text-accent uppercase tracking-tighter">
              {user?.role || 'Guest Access'}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold leading-none">{user?.name || 'User'}</p>
                <p className="text-[10px] text-muted/60 mt-1 uppercase font-bold tracking-widest">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-accent p-0.5 shadow-[0_4px_20px_rgba(252,163,17,0.2)]">
                <div className="w-full h-full bg-bg rounded-[10px] flex items-center justify-center">
                  <UserIcon size={20} className="text-accent" />
                </div>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-2.5 rounded-xl hover:bg-white/5 text-muted/60 hover:text-white transition-all border border-transparent hover:border-white/10"
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
