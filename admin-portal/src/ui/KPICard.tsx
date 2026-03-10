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
    <div className="bg-xcard border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all hover:-translate-y-0.5 relative overflow-hidden group">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/3 rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={`p-2.5 rounded-xl border border-white/10 bg-background ${accent}`}>
          {icon}
        </div>
        {delta && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
            deltaIsPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {delta}
          </span>
        )}
      </div>
      
      <p className="text-[10px] text-xtext-secondary font-bold uppercase tracking-wider mb-1 relative z-10">
        {title}
      </p>
      <p className={`text-2xl font-black relative z-10 ${accent}`}>
        {value}
      </p>
    </div>
  );
};

export default KPICard;
