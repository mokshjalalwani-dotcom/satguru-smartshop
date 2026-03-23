// Navbar.tsx — Futuristic glass top bar
import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
        setShowNotifMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-[60px] bg-[#0b0f19]/70 backdrop-blur-xl border-b border-white/5 flex items-center px-6 gap-4 sticky top-0 z-30">
      {/* App Title */}
      <h1 className="text-gray-100 font-semibold text-[15px] tracking-tight mr-auto">
        Satguru{" "}
        <span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
          SmartShop
        </span>
      </h1>

      {/* Search */}
      <div className="relative group">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-56 bg-white/5 border border-white/10 text-gray-200 placeholder-gray-400 text-[13px] rounded-full pl-8 pr-3 py-2 
                     focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 
                     transition-all duration-200"
        />
        {searchQuery && (
          <div className="absolute top-12 right-0 w-64 p-3 bg-xcard border border-white/10 rounded-2xl shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in-95">
            <p className="text-xs text-xtext-secondary text-center italic">Searching for "{searchQuery}"...</p>
          </div>
        )}
      </div>

      <div ref={menuRef} className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifMenu(!showNotifMenu); setShowProfileMenu(false); }}
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
          </button>
          
          {showNotifMenu && (
            <div className="absolute top-12 right-0 w-72 bg-xcard border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in slide-in-from-top-4">
              <div className="p-3 border-b border-white/5 font-bold text-sm">Notifications</div>
              <div className="p-3 text-xs text-xtext-secondary hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5">
                <span className="text-emerald-400 font-bold">New Sale!</span> ₹14,500 from John.
              </div>
              <div className="p-3 text-xs text-xtext-secondary hover:bg-white/5 cursor-pointer transition-colors">
                <span className="text-amber-400 font-bold">Stock Alert:</span> Laptops running low.
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="relative">
          <button 
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifMenu(false); }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-sm font-semibold hover:brightness-110 transition-all duration-200 shadow-[0_6px_18px_rgba(56,189,248,0.25)] ring-2 ring-transparent focus:ring-indigo-500 outline-none"
          >
            {user?.name.charAt(0) || "U"}
          </button>
          
          {showProfileMenu && (
            <div className="absolute top-12 right-0 w-48 bg-xcard border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in slide-in-from-top-4">
              <div className="p-4 border-b border-white/5 bg-white/5">
                <p className="font-bold text-sm text-white truncate">{user?.name}</p>
                <p className="text-xs text-xtext-secondary">{user?.role}</p>
              </div>
              <div className="p-2 space-y-1">
                <button className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                  <UserIcon size={14} /> Profile Settings
                </button>
                <button 
                  onClick={() => { setShowProfileMenu(false); logout(); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
