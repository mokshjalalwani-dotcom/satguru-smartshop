import React from "react";

interface InputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  multiline = false,
  error,
}) => {
  const baseClass = `
    w-full bg-xblack border rounded-lg px-4 py-2.5 text-[14px] text-xtext
    placeholder-xtext-tertiary outline-none transition-colors duration-200
    input-neon-focus
    ${error ? "border-xred" : "border-xdark-border hover:border-xtext-secondary"}
  `;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-xtext-secondary">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className={`${baseClass} resize-none`}
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
      {error && <p className="text-[13px] text-xred">{error}</p>}
    </div>
  );
};

export default Input;