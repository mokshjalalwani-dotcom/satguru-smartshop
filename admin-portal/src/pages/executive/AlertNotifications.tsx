import React, { useState } from "react";
import { Bell, AlertTriangle, Info, CheckCircle2, TrendingUp } from "lucide-react";

interface Notification {
  id: string;
  type: "urgent" | "warning" | "info" | "success";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: "1", type: "urgent", title: "Critical Stockout Predicted", message: "4K Action Cameras will run out of stock in 2 days based on current velocity.", time: "10 mins ago", read: false },
  { id: "2", type: "warning", title: "Demand Surge Detected", message: "Wireless Earbuds G2 are experiencing unusually high sales (+45%).", time: "1 hour ago", read: false },
  { id: "3", type: "info", title: "Promo Display Ready", message: "The new Holi Festival promo booth has been correctly registered in system.", time: "3 hours ago", read: true },
  { id: "4", type: "success", title: "Daily Sales Target Reached", message: "Excellent work! Store has passed ₹1,20,000 in sales today.", time: "5 hours ago", read: true },
];

const AlertNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'urgent': return <AlertTriangle size={20} className="text-rose-400" />;
      case 'warning': return <TrendingUp size={20} className="text-amber-400" />;
      case 'success': return <CheckCircle2 size={20} className="text-emerald-400" />;
      case 'info': default: return <Info size={20} className="text-cyan-400" />;
    }
  };

  const getBgStyle = (type: string, read: boolean) => {
    if (read) return "bg-white/5 border-white/5 opacity-60";
    switch(type) {
      case 'urgent': return "bg-rose-500/10 border-rose-500/20 shadow-[0_5px_20px_rgba(244,63,94,0.1)]";
      case 'warning': return "bg-amber-500/10 border-amber-500/20 shadow-[0_5px_20px_rgba(245,158,11,0.1)]";
      case 'success': return "bg-emerald-500/10 border-emerald-500/20 shadow-[0_5px_20px_rgba(16,185,129,0.1)]";
      case 'info': default: return "bg-cyan-500/10 border-cyan-500/20 shadow-[0_5px_20px_rgba(6,182,212,0.1)]";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">Alert Notifications</h1>
          <p className="text-xtext-secondary text-sm">Stay updated with AI-driven operational alerts and store announcements.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="px-4 py-2 text-sm font-bold text-xtext-secondary hover:text-white bg-xcard border border-white/10 rounded-xl hover:bg-white/5 transition-all disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map(notif => (
          <div 
            key={notif.id}
            className={`p-6 rounded-2xl border flex gap-5 transition-all duration-300 relative group overflow-hidden ${getBgStyle(notif.type, notif.read)}`}
          >
            {!notif.read && (
              <div className={`absolute top-0 left-0 w-1 h-full ${notif.type === 'urgent' ? 'bg-rose-500' : notif.type === 'warning' ? 'bg-amber-500' : notif.type === 'success' ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
            )}
            
            <div className="mt-1">
              <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center border border-white/5 backdrop-blur-md">
                {getIcon(notif.type)}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className={`font-bold text-lg ${notif.read ? 'text-white/70' : 'text-white'}`}>{notif.title}</h3>
                {!notif.read && <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest border border-rose-500/20">New</span>}
              </div>
              <p className={`text-sm mb-2 ${notif.read ? 'text-xtext-secondary' : 'text-white/80'}`}>{notif.message}</p>
              <span className="text-xs font-medium text-xtext-secondary flex items-center gap-1.5 opacity-70">
                <Bell size={12} /> {notif.time}
              </span>
            </div>

            {!notif.read && (
              <button 
                onClick={() => markAsRead(notif.id)}
                className="self-center px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 hidden sm:block"
              >
                Got it
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertNotifications;
