import React, { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import FloatingModal from "./FloatingModal";
import AddProductForm from "./AddProductForm";
import { useLocation } from "react-router-dom";

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Only show the Add Product FAB on inventory-related pages
  const isInventoryPage = location.pathname.includes('/inventory') || location.pathname === '/products';
  if (!isInventoryPage) return null;

  const handleSubmit = (data: {
    name: string;
    price: string;
    category: string;
    description: string;
  }) => {
    console.log("New product submitted:", data);
    setIsOpen(false);
  };

  return (
    <>
      {/* FAB Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* decorative soft pulse */}
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 opacity-20 blur-xl animate-pulse"
          style={{ transform: "translate(6px, 6px)" }}
        />

        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-[0_10px_30px_rgba(56,189,248,0.18)] flex items-center justify-center text-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
          aria-label="Add product"
          aria-pressed={isOpen}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <Plus size={20} strokeWidth={2.2} />
          </motion.div>
        </motion.button>
      </div>

      {/* Modal */}
      <FloatingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add New Product"
      >
        <AddProductForm onSubmit={handleSubmit} onCancel={() => setIsOpen(false)} />
      </FloatingModal>
    </>
  );
};

export default FloatingActionButton;
