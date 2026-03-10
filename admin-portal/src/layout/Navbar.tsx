// Navbar.tsx — Futuristic glass top bar
import React from "react";
import { Search, Bell } from "lucide-react";

const Navbar: React.FC = () => {
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
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search"
          className="w-56 bg-white/5 border border-white/10 text-gray-200 placeholder-gray-400 text-[13px] rounded-full pl-8 pr-3 py-2 
                     focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 
                     transition-all duration-200"
        />
      </div>

      {/* Notification Bell */}
      <button className="relative p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200">
        <Bell size={18} />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
      </button>

      {/* Profile Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:brightness-110 transition-all duration-200 shadow-[0_6px_18px_rgba(56,189,248,0.25)]">
        M
      </div>
    </header>
  );
};

export default Navbar;
