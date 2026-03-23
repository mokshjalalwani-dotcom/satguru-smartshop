import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IndianRupee, Package, CheckCircle, Shield, Zap } from "lucide-react";
import SaleForm from "../components/SaleForm";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import api from "../services/api";

interface Product {
  product_id: string;
  name: string;
  price: number;
}

const Sales: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/5 pb-8">
        <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase tracking-tight">
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-2xl text-accent"><IndianRupee size={24} /></div>
          Order <span className="text-accent">Initialization</span>
        </h2>
        <p className="text-muted/60 text-sm font-medium mt-2">Initialize new transaction flow and select asset for settlement.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Product Selector — Left Column (3/5) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-3">
               <Zap size={14} className="text-accent" /> Available Entities
            </h3>
            <span className="text-[9px] font-black text-muted/20 uppercase tracking-widest">{products.length} REGISTRY ENTRIES</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-24 rounded-[28px] bg-surface/50 shadow-inner" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 overflow-y-auto max-h-[calc(100vh-25rem)] pr-2 custom-scrollbar pb-6">
              {products.map((p, i) => {
                const isSelected = selectedProduct?.product_id === p.product_id;
                return (
                  <motion.button
                    key={p.product_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    onClick={() => setSelectedProduct(p)}
                    className={`group text-left p-6 rounded-[28px] border-2 transition-all duration-500 relative overflow-hidden shadow-xl ${isSelected
                      ? "bg-accent border-accent text-black scale-[1.02] shadow-accent/20"
                      : "bg-surface border-white/5 hover:border-white/20 text-white"
                      }`}
                  >
                    {!isSelected && (
                       <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-[32px] pointer-events-none group-hover:bg-accent/10 transition-all" />
                    )}
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all ${isSelected
                        ? "bg-black/20 text-black border border-black/10"
                        : "bg-black/40 text-muted/40 border border-white/5 group-hover:text-accent group-hover:border-accent/40"
                        }`}>
                        {isSelected ? <CheckCircle size={20} /> : <Package size={20} />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-black uppercase tracking-wide truncate ${isSelected ? "text-black" : "text-white"}`}>
                          {p.name}
                        </p>
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1.5 tabular-nums ${isSelected ? "text-black/60" : "text-muted/40"}`}>
                          ₹{p.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sale Form — Right Column (2/5) */}
        <div className="lg:col-span-2 bg-surface border-2 border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden h-fit">
           <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
           <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-accent"><Shield size={20} /></div>
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Flow Parameters</h3>
           </div>
           <div className="relative z-10">
             <SaleForm selectedProduct={selectedProduct} />
           </div>
        </div>
      </div>
      
      <div className="bg-black/40 border border-white/5 rounded-[32px] p-8 flex items-center justify-between shadow-inner mt-4">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-center text-accent"><Zap size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Transaction Engine Status: <span className="text-accent active">STANDBY</span></p>
              <p className="text-[9px] font-black text-muted/20 uppercase tracking-[0.2em] mt-1">Authorized terminal initialization ready</p>
            </div>
         </div>
         <div className="text-[9px] font-black text-muted/10 uppercase tracking-[0.5em]">Satguru Sale Console</div>
      </div>
    </div>
  );
};

export default Sales;
