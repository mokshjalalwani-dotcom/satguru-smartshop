import React, { useState } from "react";
import { Plus, CheckSquare, Clock, AlertTriangle, Calendar as CalendarIcon, Filter, MoreVertical } from "lucide-react";

interface GlobalTask {
  id: string;
  title: string;
  assignee: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  deadline: string;
}

const initialTasks: GlobalTask[] = [
  { id: "T-01", title: "Restock Smart TVs", assignee: "John Doe", priority: "High", status: "Pending", deadline: "Today, 2:00 PM" },
  { id: "T-02", title: "Audit Laptop Inventory", assignee: "Sarah Smith", priority: "Medium", status: "In Progress", deadline: "Today, 5:00 PM" },
  { id: "T-03", title: "Setup Promo Display", assignee: "Alex Johnson", priority: "Low", status: "Completed", deadline: "Today, 10:00 AM" },
  { id: "T-04", title: "Process Supplier Invoice", assignee: "John Doe", priority: "High", status: "Overdue", deadline: "Yesterday" },
];

const TaskScheduler: React.FC = () => {
  const [tasks] = useState<GlobalTask[]>(initialTasks);
  const [filter, setFilter] = useState("All");

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">Task Scheduler</h1>
          <p className="text-xtext-secondary text-sm">Assign, track, and manage all staff operational tasks.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
          <Plus size={18} />
          Create Task
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
          <div><p className="text-sm text-xtext-secondary mb-1">Due Today</p><p className="text-3xl font-bold">{tasks.filter(t => t.deadline.includes('Today')).length}</p></div>
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
          <button className="flex items-center gap-2 text-sm text-xtext-secondary hover:text-white transition-colors">
            <Filter size={16} /> Filter
          </button>
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
                    <div className="font-bold text-white mb-0.5">{task.title}</div>
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
                  <td className="p-4 pr-6 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-white/10 text-xtext-secondary hover:text-white transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskScheduler;
