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
    "inline-flex items-center justify-center px-8 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-[0.25em] transition-all focus:outline-none disabled:opacity-20 disabled:cursor-not-allowed active:scale-95";

  const styles: Record<string, string> = {
    primary:
      "bg-accent text-black shadow-2xl shadow-accent/20 hover:shadow-accent/40 hover:brightness-110 border border-accent",
    secondary:
      "bg-black/40 border-2 border-white/5 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5",
  };

  const variantClass = styles[variant] ?? styles.primary;

  return (
    <motion.button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className={`${base} ${variantClass} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default Button;
