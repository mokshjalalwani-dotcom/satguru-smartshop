import React from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
}

const formatValue = (title: string, value: number): string => {
  if (title.toLowerCase() === "revenue") {
    return `₹${value.toLocaleString("en-IN")}`;
  }
  return value.toLocaleString("en-IN");
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="relative flex items-center gap-4 p-4 rounded-2xl
                 glass-card hover-neon-cyan
                 hover:-translate-y-1 hover:scale-[1.02]
                 active:scale-[0.98] transition w-full"
    >
      {/* decorative left stripe */}
      <div
        aria-hidden
        className="absolute left-4 top-4 bottom-4 w-1 rounded-r-full"
        style={{
          background: "linear-gradient(180deg, rgba(99,102,241,1) 0%, rgba(56,189,248,1) 100%)",
          boxShadow: "0 6px 20px rgba(99,102,241,0.06)",
        }}
      />

      {/* Icon */}
      <div
        className="relative z-10 flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
          boxShadow: "0 8px 26px rgba(56,189,248,0.08)",
        }}
        aria-hidden
      >
        <div className="text-white">{icon}</div>
      </div>

      <div className="z-10">
        <p className="text-sm text-gray-300">{title}</p>
        <p className="mt-1 text-xl font-extrabold text-white">
          {formatValue(title, value)}
        </p>
      </div>
    </motion.div>
  );
};

export default StatCard;
