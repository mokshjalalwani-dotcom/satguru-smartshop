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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            Event <span className="text-accent">Intelligence</span>
          </h1>
          <p className="text-muted/60 text-sm">Predictive inventory mapping for festivals and fiscal milestones.</p>
        </div>
        <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 px-4 py-2 rounded-2xl text-accent shadow-lg shadow-accent/5">
          <Sparkles size={16} />
          <span className="font-black text-[11px] uppercase tracking-widest">AI Prediction Active</span>
        </div>
      </div>

      {/* FY Analytics Strip */}
      <div className="bg-surface border border-white/5 rounded-[32px] p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <IndianRupee size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">FY 2025-26 Performance</h2>
              <p className="text-[10px] text-muted/40 font-bold uppercase tracking-widest mt-1">Strategic Fiscal Analysis</p>
            </div>
          </div>
          <div className="text-[10px] font-black text-accent bg-accent/10 px-4 py-2 rounded-[14px] border border-accent/20 uppercase tracking-widest shadow-lg shadow-accent/5">
            {fyAnalytics.daysLeftInFY} Days Remaining
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-black/20 border border-white/5 rounded-2xl p-6 hover:border-accent/30 transition-all">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted/40 font-bold mb-2">YTD Revenue Flow</p>
            <p className="text-3xl font-black text-white tabular-nums">{fyAnalytics.ytdRevenue}</p>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-2xl p-6 hover:border-accent/30 transition-all">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted/40 font-bold mb-2">Target Deficit</p>
            <p className="text-3xl font-black text-accent tabular-nums">{fyAnalytics.targetRemaining}</p>
          </div>
          {fyAnalytics.peakMonths.slice(0, 2).map((pm, i) => (
            <div key={i} className="bg-black/20 border border-white/5 rounded-2xl p-6 hover:border-accent/30 transition-all">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted/40 font-bold mb-2">Peak Vol: {pm.month}</p>
              <p className="text-xl font-black text-white tabular-nums">{pm.revenue}</p>
              <p className="text-[10px] text-muted/30 font-bold mt-2 uppercase tracking-wider">{pm.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events Grid */}
      <h2 className="text-xl font-bold text-white mb-6 pl-2">Upcoming High-Velocity Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {processedEvents.map((event) => (
          <div key={event.id} className="group relative bg-surface border border-white/5 rounded-[32px] p-8 transition-all duration-500 hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-bl-[100px] pointer-events-none group-hover:bg-accent/10 transition-all" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="max-w-[70%]">
                <span className="text-[10px] font-black text-accent bg-accent/10 px-3 py-1.5 rounded-lg mb-4 inline-block border border-accent/20 uppercase tracking-widest">
                  {event.tag}
                </span>
                <h2 className="text-2xl font-black text-white leading-tight tracking-tight uppercase group-hover:text-accent transition-colors">{event.name}</h2>
              </div>
              <div className="w-16 h-16 rounded-[22px] bg-black/40 border border-white/10 flex flex-col items-center justify-center shadow-lg group-hover:border-accent/40 transition-all">
                <span className="text-[10px] font-black text-muted/40 uppercase">T-MINUS</span>
                <span className="text-2xl font-black text-white leading-none tabular-nums mt-1">{event.daysLeft > 0 ? event.daysLeft : 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted/60 mb-8 font-bold relative z-10">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-muted/30">
                <CalendarCheck size={18} />
              </div>
              {formatDate(event.date)}
            </div>

            <div className="bg-black/30 border border-white/8 rounded-2xl p-6 mb-8 relative overflow-hidden group-hover:border-accent/20 transition-all">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-accent" />
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-muted/40">Predicted Demand Surge</span>
                  </div>
                  <div className="text-4xl font-black text-white tabular-nums tracking-tighter">{event.expectedSurge}</div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-accent/5 flex items-center justify-center text-accent/20">
                  <BarChart3 size={32} />
                </div>
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/10 rounded-2xl p-5 mb-8 text-xs text-accent font-bold italic leading-relaxed relative z-10">
              💡 {event.insight}
            </div>

            <div className="mt-auto relative z-10">
              <h3 className="text-[10px] font-black text-muted/60 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <Package size={14} className="text-muted/30" /> Pre-Stock Protocol
              </h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {event.suggestions.map((item, i) => (
                  <span key={i} className="px-4 py-2 rounded-xl bg-black/40 border border-white/8 text-[11px] font-bold text-white hover:border-accent/40 hover:text-accent transition-all cursor-default">
                    {item}
                  </span>
                ))}
              </div>
              
              <button className="w-full py-4 rounded-2xl font-black text-[12px] text-black bg-accent hover:brightness-110 flex items-center justify-center gap-3 transition-all shadow-xl shadow-accent/10 uppercase tracking-widest">
                <Bell size={18} /> Schedule Deployment Alerts
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FestivalAlerts;
