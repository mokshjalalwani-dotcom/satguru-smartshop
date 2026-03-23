import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck } from "lucide-react";

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

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => panelRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

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
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
            aria-hidden
          />

          {/* Modal Panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 pointer-events-none"
            aria-hidden={!isOpen}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "modal-title" : undefined}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-lg rounded-[40px] p-10
                         bg-surface border border-white/10 shadow-2xl relative overflow-hidden"
              style={{ outline: "none" }}
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-accent shadow-[0_0_20px_rgba(252,163,17,0.3)]" />
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-center text-accent">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    {title && (
                      <h2
                        id="modal-title"
                        className="text-lg font-black text-white uppercase tracking-tight"
                      >
                        {title}
                      </h2>
                    )}
                    <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] mt-0.5">Secure Protocol Terminal</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="p-2 rounded-xl text-muted/30 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="relative z-10">{children}</div>
              
              <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/5 relative z-10">
                  <div className="text-[9px] font-black text-muted/10 uppercase tracking-[0.4em]">Satguru Master Logic</div>
                  <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-accent/20" />
                      <div className="w-1 h-1 rounded-full bg-accent/40" />
                      <div className="w-1 h-1 rounded-full bg-accent/60" />
                  </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FloatingModal;
