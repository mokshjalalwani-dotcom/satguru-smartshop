import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { LogOut, User as UserIcon, AlertTriangle, Zap } from "lucide-react";
import FloatingActionButton from "../ui/FloatingActionButton";
import { useDashboard } from "../context/DashboardContext";
import LiveClock from "../ui/LiveClock";

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { status } = useDashboard();
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
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent p-0.5 shadow-[0_4px_20px_rgba(252,163,17,0.2)]">
                <div className="w-full h-full bg-bg rounded-[10px] flex items-center justify-center text-accent">
                  <UserIcon size={20} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted/40 uppercase tracking-widest leading-none mb-1">Welcome back</span>
                <h1 className="text-xl font-black tracking-tight text-white leading-tight">
                  {user?.name || 'Admin'} <span className="text-accent underline decoration-accent/30 underline-offset-4">Portal</span>
                </h1>
              </div>
            </div>
          </div>
            ) : (
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mr-2">
                  Welcome back, {user?.name || 'User'}!
                </h1>
                <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-lg text-[10px] font-bold text-accent uppercase tracking-tighter">
                  {user?.role || 'Guest Access'}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {location.pathname === '/admin' && (
              <div className="flex items-center gap-2 mr-4">
                {status === 'error' ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-black uppercase tracking-widest text-red-400">
                    <AlertTriangle size={10} /> Disrupted
                  </div>
                ) : status === 'warming' ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-[9px] font-black uppercase tracking-widest text-accent animate-pulse">
                    <Zap size={10} /> Warming
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" /> Live Stream
                  </div>
                )}
              </div>
            )}

            <div className="hidden lg:flex items-center bg-black/20 rounded-xl px-4 py-2 border border-white/5 shadow-inner">
              <LiveClock showDate={false} />
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
