import React from "react";
import { Sparkles, TrendingUp, CalendarCheck, Package, Bell, BarChart3, IndianRupee } from "lucide-react";

/*
  Today is March 10, 2026. Indian FY runs April–March.
  - Current FY: 2025-26 (ending Mar 31, 2026)
  - Next FY:    2026-27 (starting Apr 1, 2026)

  Analytics insights are based on:
  - Last FY 2024-25 peak sales months
  - Upcoming festivals relative to today
  - Historical demand surge data
*/

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
      <div className="flex flex-col justify-between items-start border-b border-white/5 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Event Intelligence</h1>
          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={12} /> AI Powered
          </span>
        </div>
        <p className="text-xtext-secondary text-sm">Predictive inventory alerts mapped to upcoming festivals, FY milestones, and historical peak sales data.</p>
      </div>

      {/* FY Analytics Strip */}
      <div className="bg-xcard border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <IndianRupee size={16} className="text-cyan-400" />
          <h2 className="font-bold text-sm uppercase tracking-wider text-white/80">FY 2025-26 Analytics</h2>
          <span className="ml-auto text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">{fyAnalytics.daysLeftInFY} Days Left</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-background border border-white/5 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-xtext-secondary font-bold mb-1">YTD Revenue</p>
            <p className="text-2xl font-black text-white">{fyAnalytics.ytdRevenue}</p>
          </div>
          <div className="bg-background border border-white/5 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-xtext-secondary font-bold mb-1">Target Remaining</p>
            <p className="text-2xl font-black text-amber-400">{fyAnalytics.targetRemaining}</p>
          </div>
          {fyAnalytics.peakMonths.slice(0, 2).map((pm, i) => (
            <div key={i} className="bg-background border border-white/5 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-xtext-secondary font-bold mb-1">Peak #{i+1}: {pm.month}</p>
              <p className="text-lg font-black text-white">{pm.revenue}</p>
              <p className="text-[10px] text-xtext-secondary mt-0.5">{pm.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {processedEvents.map((event) => (
          <div key={event.id} className="relative group">
            <div className={`absolute -inset-0.5 rounded-3xl opacity-10 group-hover:opacity-20 blur-lg transition duration-500 bg-gradient-to-r ${event.color}`} />
            
            <div className="bg-xcard border border-white/10 rounded-3xl p-6 relative z-10 h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-white/50 bg-white/5 px-2.5 py-1 rounded-md mb-3 inline-block border border-white/5">
                    {event.tag}
                  </span>
                  <h2 className="text-xl font-bold text-white leading-tight">{event.name}</h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-background border border-white/10 flex flex-col items-center justify-center shadow-inner flex-shrink-0">
                  <span className="text-[10px] font-bold text-xtext-secondary uppercase">In</span>
                  <span className="text-lg font-black text-white leading-none">{event.daysLeft > 0 ? event.daysLeft : 0}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-xtext-secondary mb-4">
                <CalendarCheck size={16} className="text-white/40" />
                {formatDate(event.date)}
              </div>

              <div className="bg-background border border-white/5 rounded-xl p-3 mb-4 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] opacity-20 pointer-events-none ${event.bgGlow}`} />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <TrendingUp size={14} className="text-white/60" />
                      <span className="text-[10px] uppercase tracking-wider font-bold text-white/60">Predicted Surge</span>
                    </div>
                    <div className="text-2xl font-black text-white">{event.expectedSurge}</div>
                  </div>
                  <BarChart3 size={28} className="text-white/10" />
                </div>
              </div>

              {/* AI Insight */}
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 mb-4 text-xs text-indigo-300 italic">
                💡 {event.insight}
              </div>

              <div className="mt-auto">
                <h3 className="text-xs font-bold text-white/70 mb-2 flex items-center gap-1.5">
                  <Package size={12} className="text-white/50" /> Pre-stock Recommendations
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {event.suggestions.map((item, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-medium text-white hover:bg-white/10 transition-colors">
                      {item}
                    </span>
                  ))}
                </div>
                
                <button className={`w-full py-3 rounded-xl font-bold text-sm text-background flex items-center justify-center gap-2 transition-all shadow-lg bg-gradient-to-r ${event.color} hover:shadow-[0_0_15px_rgba(255,255,255,0.06)]`}>
                  <Bell size={16} /> Schedule Prep Alerts
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FestivalAlerts;
