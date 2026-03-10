import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface FloatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const FloatingModal: React.FC<FloatingModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);

  // focus the panel when opened for accessibility
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => panelRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            aria-hidden
          />

          {/* Modal Panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            aria-hidden={!isOpen}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "modal-title" : undefined}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
              className="pointer-events-auto w-full max-w-lg rounded-2xl p-6
                         bg-white/5 backdrop-blur-lg border border-white/8
                         shadow-[0_8px_30px_rgba(2,6,23,0.6)]"
              style={{
                boxShadow:
                  "0 10px 30px rgba(2,6,23,0.6), 0 2px 8px rgba(99,102,241,0.06)",
                outline: "none",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-center text-[16px] font-semibold text-white"
                    >
                      {title}
                    </h2>
                  )}
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="ml-4 p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/6 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4 text-sm text-gray-200">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FloatingModal;
