import React from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
  className = "",
  ariaLabel,
}) => {
  const base =
    "inline-flex items-center justify-center px-5 py-2 rounded-full text-[14px] font-semibold transition-all focus:outline-none focus-visible:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";

  const styles: Record<string, string> = {
    primary:
      "bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-[0_10px_30px_rgba(56,189,248,0.12)] hover:shadow-[0_12px_35px_rgba(56,189,248,0.25)] hover:brightness-110 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-xblack",
    secondary:
      "bg-transparent border border-white/10 text-gray-100 hover:bg-white/5 focus-visible:ring-white/10",
  };

  const variantClass = styles[variant] ?? styles.primary;

  return (
    <motion.button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`${base} ${variantClass} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default Button;
