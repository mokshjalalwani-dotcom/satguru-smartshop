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
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface p-5 transition-all duration-500 hover:border-accent/20 hover:shadow-xl hover:shadow-accent/5">
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-accent" />
      
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-black/30 text-accent">
            {icon ? React.cloneElement(icon as any, { size: 18 }) : null}
          </div>
          {delta && (
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider uppercase border ${
              deltaIsPositive 
                ? 'bg-accent/10 text-accent border-accent/20' 
                : 'bg-white/5 text-muted/50 border-white/10'
            }`}>
              {delta}
            </div>
          )}
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted/40 mb-0.5">
            {title}
          </p>
          <p className="text-xl font-bold tracking-tight text-white tabular-nums">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KPICard;
