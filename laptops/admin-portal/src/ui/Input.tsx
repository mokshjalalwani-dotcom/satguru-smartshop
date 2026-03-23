import React from "react";

interface InputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
  error?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  multiline = false,
  error,
  className = "",
}) => {
  const baseClass = `
    w-full bg-black/40 border-2 rounded-2xl px-6 py-4 text-[11px] font-black text-white uppercase tracking-widest
    placeholder-muted/10 outline-none transition-all duration-500
    ${error ? "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]" : "border-white/5 hover:border-white/10 focus:border-accent/40 focus:bg-accent/5 focus:shadow-[0_0_20_rgba(252,163,17,0.05)]"}
  `;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <label className="text-[9px] font-black text-muted/30 uppercase tracking-[0.3em] flex items-center gap-2">
        <div className="w-1 h-1 rounded-full bg-accent/40" />
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className={`${baseClass} resize-none custom-scrollbar`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
      {error && (
        <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 animate-in slide-in-from-top-1">
          <div className="w-1 h-1 rounded-full bg-rose-500" />
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;