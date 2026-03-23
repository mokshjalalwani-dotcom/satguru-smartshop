import React from "react";
import { CheckCircle2, Clock, UploadCloud, Play, ShieldCheck, Box } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed";
  deadline: string;
}

const initialTasks: Task[] = [
  { id: "T-01", title: "Restock Smart TVs", description: "Move 5 units of OLED 55\" from warehouse to main display.", priority: "High", status: "Pending", deadline: "Today, 2:00 PM" },
  { id: "T-02", title: "Audit Laptop Inventory", description: "Physically count Dell and HP stock to match system.", priority: "Medium", status: "In Progress", deadline: "Today, 5:00 PM" },
  { id: "T-03", title: "Setup Promo Display", description: "Assemble the new Diwali tech promo booth near entrance.", priority: "Low", status: "Pending", deadline: "Tomorrow, 10:00 AM" },
];

const TaskExecution: React.FC = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>("ss_exec_tasks", initialTasks);

  const cycleTaskStatus = (id: string) => {
    const statusOrder: Task["status"][] = ["Pending", "In Progress", "Completed"];
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const idx = statusOrder.indexOf(t.status);
        return { ...t, status: statusOrder[(idx + 1) % statusOrder.length] };
      }
      return t;
    }));
  };

  const getPriorityStyle = (priority: string) => {
    switch(priority) {
      case 'High': return 'text-accent border-accent/20 bg-accent/5 shadow-[0_0_15px_rgba(252,163,17,0.1)]';
      case 'Medium': return 'text-white border-white/10 bg-white/5';
      case 'Low': return 'text-muted/40 border-white/5 bg-transparent';
      default: return 'text-white/70 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">
            Task <span className="text-accent">Execution</span>
          </h1>
          <p className="text-muted/60 text-sm font-medium">Daily operational mission management and proof of completion registry.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 rounded-2xl bg-black/40 border border-white/8 flex items-center gap-4 shadow-xl">
            <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Active:</span>
            <span className="font-black text-white tabular-nums">{tasks.filter(t => t.status !== 'Completed').length} UNITS</span>
          </div>
          <div className="px-6 py-3 rounded-2xl bg-accent/10 border border-accent/20 flex items-center gap-4 text-accent shadow-xl shadow-accent/5">
            <CheckCircle2 size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">{tasks.filter(t => t.status === 'Completed').length} FINALIZED</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {tasks.map(task => {
          const isCompleted = task.status === "Completed";
          const isInProgress = task.status === "In Progress";
          
          return (
            <div 
              key={task.id} 
              className={`p-8 rounded-[32px] border transition-all duration-500 relative overflow-hidden group shadow-2xl flex flex-col ${
                isCompleted 
                ? 'bg-black/20 border-white/5 opacity-40' 
                : 'bg-surface border-white/5 hover:border-accent/40 hover:shadow-accent/5 hover:-translate-y-2'
              }`}
            >
               {!isCompleted && (
                 <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-500 ${isInProgress ? 'bg-accent shadow-[0_0_15px_rgba(252,163,17,0.5)]' : 'bg-white/10'}`} />
               )}
               
              <div className="flex justify-between items-start mb-8 relative z-10">
                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${getPriorityStyle(task.priority)}`}>
                  {task.priority} PROTOCOL
                </span>
                <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} className="text-accent/40" /> {task.deadline}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-4 relative z-10">
                 <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-muted/20 group-hover:text-accent transition-colors">
                    <Box size={18} />
                 </div>
                 <h3 className={`text-lg font-black tracking-tight uppercase ${isCompleted ? 'text-muted/40 line-through' : 'text-white'}`}>
                   {task.title}
                 </h3>
              </div>
              
              <p className={`text-xs leading-relaxed mb-10 font-medium h-12 line-clamp-2 relative z-10 ${isCompleted ? 'text-muted/30' : 'text-muted/60'}`}>
                {task.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto relative z-10 pt-6 border-t border-white/5">
                <button 
                  onClick={() => cycleTaskStatus(task.id)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isCompleted 
                    ? 'bg-accent/10 text-accent border border-accent/20' 
                    : isInProgress
                    ? 'bg-accent text-black shadow-lg shadow-accent/20 border-accent'
                    : 'bg-black/40 hover:bg-white/5 text-white/60 hover:text-white border border-white/5 hover:border-white/20'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : isInProgress ? <Play size={16} /> : <CheckCircle2 size={16} className="text-muted/40 group-hover:text-accent transition-colors" />}
                  {isCompleted ? 'Finalized' : isInProgress ? 'In Progress' : 'Initialize'}
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted/20 hover:text-white transition-all rounded-xl border border-transparent hover:bg-white/5 hover:border-white/10">
                  <UploadCloud size={14} />
                  Registry Proof
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-black/40 border border-white/5 rounded-[32px] p-8 flex items-center justify-between shadow-inner mt-10">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-center text-accent"><ShieldCheck size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Operational Protocol Verification: <span className="text-accent">ENFORCED</span></p>
              <p className="text-[9px] font-black text-muted/20 uppercase tracking-[0.2em] mt-1">Proof-of-work synchronization active</p>
            </div>
         </div>
         <div className="text-[9px] font-black text-muted/10 uppercase tracking-[0.5em]">Entity Task Terminal</div>
      </div>
    </div>
  );
};

export default TaskExecution;