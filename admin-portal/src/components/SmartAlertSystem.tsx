import React, { useState, useEffect, useCallback } from "react";
import { AlertTriangle, X, TrendingUp, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const alerts = [
  {
    title: "Holi Festival Sale in 4 days",
    message: "Suggested: Stock up on LED Strip Lights, Smart Speakers, and Party Audio Systems",
    icon: <Calendar size={20} strokeWidth={2.5} />,
    type: "festival",
  },
  {
    title: "FY 2025-26 closes in 21 days",
    message: "Corporate bulk orders expected. Prepare Printer Supplies, UPS Systems, and Laptops",
    icon: <TrendingUp size={20} strokeWidth={2.5} />,
    type: "financial",
  },
  {
    title: "Low Stock: Wireless Earbuds G2",
    message: "Only 12 units remaining. AI predicts 50 units demand this week. Reorder now!",
    icon: <AlertTriangle size={20} strokeWidth={2.5} />,
    type: "inventory",
  },
];

const SmartAlertSystem: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(((idx % alerts.length) + alerts.length) % alerts.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % alerts.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [currentIndex]); // reset timer on manual nav

  const currentAlert = alerts[currentIndex];

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-8 duration-500 max-w-sm">
      <div className="bg-[#1c0f14] border-2 border-rose-500/60 shadow-[0_10px_40px_rgba(244,63,94,0.4)] rounded-2xl p-4 flex gap-4 relative overflow-hidden group hover:border-rose-500/90 transition-colors backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-rose-400 to-pink-600" />
        
        <div className="flex-shrink-0 mt-1 pl-1">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500 shadow-inner border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            {currentAlert.icon}
          </div>
        </div>
        
        <div className="flex-1 pr-4">
          <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
            Smart Alert
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.9)]" />
          </h4>
          <p className="text-[13px] font-bold text-rose-300 mb-1">{currentAlert.title}</p>
          <p className="text-[11px] text-rose-100/80 leading-relaxed font-medium">{currentAlert.message}</p>
          
          {/* Nav dots + arrows */}
          <div className="flex items-center gap-2 mt-3">
            <button onClick={() => goTo(currentIndex - 1)} className="p-0.5 rounded text-rose-300/40 hover:text-rose-300 transition-colors" aria-label="Previous alert">
              <ChevronLeft size={14} />
            </button>
            {alerts.map((_, i) => (
              <button 
                key={i} 
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === currentIndex ? 'bg-rose-400 scale-125' : 'bg-rose-400/20 hover:bg-rose-400/50'}`}
                aria-label={`Go to alert ${i + 1}`}
              />
            ))}
            <button onClick={() => goTo(currentIndex + 1)} className="p-0.5 rounded text-rose-300/40 hover:text-rose-300 transition-colors" aria-label="Next alert">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-rose-200/50 hover:text-white hover:bg-rose-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500" 
          aria-label="Dismiss alert"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default SmartAlertSystem;

