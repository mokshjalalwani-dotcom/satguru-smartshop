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
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-end border-r border-white/10 pr-6">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-xbrand" />
          <span className="text-lg font-medium tracking-tight text-white tabular-nums">
            {formatTime(time).split(' ')[0]}
            <span className="text-xs ml-1 opacity-50 font-normal uppercase">{formatTime(time).split(' ')[1]}</span>
          </span>
        </div>
      </div>
      {showDate && (
        <div className="flex flex-col items-start leading-tight">
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-white/40" />
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
              {formatDate(time)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClock;
