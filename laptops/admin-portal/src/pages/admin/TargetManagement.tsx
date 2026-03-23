import React, { useState } from "react";
import { Target, TrendingUp, IndianRupee, Users, Edit3, Check, X, Award, BarChart3, ShieldCheck } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const formatINR = (n: number) => "₹" + n.toLocaleString('en-IN');

interface EmployeeTarget {
  id: string;
  name: string;
  role: string;
  avatar: string;
  monthlyRevenue: number;
  achievedRevenue: number;
  monthlyUnits: number;
  achievedUnits: number;
  month: string;
}

const initialTargets: EmployeeTarget[] = [
  { id: "EMP-001", name: "Moksh", role: "Admin", avatar: "M", monthlyRevenue: 500000, achievedRevenue: 382000, monthlyUnits: 120, achievedUnits: 92, month: "March 2026" },
  { id: "EMP-002", name: "John Doe", role: "Executive", avatar: "J", monthlyRevenue: 300000, achievedRevenue: 245000, monthlyUnits: 80, achievedUnits: 68, month: "March 2026" },
  { id: "EMP-003", name: "Sarah Smith", role: "Executive", avatar: "S", monthlyRevenue: 350000, achievedRevenue: 310000, monthlyUnits: 90, achievedUnits: 84, month: "March 2026" },
  { id: "EMP-004", name: "Alex Johnson", role: "Executive", avatar: "A", monthlyRevenue: 250000, achievedRevenue: 130000, monthlyUnits: 60, achievedUnits: 28, month: "March 2026" },
];

