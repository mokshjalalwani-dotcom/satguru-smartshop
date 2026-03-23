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
    <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-2 border-r border-white/10 pr-4">
        <Clock size={16} className="text-xbrand animate-pulse" />
        <span className="text-sm font-black tracking-widest text-white tabular-nums">
          {formatTime(time)}
        </span>
      </div>
      {showDate && (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-indigo-400" />
          <span className="text-xs font-bold text-white/70 uppercase tracking-tighter">
            {formatDate(time)}
          </span>
        </div>
      )}
    </div>
  );
};

export default LiveClock;
