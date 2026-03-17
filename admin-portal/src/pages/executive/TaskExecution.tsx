import React, { useState } from "react";
import { CheckCircle2, Clock, UploadCloud } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed";
  deadline: string;
}

const initialTasks: Task[] = [
  { id: "T-01", title: "Restock Smart TVs", description: "Move 5 units of OLED 55\\\" from warehouse to main display.", priority: "High", status: "Pending", deadline: "Today, 2:00 PM" },
  { id: "T-02", title: "Audit Laptop Inventory", description: "Physically count Dell and HP stock to match system.", priority: "Medium", status: "In Progress", deadline: "Today, 5:00 PM" },
  { id: "T-03", title: "Setup Promo Display", description: "Assemble the new Diwali tech promo booth near entrance.", priority: "Low", status: "Pending", deadline: "Tomorrow, 10:00 AM" },
];

const TaskExecution: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === "Completed" ? "Pending" : "Completed" };
      }
      return t;
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-white/70 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">Task Execution</h1>
          <p className="text-xtext-secondary text-sm">Manage your daily operational tasks and upload proof of completion.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-xl bg-xcard border border-white/5 flex items-center gap-2">
            <span className="text-sm text-xtext-secondary">Pending:</span>
            <span className="font-bold text-white">{tasks.filter(t => t.status !== 'Completed').length}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={18} />
            <span className="font-bold">{tasks.filter(t => t.status === 'Completed').length} completed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks.map(task => {
          const isCompleted = task.status === "Completed";
          return (
            <div 
              key={task.id} 
              className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                isCompleted 
                ? 'bg-[#1a232c]/50 border-emerald-500/20 opacity-70' 
                : 'bg-xcard border-white/5 hover:border-emerald-500/40 hover:shadow-[0_10px_30px_rgba(16,185,129,0.1)] hover:-translate-y-1'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                  {task.priority} Priority
                </span>
                <span className="text-xs font-medium text-xtext-secondary flex items-center gap-1">
                  <Clock size={12} /> {task.deadline}
                </span>
              </div>
              
              <h3 className={`text-lg font-bold mb-2 ${isCompleted ? 'text-white/50 line-through' : 'text-white'}`}>
                {task.title}
              </h3>
              <p className={`text-sm mb-6 line-clamp-2 ${isCompleted ? 'text-white/40' : 'text-xtext-secondary'}`}>
                {task.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <button 
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    isCompleted 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-white/5 hover:bg-white/10 text-white border border-transparent'
                  }`}
                >
                  <CheckCircle2 size={16} className={isCompleted ? '' : 'text-white/40 group-hover:text-emerald-400 transition-colors'} />
                  {isCompleted ? 'Completed' : 'Mark Done'}
                </button>
                
                <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-xtext-secondary hover:text-cyan-400 transition-colors rounded-lg hover:bg-cyan-400/10">
                  <UploadCloud size={16} />
                  Proof
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskExecution;