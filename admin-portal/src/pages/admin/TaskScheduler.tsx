import React, { useState } from "react";
import { Plus, CheckSquare, Clock, AlertTriangle, Calendar as CalendarIcon, MoreVertical, X, Check, Trash2, ArrowRight } from "lucide-react";
import FloatingModal from "../../ui/FloatingModal";
import { useLocalStorage } from "../../hooks/useLocalStorage";

interface GlobalTask {
  id: string;
  title: string;
  assignee: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  deadline: string;
}

const defaultTasks: GlobalTask[] = [
  { id: "T-01", title: "Restock Smart TVs", assignee: "John Doe", priority: "High", status: "Pending", deadline: "Today, 2:00 PM" },
  { id: "T-02", title: "Audit Laptop Inventory", assignee: "Sarah Smith", priority: "Medium", status: "In Progress", deadline: "Today, 5:00 PM" },
  { id: "T-03", title: "Setup Promo Display", assignee: "Alex Johnson", priority: "Low", status: "Completed", deadline: "Today, 10:00 AM" },
  { id: "T-04", title: "Process Supplier Invoice", assignee: "John Doe", priority: "High", status: "Overdue", deadline: "Yesterday" },
];

const TaskScheduler: React.FC = () => {
  const [tasks, setTasks] = useLocalStorage<GlobalTask[]>("ss_tasks", defaultTasks);
  const [filter, setFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Create task form
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newPriority, setNewPriority] = useState<GlobalTask["priority"]>("Medium");
  const [newDeadline, setNewDeadline] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleCreateTask = () => {
    if (!newTitle.trim() || !newAssignee.trim()) return;
    const task: GlobalTask = {
      id: `T-${String(tasks.length + 1).padStart(2, "0")}`,
      title: newTitle.trim(),
      assignee: newAssignee.trim(),
      priority: newPriority,
      status: "Pending",
      deadline: newDeadline || "TBD",
    };
    setTasks(prev => [task, ...prev]);
    setShowCreateModal(false);
    setNewTitle(""); setNewAssignee(""); setNewPriority("Medium"); setNewDeadline("");
    showToast(`✅ Task "${task.title}" created!`);
  };

  const cycleStatus = (id: string) => {
    const order: GlobalTask["status"][] = ["Pending", "In Progress", "Completed"];
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const idx = order.indexOf(t.status);
      return { ...t, status: order[(idx + 1) % order.length] };
    }));
    setActiveMenu(null);
  };

  const deleteTask = (id: string) => {
    const name = tasks.find(t => t.id === id)?.title;
    setTasks(prev => prev.filter(t => t.id !== id));
    setActiveMenu(null);
    showToast(`🗑️ "${name}" deleted.`);
  };

  const getPriorityStyle = (priority: string) => {
    switch(priority) {
      case 'High': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-white/70 bg-white/5 border-white/10';
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Completed': return 'text-emerald-400 border-emerald-500/30';
      case 'In Progress': return 'text-cyan-400 border-cyan-500/30';
      case 'Pending': return 'text-white/80 border-white/10';
      case 'Overdue': return 'text-rose-400 border-rose-500/30';
      default: return '';
    }
  };

  const filteredTasks = filter === "All" ? tasks : tasks.filter(t => t.status === filter);

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
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">Task Scheduler</h1>
          <p className="text-xtext-secondary text-sm">Assign, track, and manage all staff operational tasks.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
        >
          <Plus size={18} /> Create Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-xcard border border-white/5 p-5 rounded-2xl flex items-center justify-between group overflow-hidden relative">
          <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div><p className="text-sm text-xtext-secondary mb-1">Total Tasks</p><p className="text-3xl font-bold">{tasks.length}</p></div>
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><CheckSquare size={20} /></div>
        </div>
        <div className="bg-xcard border border-white/5 p-5 rounded-2xl flex items-center justify-between group overflow-hidden relative">
          <div className="absolute right-0 top-0 w-20 h-20 bg-cyan-500/10 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
          <div><p className="text-sm text-xtext-secondary mb-1">In Progress</p><p className="text-3xl font-bold">{tasks.filter(t => t.status === 'In Progress').length}</p></div>
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400"><Clock size={20} /></div>
        </div>
        <div className="bg-xcard border border-white/5 p-5 rounded-2xl flex items-center justify-between group overflow-hidden relative">
          <div className="absolute right-0 top-0 w-20 h-20 bg-rose-500/10 rounded-bl-full pointer-events-none group-hover:bg-rose-500/20 transition-all" />
          <div><p className="text-sm text-xtext-secondary mb-1">Overdue</p><p className="text-3xl font-bold">{tasks.filter(t => t.status === 'Overdue').length}</p></div>
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400"><AlertTriangle size={20} /></div>
        </div>
        <div className="bg-xcard border border-white/5 p-5 rounded-2xl flex items-center justify-between group overflow-hidden relative">
          <div className="absolute right-0 top-0 w-20 h-20 bg-indigo-500/10 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
          <div><p className="text-sm text-xtext-secondary mb-1">Completed</p><p className="text-3xl font-bold">{tasks.filter(t => t.status === 'Completed').length}</p></div>
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400"><CalendarIcon size={20} /></div>
        </div>
      </div>

      <div className="bg-xcard border border-white/5 rounded-3xl overflow-hidden mt-6 shadow-xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex gap-2">
            {['All', 'Pending', 'In Progress', 'Completed', 'Overdue'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-emerald-500/20 text-emerald-400' : 'text-xtext-secondary hover:text-white hover:bg-white/10'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-background/50 border-b border-white/5 text-xs uppercase tracking-wider text-xtext-secondary">
              <tr>
                <th className="p-4 pl-6 font-medium">Task</th>
                <th className="p-4 font-medium">Assignee</th>
                <th className="p-4 font-medium">Priority</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Deadline</th>
                <th className="p-4 pr-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className={`font-bold text-white mb-0.5 ${task.status === 'Completed' ? 'line-through opacity-50' : ''}`}>{task.title}</div>
                    <div className="text-xs text-xtext-secondary">{task.id}</div>
                  </td>
                  <td className="p-4 text-sm font-medium text-white/90">{task.assignee}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-t-0 border-r-0 border-l-0 border-b-2 bg-white/5 ${getStatusStyle(task.status)}`}>
                      {task.status === 'Completed' && <CheckSquare size={12} />}
                      {task.status === 'Overdue' && <AlertTriangle size={12} />}
                      {task.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-xtext-secondary">{task.deadline}</td>
                  <td className="p-4 pr-6 text-right relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === task.id ? null : task.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-xtext-secondary hover:text-white transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeMenu === task.id && (
                      <div className="absolute right-6 top-12 w-44 bg-xcard border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] z-50 overflow-hidden animate-in fade-in zoom-in-95">
                        <button onClick={() => cycleStatus(task.id)} className="w-full text-left px-3 py-2.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/5 flex items-center gap-2 transition-colors">
                          <ArrowRight size={13} /> Advance Status
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="w-full text-left px-3 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/5 flex items-center gap-2 transition-colors">
                          <Trash2 size={13} /> Delete Task
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-xtext-secondary text-sm italic">No tasks found for this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      <FloatingModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Task">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Task Title</label>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Restock Refrigerators" className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all" />
          </div>
          <div>
            <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Assignee</label>
            <input value={newAssignee} onChange={e => setNewAssignee(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Priority</label>
              <select value={newPriority} onChange={e => setNewPriority(e.target.value as GlobalTask["priority"])} className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Deadline</label>
              <input value={newDeadline} onChange={e => setNewDeadline(e.target.value)} placeholder="e.g. Today, 5:00 PM" className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleCreateTask} className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black py-2.5 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"><Check size={16} /> Create Task</button>
            <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Cancel</button>
          </div>
        </div>
      </FloatingModal>
    </div>
  );
};

export default TaskScheduler;
