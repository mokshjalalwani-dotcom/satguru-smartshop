import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  ShoppingBag, 
  Users, 
  Package,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Sparkles,
  ListTodo,
  ArrowRightLeft,
  Target
} from "lucide-react";


const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const links = [
    { icon: <BarChart3 size={20} />, label: "Smart Dashboard", path: "/admin" },
    { icon: <Package size={20} />, label: "Inventory Intelligence", path: "/admin/inventory" },
    { icon: <ShoppingBag size={20} />, label: "Sales Analytics", path: "/admin/analytics" },
    { icon: <ListTodo size={20} />, label: "Task Scheduler", path: "/admin/tasks" },
    { icon: <CalendarDays size={20} />, label: "Calendar", path: "/admin/calendar" },
    { icon: <Sparkles size={20} />, label: "Event Intelligence", path: "/admin/festivals" },
    { icon: <Users size={20} />, label: "Team Management", path: "/admin/team" },
    { icon: <Target size={20} />, label: "Targets", path: "/admin/targets" },
  ];

  return (
    <aside className={`${collapsed ? "w-20" : "w-64"} bg-[#0a0f1e]/80 backdrop-blur-2xl border-r border-white-[0.03] flex flex-col transition-all duration-500 relative z-30 shadow-2xl`}>
      <div className="p-6 flex-1 flex flex-col">
        <div className={`flex items-center gap-3 mb-10 ${collapsed ? "justify-center" : "px-2"}`}>
          <div className="w-11 h-11 glass-card rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(252,163,17,0.15)] flex-shrink-0 relative overflow-hidden group-hover:shadow-[0_0_40px_rgba(252,163,17,0.25)] transition-all">
            <div className="absolute inset-0 bg-accent/10 opacity-50" />
            <ShieldCheck size={22} className="text-accent relative z-10" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg tracking-tight whitespace-nowrap text-white">
              Satguru<br/>
              <span className="text-[10px] text-muted/60 -mt-2 block uppercase tracking-widest font-bold">SmartShop</span>
            </span>
          )}
        </div>
        
        <nav className="space-y-1.5 flex-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path}
                to={link.path}
                className={`flex items-center gap-4 px-4 py-2.5 rounded-2xl transition-all group border border-transparent ${
                  isActive 
                    ? "bg-accent/10 border-accent/20 text-white shadow-[0_0_15px_rgba(252,163,17,0.1)]" 
                    : "text-muted/60 hover:text-white hover:bg-white/5"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? link.label : ""}
              >
                <span className={`${isActive ? "text-accent" : "group-hover:text-accent"} transition-colors relative z-10`}>
                  {link.icon}
                </span>
                {!collapsed && <span className="text-sm font-bold relative z-10 tracking-tight">{link.label}</span>}
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-1/2 bg-accent rounded-r-full shadow-[0_0_15px_rgba(252,163,17,0.8)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/5 space-y-2">
          <Link 
            to="/executive/sales"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-accent hover:bg-accent/10 transition-all group border border-accent/20 ${collapsed ? "justify-center px-2" : ""}`}
            title={collapsed ? "Switch to Staff Portal" : ""}
          >
            <ArrowRightLeft size={18} />
            {!collapsed && <span className="text-sm font-bold">Staff Portal</span>}
          </Link>

          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted/60 hover:text-white hover:bg-white/5 transition-all group"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
