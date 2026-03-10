import React from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ExecutiveSidebar from "./ExecutiveSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FloatingActionButton from "../ui/FloatingActionButton";

const ExecutiveLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-[#0b0f19] text-white relative overflow-hidden">
      {/* Background Blobs (Operational Colors) */}
      <div className="absolute -top-40 -right-40 w-[520px] h-[520px] bg-emerald-600/20 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-28 w-[420px] h-[420px] bg-cyan-400/10 rounded-full filter blur-[100px] pointer-events-none" />

      <ExecutiveSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="h-16 border-b border-white/5 bg-xcard/30 backdrop-blur-xl flex items-center justify-between px-8 relative z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mr-2">
              Welcome, {user?.name || 'Staff Member'}
            </h1>
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">
              {user?.role || 'Executive'}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold leading-none">{user?.name || 'User'}</p>
                <p className="text-[10px] text-xtext-secondary mt-1 uppercase font-bold tracking-widest">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 p-0.5 shadow-[0_4px_20px_rgba(52,211,153,0.2)]">
                <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                  <UserIcon size={20} className="text-emerald-400" />
                </div>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-2.5 rounded-xl hover:bg-white/5 text-xtext-secondary hover:text-red-400 transition-all border border-transparent hover:border-red-400/20"
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

export default ExecutiveLayout;
