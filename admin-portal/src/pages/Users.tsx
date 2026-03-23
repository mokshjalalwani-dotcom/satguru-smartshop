import React, { useState } from "react";
import { Users as UsersIcon, UserPlus, Shield, MoreVertical, Search, Edit3, Trash2, ToggleLeft, ToggleRight, X, Check, ShieldCheck } from "lucide-react";
import DataTable from "../ui/DataTable";
import FloatingModal from "../ui/FloatingModal";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Staff" | "Executive";
  status: "Active" | "Inactive";
  lastActive: string;
}

const defaultUsers: User[] = [
  { id: "1", name: "Moksh", email: "moksh@smartshop.ai", role: "Admin", status: "Active", lastActive: "Just now" },
  { id: "2", name: "John Doe", email: "john@smartshop.ai", role: "Executive", status: "Active", lastActive: "2 hours ago" },
  { id: "3", name: "Jane Smith", email: "jane@smartshop.ai", role: "Executive", status: "Inactive", lastActive: "5 days ago" },
  { id: "4", name: "Alice Brown", email: "alice@smartshop.ai", role: "Executive", status: "Active", lastActive: "1 day ago" },
];

const Users: React.FC = () => {
  const [users, setUsers] = useLocalStorage<User[]>("ss_users", defaultUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Add user form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<User["role"]>("Executive");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleAddUser = () => {
    if (!formName.trim() || !formEmail.trim()) return;
    const newUser: User = {
      id: String(Date.now()),
      name: formName.trim(),
      email: formEmail.trim(),
      role: formRole,
      status: "Active",
      lastActive: "Just now",
    };
    setUsers(prev => [...prev, newUser]);
    setShowAddModal(false);
    setFormName(""); setFormEmail(""); setFormRole("Executive");
    showToast(`Entity "${newUser.name}" registered.`);
  };

  const handleEditUser = () => {
    if (!editingUser) return;
    setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    showToast(`Registry updated.`);
  };

  const handleDeleteUser = (id: string) => {
    const name = users.find(u => u.id === id)?.name;
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleteConfirm(null);
    showToast(`Entity "${name}" purged.`);
  };

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u));
    setActiveMenu(null);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: "Identified Entity", 
      accessor: "name" as keyof User,
      render: (val: any, row: any) => (
        <div className="flex flex-col">
          <span className="font-black text-white uppercase tracking-wide">{String(val)}</span>
          <span className="text-[10px] text-muted/40 font-black uppercase tracking-widest">{row.email}</span>
        </div>
      )
    },
    {
      header: "Access Protocol",
      accessor: "role" as keyof User,
      render: (val: any) => (
        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${val === 'Admin' ? 'bg-accent text-black border-accent' : 'bg-black/40 text-muted/40 border-white/5'}`}>
          {String(val)}
        </span>
      )
    },
    {
      header: "Operational Status",
      accessor: "status" as keyof User,
      render: (val: any) => (
        <div className="flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full ${val === 'Active' ? 'bg-accent animate-pulse shadow-[0_0_10px_rgba(252,163,17,0.5)]' : 'bg-muted/20'}`} />
           <span className={`text-[10px] font-black uppercase tracking-widest ${val === 'Active' ? 'text-white' : 'text-muted/20'}`}>
            {String(val)}
          </span>
        </div>
      )
    },
    { 
      header: "Last Synchronized", 
      accessor: "lastActive" as keyof User,
      render: (val: any) => <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest">{String(val)}</span>
    },
    {
      header: "Registry Control",
      accessor: "id" as keyof User,
      render: (_val: any, row: any) => (
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === row.id ? null : row.id); }}
            className="p-2 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all text-muted/40 hover:text-white"
          >
            <MoreVertical size={16} />
          </button>
          {activeMenu === row.id && (
            <div className="absolute right-0 top-10 w-48 bg-surface border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 backdrop-blur-xl">
              <button
                onClick={() => { setEditingUser(row); setActiveMenu(null); }}
                className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-all"
              >
                <Edit3 size={14} className="text-accent" /> Edit Entity
              </button>
              <button
                onClick={() => { toggleStatus(row.id); }}
                className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-all border-y border-white/5"
              >
                {row.status === "Active" ? <ToggleLeft size={14} className="text-muted/40" /> : <ToggleRight size={14} className="text-accent" />}
                {row.status === "Active" ? "Suspend Flow" : "Restore Flow"}
              </button>
              <button
                onClick={() => { setDeleteConfirm(row.id); setActiveMenu(null); }}
                className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 flex items-center gap-3 transition-all"
              >
                <Trash2 size={14} /> Purge Entry
              </button>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-8 z-[100] bg-surface border border-accent/20 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl animate-in slide-in-from-right-8 flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
          {toast}
          <button onClick={() => setToast(null)} className="text-muted/30 hover:text-white transition-colors"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">
            Personnel <span className="text-accent">Registry</span>
          </h1>
          <p className="text-muted/60 text-sm font-medium">Strategic authorization management and access protocol control.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-accent text-black font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-xl shadow-accent/10 transition-all"
        >
          <UserPlus size={18} /> Authorize Entity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-white/5 rounded-[32px] p-8 flex items-center justify-between shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[40px] pointer-events-none group-hover:bg-accent/10 transition-all" />
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-accent shadow-inner"><Shield size={24} /></div>
              <div>
                <p className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-1">Administrative Tier</p>
                <p className="text-3xl font-black text-white tabular-nums">{users.filter(u => u.role === "Admin").length}</p>
              </div>
           </div>
           <div className="text-[9px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">High Priority</div>
        </div>
        <div className="bg-surface border border-white/5 rounded-[32px] p-8 flex items-center justify-between shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[40px] pointer-events-none group-hover:bg-white/10 transition-all" />
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-white/40 shadow-inner"><UsersIcon size={24} /></div>
              <div>
                <p className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-1">Total Authorized Users</p>
                <p className="text-3xl font-black text-white tabular-nums">{users.length}</p>
              </div>
           </div>
           <div className="text-[9px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">System-wide</div>
        </div>
      </div>

      <div className="bg-surface border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/20" size={18} />
            <input
              type="text"
              placeholder="SEARCH ENTITY BY NAME/EMAIL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all"
            />
          </div>
          <div className="flex items-center gap-4 text-muted/40 text-[10px] font-black uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
            <span>{filteredUsers.length} ENTITIES DETECTED</span>
          </div>
        </div>
        <DataTable columns={columns as any} rows={filteredUsers} />
      </div>

      <div className="bg-black/40 border border-white/5 rounded-[32px] p-8 flex items-center justify-between shadow-inner">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-center text-accent"><ShieldCheck size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Security Protocol Status: <span className="text-accent active">VALIDATED</span></p>
              <p className="text-[9px] font-black text-muted/20 uppercase tracking-[0.2em] mt-1">Cross-reference with master ledger complete</p>
            </div>
         </div>
         <div className="text-[9px] font-black text-muted/10 uppercase tracking-[0.5em]">Satguru Access Console</div>
      </div>

      {/* Add User Modal */}
      <FloatingModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Authorization Protocol">
        <div className="space-y-6">
          <div>
            <label className="text-[10px] text-muted/40 uppercase tracking-widest font-black mb-2 block">Full Name</label>
            <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="ENTER LEGAL NAME..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-6 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-accent/40 transition-all" />
          </div>
          <div>
            <label className="text-[10px] text-muted/40 uppercase tracking-widest font-black mb-2 block">Enterprise Email</label>
            <input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="ENTER SYSTEM EMAIL..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-6 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-accent/40 transition-all" />
          </div>
          <div>
            <label className="text-[10px] text-muted/40 uppercase tracking-widest font-black mb-2 block">Tier Access</label>
            <select value={formRole} onChange={e => setFormRole(e.target.value as User["role"])} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-6 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-accent/40 transition-all appearance-none cursor-pointer">
              <option value="Executive">Executive</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={handleAddUser} className="flex-1 bg-accent text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent/10"><Check size={16} /> Authorize Flow</button>
            <button onClick={() => setShowAddModal(false)} className="px-8 py-4 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all">Abort</button>
          </div>
        </div>
      </FloatingModal>

      {/* Edit User Modal */}
      <FloatingModal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Registry Modification">
        {editingUser && (
          <div className="space-y-6">
            <div>
              <label className="text-[10px] text-muted/40 uppercase tracking-widest font-black mb-2 block">Entity Name</label>
              <input value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-6 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-accent/40 transition-all" />
            </div>
            <div>
              <label className="text-[10px] text-muted/40 uppercase tracking-widest font-black mb-2 block">System Endpoint</label>
              <input value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-6 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-accent/40 transition-all" />
            </div>
            <div>
              <label className="text-[10px] text-muted/40 uppercase tracking-widest font-black mb-2 block">Access Tier</label>
              <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value as User["role"] })} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-6 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-accent/40 transition-all appearance-none cursor-pointer">
                <option value="Executive">Executive</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={handleEditUser} className="flex-1 bg-accent text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent/10"><Check size={16} /> Update Ledger</button>
              <button onClick={() => setEditingUser(null)} className="px-8 py-4 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all">Abort</button>
            </div>
          </div>
        )}
      </FloatingModal>

      {/* Delete Confirmation Modal */}
      <FloatingModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Registry Purge Confirmation">
        <div className="text-center space-y-6">
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl">
             <p className="text-xs text-white/80 font-medium">Warning: You are about to purge the identity <strong className="text-rose-500">{users.find(u => u.id === deleteConfirm)?.name}</strong> from the master registry.</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => deleteConfirm && handleDeleteUser(deleteConfirm)} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/10">Purge Entity</button>
            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
          </div>
        </div>
      </FloatingModal>
    </div>
  );
};

export default Users;
