import React from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

const FloatingButton: React.FC = () => {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 260, damping: 15 }}
      className="fixed bottom-8 right-8 z-50 
                 w-14 h-14 rounded-full 
                 bg-xblue hover:bg-xblue-hover
                 neon-glow hover-neon-indigo hover:scale-105 active:scale-95
                 flex items-center justify-center
                 text-white transition-all duration-300 ease-out"
    >
      <Plus size={22} strokeWidth={2.5} />
    </motion.button>
  );
};

export default FloatingButton;