const TargetManagement: React.FC = () => {
  const [targets, setTargets] = useLocalStorage<EmployeeTarget[]>("ss_targets", initialTargets);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ revenue: 0, units: 0 });

  const startEdit = (t: EmployeeTarget) => {
    setEditingId(t.id);
    setEditValues({ revenue: t.monthlyRevenue, units: t.monthlyUnits });
  };
  const saveEdit = (id: string) => {
    setTargets(prev => prev.map(t => t.id === id ? { ...t, monthlyRevenue: editValues.revenue, monthlyUnits: editValues.units } : t));
    setEditingId(null);
  };
  const cancelEdit = () => setEditingId(null);

  const totalTarget = targets.reduce((s, t) => s + t.monthlyRevenue, 0);
  const totalAchieved = targets.reduce((s, t) => s + t.achievedRevenue, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            Target <span className="text-accent">Protocol</span>
          </h1>
          <p className="text-muted/60 text-sm">Strategic flow management and team output synchronization.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-accent/10 border border-accent/20 px-6 py-2.5 rounded-[18px] text-accent text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-accent/5">
            <Target size={18} /> March 2026 Cycle
          </div>
        </div>
      </div>

      {/* Overall Store Target */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative bg-surface border border-white/5 p-8 rounded-[32px] overflow-hidden transition-all duration-500 hover:border-accent/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[60px] pointer-events-none group-hover:bg-accent/10 transition-all" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <IndianRupee size={20} />
            </div>
            <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Global Objective</span>
          </div>
          <p className="text-4xl font-black text-white tabular-nums mb-1">{formatINR(totalTarget)}</p>
          <p className="text-[11px] font-bold text-muted/30 uppercase tracking-widest">Total Integrated Workflow</p>
        </div>

        <div className="group relative bg-surface border border-white/10 p-8 rounded-[32px] overflow-hidden transition-all duration-500 hover:border-accent/40 shadow-xl shadow-accent/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-[60px] pointer-events-none" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-black">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Current Yield</span>
          </div>
          <p className="text-4xl font-black text-accent tabular-nums mb-1">{formatINR(totalAchieved)}</p>
          <p className="text-[11px] font-bold text-accent/60 uppercase tracking-widest">{overallPct}% System Efficiency</p>
        </div>

        <div className="group relative bg-surface border border-white/5 p-8 rounded-[32px] overflow-hidden transition-all duration-500 hover:border-accent/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[60px] pointer-events-none group-hover:bg-accent/10 transition-all" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted/40 group-hover:text-accent transition-colors">
              <BarChart3 size={20} />
            </div>
            <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Flux Remaining</span>
          </div>
          <p className="text-4xl font-black text-white/50 tabular-nums mb-4">{formatINR(totalTarget - totalAchieved)}</p>
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-accent transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(252,163,17,0.4)]" style={{width: `${overallPct}%`}} />
          </div>
        </div>
      </div>

      {/* Employee Target Cards */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold flex items-center gap-4 text-white">
          <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Users size={22} />
          </div>
          Tactical Execution Units
        </h2>
        <div className="text-[10px] font-black text-muted/30 uppercase tracking-[0.2em]">Operational Status Monitoring</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {targets.map(t => {
          const revPct = t.monthlyRevenue > 0 ? Math.round((t.achievedRevenue / t.monthlyRevenue) * 100) : 0;
          const unitPct = t.monthlyUnits > 0 ? Math.round((t.achievedUnits / t.monthlyUnits) * 100) : 0;
          const isEditing = editingId === t.id;

          return (
            <div key={t.id} className="bg-surface border border-white/5 rounded-[32px] p-8 hover:border-accent/30 transition-all duration-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-bl-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-all" />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-[22px] bg-black/40 border border-white/10 flex items-center justify-center text-2xl font-black text-white shadow-xl group-hover:border-accent/40 transition-all">
                      {t.avatar}
                    </div>
                    {revPct >= 100 && (
                      <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-accent rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(252,163,17,0.5)] border-4 border-surface">
                        <Award size={14} className="text-black" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-white group-hover:text-accent transition-colors mb-1">{t.name}</h3>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={12} className="text-accent/60" />
                      <p className="text-[11px] text-muted/40 font-black uppercase tracking-widest">{t.id} · {t.role}</p>
                    </div>
                  </div>
                </div>
                {!isEditing ? (
                  <button onClick={() => startEdit(t)} className="p-3 rounded-2xl border border-white/8 bg-black/30 text-muted/40 hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all">
                    <Edit3 size={18} />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(t.id)} className="p-3 rounded-2xl bg-accent text-black font-black hover:brightness-110 transition-all"><Check size={18} /></button>
                    <button onClick={cancelEdit} className="p-3 rounded-2xl bg-black/40 border border-white/10 text-muted/60 hover:text-white transition-all"><X size={18} /></button>
                  </div>
                )}
              </div>

              {/* Analytics Tracks */}
              <div className="space-y-8 relative z-10">
                {/* Revenue Target */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" /> REVENUE FLOW
                    </span>
                    {isEditing ? (
                      <input 
                        type="number" value={editValues.revenue} onChange={e => setEditValues(v => ({...v, revenue: +e.target.value}))}
                        className="w-36 text-right bg-black/60 border border-accent/30 rounded-xl px-4 py-2 text-sm font-black text-accent focus:outline-none focus:ring-4 focus:ring-accent/5"
                      />
                    ) : (
                      <span className="text-sm font-black text-white tabular-nums">
                        <span className="text-accent">{formatINR(t.achievedRevenue)}</span>
                        <span className="text-muted/20"> / </span>
                        <span className="text-muted/60">{formatINR(t.monthlyRevenue)}</span>
                      </span>
                    )}
                  </div>
                  <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${revPct >= 100 ? 'bg-accent shadow-[0_0_15px_rgba(252,163,17,0.5)]' : 'bg-accent/40'}`} style={{width: `${Math.min(100, revPct)}%`}} />
                  </div>
                  <div className="flex justify-between mt-3">
                    <span className="text-[10px] font-black text-accent/60 uppercase tracking-widest">{revPct}% MISSION STATUS</span>
                    <span className="text-[10px] font-black text-muted/30 uppercase tracking-widest">{formatINR(Math.max(0, t.monthlyRevenue - t.achievedRevenue))} REMAINDER</span>
                  </div>
                </div>

                {/* Units Target */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted/20" /> UNIT VELOCITY
                    </span>
                    {isEditing ? (
                      <input 
                        type="number" value={editValues.units} onChange={e => setEditValues(v => ({...v, units: +e.target.value}))}
                        className="w-28 text-right bg-black/60 border border-accent/30 rounded-xl px-4 py-2 text-sm font-black text-accent focus:outline-none focus:ring-4 focus:ring-accent/5"
                      />
                    ) : (
                      <span className="text-sm font-black text-white tabular-nums">
                        <span className="text-white/80">{t.achievedUnits}</span>
                        <span className="text-muted/20"> / </span>
                        <span className="text-muted/60">{t.monthlyUnits} UNITS</span>
                      </span>
                    )}
                  </div>
                  <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${unitPct >= 100 ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white/10'}`} style={{width: `${Math.min(100, unitPct)}%`}} />
                  </div>
                  <div className="flex justify-between mt-3">
                    <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest">{unitPct}% VELOCITY</span>
                    <span className="text-[10px] font-black text-muted/30 uppercase tracking-widest">{Math.max(0, t.monthlyUnits - t.achievedUnits)} UNITS REMAINING</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TargetManagement;
