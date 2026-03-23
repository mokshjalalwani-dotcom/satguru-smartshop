import React, { useState } from "react";
import { Users, UserPlus, Clock, CheckCircle2, TrendingUp, MoreVertical, Shield, Edit3, Trash2, X, Check, EyeOff } from "lucide-react";
import FloatingModal from "../../ui/FloatingModal";
import { useLocalStorage } from "../../hooks/useLocalStorage";

interface Staff {
  id: string;
  name: string;
  role: string;
  status: "Online" | "Offline" | "On Break";
  shift: string;
  tasksCompleted: number;
  aiScore: number;
  avatar: string;
}

const defaultStaff: Staff[] = [
  { id: "EMP-001", name: "Moksh", role: "Admin", status: "Online", shift: "Flexible", tasksCompleted: 12, aiScore: 98, avatar: "M" },
  { id: "EMP-002", name: "John Doe", role: "Executive", status: "Online", shift: "09:00 - 17:00", tasksCompleted: 4, aiScore: 85, avatar: "J" },
  { id: "EMP-003", name: "Sarah Smith", role: "Executive", status: "Offline", shift: "12:00 - 20:00", tasksCompleted: 7, aiScore: 92, avatar: "S" },
  { id: "EMP-004", name: "Alex Johnson", role: "Executive", status: "On Break", shift: "08:00 - 16:00", tasksCompleted: 2, aiScore: 78, avatar: "A" },
];

