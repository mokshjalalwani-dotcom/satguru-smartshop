import React from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: React.ReactElement;
  accent?: string;
  delta?: string;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  icon, 
  delta 
}) => {
  const deltaIsPositive = typeof delta === "string" && delta.startsWith("+");

  return (
    <div className="group relative overflow-hidden rounded-[20px] glass-card p-4 transition-all duration-500 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/5">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-accent" />
      
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-black/20 text-accent shadow-inner backdrop-blur-md">
            {icon ? React.cloneElement(icon as any, { size: 20, strokeWidth: 2.5 }) : null}
          </div>
          {delta && (
            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black tracking-widest uppercase border ${
              deltaIsPositive 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {delta}
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/30 mb-1 leading-none">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-xl font-black tracking-tighter text-white tabular-nums">
              {value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPICard;
