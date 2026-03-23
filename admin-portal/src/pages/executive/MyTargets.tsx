import React from "react";
import { Target, IndianRupee, Award, Flame, Clock, Trophy, Zap, ShieldCheck, Box, Target as TargetIcon } from "lucide-react";

const formatINR = (n: number) => "₹" + n.toLocaleString('en-IN');

// This would come from API based on logged-in user.
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">
            Performance <span className="text-accent">Metrics</span>
          </h1>
          <p className="text-muted/60 text-sm font-medium">Strategic yield tracking and individual operational objectives.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-3 shadow-xl">
            <TargetIcon size={16} className="text-accent" /> {myTarget.month}
          </div>
          <div className="bg-surface border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-3 shadow-xl">
            <Clock size={16} /> {myTarget.daysLeft} DAYS LEFT
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Cycle Streak", val: myTarget.streak, icon: <Flame size={20} />, color: "accent" },
          { label: "Fleet Rank", val: `#${myTarget.rank}`, icon: <Trophy size={20} />, color: "white" },
          { label: "Yield Hit", val: `${revPct}%`, icon: <Target size={20} />, color: "accent/10" },
          { label: "Output Hit", val: `${unitPct}%`, icon: <Zap size={20} />, color: "white" },
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-white/5 rounded-[28px] p-6 text-center group transition-all hover:border-accent/30 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${stat.color === 'accent' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-black/40 text-muted/30 border border-white/5'}`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-black text-white mb-1 tabular-nums transition-colors group-hover:text-accent">{stat.val}</p>
            <p className="text-[10px] text-muted/40 font-black uppercase tracking-[0.2em]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Target Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Revenue Target */}
        <div className="bg-surface border border-white/5 rounded-[40px] p-10 relative overflow-hidden group shadow-2xl transition-all hover:border-accent/40">
           <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-accent">
                  <IndianRupee size={22} />
                </div>
                <h2 className="font-black text-xl text-white uppercase tracking-tight">Revenue Yield</h2>
              </div>
              <div className="text-[10px] font-black text-accent bg-accent/10 border border-accent/20 px-4 py-2 rounded-xl">PROTOCOL ALPHA</div>
            </div>
            
            <div className="text-center mb-10 relative z-10">
              <p className="text-5xl font-black text-white tabular-nums mb-3 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">{formatINR(myTarget.achievedRevenue)}</p>
              <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.3em]">Operational Goal: {formatINR(myTarget.monthlyRevenue)}</p>
            </div>

            <div className="relative z-10">
              <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 mb-6">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(252,163,17,0.4)] ${revPct >= 100 ? 'bg-accent' : revPct >= 70 ? 'bg-accent/70' : revPct >= 40 ? 'bg-accent/40' : 'bg-rose-500'}`} 
                  style={{width: `${Math.min(100, revPct)}%`}} 
                />
              </div>
              <div className="flex justify-between items-center px-1">
                <p className="text-[10px] font-black text-accent uppercase tracking-widest">{revPct}% UTILIZED</p>
                <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest">{formatINR(Math.max(0, myTarget.monthlyRevenue - myTarget.achievedRevenue))} REMAINING</p>
              </div>
            </div>
        </div>

        {/* Units Target */}
        <div className="bg-surface border border-white/5 rounded-[40px] p-10 relative overflow-hidden group shadow-2xl transition-all hover:border-accent/40">
           <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-white/40">
                  <Box size={22} />
                </div>
                <h2 className="font-black text-xl text-white uppercase tracking-tight">Output Quota</h2>
              </div>
              <div className="text-[10px] font-black text-muted/40 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">UNIT TRACKING</div>
            </div>
            
            <div className="text-center mb-10 relative z-10">
              <p className="text-5xl font-black text-accent tabular-nums mb-3 drop-shadow-[0_0_20px_rgba(252,163,17,0.2)]">{myTarget.achievedUnits}</p>
              <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.3em]">Operational Goal: {myTarget.monthlyUnits} UNITS</p>
            </div>

            <div className="relative z-10">
              <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 mb-6">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(252,163,17,0.4)] ${unitPct >= 100 ? 'bg-accent' : unitPct >= 70 ? 'bg-accent/70' : unitPct >= 40 ? 'bg-accent/40' : 'bg-rose-500'}`} 
                  style={{width: `${Math.min(100, unitPct)}%`}} 
                />
              </div>
              <div className="flex justify-between items-center px-1">
                <p className="text-[10px] font-black text-accent uppercase tracking-widest">{unitPct}% UTILIZED</p>
                <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest">{Math.max(0, myTarget.monthlyUnits - myTarget.achievedUnits)} UNITS REMAINING</p>
              </div>
            </div>
        </div>
      </div>

      {/* Today's Progress + Top Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Today's Daily Target */}
        <div className="bg-surface border border-white/5 rounded-[32px] p-8 relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[40px] pointer-events-none" />
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <Clock size={16} className="text-accent" /> Cycle Status
          </h3>
          <div className="text-center mb-10">
            <p className="text-4xl font-black text-white tabular-nums mb-2">{formatINR(myTarget.todayRevenue)}</p>
            <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Target Window: {formatINR(myTarget.dailyTarget)}</p>
          </div>
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 mb-4">
            <div className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(252,163,17,0.3)] ${dailyPct >= 100 ? 'bg-accent' : 'bg-accent/40'}`} style={{width: `${Math.min(100, dailyPct)}%`}} />
          </div>
          <p className="text-center text-[10px] font-black text-accent uppercase tracking-widest">{dailyPct}% OF WINDOW REACHED</p>
        </div>

        {/* Top Contributing Products */}
        <div className="md:col-span-2 bg-surface border border-white/5 rounded-[32px] p-8 shadow-xl">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <Award size={16} className="text-accent" /> Strategic Yield Contributors
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {myTarget.topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-black/20 border border-white/5 rounded-[22px] hover:border-accent/40 transition-all group cursor-pointer shadow-lg">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/8 flex items-center justify-center font-black text-lg text-white group-hover:text-accent group-hover:border-accent/30 transition-all shadow-xl">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-white uppercase tracking-widest group-hover:text-accent transition-colors mb-1.5">{p.name}</h4>
                    <p className="text-[9px] font-black text-muted/40 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Box size={10} className="text-accent/40" /> {p.units} UNITS DEPLOYED
                    </p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-white tabular-nums tracking-wide">{formatINR(p.revenue)}</p>
                   <p className="text-[9px] font-black text-accent uppercase tracking-[0.2em] mt-1.5 leading-none">Net Contribution</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-black/40 border border-white/5 rounded-[32px] p-8 flex items-center justify-between shadow-inner">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-center text-accent"><ShieldCheck size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Performance Dashboard Sync: <span className="text-accent">Active Ledger</span></p>
              <p className="text-[9px] font-black text-muted/20 uppercase tracking-[0.2em] mt-1">Authorized entity: {myTarget.id}</p>
            </div>
         </div>
         <div className="text-[9px] font-black text-muted/10 uppercase tracking-[0.5em]">Strategic Output Console</div>
      </div>
    </div>
  );
};

export default MyTargets;
