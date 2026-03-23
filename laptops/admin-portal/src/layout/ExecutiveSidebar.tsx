import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ShoppingCart, 
  PackageCheck, 
  CheckSquare, 
  BellRing,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
  Target
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ExecutiveSidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const links = [
    { icon: <ShoppingCart size={20} />, label: "Sales Processing", path: "/executive/sales" },
    { icon: <PackageCheck size={20} />, label: "Inventory Updates", path: "/executive/inventory" },
    { icon: <CheckSquare size={20} />, label: "Task Execution", path: "/executive/tasks" },
    { icon: <BellRing size={20} />, label: "Alert Notifications", path: "/executive/alerts" },
    { icon: <Target size={20} />, label: "My Targets", path: "/executive/targets" },
  ];

  return (
    <aside className={`${collapsed ? "w-20" : "w-64"} bg-surface border-r border-white/5 flex flex-col transition-all duration-300 relative z-30`}>
      <div className="p-6 flex-1 flex flex-col">
        <div className={`flex items-center gap-3 mb-10 ${collapsed ? "justify-center" : "px-2"}`}>
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(252,163,17,0.4)] flex-shrink-0">
            <ShieldCheck size={20} className="text-black" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg tracking-tight whitespace-nowrap text-white">
              Satguru<br/>
              <span className="text-[10px] text-accent -mt-2 block uppercase tracking-widest font-bold">Staff Portal</span>
            </span>
          )}
        </div>
        
        <nav className="space-y-2 flex-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path}
                to={link.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group border border-transparent ${
                  isActive 
                    ? "bg-accent/10 border-accent/20 text-white shadow-[0_0_15px_rgba(252,163,17,0.1)]" 
                    : "text-muted/60 hover:text-white hover:bg-white/5"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? link.label : ""}
              >
                <span className={`${isActive ? "text-accent" : "group-hover:text-accent"} transition-colors`}>
                  {link.icon}
                </span>
                {!collapsed && <span className="text-sm font-semibold">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/5 space-y-2">
          {user?.role === 'Admin' && (
            <Link 
              to="/admin"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-accent hover:bg-accent/10 transition-all group border border-accent/20 ${collapsed ? "justify-center px-2" : ""}`}
              title={collapsed ? "Switch to Boss Dashboard" : ""}
            >
              <ArrowRightLeft size={18} />
              {!collapsed && <span className="text-sm font-bold">Boss Dashboard</span>}
            </Link>
          )}

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

export default ExecutiveSidebar;