const TeamManagement: React.FC = () => {
  const [staff, setStaff] = useLocalStorage<Staff[]>("ss_team", defaultStaff);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Staff | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("Executive");
  const [formShift, setFormShift] = useState("09:00 - 17:00");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleAddMember = () => {
    if (!formName.trim()) return;
    const member: Staff = {
      id: `EMP-${String(staff.length + 1).padStart(3, "0")}`,
      name: formName.trim(),
      role: formRole,
      status: "Offline",
      shift: formShift,
      tasksCompleted: 0,
      aiScore: 75,
      avatar: formName.trim().charAt(0).toUpperCase(),
    };
    setStaff(prev => [...prev, member]);
    setShowAddModal(false);
    setFormName(""); setFormRole("Executive"); setFormShift("09:00 - 17:00");
    showToast(`Entity "${member.name}" integrated!`);
  };

  const handleEditMember = () => {
    if (!editingMember) return;
    setStaff(prev => prev.map(s => s.id === editingMember.id ? editingMember : s));
    setEditingMember(null);
    showToast(`Entity profiles synchronized!`);
  };

  const handleDeleteMember = (id: string) => {
    const name = staff.find(s => s.id === id)?.name;
    setStaff(prev => prev.filter(s => s.id !== id));
    setDeleteConfirm(null);
    showToast(`Entity "${name}" de-integrated.`);
  };

  const cycleStatus = (id: string) => {
    const order: Staff["status"][] = ["Online", "On Break", "Offline"];
    setStaff(prev => prev.map(s => {
      if (s.id !== id) return s;
      const idx = order.indexOf(s.status);
      return { ...s, status: order[(idx + 1) % order.length] };
    }));
    setActiveMenu(null);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Online': return 'bg-accent shadow-[0_0_15px_rgba(252,163,17,0.6)]';
      case 'On Break': return 'bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]';
      case 'Offline': return 'bg-black/40 border border-white/10';
      default: return 'bg-white/20';
    }
  };

  const avgScore = staff.length > 0 ? (staff.reduce((a, s) => a + s.aiScore, 0) / staff.length).toFixed(1) : "0";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-8 z-50 bg-surface border border-accent/20 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl animate-in slide-in-from-right-8 flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
          {toast}
          <button onClick={() => setToast(null)} className="text-muted/30 hover:text-white transition-colors"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            Team <span className="text-accent">Orchestration</span>
          </h1>
          <p className="text-muted/60 text-sm">Strategic entity management and operational capacity tracking.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-accent text-black font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-xl shadow-accent/10 transition-all"
        >
          <UserPlus size={18} /> Integrate Entity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Entities", count: staff.length, icon: <Users size={22} />, color: "accent" },
          { label: "Live Deployment", count: staff.filter(s => s.status === 'Online').length, icon: <CheckCircle2 size={22} />, color: "white" },
          { label: "Tasks Finalized", count: staff.reduce((acc, curr) => acc + curr.tasksCompleted, 0), icon: <Clock size={22} />, color: "accent/10" },
          { label: "Avg Yield Index", count: avgScore, icon: <TrendingUp size={22} />, color: "white" },
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-white/5 p-8 rounded-[32px] flex items-center gap-6 relative overflow-hidden group transition-all hover:border-accent/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-[40px] pointer-events-none group-hover:bg-accent/10 transition-all" />
            <div className={`p-4 rounded-2xl flex items-center justify-center ${stat.color === 'accent' ? 'bg-accent/10 text-accent' : 'bg-black/40 text-muted/30'}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-white">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-10 mb-4 px-2">
        <h2 className="text-xl font-black text-white uppercase tracking-widest">Active Registry</h2>
        <div className="text-[10px] font-black text-muted/20 uppercase tracking-[0.4em]">Integrated Workforce Directory</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {staff.map(employee => (
          <div key={employee.id} className="bg-surface border border-white/5 rounded-[32px] p-8 hover:border-accent/30 transition-all duration-500 hover:-translate-y-2 relative group overflow-hidden shadow-xl hover:shadow-accent/5">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-accent/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-[22px] bg-black/40 border border-white/10 flex items-center justify-center text-2xl font-black text-white shadow-xl group-hover:border-accent/40 transition-all">
                    {employee.avatar}
                  </div>
                  <div className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-4 border-surface ${getStatusColor(employee.status)} transition-all duration-500`} />
                </div>
                <div>
                  <h3 className="font-black text-xl text-white group-hover:text-accent transition-colors leading-tight">{employee.name}</h3>
                  <p className="text-[10px] text-muted/40 font-black uppercase tracking-widest mt-1.5">{employee.id}</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === employee.id ? null : employee.id)}
                  className="p-3 rounded-2xl hover:bg-white/5 text-muted/30 hover:text-white transition-all border border-transparent hover:border-white/5"
                >
                  <MoreVertical size={20} />
                </button>
                {activeMenu === employee.id && (
                  <div className="absolute right-0 top-16 w-52 bg-surface border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 p-1.5">
                    <button onClick={() => { setEditingMember(employee); setActiveMenu(null); }} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-white/80 hover:bg-white/5 rounded-xl flex items-center gap-3 transition-all">
                      <Edit3 size={14} /> Profile Sync
                    </button>
                    <button onClick={() => cycleStatus(employee.id)} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-accent hover:bg-accent/10 rounded-xl flex items-center gap-3 transition-all">
                      <Clock size={14} /> Status Cycle
                    </button>
                    <button onClick={() => { setDeleteConfirm(employee.id); setActiveMenu(null); }} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-rose-500 hover:bg-rose-500/10 rounded-xl flex items-center gap-3 transition-all">
                      <Trash2 size={14} /> De-Integrate
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-10 relative z-10">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 group-hover:border-white/10 transition-all">
                <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest flex items-center gap-3"><Shield size={14} className="text-accent/40" /> Class</span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${employee.role === 'Admin' ? 'bg-accent/10 text-accent border border-accent/20 shadow-lg shadow-accent/5' : 'bg-white/5 text-white/60 border border-white/10'}`}>{employee.role}</span>
              </div>
              <div className="flex items-center justify-between p-3 px-4">
                <span className="text-[10px] font-black text-muted/20 uppercase tracking-widest flex items-center gap-3"><Clock size={14}/> Window</span>
                <span className="text-[11px] font-black text-white/80 uppercase tracking-widest">{employee.shift}</span>
              </div>
              <div className="flex items-center justify-between p-3 px-4">
                <span className="text-[10px] font-black text-muted/20 uppercase tracking-widest flex items-center gap-3"><CheckCircle2 size={14}/> Output</span>
                <span className="text-[11px] font-black text-accent uppercase tracking-widest">{employee.tasksCompleted} UNITS</span>
              </div>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 relative z-10 group-hover:border-accent/20 transition-all">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" /> YIELD INDEX
                </span>
                <span className="text-xs font-black text-accent tabular-nums">{employee.aiScore} / 100</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(252,163,17,0.35)] ${employee.aiScore > 90 ? 'bg-accent' : employee.aiScore > 80 ? 'bg-accent/60' : 'bg-accent/20'}`} style={{ width: `${employee.aiScore}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      <FloatingModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Integration Protocol">
        <div className="space-y-5 p-2">
          <div>
            <label className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-2 block">Entity Identifier</label>
            <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="ENTER FULL NAME..." className="w-full bg-black/40 border border-white/8 rounded-2xl py-3.5 px-5 text-xs font-bold text-white focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all uppercase tracking-widest" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-2 block">Class Role</label>
              <select value={formRole} onChange={e => setFormRole(e.target.value)} className="w-full bg-black/40 border border-white/8 rounded-2xl py-3.5 px-5 text-xs font-bold text-white focus:outline-none focus:border-accent/40 transition-all uppercase appearance-none cursor-pointer">
                <option value="Executive">EXECUTIVE</option>
                <option value="Manager">MANAGER</option>
                <option value="Admin">ADMINISTRATOR</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-2 block">Operational Window</label>
              <input value={formShift} onChange={e => setFormShift(e.target.value)} placeholder="E.G. 09:00 - 17:00" className="w-full bg-black/40 border border-white/8 rounded-2xl py-3.5 px-5 text-xs font-bold text-white focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all uppercase tracking-widest" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={handleAddMember} className="flex-1 bg-accent text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-xl shadow-accent/10 transition-all flex items-center justify-center gap-3"><Check size={18} /> INITIALIZE INTEGRATION</button>
            <button onClick={() => setShowAddModal(false)} className="px-6 py-4 rounded-2xl border border-white/10 text-muted/60 hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all">ABORT</button>
          </div>
        </div>
      </FloatingModal>

      {/* Edit Member Modal */}
      <FloatingModal isOpen={!!editingMember} onClose={() => setEditingMember(null)} title="Profile Synchronization">
        {editingMember && (
          <div className="space-y-5 p-2">
            <div>
              <label className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-2 block">Entity Identifier</label>
              <input value={editingMember.name} onChange={e => setEditingMember({ ...editingMember, name: e.target.value })} className="w-full bg-black/40 border border-white/8 rounded-2xl py-3.5 px-5 text-xs font-bold text-white focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all uppercase tracking-widest" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-2 block">Class Role</label>
                <select value={editingMember.role} onChange={e => setEditingMember({ ...editingMember, role: e.target.value })} className="w-full bg-black/40 border border-white/8 rounded-2xl py-3.5 px-5 text-xs font-bold text-white focus:outline-none focus:border-accent/40 transition-all uppercase appearance-none cursor-pointer">
                  <option value="Executive">EXECUTIVE</option>
                  <option value="Manager">MANAGER</option>
                  <option value="Admin">ADMINISTRATOR</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-2 block">Operational Window</label>
                <input value={editingMember.shift} onChange={e => setEditingMember({ ...editingMember, shift: e.target.value })} className="w-full bg-black/40 border border-white/8 rounded-2xl py-3.5 px-5 text-xs font-bold text-white focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all uppercase tracking-widest" />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={handleEditMember} className="flex-1 bg-accent text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-xl shadow-accent/10 transition-all flex items-center justify-center gap-3"><Check size={18} /> COMMIT CHANGES</button>
              <button onClick={() => setEditingMember(null)} className="px-6 py-4 rounded-2xl border border-white/10 text-muted/60 hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all">ABORT</button>
            </div>
          </div>
        )}
      </FloatingModal>

      {/* Delete Confirmation */}
      <FloatingModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Termination Protocol">
        <div className="text-center space-y-8 p-4">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto shadow-2xl shadow-rose-500/5">
            <EyeOff size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-2 uppercase tracking-widest">Awaiting De-integration</p>
            <p className="text-xs text-muted/60 leading-relaxed">Remove entity <strong className="text-white">{staff.find(s => s.id === deleteConfirm)?.name}</strong> from the operational registry?</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => deleteConfirm && handleDeleteMember(deleteConfirm)} className="px-10 py-3.5 bg-rose-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/10">TERMINATE</button>
            <button onClick={() => setDeleteConfirm(null)} className="px-10 py-3.5 rounded-2xl border border-white/10 text-muted/60 hover:text-white hover:bg-white/5 text-[11px] font-black uppercase tracking-widest transition-all">CANCEL</button>
          </div>
        </div>
      </FloatingModal>
    </div>
  );
};

export default TeamManagement;
