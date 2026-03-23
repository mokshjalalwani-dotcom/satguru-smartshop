// KPICard.tsx — Premium metric card with icon, accent colors, and ₹ formatting
import React from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  accent?: string;
  delta?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  accent = "text-white",
  delta,
}) => {
  const deltaIsPositive = typeof delta === "string" && delta.startsWith("+");

  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-white/5 bg-white/5 p-6 transition-all duration-500 hover:border-white/10 hover:shadow-2xl hover:shadow-black/50">
      {/* Dynamic Background Glow */}
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${accent.replace('text-', 'bg-')}`} />
      
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner ${accent}`}>
            {icon ? React.cloneElement(icon as any, { size: 22 }) : null}
          </div>
          {delta && (
            <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black tracking-wider uppercase border ${
              deltaIsPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {delta}
            </div>
          )}
        </div>

        <div>
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
            {title}
          </p>
          <p className="text-3xl font-black tracking-tighter text-white tabular-nums">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KPICard;
