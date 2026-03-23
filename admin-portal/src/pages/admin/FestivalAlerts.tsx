import React from "react";
import { Sparkles, TrendingUp, CalendarCheck, Package, Bell, BarChart3, IndianRupee } from "lucide-react";
import { upcomingEvents } from "../../data/events";
import { getDaysUntil, formatDate } from "../../utils/dateUtils";

const FestivalAlerts: React.FC = () => {
  const processedEvents = upcomingEvents.map(event => ({
    ...event,
    daysLeft: getDaysUntil(event.date)
  }))
  .filter(event => event.daysLeft >= 0)
  .sort((a, b) => a.daysLeft - b.daysLeft);

  const fyEndDate = "2026-03-31";
  const daysLedtInFY = getDaysUntil(fyEndDate);

  const fyAnalytics = {
    peakMonths: [
      { month: "October", reason: "Diwali + Navratri", revenue: "₹18.5L" },
      { month: "March", reason: "FY-End Rush", revenue: "₹12.8L" },
      { month: "August", reason: "Independence Day + Rakhi", revenue: "₹9.4L" },
    ],
    ytdRevenue: "₹72.4L",
    targetRemaining: "₹12.6L",
    daysLeftInFY: daysLedtInFY > 0 ? daysLedtInFY : 0,
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-1">
            Event <span className="text-accent">Intelligence</span>
          </h1>
          <p className="text-muted/60 text-[11px] font-bold">Predictive inventory mapping for festivals and fiscal milestones.</p>
        </div>
        <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-xl text-accent shadow-lg shadow-accent/5">
          <Sparkles size={14} />
          <span className="font-black text-[9px] uppercase tracking-widest">AI Prediction Active</span>
        </div>
      </div>

      {/* FY Analytics Strip */}
      <div className="bg-surface border border-white/5 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <IndianRupee size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">FY 2025-26 Performance</h2>
              <p className="text-[9px] text-muted/40 font-bold uppercase tracking-widest mt-0.5 opacity-60">Strategic Fiscal Analysis</p>
            </div>
          </div>
          <div className="text-[9px] font-black text-accent bg-accent/10 px-3 py-1.5 rounded-xl border border-accent/20 uppercase tracking-widest">
            {fyAnalytics.daysLeftInFY} Days Remaining
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 hover:border-accent/30 transition-all">
            <p className="text-[9px] uppercase tracking-[0.1em] text-muted/40 font-bold mb-1.5">YTD Revenue Flow</p>
            <p className="text-2xl font-black text-white tabular-nums">{fyAnalytics.ytdRevenue}</p>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 hover:border-accent/30 transition-all">
            <p className="text-[9px] uppercase tracking-[0.1em] text-muted/40 font-bold mb-1.5">Target Deficit</p>
            <p className="text-2xl font-black text-accent tabular-nums">{fyAnalytics.targetRemaining}</p>
          </div>
          {fyAnalytics.peakMonths.slice(0, 2).map((pm, i) => (
            <div key={i} className="bg-black/20 border border-white/5 rounded-xl p-4 hover:border-accent/30 transition-all">
              <p className="text-[9px] uppercase tracking-[0.1em] text-muted/40 font-bold mb-1.5">Peak Vol: {pm.month}</p>
              <p className="text-lg font-black text-white tabular-nums">{pm.revenue}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events Grid */}
      <h2 className="text-lg font-bold text-white mb-4 pl-2">Upcoming High-Velocity Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {processedEvents.map((event) => (
          <div key={event.id} className="group relative bg-surface border border-white/5 rounded-3xl p-6 transition-all duration-500 hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[60px] pointer-events-none group-hover:bg-accent/10 transition-all" />
            
            <div className="flex justify-between items-start mb-5 relative z-10">
              <div className="max-w-[75%]">
                <span className="text-[9px] font-black text-accent bg-accent/10 px-2 py-1 rounded mb-2 inline-block border border-accent/20 uppercase tracking-[0.2em]">
                  {event.tag}
                </span>
                <h2 className="text-xl font-black text-white leading-tight tracking-tight uppercase group-hover:text-accent transition-colors">{event.name}</h2>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-center shadow-lg group-hover:border-accent/40 transition-all">
                <span className="text-[8px] font-black text-muted/40 uppercase">T-MINUS</span>
                <span className="text-xl font-black text-white leading-none tabular-nums mt-0.5">{event.daysLeft > 0 ? event.daysLeft : 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted/60 mb-5 font-bold relative z-10">
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-muted/30">
                <CalendarCheck size={14} />
              </div>
              {formatDate(event.date)}
            </div>

            <div className="bg-black/30 border border-white/8 rounded-2xl p-4 mb-5 relative overflow-hidden group-hover:border-accent/20 transition-all">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={14} className="text-accent" />
                    <span className="text-[9px] uppercase font-black tracking-[0.15em] text-muted/40">Predicted Surge</span>
                  </div>
                  <div className="text-3xl font-black text-white tabular-nums tracking-tighter">{event.expectedSurge}</div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-accent/5 flex items-center justify-center text-accent/20">
                  <BarChart3 size={24} />
                </div>
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/10 rounded-xl p-3.5 mb-5 text-[11px] text-accent font-bold italic leading-snug relative z-10">
              💡 {event.insight}
            </div>

            <div className="mt-auto relative z-10">
              <h3 className="text-[9px] font-black text-muted/60 mb-3 flex items-center gap-2 uppercase tracking-widest">
                <Package size={12} className="text-muted/30" /> Pre-Stock Protocol
              </h3>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {event.suggestions.map((item, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/8 text-[10px] font-bold text-white hover:border-accent/40 hover:text-accent transition-all cursor-default">
                    {item}
                  </span>
                ))}
              </div>
              
              <button className="w-full py-3 rounded-xl font-black text-[11px] text-black bg-accent hover:brightness-110 flex items-center justify-center gap-2 transition-all shadow-xl shadow-accent/10 uppercase tracking-widest">
                <Bell size={16} /> Schedule Alerts
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FestivalAlerts;
