import React from "react";
import { Target, IndianRupee, Award, Flame, Clock, Trophy, Zap } from "lucide-react";

const formatINR = (n: number) => "₹" + n.toLocaleString('en-IN');

// This would come from API based on logged-in user.
// Structure is ready for real data integration.
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

const MyTargets: React.FC = () => {
  const revPct = Math.round((myTarget.achievedRevenue / myTarget.monthlyRevenue) * 100);
  const unitPct = Math.round((myTarget.achievedUnits / myTarget.monthlyUnits) * 100);
  const dailyPct = Math.round((myTarget.todayRevenue / myTarget.dailyTarget) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">My Targets</h1>
          <p className="text-xtext-secondary text-sm">Track your monthly performance and daily progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-amber-400 text-sm font-bold flex items-center gap-2">
            <Target size={16} /> {myTarget.month}
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl text-rose-400 text-sm font-bold flex items-center gap-2">
            <Clock size={16} /> {myTarget.daysLeft} Days Left
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-xcard border border-white/5 rounded-2xl p-4 text-center">
          <Flame size={20} className="text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-black text-white">{myTarget.streak}</p>
          <p className="text-[10px] text-xtext-secondary font-bold uppercase tracking-wider">Day Streak</p>
        </div>
        <div className="bg-xcard border border-white/5 rounded-2xl p-4 text-center">
          <Trophy size={20} className="text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-black text-white">#{myTarget.rank}</p>
          <p className="text-[10px] text-xtext-secondary font-bold uppercase tracking-wider">Team Rank</p>
        </div>
        <div className="bg-xcard border border-white/5 rounded-2xl p-4 text-center">
          <Target size={20} className="text-cyan-400 mx-auto mb-2" />
          <p className="text-2xl font-black text-white">{revPct}%</p>
          <p className="text-[10px] text-xtext-secondary font-bold uppercase tracking-wider">Revenue Hit</p>
        </div>
        <div className="bg-xcard border border-white/5 rounded-2xl p-4 text-center">
          <Zap size={20} className="text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-black text-white">{unitPct}%</p>
          <p className="text-[10px] text-xtext-secondary font-bold uppercase tracking-wider">Units Hit</p>
        </div>
      </div>

      {/* Main Target Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Target */}
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl opacity-20 group-hover:opacity-30 blur-lg transition duration-500 bg-gradient-to-r from-emerald-500 to-cyan-500" />
          <div className="bg-xcard border border-white/5 rounded-3xl p-6 relative z-10 h-full">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <IndianRupee size={18} className="text-emerald-400" />
              </div>
              <h2 className="font-bold text-lg">Revenue Target</h2>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-4xl font-black text-emerald-400">{formatINR(myTarget.achievedRevenue)}</p>
              <p className="text-sm text-xtext-secondary mt-1">of {formatINR(myTarget.monthlyRevenue)} target</p>
            </div>

            <div className="w-full h-4 bg-background rounded-full overflow-hidden mb-3">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${revPct >= 100 ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : revPct >= 70 ? 'bg-gradient-to-r from-cyan-400 to-blue-400' : revPct >= 40 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-rose-400 to-pink-400'}`} 
                style={{width: `${Math.min(100, revPct)}%`}} 
              />
            </div>
            <div className="flex justify-between text-xs text-xtext-secondary">
              <span>{revPct}% complete</span>
              <span>{formatINR(Math.max(0, myTarget.monthlyRevenue - myTarget.achievedRevenue))} to go</span>
            </div>
          </div>
        </div>

        {/* Units Target */}
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl opacity-20 group-hover:opacity-30 blur-lg transition duration-500 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="bg-xcard border border-white/5 rounded-3xl p-6 relative z-10 h-full">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Target size={18} className="text-amber-400" />
              </div>
              <h2 className="font-bold text-lg">Units Target</h2>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-4xl font-black text-amber-400">{myTarget.achievedUnits}</p>
              <p className="text-sm text-xtext-secondary mt-1">of {myTarget.monthlyUnits} units target</p>
            </div>

            <div className="w-full h-4 bg-background rounded-full overflow-hidden mb-3">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${unitPct >= 100 ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : unitPct >= 70 ? 'bg-gradient-to-r from-cyan-400 to-blue-400' : unitPct >= 40 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-rose-400 to-pink-400'}`} 
                style={{width: `${Math.min(100, unitPct)}%`}} 
              />
            </div>
            <div className="flex justify-between text-xs text-xtext-secondary">
              <span>{unitPct}% complete</span>
              <span>{Math.max(0, myTarget.monthlyUnits - myTarget.achievedUnits)} units to go</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Progress + Top Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Daily Target */}
        <div className="bg-xcard border border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full pointer-events-none" />
          <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock size={14} className="text-cyan-400" /> Today's Progress
          </h3>
          <div className="text-center mb-4">
            <p className="text-3xl font-black text-white">{formatINR(myTarget.todayRevenue)}</p>
            <p className="text-xs text-xtext-secondary mt-1">Daily target: {formatINR(myTarget.dailyTarget)}</p>
          </div>
          <div className="w-full h-3 bg-background rounded-full overflow-hidden mb-2">
            <div className={`h-full rounded-full ${dailyPct >= 100 ? 'bg-emerald-400' : 'bg-cyan-400'}`} style={{width: `${Math.min(100, dailyPct)}%`}} />
          </div>
          <p className="text-center text-xs text-xtext-secondary">{dailyPct}% of today's target</p>
        </div>

        {/* Top Contributing Products */}
        <div className="md:col-span-2 bg-xcard border border-white/5 rounded-3xl p-6">
          <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award size={14} className="text-amber-400" /> Your Top Contributing Products
          </h3>
          <div className="space-y-3">
            {myTarget.topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-background border border-white/5 rounded-2xl hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center font-black text-sm text-amber-400 border border-amber-500/20">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{p.name}</h4>
                    <p className="text-[10px] text-xtext-secondary">{p.units} units sold</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-emerald-400">{formatINR(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTargets;
