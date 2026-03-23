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
  accent = "text-amber-400",
  delta 
}) => {
  const deltaIsPositive = typeof delta === "string" && delta.startsWith("+");

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#14213d] p-5 transition-all duration-500 hover:border-amber-400/20 hover:shadow-xl hover:shadow-amber-900/10">
      {/* Dynamic Background Glow */}
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-500 bg-amber-400" />
      
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 shadow-inner ${accent}`}>
            {icon ? React.cloneElement(icon as any, { size: 18 }) : null}
          </div>
          {delta && (
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider uppercase border ${
              deltaIsPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {delta}
            </div>
          )}
        </div>

        <div>
           <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#e5e5e5]/50 mb-0.5">
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
