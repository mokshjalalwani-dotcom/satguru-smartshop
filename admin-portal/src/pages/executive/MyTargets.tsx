import React from "react";
import { Target, IndianRupee, Award, Flame, Clock, Trophy, TrendingUp, Package, CheckCircle2, ArrowRight } from "lucide-react";

const formatINR = (n: number) => "₹" + n.toLocaleString('en-IN');

const myTarget = {
  name: "John Doe",
  id: "EMP-002",
  month: "March 2026",
  daysLeft: 21,
  monthlyRevenue: 300000,
  achievedRevenue: 245000,
  monthlyUnits: 80,
  achievedUnits: 68,
  dailyTarget: 10000,
  todayRevenue: 8500,
  streak: 5,
  rank: 2,
  totalStaff: 4,
  topProducts: [
    { name: "Wireless Earbuds G2", units: 22, revenue: 109978 },
    { name: "Premium Smart Watch", units: 15, revenue: 374985 },
    { name: "USB-C Fast Charger", units: 31, revenue: 46469 },
  ],
};

function ProgressBar({ pct, color = "accent" }: { pct: number; color?: string }) {
  const clamp = Math.min(100, Math.max(0, pct));
  const bg =
    pct >= 100 ? "bg-emerald-500" :
    pct >= 70  ? "bg-amber-400"   :
    pct >= 40  ? "bg-amber-400/60" :
                 "bg-rose-500";

  return (
    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${bg} transition-all duration-700`}
        style={{ width: `${clamp}%` }}
      />
    </div>
  );
}

const MyTargets: React.FC = () => {
  const revPct   = Math.round((myTarget.achievedRevenue / myTarget.monthlyRevenue) * 100);
  const unitPct  = Math.round((myTarget.achievedUnits / myTarget.monthlyUnits) * 100);
  const dailyPct = Math.round((myTarget.todayRevenue / myTarget.dailyTarget) * 100);

  const stats = [
    { label: "Day streak",    value: `${myTarget.streak} days`, icon: <Flame size={18} />,    good: myTarget.streak >= 3  },
    { label: "Team rank",     value: `#${myTarget.rank} of ${myTarget.totalStaff}`, icon: <Trophy size={18} />,   good: myTarget.rank === 1 },
    { label: "Revenue hit",   value: `${revPct}%`,  icon: <TrendingUp size={18} />, good: revPct >= 70   },
    { label: "Units sold",    value: `${unitPct}%`, icon: <Package size={18} />,    good: unitPct >= 70  },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">My Sales Targets</h1>
          <p className="text-sm text-white/40 font-medium">Track your progress for {myTarget.month}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold bg-white/5 border border-white/10 text-white/60 px-4 py-2 rounded-xl flex items-center gap-2">
            <Target size={14} className="text-amber-400" /> {myTarget.month}
          </span>
          <span className="text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2 rounded-xl flex items-center gap-2">
            <Clock size={14} /> {myTarget.daysLeft} days left
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/[0.05] transition-colors">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.good ? "bg-amber-400/10 text-amber-400" : "bg-white/5 text-white/30"}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-white tabular-nums">{s.value}</p>
              <p className="text-xs text-white/40 font-medium mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Target Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Revenue */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:bg-white/[0.05] transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                <IndianRupee size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-white text-sm">Monthly Revenue</h2>
                <p className="text-xs text-white/40">Target: {formatINR(myTarget.monthlyRevenue)}</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-lg ${revPct >= 70 ? "bg-amber-400/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
              {revPct}%
            </span>
          </div>

          <p className="text-3xl font-bold text-white tabular-nums mb-6">
            {formatINR(myTarget.achievedRevenue)}
          </p>

          <ProgressBar pct={revPct} />

          <div className="flex justify-between mt-3 text-xs font-medium text-white/30">
            <span>{revPct}% of target reached</span>
            <span>{formatINR(Math.max(0, myTarget.monthlyRevenue - myTarget.achievedRevenue))} to go</span>
          </div>
        </div>

        {/* Units */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:bg-white/[0.05] transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/50">
                <Package size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-white text-sm">Units Sold</h2>
                <p className="text-xs text-white/40">Target: {myTarget.monthlyUnits} units</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-lg ${unitPct >= 70 ? "bg-amber-400/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
              {unitPct}%
            </span>
          </div>

          <p className="text-3xl font-bold text-amber-400 tabular-nums mb-6">
            {myTarget.achievedUnits} <span className="text-lg text-white/30 font-medium">/ {myTarget.monthlyUnits}</span>
          </p>

          <ProgressBar pct={unitPct} />

          <div className="flex justify-between mt-3 text-xs font-medium text-white/30">
            <span>{unitPct}% of target reached</span>
            <span>{Math.max(0, myTarget.monthlyUnits - myTarget.achievedUnits)} units to go</span>
          </div>
        </div>
      </div>

      {/* Today + Top Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Today's Progress */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={14} className="text-amber-400" />
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Today's Sales</h3>
          </div>
          <p className="text-2xl font-bold text-white tabular-nums mb-1">{formatINR(myTarget.todayRevenue)}</p>
          <p className="text-xs text-white/30 mb-5">Daily target: {formatINR(myTarget.dailyTarget)}</p>
          <ProgressBar pct={dailyPct} />
          <p className="text-xs text-white/30 mt-3">
            {dailyPct >= 100
              ? <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} /> Target reached!</span>
              : `${dailyPct}% of daily target`}
          </p>
        </div>

        {/* Top Products */}
        <div className="md:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Award size={14} className="text-amber-400" />
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Your Best-Selling Products</h3>
          </div>
          <div className="space-y-3">
            {myTarget.topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group">
                <div className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white/40">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">{p.name}</p>
                    <p className="text-xs text-white/30">{p.units} units sold</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white tabular-nums">{formatINR(p.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between py-4 px-6 bg-white/[0.02] border border-white/5 rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 status-dot" />
          <span className="text-xs font-medium text-white/40">Live data · Employee ID: {myTarget.id}</span>
        </div>
        <span className="text-xs text-white/20">Resets at end of month</span>
      </div>

    </div>
  );
};

export default MyTargets;
