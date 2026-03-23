import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";

const LiveClock: React.FC<{ showDate?: boolean }> = ({ showDate = true }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-amber-400" />
        <span className="text-sm font-bold tracking-tight text-white tabular-nums">
          {formatTime(time)}
        </span>
      </div>
      {showDate && (
        <div className="hidden sm:flex items-center gap-2 border-l border-white/10 pl-4">
          <Calendar size={14} className="text-white/40" />
          <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest whitespace-nowrap">
            {formatDate(time)}
          </span>
        </div>
      )}
    </div>
  );
};

export default LiveClock;
