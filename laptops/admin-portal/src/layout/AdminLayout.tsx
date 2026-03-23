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
    <div className="flex h-screen bg-bg text-white relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute -top-40 -right-40 w-[520px] h-[520px] bg-surface/40 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-28 w-[420px] h-[420px] bg-accent/5 rounded-full filter blur-[100px] pointer-events-none" />

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="h-16 border-b border-white/5 bg-surface/30 backdrop-blur-xl flex items-center justify-between px-8 relative z-20">
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
