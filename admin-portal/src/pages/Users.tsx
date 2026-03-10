import React, { useState } from "react";
import { Users as UsersIcon, UserPlus, Shield, MoreVertical, Search } from "lucide-react";
import DataTable from "../ui/DataTable";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Staff";
  status: "Active" | "Inactive";
  lastActive: string;
}

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const mockUsers: User[] = [
    { id: "1", name: "Moksh", email: "moksh@smartshop.ai", role: "Admin", status: "Active", lastActive: "Just now" },
    { id: "2", name: "John Doe", email: "john@smartshop.ai", role: "Executive", status: "Active", lastActive: "2 hours ago" },
    { id: "3", name: "Jane Smith", email: "jane@smartshop.ai", role: "Executive", status: "Inactive", lastActive: "5 days ago" },
    { id: "4", name: "Alice Brown", email: "alice@smartshop.ai", role: "Executive", status: "Active", lastActive: "1 day ago" },
  ];

  const columns = [
    { header: "Name", accessor: "name" as keyof User },
    { header: "Email", accessor: "email" as keyof User },
    { 
        header: "Role", 
        accessor: "role" as keyof User,
        render: (val: any) => (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                val === 'Admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
                {String(val)}
            </span>
        )
    },
    { header: "Last Active", accessor: "lastActive" as keyof User },
    {
      header: "Actions",
      accessor: "id" as keyof User,
      render: () => <button className="p-1 hover:bg-white/5 rounded-md transition-colors"><MoreVertical size={16} className="text-xtext-secondary" /></button>
    }
  ];

  const filteredUsers = mockUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">User Management</h1>
          <p className="text-xtext-secondary text-[14px]">Manage team members and their access levels.</p>
        </div>
        <button className="flex items-center gap-2 bg-xbrand text-black px-4 py-2 rounded-xl font-semibold text-[14px] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all underline decoration-black/10 underline-offset-4">
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-xcard border border-white/5 rounded-2xl p-4 flex items-center gap-4 glass-morphism">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Shield size={20} />
            </div>
            <div>
                <p className="text-xtext-secondary text-xs uppercase tracking-wider font-semibold">Admins</p>
                <p className="text-xl font-bold">1</p>
            </div>
        </div>
        <div className="bg-xcard border border-white/5 rounded-2xl p-4 flex items-center gap-4 glass-morphism">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <UsersIcon size={20} />
            </div>
            <div>
                <p className="text-xtext-secondary text-xs uppercase tracking-wider font-semibold">Total Staff</p>
                <p className="text-xl font-bold">{mockUsers.length}</p>
            </div>
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
    </div>
  );
};

export default Users;
