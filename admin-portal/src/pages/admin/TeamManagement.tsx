import React, { useState } from "react";
import { Users, UserPlus, Clock, CheckCircle2, TrendingUp, MoreVertical, Shield, Edit3, Trash2, X, Check } from "lucide-react";
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

  // Add form
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
    showToast(`✅ "${member.name}" added to team!`);
  };

  const handleEditMember = () => {
    if (!editingMember) return;
    setStaff(prev => prev.map(s => s.id === editingMember.id ? editingMember : s));
    setEditingMember(null);
    showToast(`✅ Member updated!`);
  };

  const handleDeleteMember = (id: string) => {
    const name = staff.find(s => s.id === id)?.name;
    setStaff(prev => prev.filter(s => s.id !== id));
    setDeleteConfirm(null);
    showToast(`🗑️ "${name}" removed from team.`);
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
      case 'Online': return 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]';
      case 'On Break': return 'bg-amber-400';
      case 'Offline': return 'bg-white/20';
      default: return 'bg-white/20';
    }
  };

  const avgScore = staff.length > 0 ? (staff.reduce((a, s) => a + s.aiScore, 0) / staff.length).toFixed(1) : "0";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-xcard border border-white/10 rounded-2xl px-5 py-3 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] animate-in slide-in-from-right-5 flex items-center gap-3">
          {toast}
          <button onClick={() => setToast(null)} className="text-white/40 hover:text-white"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">Team Management</h1>
          <p className="text-xtext-secondary text-sm">Monitor staff activity, track performance, and manage access roles.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
        >
          <UserPlus size={18} /> Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-xcard border border-white/5 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/20 transition-colors" />
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20"><Users size={24} /></div>
          <div><p className="text-sm text-xtext-secondary">Total Staff</p><p className="text-2xl font-bold">{staff.length}</p></div>
        </div>
        <div className="bg-xcard border border-white/5 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20"><CheckCircle2 size={24} /></div>
          <div><p className="text-sm text-xtext-secondary">Active Now</p><p className="text-2xl font-bold">{staff.filter(s => s.status === 'Online').length}</p></div>
        </div>
        <div className="bg-xcard border border-white/5 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/20 transition-colors" />
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20"><Clock size={24} /></div>
          <div><p className="text-sm text-xtext-secondary">Tasks Completed</p><p className="text-2xl font-bold">{staff.reduce((acc, curr) => acc + curr.tasksCompleted, 0)}</p></div>
        </div>
        <div className="bg-xcard border border-white/5 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none group-hover:bg-amber-500/20 transition-colors" />
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20"><TrendingUp size={24} /></div>
          <div><p className="text-sm text-xtext-secondary">Avg AI Score</p><p className="text-2xl font-bold">{avgScore}</p></div>
        </div>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4 border-b border-white/10 pb-2">Active Directory</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {staff.map(employee => (
          <div key={employee.id} className="bg-xcard border border-white/5 rounded-3xl p-6 hover:border-indigo-500/30 transition-all hover:-translate-y-1 relative group overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                    {employee.avatar}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(employee.status)}`} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{employee.name}</h3>
                  <p className="text-xs text-xtext-secondary font-medium">{employee.id}</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === employee.id ? null : employee.id)}
                  className="text-xtext-secondary hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <MoreVertical size={18} />
                </button>
                {activeMenu === employee.id && (
                  <div className="absolute right-0 top-8 w-44 bg-xcard border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] z-50 overflow-hidden animate-in fade-in zoom-in-95">
                    <button onClick={() => { setEditingMember(employee); setActiveMenu(null); }} className="w-full text-left px-3 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/5 flex items-center gap-2 transition-colors">
                      <Edit3 size={13} /> Edit
                    </button>
                    <button onClick={() => cycleStatus(employee.id)} className="w-full text-left px-3 py-2.5 text-xs font-medium text-amber-400 hover:bg-amber-500/5 flex items-center gap-2 transition-colors">
                      <Clock size={13} /> Change Status
                    </button>
                    <button onClick={() => { setDeleteConfirm(employee.id); setActiveMenu(null); }} className="w-full text-left px-3 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/5 flex items-center gap-2 transition-colors">
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3 mb-6 relative z-10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-xtext-secondary flex items-center gap-2"><Shield size={14}/> Role</span>
                <span className={`font-bold px-2 py-0.5 rounded-md ${employee.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-white/5 text-white/80 border border-white/10'}`}>{employee.role}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-xtext-secondary flex items-center gap-2"><Clock size={14}/> Shift</span>
                <span className="font-medium text-white/90">{employee.shift}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-xtext-secondary flex items-center gap-2"><CheckCircle2 size={14}/> Today's Tasks</span>
                <span className="font-medium text-white/90">{employee.tasksCompleted}</span>
              </div>
            </div>
            <div className="border-t border-white/5 pt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-xtext-secondary font-medium uppercase tracking-wider">AI Productivity Score</span>
                <span className="text-sm font-bold text-emerald-400">{employee.aiScore} / 100</span>
              </div>
              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${employee.aiScore > 90 ? 'bg-emerald-400' : employee.aiScore > 80 ? 'bg-cyan-400' : 'bg-amber-400'}`} style={{ width: `${employee.aiScore}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      <FloatingModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Team Member">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Full Name</label>
            <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Jane Doe" className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Role</label>
              <select value={formRole} onChange={e => setFormRole(e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all">
                <option value="Executive">Executive</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Shift</label>
              <input value={formShift} onChange={e => setFormShift(e.target.value)} placeholder="e.g. 09:00 - 17:00" className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleAddMember} className="flex-1 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-2"><Check size={16} /> Add Member</button>
            <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Cancel</button>
          </div>
        </div>
      </FloatingModal>

      {/* Edit Member Modal */}
      <FloatingModal isOpen={!!editingMember} onClose={() => setEditingMember(null)} title="Edit Team Member">
        {editingMember && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Full Name</label>
              <input value={editingMember.name} onChange={e => setEditingMember({ ...editingMember, name: e.target.value })} className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Role</label>
                <select value={editingMember.role} onChange={e => setEditingMember({ ...editingMember, role: e.target.value })} className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all">
                  <option value="Executive">Executive</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Shift</label>
                <input value={editingMember.shift} onChange={e => setEditingMember({ ...editingMember, shift: e.target.value })} className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleEditMember} className="flex-1 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-2"><Check size={16} /> Save Changes</button>
              <button onClick={() => setEditingMember(null)} className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Cancel</button>
            </div>
          </div>
        )}
      </FloatingModal>

      {/* Delete Confirmation */}
      <FloatingModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Remove Member">
        <div className="text-center space-y-4">
          <p className="text-sm text-white/70">Remove <strong>{staff.find(s => s.id === deleteConfirm)?.name}</strong> from the team?</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => deleteConfirm && handleDeleteMember(deleteConfirm)} className="px-6 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-all">Remove</button>
            <button onClick={() => setDeleteConfirm(null)} className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Cancel</button>
          </div>
        </div>
      </FloatingModal>
    </div>
  );
};

export default TeamManagement;
