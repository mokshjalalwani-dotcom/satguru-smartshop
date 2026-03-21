import React, { useState } from "react";
import { Users as UsersIcon, UserPlus, Shield, MoreVertical, Search, Edit3, Trash2, ToggleLeft, ToggleRight, X, Check } from "lucide-react";
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
    showToast(`✅ "${newUser.name}" added!`);
  };

  const handleEditUser = () => {
    if (!editingUser) return;
    setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    showToast(`✅ User updated!`);
  };

  const handleDeleteUser = (id: string) => {
    const name = users.find(u => u.id === id)?.name;
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleteConfirm(null);
    showToast(`🗑️ "${name}" removed.`);
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
    { header: "Name", accessor: "name" as keyof User },
    { header: "Email", accessor: "email" as keyof User },
    {
      header: "Role",
      accessor: "role" as keyof User,
      render: (val: any) => (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${val === 'Admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
          {String(val)}
        </span>
      )
    },
    {
      header: "Status",
      accessor: "status" as keyof User,
      render: (val: any) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${val === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
          {String(val)}
        </span>
      )
    },
    { header: "Last Active", accessor: "lastActive" as keyof User },
    {
      header: "Actions",
      accessor: "id" as keyof User,
      render: (_val: any, row: any) => (
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === row.id ? null : row.id); }}
            className="p-1 hover:bg-white/5 rounded-md transition-colors"
          >
            <MoreVertical size={16} className="text-xtext-secondary" />
          </button>
          {activeMenu === row.id && (
            <div className="absolute right-0 top-8 w-40 bg-xcard border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] z-50 overflow-hidden animate-in fade-in zoom-in-95">
              <button
                onClick={() => { setEditingUser(row); setActiveMenu(null); }}
                className="w-full text-left px-3 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Edit3 size={13} /> Edit User
              </button>
              <button
                onClick={() => { toggleStatus(row.id); }}
                className="w-full text-left px-3 py-2.5 text-xs font-medium text-amber-400 hover:bg-amber-500/5 flex items-center gap-2 transition-colors"
              >
                {row.status === "Active" ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                {row.status === "Active" ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => { setDeleteConfirm(row.id); setActiveMenu(null); }}
                className="w-full text-left px-3 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/5 flex items-center gap-2 transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-xcard border border-white/10 rounded-2xl px-5 py-3 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] animate-in slide-in-from-right-5 flex items-center gap-3">
          {toast}
          <button onClick={() => setToast(null)} className="text-white/40 hover:text-white"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">User Management</h1>
          <p className="text-xtext-secondary text-[14px]">Manage team members and their access levels.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-xbrand text-black px-4 py-2 rounded-xl font-semibold text-[14px] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
        >
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-xcard border border-white/5 rounded-2xl p-4 flex items-center gap-4 glass-morphism">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400"><Shield size={20} /></div>
          <div><p className="text-xtext-secondary text-xs uppercase tracking-wider font-semibold">Admins</p><p className="text-xl font-bold">{users.filter(u => u.role === "Admin").length}</p></div>
        </div>
        <div className="bg-xcard border border-white/5 rounded-2xl p-4 flex items-center gap-4 glass-morphism">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400"><UsersIcon size={20} /></div>
          <div><p className="text-xtext-secondary text-xs uppercase tracking-wider font-semibold">Total Staff</p><p className="text-xl font-bold">{users.length}</p></div>
        </div>
      </div>

      <div className="bg-xcard border border-white/5 rounded-2xl overflow-hidden glass-morphism">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[14px] focus:outline-none focus:border-xbrand/30 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 text-xtext-secondary text-[13px]">
            <UsersIcon size={14} /> <span>{filteredUsers.length} Users found</span>
          </div>
        </div>
        <DataTable columns={columns as any} rows={filteredUsers} />
      </div>

      {/* Add User Modal */}
      <FloatingModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Full Name</label>
            <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all" />
          </div>
          <div>
            <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Email</label>
            <input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="e.g. john@smartshop.ai" className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all" />
          </div>
          <div>
            <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Role</label>
            <select value={formRole} onChange={e => setFormRole(e.target.value as User["role"])} className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all">
              <option value="Executive">Executive</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleAddUser} className="flex-1 bg-xbrand text-black py-2.5 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all flex items-center justify-center gap-2"><Check size={16} /> Add User</button>
            <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Cancel</button>
          </div>
        </div>
      </FloatingModal>

      {/* Edit User Modal */}
      <FloatingModal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User">
        {editingUser && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Full Name</label>
              <input value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all" />
            </div>
            <div>
              <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Email</label>
              <input value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all" />
            </div>
            <div>
              <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Role</label>
              <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value as User["role"] })} className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all">
                <option value="Executive">Executive</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleEditUser} className="flex-1 bg-xbrand text-black py-2.5 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all flex items-center justify-center gap-2"><Check size={16} /> Save Changes</button>
              <button onClick={() => setEditingUser(null)} className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Cancel</button>
            </div>
          </div>
        )}
      </FloatingModal>

      {/* Delete Confirmation Modal */}
      <FloatingModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Deletion">
        <div className="text-center space-y-4">
          <p className="text-sm text-white/70">Are you sure you want to delete <strong>{users.find(u => u.id === deleteConfirm)?.name}</strong>?</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => deleteConfirm && handleDeleteUser(deleteConfirm)} className="px-6 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-all">Delete</button>
            <button onClick={() => setDeleteConfirm(null)} className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Cancel</button>
          </div>
        </div>
      </FloatingModal>
    </div>
  );
};

export default Users;
