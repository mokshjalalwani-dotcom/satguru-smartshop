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
    showToast(`Task "${task.title}" created!`);
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
    showToast(`"${name}" deleted.`);
  };

  const getPriorityStyle = (priority: string) => {
    switch(priority) {
      case 'High': return 'text-accent border-accent/20 bg-accent/5';
      case 'Medium': return 'text-white/80 border-white/10 bg-white/5';
      case 'Low': return 'text-muted/40 border-white/5 bg-transparent';
      default: return 'text-white/70 bg-white/5 border-white/10';
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Completed': return 'text-muted/20 border-white/5 line-through';
      case 'In Progress': return 'text-accent border-accent/30 bg-accent/5';
      case 'Pending': return 'text-white/80 border-white/10';
      case 'Overdue': return 'text-rose-500 border-rose-500/20 bg-rose-500/5';
      default: return '';
    }
  };

  const filteredTasks = filter === "All" ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-8 z-50 bg-surface border border-accent/20 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-2xl animate-in slide-in-from-right-8 flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          {toast}
          <button onClick={() => setToast(null)} className="text-muted/30 hover:text-white transition-colors"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            Task <span className="text-accent">Scheduler</span>
          </h1>
          <p className="text-muted/60 text-sm">Strategic operational flow and team task orchestration.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-accent text-black font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-xl shadow-accent/10 transition-all"
        >
          <Plus size={18} /> Create Mission
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Nodes", count: tasks.length, icon: <CheckSquare size={20} />, color: "accent" },
          { label: "In Flight", count: tasks.filter(t => t.status === 'In Progress').length, icon: <Clock size={20} />, color: "white" },
          { label: "Delayed", count: tasks.filter(t => t.status === 'Overdue').length, icon: <AlertTriangle size={20} />, color: "rose-500" },
          { label: "Finalized", count: tasks.filter(t => t.status === 'Completed').length, icon: <CalendarIcon size={20} />, color: "muted" },
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-white/5 p-6 rounded-[28px] flex items-center justify-between group overflow-hidden relative transition-all hover:border-accent/20">
            <div className="absolute right-0 top-0 w-24 h-24 bg-accent/5 rounded-bl-[40px] pointer-events-none group-hover:bg-accent/10 transition-all" />
            <div>
              <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-white tabular-nums">{stat.count}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color === 'accent' ? 'accent/10' : 'black/40'} border border-white/5 flex items-center justify-center ${stat.color === 'accent' ? 'text-accent' : stat.color === 'rose-500' ? 'text-rose-500' : 'text-muted/40'}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-white/5 rounded-[32px] overflow-hidden mt-6 shadow-2xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex gap-1.5">
            {['All', 'Pending', 'In Progress', 'Completed', 'Overdue'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-accent text-black shadow-lg shadow-accent/10' : 'text-muted/40 hover:text-white hover:bg-white/5'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-black/40 border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-muted/40">
              <tr>
                <th className="p-6 pl-8 font-black">Mission Objective</th>
                <th className="p-6 font-black">Assignee</th>
                <th className="p-6 font-black text-center">Priority</th>
                <th className="p-6 font-black text-center">Status</th>
                <th className="p-6 font-black text-center">Deadline</th>
                <th className="p-6 pr-8 text-right font-black">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-white/3 transition-colors group">
                  <td className="p-6 pl-8">
                    <div className={`font-black text-sm tracking-wide transition-all ${task.status === 'Completed' ? 'text-muted/20 line-through' : 'text-white'}`}>{task.title}</div>
                    <div className="text-[10px] text-muted/30 font-bold uppercase mt-1">{task.id}</div>
                  </td>
                  <td className="p-6 text-xs font-bold text-white/80 uppercase tracking-widest">{task.assignee}</td>
                  <td className="p-6 text-center">
                    <span className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-t-0 border-r-0 border-l-0 border-b-2 bg-black/40 transition-all ${getStatusStyle(task.status)}`}>
                      {task.status === 'Completed' && <CheckSquare size={13} />}
                      {task.status === 'Overdue' && <AlertTriangle size={13} />}
                      {task.status}
                    </span>
                  </td>
                  <td className="p-6 text-[10px] font-bold text-muted/40 uppercase tracking-widest text-center">{task.deadline}</td>
                  <td className="p-6 pr-8 text-right relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === task.id ? null : task.id)}
                      className="p-3 rounded-2xl hover:bg-white/5 text-muted/30 hover:text-white transition-all border border-transparent hover:border-white/5"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeMenu === task.id && (
                      <div className="absolute right-8 top-16 w-52 bg-surface border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 p-1.5">
                        <button onClick={() => cycleStatus(task.id)} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-accent hover:bg-accent/10 rounded-xl flex items-center gap-3 transition-all">
                          <ArrowRight size={14} /> Update Flow
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-rose-500 hover:bg-rose-500/10 rounded-xl flex items-center gap-3 transition-all">
                          <Trash2 size={14} /> Terminate
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr><td colSpan={6} className="text-center py-20 text-muted/20 uppercase text-[10px] font-black tracking-[0.3em] italic">No missions detected.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FloatingModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Mission Deployment">
        <div className="space-y-5 p-2">
          <div>
            <label className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-2 block">Objective Title</label>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="ENTER OBJECTIVE..." className="w-full bg-black/40 border border-white/8 rounded-2xl py-3.5 px-5 text-xs font-bold text-white focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all uppercase tracking-widest" />
          </div>
          <div>
            <label className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-2 block">Assignee Entity</label>
            <input value={newAssignee} onChange={e => setNewAssignee(e.target.value)} placeholder="ENTER ENTITY NAME..." className="w-full bg-black/40 border border-white/8 rounded-2xl py-3.5 px-5 text-xs font-bold text-white focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all uppercase tracking-widest" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-2 block">Priority Rank</label>
              <div className="relative">
                <select value={newPriority} onChange={e => setNewPriority(e.target.value as GlobalTask["priority"])} className="w-full bg-black/40 border border-white/8 rounded-2xl py-3.5 px-5 text-xs font-bold text-white focus:outline-none focus:border-accent/40 transition-all uppercase appearance-none cursor-pointer">
                  <option value="High">HIGH CLASSIFIED</option>
                  <option value="Medium">MEDIUM STANDARD</option>
                  <option value="Low">LOW MINIMAL</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-2 block">Deadline Window</label>
              <input value={newDeadline} onChange={e => setNewDeadline(e.target.value)} placeholder="ENTER TIMEFRAME..." className="w-full bg-black/40 border border-white/8 rounded-2xl py-3.5 px-5 text-xs font-bold text-white focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all uppercase tracking-widest" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={handleCreateTask} className="flex-1 bg-accent text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-xl shadow-accent/10 transition-all flex items-center justify-center gap-3"><Check size={18} /> DEPLOY MISSION</button>
            <button onClick={() => setShowCreateModal(false)} className="px-6 py-4 rounded-2xl border border-white/10 text-muted/60 hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all">ABORT</button>
          </div>
        </div>
      </FloatingModal>
    </div>
  );
};

export default TaskScheduler;
