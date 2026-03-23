import React, { useState } from "react";
import { Bell, AlertTriangle, Info, CheckCircle2, TrendingUp, ShieldAlert, Zap, Clock } from "lucide-react";

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
      case 'urgent': return <AlertTriangle size={20} className="text-rose-500" />;
      case 'warning': return <TrendingUp size={20} className="text-white" />;
      case 'success': return <CheckCircle2 size={20} className="text-accent" />;
      case 'info': default: return <Info size={20} className="text-muted/40" />;
    }
  };

  const getBgStyle = (type: string, read: boolean) => {
    if (read) return "bg-black/20 border-white/5 opacity-40";
    switch(type) {
      case 'urgent': return "bg-rose-500/10 border-rose-500/20 shadow-[0_5px_30px_rgba(244,63,94,0.1)]";
      case 'warning': return "bg-white/5 border-white/10 shadow-[0_5px_30px_rgba(255,255,255,0.05)]";
      case 'success': return "bg-accent/10 border-accent/20 shadow-[0_5px_30px_rgba(252,163,17,0.1)]";
      case 'info': default: return "bg-black/40 border-white/5";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">
            Operational <span className="text-accent">Alerts</span>
          </h1>
          <p className="text-muted/60 text-sm font-medium">Real-time AI-driven tactical notifications and store intelligence.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted/40 hover:text-white bg-black/40 border border-white/10 rounded-2xl hover:border-white/20 transition-all disabled:opacity-20 disabled:grayscale"
        >
          Dismiss All
        </button>
      </div>

      <div className="space-y-5">
        {notifications.map(notif => (
          <div 
            key={notif.id}
            className={`p-8 rounded-[32px] border flex gap-6 transition-all duration-500 relative group overflow-hidden ${getBgStyle(notif.type, notif.read)}`}
          >
            {!notif.read && (
              <div className={`absolute top-0 left-0 w-1.5 h-full ${notif.type === 'urgent' ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]' : notif.type === 'warning' ? 'bg-white' : notif.type === 'success' ? 'bg-accent shadow-[0_0_20px_rgba(252,163,17,0.5)]' : 'bg-muted/40'}`} />
            )}
            
            <div className="mt-1">
              <div className="w-14 h-14 rounded-2xl bg-black/60 flex items-center justify-center border border-white/8 shadow-xl">
                {getIcon(notif.type)}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h3 className={`font-black text-lg uppercase tracking-tight ${notif.read ? 'text-muted/40' : 'text-white'}`}>{notif.title}</h3>
                {!notif.read && (
                   <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                      <span className="text-[9px] font-black text-accent uppercase tracking-widest">New Priority</span>
                   </div>
                )}
              </div>
              <p className={`text-sm leading-relaxed mb-4 font-medium ${notif.read ? 'text-muted/30' : 'text-white/80'}`}>{notif.message}</p>
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-muted/20 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clock size={12} className="text-accent/40" /> {notif.time}
                </span>
                {notif.type === 'urgent' && !notif.read && (
                   <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2 animate-pulse">
                      <ShieldAlert size={12} /> Action Required
                   </span>
                )}
              </div>
            </div>

            {!notif.read && (
              <button 
                onClick={() => markAsRead(notif.id)}
                className="self-center px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-black/40 border border-white/5 text-muted/40 hover:text-accent hover:border-accent/40 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex items-center gap-2"
              >
                <CheckCircle2 size={14} /> Acknowledge
              </button>
            )}
          </div>
        ))}
        
        {notifications.length === 0 && (
          <div className="py-32 text-center">
             <Bell size={64} className="mx-auto mb-6 opacity-5" />
             <p className="text-[10px] font-black text-muted/20 uppercase tracking-[0.4em]">Operational Stream Clear</p>
          </div>
        )}
      </div>
      
      <div className="bg-surface border border-white/5 rounded-[32px] p-8 flex items-center justify-between shadow-inner">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-center text-accent"><Zap size={20} /></div>
            <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest">AI Intelligence Engine: <span className="text-accent">Active Synchronized</span></p>
         </div>
         <div className="text-[9px] font-black text-muted/10 uppercase tracking-[0.4em]">Satguru SmartShop • v2.0.4</div>
      </div>
    </div>
  );
};

export default AlertNotifications;
