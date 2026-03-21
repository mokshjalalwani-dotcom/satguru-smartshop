import React, { useState } from "react";
import { Target, TrendingUp, IndianRupee, Users, Edit3, Check, X, Award, BarChart3 } from "lucide-react";
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">Target Management</h1>
          <p className="text-xtext-secondary text-sm">Set, track, and manage monthly sales targets for your team.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-amber-400 text-sm font-bold flex items-center gap-2">
            <Target size={16} /> March 2026
          </div>
        </div>
      </div>

      {/* Overall Store Target */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl opacity-20 group-hover:opacity-40 blur-lg transition duration-500 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="bg-xcard border border-amber-500/20 p-6 rounded-3xl relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <IndianRupee size={16} className="text-amber-400" />
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Store Target</span>
            </div>
            <p className="text-3xl font-black text-white">{formatINR(totalTarget)}</p>
            <p className="text-xs text-xtext-secondary mt-1">Total monthly target for all staff</p>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl opacity-20 group-hover:opacity-40 blur-lg transition duration-500 bg-gradient-to-r from-emerald-500 to-cyan-500" />
          <div className="bg-xcard border border-emerald-500/20 p-6 rounded-3xl relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-emerald-400" />
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Achieved</span>
            </div>
            <p className="text-3xl font-black text-emerald-400">{formatINR(totalAchieved)}</p>
            <p className="text-xs text-xtext-secondary mt-1">{overallPct}% of monthly target</p>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl opacity-20 group-hover:opacity-40 blur-lg transition duration-500 bg-gradient-to-r from-cyan-500 to-blue-500" />
          <div className="bg-xcard border border-cyan-500/20 p-6 rounded-3xl relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-cyan-400" />
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Remaining</span>
            </div>
            <p className="text-3xl font-black text-white">{formatINR(totalTarget - totalAchieved)}</p>
            <div className="w-full h-2 bg-background rounded-full mt-3 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${overallPct >= 80 ? 'bg-emerald-400' : overallPct >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{width: `${overallPct}%`}} />
            </div>
          </div>
        </div>
      </div>

      {/* Employee Target Cards */}
      <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/5 pb-3">
        <Users size={20} className="text-amber-400" /> Individual Targets
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {targets.map(t => {
          const revPct = t.monthlyRevenue > 0 ? Math.round((t.achievedRevenue / t.monthlyRevenue) * 100) : 0;
          const unitPct = t.monthlyUnits > 0 ? Math.round((t.achievedUnits / t.monthlyUnits) * 100) : 0;
          const isEditing = editingId === t.id;

          return (
            <div key={t.id} className="bg-xcard border border-white/5 rounded-3xl p-6 hover:border-amber-500/20 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-all" />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                      {t.avatar}
                    </div>
                    {revPct >= 100 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(52,211,153,0.7)]">
                        <Award size={10} className="text-black" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{t.name}</h3>
                    <p className="text-xs text-xtext-secondary font-medium">{t.id} · {t.role}</p>
                  </div>
                </div>
                {!isEditing ? (
                  <button onClick={() => startEdit(t)} className="p-2 rounded-lg border border-white/10 text-xtext-secondary hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all">
                    <Edit3 size={16} />
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button onClick={() => saveEdit(t.id)} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"><Check size={16} /></button>
                    <button onClick={cancelEdit} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"><X size={16} /></button>
                  </div>
                )}
              </div>

              {/* Revenue Target */}
              <div className="mb-5 relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                    <IndianRupee size={12} /> Revenue Target
                  </span>
                  {isEditing ? (
                    <input 
                      type="number" value={editValues.revenue} onChange={e => setEditValues(v => ({...v, revenue: +e.target.value}))}
                      className="w-32 text-right bg-background border border-amber-500/30 rounded-lg px-3 py-1 text-sm font-bold text-amber-400 focus:outline-none"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      <span className="text-emerald-400">{formatINR(t.achievedRevenue)}</span>
                      <span className="text-xtext-secondary"> / {formatINR(t.monthlyRevenue)}</span>
                    </span>
                  )}
                </div>
                <div className="w-full h-2.5 bg-background rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${revPct >= 100 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : revPct >= 70 ? 'bg-cyan-400' : revPct >= 40 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{width: `${Math.min(100, revPct)}%`}} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-xtext-secondary">{revPct}% achieved</span>
                  <span className="text-[10px] text-xtext-secondary">{formatINR(Math.max(0, t.monthlyRevenue - t.achievedRevenue))} remaining</span>
                </div>
              </div>

              {/* Units Target */}
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                    <Target size={12} /> Units Target
                  </span>
                  {isEditing ? (
                    <input 
                      type="number" value={editValues.units} onChange={e => setEditValues(v => ({...v, units: +e.target.value}))}
                      className="w-24 text-right bg-background border border-amber-500/30 rounded-lg px-3 py-1 text-sm font-bold text-amber-400 focus:outline-none"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      <span className="text-cyan-400">{t.achievedUnits}</span>
                      <span className="text-xtext-secondary"> / {t.monthlyUnits} units</span>
                    </span>
                  )}
                </div>
                <div className="w-full h-2.5 bg-background rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${unitPct >= 100 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : unitPct >= 70 ? 'bg-cyan-400' : unitPct >= 40 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{width: `${Math.min(100, unitPct)}%`}} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-xtext-secondary">{unitPct}% achieved</span>
                  <span className="text-[10px] text-xtext-secondary">{Math.max(0, t.monthlyUnits - t.achievedUnits)} units remaining</span>
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
